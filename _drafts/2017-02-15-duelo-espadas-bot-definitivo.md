---
published: false
---
Los 90 fueron una década estupenda. En cuanto a videojuegos, quizá sea por la edad, pero creo que eran los mejores. Y aprovechando este momento melancólico decidí volver a jugar al Monkey Island. Una saga que como todos sabréis consta de dos partes. En el que teníamos duelos de espada/insultos delirantes. Pero algunas veces eran combates bastante complejos. Quizá la nueva tecnología me podría ayudar con esto. Dos horas más tarde, el proyecto terminado. He aquí el diario del pirata. Las notas de desarrollo del bot definitivo: El duelo de espadas.<!--break-->

![duelo de espadas - Mokey Island]({{site.baseurl}}/public/uploads/2017/02/monkey-island.png)


##02:00 PM, Día 1:

Me encuentro en la isla Mêlée. Un pequeño trozo de tierra en medio del caribe. Mi misión convertirme en pirata. Pero no sé por dónde empezar.


##02:10 PM, Día 1:

He encontrado un bar llamado Scumm. Ahí he conocido a [Alex Campos](https://twitter.com/alejacma "Alex Campos"). Me ha dado mucha información. Me ha hablado de tres pruebas que tres piratas iban a proponerme. Y me ha dicho como superarlas. Necesitaré buscar todas las frases posibles de duelos de insultos, algo llamado Question And Answers, Azure Bot Services y un pollo con polea.


##02:30 PM, Día 1:

Una navegación rápida por la Deep Web me ha aportado todo el material que necesito. Unas 60 frases y sus respuestas. Solo he tenido que recogerlas y formatearlas. Tarea sencilla. Una línea por cada una con el siguiente formato: 

```
Frase <TAB> Respuesta <TAB> Juego
```

[Aquí está el resultado]({{site.baseurl}}/public/uploads/2017/02/duelo-espadas.txt "duelo-espadas.txt").


##02:50 PM, Día 1:

Ya he encontrado toda la información sobre esa magia oscura llamada QnA Maker de Microsoft. Todas las pistas me han dirigido a su [página web](https://qnamaker.ai/ "QnA Maker"). Parece ser que siguiendo unos pequeños pasos e importando la información que he recolectado anteriormente, conseguiré un sistema que responda adecuadamente a cada frase de un duelo de Monkey Island.


##02:52 PM, Día 1:

He creado un nuevo servicio con QnA Maker. Ahí he puesto el nombre de mi aplicación: "Duelo de Espadas".

![QnA Maker - new service]({{site.baseurl}}/public/uploads/2017/02/qna-create.PNG)


##02:53 PM, Día 1:

En la sección donde me ha solicitado archivos FAQ, he insertado el archivo formateado resultado de mi recolección de frases de duelo de insultos.

![QnA Maker - add formated files]({{site.baseurl}}/public/uploads/2017/02/qna-create-files.PNG)


##02:55 PM, Día 1:

Después de crear el nuevo servicio he comprobado que había importado los datos que le he pasado. Los ha clasificado correctamente.

![QnA Maker - knowledgebase]({{site.baseurl}}/public/uploads/2017/02/qna-create-knowledgebase.PNG)


##02:56 PM, Día 1:

He encontrado una funcionalidad genial. Desde la parte de test de QnA Maker, no solo puedes probar tu api. También puedes entrenarla, añadiendo diferentes formas de realizar la misma pregunta:

![QnA Maker - training]({{site.baseurl}}/public/uploads/2017/02/qna-create-training.PNG)


##03:00 PM, Día 1:

Me he adentrado en un nuevo lugar: [el portal de azure](https://portal.azure.com "Azure Portal"). Dentro de sus laberínticos menús he hallado el recurso definitivo: Bot Services. Así que he decido crear uno nuevo. Estoy esperando a que termine el deploy.

![Azure Bot Services - Create]({{site.baseurl}}/public/uploads/2017/02/azure-bot-service-2.PNG)


##03:05 PM, Día 1:

Al abrir el recurso nuevo, he tenido que añadir un App ID y un password que la propia plataforma me ha ido generando a través de un wizard.

![Bot Service - Add Id and Password]({{site.baseurl}}/public/uploads/2017/02/azure-bot-service-3.PNG)


##03:06 PM, Día 1:

De repente un nuevo panel se ha mostrado. Ahí me proponía elegir un lenguaje de programación y un tipo de Bot nuevo a generar. Como buen pirata he seleccionado "NodeJS" y el último tipo de Bot, "Question And Answer".

![Question and Answer]({{site.baseurl}}/public/uploads/2017/02/azure-bot-service-4.PNG)


##03:07 PM, Día 1:

Entonces un popup salvaje ha aparecido preguntándome si quería asociar el bot con un nuevo servicio o con el "Duelo de espadas" que cree unas anotaciones atrás. Me he decantado por esta última opción. Parecía la adecuada...

![QnA Maker - selection]({{site.baseurl}}/public/uploads/2017/02/azure-bot-service-5.PNG)


##03:30 PM, Día 1:

Tras un merecido descanso, al volver al portal de azure, he descubierto que mi bot ya estaba creado. He podido ver el código que me ha generado. Además, me ha permitido retocarlo con el fin de que fuera más eficiente.

![Bot Service - Code]({{site.baseurl}}/public/uploads/2017/02/duelo-espadas-code.PNG)


##03:35 PM, Día 1:

Una vez todo estaba en orden, he navegado de la opción de "Develop" a la de "Channels". Ahí he podido seleccionar las plataformas donde he querido que esté disponible mi querido nuevo bot.

![Bot service - Channels]({{site.baseurl}}/public/uploads/2017/02/duelo-espadas-channels.PNG)


##03:40 PM, Día 1:

Para terminar con mi experiencia, he añadido la información necesaria, un nombre, una descripción y un nuevo logo.

![Bot Service - Settings]({{site.baseurl}}/public/uploads/2017/02/duelo-espadas-settings.PNG)


##03:55 PM, Día 1:

He abierto el bot Duelo de Espadas en Skype. Me ha aportado todas las respuestas correctas para los duelos de insultos de mi partida de Monkey Island. 

![Duelo de Espadas - Bot]({{site.baseurl}}/public/uploads/2017/02/duelo-espadas-bot.png)


Mi viaje ha terminado.


##Conclusiones

Han sido dos horas muy productivas. Sin tener demasiada idea de cómo funcionaban las diferentes tecnologías, en muy poco tiempo he conseguido un resultado muy satisfactorio. Esto no significa que este bot esté terminado. Podríamos aportarle más inteligencia. Tenemos el código fuente para modificarlo a nuestro gusto. La parte buena es que con estos conocimientos podríamos hacer un bot de asistencia para una página web en menos de un día.

Me gusta mucho la dirección que están tomando los Cognitive Services de Microsoft y lo mucho que nos pueden ayudar.
