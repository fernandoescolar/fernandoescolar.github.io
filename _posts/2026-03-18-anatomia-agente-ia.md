---
published: true
ID: 2026031801
title: 'Anatomía de un agente de IA'
author: fernandoescolar
post_date: 2026-03-18 01:15:54
layout: post
tags: ia agentes embeddings rag
background: '/assets/uploads/bg/ai2.webp'
mermaid: true
---

Si te asomas a cualquier tutorial moderno, te lo venden fácil. Un framework aquí, dos decoradores allá, cuatro líneas de código y ya tienes un "agente" que decide, llama herramientas, consulta documentos y, si le dejas, te redacta el testamento en verso libre. Para jugar, es perfecto. Te da ese subidón de "lo he montado en una tarde".<!--break-->

El choque llega cuando el agente deja de ser un experimento y se convierte en un producto. Cuando hay usuarios que no perdonan, cuando la latencia importa, cuando las herramientas fallan, cuando los datos cambian, cuando hay que auditar qué pasó, y cuando alguien mira el coste por consulta con la misma cara con la que se mira una fuga de agua en casa.

Ahí es donde un "agente" deja de ser una función que llama al modelo y pasa a ser una arquitectura. Un bucle con fases. Un sistema de memoria con políticas. Un mecanismo de recuperación. Un método para cargar herramientas sin convertir cada prompt en una enciclopedia. Y una obsesión constante por una idea muy simple: **el contexto es dinero**.

## Dos operaciones básicas: generar texto y crear embeddings

En un chat con IA solemos fijarnos en lo visible: el modelo escribe. Pero, por dentro, lo que sostiene la mayoría de sistemas de agentes hoy son dos operaciones.

La primera es **generar texto**. Le pasas un prompt y el modelo produce una continuación token a token. No "razona" como una persona. Produce la siguiente pieza de texto más probable dado lo que tiene delante. Cuando parece que planifica, es porque tu prompt y el contexto le empujan a producir un plan. Cuando parece que duda, es porque tu contexto es ambiguo o contradictorio. No hay magia, hay condicionamiento.

La segunda es **crear embeddings**. En lugar de pedirle texto, le pides una representación numérica (un vector) que captura la "posición semántica" de un texto. Eso permite hacer algo que suena muy sofisticado pero es muy pragmático: **buscar por parecido**, no por palabras exactas. Si la generación de texto es el motor que habla, el embedding es el sistema nervioso que decide qué información es relevante.

Podríamos hablar de modelos que generan imágenes o vídeo, sí. Pero para un agente generalista, estas dos operaciones son las que determinan casi todas las decisiones de diseño: cómo recuerdas, cómo recuperas, cómo enrutas herramientas, cómo filtras ruido.

Conceptualmente, podríamos definir una interfaz mínima para un modelo de IA que soporte estas dos operaciones. En C#, podría ser algo así:

```csharp
public interface IAIModel
{
    Task<string> GenerateTextAsync(string prompt);
    Task<float[]> CreateEmbeddingAsync(string text);
}
```

## El LLM no tiene memoria y el contexto lo pagas por tokens

Un modelo de lenguaje no "recuerda" entre llamadas. No se levanta mañana pensando en lo que hablamos ayer. Cada petición es un mundo nuevo salvo que tú le metas dentro del prompt lo que necesitas que "sepa".

Eso significa que la continuidad no es un don del modelo. Es una **construcción tuya**. Y esa construcción se hace con contexto: instrucciones, historial, datos recuperados, estado del plan, descripciones de herramientas.

Y el contexto se paga. Normalmente por tokens.

Un **token** no es una palabra, aunque a veces se parezca. Es una unidad de texto que depende del tokenizador: puede ser una palabra corta, parte de una palabra larga, signos, espacios. "Programación" puede partirse en más de un token; "ok" suele ser uno; emojis y símbolos pueden ser otra historia. Esto importa porque el precio y la latencia crecen con el tamaño del prompt. Y porque cuanto más metas, más fácil es que el modelo pierda señal entre ruido.

