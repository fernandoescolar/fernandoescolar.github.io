---
published: true
ID: 202106021
title: 'Kata FizzBuzz en Rust'
author: fernandoescolar
post_date: 2021-06-02 01:05:31
layout: post
tags: rust
background: '/assets/uploads/bg/crab2.jpg'
---

Dicen las leyendas que uno de los juegos de beber más conocidos de Inglaterra es el FizzBuzz. El *quinito* en cuestión consiste en que hay que ir contando en un corro desde 1 en adelante. Cada persona va diciendo un número secuencialmente. Con 3 condiciones: si el número es multiplo de 3 en lugar del número, debes decir "Fizz", si es múltiplo de 5 "Buzz" y si es múltiplo de ambos "FizzBuzz". El que falle al decir su número o palabra, bebe<!--break-->. Parece fácil, pero prueba a hacerlo con unos chupitos de por medio.

Lo malo es que luego [vas a la wikipedia](https://en.wikipedia.org/wiki/Fizz_buzz) y este juego tan divertido parace ser que está enfocado en los niños y que les ayuda a aprender multiplicaciones y divisiones... qué desilusión...

De cualquier manera, es una *kata* muy conocida de programación. Es simple, ayuda a aprender las meecánicas de TDD y expone una forma de trabajar del desarrollador que la resuelve.

Podríamos definir los requisitos de nuestro ejercicio como:

> Desarrollar un programa que muestre en pantalla los números del 1 al 100, sustituyendo los múltiplos de 3 por la palabra "Fizz", los múltiplos de 5 por "Buzz" y los múltiplos de ambos por la palabra "FizzBuzz".

Y siguiendo las enseñanzas del [artículo anterior sobre Rust](/2021/05/26/rust-intro/), vamos a resolver esta *kata* usando este lenguaje. Atentos que vienen curvas ;).

```bash
$ cargo new fizzbuzz
     Created binary (application) `fizzbuzz` package
```

```bash
cd fizzbuzz
code .
```

```rust
fn main() {
    println!("Fizz Buzz game");
}

fn fizzbuzzer(number: u8) -> &str {
    ""
}
```


```bash
$ cargo build
   Compiling fizzbuzz v0.1.0 (C:\projects\fizzbuzz)
error[E0106]: missing lifetime specifier
 --> src\main.rs:5:30
  |
5 | fn fizzbuzzer(number: u8) -> &str {
  |                              ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value with an elided lifetime, but the lifetime cannot be derived from the arguments
help: consider using the `'static` lifetime
  |
5 | fn fizzbuzzer(number: u8) -> &'static str {
  |                              ^^^^^^^^

error: aborting due to previous error

For more information about this error, try `rustc --explain E0106`.
error: could not compile `fizzbuzz`

To learn more, run the command again with --verbose.
```

```rust
fn fizzbuzzer(number: u8) -> &'static str {
    ""
}
```

```bash
$ cargo build
   Compiling fizzbuzz v0.1.0 (C:\projects\fizzbuzz)
warning: unused variable: `number`
 --> src\main.rs:5:15
  |
5 | fn fizzbuzzer(number: u8) -> &'static str {
  |               ^^^^^^ help: if this is intentional, prefix it with an underscore: `_number`
  |
  = note: `#[warn(unused_variables)]` on by default

warning: function is never used: `fizzbuzzer`
 --> src\main.rs:5:4
  |
5 | fn fizzbuzzer(number: u8) -> &'static str {
  |    ^^^^^^^^^^
  |
  = note: `#[warn(dead_code)]` on by default

warning: 2 warnings emitted

    Finished dev [unoptimized + debuginfo] target(s) in 0.69s
```

```rust
#[allow(dead_code)]
fn fizzbuzzer(_number: u8) -> &'static str {
    ""
}
```

```bash
$ cargo build
   Compiling fizzbuzz v0.1.0 (C:\projects\fizzbuzz)
    Finished dev [unoptimized + debuginfo] target(s) in 0.76s
```

```rust
#[cfg(test)]
mod fizzbuzz_tests {
    #[test]
    fn test_works() {
        assert_eq!(1 + 1, 2);
    }
}
```

```bash
cargo test
```

```rust
#[cfg(test)]
mod fizzbuzz_tests {
    use super::fizzbuzzer;

