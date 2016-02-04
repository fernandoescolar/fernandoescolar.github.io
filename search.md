---
layout: page
title: Buscar
---
<div id="search">
  <form action="/search" method="get">
    <input type="text" id="search-query" name="q" placeholder="Search" autocomplete="off">
  </form>
</div>
<section id="search-results" style="display: none;">
  <p>Search results</p>
  <div class="entries">
  </div>
</section>
{% raw %}
<script id="search-results-template" type="text/mustache">
  {{#entries}}
    <article>
      <h3>
        {{#date}}<small><time datetime="{{pubdate}}" pubdate>{{displaydate}}</time></small>{{/date}}
        <a href="{{url}}">{{title}}</a>
      </h3>
    </article>
  {{/entries}}
</script>
{% endraw %}
<script src="/js/search.min.js" type="text/javascript" charset="utf-8"></script>
<script type="text/javascript">
  $(function() {
    $('#search-query').lunrSearch({
      indexUrl: '/public/scripts/index.json',   // Url for the .json file containing search index data
      results : '#search-results',  // selector for containing search results element
      entries : '.entries',         // selector for search entries containing element (contained within results above)
      template: '#search-results-template'  // selector for Mustache.js template
    });
  });
</script>