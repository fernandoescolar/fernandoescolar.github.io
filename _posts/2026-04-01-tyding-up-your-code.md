---
published: true
ID: 202604011
title: 'Tidying up your code'
author: fernandoescolar
post_date: 2026-04-01 02:15:54
layout: post
tags: solid best-practices
background: '/assets/uploads/bg/organize.webp'
---

A los desarrolladores nos sobra ego. Mucho. Nos gusta pensar que nuestro código es especial, que nuestras decisiones técnicas tienen algo de irrepetible y que, si alguien osa tocarlo sin cuidado, el sistema colapsaría<!--break-->. La realidad es bastante menos épica: casi cualquier solución técnica que aporte valor puede ser replicada rápido. El valor no está en el código, sino en **la funcionalidad que entrega y en lo caro que resulta cambiarla con el tiempo**.

Esta idea no nace de la nada. Aparece una y otra vez en las reflexiones de este blog, con distintos nombres y enfoques, porque termina siendo siempre la misma conclusión.

## El software no es código, es gente

Diseñar software no es un problema técnico. Es un problema humano: equipos, comunicación, expectativas, incentivos y dinero. Cuando un sistema empieza a doler, casi nunca es por un framework o lenguaje equivocado, sino porque **no hay alineación entre quienes esperan resultados y quienes pueden implementarlos**.

![trabajo en equipo](/assets/uploads/2026/03/team.webp)

