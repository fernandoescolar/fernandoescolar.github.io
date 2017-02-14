---
published: false
---
Los 90 fueron una década estupenda. En cuanto a videojuegos, quizá sea por la edad, pero creo que eran los mejores. Y aprobechando este momento melancólico decidí volver a jugar al MonKey Island. Una saga que como todos sabreis consta de dos partes. En el que teníamos duelos de espada/insultos delirantes. Pero algunas veces eran combates bastante complejos. Quizá la nueva tecnología me podría ayudar con esto. Dos horas más tarde, el proyecto terminado. He aquí el diario del pirata. Las notas de desarrollo del bot definitivo: El duelo de espadas.<!--break-->

![duelo de espadas - Mokey Island]({{site.baseurl}}/public/uploads/2017/02/monkey-island.png)

##Día 1, 12:00 AM:

Me encuentro en la isla Mêlée. Un pequeño trozo de tierra en medio del caribe. Mi misión convertirme en pirata. Pero no sé por donde empezar.


##Día 1, 12:10 AM:

He encontrado un bar llamado Scumm. Ahí he conocido a [Alex Campos](https://twitter.com/alejacma "Alex Campos"). Me ha dado mucha información. Me ha hablado de tres pruebas que tres piratas iban a proponerme. Y me ha dicho como superarlas. Necesitaré buscar todas las frases posibles de duelos de insultos, algo llamado Question And Answers, Azure Bot Services y un pollo con polea.


##Día 1, 12:30 AM:

Una navegación rápida por la Deep Web me ha aporado todo el material que necesito. Unas 60 frases y sus respuestas. Solo he tenido que regerlas y formatearlas. Tarea sencilla. Una línea por cada una con el siguiente formato: 

```
Frase <TAB> Respuesta <TAB> Juego
```

##Día 1, 12:50 AM:

Ya he encontrado toda la informacion sobre esa magia oscura llamada QnA Maker de Microsoft. Todas las pistas me han dirigido a su [página web](https://qnamaker.ai/ "QnA Maker"). Parece ser que siguiendo unos pequeños pasos e importando la información que he recolectado anteriormente, conseguiré un sistema que responda adecuadamente a cada frase de un duelo de Monkey Island.

##Día 1, 12:52 AM:

He creado un nuevo servicio con QnA Maker. Ahí he puesto el nombre de mi aplicación: "Duelo de Espadas".

![QnA Maker - new service]({{site.baseurl}}/public/uploads/2017/02/qna-create.PNG)