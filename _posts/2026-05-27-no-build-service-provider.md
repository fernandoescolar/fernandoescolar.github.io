---
published: true
ID: 2026052701
title: 'No llames a BuildServiceProvider()'
author: fernandoescolar
post_date: 2026-05-27 02:15:54
layout: post
tags: di dotnet csharp best-practices
background: '/assets/uploads/bg/stop.webp'
---

Hay una llamada en .NET que parece inocente, que puede pasar inadvertida. No dará error, compilará sin problemas y, si buscas en internet, seguro que encuestras más de un ejemplo o solución a un problema que la usa. Es inocente, simple y los asistentes de código la sugieren como si fuera una función más del contenedor de dependencias.<!--break-->

La llamada es:

```csharp
services.BuildServiceProvider()
```

Y normalmente aparece en ese momento tan humano en el que estás registrando servicios en `Program.cs`, en `Startup.ConfigureServices`, o en alguna extensión de `IServiceCollection`, y de pronto piensas:

> Necesito resolver un servicio aquí

Entonces haces esto:

```csharp
var provider = services.BuildServiceProvider();
var service = provider.GetRequiredService<MyService>();
```

Y funciona.

Ese es el problema.

Porque hay errores que fallan rápido, con dignidad. El IDE los pinta en rojo o al ejecutar te lanza una excepción clara. Pero hay otros errores que se esconden, que no se manifiestan hasta que la aplicación lleva un rato funcionando, o hasta que el tráfico empieza a llegar, o hasta que alguien hace algo específico.

## El contenedor de dependencias

En ASP.NET Core y realmente, en el mundo de .NET, usamos de serie una colección de servicios para registrar todos los artefactos que necesitamos. A partir de ahí se crea un contenedor de dependencias que se encarga de resolver esos servicios, gestionar sus ciclos de vida, aplicar validaciones y ofrecer un mecanismo de composición para construir la aplicación. Una implementación de inversión de control en forma de contenedor de dependencias que es parte integral del framework.

No será extraño encontrar código que registre servicios así:

```csharp
services.AddSingleton<MyService>();
services.AddScoped<MyDbContext>();
services.AddTransient<MyProcessor>();
```

Este código configura el contenedor de dependencias, pero no lo construye. Solo le dice cómo construir las cosas cuando llegue el momento.

El contenedor real lo construye el host cuando arranca la aplicación. Y lo construye con sus opciones, sus validaciones, sus servicios internos, sus comportamientos y todo ese aparato que hace que la aplicación funcione de forma razonablemente civilizada.

Cuando llamas manualmente a `BuildServiceProvider()`, lo que estás haciendo no es *pedirle algo al contenedor*. Estás creando otro contenedor.

Uno tuyo.

Uno paralelo.

Un contenedor de dependencias de garrafón.

Y como suele pasar con el garrafón, al principio puede parecer todo igual, pero a la mañana siguiente te das cuenta de que no era exactamente lo mismo...

## Singletons: todos somos únicos

El primer problema es bastante directo: puedes duplicar singletons.

Supongamos esto:

```csharp
services.AddSingleton<MyService>();

var provider = services.BuildServiceProvider();
var service = provider.GetRequiredService<MyService>();
```

Ahí has creado una instancia de `ServiceProvider`. Ese provider puede construir su propia instancia de `MyService`.

Luego ASP.NET Core arranca de verdad y construye el provider final de la aplicación. Que no lo veas no significa que no esté ahí. Y ese provider también puede construir su propia instancia de `MyService`.

Resultado: tienes dos `MyService`.

Y sí, ya sé que pone `AddSingleton`.

Pero `Singleton` significa **uno por contenedor**, no *uno para gobernarlos a todos, para encontrarlos, para atraerlos a todos*. Si fabricas dos contenedores, has fabricado también dos oportunidades estupendas de romper esa promesa. Si fabricas 3 contenedores, tienes 3 `MyService`. Y así sucesivamente...

Esto es especialmente divertido cuando el singleton tiene estado interno, cachés, conexiones, clientes, contadores, inicialización pesada o cualquier cosa que alguien asumió que sería única. Aquí crearías *pools* de conexiones que consumen TCP que no sabes de donde vienen. O cachés que no hacen más que duplicar memoria.

Y esto nos llevaría a consumos de recursos ocultos que no son para nada sencillos de encontrar.

Porque claro, *singleton* suena a garantía arquitectónica. Pero si construyes dos casas, no te sorprendas de tener dos salones.

## Los ciclos de vida empiezan a hacer cosas raras

El contenedor de dependencias de .NET trabaja con ciclos de vida:

```csharp
AddSingleton<T>()
AddScoped<T>()
AddTransient<T>()
```

Hasta aquí todo parece razonable.

