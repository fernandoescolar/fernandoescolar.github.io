---
published: true
ID: 202009091
title: 'SOLID menos mola (O)'
author: fernandoescolar
post_date: 2020-09-09 02:16:54
layout: post
---

La *O* de *SOLID* se refiere al principio de abierto/cerrado o **OCP** por sus siglas en inglés (**O**pen/**C**losed **P**rinciple). Se puede definir como que una clase debe estar abierta a la extensión y cerrada a la modificación. Fue acuñado por primera vez por [Bertrand Meyer](https://twitter.com/Bertrand_Meyer). Pero no fue hasta que [Robert C. Martin](https://twitter.com/unclebobmartin) lo reformuló e introdujo dentro del acrónimo *SOLID*, que se popuralizó.<!--break-->

Siguiendo [la definición de Uncle Bob](https://web.archive.org/web/20060822033314/http://www.objectmentor.com/resources/articles/ocp.pdf) el **OCP** se rije por dos propiedades:

- *Open For Extension*: esto significa que el comportamiento de un módulo puede ser extendido. Y expone que esto se consigue gracias a una de las propiedades de la programación orientada a objetos: el polimorfismo.
- *Closed for Modification*: que dice que el código fuente de un módulo es inviolable. Que nadie debería poder realizar cambios en él.

El truco es más simple de lo que parece: consiste en que todo objeto tenga una clase abstracta base que podemos sobreescribir y aplicar patrones conocidos.

Si tuvieramos un sistema que dibuja figuras:

```csharp
class Line { ... }
class Circle { ... }
class Rectangle { ... }

class Drawer
{
  public static void Draw(object o)
  {
    if (o is Line l) { /*Draw line stuff*/ }
    if (o is Circle c) { /*Draw circle stuff*/ }
    if (o is Rectangle r) { /*Draw rectangle stuff*/ }
  }
}
```

Podríamos hacerlo extensible creando una clase base abstracta con el contrato de dibujado y una implementación para cada una de las figuras:

```csharp
abstract class Shape
{
  public abstract void Draw();
}

class Line : Shape
{
  public void Draw() { /*Draw line stuff*/ }
}

class Circle : Shape
{
  public void Draw() { /*Draw circle stuff*/ }
}

class Rectangle : Shape
{
  public void Draw() { /*Draw rectangle stuff*/ }
}

class Drawer
{
  public static void Draw(object o)
  {
    if (o is Shape s) s.Draw();
  }
}
```

Pero en un futuro podríamos querer añadir por ejemplo un recuadro rojo cuando algo esté seleccionado. Para esto podríamos poner todos los métodos como extensibles y crear nuevas clases tipo:

```csharp
class Line : Shape
{
  public virtual void Draw() { /*Draw line stuff*/ }
}

class Circle : Shape
{
  public virtual void Draw() { /*Draw circle stuff*/ }
}

class Rectangle : Shape
{
  public virtual void Draw() { /*Draw rectangle stuff*/ }
}

class RedBorderedLine : Line
{
  public override void Draw()
  {
    /*Draw red border*/
    base.Draw();
  }
}

class RedBorderedCircle : Circle
{
  public override void Draw()
  {
    /*Draw red border*/
    base.Draw();
  }
}

class RedBorderedRectangle : Rectangle
{
  public override void Draw()
  {
    /*Draw red border*/
    base.Draw();
  }
}
```

O podríamos obtar por el patrón *Decorator* y así prevendríamos futuros cambios compuestos, como borde rojo, fondo azul y un emote, junto con mi figura.

Así que crearíamos nuestros decoradores:

```csharp
abstract class Decorator
{
  public abstract void Decorate(Shape shape);
}

class RedBorderedDecorator : Decorator
{
  public virtual void Decorate(Shape shape) { /*Draw red border*/ }
}

class LineDecorator : Decorator
{
  public virtual void Decorate(Shape shape) { /*Draw line stuff*/ }
}

class CircleDecorator : Decorator
{
  public virtual void Decorate(Shape shape) { /*Draw circle stuff*/ }
}

class RectangleDecorator : Decorator
{
  public virtual void Decorate(Shape shape) { /*Draw rectangle stuff*/ }
}
```

Modificaríamos nuestro original para que utilizara los decoradores que hemos creado:

```csharp
abstract class Shape
{
  private readonly Decorator _decorator;

  public Shape(Decorator decorator)
  {
      _decorator = decorator;
  }

  public bool IsSelected { get; set; }

  public virtual void Draw()
  {
      if (IsSelected)
      {
          new RedBorderedDecorator().Decorate(this);
      }

      _decorator.Decorate(this);
  }
}

class Line : Shape
{
  public Line() : base(new LineDecorator()) { }
}

class Circle : Shape
{
  public Circle() : base(new CircleDecorator()) { }
}

class Rectangle : Shape
{
  public Rectangle() : base(new RectangleDecorator()) { }
}
```

Pero aquí hemos hecho trampa. Si os fijais hemos añadido una propiedad y quizá en un futuro esa propiedad no deba de estar en nuestro código, así que lo mejor sería refactorizar este código y por ejemplo, usar un patrón *Visitor* para cambiar el estado de nuestra figura:

```csharp
abstract class Visitor
{
  public abstract void Visit(Shape shape);
}

