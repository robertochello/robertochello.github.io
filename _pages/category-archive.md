---
title: "Posts by Category"
layout: site-standalone
permalink: /categories/
---

<section class="rcx-generic-page">
  <p class="rcx-generic-page__kicker">Archive / Categories</p>
  <h1>Posts by category.</h1>
  {% if site.categories.size > 0 %}
    {% for category in site.categories %}
      <h2>{{ category[0] }}</h2>
      <div class="rcx-archive-list">
        {% for post in category[1] %}
          <a href="{{ post.url }}">{{ post.title }}</a>
        {% endfor %}
      </div>
    {% endfor %}
  {% else %}
    <p>No articles are currently published. The portfolio is focused on projects and engineering documentation.</p>
  {% endif %}
</section>
