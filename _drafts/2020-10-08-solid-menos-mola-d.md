---
published: true
ID: 202010081
title: 'SOLID menos mola (D)'
author: fernandoescolar
post_date: 2020-10-08 02:16:54
layout: post
---

La *D* de *SOLID* se refiere al principio de inversión de dependencia o **DIP** por sus siglas en inglés (**D**ependency **I**nversion **P**rinciple). Se puede resumir con que una clase debe depender de las abstracciones, no de las concreciones. Aunque [Robert C. Martin](https://twitter.com/unclebobmartin) es mucho más específico y realiza una definición dividida en dos partes<!--break-->:

> A. *Los módulos de alto nivel no deben depender de bajo módulos de nivel. Ambos deben depender de las abstracciones.*

> B. *Las abstracciones no deben depender de los detalles. Los detalles detalles deben depender de las abstracciones.*

[Uncle Bob](https://twitter.com/unclebobmartin) lo explica mediante un ejemplo, [en su ensayo sobre **DIP**](https://web.archive.org/web/20110714224327/http://www.objectmentor.com/resources/articles/dip.pdf), que voy a intentar traducir a C# a continuación:

```csharp
public class Copier
{
  private const char EndOfLine = '\0';

  public void Copy()
  {
    char c;
    while ((c = ReadCharFromConsole()) != EndOfLine)
      WriteCharInPrinter(c);
  }

  public char ReadCharFromConsole() { ... }

  public void WriteCharInPrinter(char c) { ... }
}
```

Tenemos una clase llamada `Copier`. Esta clase realiza la copia `char` a `char` de lo que escribes en consola con dirección la impresora. En este caso, nuestra clase tiene una dependencia directa con los módulos de bajo nivel para la lectura de la consola y para la escritura en la impresora. En *.Net* esas capacidades las encontramos en los artefactos `System.Console` y `System.Drawing.Printing.PrintDocument`.

Si quisieramos darle la capacidad de escribir en la impresora o en un archivo en disco, podríamos ampliar nuestro código con:

```csharp
public enum OutputDevice { Printer, Disk };
```

`OutputDevice` es una enumeración que nos aportará el destino de los caracteres que estoy escribiendo. Así que tendremos que modificar nuestra clase original con algo parecido a esto:

```csharp
public void Copy(OutputDevice device)
{
  char c;
  while ((c = ReadCharFromConsole()) != EndOfLine)
    if (device == OutputDevice.Printer)
      WriteCharInPrinter(c);
    else
      WriteCharInDisk(c);
}

public char ReadCharFromConsole() { ... }
public void WriteCharInPrinter(char c) { ... }
public void WriteCharInDisk(char c) { }
}
```

Este cambio también implicaría que estaríamos añadiendo una dependencia de `System.IO.File`, el artefacto mediante el cual podemos gestionar archivos en disco.

Al usar tantos módulos externos dentro de nuestra clase `Copier`, vamos a tener un problema a la hora de realizar los *unit tests*. Una prueba unitaria no debería crear archivos en disco o realizar una impresión. Y sobre todo, una prueba unitaria no debería quedarse a la espera de que el usuario escriba algo en la consola.

Además tenemos el problema de que cada nuevo comportamiento que le queramos añadir será una nueva dependencia, un nuevo método y una nueva condición en el bucle.

Todo esto se soluciona, como dice el punto *A* del principio de inversión de dependencia, añadiendo abstracciones:

```csharp
public interface ICharReader
{
    char Read();
}
public interface ICharWriter
{
    void Write(char c);
}
```

Y diseñando nuestros módulos dependan de estas:

```csharp
public class Copier
{
  private const char EndOfLine = '\0';
  private readonly ICharReader _reader;
  private readonly ICharWriter _writer;

  public Copier(ICharReader reader, ICharWriter writer)
  {
      _reader = reader;
      _writer = writer;
  }

  public void Copy()
  {
    char c;
    while ((c = _reader.Read()) != EndOfLine)
      _writer.Write(c);
  }
}
```

Gracias a esta implementación, podríamos hacer pruebas unitarias facilmente usando *test doubles* para simular las abstracciones de las que depende nuestra clase:

```csharp
[Fact]
public void Copier_Does_not_write_When_reads_EOF()
{
  var reader = new Mock<ICharReader>();
  var writer = new Mock<ICharWriter>(MockBehavior.Strict);
  reader.Setup(x => x.Read()).Returns('\0');

  var target = new Copier(reader.Object, writer.Object);
  target.Copy();

  writer.Verify();
}
```

Y también añadimos la posibilidad de realizar composición para dotar a nuestro código de más opciones de lectura y escritura:

```csharp
public class ConsoleCharReader : ICharReader { ... }
public class PrinterCharWriter : ICharWriter { ... }
public class FileCharWriter : ICharWriter { ... }

var copyToPrinter = new Copier(new ConsoleCharReader(), new PrinterCharWriter());
var copyToFile    = new Copier(new ConsoleCharReader(), new FileCharWriter());
```

El buen rendimiento está en los detalles
