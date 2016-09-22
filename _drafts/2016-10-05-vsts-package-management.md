---
published: false
---
¿Os acordais de John McClane? Lo dejamos salvando la navidad en Los Ángeles. Ahora está en Nueva York. Feliz. Hasta que Simon, el hermano de Hans, aparece con ganas de bronca. Quiere robar el oro de los Estados Unidos de America. Pero esta vez John McClane cuenta con la ayuda de Samuel L. Jackson. ¿Podrán superar juntos el juego de "Simon dice"?<!--break-->

Han sido pocos los que me han pedido la segunda parte de [La Jungla de Cristal](http://fernandoescolar.github.io/2016/09/08/quiero-mi-propio-nuget/ "Quiero mi propio NuGet"). En realidad ninguno. No obstante aquí la tenéis. Una historia semejante. Tenemos un cliente (_Holly_). Con un nuevo problema (_Simon_). Pero se parece mucho al de los proyectos que tienen una librería compartida y diferentes versiones de la misma (_Hans_). Y esta vez queremos usar Visual Studio Team Services (_Samuel L. Jackson_). Es nuestra herramienta preferida. Por qué íbamos a necesitar instalar algo nuevo. Afortunadamente contamos con la extensión [Package Management](https://marketplace.visualstudio.com/items?itemName=ms.feed "Package Management in the Visual Studio MarketPlace") (_John McClane_).

## Un paseo por Harlem
Package Management llegó sin hacer demasiado ruido. Al menos no tanto como debería. Como cuando la policía tiene que buscar a John McClane para cubrir los deseos de un psicopata que se hace llamar Simon. 

La idea es poder integrar dentro de Visual Studio Team Services un servidor de paquetes. En un principio soportan NuGet. Porque es una versión "preview". Pero a futuro les gustaría integrar otros tipos de paquetes, como npm. También a futuro esperan tener la extensión disponible para TFS on-premises.

La forma de organizar que se ha diseñado consiste en Feeds. Cada Feed podría contener sus propios paquetes, su propia seguridad y por su puesto, su propio endpoint.

Instalar esta extensión en nuestra cuenta de VSTS es relativamente sencillo. Tendremos que ir a la [Marketplace de Visual Studio Team Services](https://marketplace.visualstudio.com/ "Visual Studio Marketplace"). Allí buscar "Package Management". Y nos encontraremos con [este resultado](https://marketplace.visualstudio.com/items?itemName=ms.feed "Package Management").

![Package Management in Visual Studio Marketplace]({{site.baseurl}}/public/uploads/2016/10/package-management-1.png)

Entonces presionamos instalar y listo. Al dirigirnos a nuestro site veremos que ha aparecido una nueva opción en la toolbar: "Packages".

![Packages option]({{site.baseurl}}/public/uploads/2016/10/package-management-2.png)

Esto significará que todo ha ido correctamente.

## El metro descarrila
A partir de aquí la cosa se complica. Si queremos usar este servicio tendremos que crear un nuevo Feed:

![Create new feed]({{site.baseurl}}/public/uploads/2016/10/package-management-3.png)

Un dialogo nos dará la opción de poner un nombre, una descripción y de elegir los permisos. En un principio hemos selecciona que todos los usuarios de la cuenta puedan acceder. Además de decirle que solo el sistema de builds pueda subir paquetes.

Después pulsaremos el botón de "Connect to feed":

![Connect to feed]({{site.baseurl}}/public/uploads/2016/10/package-management-4.png)

De la pantalla emergente copiaremos el valor de "Package source URL". Esto nos servirá para dos cosas: subir los paquetes a nuestro feed y para poderlos descargar después con Visual Studio.

En este punto VSTS (_Samuel L. Jackson_) ya es capaz de servirnos paquetes de NuGet (ha llegado al teléfono de la estación de metro). Pero aún no hemos publicado ningún paquete dentro del feed (_John McClane_ llega tarde).

Así que vamos a intentar publicar unas librerías propias. Para ello crearemos un nueva build. Si es que no tenemos una ya.

Iremos a la sección de "builds", pulsaremos sobre "+ New" y elegiremos la de tipo "Visual Studio".

![New Build Definition]({{site.baseurl}}/public/uploads/2016/10/package-management-5.png)

Cuando nos aparezca el panel de edición, añadiremos dos nuevos build steps: "NuGet Packager" y "NuGet Publisher".

![Add NuGet Packager and NuGet Publisher steps]({{site.baseurl}}/public/uploads/2016/10/package-management-6.png)

El "Packager" lo colocaremos detrás de los tests y el "Publisher" al final del todo.

Entonces editaremos las opciones del "NuGet Packager" y marcaremos el checkbox de "Include referenced projects".

![NuGet Packager step configuration]({{site.baseurl}}/public/uploads/2016/10/package-management-7.png)

Después editaremos las opciones del "NuGet Publisher". Marcaremos la opción de "Internal NuGet Feed". Y añadiremos la URL de nuestro feed.

![NuGet Publisher step configuration]({{site.baseurl}}/public/uploads/2016/10/package-management-8.png)

Para finalizar, guardaremos y encolaremos una nueva build.

Al terminar el proceso y si todo ha ido bien, si volvemos a la pestaña de "Packages", encontraremos nuestros nuevos paquetes de NuGet. Además podremos ver los detalles de los mismos:

![Published Packages in feed]({{site.baseurl}}/public/uploads/2016/10/package-management-9.png)

Con ello habremos conseguido sobrevivir a esta difícil prueba. Pero el final aún no está cerca...


## El problema de las garrafas y los galones de agua

