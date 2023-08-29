---
published: true
ID: 202309061
title: 'Trazas en .Net'
author: fernandoescolar
post_date: 2023-09-06 01:04:36
layout: post
tags: observability dotnet csharp traces
background: '/assets/uploads/bg/observe.jpg'
---

Las trazas son una de las herramientas más antiguas y conocidas para la observabilidad de aplicaciones. Históricamente, las trazas se han utilizado para registrar información sobre el estado de una aplicación, como mensajes de error, advertencias o información de depuración. <!--break--> En el mundo de .Net, existen varias formas diferentes de generar trazas, pero hoy nos centraremos en los nuevos artefactos que nos proporciona Microsoft para crear trazas distribuidas en nuestras aplicaciones.

Las trazas distribuidas son una técnica de diagnóstico que ayuda a los desarrolladores y operadores a localizar fallos y problemas de rendimiento en aplicaciones, especialmente aquellas que pueden estar distribuidas en múltiples máquinas o procesos. Esta técnica sigue las solicitudes a través de una aplicación, correlacionando el trabajo realizado por diferentes componentes que la forman y separándolo del trabajo que puede estar haciendo para solicitudes concurrentes.

Vamos a poner un ejemplo: una solicitud a un servicio web típico podría ser recibida primero por un balanceador de carga, luego reenviada a un proceso de servidor web, que luego realiza varias consultas a una base de datos. El uso de trazas distribuidas nos permite relacionar todas esas acciones, distinguir si alguna falló, cuánto tiempo tomó cada paso y potencialmente registrar mensajes producidos por cada paso a medida que se ejecutaba.

![Ejemplo de trazas distribuidas](/assets/uploads/2023/09/traces.svg)

Una traza podría definirse como un evento que sucede dentro de una aplicación, en un momento determinado, con una duración específica y que tiene asociados unos metadatos sobre su contexto de ejecución.

