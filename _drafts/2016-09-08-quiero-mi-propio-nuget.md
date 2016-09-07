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

El asunto que hoy nos ocupa viene desencadenado por un problema en un cliente. Tenían una serie de librerías que comparten en varios proyectos. La forma de reutilizarlas es muy sencilla: Por una lado existen copias de los archivos dll en sus proyectos, y en ocasiones se ponía el código fuente de la librería. ¿Qué podría fallar? 

Las última semanas hemos estado realizando cambios en sus librerías "core". Esas que comparten con los proyectos. Imaginad la difícil tesitura. Estaba claro entonces. Lo que necesitaban era un servidor interno de NuGet. De esta forma podrían compartir esas librerías comunes, a la vez que mantendrían el control de versión de las mismas.

## ¿Cómo me hago un NuGet.Server?
En un tiempo remoto me vi en esta misma encrucijada. Recordaba los pasos. Era muy sencillo: Creas una aplicación Web vacía con Visual Studio. Buscas el paquete de NuGet llamado "NuGet.Server". Lo instalas. Cambias un par de parámetros de configuración. Y a publicar.

Conocedor de los pasos, envalentonado, me dispuse a ejecutarlos. Al terminar, la solución ni compilaba. Y para mayor de mis vergüenzas el cliente estaba presente cuanto mi sonrisa se esfumó en virtud de una expresión de perplejidad.

Intentando salvar los muebles encontré en internet la [web del proyecto](https://github.com/NuGet/NuGet.Server "NuGet.Server on GitHub"). Ahora hospedado en github y bajo el manto protector del equipo de Open Source de Microsoft.

A partir de aquí dos caminos se abrian. Pero debía elegir tan solo uno:

### El lado oscuro (o la forma fácil de conseguir las cosas)
Aprovechando que conocemos la web con el código fuente: https://github.com/NuGet/NuGet.Server. Solo tendremos que seleccionar la rama estable de "release":

![Nuget.Server "relase" branch]({{site.baseurl}}/public/uploads/2016/09/github-nuget-1.png)

Después simplemente buscamos el enlace para descargar el código en forma de archivo zip:

![GitHub download repository as zip]({{site.baseurl}}/public/uploads/2016/09/github-nuget-2.png)

Una vez finalizada la descarga, descomprimimos el archivo.

### El sendero luminoso de la fuerza
La forma compleja consiste en abrir un terminal, bash o consola. Ahí nos _pelearemos_ con comandos Git:

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

![Logro desbloqueado: brujería]({{site.baseurl}}/public/uploads/2016/09/Fernando+ha+usado+brujería.gif)

## ¿Cómo hago que Visual Studio use mi servidor NuGet?
Está claro que de nada sirve un servidor si nadie consume los servicios de los que provee. Pero que no cunda el pánico. Simplemente tendremos que abrir Visual Studio y navegar por el menú "tools" > "NuGet Package Manager" > "Package Manager Settings":

![Package Manager Settings]({{site.baseurl}}/public/uploads/2016/09/vs-add-nuget-server-1.png)

En la ventana que nos aparece elegiremos "Package Sources":

![Package Sources]({{site.baseurl}}/public/uploads/2016/09/vs-add-nuget-server-2.png)

Y pulsaremos el símbolo de "+" verde. Entonces nos aparecerá una línea nueva. En la parte inferior podremos cambiar su configuración:

![Add package source]({{site.baseurl}}/public/uploads/2016/09/vs-add-nuget-server-3.png)

En "Name" pondremos el nombre con el que queremos que aparezca nuestro servidor de NuGet. Y En "Source" pondremos la url de nuestro servidor de NuGet con un path a "/nuget".
Entonces pulsaremos el botón de “Update” y después al botón de "OK".

## ¿Cómo publico un paquete en mi servidor NuGet?
Si configuramos nuestro servidor de NuGet en Visual Studio, pero no tenemos ningún paquete, pierde sentido todo este escrito. Pero podéis estar tranquilos. Publicar un paquete en nuestro servidor de NuGet es solo un comando:

```bash
> nuget.exe push [My NuGet Package] [My NuGet Server] [My NuGet API Key]
```

Donde:

-**My NuGet Package**: es la ruta a nuestro paquete de NuGet. Por ejemplo: “My.Package.nupkg”.

-**My NuGet Server**: es la url de nuestro servidor de NuGet. Por ejemplo: "http://nuget.mydomain.com".

-**My NuGet API Key**: es el token que escribimos en las configuraciones del portal. En el archivo web.config. Por ejemplo: "ton-to-el-que-lo-lea". (os la he vuelto a colar :))

## Bonus: almacenar los paquetes en una Storage Account de Azure
No os voy a desvelar todas los detalles, pero yo me fijaría en dos archivos del código fuente que os habéis descargado: NuGet.Server.Infrastructure.IServerPackageStore y NuGet.Server.IServiceResolver.

## Conclusiones
No hay mucho más que añadir. NuGet es fácil. No es el mejor. Pero tampoco malo. Es útil. Y esto último no se puede decir de todas las herramientas que hay.

Quien no tiene uno, es porque no quiere...


![Bricomanía - Briconsejo]({{site.baseurl}}/public/uploads/2016/09/CncpsOKXEAAZ7VC.jpg)