    #[test]
    fn when_input_is_1_returns_1() {
        let input: u8 = 1;
        let expected = "1";
        let actual = fizzbuzzer(input);

        assert_eq!(expected, actual);
    }
}
```

```bash
cargo test
```

```rust
#[allow(dead_code)]
fn fizzbuzzer(_number: u8) -> &'static str {
    "1"
}
```

```rust
#[test]
fn when_input_is_2_returns_2() {
    let input: u8 = 2;
    let expected = "2";
    let actual = fizzbuzzer(input);
    assert_eq!(expected, actual);
}
```

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> &'static str {
    number.to_string()
}
```

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
    number.to_string()
}
```

```rust
#[test]
fn when_input_is_3_returns_fizz() {
    let input: u8 = 3;
    let expected = "fizz";
    let actual = fizzbuzzer(input);

    assert_eq!(expected, actual);
}
```

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
    number.to_string()
}
```

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
    if number == 3 { String::from("fizz") }
    else { number.to_string() }
}
```

```rust
#[test]
fn when_input_is_4_returns_4() {
    let input: u8 = 4;
    let expected = "4";
    let actual = fizzbuzzer(input);

    assert_eq!(expected, actual);
}
```

```rust
#[test]
fn when_input_is_5_returns_buzz() {
    let input: u8 = 5;
    let expected = "buzz";
    let actual = fizzbuzzer(input);

    assert_eq!(expected, actual);
}
```

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
    if number == 3 { String::from("fizz") }
    else if number == 5 { String::from("buzz") }
    else { number.to_string() }
}
```

```rust
#[test]
fn when_input_is_6_returns_fizz() {
    let input: u8 = 6;
    let expected = "fizz";
    let actual = fizzbuzzer(input);

    assert_eq!(expected, actual);
}
```

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
    if number % 3 == 0 { String::from("fizz") }
    else if number == 5 { String::from("buzz") }
    else { number.to_string() }
}
```

```rust
#[test]
fn when_input_is_10_returns_buzz() {
    let input: u8 = 10;
    let expected = "buzz";
    let actual = fizzbuzzer(input);

    assert_eq!(expected, actual);
}
```

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
    if number % 3 == 0 { String::from("fizz") }
    else if number % 5 == 0 { String::from("buzz") }
    else { number.to_string() }
}
```

```rust
#[test]
fn when_input_is_15_returns_buzz() {
    let input: u8 = 15;
    let expected = "fizzbuzz";
    let actual = fizzbuzzer(input);

    assert_eq!(expected, actual);
}
```

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
    if number % 15 == 0 { String::from("fizzbuzz") }
    else if number % 3 == 0 { String::from("fizz") }
    else if number % 5 == 0 { String::from("buzz") }
    else { number.to_string() }
}
```

```bash
$ cargo test
   Compiling fizzbuzz v0.1.0 (C:\projects\fizzbuzz)
    Finished test [unoptimized + debuginfo] target(s) in 0.80s
     Running unittests (target\debug\deps\fizzbuzz-a943ca5cd4b92e47.exe)

running 7 tests
test fizzbuzz_tests::when_input_is_10_returns_buzz ... ok
test fizzbuzz_tests::when_input_is_15_returns_buzz ... ok
test fizzbuzz_tests::when_input_is_1_returns_1 ... ok
test fizzbuzz_tests::when_input_is_2_returns_2 ... ok
test fizzbuzz_tests::when_input_is_5_returns_buzz ... ok
test fizzbuzz_tests::when_input_is_3_returns_fizz ... ok
test fizzbuzz_tests::when_input_is_6_returns_fizz ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
```


```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
    match (number % 3, number % 5) {
        (0, 0) => String::from("fizzbuzz"),
        (0, _) => String::from("fizz"),
        (_, 0) => String::from("buzz"),
        (_, _) => number.to_string()
    }
}
```

```rust
fn main() {
    println!("Fizz Buzz game");
    println!("-----------------");
    for i in 1..101 {
        println!("{}", fizzbuzzer(i));
    }
}

fn fizzbuzzer(number: u8) -> String {
    match (number % 3, number % 5) {
        (0, 0) => String::from("fizzbuzz"),
        (0, _) => String::from("fizz"),
        (_, 0) => String::from("buzz"),
        (_, _) => number.to_string()
    }
}
```


https://gist.github.com/fernandoescolar/b50e848b2d4bacd96155924fa356282d