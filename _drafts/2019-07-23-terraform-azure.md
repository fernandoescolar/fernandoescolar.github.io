---
published: true
ID: 201907231
title: 'Terraform con Azure'
author: fernandoescolar
post_date: 2019-07-23 07:51:23
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

Antes de inicializar Terraform, tendremos que crear un archivo ".tf" (pe. "main.tf"), en este archivo introduciremos el proveedor que queremos utilizar y las crecenciales de *service principal* necesarias para su uso:

```yaml
provider "azurerm" {
  subscription_id = "..."
  client_id       = "..."
  client_secret   = "..."
  tenant_id       = "..."
}
```

Ahora ejecutaremos en la consola o el terminal, el comando de inicialización:

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

De esta forma, si quisiera crear un `Resource Group` de azure, podría añadir a mi archivo ".tf" algo como esto:

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

Todos estos bloques que código se pueden añadir a un mismo archivo con extensión ".tf" o se pueden almacenar en varios.

## Operando

Terraform es una herramienta de consola, por lo que para realizar operaciones, es necesario usar los diferentes comandos que tiene, en un terminal. Los que más veces vamos a utilizar son:

### plan

Cuando consideremos que ya tenemos listo nuestro código, es el momento de probar que sintácticamente es correcto. Para ello ejecutaremos el comando `plan`:

```bash
terraform plan
```

La salida de este comando, si es correcto el contenido de los ".tf", será un `json` descriptivo con la infraestructura que se va a crear, modificar y/o borrar. Y en caso de errores, nos señalará donde se encuentran y nos informará de la causa.

El comando `plan`, al igual que todos los demás comando de Terraform, buscará en el directorio donde lo ejecutemos todos los archivos con extensión ".tf" y los tratará como uno solo. Además, tampoco tenemos que preocuparnos por el orden en el que declaramos los recursos. Terraform buscará cual es el orden correcto, qué tareas puede paralelizar y cómo realizar la creación de la infraestructura lo más eficientemente que pueda.

### apply

Una vez que estamos satisfechos con la propuesta que hemos visto en el plan es el momento de llevar esos recursos a la nube. Para ello usaremos el comando `apply`. Este comando realiza un incremental de actualización sobre nuestra infraestrutura:

- Si no existe, lo crea todo
- Si ya existe, planifica la creación, modificación y borrado de los recursos ya existentes con respecto los propuestos en nuestro código.

```bash
terraform apply -auto-approve
```

![Terraform](/public/uploads/2019/07/terraform-apply.jpg)

Haber realizado un `plan` previamente, no nos garantiza que no pueda fallar el apply. El primero calcula que la sintaxis sea correcta, y `apply` se enfrenta directamente con Microsoft Azure. En esta plataforma existen más normas, como por ejemplo, que el nombre de nuestro *app service* no exista previamente. Si estas normas de la plataforma no se ven satisfechas, nos encontraremos ante errores en este punto.

Hay que tener en cuenta que el comando `apply` se basa en la existencia de un estado almacenado. Si en un momento determinado, el estado de nuestros recursos en Azure ha evolucionado de forma diferente a la última vez que ejecutamos el comando `apply`, lo más recomendable es sincronizar el estado usando el comando `import`.

### destroy

Si en un momento determinado queremos borrar todos los recursos que creamos anteriormente, el comando que tendremos que utilizar es `destroy`. Este comando realizará la operación contraria al `apply`, dejando nuestra cuenta de Azure limpia de infraestructura. Es un comando muy util para crear y borrar entornode de desarrollo o prueba. La sintaxis es semejante a los anteriores comandos:

```bash
terraform destroy
```

## Uso algo más avanzado

Hasta aquí hemos visto un *quick start* del uso de Terraform con Microsoft Azure. Pero los archívos de código ".tf" tienen mucha más miga de lo que puede parecer en un principio:

### Variables de entrada

Las variables que más vamos a utilizar son las de entrada (*Input Variables*). Estas funciones se declaran como:

```yaml
variable "nombre_variable" {
  description = "una descripción de para qué es esta variable"
  default = "un valor por defecto"
}
```

> Podemos prescindir de escribir un valor por defecto si es que no es necesario. Pero por favor, no prescindas de poner una descripción.

Para usar este tipo de variables en código es tan fácil como escribir `var.nombre_variable`:

```yaml
variable "resource_group_name" {
  description = "The resource group name"
  default = "test-terraform"
}

resource "azurerm_resource_group" "my_resource_group" {
  name     = var.resource_group_name
  location = "West Europe"
}
```

Si queremos modificar el valor de una variable, podemos hacerlo utilizando:

