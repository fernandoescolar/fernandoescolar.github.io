---
published: true
ID: 202105051
title: 'OwnCloud con Azure Storage'
author: fernandoescolar
post_date: 2021-05-05 01:05:31
layout: post
tags: azure-storage azure owncloud blobfuse files azure-files
background: '/assets/uploads/bg/warehouse.jpg'
---

Todos conocemos sistemas como *OneDrive*, *Dropbox*, *iCloud*, *Google Drive*, *Cloud Drive* o *Mega*. Unos pocos de los muchos servicios de almacenamiento de archivos en la nube. Lo cierto es que además son bastante económicos. Debe ser gracias a la fuerte competencia. Pero ¿para qué usar un servicio de terceros si puedo montar el mío propio?<!--break-->

La mejor opción es usar uno de estos servicios que ya existen. Pero ser un geek implica que no vas a seguir el camino fácil. Ser un geek significa que, si te puedes montar un sistema propio, debes hacerlo. Aunque al final termines pagando dos o tres de estos servicios. Y este artículo va por ahí.

Uno de los aplicativos para servir archivos en internet más conocidos es [ownCloud](https://owncloud.com/). Este software cuenta con una extensa comunidad, un fork ([nextcloud](https://nextcloud.com/)) super conocido y unas aplicaciones móviles nativas que funcionan de maravilla (al menos la de *iPhone*). Me diréis que está escrito en *PHP*, y es que algo malo tenía que tener.

El problema de montar solo este software es que no garantiza backups, sistemas de recuperación ni réplicas de datos. Pero hay un servicio en Azure que sí que nos lo garantiza: Azure Blob Storage. Vamos a montar ownCloud con almacenamiento en Azure Blob Storage.

## Instalar LAMP

Como ya imaginareis, ownCloud se instala en un LAMP: **L**inux, **A**pache, **M**ySQL y **P**HP. Así que lo primero será instalar esto. Para ello usaremos una cuenta de *root* directamente sobre una imagen de Debian 10 que tengo en una máquina virtual.

Primero actualizaremos el sistema:

```bash
apt update && apt upgrade
```

Después añadiremos el repositorio de PHP:

```bash
wget -O /etc/apt/trusted.gpg.d/php.gpg  https://packages.sury.org/php/apt.gpg
echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list
apt update
```

Y finalmente lanzaremos el comando que instalará el LAMP:

```bash
apt install apache2 mariadb-server mariadb-client php7.2 libapache2-mod-php7.2 php7.2-{mysql,intl,curl,json,gd,xml,mb,zip}
```

## Configurar Base de datos

Ahora configuraremos la base de datos para poderla usar con ownCloud:

```bash
mysql -u root -p
```

Crearemos una base de datos:

```sql
CREATE DATABASE owncloud;
```

Crearemos un usuario para usar desde ownCloud. Acuérdate de reemplazar `[tu_contraseña]` por un password de tu cosecha:

```sql
GRANT ALL ON owncloud.* TO 'owncloud_user'@'localhost' IDENTIFIED BY '[tu_contraseña]';
```

Haremos "flush":

```sql
FLUSH PRIVILEGES;
```

Y ya podremos salir de *mysql*:

```sql
EXIT;
```

## Instalar ownCloud

Para instalar ownCloud primero referenciaremos a su repositorio:

```bash
apt install gnupg gnupg2 gnupg1
curl https://download.owncloud.org/download/repositories/10.7/Debian_10/Release.key | apt -key add -
echo 'deb http://download.owncloud.org/download/repositories/10.7/Debian_10/ /' > /etc/apt/sources.list.d/owncloud.list
apt update
```

En este caso he seleccionado la versión 10.7 para un Debian 10, pero si os dirigís a [esta página](https://download.owncloud.org/download/repositories/) podréis encontrar las diferentes versiones y los diferentes sabores de esta aplicación.

Ahora ya podremos instalar los archivos de ownCloud:

```bash
apt install owncloud-complete-files
```

Una vez instalado tendremos que configurar el servidor web *Apache* para que sirva nuestra aplicación, para ello crearemos un nuevo archivo de configuración:

```bash
nano /etc/apache2/sites-available/owncloud.conf
```

Le añadiremos el siguiente contenido:

```
Alias / "/var/www/owncloud/"

<Directory /var/www/owncloud/>
  Options +FollowSymlinks
  AllowOverride All

 <IfModule mod_dav.c>
  Dav off
 </IfModule>

 SetEnv HOME /var/www/owncloud
 SetEnv HTTP_HOME /var/www/owncloud

</Directory>
```

Y lo adjuntaremos a la configuración de los sitios de apache:

```bash
ln -s /etc/apache2/sites-available/owncloud.conf /etc/apache2/sites-enabled/
a2enmod rewrite mime unique_id
systemctl restart apache2
```

Aquí ya tendremos nuestro sitio funcionando, pero antes de hacer nada, te recomendamos que instales el acceso a Azure Blob Storage.

## Montar blob storage

OwnCloud a día de hoy no tiene soporte para Azure Blob Storage, por lo que vamos a usar *[blobfuse](https://github.com/Azure/azure-storage-fuse)*. Esto es un sistema basado FUSE que nos permite montar un contenedor de Azure Blob Storage como si fuera un disco cualquiera en linux.

Vamos a añadir los paquetes de Microsoft para linux:

```bash
wget https://packages.microsoft.com/config/debian/10/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
apt update && apt upgrade
```

Como podemos observar, estamos usando los paquetes para Debian 10, pero si nos dirigimos a [esta web](https://packages.microsoft.com/config/) encontraremos las diferentes distros soportadas.

Ahora ya podremos instalar *blobfuse*:

```bash
apt install blobfuse
```

Y lo configuraremos usando un nuevo archivo:

```bash
mkdir /blobfuse
nano /blobfuse/blob.cfg
```

En este archivo añadiremos los datos de nuestra conexión:

```
accountName nombre_cuenta
accountKey clave_de_acceso
containerName nombre_contenedor
```

Ahora, para montar una unidad de Azure en nuestro disco crearemos un script de inicio:

```bash
nano /etc/rc.local
```

Aquí usaremos el usuario de web de apache y montaremos el blob en la carpeta que usa ownCloud para almacenar los archivos:

```bash
#!/bin/sh -e

sudo -u www-data blobfuse /var/www/owncloud/data --tmp-path=/tmp -o uid=33 -o gid=33  -o attr_timeout=240 -o entry_timeout=240 -o negative_timeout=120 --config-file=/blobfuse/blob.cfg  --log-level=LOG_DEBUG --file-cache-timeout-in-seconds=120
```

Si por casualidad has llegado a entrar en ownCloud o ya lo tenías configurado antes de configurar *blobfuse*, ahora es el momento de hacer una copia de los datos existentes:

```bash
cp -r /var/www/owncloud/data /var/www/owncloud/data.old
```

Limpiaremos el contenido de la carpeta para que se pueda montar:

```bash
rm  /var/www/owncloud/data/*
rm -rf /var/www/owncloud/data/.*
```

Ahora cambiaremos los permisos del script de arranque y lo ejecutaremos:

```bash
chmod +x /etc/rc.local
/etc/rc.local
```

Para finalizar podremos volver a copiar el contenido antiguo dentro de la carpeta de *blobfuse*, pero tendremos que usar el usuario *www-data* para ello:

```bash
sudo -u www-data cp -r /var/www/owncloud/data.old/* /var/www/owncloud/data
```

## Configurando ownCloud

Ha llegado el momento de abrir un navegador y dirigirnos a nuestro servidor, o bien a "localhost" si estamos trabajando en él. Al abrir la página nos encontraremos un formulario el que se nos pedirá:
- Crear un usuario y una contraseña.
- Elegir la carpeta de datos: `/var/www/owncloud/data`.
- Configurar la conexión con la base de datos usando las credenciales: `owncloud_user` con la contraseña que introdujimos y apuntando a `localhost`.

![Primera vez en ownCloud](/assets/uploads/2021/05/owncloud.png)

Para finalizar presionaremos "Finish setup" y ya podremos empezar a manejar nuestra nube privada :).

## Usar Azure Files

Si usar *blobfuse* te parece mucho lío o si, simplemente, quieres usar también el servicio de Azure Files de tu cuenta de almacenamiento siempre puedes usar el protocolo de compartir archivos de Windows *SMB* (**S**erver **M**essage **B**lock).

Para ello instalaremos el cliente de linux:

```bash
apt install smbclient
```

Ahora podremos ir al portal, a los "settings" a "Storages" y ahí añadir uno nuevo de tipo "SMB Collaborative":

![ownCloud external storage SMB](/assets/uploads/2021/05/owncloud-smb.png)

En el formulario tendremos que añadir:

- Host: nombre_cuenta.file.core.windows.net
- Share: nombre_contenedor
- Domain: nombre_cuenta.file.core.windows.net
- Service Account: nombre_cuenta
- Service Account Password: clave_de_acceso

Y al aceptar tendremos una carpeta en todas las cuentas de ownCloud que almacenará los datos en nuestra cuenta de Azure Files.

## Conclusiones

Montar cosas es super divertido e integrar servicios de Azure con linux y software libre, más. Pero no tengo claro que merezca la pena.

Si de todas formas quieres crear tu propia nube que almacene datos en Azure Storage Account, has de saber que deberías crear un sitio web con SSL y quizá merezca la pena montar una VPN para poder acceder. Ten en cuenta que vas a almacenar tus datos ahí.