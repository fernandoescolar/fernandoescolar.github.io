---
published: false
---
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
Aprovechando que conocemos la web con el código fuente: https://github.com/NuGet/NuGet.Server. Solo tendremos que seleccionar la rama estable de "release":

![Nuget.Server "relase" branch]({{site.baseurl}}/public/uploads/2016/09/github-nuget-1.png)

Después simplemente buscamos el enlace para descargar el código en forma de archivo zip:

![GitHub download repository as zip]({{site.baseurl}}/public/uploads/2016/09/github-nuget-2.png)

Una vez finalizada la descarga, descomprimimos el archivo.

### El sendero luminoso de la fuerza
La forma compleja consiste en abrir un terminal, bash o consola. Ahí nos pelearemos con comandos Git:

```bash
# clonamos el repositorio en la carpeta nuget-server
$ git clone https://github.com/NuGet/NuGet.Server.git nuget-server
```

Después elegir la branch de "release":

```bash
$ cd nuget-server
$ git checkout release
```

### Configurando NuGet.Server
Independientemente del camino elegido, llegaremos al punto de tener que buscar el archivo de la solución "NuGet.Server.sln" y abrirlo con Visual Studio.

![Solution Explorer: NuGet.Server]({{site.baseurl}}/public/uploads/2016/09/vs-nuget-1.png)

Allí nos dirigiremos al archivo "Web.config", dentro de la sección "appSettings", a una línea que añade la clave "apiKey":

!["apiKey" in Web.config]({{site.baseurl}}/public/uploads/2016/09/vs-nuget-2.png)

Aquí deberemos sustituir el valor por el que más rabia nos dé. En mi caso puse: "ton-to-el-que-lo-lea" :).

Para terminar, publicaremos la solución en una WebApp de Azure. O si aun no tenemos una cuenta en la nube, la podremos publicar en forma de aplicación Web en cualquier IIS.

Había conseguido reascirme de los errores pasados. Además con el bonus extra de elegir el sendero luminoso y tener que escribir en directo comandos en una ventana negra con texto blanquecino. ¡Brujería!

![Logro desbloqueado: brujería]({{site.baseurl}}/public/uploads/2016/09/Fernando%2Bha%2Busado%2Bbrujer%C3%ADa.gif)




