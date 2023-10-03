---
published: true
ID: 202310041
title: 'Logs en .Net'
author: fernandoescolar
post_date: 2023-10-04 01:04:36
layout: post
tags: observability dotnet csharp
background: '/assets/uploads/bg/metrics.jpg'
---

Los *logs* son una parte fundamental de cualquier aplicación. Nos permiten saber qué está pasando en nuestra aplicación, y nos ayudan a encontrar errores y problemas. Además, forman parte de uno de los tres pilares de la observabilidad, junto con las [métricas](/2023/09/20/dotnet-metrics/) y las [trazas](/2023/09/06/dotnet-traces/).<!--break-->

En este post vamos a ver cómo podemos usar los *logs* en .Net, tanto en aplicaciones de consola como en aplicaciones web.

- [Cómo funciona](#cómo-funciona)
- [Cómo empezamos](#cómo-empezamos)
- [Proveedores](#proveedores)
- [Configuración](#configuración)
- [Fast logging](#fast-logging)
- [Conclusiones](#conclusiones)


## Cómo funciona

Para poder trabajar con *logs* en .Net, necesitamos usar la interfaz `ILogger`. Esta interfaz nos permite escribir mensajes de *logs* en nuestra aplicación. Y para tener esta interfaz, necesitaremos añadir el paquete `Microsoft.Extensions.Logging`:

```bash
dotnet add package Microsoft.Extensions.Logging
```

Un `ILogger` por sí mismo no funciona. Necesitamos un proveedor de *logs* que se encargue de escribir los mensajes en algún sitio. Por ejemplo, podemos usar el proveedor que escribe los mensajes en la consola añadiendo este paquete:

```bash
dotnet add package Microsoft.Extensions.Logging.Console
```

Y para poder instanciar un `ILogger`, necesitamos un `ILoggerFactory`. Este `ILoggerFactory` es el que se encarga de crear los `ILogger` que necesitemos. Por ejemplo, podemos crear un `ILoggerFactory` que use el proveedor de consola de esta manera:

```csharp
using var loggerFactory = LoggerFactory.Create(builder => builder.AddFilter(_ => true)
                                                                 .AddConsole());
var logger = loggerFactory.CreateLogger<Program>();

logger.LogDebug("Hello from debug");
await Task.Delay(1);
logger.LogInformation("Hello from info");
await Task.Delay(1);
logger.LogWarning("Hello from warn");
await Task.Delay(1);
logger.LogError("Hello from error");
await Task.Delay(1);
logger.LogCritical("Hello from critical");
await Task.Delay(1);
```

Como vemos, el `ILoggerFactory` tiene un método `CreateLogger` que nos permite crear un `ILogger` para una categoría determinada. En este caso, hemos creado un `ILogger` para la categoría `Program`. Y luego, podemos usar este `ILogger` para escribir mensajes de *logs*. Actualmente hay 5 niveles de *logs*: `Debug`, `Information`, `Warning`, `Error` y `Critical`. Y cada uno de ellos tiene un método en el `ILogger` que nos permite escribir mensajes de ese nivel.

Lo importante es que el artefacto que nos permite escribir mensajes de *logs* es el `ILogger` categorizado:

>  ILogger<TCategoryName>

A la hora de la verdad este código es un poco engorroso y, en el mundo real, lo que vamos a hacer es usar la inyección de dependencias para obtener el `ILogger` que necesitemos. Así pues, nuestro código se parecerá más a esto:

```csharp
var services = new ServiceCollection();
services.AddLogging(op => op.AddFilter(_ => true)
                            .AddConsole());

var serviceProvider = services.BuildServiceProvider();
var logger = serviceProvider.GetRequiredService<ILogger<Program>>();
```

Usando el inyector de dependencias podríamos instanciar un `ILoggerFactory` o ahorrarnos este paso y llamar directamente a un `ILogger`. En este caso, hemos llamado directamente a un `ILogger` para la categoría `Program`.

Gracias a la inyección de dependencias, podríamos añadir el siguiente paquete:

```bash
dotnet add package Microsoft.Extensions.Configuration.Json
```

Y crear en nuestro archivo *application.json* una configuración para los *logs*:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug"
    }
  }
}
```

A la hora de configurar la dependencias, ya no tendremos que especificar un filtro para que se muestren todos los mensajes de *logs*, simplemente, cargaremos la configuración del archivo *application.json*:

```csharp
var configuration = new ConfigurationBuilder()
                            .AddJsonFile("appsettings.json", optional: true)
                            .Build();
var services = new ServiceCollection();

services.AddLogging(op => op.AddConfiguration(configuration)
                            .AddConsole());
```

Y ahora hemos entendido cómo funcionan los *logs* en .Net. Pero no hemos visto como se usan realmente en nuestras aplicaciones.

## Cómo empezamos

Cuando creamos un proyecto de aplicación con *dotnet* ya tenemos un `ILogger` configurado para nosotros. Además, carga la configuración de *application.json* por defecto. Así pues, podemos usarlo directamente:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
```

En este código estaríamos configurando los proveedores de *logs* que queremos usar. Más concretamente, borramos todos los proveedores que vienen configurados por defecto y añadimos el proveedor de consola.

A partir de aquí, todo lo que escribamos en el `ILogger` se escribirá en la consola. Pero existen multitud de proveedores de logs, desde *3rd-parties* como *Open Telemetry*, hasta proveedores de Microsoft para dejar *logs* en el *EventLog* de *Windows*.

## Asp.Net Core

Si estamos trabajando con una aplicación web, podemos usar el middleware `UseHttpLogging` para escribir los mensajes de *logs* de las peticiones HTTP:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseHttpLogging();
```

Este middleware nos permite configurar qué campos queremos que se escriban en los *logs* de las peticiones HTTP. Por ejemplo, podemos configurar que se escriban todos los campos:

```csharp
builder.Services.AddHttpLogging(logging =>
{
  logging.LoggingFields = HttpLoggingFields.All;
  logging.RequestHeaders.Add("sec-ch-ua");
  logging.ResponseHeaders.Add("MyResponseHeader");
  logging.MediaTypeOptions.AddText("application/javascript");
  logging.RequestBodyLogLimit = 4096;
  logging.ResponseBodyLogLimit = 4096;
});
```

Si ejecutamos nuestra aplicación, podremos encontrar logs relaciones con Asp.Net Core.

## Proveedores

Como hemos visto, existen multitud de proveedores y nosotros también vamos a poder crear los nuestros. Bastará con implementar dos interfaces. Primero el `ILogger`:

```csharp
public sealed class CoolConsoleLogger : ILogger
{
    private readonly Dictionary<LogLevel, ConsoleColor> _colors = new()
    {
        [LogLevel.Debug] = ConsoleColor.DarkGray,
        [LogLevel.Information] = ConsoleColor.Green,
        [LogLevel.Warning] = ConsoleColor.Yellow,
        [LogLevel.Error] = ConsoleColor.Red,
        [LogLevel.Critical] = ConsoleColor.DarkRed,
    };


    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
        => default!;

    public bool IsEnabled(LogLevel logLevel)
        => true;

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel))
        {
            return;
        }

        if (_colors.ContainsKey(logLevel))
        {
            var originalColor = Console.ForegroundColor;
            Console.ForegroundColor = _colors[logLevel];
            Console.Write($"[{logLevel}] ");
            Console.ForegroundColor = originalColor;
            Console.WriteLine($"{formatter(state, exception)}");
        }
    }
}
```

Aquí estaríamos escribiendo los *logs* por consola, pero con el valor diferencial de usar colores según el nivel de *log*.

Y luego, implementaremos el `ILoggerProvider` para controlar las instancias de `ILogger` que se crean:

```csharp
public sealed class CoolConsoleLoggerProvider : ILoggerProvider
{
    private readonly ConcurrentDictionary<string, CoolConsoleLogger> _loggers = new(StringComparer.OrdinalIgnoreCase);

