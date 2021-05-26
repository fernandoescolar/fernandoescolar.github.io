---
published: true
ID: 202106091
title: 'Rust es especial'
author: fernandoescolar
post_date: 2021-06-09 01:05:31
layout: post
tags: rust
background: '/assets/uploads/bg/crab3.jpg'
---

Ea<!--break-->

Por ahora todo lo que hemos visto será muy familiar para todos aquellos programadores que utilicen lenguajes como C y sus derivados. Lo único que la sintaxis te puede gustar más o menos, o los automatismos te pueden parecer mejores o peores... pero muy similar a lo que ya conocemos.

Entonces, ¿donde está eso que la mayor parte de programadores considera especial?

* TOC
{:toc}

## Lifecycle

En Rust no vamos a encontrar un *Garbage Collector* o algún mecanismo parecido que nos ayude a controlar el uso de memoria de nuestra aplicación. Esto es un gasto de rendimiento que si queremos conseguir las cifras que dicen, no nos lo podemos permitir. Rust es más como C, pero con una pequeña diferencia: en lugar de delegar la limpieza de memoria en nuestro criterio, va a crear un sistema de ámbito de existencia de una variable.

Esto quiere decir que allí donde declaremos una variable es donde reside la propiedad (*ownership*) de ese objeto. En medida que se libera el ámbito de ejecución del propietario de nuestra variable, esta se destruye automáticamente.

```rust
{
  let s = "ola k ase";
}

println!(s); // error: 's' ya no existe
```

Este concepto parece genial y muy sencillo de aplicar. Aquellos datos que van al "*Stack*" (los *Data Types*, como ocurre en otros lenguajes) no darán ningún problema y simplificará su uso, pero ¿qué pasa con los datos que van al "*Heap*"?

AHí ya la cosa no es tan fácil. Por ejemplo, este código dará error:

```rust
let s1 = String::from("ola");
let s2 = s1;

println!("{} k ase", s1); // error aquí
```

Dará error porque el valor de `s1` ha sido prestado a `s2`. Por lo tanto el valor de `s1` pertenece ahora a `s2` y ya no podemos usarlo con `s1`. Y por eso podemos clonarlo:

```rust
let s2 = s1.clone();
```

Encontraremos el mismo problema si envíamos un objeto del "*Heap*" a una función;

```rust
fn main() {
  let s1 = String::from("ola k ase");
  me_lo_quedo(s1);

  println!("{}, 2!", s1); // error aquí
}

fn me_lo_quedo(s: String) { // "s" entra en este ámbito
    println!("{}", s);
} // al finalizar el ámbito se destruye "s"
```

Esto significa que no pasamos un valor, si no una referencia a la porción de memoria que tiene ese valor. Por lo tanto, si se libera el contenido de esta sección de memoria, se borra el objeto para todos los ámbitos de existencia, incluido los superiores.

Solventar este problema es muy fácil, basta con devolver el objeto para que la propiedad del mismo vuelva al ámbito principal:

```rust
fn main() {
  let mut s1 = String::from("ola"); // mutable
  s1 = no_me_lo_quedo(s1); // lo asigno

  println!("{} k ase", s1); // ok
}

fn no_me_lo_quedo(s: String) -> String {
    println!("{}", s);
    s
} // al finalizar el ámbito no se destruye "s" porque se devuelve
```

Pero este comportamiento constantemente sería muy loco (o quizá no). Así que los diseñadores de Rust decidieron darnos una salida, la opción de pasar una referencia a nuestra variable, sin perder la posesión de la misma usando el caracter `&`:

```rust
fn main() {
    let s1 = String::from("ola");
    no_me_lo_quedo(&s1);

    println!("{} k ase", s1);
}

fn no_me_lo_quedo(s: &String) {
    println!("{}", s);
}
```

Y con este método de usar referencias, podríamos resolver también el problema inicial:

```rust
let s1 = String::from("ola");
let s2 = &s1;

println!("{} k ase", s1);
```

Los típos que son de referencia (se almacenan en el *Heap*) son `String`, `str` y todo lo que creemos usando `struct`. Mientras que los tipos que no les afectaría este problema por ser de tipo valor son: los numéricos, booleanos y de tipo caracter.

## Impl Struct

Vamos a crear una estructura para almacenar los datos relacionados con un rectángulo:

```rust
struct Rectangle {
  width: u32,
  height: u32,
}
```

Si quisieramos calcular el área de un rectángulo cualquiera, lo lógico sería crear una función que recibiera como parámetro un rectángulo por referencia:

```rust
fn area(r: &Rectangle) -> u32 {
  r.width * r.height
}
```

Pero en Rust se nos propone una implementación más elegante: crear una implementación de un método para una estructura:

```rust
impl Rectangle {
  fn area(&self) -> u32 {
    self.width * self.height
  }
}
```

