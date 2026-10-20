---
title: Console Mini
description: "A mini web development tool for macOS and iOS Safari."
head:
  - [meta, { property: og:type, content: website }]
  - [meta, { property: og:title, content: "Console Mini | Prima Aestate" }]
  - [meta, { property: og:description, content: "A mini web development tool for macOS and iOS Safari." }]
  - [meta, { property: og:url, content: "https://www.primaaestate.cloud/apps/console-mini" }]
  - [meta, { property: og:image, content: "https://www.primaaestate.cloud/img/apps/console-mini/og-v2.jpg" }]
  - [meta, { property: og:image:width, content: "1200" }]
  - [meta, { property: og:image:height, content: "630" }]
  - [meta, { name: twitter:card, content: summary_large_image }]
  - [meta, { name: twitter:title, content: "Console Mini | Prima Aestate" }]
  - [meta, { name: twitter:description, content: "A mini web development tool for macOS and iOS Safari." }]
  - [meta, { name: twitter:image, content: "https://www.primaaestate.cloud/img/apps/console-mini/og-v2.jpg" }]
---

<script setup>
import Changelog from '../components/Changelog.vue';
import changelog from '../data/changelogs/console-mini.json';
</script>

<div class="app-hero">
  <img class="app-icon" src="/img/apps/console-mini/icon.png" alt="Console Mini icon" />
  <div>
    <h1>Console Mini</h1>
    <p class="app-pitch">A mini web development tool for macOS and iOS Safari.</p>
    <a class="app-store-btn" href="https://apps.apple.com/us/app/console-mini/id6744146152" target="_blank" rel="noopener">Download on the App Store</a>
  </div>
</div>

## Features

- Elements: inspect and edit the DOM tree and styles
- Console: view logs, test code and inspect objects
- Requests: see every request of the current site with details
- Storage: view local, session and cookie storage
- Sources: view loaded source files and find errors by file, line and column
- Simulator: preview pages at iPhone, iPad or custom sizes
- Guided Safari extension setup on iPhone, iPad and Mac

## Screenshots

<div class="app-shots">
  <img src="/img/apps/console-mini/shot-1.jpg" alt="Console Mini screenshot: Console" loading="lazy" />
  <img src="/img/apps/console-mini/shot-2.jpg" alt="Console Mini screenshot: Network" loading="lazy" />
  <img src="/img/apps/console-mini/shot-3.jpg" alt="Console Mini screenshot: Elements" loading="lazy" />
  <img src="/img/apps/console-mini/shot-4.jpg" alt="Console Mini screenshot: Sources (dark)" loading="lazy" />
</div>

## What's New

<Changelog :items="changelog" />
