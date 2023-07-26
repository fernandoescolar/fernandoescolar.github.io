---
published: true
ID: 202307261
title: 'C#: class, struct o record'
author: fernandoescolar
post_date: 2023-07-26 01:04:36
layout: post
tags: csharp dotnet best-practices
background: '/assets/uploads/bg/programming2.jpg'
---

En este post vamos a ver las diferencias entre los tipos de datos de referencia `class`, los tipos de datos de valor `struct` y cómo encaja en todo este entramado de objetos los nuevos tipos `record` y `record struct` que han sido introducidos en las últimas versiones del lenguaje C#<!--break-->.

- [Introducción](#introduccion)<!-- table -->
- [Clase: `class`](#clase-class)
- [Struct: `struct`](#struct-struct)
- [Registro: `record`](#registro-record)
- [Registro estructura: `record struct`](#registro-estructura-record-struct)
- [Conclusiones](#conclusiones)

<span id="introduccion"></span>

El en mundo de la programación orientada a objetos, se define un objeto como una entidad que tiene un estado y un comportamiento. Y esto nos permite cumplir con el principio de encapsulación, que es uno de los pilares de la programación orientada a objetos.

La **encapsulación** es un principio de POO que permite ocultar los detalles internos de una clase y solo exponer una interfaz bien definida para interactuar con los objetos creados a partir de esa clase. Los campos y métodos de una clase pueden tener diferentes niveles de acceso (por ejemplo, público, protegido, privado), lo que controla qué partes del código pueden acceder y modificar esos miembros.

```csharp
// el objeto publico Beer
public class Beer
{
}

// el objeto protegido Water
protected class Water
{
}
```

Para almacenar el estado de un objeto en C#, utilizaremos **campos** y **propiedades**. Los campos son variables que almacenan datos relacionados con el objeto. Las propiedades son métodos que permiten acceder y modificar los campos de manera controlada. Las propiedades son útiles para aplicar lógica adicional, como validación, antes de leer o escribir un valor.

```csharp
public class Beer
{
    // campos o fields
    private string _name;
    private int _year;

    // propiedades o properties
    public string Name
    {
        get => _name;
        set => _name = value;
    }

    public int Year
    {
        get => _year;
        set => _year = value;
    }
}
```

El comportamiento de un objeto se define mediante **métodos**. Los métodos son bloques de código dentro de una clase que definen comportamientos. Pueden realizar acciones, manipular datos y devolver resultados. Los métodos también pueden tener diferentes niveles de acceso y pueden ser estáticos (métodos de clase) o de instancia (métodos de objeto).

```csharp
public class Beer
{
    // ...

    // método de instancia
    public void Drink()
    {
        Console.WriteLine("Drinking beer...");
    }

    // método de clase
    public static void Drink(Beer beer)
    {
        Console.WriteLine($"Drinking {beer.Name}...");
    }
}
```

Si queremos inicializar el estado de un objeto, podemos utilizar **constructores**. Los constructores son métodos especiales que se llaman cuando se crea un objeto a partir de una clase. Permiten inicializar los campos y realizar cualquier otra configuración necesaria para el objeto. C# admite constructores sin parámetros (por defecto) y constructores con parámetros para una inicialización más personalizada.

```csharp
public class Beer
{
    // ...

    // constructor por defecto
    public Beer()
    {
        _name = "Undefined";
        _year = 2000;
    }

    // constructor con parámetros
    public Beer(string name, int year)
    {
        _name = name;
        _year = year;
    }
}
```

Y si necesitamos realizar operaciones con nuestros objetos, podemos sobrecargar los operadores. La **sobrecarga de operadores** es una característica de C# que permite definir el comportamiento de los operadores integrados en el lenguaje. Por ejemplo, podemos definir cómo se suman dos objetos de una clase personalizada.

```csharp
public class Beer
{
    // ...

    // sobrecarga del operador +
    public static Beer operator +(Beer beer1, Beer beer2)
    {
        return new Beer
        {
            Name = $"{beer1.Name} {beer2.Name}",
            Year = beer1.Year + beer2.Year
        };
    }
}

var beer1 = new Beer("Mahou", 2000);
var beer2 = new Beer("San Miguel", 2000);

// usamos el operador +
var beer3 = beer1 + beer2;

Console.WriteLine($"Beer: {beer3.Name} - {beer3.Year}");
// Beer: Mahou San Miguel - 4000
```

Adicionalmente, C# admite el uso de **eventos** para permitir la comunicación entre objetos. Los eventos son notificaciones que se envían cuando ocurre algo dentro de un objeto y de lo que se quiera informar al exterior. Los objetos que deseen recibir notificaciones sobre un evento pueden suscribirse a él.

```csharp
public class Beer
{
    // ...

    // evento
    public event EventHandler<BeerEventArgs> Drunk;

    // método que lanza el evento
    public void RaiseDrinkEvent()
    {
        Drunk?.Invoke(this, new BeerEventArgs { Beer = this });
    }
}

// clase que representa los argumentos del evento
public class BeerEventArgs : EventArgs
{
    public Beer Beer { get; set; }
}
```

Y para escuchar el evento, podemos suscribirnos a él:

```csharp
var beer = new Beer();
// suscripción al evento
beer.Drunk += (sender, args) => Console.WriteLine($"Drinking {args.Beer.Name}...");
// lanzamiento del evento
beer.RaiseDrinkEvent();
```

Lo que sucederá es que cuando se lance el evento, se ejecutará el código que hemos definido en la suscripción al evento. Por lo que, en este caso, se imprimirá por pantalla el mensaje `Drinking Undefined...`.

Si queremos que cuando un objeto ya no sea necesario, se liberen los recursos que está utilizando, podemos implementar la interfaz `IDisposable` y definir el método `Dispose()`. Esto es lo que llamamos *finalizadores* y *destructores*.

```csharp
public class Beer : IDisposable
{
    // ...

    // finalizador
    ~Beer()
    {
        Dispose();
    }

    // destructor: método de la interfaz IDisposable
    public void Dispose()
    {
        Console.WriteLine("Disposing beer...");
    }
}
```

En C# otra característica importante es la **herencia**. La herencia es un concepto importante en POO que permite que una clase herede características (campos y métodos) de otra clase base. En C#, una clase puede heredar de una única clase base, pero puede implementar múltiples interfaces para lograr la herencia múltiple.

```csharp
// clase base
public class Beer
{
    // ...
}

// clase derivada
public class Lager : Beer
{
    // ...
}
```

Y, por último, una característica clave de POO, el **polimorfismo**, que permite que los objetos de diferentes clases se comporten de manera similar al acceder a ellos a través de una interfaz común. Esto se logra mediante la implementación de métodos virtuales o mediante interfaces.

```csharp
// clase base
public class Beer
{
    // método virtual
    public virtual void Drink()
    {
        Console.WriteLine("Drinking beer...");
    }
}

// clase derivada
public class Lager : Beer
{
    // método sobreescrito
    public override void Drink()
    {
        Console.WriteLine("Drinking lager...");
    }
}
```

El lenguaje de programación C# nos permite definir objetos de múltiples formas. Cada una de ellas con sus características y usos particulares. A continuación, vamos a verlas con detalle:

## Clase: `class`

Una clase es uno de los conceptos fundamentales de la programación orientada a objetos (POO) y es una plantilla o modelo para crear objetos que representan entidades en el mundo real o abstracto. En C#, la mayoría de las veces, trabajarás con clases, ya que son la base para crear objetos y encapsular datos y comportamientos relacionados.

Una clase es un tipo de referencia en C#. esto significa que se almacena en la memoria o **_heap_**, y cuando se crea una instancia de una clase, lo que almacenamos en una variable es un puntero de referencia a la ubicación de la memoria donde se encuentra el objeto.

Si, por ejemplo, tenemos una clase `Beer`:

```csharp
public class Beer
{
    public string Name { get; set; }
    public int Year { get; set; }
}
```

Y creamos una instancia de esta:

```csharp
var beer1 = new Beer { Name = "Estrella Galicia", Year = 1906 };
Console.WriteLine(beer1.Name); // Estrella Galicia
```

Si ahora creamos una nueva variable y le asignamos el valor de la variable `beer1`:

```csharp
var beer2 = beer1;
beer2.Name = "Mahou";
Console.WriteLine(beer2.Name); // Mahou
Console.WriteLine(beer1.Name); // Mahou
```

Como podemos ver, al modificar el valor de la variable `beer2`, también se modifica el valor de la variable `beer1`. Esto es porque ambas variables apuntan a la misma ubicación de memoria, por lo que, al modificar el valor de una, también se modifica el valor de la otra.


## Struct: `struct`

Una estructura es un tipo de valor en C#. Se utiliza para agrupar un conjunto de campos relacionados que representan una única entidad. Las estructuras son tipos de valor porque se almacenan en la pila o **_stack_** en lugar del **_heap_**, lo que las hace más eficientes en términos de rendimiento, especialmente cuando se manejan objetos pequeños y livianos.

```csharp
public struct Beer
{
    public string Name { get; set; }
    public int Year { get; set; }
}
```

Si ahora creamos una instancia de esta:

```csharp
var beer1 = new Beer { Name = "Estrella Galicia", Year = 1906 };
Console.WriteLine(beer1.Name); // Estrella Galicia
```

Y creamos una nueva variable y le asignamos el valor de la variable `beer1`:

```csharp
var beer2 = beer1;
beer2.Name = "Mahou";
Console.WriteLine(beer2.Name); // Mahou
Console.WriteLine(beer1.Name); // Estrella Galicia
```

Como podemos ver, al modificar el valor de la variable `beer2`, no se modifica el valor de la variable `beer1`. Esto es porque al asignar una variable del `stack` a otra, se crea una copia de esta, por lo que, al modificar el valor de una, no se modifica el valor de la otra.

¿Cuándo deberíamos usar `struct` en lugar de `class`?

- Cuando de forma lógica representan un único valor similar a un tipo primitivo (int, double, etc.). Por ejemplo, un `int` representa un único valor entero. O una posición en el espacio 2D se puede representar como una tupla de dos valores `int` (`x`, `y`), por lo que podríamos crear un `struct` llamado `Point` y compuesto por dos propiedades.

- Cuando el objeto es pequeño y liviano. Si el objeto es grande y complejo, es más eficiente usar una clase, ya que las estructuras se copian cuando se pasan como argumentos o se asignan a otras variables, lo que puede afectar el rendimiento. Recordemos que el **_stack_** tiene un tamaño mucho más limitado que el **_heap_**.

- Si el objeto no va a ser modificado. Cuando asignamos una estructura a otra, se crea una copia de esta, por lo que es muy sencillo que terminemos creando copias con modificaciones en lugar de estar modificando el objeto original.

- Si no tenemos planeado hacer _box_ o _unbox_. Una práctica habitual es pasar un objeto de un tipo a otro que es su base (_box_) o realizar un sondeo de un objeto de un tipo a otro que es su derivado (_unbox_). Si estás usando estructuras, estas operaciones van a llenar el **_stack_** de copias de tu objeto.

## Registro: `record`

A partir de C# 9.0, se introdujo la palabra clave `record` que se utiliza para definir tipos inmutables y con funcionalidad especial para la igualdad estructural. Los registros están diseñados para representar datos que son principalmente para lectura y almacenamiento. Internamente, los registros son una especie de clase, pero con algunas características adicionales.

```csharp
public record Beer(string Name, int Year);
```

En un registro los parámetros del constructor son propiedades inmutables por diseño, por lo que, para modificar su valor, debemos crear una nueva instancia del `record`. También podemos usar la palabra clave `with` para crear una nueva instancia basada en otra existente y modificando algunas de sus propiedades:

```csharp
var b1 = new Beer ("Estrella Galicia", 1906);
Console.WriteLine(b1.Name); // Estrella Galicia

var b2 = b1 with { Name = "Estrella Damm" };
Console.WriteLine(b1.Name); // Estrella Galicia
Console.WriteLine(b2.Name); // Estrella Damm
```

Además, los registros tienen funcionalidad especial para la igualdad estructural. Esto significa que dos registros son iguales si tienen el mismo tipo y sus propiedades tienen los mismos valores. Por ejemplo:

```csharp
record Point(int X, int Y);

var p1 = new Point(1, 2);
var p2 = new Point(1, 2);

Console.WriteLine(p1 == p2); // True
```

Y podemos desestructurar un registro en variables individuales:

```csharp
var (x, y) = p1;
Console.WriteLine(x); // 1
Console.WriteLine(y); // 2
```

Usarías un `record` en lugar de una `class` en situaciones en las que necesitas representar datos inmutables o para beneficiarte de la funcionalidad proporcionada automáticamente, como igualdad estructural o la descomposición. Si buscas alguna de las siguientes características, un registro es una buena opción:

- **Modelado de datos inmutables**: Si necesitas representar una entidad que no cambiará después de su creación, como un punto en un plano, una fecha o cualquier objeto que se suponga inmutable, los registros son una elección natural. Al ser inmutables, los registros garantizan que los datos no cambiarán inadvertidamente en diferentes partes del código, lo que facilita la comprensión y el mantenimiento del programa.

- **Comparación por igualdad estructural**: Cuando necesitas comparar objetos por su contenido en lugar de su referencia, los registros son convenientes. Al utilizar registros, obtienes automáticamente una implementación adecuada del método Equals que verifica la igualdad de los campos del registro. Esto es útil para colecciones, búsquedas y otras operaciones en las que necesitas comparar objetos por sus valores y no por sus ubicaciones en memoria.

- **Sintaxis concisa**: Los registros ofrecen una sintaxis más concisa para definir clases inmutables. Sin la necesidad de escribir constructores, propiedades y métodos de igualdad, puedes llegar a definir una clase de datos en una sola línea de código.

- **Patrones de desestructuración**: Los registros admiten patrones de desestructuración, lo que significa que puedes descomponer un registro en sus campos individuales fácilmente. Esto puede simplificar el código en situaciones en las que necesitas acceder a los campos con frecuencia.

- **Patrones _Value Object_**: Los registros se ajustan bien al patrón de diseño _Value Object_, que se refiere a objetos que son iguales por su valor, no por su identidad. Este patrón es útil para representar tipos de datos que no tienen una identidad única y se utilizan principalmente para transmitir datos.

Eso sí, es importante que sepas que a día de hoy un `record` no es más que una `class` con algunas características adicionales, y todo lo que hacemos con el primero, lo podemos hacer con la segunda. Pero no al revés. Por ejemplo, si quisiéramos crear un objeto inmutable, podríamos hacerlo con una `class` usando la palabra clave `init`:

```csharp
public class Point
{
    public int X { get; init; }
    public int Y { get; init; }

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }
}
```

Si quisiéramos que dos instancias de `Point` fueran iguales si sus propiedades tienen los mismos valores, podríamos implementar el método `Equals` y los operadores `==` y `!=`:

```csharp
public class Point
{
    // ...

    public override bool Equals(object obj)
    {
        if (obj is Point other)
        {
            return X == other.X && Y == other.Y;
        }

        return false;
    }

    public static bool operator ==(Point left, Point right)
        => left.Equals(right);

    public static bool operator !=(Point left, Point right)
        => !left.Equals(right);
}
```

Y si ahora creamos dos instancias de `Point` con los mismos valores, al compararlos con el operador `==` nos devolverá `true`:

```csharp
var p1 = new Point(1, 2);
var p2 = new Point(1, 2);

Console.WriteLine(p1 == p2); // True
```

Para poder desestructurar, debemos implementar el método `Deconstruct` en la clase:

```csharp
public class Point
{
    // ...

    public void Deconstruct(out int x, out int y)
    {
        x = X;
        y = Y;
    }
}
```

Y ahora podemos desestructurar un objeto de tipo `Point` en variables individuales:

```csharp
var (x, y) = p1;
Console.WriteLine(x); // 1
Console.WriteLine(y); // 2
```

En definitiva, los `record` son una forma más sencilla de crear objetos inmutables, pero no son la única. Y si no necesitas la funcionalidad adicional que proporcionan, puedes seguir usando `class` para crear objetos con características similares.

## Registro estructura: `record struct`

A partir de C# 10.0, se introdujo la palabra clave `record struct` que mezcla las características de los `record` y las `struct`. Tendremos una forma sencilla de crear objetos inmutables y que además sean tipos por valor. Con las ventajas e inconvenientes que esto conlleva.

```csharp
public record struct Point(int X, int Y);
```

En este caso, su escenario de uso es muy concreto: cuando necesitemos las características que nos da un tipo `record` y además manejemos un dato que si almacenáramos en un tipo `struct` sería más eficiente.

## Conclusiones

Las clases son el tipo base que generalmente vamos a usar en nuestros desarrollos. Pero si buscamos eficiencia a la hora de gestionar datos que tienen un tamaño pequeño y están definidos por sus valores, podemos usar `struct`.

Si queremos características especiales para manejo de datos, inmutabilidad, igualdad estructural o desestructuración, podemos usar `record`. Y si además queremos que sea un tipo por valor, porque es pequeño y cumple con las características de `struct`, entonces, podemos usar `record struct`.
