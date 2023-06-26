---
published: true
ID: 202309061
title: 'Observabilidad en .Net: Trazas'
author: fernandoescolar
post_date: 2023-09-06 01:04:36
layout: post
tags: observability dotnet csharp net7 traces
background: '/assets/uploads/bg/golang.jpg'
---

Las trazas distribuidas son una técnica de diagnóstico que ayuda a los ingenieros a localizar fallos y problemas de rendimiento en aplicaciones, especialmente aquellas que pueden estar distribuidas en múltiples máquinas o procesos. Esta técnica sigue las solicitudes a través de una aplicación, correlacionando el trabajo realizado por diferentes componentes de la aplicación y separándolo del trabajo que la aplicación puede estar haciendo para solicitudes concurrentes. <!--break-->Por ejemplo, una solicitud a un servicio web típico podría ser recibida primero por un balanceador de carga, luego reenviada a un proceso de servidor web, que luego realiza varias consultas a una base de datos. El uso de trazas distribuidas permite a los ingenieros distinguir si alguno de esos pasos falló, cuánto tiempo tomó cada paso y potencialmente registrar mensajes producidos por cada paso a medida que se ejecutaba.

Ahora, ¡vamos a agregar un poco de instrumentación de trazas distribuidas a nuestra aplicación .NET!