Este es el mismo patrón que ya exploramos cuando hablábamos de [¿Qué podemos esperar de nuestra Manager?](https://www.developerro.com/2023/03/08/nuestra-manager/): los problemas “técnicos” son casi siempre conflictos humanos disfrazados de errores sintácticos. El código solo termina reflejando decisiones, compromisos y tensiones humanas.

Y de esa desalineación surgen siempre las mismas preguntas: **cuánto cuesta** y **cuándo estará**.

## Desarrollo continuo

Una idea sencilla pero transformadora: **si el desarrollo es verdaderamente continuo, el tiempo deja de ser la variable principal**. El tiempo siempre avanza igual. Lo que cambia es cuánto cuesta cada cambio.

Si pensamos en desarrollo como un flujo constante de evoluciones (no como proyectos cerrados), entendemos que la cuestión real no es “cuánto tardará esto”, sino **cuánto costará cambiarlo cuando lo necesitemos**. Y esa distinción es la que explica por qué un sistema “funciona” hoy y se vuelve una pesadilla mañana.

> Cuando entendemos el desarrollo como algo continuo queda claro que el verdadero factor de desalineación no es el tiempo, es el dinero.

Esto conecta directamente con reflexiones que ya hicimos cuando hablábamos de [High underperformance code](https://www.developerro.com/video/2022/11/18/high/), donde la “velocidad” aparente escondía en realidad una degradación continua del sistema.

## El coste real del software

El desarrollo inicial de un sistema suele ser relativamente barato. A veces incluso es gratis, o casi: MVPs, prototipos, pruebas de mercado, primeras versiones hechas con más ilusión que presupuesto. El problema empieza después, cuando el sistema ya está en producción y alguien dice la frase maldita: “¿y si ahora cambiamos esto?”.

Los cambios pequeños son casi gratuitos. Los cambios grandes son caros, lentos y peligrosos. No porque sean conceptualmente complejos, sino porque obligan a tocar muchas piezas a la vez, en lugares que ya nadie recuerda del todo bien.

![cálculos](/assets/uploads/2026/03/maths.webp)

Esto no deja de ser una forma práctica de hablar de [deuda técnica](https://www.developerro.com/2012/05/29/deuda-tecnica/): un sistema va acumulando atajos, decisiones difíciles de revertir y soluciones parciales que terminan encareciendo cualquier cambio futuro. Y aunque el término pueda sonar a metáfora entretenida, la idea es bastante simple: **lo que hoy parece pequeño, mañana puede costar una fortuna en esfuerzo y coordinación**.

Ese es el coste real del software: **el coste de los cambios grandes**. Y ese coste crece casi siempre por la misma razón.

## Acoplar o desacoplar no es gratis

El culpable habitual se llama acoplamiento. Cuanto más acoplado está un sistema, más caro resulta modificarlo. Hasta aquí, nada nuevo. Lo interesante es lo que viene después.

Aquí conviene huir del pensamiento binario. Acoplar no es automáticamente malo, y desacoplar no es automáticamente bueno. El problema surge cuando aplicamos recetas sin contexto. En la serie [SOLID menos mola](https://www.developerro.com/video/2020/10/15/solid-menos-mola/) —y en particular en [SOLID menos mola (S)](https://www.developerro.com/2020/09/16/solid-menos-mola-s/), [SOLID menos mola (O)](https://www.developerro.com/2020/09/23/solid-menos-mola-o/), [SOLID menos mola (L)](https://www.developerro.com/2020/09/30/solid-menos-mola-l/), [SOLID menos mola (I)](https://www.developerro.com/2020/10/06/solid-menos-mola-i/) y [SOLID menos mola (D)](https://www.developerro.com/2020/10/14/solid-menos-mola-d/)— ya exploramos cómo los principios clásicos pueden ayudar, pero también confundir si se aplican sin criterio.

Acoplar no es pecado. Acoplar permite avanzar rápido, reducir diseño prematuro y centrarse en el problema que toca hoy. Desacoplar tampoco es gratis: introduce abstracciones, complejidad accidental y, en muchos casos, un coste inmediato que alguien tiene que pagar.

El problema no es acoplar o desacoplar. El problema es hacerlo sin entender el contexto, sin saber qué se gana y qué se pierde en cada decisión. El diseño de software no va de aplicar dogmas, va de equilibrio consciente. Y ese equilibrio cambia con el tiempo, el equipo y el producto.

Un principio por sí solo no resuelve el problema de fondo: entender qué costará mantener y cambiar ese código en el futuro. A veces acoplar conscientemente —para simplificar, reducir fricción o acelerar una entrega— es la decisión correcta. Otras veces desacoplar ayuda. La clave está en saber **qué pierdes, qué ganas y a qué coste**.

## Software, dinero y opciones

Desde el punto de vista económico, las reglas son simples: el dinero está mejor en caja que gastado, gastar más tarde suele ser preferible a gastar antes y tener opciones abiertas vale mucho.

Un sistema que permite cambios pequeños, frecuentes y baratos encaja perfectamente con esas reglas. Permite retrasar decisiones costosas, reducir el riesgo de apuestas grandes y cambiar de dirección cuando la realidad —que siempre llega— contradice los planes iniciales.

Esta misma idea ya aparecía, de forma indirecta, cuando reflexionábamos sobre productividad y herramientas en [Copilot un año más tarde](https://www.developerro.com/video/2022/09/14/tras-copilot/): la velocidad sin control no reduce el coste, simplemente lo desplaza.

Visto así, buen diseño de software y buena gestión financiera no son enemigos naturales. Comparten más objetivos de los que solemos admitir.

## Tidying: pequeños cambios que lo cambian todo

Aquí llegamos a la idea central: **tidying**. Inspirado en el libro [Tidy First? A Personal Exercise in Empirical Software Design](https://www.oreilly.com/library/view/tidy-first/9781098151232/) de [Kent Beck](https://kentbeck.com/) (O’Reilly Media, ISBN 978-1098151240), el tidying no es refactoring masivo ni rediseñar arquitecturas porque “ya toca”. Es algo mucho más humilde y, precisamente por eso, más efectivo.

Tidying son pequeños cambios locales que no alteran el comportamiento del sistema, pero mejoran su legibilidad, su cohesión y su capacidad de adaptación. Cambios tan pequeños que su coste es prácticamente despreciable, pero que reducen de forma acumulativa el coste de los cambios futuros.

La idea es simple: ya que estás tocando ese código, déjalo un poco mejor de como lo encontraste. Primero tidying, luego la funcionalidad. No para alcanzar la perfección, sino para que el siguiente cambio no sea más caro de lo necesario.

## Cohesión antes que heroicidad

Muchos sistemas no sufren por falta de abstracciones sofisticadas, sino por falta de cohesión. Código repartido en capas, carpetas y módulos que obligan a saltar constantemente para entender una sola funcionalidad. Arquitecturas “correctas” que hacen el código más difícil de seguir.

![complejidad](/assets/uploads/2026/03/complexity.webp)

A veces mejorar el diseño no significa separar más, sino **juntar lo que conceptualmente pertenece junto**. Menos heroicidad arquitectónica y más sentido común. Esta idea conecta directamente con lo que ya discutimos en [SOLID menos mola (I)](https://www.developerro.com/2020/10/06/solid-menos-mola-i/): no es malo aplicar principios, es malo aplicarlos sin entender el coste real que implican.

La cohesión hace que el código se lea como una historia, se entienda más rápido y, por tanto, sea más barato de cambiar.

## Cambiar de opinión es buena señal

Otra idea que conviene normalizar: **cambiar de opinión no es un fracaso**. Decisiones que ayer parecían buenas pueden dejar de serlo cuando el contexto cambia. Cambiar una arquitectura, una tecnología o un enfoque no es traicionar el pasado, es reconocer que se ha aprendido algo nuevo.

Lo peligroso no es cambiar, sino dejar que el código se degrade porque “total, ya está mal”. Aquí entra la metáfora de la [teoría de las ventanas rotas](https://es.wikipedia.org/wiki/Teor%C3%ADa_de_las_ventanas_rotas), introducida por James Q. Wilson y George L. Kelling en 1982, y aplicada muchas veces al desarrollo de software para explicar cómo pequeños defectos visibles acaban normalizando el desorden.

![ventanas rotas](/assets/uploads/2026/03/broken-windows.webp)

En este contexto, arreglar esas “ventanas rotas” tan pronto como aparecen evita que la calidad se deteriore y que las malas prácticas se conviertan en norma. Es menos épico que un gran refactor, pero casi siempre más eficaz.

## Conclusión

Diseñar software no va de escribir código perfecto ni de demostrar lo listo que eres. Va de **reducir el coste del cambio**, mantener opciones abiertas y trabajar mejor con las personas que dependen de ese software hoy y mañana.

Los pequeños cambios constantes suelen ganar a los grandes refactors esporádicos.
> Menos ego, más **pragmatismo**.<br>
> Menos drama, más *tidying*.