Podríamos imaginar un agente muy simple que, cada vez que recibe una consulta, construye un prompt combinando el input del usuario con un contexto mínimo (por ejemplo, un resumen de la sesión) y luego llama a `GenerateTextAsync`. En ese proceso, podríamos contar los tokens de entrada y salida para entender el coste de cada interacción. Un ejemplo conceptual en C# podría ser:

```csharp
public class Agent
{
    private readonly IAIModel _model;

    public Agent(IAIModel model)
    {
        _model = model;
    }

    public async Task<ChatResponse> RunAsync(string userInput, string context)
    {
        // Aquí es donde construyes el prompt combinando contexto e input
        var prompt = $"{context}\nUsuario: {userInput}\nAgente:";
        var responseText = await _model.GenerateTextAsync(prompt);
        var inputTokens = CountTokens(prompt);
        var outputTokens = CountTokens(responseText);
        return new ChatResponse { Text = responseText, InputTokens = inputTokens, OutputTokens = outputTokens };
    }

    private int CountTokens(string text)
    {
        // Implementación de conteo de tokens según el tokenizador del modelo
        // Esto es un ejemplo simplificado
        return text.Split(' ').Length; // No es exacto, pero da una idea
    }
}
```

La conclusión práctica no es "no uses contexto". Es más incómoda: **usa el mínimo contexto que funcione**. No el mínimo que te hace sentir valiente. El mínimo que mantiene al sistema estable y barato.

## Contexto pequeño no significa "menos inteligencia", significa "más control"

Cuando alguien empieza con agentes, suele caer en el mismo patrón: como el modelo olvida, lo soluciono metiendo más cosas. Todo el historial, todas las herramientas, todos los documentos, todos los resultados de herramientas, todo "por si acaso".

Funciona… hasta que deja de hacerlo. La conversación se vuelve lenta, cara y errática. Y aparece un síntoma muy típico: el agente empieza a contradecirse o a "alucinar". No porque sea malvado. Porque le has dado un contexto que mezcla hechos, suposiciones, resultados antiguos, resultados nuevos, instrucciones duplicadas y ejemplos que ya no aplican. El modelo intenta componer una respuesta coherente con material incoherente. Y como escribe bien, suena convincente incluso cuando está improvisando.

Por eso un agente serio necesita una pieza aburrida pero crucial: un **constructor de contexto** que sea el único sitio donde se decide qué entra y qué no entra. Si dejas que cada capa (memoria, tooling, ejecución, logs) meta cosas a su antojo, el prompt se te hincha como un archivo de Excel heredado.

```csharp
public class ContextBuilder
{
    public string BuildContext()
    {
        // Aquí decides qué incluir. Por ejemplo:
        var context = new StringBuilder();
        context.AppendLine("Contexto de la sesión:");
        context.AppendLine(stm);
        context.AppendLine("\nCosas Importantes:");
        // ...
        return context.ToString();
    }
}
```

## RAG: usar embeddings para traer solo lo relevante

Aquí es donde entra RAG (Retrieval-Augmented Generation), que básicamente es la forma adulta de decir: "no voy a meter una base de datos en el prompt".

La idea es sencilla. Guardas conocimiento fuera del modelo. Cuando llega una pregunta, creas el embedding de la consulta. Buscas en un índice vectorial los elementos más parecidos. Recuperas solo unos pocos (top-K) y, si eres prudente, aplicas un umbral mínimo de similitud para evitar meter recuerdos flojos. Y entonces inyectas esas piezas en el contexto para la generación de texto.

Esto no solo abarata. También mejora calidad. Porque el modelo deja de "inventar" y empieza a "citar" material que tú le proporcionas en el prompt. Sigue siendo un generador, sí, pero le has dado anclas.

