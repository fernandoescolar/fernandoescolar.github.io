---
published: true
ID: 202602111
title: 'Autentication y Authorization en .NET'
author: fernandoescolar
post_date: 2026-02-11 01:04:36
layout: post
tags: oauth csharp jwt
background: '/assets/uploads/bg/security1.webp'
---

Imagina que estás en un aeropuerto internacional a punto de viajar al extranjero. Si has viajado antes, sabrás que hay varias cosas que debes hacer antes de que puedas partir a tu destino en el avión. Lo primero que encontrarás será el control de pasaportes. Aquí, el objetivo es verificar que eres la persona que dices ser<!--break-->. Para lograrlo, muestras tu pasaporte y quizás tu visa, respondes a algunas preguntas de seguridad y te toman una fotografía. Una vez que has pasado este proceso, te permiten ingresar a la zona de embarque.

Luego querrás acceder al avión. Así que, el personal de la aerolínea verificará tu tarjeta de embarque. Tienen una lista de pasajeros con diferentes niveles de acceso. Si tu tarjeta de embarque tiene el asiento 5B, solo puedes acceder a ese asiento. No puedes entrar a la cabina de los pilotos o al almacén de suministros. Es decir, en dependencia de la clase de tu asiento, podrás acceder a diferentes áreas del avión. Y esta es la forma que tienen de asegurarse de que cada pasajero tenga permiso para ocupar un lugar específico en el avión.

Finalmente, cuando llegas a tu asiento, te pones el cinturón de seguridad y esperas a que el avión despegue, intentas dormirte con el objetivo de despertar en tu destino.

Quizá no te has dado cuenta, pero acabas de pasar por un proceso de **autenticación** y **autorización**.

