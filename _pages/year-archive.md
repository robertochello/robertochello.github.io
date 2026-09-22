---
title: "Posts"
layout: site-standalone
permalink: /posts/
---

<section class="rcx-generic-page">
  <p class="rcx-generic-page__kicker">Archive / Posts</p>
  <h1>Engineering notes.</h1>
  {% if site.posts.size > 0 %}
    <div class="rcx-archive-list">
      {% for post in site.posts %}
        <a href="{{ post.url }}">{{ post.date | date: "%Y.%m.%d" }} · {{ post.title }}</a>
      {% endfor %}
    </div>
  {% else %}
    <p>No articles are currently published. The portfolio is focused on projects and engineering documentation.</p>
  {% endif %}
</section>