Un `Singleton` vive durante toda la aplicación.
Un `Scoped` vive durante un scope, normalmente una request HTTP.
Un `Transient` se crea cada vez que se pide.

El problema empieza cuando resuelves servicios desde un provider que has construido manualmente durante la fase de configuración.

Por ejemplo:

```csharp
var provider = services.BuildServiceProvider();
var db = provider.GetRequiredService<MyDbContext>();
```

Y aquí es donde alguien debería apagar las luces y poner música de tensión.

`DbContext` normalmente es `Scoped`. Eso significa que debería vivir dentro de un scope concreto. Por ejemplo, una petición HTTP. Resolverlo desde el provider raíz, fuera de un scope real, puede provocar problemas de ciclo de vida, concurrencia, liberación de recursos o comportamientos bastante difíciles de explicar en una daily sin mirar al suelo.

Porque el `DbContext` no está pensado para ir por ahí suelto, como si fuera un objeto cualquiera. Tiene contexto, seguimiento de entidades, conexión, estado interno. No es un bolígrafo. Es más bien una motosierra con memoria.

Y si lo resuelves en el momento equivocado, desde el sitio equivocado, usando un contenedor que ni siquiera será el definitivo, lo raro no es que falle.

Lo raro es que tarde tanto.

## El provider que has creado no sabe lo que pasará después

Otro detalle maravilloso es que el provider manual solo conoce los servicios registrados hasta ese momento.

Es decir:

```csharp
services.AddSingleton<A>();

var provider = services.BuildServiceProvider();

services.AddSingleton<B>();

provider.GetRequiredService<B>(); // falla
```

El provider que has construido no conoce `B`.

Y tiene sentido. Lo construiste antes. No es vidente. No tiene acceso al futuro. Bastante hace con existir.

Pero esto puede generar bugs muy sutiles en configuraciones complejas, sobre todo cuando tienes métodos de extensión, registros condicionales, librerías que añaden servicios internamente o configuraciones que dependen del orden.

El host, cuando construye el provider final, lo hace con la colección completa. Tu provider manual, no. Tu provider manual vive en el pasado.

Y el software ya es suficientemente complicado como para empezar a tener contenedores nostálgicos.

## También puedes perder validaciones y comportamiento del host

ASP.NET Core no se limita a decir *venga, construyo un `ServiceProvider` y ya*.

El host puede aplicar opciones de validación, integrar servicios internos, configurar comportamientos específicos y gestionar la vida del contenedor final. Cuando construyes uno manualmente, te sales parcialmente de ese flujo.

Puede que no tenga exactamente las mismas opciones.
Puede que no tenga los mismos servicios.
Puede que no se valide igual.
Puede que algo que en el provider final funcionaría, en el provider manual no.
O peor: puede que en el provider manual funcione y en el final no.

Y ese es el tipo de diferencia que te hace perder una tarde entera mirando código correcto desde el punto de vista sintáctico, pero moralmente cuestionable.

## Si lo creas, también deberías destruirlo

El `ServiceProvider` implementa `IDisposable`.

Esto es importante porque algunos servicios que resuelve también pueden implementar `IDisposable` o `IAsyncDisposable`. Si creas manualmente un provider y no lo liberas, puedes dejar recursos vivos más tiempo del necesario.

Conexiones. Handles. Clientes. Timers. Objetos que alguien esperaba que se limpiasen.

Y entonces puedes pensar:

*Bueno, pues lo meto en un `using`*.

```csharp
using var provider = services.BuildServiceProvider();
var service = provider.GetRequiredService<MyService>();
```

Mejor, pero no necesariamente bien.

Porque ahora puedes estar destruyendo servicios resueltos desde ese provider mientras otros objetos todavía mantienen referencias a ellos. O puedes haber creado instancias que no tienen nada que ver con las que usará la aplicación real.

Has pasado de *no limpio recursos* a *limpio recursos de una realidad paralela*. No es exactamente una victoria.

Es como ordenar el trastero de una casa en la que no vive nadie.

## Normalmente es un síntoma de que algo está mal diseñado

La mayoría de llamadas a `BuildServiceProvider()` aparecen porque alguien necesita un servicio demasiado pronto.

Por ejemplo:

```csharp
services.AddSomething(options =>
{
    var provider = services.BuildServiceProvider();
    var config = provider.GetRequiredService<MyConfigService>();
});
```

Esto suele ser una señal de que estamos mezclando dos fases distintas: registrar servicios y resolver servicios.

Durante el registro deberíamos describir cómo se construyen las cosas, no construirlas antes de tiempo porque nos ha entrado prisa.

Si necesitas configurar opciones usando configuración, lo normal es usar el sistema de opciones:

```csharp
services.AddOptions<MyOptions>()
    .Configure<IConfiguration>((options, configuration) =>
    {
        configuration.GetSection("MyOptions").Bind(options);
    });
```

