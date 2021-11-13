---
published: true
ID: 202111161
title: 'Novedades Asp.Net Core 6.0'
author: fernandoescolar
post_date: 2021-11-16 01:05:31
layout: post
tags: aspnet net6 dotnet
background: '/assets/uploads/bg/programming1.jpg'
---

```csharp
one single file startup
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

```csharp
namespace MyFirstAspNet6App;

public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddRouting();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        else
        {
            app.UseExceptionHandler("/Error");
        }

        app.UseHttpsRedirection();
        app.UseRouting();
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
```

Imports.cs

```csharp
global using Microsoft.AspNetCore.Mvc;
```
## minimal api

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.MapGet("/", () => "Hello World!");

app.Run();
```

swagger

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/", () => "Hello World!");

app.Run();
```

```csharp
app.MapGet("/WeatherForecast", () => {
    var summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };
    var rng = new Random();
    return Enumerable.Range(1, 5).Select(index => new WeatherForecast (
        Date: DateTime.Now.AddDays(index),
        TemperatureC: rng.Next(-20, 55),
        Summary: summaries[rng.Next(summaries.Length)]
    )).ToArray();
});
```

```csharp
interface IMyService
{
    ValueTask<string> GetStringAsync();
}

class MyService : IMyService
{
    public ValueTask<string> GetStringAsync()
        => ValueTask.FromResult("Hello World!");
}
```

```csharp
builder.Services.AddSingleton<IMyService, MyService>();
```

```csharp
using Microsoft.AspNetCore.Mvc;
```

```csharp
app.MapGet("/test", async ([FromServices]ILogger<IMyService> logger, [FromServices]IMyService service) => {
    logger.LogInformation("'test' endpoint called");
    var message = await service.GetStringAsync();
    return new { message };
});
```

```csharp
app.MapGet("/test2", async (HttpContext ctx) => {
    var service = ctx.RequestServices.GetRequiredService<IMyService>();
    var message = await service.GetStringAsync();
    return new { message };
});
```

```csharp
app.MapGet("/test3", async (HttpRequest req, HttpResponse res) => {
    var service = req.HttpContext.RequestServices.GetRequiredService<IMyService>();
    var message = await service.GetStringAsync();
    res.StatusCode = 200;
    await res.WriteAsJsonAsync(new { message });
});
```

```csharp
app.MapGet("/test4", async (HttpRequest req, HttpResponse res, IMyService service) => {
    var message = await service.GetStringAsync();
     res.StatusCode = 201;
    await res.WriteAsJsonAsync(new { message });
});
```

```csharp
app.MapGet("/test5", async (HttpRequest req, HttpResponse res, IMyService service, CancellationToken cancellationToken) => {
    var isTheSame = cancellationToken == req.HttpContext.RequestAborted;
    var message = await service.GetStringAsync();
     res.StatusCode = 200;
    await res.WriteAsJsonAsync(new { message });
});
```

```csharp
app.MapPost("/test", async ([FromBody]Request request, [FromServices]ILogger<IMyService> logger, [FromServices]IMyService service) => {
    logger.LogInformation("'test' endpoint called");
    var message = await service.GetStringAsync() + " " + request.Name;
    return new { message };
});
```

<iframe class="youtube" src="https://www.youtube.com/embed/BU8_8u1HPl8" frameborder="0" allowfullscreen="true" scrolling="no"></iframe>