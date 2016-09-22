---
published: false
---
¿Os acordais de John McClane? Lo dejamos salvando la navidad en Los Ángeles. Ahora está en Nueva York. Feliz. Hasta que Simon, el hermano de Hans, aparece con ganas de bronca. Quiere robar el oro de los Estados Unidos de America. Pero esta vez John McClane cuenta con la ayuda de Samuel L. Jackson. ¿Podrán superar juntos el juego de "Simon dice"?<!--break-->

Han sido pocos los que me han pedido la segunda parte de [La Jungla de Cristal](http://fernandoescolar.github.io/2016/09/08/quiero-mi-propio-nuget/ "Quiero mi propio NuGet"). En realidad ninguno. No obstante aquí la tenéis. Una historia semejante. Tenemos un cliente (_Holly_). Con un nuevo problema (_Simon_). Pero se parece mucho al de los proyectos que tienen una librería compartida y diferentes versiones de la misma (_Hans_). Y esta vez queremos usar Visual Studio Team Services (_Samuel L. Jackson_). Es nuestra herramienta preferida. Por qué íbamos a necesitar instalar algo nuevo. Afortunadamente contamos con la extensión [Package Management](https://marketplace.visualstudio.com/items?itemName=ms.feed "Package Management in the Visual Studio MarketPlace") (John McClane).

## Un paseo por Harlem
Package Management llegó sin hacer demasiado ruido. Al menos no tanto como debería. Como cuando la policía tiene que buscar a John McClane para cubrir los deseos de un psicopata que se hace llamar Simon. 

La idea es poder integrar dentro de Visual Studio Team Services un servidor de paquetes. En un principio soportan NuGet. Porque es una versión "preview". Pero a futuro les gustaría integrar otros tipos de paquetes, como npm. También a futuro esperan tener la extensión disponible para TFS on-premises.

La forma de organizar que se ha diseñado consiste en Feeds. Cada Feed podría contener sus propios paquetes, su propia seguridad y por su puesto, su propio endpoint.

Instalar esta extensión en nuestra cuenta de VSTS es relativamente sencillo. Tendremos que ir a la [Marketplace de Visual Studio Team Services](https://marketplace.visualstudio.com/ "Visual Studio Marketplace"). Allí buscar "Package Management". Y nos encontraremos con [este resultado](https://marketplace.visualstudio.com/items?itemName=ms.feed "Package Management").

![Package Management in Visual Studio Marketplace]({{site.baseurl}}/public/uploads/2016/10/package-management-1.png)

Entonces presionamos instalar y listo. Al dirigirnos a nuestro site veremos que ha aparecido una nueva opción en la toolbar: "Packages".

![Packages option]({{site.baseurl}}/public/uploads/2016/10/package-management-2.png)

Esto significará que todo ha ido correctamente.

## El tren descarrila

## El problema de las garrafas y los galones de agua