A nivel de implementación, lo habitual es separar dos responsabilidades: un almacenamiento persistente de ítems (contenido + metadatos) y un índice vectorial para búsqueda por similitud. El primero te da durabilidad, el segundo velocidad. En prototipos puedes hacerlo simple. En producto, se vuelve un componente serio.

```csharp
public class RAGSystem
{
    private readonly IVectorIndex _vectorIndex;
    private readonly IItemStore _itemStore;

    public RAGSystem(IVectorIndex vectorIndex, IItemStore itemStore)
    {
        _vectorIndex = vectorIndex;
        _itemStore = itemStore;
    }

    public async Task<List<Item>> RetrieveRelevantItemsAsync(string query, int topK, float similarityThreshold)
    {
        var queryEmbedding = await CreateEmbeddingAsync(query);
        var candidateIds = await _vectorIndex.SearchAsync(queryEmbedding, topK);
        var candidates = await _itemStore.GetItemsAsync(candidateIds);
        return candidates.Where(c => c.Similarity >= similarityThreshold).ToList();
    }
}
```

Y lo podríamos usar así en el constructor de contexto:

```csharp
public class ContextBuilder
{
    private readonly RAGSystem _ragSystem;

    public ContextBuilder(RAGSystem ragSystem)
    {
        _ragSystem = ragSystem;
    }

    public async Task<string> BuildContextAsync(string userQuery)
    {
        var relevantItems = await _ragSystem.RetrieveRelevantItemsAsync(userQuery, topK: 5, similarityThreshold: 0.7f);
        var context = new StringBuilder();
        context.AppendLine("Contexto de la sesión:");
        context.AppendLine(stm);
        context.AppendLine("\nInformación Relevante:");
        foreach (var item in relevantItems)
        {
            context.AppendLine($"- {item.Content} (similitud: {item.Similarity})");
        }
        return context.ToString();
    }
}
```

## Memoria en agentes: el equilibrio entre continuidad y delirio

La memoria es donde más se nota la diferencia entre un juguete y un sistema.

En una conversación humana, no repetimos todo lo dicho en cada frase. Pero tampoco lo olvidamos todo. Mantenemos un hilo. El agente debe simular algo parecido. El problema es que hay dos formas fáciles de hacerlo mal.

Si guardas poco, el agente pierde continuidad, pregunta lo mismo, se contradice porque le falta contexto, y el usuario siente que habla con una amnesia simpática.

Si guardas demasiado y lo metes todo, el agente recibe contexto contradictorio y detallado. Resultado: respuestas inestables, alucinaciones por saturación y una factura que te hace replantearte tu carrera.

La solución práctica es dividir la memoria por capas, con misiones distintas. Cuatro tipos suelen cubrir la mayoría de casos:

**STM (Short-Term Memory)**: memoria de corto plazo. Vive durante la sesión. Mantiene el objetivo, el estado, el plan corto y un resumen mínimo de lo reciente. Tiene que ser compacta y controlada. Es la continuidad inmediata.

**Memoria episódica**: el registro de eventos. Aquí guardas lo que pasó: entradas, decisiones, herramientas llamadas, argumentos, resultados, errores, tiempos. Es oro para auditoría y debugging. Pero es demasiado ruidosa para inyectarla tal cual en el prompt.

**Memoria semántica**: hechos destilados. Preferencias del usuario, restricciones, conclusiones verificables, información estable. Es la memoria "limpia" que sí quieres recuperar con RAG.

**LTM (Long-Term Memory)**: persistencia. No es tanto un "tipo" como el hecho de que ciertos recuerdos sobreviven fuera de la sesión y se recuperan después. Normalmente aquí vive la memoria semántica indexada, y la episódica con una retención limitada.

La diferencia clave no es académica. Es operativa: la episódica sirve para reconstruir y auditar; la semántica sirve para alimentar al modelo con poco contexto y mucha señal.

