---
published: true
ID: 201907161
title: 'Azure con Terraform'
author: fernandoescolar
post_date: 2019-07-16 07:51:23
layout: post
---

La terraformación es un conjunto de técnicas que aplicadas en conjunto conseguirían dotar a un planeta o asteroide inerte, de una serie de características semejantes a las de la tierra. De esta forma se conseguiría un planeta habitable. Y aunque pueda parecer pomposo (que lo es), `terraform` va de eso mismo, pero con el *cloud*.<!--break--> No es que queramos que la nube sea habitable para un ser humano, pero sí para nuestras aplicaciones.

Terraform es una herramienta que nos ayuda a gestionar infraestructura como código. Hereda las características de esta práctica: la capacidad de versionar, construir, actualizar o borrar infraestructura, sin tener que interactuar físicamente con el hardware o con herramientas interactivas. Así conseguimos una forma de administración de sistemas informáticos más potente y sencilla. Al menos para un programador.

![Terraform](/public/uploads/2019/07/hashicorp-terraform.png)

Y ¿cómo se usa esto con azure?

## Instanlando

Instalar [Terraform](https://www.terraform.io) en **Windows**, como dice un colega, es un poco *tricky*. Básicamente consiste en:

- Descargar el archivo .exe de su [web oficial](https://www.terraform.io/downloads.html).
- Almacenar ese archivo en un directorio local.
- Añadir a la variable de entorno `PATH` la ruta de esa carpeta.

Para el resto de sistemas operativos, recomendaría usar los repositorios de paquetes habituales. Por ejemplo en **macOS**, puedes usar `brew`:

```bash
brew install terraform
```

## Proyecto para Azure

### Creando un *service principal*

Para emepezar a usar Terraform con Microsoft Azure lo primero que tendremos que hacer es tener unas credenciales de una cuenta de *service principal* para nuestra suscripción de Azure. Para obtenerlas podemos usar la herramienta [Azure CLI](https://docs.microsoft.com/es-es/cli/azure/install-azure-cli?view=azure-cli-latest):

```bash
az login
```

Después de introducir nuestra credenciales, se listarán las suscripciones a las que pertenecemos. Deahí hay que leer el parámetro `id` de la que nos insterece. Después seleccionamos esa suscripción para trabajar con ella:

```bash
az account set --subscription="SUBSCRIPTION_ID"
````

Y finalmente creamos la cuenta de *service principal*:

```bash
az ad sp create-for-rbac --role="Contributor" --scopes="/subscriptions/SUBSCRIPTION_ID"
```

Esta petición nos devolverá algo como esto:

```json
{
  "appId": "...",
  "displayName": "...",
  "name": "...",
  "password": "...",
  "tenant": "..."
}
````

Donde:

- `appId` equivale a `client_id`
- `password` es el `client_secret`
- `tenant` es en realidad el `tenant_id`

### Inicializando Terraform

Antes de inicializar Terraform, tendremos que crear un archivo .tf (pe. "main.tf"), en este archivo introduciremos el proveedor que queremos utilizar y las crecenciales de *service principal* necesarias para su uso:

```yaml
provider "azurerm" {
  subscription_id = "..."
  client_id       = "..."
  client_secret   = "..."
  tenant_id       = "..."
}
```

Ahora ejecutaremos el comando de inicialización:

```bash
terraform init
```

Esto descargará todo lo necesario para poder conectar con azure e interactuar. Los archivos se alamacenarán en una carpeta con el nombre ".terraform" que podrá ser excluida del repositorio de código fuente.

## Codificando

Como habremos podido observar ya, el formato para crear infraestructura en Terraform es el `yaml`. La idea es utilizar la siguiente estructura:

```yaml
resource "tipo_de_recurso" "nombre_interno_recurso" {
    propiedad1  = valor1
    propiedad2  = valor2
    propiedad3 {
        sub_propiedad1 = sub_valor1
        sub_propiedad2 = sub_valor2
    }  
}
```

De esta forma, si quisiera crear un `Resource Group` de azure, podría añadir a mi archivo .tf algo como esto:

```yaml
resource "azurerm_resource_group" "mi_resource_group" {
  name     = "prueba-terraform"
  location = "West Europe"
}
```

Si ahora quisiera añadir a este grupo, un `App Service Plan` donde alojar mi página web, añadiría:

```yaml
resource "azurerm_app_service_plan" "mi_app_service_plan" {
  name                = "prueba-terraform-service-plan"
  location            = azurerm_resource_group.mi_resource_group.location
  resource_group_name = azurerm_resource_group.mi_resource_group.name
  kind                = "Windows"

  sku {
    tier      = "Standard"
    size      = "S1"
  }
}
```

Como podemos observar en este caso, para definir los parámetros `location` y `resource_group_name`, estoy llamando directamente a las variables de salida de la creación del grupo de recursos. Cada recurso, por tanto, tienes unos parámetros de entrada, que son los que escribimos en su definición, y unos de salida que podemos utilizar llamando a `tipo_de_recurso.nombre_interno_recurso.parametro_salida`.

Finalmente, para este ejemplo, crearíamos una `Web App` de `App Services`:

```yaml
resource "azurerm_app_service" "app-services" {
  name                = "prueba-terraform-web"
  location            = azurerm_resource_group.mi_resource_group.location
  resource_group_name = azurerm_resource_group.mi_resource_group.name
  app_service_plan_id = azurerm_app_service_plan.mi_app_service_plan.id

  site_config {
    always_on         = true
    default_documents = ["default.aspx","default.html","index.html","hostingstart.html"]
  }
}
```

## Operando

![Terraform](/public/uploads/2019/07/terraform-apply.jpg)

## Variables

## Bucles

## Workspaces

## Módulos

![Terraform](/public/uploads/2019/07/terraform-modules.jpg)

## Terraform vs ARM vs Azure CLI

## Conclusiones

Terraform es una herramienta muy potente, que sirve para diferentes entornos, con una sintaxis más o menos sencilla y que funciona muy bien. Aunque no es la herramienta perfecta, en mi opnión es hoy por hoy, de lo mejorcito que tenemos disponible.

Si no consideras que te pueda ser útil, es mejor que no uses esta herramienta. Pero si, por el contrario, crees que te puede ayudar, preparate para enfrentarte a algunos retos que te pondrán a prueba. Eso sí, al final te asuguro que no te arrepentirás.
