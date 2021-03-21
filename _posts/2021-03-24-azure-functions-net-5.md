---
published: true
ID: 202103241
title: 'Azure Functions con .NET 5'
author: fernandoescolar
post_date: 2021-03-24 02:21:02
layout: post
tags: csharp azure functions net5 dotnet
---

Ha tardado más de lo que esperábamos pero ya está aquí. Después de meses de espera y escondiendo el [anuncio](https://techcommunity.microsoft.com/t5/apps-on-azure/net-on-azure-functions-roadmap/ba-p/2197916) dentro de un roadmap de las próximas versiones de *.Net*, las *dotNet Isolated Functions* pasan a RTM<!--break-->. Y con ellas llega el soporte de .Net 5.0 en Azure Functions. Pero esta vez, la migración no va a ser tan sencilla como, simplemente, subir la versión del runtime.

Para conseguir compatibilidad con *.Net 5* se ha cambiado la estrategia. En lugar de actualizar todos los paquetes y crear una nueva versión de *Azure Functions*, se ha creado un nuevo *worker* llamado *dotnet-isolated*. Esto es una suerte de *host* que lanza nuestro ensamblado de funciones como un proceso aislado. Para la comunicación entre el proceso del *host* y el de las funciones se ha utilizado un canal *gRPC*. La idea es que, con este modelo podremos incluir todo lenguaje y framework para trabajar con *Azure Functions*. Aunque la realidad es que, hoy en día solo se soporta *.Net 5*.

* TOC
{:toc}

## Quick Start



```json
{
    "version": "2.0"
}
```

```diff
{
    "IsEncrypted": false,
    "Values": {
-       "FUNCTIONS_WORKER_RUNTIME": "dotnet",
+       "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
        "AzureWebJobsStorage": "UseDevelopmentStorage=true"
    },
    "disabled": false
}
```

```diff
 <Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net5.0</TargetFramework>
    <OutputType>Exe</OutputType>
+   <AzureFunctionsVersion>v3</AzureFunctionsVersion>
+   <_FunctionsSkipCleanOutput>true</_FunctionsSkipCleanOutput>
  </PropertyGroup>
  <ItemGroup>
+   <PackageReference Include="Microsoft.Azure.Functions.Worker" Version="1.0.0" />
+   <PackageReference Include="Microsoft.Azure.Functions.Worker.Sdk" Version="1.0.1" OutputItemType="Analyzer" />
  </ItemGroup>

  <ItemGroup>
    <None Update="host.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
    <None Update="local.settings.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <CopyToPublishDirectory>Never</CopyToPublishDirectory>
    </None>
  </ItemGroup>
 </Project>
```

```csharp
static async Task Main(string[] args)
{
  var host = new HostBuilder()
                  .ConfigureFunctionsWorkerDefaults()
                  .Build();

  await host.RunAsync();
}
```

https://www.nuget.org/packages?q=Microsoft.Azure.Functions.Worker.Extensions

Microsoft.Azure.Functions.Worker.Extensions. Http Timer ServiceBus EventHubs Storages ....

`Microsoft.Azure.Functions.Worker.Extensions.Http`

```csharp
public static class HttpFunction
{
  [Function(nameof(HttpFunction))]
  public static HttpResponseData Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]
    HttpRequestData req,
    FunctionContext context)
  {
      var logger = context.GetLogger("HttpFunction");
      logger.LogInformation("request arrived");

      var response = req.CreateResponse(HttpStatusCode.OK);
      response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
      response.WriteString("Welcome to .NET 5!!");

      return response;
  }
}
```

`Microsoft.Azure.Functions.Worker.Extensions.Storage`

```csharp
public static class QueueFunction
{
  [Function(nameof(QueueFunction))]
  [QueueOutput("outqueue", Connection = "StorageConnectionString")]
  public static string Run(
    [QueueTrigger("inqueue")]
    string message,
    FunctionContext context)
  {
    return $"input queue message: {message}";
  }
}
```

Para obtener más de un *binding* de salida, tendremos que crear una clase nueva donde definiremos los diferentes tipos de *outputs* usando los mismos atributos:

```csharp
public class FunctionResult
{
    [QueueOutput("outqueue", Connection = "StorageConnectionString")]
    public string Message { get; set; }

    public HttpResponseData HttpReponse { get; set; }
}
```

Después solo tendremos que devolver una nueva instancia de este objeto que hemos creado:

```csharp
public static class HttpOutFunction
{
  [Function(nameof(HttpOutFunction))]
  public static FunctionResult Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]
    HttpRequestData req,
    FunctionContext context)
  {
      var response = req.CreateResponse(HttpStatusCode.OK);
      response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
      response.WriteString("Welcome to .NET 5!!");

      return new FunctionResult
      {
        Message = "Welcome to .NET 5!!",
        HttpReponse = response
      };
  }
}
```

https://github.com/Azure/azure-functions-core-tools

```bash
func start
```
![Vista en el navegador](/public/uploads/2021/03/functions-net5.png)

## Dependency Injection

```csharp
public interface IQuotesService
{
  string GetQuoteOfTheDay();
}
```


```csharp
public class QuotesService : IQuotesService
{
  private static readonly string[] _quotes = new []
  {
    "Gaste mucho dinero en coches, alcohol y mujeres. El resto lo he malgastado. (George Best)",
    "A medida que uno va ganando cosas, se hamburguesa. (Carlos Tévez)",
    "Como todo equipo africano, Jamaica será un rival difícil. (Edinson Cavani)",
    "Perdimos porque no ganamos. (Ronaldo Nazário)",
    "El fútbol es como el ajedrez, pero sin dados. (Lukas Podolski)",
    "No hay nada entre medio, o eres bueno o eres malo. Nosotros estuvimos entre medio. (Gary Lineker)",
    "Jugamos como nunca y perdimos como siempre. (Alfredo Di Stefano)",
    "A veces, en fútbol, tienes que marcar goles. (Thierry Henry)",
    "El problema es que no ha entrado el balón. (Sergio Ramos)"
  };

  public string GetQuoteOfTheDay()
  {
      var index = new Random()
                      .Next(0, _quotes.Length);

      return _quotes[index];
  }
}
```

```csharp
public class QuoteOfTheDayFunction
{
  private readonly IQuotesService _service;
  private readonly ILogger _logger;

  public QuoteOfTheDayFunction(IQuotesService service, ILogger<QuoteOfTheDayFunction> logger)
  {
    _service = service;
    _logger = logger;
  }

  [Function(nameof(QuoteOfTheDayFunction))]
  public HttpResponseData Run(
      [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]
      HttpRequestData req
  )
  {
    _logger.LogInformation("getting quote of the day");

    var response = req.CreateResponse(HttpStatusCode.OK);
    response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
    response.WriteString(_service.GetQuoteOfTheDay());

    return response;
  }
}
```


```csharp
static async Task Main(string[] args)
{
  var host = new HostBuilder()
                  .ConfigureFunctionsWorkerDefaults()
                  .ConfigureServices((context, services) =>
                  {
                      services.AddScoped<IQuotesService, QuotesService>();
                  })
                  .Build();

  await host.RunAsync();
}
```

`context` `context.Configuration.GetSection("Quotes")`

```bash
func start
```
![Vista en el navegador](/public/uploads/2021/03/functions-net5-2.png)

## Middlewares

```csharp
public class DummyMiddleware : IFunctionsWorkerMiddleware
{
  public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
  {
    var logger = context.GetLogger<DummyMiddleware>();
    logger.LogInformation($"My Funcion: {context.FunctionDefinition.Name}");

    await next(context);
  }
}
```

```csharp
static async Task Main(string[] args)
{
  var host = new HostBuilder()
                  .ConfigureFunctionsWorkerDefaults(app =>
                  {
                    app.UseMiddleware<DummyMiddleware>();
                  })
                  .Build();

  await host.RunAsync();
}
```

## Tips & Tricks

```bash
func start --dotnet-isolated-debug --verbose
```

`AddEnvironmentVariables`

```csharp
static async Task Main(string[] args)
{
  var host = new HostBuilder()
                  .ConfigureFunctionsWorkerDefaults()
                  .ConfigureAppConfiguration(config =>
                  {
                    config.AddEnvironmentVariables();
                  })
                  .Build();

  await host.RunAsync();
}
```

```bash
az functionapp config set --net-framework-version v5.0 --name <my_function_app> --resource-group <my_resource_group>
```

```bash
func azure functionapp publish <my_function_app>
```

## Conclusiones

### Ventajas

Anteriormente, Azure Functions solo admitía un modo estrechamente integrado para funciones .NET, que se ejecutan como una biblioteca de clases en el mismo proceso que el host. Este modo proporciona una integración profunda entre el proceso del host y las funciones. Por ejemplo, las funciones de biblioteca de clases .NET pueden compartir tipos y API vinculantes. Sin embargo, esta integración también requiere un acoplamiento más estrecho entre el proceso del host y la función .NET. Por ejemplo, las funciones .NET que se ejecutan en proceso deben ejecutarse en la misma versión de .NET que el tiempo de ejecución de Funciones. Para permitirle ejecutar fuera de estas restricciones, ahora puede optar por ejecutar en un proceso aislado. Este aislamiento de proceso también le permite desarrollar funciones que utilizan las versiones actuales de .NET (como .NET 5.0), que no son compatibles de forma nativa con el tiempo de ejecución de Functions.

- Menos conflictos: debido a que las funciones se ejecutan en un proceso separado, los ensamblados usados en su aplicación no entrarán en conflicto con versiones diferentes de los mismos ensamblados usados por el proceso anfitrión.
- Control total del proceso: usted controla el inicio de la aplicación y puede controlar las configuraciones utilizadas y el middleware iniciado.
- Inyección de dependencias sin malavarismos: debido a que tiene el control total del proceso, puede usar los comportamientos actuales de .NET para la inyección de dependencias e incorporar middleware en su aplicación de funciones.

### Inconvenientes