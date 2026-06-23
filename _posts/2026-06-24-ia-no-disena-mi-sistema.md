---
published: true
ID: 2026062401
title: 'La IA no diseña mi sistema'
author: fernandoescolar
post_date: 2026-06-24 01:15:54
layout: post
tags: golang csharp proxy
background: '/assets/uploads/bg/network.webp'
---

Desde que las IAs y los asistentes de código basados en estas han dejado de ser *"gratis"* y las grandes corporaciones han empezado a comportarse como lo que siempre fueron (empresas que venden software ejecutándose en ordenadores absurdamente caros), ha empezado a escucharse una crítica que me parece equivocada.<!--break-->

Que si malgastamos tokens. Que usamos agentes de código para tareas demasiado simples. Que si renombrar variables, que si ordenar imports, que si separar funciones, que si limpiar una clase que lleva tres años acumulando pequeñas decisiones desafortunadas como quien guarda cables en un cajón. Que eso no merece una IA. Que para eso ya estamos nosotros.

Y justo ahí es donde *IMHO* creo que la crítica se equivoca.

Porque precisamente para eso quiero yo la IA.

No quiero un agente de código para que me diseñe un sistema distribuido. No quiero que decida por mí dónde están los límites de un bounded context, cómo fluyen los eventos, qué consistencia necesito, qué partes pueden fallar o qué deuda técnica merece la pena asumir hoy para no arruinar mañana al equipo. Eso quiero pensarlo yo. No porque la IA no pueda ayudar. Puede ayudar. Puede contrastar ideas, buscar incoherencias, hacer de pato de goma con complejo de superioridad estadística. Pero la decisión quiero tomarla yo.

Porque esa es la parte divertida.

La parte que me interesa del desarrollo no es apretar teclas hasta que aparece código. Eso lo puede hacer mucha gente. Algunas incluso con más paciencia que yo. Lo interesante es entender el problema, modelarlo, discutir con la realidad, elegir compromisos y aceptar que cualquier decisión técnica decente es, en el fondo, una forma elegante de perder algo para ganar otra cosa.

Ahí es donde quiero estar.

## Craftmanship

A los desarrolladores nos gusta mucho hablar de artesanía. De oficio. De criterio. De experiencia. De ese momento casi místico en el que miras un problema, entrecierras los ojos y dices: *"esto huele a acoplamiento accidental"*. Somos así. Tenemos nuestras cosas.

Pero luego confundimos artesanía con hacerlo todo a mano.

Y no es lo mismo.

Un carpintero no pierde dignidad por usar una lijadora. Un mecánico no traiciona el oficio por usar una herramienta neumática. Un cocinero no deja de saber cocinar porque tenga lavavajillas. Aunque esto último, por algún motivo, parece más fácil de entender en una cocina que en un repositorio con trescientas mil líneas de código y un `utils` que debería ser investigado por Naciones Unidas.

Hay tareas que forman parte del trabajo, sí. Pero no todas aportan el mismo valor. No todas requieren el mismo nivel de atención. No todas merecen la misma energía mental.

Refactorizar código puede ser una actividad profundamente intelectual cuando implica cambiar la estructura de un sistema sin cambiar su comportamiento, reduciendo el coste del cambio futuro y preparando el terreno para lo que viene después. Pero también puede ser una sucesión interminable de microtareas perfectamente aburridas: mover funciones, extraer métodos, eliminar duplicaciones evidentes, corregir nombres, ordenar responsabilidades locales, actualizar tests, adaptar llamadas, limpiar residuos.

Eso no es épica.

Eso es pasar la escoba.

Y yo estoy encantado de pagar tokens para que alguien (o algo) pase la escoba.

## Inversión de valor

La reacción habitual cuando los agentes empiezan a consumir más tokens es intentar reservarlos para las tareas "importantes". Parece lógico. Si algo cuesta dinero, úsalo solo para lo difícil.

Pero quizá estamos mirando mal el problema.

Una tarea difícil no siempre es una buena candidata para delegar. Una tarea aburrida, repetitiva y de bajo valor diferencial, sí. Sobre todo si además es una tarea que solemos posponer porque nos agota, porque rompe el ritmo o porque nos obliga a dedicar media tarde a limpiar algo que sabemos que debería estar limpio, pero que nunca parece suficientemente urgente.

