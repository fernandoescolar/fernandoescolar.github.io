---
published: false
ID: 15091600
title: 'VSTS: Migrar TFVC a Git'
author: fernandoescolar
post_date: {}
layout: post
---
El (bendito) problema de hoy en día es que existen multitud de opciones. Multitud de herramientas para hacer lo mismo. Nos encontramos en una permanente disyuntiva. Cerveza negra o rubia. Cristiano Ronaldo o Messi. [Allen o Johansson](http://www.fangazing.com/berto/algo_para_pensar_01__la_disyuntiva_allen__johansson/43&style=flat "Disyuntiva Allen-Johansson"). Cuando queremos migrar de TFVC a Git, es lo mismo. Nunca recuerdo cual era el bueno: ¿"git-tf" o "git-tfs"?. Siempre me confundo. Al final termino instalándome ambos. Y ¿cómo eran los dichosos comandos?<!--break-->

Hace no mucho, [El Bruno](https://twitter.com/elbruno "El Bruno") me invitó a participar en [uno de sus conocidos podcast](https://elbruno.com/2016/08/30/podcast-por-que-odio-git/ "Podcast: Por qué odio Git"). En este caso la temática trataba de un artículo que podréis leer en esta misma Web: [Por qué odio Git](http://fernandoescolar.github.io/2016/02/16/por-que-odio-git/ "Artículo: por qué odio Git"). Dejando de lado lo agradecido que estoy por ello, dentro de la conversación, me preguntó si me habían pedido migrar a Git muchos clientes.

Para poder migrar de TFVC a Git, actualmente conozco dos aplicaciones: Git-Tf y Git-Tfs.

> You Can't Write Perfect Software. Did that hurt? It shouldn't. Accept it as an axiom of life. Embrace it. Celebrate it. Because perfect software doesn't exist. No one in the brief history of computing has ever written a piece of perfect software.
**Andrew Hunt, The Pragmatic Programmer: From Journeyman to Master**



## Git-Tf

```bash
choco install git-tf -y
```

O bien descargándola de su web: https://gittf.codeplex.com/.
 
Una vez instalado, abriremos una consola y crearemos un directorio de trabajo, por ejemplo "c:\migrations" y en esa ruta ejecutaremos el siguiente comando:
 
```bash
C:\migrations> git-tf clone "http://<TFSServerName>:<Port>/tfs/<CollectionName>" "$/<TeamProjectName>/<Path>" –deep
```
 
Entonces nos descargará todo el código fuente con su historial desde el TFS.
 
Después tendremos que crear un nuevo repositorio de código fuente GIT en TFS. Copiaremos la URL del mismo que tendrá un formato del estilo:

```bash
http://<TFSServerName>:<Port>/tfs/<CollectionName>/_git/<Repository>
```

Abriremos otra consola (o el bash de las herramientas de "git for Windows"), nos situaremos en la carpeta "c:\migrations" y buscaremos una subcarpeta con el nombre del proyecto que no hemos descargado de TFS anteriormente. Situaremos la consola en esa carpeta y ejecutaremos el siguiente comando:

```bash
C:\migrations\<Project>> git remote add "http://<TFSServerName>:<Port>/tfs/<CollectionName>/_git/<Repository>"
```
 
A continuación, para iniciar la subida al repositorio git escribiremos el siguiente comando:

```bash
C:\migrations\<Project>> git push origin master
```

Nos pedirá el usuario y la contraseña para realizar la subida. Los introducimos y esperamos a que suba todos los datos.
 
Cuando termine esta operación tendremos en nuestro repositorio de GIT todos los changesets que teníamos en TFS y ya podremos trabajar con él.

## Git-Tfs

git tfs clone https://tfs.codeplex.com:443/tfs/Collection $/project/trunk . --branches=all --export --export-work-item-mapping="c:\workitems\mapping\file.txt"

# Clean all the git-tfs metadatas from the commit messages
git filter-branch -f --msg-filter "sed 's/^git-tfs-id:.*$//g'" -- --all

Then verify that all is ok and delete the folder .git/refs/original ( to delete old branches)

git remote add origin http://tfsserver:8080/tfs/defaultcollection/_git/MyGitProject

git push --all origin