abstract class SelectVisitor
{
  public abstract void Visit(Shape shape)
  {
      shape.AddDecorator(new RedBorderedDecorator());
  }
}

abstract class UnselectVisitor
{
  public abstract void Visit(Shape shape)
  {
      shape.RemoveDecorator(typeof(RedBorderedDecorator));
  }
}

abstract class Shape
{
  private readonly List<Decorator> _decorators;

  public Shape(Decorator decorator)
  {
      _decorators = new List<Decorator> { decorator };
  }

  public void AddDecorator(Decorator d) { ... }

  public void RemoveDecorator(Type t) { ... }

  public virtual void Draw()
  {
      _decorators.ForEach(d => d.Decorate(this));
  }
}
```

Para aplicar a estos visitantes, necesitaremos otro tipo de elemento, como por ejemplo un *Command*. Aplicando este patrón crearíamos acciones que se pueden ejecutar en nuestro sistema:

```csharp
abstract class Command
{
  public abstract void Execute(Manager manager, Shape shape);
}

class SelectCommand : Command
{
  private readonly _selectVisitor = new SelectVisitor();
  private readonly _unselectVisitor = new UnselectVisitor();

  public virtual void Execute(Manager manager, Shape shape)
  {
    manager.Shapes.ToList().ForEach(x => _unselectVisitor.Visit(x));
    _selectVisitor.Visit(shape);
  }
}
```

Y finalmente para orquestar esos *Commands* crearemos otra clase que nos servirá de ayuda:

```csharp
class Manager
{
  private readonly List<Shape> _shapes = new List<Shape>();
  private readonly IDictionary<string, Command> _commands;

  public Manager(IDictionary<string, Command> commands)
  {
    _commands = commands;
  }

  public IEnumerable<string> Commands { get => _commands.Keys; }

  public IEnumerable<Shape> Shapes { get => _shapes; }

  public void AddShape(Shape s)
  {
      _shapes.Add(s);
  }

  public void RemoveShape(Shape s)
  {
      _shapes.Remove(s);
  }

  public void DoCommand(string commandKey, Shape s)
  {
      if (_commnads.ContainsKey(commandKey))
      {
          _commnads[commandKey].Execure(this, s);
      }
  }
}
```

De esta manera, nuestro programa estará abierto a la extensión:

- Si quisieramos añadir o modificar una figura, añadiríamos un nuevo objeto que heredara de `Shape` y otro que lo hiciera de `Decorator` para dibujarla en pantalla.
- Si quisiéramos añadir o modificar una característica de dibujado, crearíamos un nuevo objeto de tipo `Decorator`.
- Si quisiéramos añadir o modificar una característica de dibujado condicional, además de lo que hicimos en el paso anterior, crearíamos una serie de objetos de tipo `Visitor` que cambiaran el listado de decoradores de nuestra figura.
- Si quisieramos añadir acciones a realizar en una lista de figuras, crearíamos un nuevo objeto tipo `Command`.
- Si quisieramos borrar alguno de los objetos que ya existen, solo tendríamos que ignorarlos.

Y cerrado a la modificación, porque todo cambio consistirá en crear nuevos objetos y/o ignorar los que ya existen.

Si bien es verdad que se ha incrementado un poco la complejidad del sistema, como estamos usando patrones conocidos, a nuestro equipo de programadores no les importará demasiado. Sería pagar un poco de complejidad a cambio de que todo lo que está hecho, se tenga la seguridad de que no se va tener que tocar jamás ¿Quién no firmaría esto ahora mismo para sus desarrollos?

Ahora surge un nuevo problema, empieza un *sprint* y tenemos una nueva feature:
- Añadir colores al pintado de la figura

Siguiendo el **OCP** para poder pintar en colores, no podemos modificar el código existente, luego tendríamos que crear un nuevo conjunto de decoradores:

```csharp
abstract class ColoredDecorator : Decorator
{
  protected ColoredDecorator(Color color)
  {
      Color = color;
  }

  protected Color Color { get; private set; }
}

class ColoredBorderedDecorator : ColoredDecorator
{
  public ColoredBorderedDecorator(Color color): base(color) { }
  public virtual void Decorate(Shape shape) { /*Draw red border*/ }
}

class ColoredLineDecorator : ColoredDecorator
{
  public ColoredLineDecorator(Color color): base(color) { }
  public virtual void Decorate(Shape shape) { /*Draw line stuff*/ }
}

class ColoredCircleDecorator : ColoredDecorator
{
  public ColoredLineDecorator(Color color): base(color) { }
  public virtual void Decorate(Shape shape) { /*Draw circle stuff*/ }
}