Ahí la IA tiene mucho sentido.

No porque sea brillante. Precisamente porque no necesito que lo sea.

Necesito que sea obediente, incansable y razonablemente cuidadosa. Necesito que pueda hacer veinte pequeños cambios mecánicos mientras yo reviso el resultado con criterio. Necesito que convierta una tarde de tedio en una revisión de diff. Que no es la felicidad absoluta, de acuerdo, pero se le parece bastante más que renombrar a mano cuarenta variantes de `data`, `result`, `item`, `obj` y ese clásico inmortal: `manager`.

Cuando uso un agente para limpiar código, no estoy pagando para que piense por mí. Estoy pagando para no gastar mi cabeza en una tarea donde mi cabeza aporta poco.

Y eso me parece una buena inversión.

## I ❤️ coding

Hay una parte del desarrollo que no quiero perder. La parte de sentarse delante de un problema y empezar a encontrarle forma. La parte de equivocarse en una pizarra antes de equivocarse en producción. La parte de hablar con negocio, entender restricciones, descubrir que el problema real no era técnico y aun así terminar diseñando algo que tendrá que convivir con Kubernetes, legacy, presupuestos, egos, deadlines y algún Excel que nadie se atreve a apagar.

Eso no quiero delegarlo.

No porque tenga una visión romántica del programador como genio solitario. Esa película ya la hemos visto y normalmente acaba con un monolito emocionalmente inestable. No. Lo quiero hacer yo porque ahí es donde está el criterio. Ahí es donde mi experiencia sí aporta algo distinto. Ahí es donde haber visto sistemas romperse de maneras creativas sirve para no repetir algunas tonterías. No todas, porque tampoco conviene ponerse arrogante. Pero algunas.

La IA puede ayudarme en esa fase. Puede hacer preguntas. Puede señalar riesgos. Puede proponer alternativas. Puede recordarme que quizá no necesito *Nats* para enviar tres notificaciones al día, aunque siempre duela escucharlo. Pero no quiero que tome la decisión.

Quiero que me acompañe.

No que me sustituya en la parte que precisamente hace que este oficio siga siendo interesante después de tantos años.

## Gastar tokens

Quizá el problema es que seguimos midiendo mal el prestigio de las tareas.

Pensamos que gastar IA en tareas simples es desperdiciar capacidad. Pero en la vida real pagamos constantemente para no hacer tareas simples. Compramos lavadoras, lavavajillas, robots aspiradores, herramientas eléctricas, scripts, pipelines, generadores de código, plantillas, scaffolding y cualquier cosa que nos aleje un poco de la repetición innecesaria.

Nadie dice: *"qué vergüenza usar CI para ejecutar tests, eso deberías hacerlo tú a mano, que para eso eres ingeniero"*.

Bueno, alguien lo dirá. Siempre hay alguien. Pero no le invitamos a las reuniones importantes ;P.

Usar IA para refactorizar código aburrido no es malgastar tokens. Es asumir que mi atención también tiene coste. Que mi paciencia también tiene límites. Que después de ocho horas tomando decisiones, revisar PRs, entender bugs, hablar con gente y pelear con sistemas que funcionan *"excepto cuando no"*, quizá no quiero dedicar mi última reserva mental a convertir una función de 200 líneas en cinco funciones de 40.

Prefiero revisar que la IA lo haya hecho bien.

Prefiero conservar energía para decidir qué hay que hacer después.

## Conclusión

La pregunta no es si la IA debe programar o no debe programar. Esa pregunta ya llega tarde, como casi todas las discusiones binarias en tecnología.

La pregunta interesante es otra: **qué parte del trabajo queremos proteger**.

Yo quiero proteger el diseño. El criterio. La comprensión del problema. La conversación con la realidad. La decisión incómoda. El compromiso técnico consciente. La arquitectura que no sale de aplicar un patrón, sino de entender qué duele hoy y qué dolerá mañana.

Lo demás, si puede automatizarse razonablemente, que se automatice.

Que limpie.

Que ordene.

Que renombre.

Que actualice tests.

Que quite ruido.

Que me deje el código un poco mejor de como lo encontró.

Y si para eso tengo que gastar tokens, me parece bien. Prefiero gastarlos en limpiar el camino que en pedirle a la IA que lo recorra por mí.