Como podemos observar, referenciamos al objeto que estamos implementando con el valor `&self`. Esto es un *syntax-sugar* para definir `self: &Self`. Representa una referencia al propio objeto. Así que podremos acceder a las propiedades y a otras implementaciones del mismo usando `self`.

Declarando una función de esta forma, se puede llamar usando la notación típica para métodos de un objeto:

```rust
let r = Rectangle {
  width: 2,
  height: 3,
};

println!(
  "The area of the rectangle is {}.",
  r.area()
);
```

## Trait

Un `trait` en Rust, es la forma que tenemos para encapsular comportamiento. Se podría asemejar con lo que es una interfaz en otros lenguajes como C#, pero sensiblemente diferente:

```rust
trait Shape {
    fn area(&self) -> u32;
}
```

Este `trait` indicaría que tenemos que nuestro objeto implementa una función llamada `area` que devuelve un número. Si quisieramos implementarlo para un `struct` existente:

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Shape for Rectangle {
    fn area(&self) -> u32 {
        self.height * self.width
    }
}
```

Ahora podríamos consumir el `trait` llamdo `Shape` de la siguiente manera:

```rust
fn print_area(shape: &dyn Shape) {
    println!("The area is {}", shape.area());
}

fn main() {
    let r = Rectangle { width: 2, height: 3 };
    print_area(&r);
}
```

Lo que más nos puede llamar la atención de este código es que usamos una palabra clave nueva: `dyn`. Esta palabra se usa al definir un tipo `trait`, para indicar de forma explícita que vamos a llamar a un método dentro de él. Esto es porque el sistema no tiene el tipo concreto de un `trait` y se pasa un puntero doble para detectar donde se alojan los métodos. El caso es que hay que usarlo para referenciarlo.

También podemos complicar un `trait` creando implementaciones por defecto:

```rust
trait Shape {
    fn get_name(&self) ->  &'static str;

    fn area(&self) -> u32;

    fn print_area(&self) {
        println!("The area of {} is {}", self.get_name(), self.area());
    }
}

struct Rectangle {
    width: u32,
    height: u32,
}

impl Shape for Rectangle {
    fn get_name(&self) ->  &'static str {
        "Rectangle"
    }

    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let r = Rectangle { width: 2, height: 3 };
    r.print_area();
    // The area of Rectangle is 6
}
```

E incluso podríamos declarar constructores:

```rust
struct User {
    name: &'static str
}

trait WithName {
    fn new(name: &'static str) -> Self;
}

impl WithName for User {
    fn new(name: &'static str) -> Self {
        User { name: name }
    }
}
```

Una forma muy potente de tratar y encapsular contratos y comportamientos. Además, recuerda mucho a los movimientos que se vienen haciendo en las últimas versiones de C#, en los que le van dando estas mismas funcionalidades a los objetos de tipo `interface` que existen en la plataforma de Microsoft.

## Enum

## Pattern Matching

## Generics

## Closures

## Iterators

## Common C/C++ problems

### NULL management

En Rust no existe el valor `null`, `NULL` o como quieras escribirlo. Para lidiar con este tipo de abstención de asignación, existe `Option<T>`. Un `enum` que nos ayudará a gestionar la ausencia de un valor en una variable:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

Su uso es bastante simple:

```rust
let none_number: Option<i32> = None;
let some_number = Some(15);

if none_number == None {
    println!("is none")
}

if some_number == Some(15) {
    println!("is 15")
}
```

[Tony Hoare](https://en.wikipedia.org/wiki/Tony_Hoare), el inventor del concepto de "referencia nula", llegó a pedir perdón en 2009 por haberlo introducido. Sus disculpas mencionaban que lo hizo porque era fácil de implementar, pero que jamás fue código seguro. Alegando que este error habría costado millones de millones de dolares en daños, miedo y diferentes problemas durante los últimos 40 años.

Rust no iba a caer en esta trampa a la hora de implementarse como un lenguaje moderno y seguro.

### Error Handling

La forma más sencilla de lanzar un error en Rust es usar la macro `panic`:

```rust
fn main() {
    panic!("crash and burn");
}
```

Pero la mayor parte de las veces, cuando encontramos un error programando, no es necesario parar la ejecución del programa. Simplementa nos basta con manejar el error. Para ello contaremos con `Result<T, E>`:

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

Un tipo `enum` que podremo usar en nuestros desarrollos y que encontraremos que se usa en practicamente todas las librería de Rust. Por ejemplo a la hora de abrir un archivo:

```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => panic!("Problem opening the file: {:?}", error),
    };
}
```

Además, gracias al *Pattern Matching* y a los descriptivos de los errores podremos realizar una lógica semejante, e incluso más potente, que la que podemos implementar con `try`, `catch` y las excepciones de otros lenguages de programación:

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {:?}", e),
            },
            other_error => {
                panic!("Problem opening the file: {:?}", other_error)
            }
        },
    };
}
```

### Smart pointers


## Conclusiones