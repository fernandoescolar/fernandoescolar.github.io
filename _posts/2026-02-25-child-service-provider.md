---
published: true
ID: 202502251
title: 'Child Service Providers'
author: fernandoescolar
post_date: 2026-02-25 01:06:21
layout: post
tags: di dotnet csharp
background: '/assets/uploads/bg/clone.webp'
---

Hay días extraños en los que no tienes nada urgente que hacer.
El backlog está razonablemente bajo control, no hay bugs críticos y el código compila a la primera.

Y es justo en esos momentos cuando aparecen las preguntas más incómodas.<!--break-->

No porque sean importantes.
No porque alguien las haya pedido.
Sino porque empiezan con un “¿y si…?” que no se va de la cabeza.

En uno de esos días, revisando código sin ningún objetivo claro, me encontré pensando en algo muy concreto:
¿por qué en .NET tratamos siempre el `IServiceProvider` como algo monolítico, casi como un objeto final, que solo puede existir de una única forma por contexto?

¿Por qué nunca hablamos de **contenedores de dependencias con herencia**, o de contenedores derivados, como un concepto de primer nivel?

## Contenedores de dependencias… ¿y si pudieran heredarse?

Cuando diseñamos software, la idea de herencia y derivación es algo completamente natural. Definimos una base, la reutilizamos y, cuando hace falta, la extendemos o la especializamos. No duplicamos todo el código solo porque una pequeña parte sea distinta.

Sin embargo, cuando llegamos al terreno del dependency injection, parece que ese modelo mental desaparece.

En la práctica, solemos tratar el contenedor como una estructura cerrada: lo configuras una vez, lo construyes y a partir de ahí todo el sistema depende de ese grafo. Si necesitas variaciones, tiendes a crear otro contenedor completamente nuevo o a introducir lógica condicional dentro del mismo.

Eso funciona, pero tiene un coste: duplicación, pérdida de claridad y, a menudo, una sensación de que el DI empieza a dominar la arquitectura en lugar de acompañarla.

Fue ahí donde empecé a plantearme si el problema no era de herramientas, sino de **cómo conceptualizamos el contenedor**.
¿Y si un `IServiceProvider` pudiera verse como una “clase base” y otros providers como versiones derivadas de ella?

No un contenedor distinto, sino uno que **hereda el comportamiento** y solo redefine lo que cambia.

## Variación sin duplicación

Pensar en términos de contenedores derivados cambia bastante el enfoque.

En lugar de preguntarte “¿cómo creo otro contenedor para este caso?”, empiezas a preguntarte “¿qué parte de este grafo quiero especializar?”. El foco pasa de la configuración completa a la diferencia concreta.

Un provider padre define el comportamiento por defecto.
Los providers hijo se apoyan en él y ajustan lo necesario para un contexto concreto.

Esto no es muy distinto de cómo estructuramos otros aspectos del software, pero aplicado al DI resulta sorprendentemente poco común, al menos en el ecosistema .NET.

Y, curiosamente, cuando adoptas ese modelo mental, muchas discusiones sobre multi-tenant, feature flags o tests se vuelven más sencillas de razonar.

## Del concepto a algo tangible

Con esa idea rondándome la cabeza, decidí llevarla a algo concreto. No para resolver un problema inmediato, sino para comprobar si el concepto de **contenedores de dependencias con herencia** era viable dentro de los límites del contenedor estándar de .NET.

Así nació **ChildServiceProvider**.

La implementación intenta ser lo menos intrusiva posible. No sustituye el contenedor, no introduce nuevas reglas de ciclo de vida ni reinventa nada. Simplemente permite crear una colección de servicios derivada de otra y construir un `IServiceProvider` hijo que se apoya en uno padre.

Un ejemplo sencillo:

```csharp
var parentServices = new ServiceCollection();
parentServices.AddSingleton<IEmailSender, DefaultEmailSender>();
parentServices.AddScoped<IPriceCalculator, StandardPriceCalculator>();

var parentProvider = parentServices.BuildServiceProvider();

var childServices = parentServices.CreateChildServiceCollection();
childServices.AddScoped<IPriceCalculator, ExperimentalPriceCalculator>();

var childProvider = childServices.BuildChildServiceProvider(parentProvider);
```

El provider padre sigue siendo el punto de referencia.
El hijo hereda todo… salvo aquello que decide redefinir.

Conceptualmente, no es muy distinto de crear una subclase que sobrescribe un método.

## ¿Es esto realmente necesario?

Aquí conviene ser honesto.

Sé que todo esto se puede conseguir de otras maneras. Usando varios `IServiceProvider`, gestionando bien los servicios keyed, o diseñando factorías más elaboradas. En muchos casos, esas soluciones son suficientes y probablemente más sencillas.

No tengo claro que este enfoque sea siempre el adecuado, ni que esta librería deba usarse de forma generalizada.

Pero el objetivo nunca fue ese.

El objetivo era responder a una pregunta técnica muy concreta:
**¿es posible modelar contenedores de dependencias derivados en .NET de una forma limpia y coherente?**

Y la respuesta es: sí.

## El valor del experimento

Más allá de la librería en sí, lo que me llevo de este experimento es haber cambiado mi forma de pensar sobre el DI. Dejar de verlo como una configuración estática y empezar a verlo como algo que puede componerse y especializarse.

Aunque nunca uses este código, la idea de **herencia en el grafo de dependencias** puede ser útil en sí misma.

A veces, ese es el verdadero valor de estos retos técnicos.

## El código, por si te apetece mirar dentro

El repositorio está aquí:

👉 [https://github.com/fernandoescolar/ChildServiceProvider](https://github.com/fernandoescolar/ChildServiceProvider)

No pretende ser revolucionario.
No promete resolver todos los problemas de DI.

Es simplemente el resultado de una idea que apareció un día aburrido… y que decidió convertirse en código.
