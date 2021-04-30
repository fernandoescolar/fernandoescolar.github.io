---
published: true
ID: 202105121
title: 'Asp.Net Core: Make it simple'
author: fernandoescolar
post_date: 2021-05-12 01:05:31
layout: post
tags: aspnet net5 dotnet
background: '/assets/uploads/bg/fast.jpg'
---

La vida está plagada de casualidades. Si no preguntadle a [David Heinemeier Hansson](https://en.wikipedia.org/wiki/David_Heinemeier_Hansson). Quién le iba a decir que, en 2005 iba a hacer explotar las mentes de los desarrolladores y poner [Ruby On Rails](https://rubyonrails.org) en boca de todos. Tampoco pensaría que iba a ser la fuente de inspiración de un proyecto en .net llamado [MonoRail](http://www.castleproject.org/projects/monorail/), desarrollado por el grupo de [Castle Project en 2007](https://www.infoq.com/news/2007/09/castleproject/).<!--break--> O quién le iba a decir a [Miguel de Icaza](https://en.wikipedia.org/wiki/Miguel_de_Icaza) que iba a recibir un montón de preguntas sobre este proyecto sin tener nada que ver con él. Quizá que el nombre empezara por [Mono](https://www.mono-project.com) nos llevó a equívocos a más de uno. De lo que estoy seguro es de que los chicos de Castle Project no imaginaban que un grupo de ingenieros de [Redmon](https://en.wikipedia.org/wiki/Redmond,_Washington) copiaría su proyecto y llegarían a tener un éxito que para ellos fue esquivo. Lo cierto es que en 2009 cambió el mundo del desarrollo web con tecnologías Microsoft: se lanzó la primera versión de [Asp.Net MVC](https://weblogs.asp.net/scottgu/asp-net-mvc-1-0).

Todo esto podría ser considerado una pequeña anécdota  de la inmensa historia de la programación. O también un subproducto conspiranoico de una mente enfermiza.

De cualquier manera, me turboflipa Asp.Net MVC. Me parece de lo mejor que le ha pasado al desarrollo en el ecosistema Microsoft. Además desde 2009 hasta hoy, ha mejorado una barbaridad. Se ha convertido en una herramienta que hace el desarrollo de una API Rest, accesible a casi cualquier programador. 
a

```csharp
public record Todo(int Id, string Title, bool IsDone);
```

a

```csharp
public class TodoStore
{
  private readonly Hashtable _todos = new Hashtable();

  public int Counter { get; private set; }

  public IEnumerable<Todo> GetAll() => _todos.Values.Cast<Todo>().ToList();

  public Todo GetOne(int id) => _todos[id] as Todo;

  public void Insert(Todo todo) => _todos[++Counter] = todo with { Id = Counter };

  public void Upsert(int id, Todo todo) => _todos[id] = todo with { Id = id };

  public void Delete(int id) => _todos.Remove(id);
}
```

a

```csharp
[ApiController]
[Route("[controller]")]
public class TodosController : ControllerBase
{
  private readonly TodoStore _store;

  public TodosController(TodoStore store)
    => _store = store;

  [HttpGet]
  public IActionResult GetAll()
  {
    var todos = _store.GetAll();
    if (!todos.Any())
    {
      return NoContent();
    }

    return Ok(todos);
  }

  [HttpGet("{id:int}")]
  public IActionResult GetOne(int id) { /*...*/ }

  [HttpPost]
  public IActionResult Post([FromBody] Todo todo)  { /*...*/ }

  [HttpPut("{id:int}")]
  public IActionResult Put(int id, [FromBody] Todo todo)  { /*...*/ }

  [HttpDelete("{id:int}")]
  public IActionResult Delete(int id) { /*...*/ }
}
```

a

```csharp
[ApiController]
public class GetAllController : ControllerBase
{
  private readonly TodoStore _store;

  public TodosController(TodoStore store)
    => _store = store;

  [HttpGet("todos")]
  public IActionResult GetAll()
  {
    var todos = _store.GetAll();
    if (!todos.Any())
    {
      return NoContent();
    }

    return Ok(todos);
  }
}
```

a

```csharp
public record GetAll(TodoStore store)
  : GetRoute("todos", (req, res) =>
    {
      var todos = store.GetAll();
      return todos;
    });
```

a

```csharp
public class Startup
{
  public void ConfigureServices(IServiceCollection services)
  {
    services.AddRouteRecords();
  }

  public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
  {
    app.UseRouting();
    app.UseEndpoints(endpoints => endpoints.MapRouteRecords());
  }
}
```

a

```csharp
public delegate Task RouteDelegateAsync(HttpRequest req, HttpResponse res);

public abstract record RouteRecord(string Pattern, string Verb, RouteDelegateAsync RouteDelegate);
```

a

```csharp
public abstract record GetRoute(string Pattern, RouteDelegateAsync RouteDelegate)
  : RouteRecord(Pattern, HttpMethods.Get, RouteDelegate);

public abstract record PutRoute(string Pattern, RouteDelegateAsync RouteDelegate)
  : RouteRecord(Pattern, HttpMethods.Put, RouteDelegate);

public abstract record PostRoute(string Pattern, RouteDelegateAsync RouteDelegate)
  : RouteRecord(Pattern, HttpMethods.Post, RouteDelegate);

public abstract record DeleteRoute(string Pattern, RouteDelegateAsync RouteDelegate)
  : RouteRecord(Pattern, HttpMethods.Delete, RouteDelegate);
```

a

```csharp
public static class ServiceCollectionExtensions
{
  public static IServiceCollection AddRouteRecords(this IServiceCollection services)
  {
    Assembly.GetEntryAssembly()
        .GetTypes()
        .Where(type => !type.IsAbstract && typeof(RouteRecord).IsAssignableFrom(type))
        .ToList()
        .ForEach(type =>
        {
          services.AddScoped(type);
          services.AddScoped(s => (RouteRecord)s.GetService(type));
        });

    return services;
  }
}
```

a

```csharp
public static class EndpointRouteBuilderExtensions
{
  public static IEndpointRouteBuilder MapRouteRecords(this IEndpointRouteBuilder endpoints)
  {
    using var scope = endpoints.ServiceProvider.CreateScope();
    scope.ServiceProvider
       .GetServices<RouteRecord>()
       .ToList()
       .ForEach(route =>
       {
         var type = route.GetType();
         endpoints.MapMethods(
           pattern: route.Pattern,
           httpMethods:new[] { route.Verb },
           requestDelegate: ctx =>
           {
             var r = (RouteRecord)ctx.RequestServices.GetService(type);
             return r.RouteDelegate(ctx.Request, ctx.Response);
           });
       });

    return endpoints;
  }
}
```

a

```csharp
public class Startup
{
  public void ConfigureServices(IServiceCollection services)
  {
      services.AddSingleton<TodoStore>();
      services.AddRouteRecords();
  }

  public void Configure(IApplicationBuilder app, IWebHostEnvironment env, TodoStore store)
  {
    // seed data
    for (var i = 0; i < 100; i++)
      store.Insert(new Todo(default, $"demo task {i}", false));
    ////

    app.UseRouting();
    app.UseEndpoints(endpoints => endpoints.MapRouteRecords());
  }
}
```

a

```csharp
public record GetAll(TodoStore store)
  : GetRoute("todos", async (req, res) =>
    {
        var todos = store.GetAll();
        if (!todos.Any())
        {
            res.StatusCode = 204;
            return;
        }

        res.StatusCode = 200;
        await JsonSerializer.SerializeAsync(res.Body, todos);
    });
```

a

```bash
$ curl -k --request GET https://localhost:5001/todos

[{"Id":100,"Title":"demo task 99","IsDone":false},
{"Id":99,"Title":"demo task 98","IsDone":false},
{"Id":98,"Title":"demo task 97","IsDone":false},
{"Id":97,"Title":"demo task 96","IsDone":false},
...
```

a

```csharp
await JsonSerializer.SerializeAsync(
  utf8Json: res.Body,
  value: todos,
  options: new JsonSerializerOptions
  {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
  });
```

a

```bash
$ curl -k --request GET https://localhost:5001/todos

[{"id":100,"title":"demo task 99","isDone":false},
{"id":99,"title":"demo task 98","isDone":false},
{"id":98,"title":"demo task 97","isDone":false},
{"id":97,"title":"demo task 96","isDone":false},
...
```

a

```csharp
public static class HttpResponseExtensions
{
  private static readonly JsonSerializerOptions _jsonOptions
    = new JsonSerializerOptions
      {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
      };

  public static Task JsonAsync<T>(this HttpResponse res, T body)
    => JsonSerializer.SerializeAsync(res.Body, body, _jsonOptions);
}
```

a

```csharp
public record GetAll(TodoStore store)
  : GetRoute("todos", async (req, res) =>
    {
        var todos = store.GetAll();
        if (!todos.Any())
        {
            res.StatusCode = 204;
            return;
        }

        res.StatusCode = 200;
        await res.JsonAsync(todos);
    });
```

a

```csharp
public record GetOne(TodoStore store)
  : GetRoute("todos/{id:int}", async (req, res) =>
    {
      var id = int.Parse((string)req.RouteValues["id"]);
      var todo = store.GetOne(id);
      if (todo == null)
      {
        res.StatusCode = 404;
        return;
      }

      res.StatusCode = 200;
      await res.JsonAsync(todo);
    });
```

a

```bash
$ curl -k --request GET https://localhost:5001/todos/2

{"id":2,"title":"demo task 1","isDone":false}
```

a

```csharp
public static class HttpRequestExtensions
{
  public static T FromRoute<T>(this HttpRequest req, string name)
  {
    var s = (string)req.RouteValues[name];
    var converter = TypeDescriptor.GetConverter(typeof(T));
    return (T)converter.ConvertFrom(s);
  }
}
```

a

```csharp
var id = req.FromRoute<int>("id");
```

a

```csharp
public static class HttpRequestExtensions
{
  private static readonly JsonSerializerOptions _jsonOptions
    = new JsonSerializerOptions
    {
      PropertyNameCaseInsensitive = true
    };

  public static ValueTask<T> FromJsonAsync<T>(this HttpRequest req)
    => JsonSerializer.DeserializeAsync<T>(req.Body, _jsonOptions);
}
```

a

```csharp
public record Post(TodoStore store)
    : PostRoute("todos", async (req, res) =>
      {
          var todo = await req.FromJsonAsync<Todo>();
          if (todo == null)
          {
              res.StatusCode = 400;
              return;
          }

          store.Insert(todo);

          res.StatusCode = 201;
          await res.JsonAsync(new
          {
            Ref = $"todos/{store.Counter}"
          });
      });
```

a

```csharp
public record Put(TodoStore store)
  : PutRoute("todos/{id:int}", async (req, res) =>
    {
        var id = req.FromRoute<int>("id");
        var todo = await req.FromJsonAsync<Todo>();
        if (todo == null)
        {
            res.StatusCode = 400;
            return;
        }

        store.Upsert(id, todo);

        res.StatusCode = 200;
        await res.JsonAsync(todo);
    });
```

a

```csharp
public record Delete(TodoStore store)
  : DeleteRoute("todos/{id:int}", (req, res) =>
    {
        var id = req.FromRoute<int>("id");

        store.Delete(id);

        res.StatusCode = 200;
        return Task.CompletedTask;
    });
```

a

```bash
$ curl -k --request POST --data '{"title":"task 101"}' https://localhost:5001/todos
{"ref":"https://localhost:5001/todos/101"}

$ curl -k --request PUT --data '{"title":"modified"}' https://localhost:5001/todos/101
{"id":0,"title":"modified","isDone":false}

$ curl -k --request GET https://localhost:5001/todos/101
{"id":101,"title":"modified","isDone":false}

$ curl -k -I --request DELETE https://localhost:5001/todos/101
HTTP/1.1 200 OK
Date: Fri, 30 Apr 2021 15:38:39 GMT
Server: Kestrel
Content-Length: 0

$ curl -k -I --request GET https://localhost:5001/todos/101
HTTP/1.1 404 Not Found
Date: Fri, 30 Apr 2021 15:38:42 GMT
Server: Kestrel
Content-Length: 0
```

Standard D2s v3 (2 vcpus, 8 GiB memory)

```bash
BenchmarkDotNet=v0.12.1, OS=ubuntu 20.10
Intel Xeon CPU E5-2673 v4 2.30GHz, 1 CPU, 2 logical cores and 1 physical core
.NET Core SDK=5.0.202
  [Host]     : .NET Core 5.0.5 (CoreCLR 5.0.521.16609, CoreFX 5.0.521.16609), X64 RyuJIT
  DefaultJob : .NET Core 5.0.5 (CoreCLR 5.0.521.16609, CoreFX 5.0.521.16609), X64 RyuJIT
```

a

| Tool              | Method   |     Mean |   %99.9 | Ratio | Allocated |
|--------------     |-------   |---------:|--------:|------:|----------:|
| **Mvc**           |   *POST* | 288.8 us | 8.49 us |  1.00 |  20.04 KB |
| **Route Records** |   *POST* | 167.8 us | 4.72 us |  0.59 |  16.01 KB |
|                   |          |          |         |       |           |
| **Mvc**           |    *GET* | 281.1 us | 5.59 us |  1.00 |  21.27 KB |
| **Route Records** |    *GET* | 257.7 us | 5.12 us |  0.92 |  19.35 KB |
