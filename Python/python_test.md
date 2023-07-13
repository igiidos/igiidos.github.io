---
parent: Python
title: python_test
nav_order: 1
layout: default
---

test page python

<ul>
  {% for post in site.posts %}
    {% if post.category == "python_test" %}
      <li>
        <a href="{{ post.url }}">{{ post.title }}</a>
      </li>
    {% endif %}
  {% endfor %}
</ul>
