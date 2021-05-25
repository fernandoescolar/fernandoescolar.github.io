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

### Lifecycle

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

### Super Structs

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

Declarando una función de esta forma, se puede llamar así:

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

### Enums


### Pattern Matching

### Smart pointers

