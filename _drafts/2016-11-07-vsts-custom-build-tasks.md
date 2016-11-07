---
published: false
---

```bash
$ sudo npm install -g tfx-cli
```

```bash
$ tfx
env: node\r: No such file or directory
```

```bash
$ brew install dos2unix
$ sudo dos2unix -F $(which tfx)
dos2unix: converting file /usr/local/bin/tfx to Unix format...
```

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

![New VSTS Task]({{site.baseurl}}/public/uploads/2016/11/vsts-tasks-folder.png)


task.json

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

