---
published: true
ID: 2026052701
title: 'Proxies en Go o C#'
author: fernandoescolar
post_date: 2026-05-27 02:15:54
layout: post
tags: golang csharp proxy
background: '/assets/uploads/bg/network.webp'
---

Go es mejor que C# para hacer proxies *(y no pasa nada por decirlo)*. Hay discusiones técnicas que nunca mueren. No porque sean profundas, sino porque son cómodas. Lenguajes, frameworks, tabs vs spaces… y, por supuesto, proxies.<!--break-->

Cada vez que alguien propone hacer un proxy aparece la misma pregunta, casi siempre formulada con falsa inocencia:

> ¿En qué lenguaje lo hacemos?

Y detrás de esa pregunta suele venir otra, no verbalizada pero muy presente:

> ¿Cuál es más eficiente?

Aquí voy a ahorrarte suspense, diplomacia y falsas equivalencias: **Go es mejor que C# para hacer proxies**, en rendimiento y en preparación de serie.

No porque C# sea malo.
No porque .NET sea lento.
Sino porque Go está diseñado exactamente para este tipo de problema, y eso se nota. Mucho.

## Qué es realmente un proxy (y qué no)

Antes de entrar en lenguajes conviene aclarar algo, porque aquí empieza buena parte del malentendido. Un proxy no es una API que reenvía requests, ni un backend con un `HttpClient` dentro, ni un “servicio” con treinta middlewares que casualmente llama a otro servidor.

Un proxy de verdad vive en el mundo del I/O. Acepta conexiones, espera, reenvía, vuelve a esperar y se despide. La mayor parte del tiempo no ejecuta lógica de negocio ni toma decisiones interesantes. Simplemente está ahí, aguantando.

Y cuando el 95% del tiempo de tu programa consiste en esperar a la red, el runtime deja de ser un detalle y pasa a ser protagonista.

## Go no es rápido por accidente

Go no es rápido porque alguien se haya esforzado mucho optimizando el compilador. Es rápido porque el lenguaje renunció conscientemente a muchas cosas que, para este tipo de problema, sobran.

Las goroutines son el mejor ejemplo. No son “threads más baratos”, son una abstracción diseñada para convivir con miles de operaciones bloqueantes sin que el proceso se resienta. Empiezan con una pila ridículamente pequeña, crecen cuando hace falta y el scheduler está pensado para moverlas con soltura cuando pasan la mayor parte del tiempo esperando.

Eso encaja de forma casi obscena con un proxy.

Un proxy mínimo en Go puede ser algo tan simple como esto:

```go
func handler(w http.ResponseWriter, r *http.Request) {
    resp, err := http.DefaultClient.Do(r)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadGateway)
        return
    }
    defer resp.Body.Close()

    for k, v := range resp.Header {
        w.Header()[k] = v
    }

    w.WriteHeader(resp.StatusCode)
    io.Copy(w, resp.Body)
}

func main() {
    http.HandleFunc("/", handler)
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

No es un proxy perfecto ni mucho menos, pero tiene algo inquietante: escala bastante bien casi sin esfuerzo. Y eso es exactamente lo que esperas de una herramienta pensada para infraestructura.

## C# no es lento, pero no juega en casa

C# moderno no tiene nada que ver con el C# que muchos aún llevan en la cabeza. Kestrel es rápido, el modelo async/await está muy afinado y el rendimiento en I/O es excelente. Nadie serio puede decir hoy que .NET sea lento.

El problema es otro: **el coste base**.

Un proxy mínimo en C# suele verse así:

```csharp
var app = WebApplication.CreateBuilder(args).Build();

app.Run(async context =>
{
    using var client = new HttpClient();
    var request = new HttpRequestMessage(
        new HttpMethod(context.Request.Method),
        context.Request.GetDisplayUrl()
    );

    var response = await client.SendAsync(
        request,
        HttpCompletionOption.ResponseHeadersRead
    );

    context.Response.StatusCode = (int)response.StatusCode;

    foreach (var header in response.Headers)
        context.Response.Headers[header.Key] = header.Value.ToArray();

    await response.Content.CopyToAsync(context.Response.Body);
});

app.Run();
```

Funciona, y lo hace muy bien. Pero aquí ya hay más piezas moviéndose: máquinas de estados async, más objetos temporales, más presión sobre el GC. Todo está optimizado, sí, pero el runtime es más generalista y arrastra decisiones pensadas para muchos otros tipos de aplicaciones.

En un proxy puro, todo eso no aporta valor. Solo está ahí.

## Igualdad de condiciones: aquí está la clave

Aquí es donde conviene dejar de fingir equilibrio. Si coges dos equipos competentes, les pides que implementen el mismo proxy, con el mismo cuidado y sin trampas, el resultado va a ser bastante predecible.

El proxy en Go va a consumir menos memoria, va a manejar más conexiones simultáneas con mayor holgura y va a arrancar antes. No porque el programador sea mejor, sino porque el lenguaje y su runtime están más cerca del problema.

Esto no es una cuestión de microoptimizaciones ni de benchmarks sintéticos. Es estructural. Go fue diseñado para esto. C# fue diseñado para muchas cosas, y entre ellas también puede hacer proxies, pero no es su terreno natural.

Para que C# salga ganando tiene que ocurrir algo externo al propio proxy. Normalmente, que deje de ser solo un proxy y se convierta en una pieza más de una aplicación grande, con lógica, reglas, integraciones y todo lo que eso conlleva. En ese momento, la balanza cambia, pero ya estamos hablando de otra cosa.

## Por qué casi todos los proxies “serios” están en Go

Si miras el ecosistema de infraestructura moderna, cuesta encontrar grandes piezas críticas escritas en C# cuando hablamos de red pura. No es una conspiración ni una moda pasajera. Es simple alineación entre problema y herramienta.

Go permite escribir servicios que hacen poco, consumen poco y molestan poco. Copias un binario, lo ejecutas y sabes que no va a pedir mucho más. Eso, en entornos con miles de instancias y recursos compartidos, es una ventaja enorme.

En C# existen proxies, por supuesto, pero suelen aparecer integrados en sistemas mayores. Rara vez son el centro de gravedad. Suelen ser una consecuencia, no el objetivo principal.

## La eficiencia que no sale en los gráficos

Hay una parte de la eficiencia que no aparece en ningún benchmark y que, sin embargo, suele ser decisiva: la de escribir menos cosas.

Go te empuja a no hacer demasiado. No te invita a crear capas, ni abstracciones innecesarias, ni configuraciones exuberantes. Eso reduce superficie de error, reduce consumo accidental y reduce sorpresas.

C# te lo pone muy fácil para hacer muchas cosas bien estructuradas. Eso es fantástico… hasta que estás escribiendo infraestructura que no necesita ser bonita, solo resistente.

No es una crítica. Es una diferencia de enfoque.

## Conclusión sin diplomacia

Para hacer proxies, Go es mejor. Rinde más, consume menos y está mejor preparado de serie. C# puede hacerlo bien, incluso muy bien, pero tiene que trabajar más para llegar al mismo sitio.

Elegir C# puede ser una decisión pragmática y perfectamente válida. Fingir que da igual qué lenguaje uses, no.

Go juega en casa.
Y admitirlo no nos hace peores desarrolladores.

Solo más honestos.