Y hay un detalle que marca la diferencia: **consolidación**. En lugar de intentar guardar hechos perfectos en tiempo real, registras episodios durante la sesión y, al final, ejecutas un proceso que extrae hechos verificables y los guarda como semántica. Dejas que el sistema "destile" en frío. Fuera del camino crítico del usuario.

```csharp
public interface IShortTermMemory
{
    Task<string> GetSummaryAsync();
    Task UpdateAsync(string newInfo);
}

public interface IEpisodicMemory
{
    Task SaveEpisodeAsync(Episode episode);
    Task<List<Episode>> GetEpisodesAsync();
}

public interface ISemanticMemory
{
    Task SaveFactsAsync(List<Fact> facts);
    Task<List<Fact>> GetFactsAsync(string query);
}

public interface ILongTermMemory
{
    Task PersistSemanticMemoryAsync(ISemanticMemory semanticMemory);
    Task<ISemanticMemory> LoadSemanticMemoryAsync();
}

public record Episode(string UserInput, string AgentAction, string Result, DateTime Timestamp);

public record Fact(string Content, DateTime Timestamp);
```

## Cómo se gestionan las 4 memorias en cada momento

Lo importante no es memorizar definiciones. Lo importante es ver cuándo se escribe cada cosa y cuándo se lee.

```mermaid
flowchart TD
    A[Inicio de turno] --> B[STM: cargar estado mínimo de la sesión]
    B --> C[Embedding de la consulta]
    C --> D[LTM: recuperar memoria semántica relevante\n(top-K + umbral + filtros)]
    D --> E[Construir contexto: STM + hechos semánticos\n+ historial mínimo]
    E --> F[Loop: Generar respuesta ]
    F --> G(Respuesta al usuario)
    G --> H[Registrar episodio en STM]
    H --> I[Registrar episodio en memoria episódica]
    I --> N[Consolidación asíncrona]
    N --> O[Leer episodios de la sesión]
    O --> P[Generación: extraer hechos verificables\n(formato estructurado)]
    P --> Q[Embedding de hechos]
    Q --> S[LTM: guardar semántica + indexar vectores]
```

La idea "simpática" aquí es que el agente parece recordar, pero en realidad lo que hace es recuperar. Y lo hace con embeddings. Y decide qué meter con un constructor de contexto. Todo lo demás son políticas para que el sistema no se convierta en un monstruo.

```csharp
public class MemoryManager
{
    private readonly IShortTermMemory _stm;
    private readonly IEpisodicMemory _episodicMemory;
    private readonly ISemanticMemory _semanticMemory;
    private readonly ILongTermMemory _longTermMemory;

    public MemoryManager(IShortTermMemory stm, IEpisodicMemory episodicMemory, ISemanticMemory semanticMemory, ILongTermMemory longTermMemory)
    {
        _stm = stm;
        _episodicMemory = episodicMemory;
        _semanticMemory = semanticMemory;
        _longTermMemory = longTermMemory;
    }

    public async Task<string> BuildMemoryContextAsync(string userQuery)
    {
        var ltmSemanticMemory = await _longTermMemory.LoadSemanticMemoryAsync();
        var stmSummary = await _stm.GetSummaryAsync();
        var relevantFacts = await _semanticMemory.GetFactsAsync(userQuery);

        // Aquí podrías aplicar filtros adicionales o lógica de selección
        var context = new StringBuilder();
        context.AppendLine("Contexto anterior:");
        context.AppendLine(ltmSemanticMemory);
        context.AppendLine("\nHechos Relevantes:");
        foreach (var fact in relevantFacts) {
            context.AppendLine($"- {fact.Content}");
        }

        context.AppendLine("\nContexto de la sesión:");
        context.AppendLine(stmSummary);

        return context.ToString();
    }

    public async Task SaveEpisodeAsync(Episode episode)
    {
        await _stm.UpdateAsync($"User: {episode.UserInput} \nAgent: {episode.AgentAction} \nResult: {episode.Result}");
        await _episodicMemory.SaveEpisodeAsync(episode);
    }

    public async Task ConsolidateMemoryAsync()
    {
        var episodes = await _episodicMemory.GetEpisodesAsync();
        // Aquí podrías aplicar lógica para extraer hechos verificables
        var facts = ExtractFactsFromEpisodes(episodes);
        await _semanticMemory.SaveFactsAsync(facts);
        await _longTermMemory.PersistSemanticMemoryAsync(_semanticMemory);
    }

    private List<Fact> ExtractFactsFromEpisodes(List<Episode> episodes)
    {
        // Implementación de extracción de hechos a partir de episodios
        // Esto es un ejemplo simplificado
        return episodes.Select(e => new Fact($"Usuario dijo: {e.UserInput}, Agente hizo: {e.AgentAction}, Resultado: {e.Result}", e.Timestamp)).ToList();
    }
}
```

