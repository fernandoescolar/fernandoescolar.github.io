---
published: true
ID: 202310181
title: '.Net next en Dev Containers'
author: fernandoescolar
post_date: 2023-10-18 01:04:36
layout: post
tags: dev-containers dotnet
background: '/assets/uploads/bg/metrics.jpg'
---

Recuerdo que con la última versión del *framework* de .Net estuve haciendo pruebas con las versiones *preview* meses antes de que saliera la versión final. Esto provocó ciertos problemas con el *tooling*, que desembocaron en demos y charlas con demos en las que encontraba más problemas de los que esperaba. Eso me pasa por ser un *early adopter*, como dirían un par de compañeros de trabajo.<!--break-->

Pero esta vez no me voy a cargar mi entorno de desarrollo habitual. Esta vez voy a probar las novedades de .Net 8 en su versión *preview* de forma aislada. Voy a usar la extensión [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) para **Visual Studio Code**.

## ¿Qué es Dev Containers?

*Dev Containers*, antiguamente conocido como *Remote Cointainers*, es una extensión de **Visual Studio Code** que permite ejecutar el entorno de desarrollo en un contenedor de *docker*. Esto permite tener un entorno de desarrollo aislado, con las herramientas y versiones de las mismas que necesitemos para el proyecto en el que estemos trabajando.

Lo que hace esta extensión es crear un entorno basado en *docker* y/o *docker compose*. En este entorno podremos crear contenedores con todas las herramientas y servicios que necesitemos para hacer funcionar nuestro proyecto. Y crearemos un contenedor especial, basado en las imágenes provistas por el equipo de desarrollo de *Dev Containers*, en la que se montará el código fuente de nuestro proyecto y se ejecutarán las herramientas de compilación y ejecución de nuestra aplicación.

El concepto es un poco abstracto, pero seguro que viénendolo en acción se entiende mejor. Así que vamos a ello.

## Creando un entorno de desarrollo con Dev Containers

Para crear un entorno de desarrollo con *Dev Containers* necesitamos tener instalada la extensión en **Visual Studio Code**. Una vez instalada, podemos crear un entorno de desarrollo de una for
