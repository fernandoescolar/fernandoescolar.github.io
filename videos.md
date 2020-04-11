---
layout: page
title: Mis Vídeos
---

<p class="message">
Aquí podrás encontrar todas las publicaciones de vídeos y sesiones grabadas en las que he participado:
</p>
<div id="archive">
{% for post in site.categories.video %}
  {% assign currentdate = post.date | date: "%Y" %}
  {% if currentdate != date %}
    {% unless forloop.first %}</ul>{% endunless %}
    <h1 id="y{{post.date | date: "%Y"}}">{{ currentdate }}</h1>
    <ul>
    {% assign date = currentdate %}
  {% endif %}
    <li><a href="{{ post.url }}">{{ post.title }}</a></li>
  {% if forloop.last %}</ul>{% endif %}
{% endfor %}
</div>
