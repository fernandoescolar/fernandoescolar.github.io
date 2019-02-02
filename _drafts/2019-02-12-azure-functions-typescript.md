---
published: true
ID: 201902051
title: 'Azure Functions con Typescript'
author: fernandoescolar
post_date: 2019-02-12 08:18:25
post_excerpt: ""
layout: post
---

No os ha pasado alguna vez que al leer un artículo en lugar de leer los textos explicativos que su autor ha añadido, vais directamente al contenido de los _code snipets_ y vais copiando y pegando... No os ha pasado que ignoráis la prosa que tanto tiempo ha costado escribir y solo leéis el código, porque ya os resulta bastante auto explicativo... <!--break--> Pues hoy es el día en el que he entendido vuestras necesidades. Voy a poner código y reducir mis comentarios a la mínima expresión.

<div class="notes">
</div>

```bash
λ mkdir azure-functions-typescript-boilerplate
```

```bash
λ cd azure-functions-typescript-boilerplate\
```

```bash
λ npm init
```

```bash
λ npm install --save-dev azure-functions-core-tools
```

```bash
λ set PATH=%PATH%;[currrent_folder_fullpath]\node_modules\.bin
```

```bash
λ func init
Select a worker runtime:
dotnet
node                             <------------------
python (preview)
```

```bash
λ npm install --save-dev typescript @azure/functions
```

```bash
λ npm install --save-dev copyfiles rimraf 
```

```bash
λ mkdir src
```

```bash
λ mv host.json local.settings.json src
```

```bash
λ code .
```

tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2017",
    "lib": ["dom","es2017"],
    "sourceMap": true,
    "allowJs": false,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "rootDir": "./src",
    "forceConsistentCasingInFileNames": true,
    "suppressImplicitAnyIndexErrors": true,
    "allowSyntheticDefaultImports": true,
    "strictNullChecks":false,
    "noImplicitAny": false,
    "downlevelIteration": true
  },
  "exclude": [
    "node_modules"
  ]
}
```

package.json
```json
  "scripts": {
    "new": "cd src && func new",
    "serve": "tsc && cd src && func host start && rimraf **/*.js **/*.map",
    "build": "rimraf dist && tsc --outDir dist --sourceMap false && copyfiles package.json dist && cd src && copyfiles host.json local.settings.json */function.json ../dist",
    "clean": "rimraf dist src/**/*.js src/**/*.map"
  },
```

```bash
λ npm run new
  
Select a template:
Azure Blob Storage trigger
Azure Cosmos DB trigger
Durable Functions activity
Durable Functions HTTP starter
Durable Functions orchestrator
Azure Event Grid trigger
Azure Event Hub trigger
HTTP trigger                     <------------------
IoT Hub (Event Hub)
Azure Queue Storage trigger
SendGrid
Azure Service Bus Queue trigger
Azure Service Bus Topic trigger
Timer trigger
```

```bash
Select a template: HTTP trigger
Function name: [HttpTrigger] hello_world
```

index.ts

```ts
import { Context, HttpRequest } from "@azure/functions";

export default async function (context: Context, req: HttpRequest) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};
```

```bash
λ npm run serve

Http Functions:

        hello_world: [GET,POST] http://localhost:7071/api/hello_world
```

browser

```
http://localhost:7071/api/hello_world?name=Chiquitan%20Chiquititantantan
```