class ColoredRectangleDecorator : ColoredDecorator
{
  public ColoredLineDecorator(Color color): base(color) { }
  public virtual void Decorate(Shape shape) { /*Draw rectangle stuff*/ }
}
```

Y lo mismo para los *Visitors* y los *Commands*. Y tendríamos que crear alguna forma de que los commands recibieran el parámetro de color de forma dinámica, así que al final terminaríamos reescribiendo la implementación completa del `Manager` llamandolo `ColoredManager` o recubriéndola en un *wrapper*.

El caso es que en un desarrollo normal terminaremos o bien haciendo *Copy & Paste* de todo nuestro código cientos de veces para crear un objeto nuevo con una nueva capacidad, o bien extendiendo de unas bases que en un principio no contenían toda la complejidad del sistema.

¿Os imaginais un año un equipo de 4 personas desarrollando este proyecto para ir dotándolo de más características? Imagino una cantidad de objetos inabarcable. Algo que a una persona nueva en el proyecto le sería practicamente incomprensible por lo distribuida que estaría la información.

Y es que, hemos caído en nuestra propia trampa: no podemos modificar, solo extender. Esto implica que tenemos que programar haciendo que nuestro código sea extensible en todos aquellos puntos en los que podría tener que ser modificado en el futuro. Pero hasta donde sé, nunca he conocido un programador adivino que vea cómo va a evolucionar un producto en el futuro. Al menos no en su totalidad.

Por esta razón, [Uncle Bob](https://twitter.com/unclebobmartin) decidió [reformular en 2014 su propuesta de OCP](https://blog.cleancoder.com/uncle-bob/2014/05/12/TheOpenClosedPrinciple.html). En este nuevo documento nos habla del uso de sistemas de *plugins*, como los que usan nuestro IDEs preferidos, para llevar poner en práctica este principio. Y aunque creo que es muy interesante esta propuesta, también creo que no todas las aplicaciones que he programado necesiten un sistema de complementos para funcionar bien y que su código sea "bueno".

El ejemplo que hemos expuesto es un buen código. Sigue a rajatabla **OCP**. Pero llega un momento en el que, en dependencia de la *feature* que tengamos que implementar, creo que mejoraría más modificando ciertos objetos que añadiendo extensiones, derivaciones o *plugins*.

Porque el desarrollo de software, la gestión del ciclo de vida de una aplicación, las metodologías ágiles, las prácticas XP (e**X**treme **P**rogramming) y todo lo que lo rodea, va en dirección de adaptarse al cambio, no a preverlo. Y cuando un requisito del sistema cambia, significa que tu código no es válido y tienes que reemplazarlo.

## Hay vida después de OCP

He de reconocer que el trabajo de [Uncle Bob](https://twitter.com/unclebobmartin) (Robert C. Martin) me ayuda a ser mejor programador. Cada vez que leo uno de sus libros o veo una de sus charlas, aprendo algo. Incluso si no es la primera vez que lo hago. Y los principios **SOLID**, y en concreto el **OCP**, no son una excepción. Mi consejo es que:

- Si consideras que este principio es una mierda, acostúmbrate a seguirlo siempre.
- Si siempre lo sigues y consideras que este artículo es una mierda, sigue aplicándolo.
- Y si lo has aplicado hasta la extenuación y te surgen dudas, sigue leyendo.

Debemos ser críticos con todo lo que hacemos y encontrar esos puntos débiles en las "reglas" que seguimos al programar:

- Si tengo que estar cerrado a la modificación ¿Cómo puedo predecir qué código va a cambiar para hacerlo extensible?
- Si intento prever todos los cambios que se pueden dar en un sistema ¿Qué pasa con eso de "adaptarse al cambio" que promueve el desarrollo *agile*?
- ¿Es este principio una oposición directa a <abbr title="You Aren't Gonna Need It">YAGNI</abbr>?
- ¿Es más importante estar abierto a la extensión y cerrado a la modificación que el principio <abbr title="Don't Repeat Yourself">DRY</abbr>?
- ¿Es mejor tener un sistema abierto a la extensión o una aplicación que se ciña a hacer lo que dice que debe hacer?

Afortunadamente no todo en este mundo es **SOLID**. Existen multitud de principios y reglas de programación que son muy válidas también. Antes que seguir el **OCP** creo que sería interesante pensar en uno de [los valores en los que se basa XP](http://www.extremeprogramming.org/values.html) (e**X**treme **P**rogramming):

- *simplicity*: Es mejor hacer una cosa simple hoy y pagar un poco más mañana para cambiarlo, que hacer una cosa más complicada hoy que jamás vaya a ser utilizada.

Y después tendría en cuenta seguir el abierto/cerrado procurando no contradecir dos de las [*four rules of simple design*](https://martinfowler.com/bliki/BeckDesignRules.html) de [Kent Beck](https://twitter.com/kentbeck): *No duplication* y *Fewest elements*. Las cuatro me parecen muy importantes, pero una aplicación agresiva de **OCP** podría llevarnos a duplicar mucho código con la escusa de no poder modificarlo, y encontrarnos con muchos artefactos con una alta probabilidad de tener el *smell* de *Parallel Inheritance Hierarchies*.

Según la opinión que tengo hoy en día y usando lenguaje de acrónimos: **OCP** debería estar supeditado por otros principios como **KISS**, **DRY** y **YAGNI**. Pero eso no quiere decir que sea equivocado o que no lo apliquemos.

Y lo que me pueda opinar mañana, ya lo veremos...