## Tooling: cuando el agente deja de hablar y empieza a tocar el mundo

Un agente útil no se limita a responder. También actúa: llama APIs, consulta sistemas, ejecuta comandos, hace cálculos, busca datos.

En cuanto entra el tooling, aparecen dos problemas.

El primero es el **descubrimiento**: el modelo tiene que saber qué puede hacer. Eso suele implicar describir herramientas en el prompt.

El segundo es la **invocación segura**: cuando el modelo decide usar una herramienta, hay que validar argumentos, controlar timeouts, registrar resultados, manejar errores. El modelo no debe ser juez y parte.

Aquí aparecen dos patrones que conviven bien: herramientas con contrato (estilo MCP) y procedimientos documentados (skills). No compiten. Resuelven cosas distintas.

## MCP: herramientas con contrato, esquemas y validación

Un enfoque tipo MCP trata las herramientas como funciones descritas por un contrato: nombre, descripción, esquema de argumentos, resultados esperados. La ventaja es clara: el modelo puede "proponer" una llamada, pero el runtime valida y ejecuta. Si los argumentos no cumplen el esquema, no se ejecuta. Si tarda demasiado, se corta. Si falla, se registra.

Un ejemplo mínimo en C# de una herramienta (conceptual, sin entrar en detalles del transporte) podría ser algo así: una función que hace un GET y devuelve texto.

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting; // nuget Microsoft.Extensions.Hosting
using Microsoft.Extensions.Logging;
using ModelContextProtocol.Server; // nuget ModelContextProtocol
using System.ComponentModel;

var builder = Host.CreateApplicationBuilder(args);
builder.Logging.AddConsole();
builder.Services
    .AddMcpServer()
    .WithStdioServerTransport()
    .WithToolsFromAssembly();

await builder.Build().RunAsync();

[McpServerToolType]
public static class EchoTool
{
    [McpServerTool, Description("Echoes the message back to the client.")]
    public static string Echo(string message) => $"hello {message}";
}
```

Lo importante no es el código. Es el patrón: el prompt no debería arrastrar implementaciones. Debería arrastrar una descripción mínima y el formato que el modelo debe devolver si quiere invocar la herramienta. El runtime se encarga del resto.

## Skills: procedimientos en Markdown para tareas repetibles

Las skills son otra idea útil: describir procedimientos en texto estructurado, normalmente Markdown con metadatos. Esto sirve para tareas repetibles que quieres que el modelo ejecute "siguiendo pasos", como una receta.

Un ejemplo típico: "si el usuario pide resumir un JSON grande, usa la herramienta X, luego resume en N líneas, preserva cifras, etc.".

```md
---
id: skill.fetch-json-api
signals:
  description: "Obtiene un JSON de una API HTTP y devuelve un resumen compacto."
---

# Fetch JSON API

