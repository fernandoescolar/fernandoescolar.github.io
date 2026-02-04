---
published: true
ID: 202410261
title: 'Tidying up your code'
author: fernandoescolar
post_date: 2024-10-26 23:16:54
layout: post
categories: video
tags: solid best-practices
background: '/assets/uploads/bg/clean.jpg'
---

Durante la [SCBCN24](https://softwarecrafters.barcelona/2024/index.html) tuve la oportunidad de presentar esta charla titulada *Tidying up your code*. Cortesía de la última creación de Kent Beck de 2023, «Tidy First?», vamos a sumergirnos en las cuestiones más importantes del diseño de software y proponer algunas técnicas que nos ayudarán a tener mejor código<!--break-->.

En esta charla defiendo una idea poco popular entre desarrolladores: **nuestro código no es tan especial**. La mayoría de soluciones técnicas pueden copiarse rápido y, al final, lo único que importa es **la funcionalidad que entregamos**, no lo bonitos que sean nuestros patrones.

Diseñar software no es un problema técnico, es un problema **humano y económico**. Equipos, comunicación, expectativas y dinero. La desalineación entre quienes esperan resultados y quienes hacen los cambios siempre acaba en las mismas dos preguntas: *cuánto cuesta* y *cuándo estará*.

El coste real del software no es el desarrollo inicial, sino **el coste de los cambios grandes**, que casi siempre viene del acoplamiento. Desacoplar ayuda, pero no es magia: **acoplar a veces es la decisión correcta** si te permite avanzar más rápido. El error está en no saber por qué lo haces.

A partir de ahí hablo de **tidying** (inspirado en *Tidy First* de Kent Beck): pequeños cambios locales, baratos y continuos que no cambian el comportamiento, pero hacen el código más legible, más cohesionado y menos frágil. No es refactoring masivo ni rediseñar arquitecturas “porque toca”, sino preparar el código para que los cambios futuros cuesten menos.

La idea es simple: **si tratas el software como un sistema vivo y haces pequeñas mejoras constantes, reduces el coste del cambio y el drama asociado**. Menos miedo, menos refactors traumáticos y menos fricción con negocio y finanzas.

El vídeo de la charla está aquí debajo.

<iframe class="youtube" src="https://www.youtube.com/embed/fFWM-ZTHjCA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