    public ILogger CreateLogger(string categoryName)
        => _loggers.GetOrAdd(categoryName, name => new CoolConsoleLogger());

    public void Dispose()
        => _loggers.Clear();
}
```

Para usar nuestro proveedor, bastará con añadirlo a la configuración de *logging*:

```csharp
services.AddLogging(op => op.Services.AddSingleton<ILoggerProvider, CoolConsoleLoggerProvider>());
```

Y al ponerlo a prueba podríamos encontrar una salida semejante a esta:

```bash
[Debug] Hello from debug
[Information] Hello from info
[Warning] Hello from warn
[Error] Hello from error
[Critical] Hello from critical
```

## Configuración

Como hemos visto, podemos configurar los *logs* usando el archivo *application.json*.

En este archivo no solo podremos especificar un nivel de *log* por defecto, sino que también podremos especificar un nivel de *log* para cada categoría. Por ejemplo, podemos configurar que se escriban todos los mensajes de *logs* de la categoría `MyNamespace`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "MyNamespace": "Debug"
    }
  }
}
```

También podríamos especificar el nivel de *log* para cada proveedor:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
    },
    "Console": {
        "LogLevel": {
            "Default": "Information",
        }
    }
  }
}
```

En este caso, todos los mensajes de *logs* se escribirán en la consola, pero solo los mensajes de nivel `Information` o superior.

Y poniendo todo junto podríamos tener una configuración más compleja:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug"
    },
    "Console": {
        "LogLevel": {
            "Default": "Information",
            "Microsoft": "Warning",
            "Microsoft.Hosting.Lifetime": "Information",
            "MyNamespace": "Debug"
        }
    }
  }
}
```


## Fast logging

Como hubo algunas personas que se quejaron de la *performance* del sistema de *logs* de .Net, Microsoft desarrollo un método de *fast logging*. Esta funcionalidad nos permite escribir mensajes de *logs* de una manera más rápida. Para ello, se ha añadido una utilidad llamada `LoggerMessage` que nos permite definir un mensaje de *log* específico y mantenerlo precompilado en memoria:

```csharp
public static class FastLoggingExtension
{
    private static readonly Action<ILogger, string, Exception> _fastException = LoggerMessage.Define<string>(LogLevel.Critical, new EventId(1, nameof(Exception)), "Exception thrown: {Exception}");

    public static void FastException(this ILogger logger, string message, Exception exception)
        => _fastException(logger, message, exception);
}
```

Al llamar a este método, se escribirá el mensaje de *log* precompilado:

```csharp
logger.FastException("my message", new Exception("my custom exception"));
```

Y el resultado sería el siguiente:

```bash
crit: Program[1]
      Exception thrown: my message
      System.Exception: my custom exception
```

El diferencial será la velocidad con la que este *log* se escribe en comparación con un *log* normal.

## Conclusiones

Como hemos visto, en .Net tenemos un sistema de *logs* muy potente y flexible. Podemos configurarlo fácilmente para solo tener *logs* de aquello que nos interesa. Podemos conectarlo con multitud de proveedores e incluso crear los nuestros propios.

Un conjunto de librerías muy potentes y flexibles que nos dan toda la flexibilidad que podemos necesitar en nuestros desarrollos.