Cuando el usuario pida datos de una URL:
1) Si falta la URL, solicítala.
2) Usa la herramienta `http_get` para descargar el contenido.
3) Si el JSON es grande, resume en 5-10 líneas.
4) Mantén cifras y campos clave.
```

La diferencia frente a una herramienta con contrato es sutil pero importante. Una herramienta ejecuta una operación concreta con un contrato. Una skill guía el comportamiento del modelo para resolver un tipo de tarea, posiblemente combinando herramientas.

## Lazy context: cómo no meter 200 herramientas en cada prompt

Aquí está uno de los trucos menos glamourosos y más rentables en agentes: **lazy context**.

No necesitas cargar el detalle completo de todas las herramientas y todas las skills para que el modelo elija. Para elegir, suele bastar con un "menú" pequeño: IDs, descripciones cortas, quizás señales ("sirve para X"). Ese menú, si está bien escrito, es barato.

El detalle completo solo se carga cuando el modelo decide invocar algo. Si elige una tool, entonces traes el esquema completo, validas argumentos y ejecutas. Si elige una skill, entonces cargas el Markdown entero, lo inyectas y le pides que siga el procedimiento.

Esto reduce coste, reduce ruido y mejora selección. Y, sobre todo, evita esa tentación peligrosa de "lo meto todo por si acaso".

```csharp
public class ToolSelector
{
    private readonly IAIModel _model;
    private readonly List<Tool> _availableTools;

    public ToolSelector(IAIModel model, List<Tool> availableTools)
    {
        _model = model;
        _availableTools = availableTools;
    }

    public async Task<Tool> SelectToolAsync(string userQuery)
    {
        var toolMenu = string.Join("\n", _availableTools.Select(t => $"{t.Id}: {t.Description}"));
        var prompt = $"El usuario preguntó: {userQuery}\nHerramientas disponibles:\n{toolMenu}\n¿Cuál herramienta es la más adecuada?";
        var response = await _model.GenerateTextAsync(prompt);
        return _availableTools.FirstOrDefault(t => t.Id.Equals(response.Trim(), StringComparison.OrdinalIgnoreCase));
    }
}
```

## El loop de ejecución: intención, acción, observación, repetición

Un agente no debería ser una llamada única al modelo. Debería ser un bucle controlado, con fases claras.

Primero se interpreta intención y se decide si hay que actuar. Luego se ejecutan herramientas si hace falta. Después se observa el resultado y se decide si continuar, reintentar o cerrar.

Ese loop tiene una ventaja: te permite instrumentar. Registrar episodios. Poner límites. Cortar cuando el modelo se va por las ramas. Y, al final, consolidar memoria semántica sin fastidiar la experiencia del usuario.

```mermaid
flowchart TD
    U[Pregunta del usuario] --> S0[Iniciar sesión en MemoryManager]
    S0 --> R0[Recuperar memorias semánticas relevantes\n(similitud de embeddings)]
    R0 --> P1[Fase 1: Análisis de intención\nsin herramientas expandidas]
    P1 --> C1[Router de capacidades\n(intent embedding vs embeddings de capacidades)]
    C1 --> P2[Fase 2: Ejecución\nsolo IDs de capacidades + hechos relevantes]
    P2 --> D{Decisión del modelo}

    D -->|responder| F1[Respuesta final]
    D -->|exec| X1[ExecRuntime ejecuta comando\n(timeout + stdout/stderr)]
    D -->|usar_skill| L1[Cargar skill en lazy\nMarkdown completo]
    D -->|usar_mcp| L2[Traer schema MCP en lazy\nvalidar args + invocar]

    X1 --> O1[Observación]
    L1 --> SP[Subprompt de ejecución de skill]
    SP --> O1
    L2 --> O1

    O1 --> P3[Fase 3: Observación\ncontinuar o finalizar]
    P3 -->|continuar| P2
    P3 -->|finalizar| F1

    F1 --> E1[Fin de sesión]
    E1 --> BG[Consolidación asíncrona]
    BG --> EP[Cargar eventos episódicos]
    EP --> EX[Extraer hechos con LLM\n(factual, formato estricto)]
    EX --> SM[Guardar memoria semántica + indexar vectores]
