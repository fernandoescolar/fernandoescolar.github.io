---
ID: 08091600
title: Quiero mi propio NuGet
author: fernandoescolar
post_date: 2016-09-08T09:12:11.000Z
post_excerpt: ""
layout: post
---
Algunos irónicamente pensarán: "¡Qué gran novedad!". Muchos se preguntarán si conozco servicios como MyGet. Unos pocos llegarán a la conclusión de que he perdido la cabeza. La inmensa mayoría ni siquiera llegará a leer este artículo. Y un par imaginarán que vivo en el pleistoceno del desarrollo. Pero nada más lejos...
<!--break-->

El asunto que hoy nos ocupa viene desencadenado por un problema de un cliente. Tenían una serie de librerías que comparten en varios proyectos. La forma de reutilizarla es muy sencilla: Por una lado existen copias de los archivos dll en sus proyectos. Y en ocasiones se poia el código completo de la librería. ¿Qué podría fallar?. En realidad muchas cosas. Las última semanas hemos estado realizando cambios en sus librerías "core". Esas que comparten con los proyectos. Imaginad la difícil tesitura.

Estaba claro entonces, lo que necesitaban era un servidor interno de NuGet. De esta forma podrían compartir esas librerías comunes, a la vez que mantendrían el control de versión de las mismas.

## ¿Cómo me hago un NuGet.Server?
En un tiempo remoto me vi en esta misma encricijada. Recordaba los pasos. Era muy sencillo. Creas una aplicación Web vacía con Visual Studio. Buscas el paquete de NuGet llamado "NuGet.Server". Lo instalas. Cambias un par de parámetros de configuración. Y a publicar.

Conocedor de los pasos, envalentonado, me dispuse a ejecutarlos. Al terminar, la solución ni compilaba. Y para mayor de mis vergüenzas el cliente estaba presente cuanto mi sonrisa se esfumó en virtud de una expresión de perplejidad.

Intentando salvar los muebles encontré en internet la [web del proyecto](https://github.com/NuGet/NuGet.Server "NuGet.Server on GitHub"). Ahora hospedado en github y bajo el manto protector del equipo de Open Source de Microsoft.

A partir de aquí dos caminos se abrian, pero debía elegir tan solo uno:

### El lado oscuro (o la forma fácil de conseguir las cosas)

### El sendero luminoso de la fuerza