- El argumento `-var="nombre_variable=valor"` en nuestro comando:

```bash
terraform apply -var="nombre_variable=valor"
```

- Usando un archivo ".tfvars" que podremos referenciar con el argumento `-var-file="mi_archivo.tfvars"`:

```bash
terraform apply -var-file="mi_archivo.tfvars"
```

También podemos hacer que nuestro archivo sea cargado automanticamente nombrandolo "terraform.tfvars" o termiando en "auto.tfvars".

Este archivo de tipo ".tfvars", contendrá claves y valores en este formato:

```yaml
nombre_variable_texto   = "valor variable"
nombre_variable_bool    = false
nombre_variable_numero  = 1
nombre_variable_lista   = ["uno", "dos"]
nombre_variable_objeto  = { parametro = "valor" }
```

### Variables locales

Las variables locales se declaran dentro de un bloque llamado `locals`:

```yaml
locals {
  nombre_variable1 = "valor 1"
  nombre_variable2 = "valor 2"
}
```

Y para su uso se referencian con el formato `local.nombre_variable1`.

Estas variables se pueden usar junto con las  para realizar composiciones más completas. 

Estas variables se pueden usar para componer otros valores diferentes a partir de variables de entrada o de salida. El ejemplo más común sería el de concatenar cadenas de texto:

```yaml
variable "environment" {}

variable "application" {}

locals {
    name = "${var.environment}-{var.application}-resource-group"
}
```

### Funciones

También tenemos [funciones de Terraform](https://www.terraform.io/docs/configuration/functions.html) que nos permiten hacer operaciones más complejas:

Desde buscar máscaras de un rango de *IPs* en formato *CIDR*:

```yaml
variable "cidr" { default = "10.12.127.0/20" }

locals {
    ip   = cidrhost(var.cidr, 16) # 10.12.112.16
    mask = cidrnetmask(var.cidr)  # 255.255.240.0
}
```

Hasta abrir archivos como base64:

```yaml
variable "filepath" { default = "./certificate.pfx" }

locals {
    certificate_base64 = filebase64(var.filepath)
}
```

### Bucles

Terraform nos permite realizar la creación de el mismo recurso varias veces usando el parámetro `count`:

```yaml
resource "azurerm_resource_group" "mi_resource_group" {
  count    = 2
  name     = "prueba-terraform-${count.index}"
  location = "West Europe"
}
```

Este código crearía dos grupos de recursos en mi cuenta de azure: uno con el nombre de "prueba-terraform-0" y otro "prueba-terraform-1".

Si quisiera referenciar el nombre de los recursos que acabo de crear, tengo varias formas diferentes:

```yaml
azurerm_resource_group.mi_resource_group[0].name            # prueba-terraform-0
element(azurerm_resource_group.mi_resource_group, 1).name   # prueba-terraform-1
element(azurerm_resource_group.mi_resource_group.*.name, 0) # prueba-terraform-0
azurerm_resource_group.mi_resource_group.*.name[1]          # prueba-terraform-1
```

El parámetro `count` también se puede utilizar como condicional asignandole los valores `1` o `0` en dependencia de un ternario:

```yaml
variable "create_resource_group" {
  default = false
}

resource "azurerm_resource_group" "mi_resource_group" {
  count    = var.create_resource_group ? 1 : 0
  name     = "prueba-terraform"
  location = "West Europe"
}
```

Y también tenemos bucles `for` para la creación de variables. Su comportamiento es semejante a un `for each` y nos da mucha versatilidad:

```yaml
variable "ip_cidr" {
  default = [ "10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24" ]
}

locals {
  subnets = [for x in var.ip_cidr: {
    ip   = element(split("/", x), 0)
    mask = cidrnetmask(x)
  }]
}
```

En este código convertiríamos una lista de rangos de IP en formato CIDR, en un listado de objetos con las propiedades "ip" y "mask".

### Módulos

![Terraform](/public/uploads/2019/07/terraform-modules.jpg)

### Variables salida

Cuando 

### Workspaces

## Conclusiones

### Terraform vs ARM vs Azure CLI

### Opinión

Terraform es una herramienta muy potente, que sirve para diferentes entornos, con una sintaxis más o menos sencilla y que funciona muy bien. Aunque no es la herramienta perfecta, en mi opnión es, hoy por hoy, de lo mejorcito que tenemos disponible.

Si no consideras que te pueda ser útil, es mejor que no uses esta herramienta. Pero si, por el contrario, crees que te puede ayudar, preparate para enfrentarte a algunos retos que te pondrán a prueba. Eso sí, al final te asuguro que no te arrepentirás.