- [Cómo empezar](#cómo-empezar)
- [Capturando trazas](#capturando-trazas)
- [Añadiendo metadatos](#añadiendo-metadatos)
- [Añadiendo eventos](#añadiendo-eventos)
- [Creando trazas anidadas](#creando-trazas-anidadas)
- [Propagando el contexto](#propagando-el-contexto)
- [Conclusiones](#conclusiones)

## Cómo empezar

Si estás trabajando con .Net 5 o una versión superior, tienes disponible el paquete [System.Diagnostics.DiagnosticSource](https://www.nuget.org/packages/System.Diagnostics.DiagnosticSource/). Una API de bajo nivel que permite a los desarrolladores instrumentar sus aplicaciones para generar trazas distribuidas. Esta API se ha diseñado para ser utilizada por bibliotecas y frameworks, que pueden generar trazas que luego pueden ser consumidas por herramientas de terceros, como [OpenTelemetry](https://opentelemetry.io/) o [Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview).

Para utilizarla, debemos instalar el paquete NuGet `System.Diagnostics.DiagnosticSource` en nuestro proyecto:

```bash
dotnet add package System.Diagnostics.DiagnosticSource
```

Una vez instalado, tendremos que referenciar el espacio de nombres `System.Diagnostics` en nuestro código:

```csharp
using System.Diagnostics;
```

Esto nos dará acceso a la clase `ActivitySource`, que es la que nos permitirá generar trazas en nuestra aplicación:

```csharp
var source = new ActivitySource("beer-tracing");
```

La clase `ActivitySource` nos permite crear una fuente de trazas con un nombre determinado. A partir de una instancia de esta clase, podemos crear nuevas trazas utilizando el método `StartActivity`:

```csharp
using (var activity = source.StartActivity("drink-beer"))
{
    // Do something
}
```

El método `StartActivity` nos devuelve una instancia de la clase `Activity`, que representa una traza distribuida en nuestra aplicación. La duración de la traza se determina por el tiempo que transcurre entre la llamada a `StartActivity` y la llamada a `Dispose` de la instancia de `Activity`. En el ejemplo anterior, la traza `drink-beer` se iniciará cuando se llame a `StartActivity` y finalizará cuando se llame a `Dispose`. En este caso, cuando finalice el bloque `using`.

## Capturando trazas

Para capturar las trazas generadas por nuestra aplicación, podemos utilizar la clase `ActivityListener`. Esta clase nos permite crear nuestras propias implementaciones para cuando se inicia o se detiene una traza. Para ello, debemos crear una instancia de esta clase e indicar qué métodos vamos a ejecutar en `ActivityStarted` y `ActivityStopped`. Adicionalmente tendremos filtrar que `ActivitySource` queremos escuchar, mediante el método `ShouldListenTo`, y decidir si queremos capturar todas las trazas o usar *sampling*, mediante el método `Sample`.

```csharp
var listener = new ActivityListener
{
    ActivityStarted = OnActivityStarted,
    ActivityStopped = OnActivityStopped,
    ShouldListenTo = OnShouldListenTo,
    Sample = Sampling,
};
```

Para completar el ejemplo, vamos a crear una implementación de estos métodos que nos permita imprimir por consola las trazas que se generan en nuestra aplicación:

```csharp
void OnActivityStarted(Activity activity)
{
    Console.Write(ParentSpaces(activity));
    Console.WriteLine($"Started: {activity.OperationName}");
}

void OnActivityStopped(Activity activity)
{
    Console.Write(ParentSpaces(activity));
    Console.WriteLine($"Stopped: {activity.OperationName} {activity.Duration.TotalMicroseconds}");
}

bool OnShouldListenTo(ActivitySource activitySource)
{
    return true;
}

ActivitySamplingResult Sampling(ref ActivityCreationOptions<ActivityContext> op)
{
    return ActivitySamplingResult.AllDataAndRecorded;
}

string ParentSpaces(Activity activity)
{
    var sb = new StringBuilder();
    while (activity != null)
    {
        sb.Append("  ");
        activity = activity.Parent;
    }

    return sb.ToString();
}
```

Una vez que tenemos nuestra implementación de `ActivityListener`, podemos registrarla en nuestra aplicación:

```csharp
ActivitySource.AddActivityListener(listener);
```

Si ahora ejecutamos nuestra aplicación, veremos que se imprimen por consola las trazas que se generan en nuestra aplicación:

```bash
Started: drink-beer
Stopped: drink-beer 3152
```

Este ejemplo de *listener* es muy básico y tan solo un ejemplo, pero nos permite ver cómo podemos capturar las trazas que se generan en nuestra aplicación. Cuando queramos usar un `ActivityListener` productivo, la recomendación es que nos decantemos por el uso de una implementación ya existente y probada, una librería que ya esté conectada a una aplicación de terceros que nos permita explotar la información de las trazas distribuidas que creamos. Algo como la librería de [OpenTelemetry para .Net](https://opentelemetry.io/docs/instrumentation/net/) o de [Azure Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/asp-net-core?tabs=netcorenew,netcore6). Esto siempre será mejor que dedicarnos a crear nuestra propia implementación.

## Añadiendo metadatos

Hasta ahora, hemos visto cómo podemos generar trazas en nuestra aplicación, pero no hemos visto cómo podemos añadir metadatos a esas trazas. Para ello, podemos utilizar el método `SetTag` de la clase `Activity`. Este método nos permite añadir un par clave-valor a la traza que estamos generando:

```csharp
using (var activity = source.StartActivity("drink-beer"))
{
    activity.SetTag("beer", "Estrella Galicia");
}
```

Para recuperar los metadatos de una traza, podemos utilizar la propiedad `Tags` en nuestro `ActivityListener`:

```csharp
void OnActivityStopped(Activity activity)
{
    foreach (var tag in activity.Tags)
    {
        Console.Write(ParentSpaces(activity));
        Console.WriteLine($"  {tag.Key}: {tag.Value}");
    }

    Console.Write(ParentSpaces(activity));
    Console.WriteLine($"Stopped: {activity.OperationName} {activity.Duration.TotalMicroseconds}");

}
```

Si ejecutamos nuestra aplicación, veremos que se imprimen por consola los metadatos que hemos añadido a nuestra traza:

```bash
Started: drink-beer
  beer: Estrella Galicia
Stopped: drink-beer 2994
```

## Añadiendo eventos

Además de los metadatos, podemos añadir eventos a nuestras trazas. Los eventos son mensajes que se asocian a una traza y que nos permiten registrar información adicional sobre lo que está sucediendo en nuestra aplicación. Para añadir un evento a una traza, podemos utilizar el método `AddEvent` de la clase `Activity`:

```csharp
using (var activity = source.StartActivity("beer"))
{
    activity.AddEvent(new ActivityEvent("drink-beer", new Dictionary<string, object>
    {
        { "beer", "Estrella Galicia" },
    }));
}
```

Para recuperar los eventos de una traza, podemos utilizar la propiedad `Events` en nuestro `ActivityListener`:

```csharp
void OnActivityStopped(Activity activity)
{
    foreach (var activityEvent in activity.Events)
    {
        Console.Write(ParentSpaces(activity));
        Console.Write("event: ");
        Console.WriteLine($"{activityEvent.Name} {activityEvent.Timestamp.UtcDateTime}");
    }

    Console.Write(ParentSpaces(activity));
    Console.WriteLine($"Stopped: {activity.OperationName} {activity.Duration.TotalMicroseconds}");
}
```

Si ejecutamos nuestra aplicación, veremos que se imprimen por consola los eventos que hemos añadido a nuestra traza:

```bash
Started: beer
  event: drink-beer 2021-09-06 10:02:39
Stopped: beer 3201
```

## Creando trazas anidadas

Cuando creamos procesos una traza distribuida no tiene por qué ser única o aislada. De hecho, la mayor parte de las veces formará parte de una traza más grande que involucra a otras trazas. Toda esta gestión se realiza de forma automática en nuestra aplicación:

```csharp
using (var activity = source.StartActivity("beer"))
{
    using (var activity2 = source.StartActivity("take-beer"))
    {
        await Task.Delay(500);
    }

    using (var activity2 = source.StartActivity("drink-beer"))
    {
        await Task.Delay(1000);
    }
}
```

En este ejemplo, hemos creado una traza `beer` que contiene dos trazas anidadas `take-beer` y `drink-beer`. Si ejecutamos nuestra aplicación, veremos que se imprimen por consola las trazas anidadas:

```bash
Started: beer
  Started: take-beer
  Stopped: take-beer 503253
  Started: drink-beer
  Stopped: drink-beer 1001487
Stopped: beer 1509620
```

## Propagando el contexto

Si estamos trabajando en un entorno local donde nuestra aplicación es un monolito, no tendremos que preocuparnos por propagar las trazas entre procesos. Sin embargo, si estamos trabajando en un entorno distribuido, donde nuestra aplicación está formada por múltiples procesos, tendremos que propagar el contexto de las trazas entre ellos para poder correlacionarlas.

Correlacionar una traza consiste en desde un software externo poder relacionar todas las trazas generadas por una solicitud a nuestra aplicación entre los diferentes servicios que la forman. Imaginemos que tenemos una API que recibe una petición, realiza una operación y encola un mensaje en un sistema de colas distribuido que será procesado por otro servicio. Si queremos correlacionar las trazas de la petición con las trazas del procesamiento del mensaje, tendremos que propagar la traza de la petición al servicio que procesa el mensaje.

```csharp
// API
app.MapGet("/api/beer", async (DistributedQueue queue) =>
{
    using (var activity = source.StartActivity("beer"))
    {
        var message = new Message("Estrella Galicia");
        await queue.EnqueueAsync(message);
    }
});

// Service
queue.ProcessMessageAsync(async (Message message) =>
{
    using (var activity = source.StartActivity("drink-beer"))
    {
        await Task.Delay(1000);
    }
});
```

En este ejemplo, hemos creado una API que recibe una petición y encola un mensaje en un sistema de colas distribuido. Cuando el mensaje es procesado por el servicio, se genera una traza `drink-beer`. Si ejecutamos las dos aplicaciones cada una de ellas escribirá por consola las trazas que genera. Si después añadiéramos un sistema de terceros para mostrar trazas distribuidas de nuestro sistema (como [Jaeger](https://www.jaegertracing.io/), [Zipkin](https://zipkin.io/) o [Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview?tabs=net)), veríamos que las trazas de la petición y del procesamiento del mensaje de forma independiente.

En sistemas distribuidos esto es un problema, ya que no existirá una correlación entre una petición a una API y el procesamiento de un mensaje en un sistema de colas. Para solucionar esto, tendremos que propagar el contexto de la traza de la petición al servicio que procesa el mensaje.

Para propagar este contexto, podemos utilizar las propiedades `ParentId` y `TraceStateString` de la clase `Activity`. Estas propiedades nos permiten obtener el identificador de la traza padre y el estado de la traza. Para propagarlas, podemos añadirlas como cabeceras del mensaje que encolamos en el sistema de colas:

```csharp
// API
app.MapGet("/api/beer", async (DistributedQueue queue) =>
{
    using (var activity = source.StartActivity("beer"))
    {
        var message = new Message("Estrella Galicia");
        message.Headers.Add("traceparent", activity.ParentId);
        message.Headers.Add("tracestate", activity.TraceStateString);

        await queue.EnqueueAsync(message, activity.Context);
    }
});
```

En .Net los valores de estas propiedades cumplen con el estándar [W3C Trace Context](https://www.w3.org/TR/trace-context/). Este estándar define un formato para el intercambio de información de trazas entre procesos. En este caso, el valor de la propiedad `ParentId` sigue el formato `00-<trace_id>-<span_-_id>-<trace_flags>` y el valor de la propiedad `TraceStateString` sigue el formato `key1=value1,key2=value2` donde:

- `trace_id`: identificador de la traza de 16 bytes en formato hexadecimal (32 caracteres).
- `span_id`: identificador del span de la traza de 8 bytes en formato hexadecimal (16 caracteres).
- `trace_flags`: flags de la traza de 8 bits en formato hexadecimal (2 caracteres).

Así que, para propagar el contexto de la traza, tendremos que añadir estas cabeceras al mensaje que encolamos en el sistema de colas y luego recuperarlas en el servicio que procesa el mensaje. Después de recuperarlas, tendremos que crear una nueva instancia de `ActivityContext` con los valores de estas cabeceras y utilizarla para crear una nueva traza:

```csharp
// Service
queue.ProcessMessageAsync(async (Message message) =>
{
    var traceParent = message.Headers["traceparent"];
    var traceState = message.Headers["tracestate"];

    var traceId = ActivityTraceId.CreateFromString(traceParent.AsSpan(3, 32));
    var spanId = ActivitySpanId.CreateFromString(traceParent.AsSpan(36, 16));
    var traceFlags = (ActivityTraceFlags)int.Parse(traceParent.AsSpan(53, 2), NumberStyles.HexNumber);
    var context = new ActivityContext(traceId, spanId, traceFlags, traceState);

    using (var activity = source.StartActivity("drink-beer", ActivityKind.Server, context))
    {
        await Task.Delay(1000);
    }
});
```

Para comprobar la propagación del contexto está funcionando correctamente podríamos añadir a nuestro `ActivityListener` que imprima por consola el identificador de la traza padre:

```csharp
void OnActivityStarted(Activity activity)
{
    Console.Write(ParentSpaces(activity));
    Console.WriteLine($"Started: {activity.OperationName} {activity.ParentId}");
}
```

Y al ejecutar nuestras dos aplicaciones de forma simultánea, veríamos que ambas trazas tienen el mismo identificador de traza padre:

```bash
# output API
Started: beer 00-82d295e33d03871088267b9a2d117302-a23cf30b021bbcc3-01
...
# output Service
Started: drink-beer 00-82d295e33d03871088267b9a2d117302-a23cf30b021bbcc3-01
...
```

Esta información permitiría a un sistema de terceros correlacionar las trazas de la petición y del procesamiento del mensaje.

De nuevo, si estamos trabajando en un entorno productivo, no recomendamos realizar la propagación del contexto de forma manual. En su lugar, recomendamos utilizar una implementación ya existente y probada como podría ser la de la librería de [OpenTelemetry para .Net](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/examples/MicroserviceExample/Utils/Messaging). Este código es un ejemplo que sirve para ilustrar cómo funciona internamente la propagación del contexto de las trazas, pero no es una implementación que se deba utilizar en producción.

## Conclusiones

Las trazas son una herramienta muy útil para la observabilidad de aplicaciones. En este artículo hemos visto cómo podemos generar trazas distribuidas en .Net utilizando la clase `ActivitySource` y cómo podemos propagar el contexto de las trazas entre procesos.

Las trazas distribuidas son una técnica de instrumentación de aplicaciones muy importante, pero no la única. Una observabilidad complete requiere de otras técnicas como las métricas o los logs. Tampoco hemos profundizado en cómo podemos explotar la información de las trazas distribuidas, solo en cómo generarlas.

En próximos artículos profundizaremos en otras técnicas de instrumentación de aplicaciones y en cómo podemos explotar la información que generan para obtener una observabilidad completa de nuestras aplicaciones.