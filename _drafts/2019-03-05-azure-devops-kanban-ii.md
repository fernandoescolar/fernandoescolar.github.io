---
published: true
ID: 201902261
title: 'Método Kanban con Azure DevOps (y 2)'
author: fernandoescolar
post_date: 2019-03-05 07:58:14
layout: post
---

Si ya tienes claro lo que es el Método Kanban, pero no tienes del todo claro como aplicarlo en una metodología; si ya aplicas este método, pero te interesan las experiencias de otros equipos; o si por el contrario, tu objetivo en la vida es demostrarle a la todo el mundo lo equivocado que está; te va a encantar lo que viene a continuación.<!--break-->

> Hola emprendedor, ¿te resulta dificil gestionar las tareas que tienes a diario? [...] Bien, te voy a enseñar el método Kanban

> Iñaki Berzal - Método Kanban: Gestión de proyectos y tareas para equipos [en YouTube](https://www.youtube.com/watch?v=HHMTxeWgvJs)

Como ya comentamos en [el artículo anterior](/2019/02/26/azure-devops-kanban/), llevo como cinco años detrás de la metodología perfecta basada en el Método Kanban. Sé que estoy persiguiendo una quimera, que lo que hoy consideras un valor para tu cliente, mañana puede convertirse en un _waste_ a eliminar del proceso. Soy consciente de que hay políticas propuestas por la mayoría, que no le gustan a todos los miembros del equipo. Y por supuesto, he sido el primero que cuando los tiempos aprietan me he saltado el límite del WIP.

La mejora continua consiste en aceptar que cometemos errores e intentar ponerles solución. Por lo tanto, lo que hoy vamos a repasar no es más que un proceso sin terminar y ni mucho menos definitivo. Pero si andas perdido en el mundo del desarrollo ágil usando el método Kanban, puede servirte de punto de partida.

![Proceso ágil basado en método kanban]({{site.baseurl}}/public/uploads/2019/03/kanban-process.png)

User Story:

> As a **[user role]** i want **[something]** so that **[I can achieve that]**

Bug:

> When **[I do an action]** <br />
> It **[has an unespected behavior]** <br />
> It should **[have other behavior]**


On Planing
- Every User Story or Bug can be resolved in a day 
- Prioritize every day 
- Get first

Before starting
- create a new branch from master
    - feature/[your name] 
    - hotfix/[your name]
- every commit comment should reference a work item (#id)
DoD
- Produced code for presumed functionalities
- Produced code for presumed functionalities
- Assumptions of US met
- Project builds without errors (both: backend and frontend)
- Unit tests written and passing

- check you have developed is running right
- create a Pull Request from your Branch to master
- warn your teammates


