---
published: false
---
Sucedió que estaba creando un proceso de build en VSTS. Necesitaba comprimir unos archivos de resultado de la compilación. Va y no existe la cajita. Seguro que a más de uno le habrá ocurrido esto alguna vez. Quizá no creando un zip, pero sí con otro tipo de acción. Menos mal que tenemos tareas genéricas: powershell, shellscript o batch. Pero puede pasar que esto no sea suficiente.

Por suerte Team Services (VSTS y TFS) tiene extensibilidad. Y una de las cosas que nos deja extender los las tareas de build y release.

Para empezar a trabajar nos vendrá muy bien una herramienta en forma de comandos llamada TFX. Instalarla es muy fácil si tienes node. Abre una consola y escribe:

```bash
$ sudo npm install -g tfx-cli
```

Si no estamos en macos o linux, el "sudo" nos lo podemos ahorrar :).

Una vez se haya instalado, si estamos en Windows no habrá ningún problema. Aunque esto no es así en otros sistemas operativos. Si al ejecutar el nuevo comando "tfx" te encuentras con este error:

```bash
$ tfx
env: node\r: No such file or directory
```

Es relativamente sencillo de solucionar con el siguiente workaround:

```bash
$ brew install dos2unix
$ sudo dos2unix -F $(which tfx)
dos2unix: converting file /usr/local/bin/tfx to Unix format...
```

Lo que hemos hecho con estas dos líneas es instalar una tool llamada dos2unix. Esta utilidad modifica los archivos generados en Windows, para que sistemas unix no encuentren caracteres extraños. Despues hemos ejecutado esta herramienta sobre los archivos del comando "tfx".

A partir de aquí, al ejecutar "tfx" todos deberíamos ver la ayuda del comando.

Esta herramienta nos ofrece una forma rápida de crear una plantilla para luego programar nuestra tarea, ejecutamos el comando de "tfx build tasks create". Este comando nos irá solicitando los datos necesarios para crear nuestra tarea.

```bash
$ tfx build tasks create
TFS Cross Platform Command Line Interface v0.3.39
Copyright Microsoft Corporation
> Task Name: Test
> Friendly Task Name: Test Task
> Task Description: This is a test build/release vsts/tfs task
> Task Author: fernandoescolar

created task @ /Users/fernandoescolar/Test
id   : f5d62250-a510-11e6-9d90-21c7a4a70529
name: Test

A temporary task icon was created.  Replace with a 32x32 png with transparencies
```

Si echamos un vistazo veremos que nos ha creado una carpeta con el nombre de tarea que indicamos. Si miramos el contenido de esa carpeta debería ser semejante al siguiente:

![New VSTS Task]({{site.baseurl}}/public/uploads/2016/11/vsts-tasks-folder.png)

- El archivo "icon.png" será el logo de nuestro step en 


# task.json

```json
{
  "id": "f5d62250-a510-11e6-9d90-21c7a4a70529",
  "name": "Test",
  "friendlyName": "Test Task",
  "description": "This is a test build/release vsts/tfs task",
  "author": "fernandoescolar",
  "helpMarkDown": "Replace with markdown to show in help",
  "category": "Utility",
  "visibility": [
    "Build",
    "Release"
  ],
  "demands": [],
  "version": {
    "Major": "0",
    "Minor": "1",
    "Patch": "0"
  },
  "minimumAgentVersion": "1.95.0",
````

```json
  "instanceNameFormat": "Test $(message)",
  "inputs": [
    {
      "name": "cwd",
      "type": "filePath",
      "label": "Working Directory",
      "defaultValue": "",
      "required": false,
      "helpMarkDown": "Current working directory when Test is run."
    },
    {
      "name": "msg",
      "type": "string",
      "label": "Message",
      "defaultValue": "Hello World",
      "required": true,
      "helpMarkDown": "Message to echo out"
    }
  ],
````

```json
  "execution": {
    "Node": {
      "target": "sample.js",
      "argumentFormat": ""
    },
    "PowerShell3": {
      "target": "sample.ps1"
    }
  }
}
```