Y si necesitas construir un servicio usando dependencias, usa una factory:

```csharp
services.AddSingleton<MyService>(sp =>
{
    var dependency = sp.GetRequiredService<MyDependency>();
    return new MyService(dependency);
});
```

La diferencia es fundamental.

Ese `sp` no lo has creado prematuramente. Te lo da .NET cuando toca construir el servicio, usando el contenedor real, en el momento correcto y con las dependencias correctas.

No estás abriendo una puerta lateral. Estás usando la entrada principal, que para algo está.

## Es solo para la configuración

Uno de los escenarios más habituales es querer leer configuración o algún servicio auxiliar dentro del registro.

Y claro, alguien hace esto:

```csharp
var provider = services.BuildServiceProvider();
var myConfig = provider.GetRequiredService<MyConfigService>();
```

Parece práctico.
Parece directo.
Parece de persona resolutiva.

Pero normalmente hay alternativas mejores.

Si lo que necesitas está en `IConfiguration`, úsalo directamente. Si estás en `Program.cs`, probablemente ya lo tienes disponible:

```csharp
var section = builder.Configuration.GetSection("MyOptions");
services.Configure<MyOptions>(section);
```

O con `AddOptions`:

```csharp
services.AddOptions<MyOptions>()
    .Bind(builder.Configuration.GetSection("MyOptions"))
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

Si necesitas una dependencia para configurar opciones, usa `Configure<TDependency>`:

```csharp
services.AddOptions<MyOptions>()
    .Configure<IConfiguration>((options, configuration) =>
    {
        configuration.GetSection("MyOptions").Bind(options);
    });
```

Y si necesitas construir un servicio con otra dependencia, usa una factory:

```csharp
services.AddSingleton<MyService>(sp =>
{
    var options = sp.GetRequiredService<IOptions<MyOptions>>();
    var dependency = sp.GetRequiredService<MyDependency>();

    return new MyService(options.Value, dependency);
});
```

Esto mantiene la resolución dentro del ciclo de vida normal del contenedor.

Que es una forma elegante de decir: no montes un mercadillo al lado del supermercado.

## ¿Hay casos donde sí tenga sentido?

Sí.

El único lugar donde he encontrado un caso razonable para llamar a `BuildServiceProvider()` es en pruebas unitarias o de integración, donde quieres construir un contenedor de dependencias específico para el test, con servicios de prueba, mocks o stubs. En ese contexto, estás creando un entorno controlado para el test, y construir un provider específico puede ayudarte a aislar el comportamiento que quieres probar.

Alguno pensará que cuando hago una aplicación de consola o un worker, no tengo el host de asp.net core, así que no tengo un contenedor de dependencias. Pero .NET ya nos provee de un host genérico para aplicaciones de consola y workers, con su contenedor de dependencias integrado. No es necesario construir uno manualmente.

```csharp
var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.AddHostedService<MyWorker>();
    })
    .Build();

host.Run();
```

O para consola:

```csharp
var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.AddSingleton<MyService>();
    })
    .Build();

var service = host.Services.GetRequiredService<MyService>();
service.DoSomething();
```

## La regla práctica

Evita esto:

```csharp
var provider = services.BuildServiceProvider();
var service = provider.GetRequiredService<MyService>();
```

Especialmente dentro de `Program.cs`, `Startup.ConfigureServices` o métodos de extensión sobre `IServiceCollection`.

Prefiere esto:

```csharp
services.AddSingleton<MyService>(sp =>
{
    var dependency = sp.GetRequiredService<MyDependency>();
    return new MyService(dependency);
});
```

O esto, si estás configurando opciones:

```csharp
services.AddOptions<MyOptions>()
    .Configure<IConfiguration>((options, configuration) =>
    {
        configuration.GetSection("MyOptions").Bind(options);
    });
```

Y si lo que necesitas es configuración pura, usa `IConfiguration` directamente en la fase de registro, sin pasar por el contenedor.

## Resumen

Llamar manualmente a `BuildServiceProvider()` suele ser una solución rápida para un problema inmediato, pero también suele ser una forma discreta de introducir un problema estructural.

Puedes duplicar singletons.
Puedes resolver servicios con lifetimes incorrectos.
Puedes crear un provider que no conoce todos los registros.
Puedes saltarte comportamiento del host.
Puedes provocar fugas de recursos.
Y, sobre todo, puedes esconder un fallo de diseño debajo de una llamada que compila.

En .NET, el contenedor de dependencias no es solo una fábrica de objetos que puedes encender cuando te apetezca. Forma parte del ciclo de vida de la aplicación.

Así que deja que el host construya el provider final.

Ya tenemos suficientes problemas con uno solo.