```

En este loop, cada fase tiene su función y su coste. La generación de intención es barata. La ejecución de herramientas puede ser cara o lenta. La observación puede ser ruidosa. Y la consolidación es un proceso que no debería afectar al usuario.

Podríamos escribir un pseudocódigo de este loop para ilustrar cómo se gestionan las fases y las decisiones:

```csharp
public class Agent
{
    private readonly IAIModel _model;

    public async Task<ChatResponse> RunAsync(string userInput, string context)
    {
        var maxTurns = 8;
        var turn = 0;
        var last = new ChatResponse();

        // Fase 0: cargar memorias relevantes (STM + semántica)
        context = await BuildContextForTurnAsync(userInput, context);

        while (turn < maxTurns)
        {
            // Fase 1: Análisis de intención (ligero, sin expandir todas las capacidades)
            var intentPrompt = $"Usuario: {userInput}\nContexto: {context}\nDevuelve: responder:<texto> | usar_tool:<id> | usar_skill:<id> | usar_mcp:<id>";
            var intent = await _model.GenerateTextAsync(intentPrompt);

            // Fase 1.1: router de capacidades (embedding vs capacidades disponibles)
            var route = await RouteCapabilitiesAsync(intent);

            // Fase 2: Ejecución (lazy-load de lo necesario)
            if (route.Type == "tool")
            {
                var result = await ExecuteCommandAsync(route.Id, route.Args);
                await ObserveAndRecordAsync(userInput, intent, result);
                if (!ShouldContinue(result))
                {
                    last = BuildResponse(intentPrompt, result);
                    break;
                }
                context = UpdateContext(context, result);
            }
            else if (route.Type == "skill")
            {
                var result = await ExecuteSkillAsync(route.Id, route.Args);
                await ObserveAndRecordAsync(userInput, intent, result);
                last = BuildResponse(intentPrompt, result);
                break;
            }
            else if (route.Type == "mcp")
            {
                var result = await ExecuteMcpAsync(route.Id, route.Args);
                await ObserveAndRecordAsync(userInput, intent, result);
                if (!ShouldContinue(result))
                {
                    last = BuildResponse(intentPrompt, result);
                    break;
                }
                context = UpdateContext(context, result);
            }
            else
            {
                // Respuesta directa (sin ejecutar nada)
                last = BuildResponse(intentPrompt, intent);
                break;
            }

            // Fase 3: decidir seguir o finalizar
            AddToMemory(last);
            turn++;
        }

        _ = ConsolidateAsync(); // Consolidación asíncrona (LTM / semántica)
        return last;
    }

    private ChatResponse BuildResponse(string prompt, string text) => new ChatResponse
    {
        Text = text,
        InputTokens = CountTokens(prompt),
        OutputTokens = CountTokens(text)
    };
}
```

## Cierre: la diferencia entre un juguete y un sistema

Los tutoriales te enseñan a montar un agente rápido. La realidad te obliga a gobernarlo.

Tienes que entender que el modelo genera texto con lo que le das, que no tiene memoria por defecto, y que el contexto cuesta. Tienes que usar embeddings no como adorno, sino como mecanismo central para recuperar información y elegir capacidades. Tienes que usar RAG para no meter tu conocimiento en el prompt. Tienes que gestionar memoria por capas para mantener continuidad sin saturación. Tienes que instrumentar un loop con fases, con ejecución controlada, y con consolidación para destilar hechos útiles.

Y sí, todo esto suena menos épico que "con cuatro líneas hice un agente". Es porque aquí no hay final feliz empaquetado: esto es la arquitectura, no el producto. Falta escribir contratos, validar args, manejar timeouts, registrar eventos, endurecer el loop, consolidar memoria en segundo plano y medir costes. Todo eso es código que no cabe en un post, pero es justo lo que separa la teoría de un agente que aguantará en producción.

Espero que al menos te haya dado una visión más realista de lo que hay detrás de un agente de IA. No es magia, es ingeniería. Y como toda ingeniería, el diablo está en los detalles.
