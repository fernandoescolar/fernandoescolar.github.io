---
published: true
ID: 201903191
title: 'OAuth 2.0 Grant Types'
author: fernandoescolar
post_date: 2019-03-19 08:26:33
layout: post
---

Muy buenos días y gracias por acompañarnos un martes más. La pregunta de hoy y por 25 pesetas la respuesta acertada: díganos tipos de concesión (Grant Types) permitidos por OAuth 2.0, como por ejemplo "password". Un, dos, tres, responda otra vez<!--break-->.

- [Password](#password)
- [Client Credentials](#client-credentials)
- [Implicit](#implicit)
- [Authorization Code](#authorization-code)
- [Authorization Code con PKCE](#authorization-code-con-PKCE)
- [Refresh Token](#refresh-token)
- JWT

[sonido ensordecedor de bocina] 

Escuchemos a los super-tacañones:

> Aunque un servicio OAuth es capaz de devolver JSON Web Tokens, JWT no es un tipo de concesión válido.

[OAuth 2.0](https://tools.ietf.org/html/rfc6749) es una especificación que describe diferentes formas (_Grant Types_ o tipos de concesión) de solicitar un _token_ de acceso (*access_token*) para conseguir autenticar una petición a un servicio. Este servicio podría ser desde una API Rest, hasta una página web cualquiera.

Si bien es verdad que el RFC de OAuth no habla explícitamente de [JWT](https://tools.ietf.org/html/rfc7519) como formato para los *access_token*, de facto, es la forma más común en la que lo podremos encontrar hoy en día.

Dentro de este contexto, OAuth propone varias formas de autenticarse (_Grant Types_), e incluso una forma de crear nuestro propios formatos, pero los más utilizados hoy por hoy son los que exponíamos anteriormente: [Authorization Code](#authorization-code), [Authorization Code con PKCE](#authorization-code-con-PKCE), [Client Credentials](#client-credentials), [Implicit](#implicit), [Password](#password) y [Refresh Token](#refresh-token).

## Access Token

La respuesta de todos los métodos de autenticación al final tiene que ser un formato semejante: un JSON con los siguientes valores:

- `access_token` (requerido) Suele ser un JWT que después usaremos para autenticar las peticiones a una API.
- `token_type` (requerido) El tipo de _token_ que vamos a usar. Generalmente, al usar JWT, se usa el valor “Bearer”.
- `expires_in` (recomendado) Indica la duración en segundos del `access_token`. Una vez caduca puede ser renovado usando el _Grant Type_ de [Refresh Token](#refresh-token).
- `refresh_token` (opcional) Si el `access_token` va a expirar y nos permiten volver a generar el _token_, necesitaremos este valor en el proceso de [Refresh Token](#refresh-token).
- `scope` (opcional) Es un parámetro que se utiliza para autorizar un _token_ en un contexto concreto. Generalmente, nuestra API buscará un `scope` concreto para el que se ha autorizado el _token_ que le envían.
- `id_token` (opcional) Si se utiliza un `scope` con valor "openid", puede significar que queremos utilizar OpenId Connect (OIDC) para autenticarnos. En ese supuesto, puede aparecer un JWT extra donde encontraremos la información sobre el perfil del usuario.

## Authorization Code

El [Authorization Code](https://tools.ietf.org/html/rfc6749#section-4.1) es uno de los flujos de autenticación que más beneficios ofrece. Se utiliza por lo general en páginas web. La idea es que inicialmente se solicita una autenticación con el siguiente formato:

```http
GET /oauth/authorize
   ?client_id=example_client_id
   &response_type=code
   &redirect_uri=http%3A%2F%2Fexampledomain.com
   &state=string_as_status
   &scope=openid HTTP/1.1
Host: authorizationserver.com
```

Donde:

- `client_id` es el identificador público de la aplicación. Una aplicación es el resultado de registrar un nuevo cliente en nuestro servidor OAuth.
- `response_type` debe ser "code".
- `redirect_uri` es la URI que está preparada para recoger la respuesta de esta petición.
- `state` es un valor que se usa para evitar ataques CSRF (Cross Site Request Forgery). Una cadena única aleatoria que debe ser devuelta por el servidor para poderlos comparar y ver que son iguales.
- `scope` podría ser "openid" para OIDC o cualquier otro para autorizar diferentes aplicaciones.

Entonces el servidor de autorización solicita un usuario y un password vía un formulario web. Al introducir datos correctos, el servidor nos redireccionará a la página que le pasamos en el parámetro `redirect_uri`:

```http
http://exampledomain.com/
    ?code=examplecode
    &state=string_as_status
```

En esta respuesta el valor de `state` debe ser el mismo que pasamos en la petición. Y como parámetro `code` encontraremos un código, que normalmente es válido durante unos 60 segundos, a partir del que podremos realizar la petición del _token_:

```http
POST /oauth/token HTTP/1.1
Host: authorizationserver.com
Accept: application/json
Authorization: Basic user_password_formula
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&redirect_uri=http%3A%2F%2Fexampledomain.com
&code=example_code
```

Donde:

- `grant_type` es "authorization_code".
- `redirect_uri` debe ser la URI que se usó para solicitar el `code`.
- `code` es el código que nos permitirá recoger el _token_.

Como peculiaridad, la petición vendrá autenticada usando el esquema "Basic" cuyo contenido responde a la siguiente fórmula:

```js
user_password_formula = base64(client_id + ":" + client_secret)
```

Como respuesta tendremos el formato anteriormente descrito de [Access Token](#access-token):

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache

{
    "access_token": "a_lot_of_characters_in_base_64",
    "token_type": "Bearer",
    "expires_in": 3600,
    "scope": "openid",
    "id_token": "a_lot_of_characters_in_base_64"
}
```

## Authorization Code con PKCE

Se usa PKCE ([Proof Key for Code Exchange](https://tools.ietf.org/html/rfc7636)) con el fin de tener una comunicación segura sin tener que usar valores de `client_secret`. Es la solución recomendad para aplicaciones móviles y Single Page Application (SPA).

El flujo es exactamente igual al anterior, salvo porque vamos a añadir dos parámetros nuevos:

- `code_verifier` es una cadena de texto aleatoria de al menos 43 caracteres, generalmente en base64.
- `code_challenge` es un hash sha256 en base64 de `code_verifier`.

De esta forma la petición inicial sería:

```http
GET /oauth/authorize
   ?client_id=example_client_id
   &response_type=code
   &redirect_uri=http%3A%2F%2Fexampledomain.com
   &state=string_as_status
   &scope=openid
   &code_challenge_method=S256
   &code_challenge=example_code_challenge HTTP/1.1
Host: authorizationserver.com
```

Donde:

- `client_id` es el identificador público de la aplicación. Una aplicación es el resultado de registrar un nuevo cliente en nuestro servidor OAuth.
- `response_type` debe ser "code".
- `redirect_uri` es la URI que está preparada para recoger la respuesta de esta petición.
- `state` es un valor que se usa para evitar ataques CSRF (Cross Site Request Forgery). Una cadena única aleatoria que debe ser devuelta por el servidor para poderlos comparar y ver que son iguales.
- `scope` podría ser "openid" para OIDC o cualquier otro para autorizar diferentes aplicaciones.
- `code_challenge_method` como usamos SHA256 para crear el hash, será "S256".
- `code_challenge` es el hash sha256 en base64 del `code_verifier` que creamos anteriormente.

Entonces el servidor de autorización solicita un usuario y un password vía un formulario web. Al introducir datos correctos, el servidor nos redireccionará a la página que le pasamos en el parámetro `redirect_uri`:

```http
http://exampledomain.com/
    ?code=examplecode
    &state=string_as_status
```

En esta respuesta el valor de `state` debe ser el mismo que pasamos en la petición. Y como parámetro `code` encontraremos un código, que normalmente es válido durante unos 60 segundos, a partir del que podremos realizar la petición del _token_:

```http
POST /oauth/token HTTP/1.1
Host: authorizationserver.com
Accept: application/json
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&redirect_uri=http%3A%2F%2Fexampledomain.com
&code=example_code
&code_verifier=example_code_verifier
```

Donde:

- `grant_type` es "authorization_code".
- `redirect_uri` debe ser la URI que se usó para solicitar el `code`.
- `code` es el código que nos permitirá recoger el _token_.
- `code_verifier` es la cadena de texto que generamos al principio. En este paso se validará con el valor de `code_challenge` que enviamos en la anterior petición.

Al contrario que el [Authorization Code](#authorization-code) simple, en este caso no se requiere la cabera de "Authorization".

Como respuesta tendremos el [Access Token](#access-token):

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache

{
    "access_token": "a_lot_of_characters_in_base_64",
    "token_type": "Bearer",
    "expires_in": 3600,
    "scope": "openid",
    "id_token": "a_lot_of_characters_in_base_64"
}
```

## Client Credentials

El modelo más sencillo de autenticarse de OAuth 2.0 es [Client Credentials](https://tools.ietf.org/html/rfc6749#section-4.4). Se usa para la autenticación de máquina a máquina, donde no se requiere el permiso de un usuario específico para acceder a los datos.

Su funcionamiento consiste en realizar una petición al servidor en el _endpoint_ del generador de _tokens_:

```http
POST /oauth/token HTTP/1.1
Host: authorization-server.com

grant_type=client_credentials
&client_id=example_client_id
&client_secret=example_client_secret
&scope=user.read
```

Donde:

- `grant_type` es "client_credentials".
- `client_id` es el identificador público de la aplicación. Una aplicación es el resultado de registrar un nuevo cliente en nuestro servidor OAuth.
- `client_secret` es una contraseña o secreto que generaremos en el servidor de OAuth en relación con el cliente (la aplicación).
- `scope` podría ser cualquier valor que ayude a autorizar el uso de nuestras aplicaciones.

La respuesta directamente será el [Access Token](#access-token):

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache

{
  "access_token": "a_lot_of_characters_in_base_64",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "a_lot_of_characters_in_base_64",
  "scope": "user.read"
}
```

## Implicit

Cuando hablamos de un flujo de autenticación [Implicit](https://tools.ietf.org/html/rfc6749#section-4.2) lo más probable es que estemos trabajando con páginas web SPA (Single Page Application). Generalmente, NO se recomienda usar este flujo, e incluso algunos servidores, prohíben su uso. Hoy en día se recomienda usar en su lugar el flujo de [Authorization Code con PKCE](#authorization-code-con-PKCE).

De cualquier forma, podría ser que tengamos que usarlo, así que nunca sobra describirlo. Todo consiste en una petición simple al servidor:

```http
GET /oauth/authorize
    ?client_id=example_client_id
    &response_type=token
    &redirect_uri=http%3A%2F%2Fexampledomain.com
    &state=string_as_status&scope=openid
    &scope=openid HTTP/1.1
Host: authorizationserver.com
```

Donde:

- `response_type` es "token".
- `client_id` es el identificador público de la aplicación. Una aplicación es el resultado de registrar un nuevo cliente en nuestro servidor OAuth.
- `redirect_uri` es la URI que está preparada para recoger la respuesta de esta petición.
- `state` es un valor que se usa para evitar ataques CSRF (Cross Site Request Forgery). Una cadena única aleatoria que debe ser devuelta por el servidor para poderlos comparar y ver que son iguales.
- `scope` podría ser "openid" para OIDC o cualquier otro para autorizar diferentes aplicaciones.

La respuesta de esta petición será una llamada a la URI que le pasamos en `redirect_uri`, con el siguiente formato:

```http
http://exampledomain.com/
    #access_token=a_lot_of_characters_in_base_64
    &token_type=Bearer
    &expires_in=3600
    &state=string_as_status
```

De tal forma que podremos comparar el valor de `state` y sacar la información del [Access Token](#access-token) del resto de parámetros.

## Password

También conocido como [Resource Owner Password Credentials](https://tools.ietf.org/html/rfc6749#section-4.3), este flujo de autenticación es solo recomendable en entornos seguros, donde existe una relación de confianza entre el cliente y el servidor. Algo así como un servicio del sistema operativo o una aplicación que requiera permisos elevados. En resumen, este debería ser el último flujo que deberíamos usar, tan solo reservado para cuando no tenemos otra posibilidad.

Se parece mucho a [Client Credentials](#client-credentials), pero con la diferencia de que aquí vamos a autenticar a un usuario del sistema. De esta manera, crearemos una petición muy parecida al de ese modelo, pero añadiendo ciertos campos adicionales:

```http
POST /oauth/token HTTP/1.1
Host: authorizationserver.com
Content-Type: application/x-www-form-urlencoded

grant_type=password
&username=exampleuser
&password=examplepassword
&client_id=example_client_id
&client_secret=example_client_secret
&scope=user.read
```

- `grant_type` es "password".
- `username` es el nombre del usuario que usaríamos para identificarnos en el servidor.
- `password` es la contraseña del usuario que usaríamos para identificarnos en el servidor.
- `client_id` es el identificador público de la aplicación. Una aplicación es el resultado de registrar un nuevo cliente en nuestro servidor OAuth.
- `client_secret` es una contraseña o secreto que generaremos en el servidor de OAuth en relación con el cliente (la aplicación).
- `scope` podría ser cualquier valor que ayude a autorizar el uso de nuestras aplicaciones.

Y la respuesta, será el [Access Token](#access-token):

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache


{
  "access_token": "a_lot_of_characters_in_base_64",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "user.read"
}
```

## Refresh Token

Con el fin de que no siempre se estén transmitiendo los mismos datos (algunos de ellos sensibles), otro de los flujos que se nos proponen es el de [Refresh Token](https://tools.ietf.org/html/rfc6749#section-1.5). Para ello necesitaremos haber obtenido precisamente un [Access Token](#access-token), y que este a parte de expiración tenga el campo `refresh_token` indicado.

Así pues, usando este campo, después de que el _token_ anterior haya caducado, podremos obtener otro _token_ nuevo. Eso sí, un `refresh_token` también tiene una caducidad y a su vez es de un solo uso. De esta forma no podremos generar todos los _tokens_ nuevos que queramos, tan solo uno.

Este método es muy sencillo, realizaremos una petición simple al servidor OAuth como la siguiente:

```http
POST /oauth/token HTTP/1.1
Host: authorizationserver.com
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&client_id=example_client_id
&client_secret=example_client_secret
&refresh_token=a_lot_of_characters_in_base_64
```

Donde:

- `grant_type` es "refresh_token".
- `client_id` es el identificador público de la aplicación. Una aplicación es el resultado de registrar un nuevo cliente en nuestro servidor OAuth. El mismo que usamos para obtener el anterior _token_.
- `client_secret` es una contraseña o secreto que generaremos en el servidor de OAuth en relación con el cliente (la aplicación). El mismo que usamos para obtener el anterior _token_.
- `refresh_token` el _token_ que recibimos en el [Access Token](#access-token) anterior.

Y la respuesta vuelve a ser semejante a las demás:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Pragma: no-cache

{
    "access_token": "a_lot_of_characters_in_base_64",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "a_lot_of_characters_in_base_64"
}
```

## Conclusiones

Si en [otro artículo os explicábamos el tema de JWT](/2019/03/12/jwt-api-authentication/) y cómo validarlo para poder proteger nuestras APIs, hoy nos hemos centrado en diferentes formas de autenticarnos en un servicio que soporte OAuth 2.0, y por supuesto, recibir ese JWT.

Estos no son todos los métodos, concesiones o _Grant Types_ que existen, aunque sí los más usados.

Cuando escribo sobre temas de seguridad es muy posible que me pierda en repeticiones y referencia a RFCs. Me resulta difícil dar razones de peso o resultar útil sin usar ese formato. Quizá os resulte pesado. Pero lo cierto es que, no sé vosotros, pero dentro de varios meses, seguro que vuelvo a este artículo a buscar algún detalle que no recuerdo del todo...

... y hasta aquí puedo leer.
