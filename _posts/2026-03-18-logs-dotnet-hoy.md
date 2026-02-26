---
published: true
ID: 202603181
title: 'Hacer logs en .NET hoy'
author: fernandoescolar
post_date: 2026-03-18 01:06:21
layout: post
tags: observability dotnet csharp
background: '/assets/uploads/bg/programming4.webp'
---

Después de unos cuantos años trabajando con aplicaciones .NET en producción, uno acaba desarrollando cierto respeto por los logs. No porque sean una pieza especialmente elegante del sistema, sino porque suelen ser lo único que queda cuando algo va mal y no hay forma rápida de reproducirlo.<!--break-->

Muchas de las decisiones que tomamos al principio sobre logging parecen inofensivas. Funcionan, no rompen nada y el código compila. El problema es que los efectos de esas decisiones no se notan hasta mucho más tarde, cuando el sistema crece, hay más tráfico, más servicios y más gente intentando entender qué está pasando. Las ideas que siguen no son grandes revelaciones, sino pequeñas lecciones que suelen aparecer después de unas cuantas noches revisando logs con cara de pocos amigos.

- [Los logs son eventos](#los-logs-son-eventos)
- [LoggerMessageAttribute no es solo ahorrar líneas de código](#loggermessageattribute-no-es-solo-ahorrar-líneas-de-código)
- [Mensajes específicos mejoran la agregación](#mensajes-específicos-mejoran-la-agregación)
- [El EventId mola](#el-eventid-mola)
- [El nivel de log importa](#el-nivel-de-log-importa)
- [Menos logs, pero mejores](#menos-logs-pero-mejores)
- [Los logs genéricos son el último recurso](#los-logs-genéricos-son-el-último-recurso)
- [Conclusión](#conclusión)


## Los logs son eventos

Durante bastante tiempo traté los logs como simples mensajes de texto. Algo había pasado, así que lo describía con una frase más o menos clara y listo. El problema de ese enfoque es que, fuera del código, esos mensajes dejan de ser “frases” y pasan a ser datos.

Por ejemplo, algo tan habitual como esto:

```csharp
logger.LogError("Authorization header missing");
```

funciona, pero no dice mucho al sistema que hay detrás. Es solo texto.

Con el tiempo empecé a pensar en estos logs como eventos que merecen nombre propio. Algo más parecido a esto:

```csharp
[LoggerMessage(
    EventId = 1001,
    Level = LogLevel.Error,
    Message = "Authorization header was not found")]
public static partial void AuthorizationHeaderNotFound(this ILogger logger);
```

No es que este código sea mágico, pero obliga a tomar una decisión: este evento existe, tiene sentido y quiero poder identificarlo más adelante. Esa simple diferencia cambia bastante la forma en la que luego se usan los logs.

## LoggerMessageAttribute no es solo ahorrar líneas de código

Al principio me interesé por `LoggerMessageAttribute` por los motivos habituales: menos allocations, mejor rendimiento y menos trabajo para el GC. Todo eso está bien y es cierto, pero con el uso continuado me di cuenta de que lo más interesante no era eso.

Lo realmente útil es que te empuja a definir explícitamente qué eventos existen en tu sistema. Cuando escribes algo como:

```csharp
logger.LogError("Something went wrong");
```

es muy fácil posponer decisiones. Cuando defines un método así:

```csharp
[LoggerMessage(
    EventId = 2001,
    Level = LogLevel.Warning,
    Message = "User does not have access to resource {ResourceId}")]
public static partial void UserAccessDenied(this ILogger logger, string resourceId);
```

estás diciendo: este caso es suficientemente relevante como para tener identidad propia. Con el tiempo, ese tipo de decisiones hacen que el logging sea más coherente y más fácil de mantener.

## Mensajes específicos mejoran la agregación

Uno de los problemas más evidentes que encontré al analizar logs en sistemas medianos fue la dificultad para agrupar errores que, conceptualmente, eran el mismo. Cada pequeño cambio en el texto del mensaje rompía cualquier intento de agregación.

Un ejemplo típico sería algo como esto:

```csharp
logger.LogWarning($"User {userId} cannot access resource {resourceId}");
```

A nivel humano es claro, pero a nivel de sistema cada combinación de usuario y recurso genera un mensaje distinto.

Mover la variabilidad a propiedades estructuradas cambia completamente el escenario:

```csharp
logger.LogWarning(
    "User cannot access resource {ResourceId}. UserId: {UserId}",
    resourceId,
    userId);
```

O, mejor aún, con `LoggerMessageAttribute`. A partir de ahí, el sistema empieza a ver un único evento que ocurre muchas veces, en lugar de miles de mensajes distintos que solo se parecen entre sí.

## El EventId mola

Durante bastante tiempo ignoré el `EventId`. Estaba ahí, pero no parecía aportar gran cosa. Eso cambió cuando empezamos a montar alertas y métricas basadas en logs.

Un `EventId` estable permite hacer cosas como contar cuántas veces ocurre un evento concreto sin depender del texto exacto del mensaje. Por ejemplo:

```csharp
[LoggerMessage(
    EventId = 3001,
    Level = LogLevel.Error,
    Message = "Database connection failed")]
public static partial void DatabaseConnectionFailed(this ILogger logger);
```

Aunque mañana se cambie el texto para hacerlo más descriptivo, el evento sigue siendo el mismo. Esa estabilidad es muy útil cuando el sistema crece y los logs empiezan a alimentar otros procesos.

## El nivel de log importa

Otra lección aprendida a base de experiencia es que los niveles de log no son un detalle menor. Al principio es tentador marcar muchas cosas como `Error`, simplemente porque algo no ha salido como se esperaba.

Con el tiempo se aprende que eso acaba generando ruido y falsas alarmas. Un fallo esperado, como una credencial inválida, suele encajar mejor como `Warning` o incluso `Information`, dependiendo del contexto:

```csharp
[LoggerMessage(
    EventId = 4001,
    Level = LogLevel.Warning,
    Message = "Invalid credentials provided for user {UserId}")]
public static partial void InvalidCredentials(this ILogger logger, string userId);
```

Reservar `Error` para situaciones que realmente requieren atención hace que los logs sean mucho más útiles cuando se revisan bajo presión.

## Menos logs, pero mejores

También aprendí que añadir logs “por si acaso” rara vez es una buena estrategia a largo plazo. En sistemas grandes, el exceso de información acaba siendo tan problemático como la falta de ella.

Con el tiempo he acabado prefiriendo menos logs, pero más pensados. Logs que aparecen en puntos clave y que aportan contexto real sobre lo que ha ocurrido, en lugar de una narración exhaustiva de cada paso del código.

No siempre se acierta a la primera, pero ajustar y eliminar logs irrelevantes suele mejorar mucho la señal frente al ruido.

## Los logs genéricos son el último recurso

Eso no significa que los logs genéricos no tengan su lugar. Hay situaciones —errores que vienen de sistemas externos, reglas dinámicas, configuraciones que cambian— en las que no es práctico definir un evento específico para cada caso.

En esos escenarios, un log más genérico puede ser suficiente, siempre que se use con cierta disciplina:

```csharp
[LoggerMessage(
    EventId = 9000,
    Level = LogLevel.Error,
    Message = "External system error: {Message}")]
public static partial void ExternalSystemError(this ILogger logger, string message);
```

La experiencia me ha enseñado que lo importante es que este tipo de logs sean la excepción y no el patrón principal. Cuando todo es genérico, nada lo es realmente.

## Conclusión

Estas ideas no pretenden ser reglas universales ni soluciones mágicas. Son más bien conclusiones que suelen aparecer después de convivir con sistemas en producción durante un tiempo y de ver qué cosas facilitan el diagnóstico y cuáles lo complican innecesariamente.

Tratar los logs como eventos, darles identidad, cuidar su nivel y su estructura no garantiza que los problemas desaparezcan. Pero sí hace que, cuando aparezcan, sea bastante más fácil entender qué ha pasado y por dónde empezar a mirar.