- [Autentication](#autentication)
- [Authorization](#authorization)
- [Autenticación y autorización en ASP.NET Core](#autenticación-y-autorización-en-aspnet-core)
- [Authentication en .NET](#authentication-en-net)
- [Authorization en .NET](#authorization-en-net)
  - [Roles: el primer filtro](#roles-el-primer-filtro)
  - [Policies: permisos con nombre propio](#policies-permisos-con-nombre-propio)
  - [Policies compuestas y reglas más expresivas](#policies-compuestas-y-reglas-más-expresivas)
  - [Cuando el endpoint no es suficiente](#cuando-el-endpoint-no-es-suficiente)
  - [Lo importante de todo esto](#lo-importante-de-todo-esto)
- [Autorización basada en recursos](#autorización-basada-en-recursos)
- [Conclusión](#conclusión)
  - [Gotchas que me he encontrado en producción](#gotchas-que-me-he-encontrado-en-producción)


## Autentication

La autenticación es el proceso de verificar que eres quien dices ser. En el ejemplo anterior, el control de pasaportes es el proceso de autenticación. El personal del aeropuerto realizará todas las acciones que estén en su mano para identificarte de forma unívoca. Y una vez que estén seguros de que eres quien dices ser, te permitirán ingresar a la zona de embarque.

En el mundo del desarrollo web y de aplicaciones, la autenticación es lo mismo, el proceso de verificar que un usuario es quien dice ser. Pero como no podemos permitirnos una persona que verifique manualmente cada usuario, hemos buscado una forma de automatizar este proceso.

Añadimos formularios de *login* a nuestras aplicaciones, en los que los usuarios introducen sus credenciales. Igual tenemos un doble factor de autenticación, en el que el usuario recibe un código de verificación en su teléfono móvil. También podríamos usar métodos como WebAuthn, que permite a los usuarios autenticarse con una llave de seguridad física. O quizás usamos un proveedor de identidad de terceros, como Google o Facebook, para que los usuarios puedan autenticarse con sus credenciales de esas plataformas.

El objetivo es identificar al usuario y verificar que es quien dice ser.

## Authorization

La autorización es el proceso de verificar que un usuario tiene permiso para acceder a un recurso específico. Volviendo al ejemplo anterior, para acceder al avión, el personal de la aerolínea verifica que tu tarjeta de embarque y comprobará a qué espacios del avión tienes acceso.

Si extrapolamos el billete del avión a una aplicación web, podríamos decir que el billete es un *token* de acceso. También podría ser una *cookie* de sesión, una *API key* o algún otro tipo de artefacto que nos permita verificar que el usuario tiene permiso para acceder a un recurso específico.

## Autenticación y autorización en ASP.NET Core

Cuando llevamos esta conversación al terreno de **ASP.NET Core**, lo primero que conviene interiorizar es que el framework se toma muy en serio la separación entre autenticación y autorización. No es solo una distinción teórica; está literalmente incrustada en el pipeline de ejecución de cada request.

Cada vez que una petición entra en la aplicación, ASP.NET Core sigue una secuencia bastante clara. Primero intenta averiguar si puede confiar en la identidad que llega con la request. Si lo consigue, construye un usuario. Y solo entonces se plantea si ese usuario puede o no acceder a lo que está pidiendo.

Esto tiene una consecuencia importante: **la autorización nunca “crea” usuarios**. Trabaja exclusivamente con lo que la autenticación haya dejado preparado antes.

## Authentication en .NET

En .NET, autenticar no significa mostrar una pantalla de login ni validar una contraseña. Eso es solo una de las posibles formas de llegar al objetivo final, que es mucho más simple: **llenar `HttpContext.User` con una identidad válida**.

Para eso existen los *authentication schemes*. Cada esquema sabe leer un tipo concreto de credencial y transformarla en un conjunto de claims. A partir de ahí, el framework ya no distingue si el usuario se autenticó con una cookie, un token JWT o un proveedor externo. Para el resto de la aplicación, todos son simplemente usuarios.

En APIs, el caso más habitual es el del token JWT. El cliente envía el token, la aplicación valida que no esté manipulado, que no haya caducado y que provenga de quien dice provenir. Si todo encaja, se acepta la identidad y se sigue adelante.

```csharp
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://tu-idp.com";
        options.Audience = "api://developerro";
    });
```

A partir de ese punto, el framework deja de preguntarse quién eres. La autenticación ya ha hecho su trabajo y ha dejado el resultado preparado para el resto del pipeline.

Si tienes varios esquemas (por ejemplo, cookie para el sitio y JWT para la API en el mismo host), define un esquema por defecto para evitar sustos de 401/302 inesperados y recuerda colocar autenticación y autorización en el pipeline, en ese orden:

```csharp
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
```

En aplicaciones web tradicionales ocurre lo mismo, solo que el “billete” suele ser una cookie. Tras el login inicial, la cookie viaja en cada request y ASP.NET Core reconstruye la identidad sin que tú tengas que intervenir. El mecanismo cambia, pero el concepto es idéntico.

Un ejemplo rápido de autenticación web “clásica”: cookie para mantener la sesión y OpenID Connect para firmar. Es el patrón típico en apps MVC o Razor Pages:

```csharp
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddOpenIdConnect(options =>
    {
        options.Authority = "https://tu-idp.com";
        options.ClientId = "webapp";
        options.ClientSecret = "super-secreto";
        options.ResponseType = "code";
        options.SaveTokens = true;
    });

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/login", async context =>
{
    await context.ChallengeAsync();
});

app.MapGet("/", () => "Hola usuario autenticado")
   .RequireAuthorization();
```

## Authorization en .NET

Una vez que la autenticación ha hecho su trabajo y ASP.NET Core ya ha decidido quién es el usuario, entra en juego la autorización. Y aquí conviene cambiar el chip: **la autorización no va de usuarios, va de reglas**.

El framework ya no se pregunta quién eres, sino si, con la información que trae tu identidad, puedes acceder a lo que estás pidiendo. Toda la decisión se basa en los *claims* que llegaron con el usuario y en las reglas que nosotros hayamos definido.

El caso más básico es exigir que exista un usuario autenticado. No importa quién sea ni qué permisos tenga: simplemente tiene que haber pasado la autenticación.

```csharp
app.MapGet("/private", () => "Solo usuarios autenticados")
   .RequireAuthorization();
```

Este es el equivalente al “si no has pasado el control de pasaportes, no entras”. No hay más matices.

A partir de aquí, empiezan las decisiones interesantes.

### Roles: el primer filtro

Una forma muy común de autorizar es mediante roles. Es sencilla de entender y funciona bien cuando el sistema es pequeño o los perfiles están muy claros.

```csharp
[Authorize(Roles = "Admin")]
public IActionResult AdminPanel() => View();
```

Aquí no estamos diciendo qué puede hacer el usuario, sino **qué es**. Y eso tiene implicaciones. Los roles suelen funcionar bien para separar grandes áreas de la aplicación, pero empiezan a chirriar cuando los permisos crecen o se combinan.

El problema típico aparece cuando un rol empieza a significar demasiadas cosas. En ese punto, la autorización deja de reflejar el dominio y se convierte en un parche.

### Policies: permisos con nombre propio

Las políticas de autorización son el siguiente paso lógico. En lugar de basarte en etiquetas genéricas como “Admin” o “User”, empiezas a expresar permisos concretos.

Una policy no es más que una regla con nombre. Y ese detalle, ponerle nombre, cambia bastante la forma de pensar el sistema.

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanReadReports", policy =>
        policy.RequireClaim("scope", "reports.read"));
});
```

Aquí ya no hablamos de roles, sino de capacidades. El usuario puede leer informes si declara tener ese permiso, independientemente de cómo se haya autenticado o de qué rol tenga.

Después, el endpoint queda limpio y fácil de leer:

```csharp
app.MapGet("/reports", () => "Listado de informes")
   .RequireAuthorization("CanReadReports");
```

Este enfoque escala mucho mejor, sobre todo en APIs o sistemas donde los permisos vienen definidos por un proveedor externo de identidad.

En la práctica, las policies suelen agruparse en unos pocos patrones muy comunes. Algunas describen **acciones** (“puede leer”, “puede escribir”), otras describen **condiciones** (“tiene suscripción activa”, “pertenece a un país”), y otras combinan varias reglas a la vez. Todas se expresan igual, y todas se evalúan del mismo modo.

### Policies compuestas y reglas más expresivas

Una policy no tiene por qué ser simple. Puedes combinar condiciones y exigir varias cosas a la vez.

```csharp
options.AddPolicy("PaidUser", policy =>
    policy.RequireAuthenticatedUser()
          .RequireClaim("subscription", "active"));
```

Aquí no basta con estar autenticado. Además, el usuario debe tener una suscripción activa. El endpoint no necesita saber nada de esto; solo declara que requiere esa policy.

Este punto es importante: **la complejidad vive en la policy, no en el controlador**. Eso mantiene el código de la aplicación limpio y predecible.

### Cuando el endpoint no es suficiente

Hasta ahora, todas las decisiones se toman sin tener en cuenta *qué* se está accediendo exactamente. Pero muchas aplicaciones reales necesitan ir más allá.

No es lo mismo acceder a “un pedido” que acceder a **este pedido concreto**.

Aquí entra en juego la autorización basada en recursos. En lugar de decidir solo con los claims del usuario, la decisión tiene en cuenta también el estado o la propiedad del objeto que se quiere acceder.

ASP.NET Core permite expresar esto mediante *requirements* y *handlers*. El handler encapsula la lógica y decide si el usuario cumple la regla para ese recurso específico.

El resultado es un modelo muy potente, donde las reglas de acceso se parecen mucho más a las reglas del negocio que a comprobaciones técnicas.

### Lo importante de todo esto

La autorización en .NET no está pensada para ser un obstáculo, sino una herramienta de modelado. No se trata de proteger rutas “por si acaso”, sino de expresar claramente qué se puede hacer y en qué condiciones.

Roles, policies y autorización basada en recursos no son niveles de complejidad crecientes, sino **opciones distintas para problemas distintos**. Elegir bien desde el principio evita que la lógica de permisos acabe dispersa, duplicada o escondida en lugares donde nadie espera encontrarla.

## Autorización basada en recursos

Hay un punto en el que proteger endpoints deja de ser suficiente. Normalmente ocurre el día que alguien se da cuenta de que **no todos los usuarios deberían poder acceder a todos los datos**, aunque compartan permisos generales.

Es el clásico caso de “puedes ver pedidos, pero solo los tuyos”.

Aquí es donde la autorización basada en recursos marca la diferencia. En lugar de preguntarte si el usuario puede entrar en una ruta, te preguntas si puede acceder a **este objeto concreto**. El permiso ya no depende solo de los claims, sino también del estado o la propiedad del recurso.

ASP.NET Core te permite expresar esta lógica de forma explícita, aislándola en handlers y requirements. El endpoint se limita a pedir una decisión; la regla vive en un sitio donde puede evolucionar sin contaminar el resto del código.

Ejemplo mínimo de handler basado en recurso (solo deja leer pedidos del dueño):

```csharp
public class Order
{
    public string Id { get; init; } = default!;
    public string OwnerId { get; init; } = default!;
}

public class OrderOwnerHandler
    : AuthorizationHandler<OperationAuthorizationRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OperationAuthorizationRequirement requirement,
        Order resource)
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is not null &&
            requirement.Name == "Read" &&
            resource.OwnerId == userId)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OrderRead", policy =>
        policy.Requirements.Add(new OperationAuthorizationRequirement { Name = "Read" }));
});

builder.Services.AddSingleton<IAuthorizationHandler, OrderOwnerHandler>();

app.MapGet("/orders/{id}", async (string id, IAuthorizationService auth, ClaimsPrincipal user) =>
{
    var order = await repo.Get(id);
    var authResult = await auth.AuthorizeAsync(user, order, "OrderRead");
    return authResult.Succeeded ? Results.Ok(order) : Results.Forbid();
});
```

Es una de esas características que parecen complejas al principio, pero que se vuelven imprescindibles en cuanto la aplicación deja de ser trivial.

## Conclusión

ASP.NET Core no improvisa en este terreno. Autenticación y autorización están bien pensadas, bien separadas y bien integradas en el pipeline desde el primer día. No es un añadido posterior ni un conjunto de parches: es una parte central del diseño del framework.

El problema casi nunca es .NET. El problema suele ser que intentamos atajar. Mezclamos responsabilidades, usamos roles para todo, copiamos y pegamos `[Authorize]` sin pararnos a modelar qué significa realmente “tener permiso” en nuestro dominio. Y eso, tarde o temprano, pasa factura.

.NET ya hace lo difícil: te da esquemas claros para autenticar, un modelo potente de claims y un sistema de autorización que escala desde lo trivial hasta escenarios complejos basados en recursos. No necesitas inventarte nada raro ni montar soluciones paralelas. **Solo necesitas usar lo que ya está ahí, y usarlo bien**.

Si entiendes dónde acaba la autenticación y dónde empieza la autorización, y si aceptas modelar los permisos como parte del diseño y no como un detalle final, el framework juega a tu favor. Si no, da igual el lenguaje o la plataforma: acabarás peleándote con tu propio código.

En este caso, la recomendación es simple y bastante directa: **ASP.NET Core lo tiene bien resuelto; aprovéchalo**.

### Gotchas que me he encontrado en producción

- 401 vs 403: 401 es “no sé quién eres” (falta identidad); 403 es “sé quién eres, pero no puedes”. No los mezcles o romperás UX y métricas.
- Múltiples esquemas: define `DefaultAuthenticateScheme`/`DefaultChallengeScheme` cuando mezclas cookies y JWT; si no, verás 302 a login donde esperabas 401.
- Roles sobrecargados: cuando un rol significa demasiadas cosas, las policies con permisos con nombre suelen ser la salida limpia para no romper dominios.
- Clock skew en JWT: ajusta `ClockSkew` si tus relojes bailan; expiraciones desalineadas producen 401 fantasma en entornos distribuidos.
