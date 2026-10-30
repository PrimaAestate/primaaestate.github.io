---
title: Aestate
description: "A lightweight, stable and easy-to-use network tool for Mac, iPhone, iPad and Apple TV, designed to minimize battery drain."
head:
  - [meta, { property: og:type, content: website }]
  - [meta, { property: og:title, content: "Aestate | Prima Aestate" }]
  - [meta, { property: og:description, content: "A lightweight, stable and easy-to-use network tool for Mac, iPhone, iPad and Apple TV, designed to minimize battery drain." }]
  - [meta, { property: og:url, content: "https://www.primaaestate.cloud/apps/aestate" }]
  - [meta, { property: og:image, content: "https://www.primaaestate.cloud/img/apps/aestate/og.jpg" }]
  - [meta, { property: og:image:width, content: "1200" }]
  - [meta, { property: og:image:height, content: "630" }]
  - [meta, { name: twitter:card, content: summary_large_image }]
  - [meta, { name: twitter:title, content: "Aestate | Prima Aestate" }]
  - [meta, { name: twitter:description, content: "A lightweight, stable and easy-to-use network tool for Mac, iPhone, iPad and Apple TV, designed to minimize battery drain." }]
  - [meta, { name: twitter:image, content: "https://www.primaaestate.cloud/img/apps/aestate/og.jpg" }]
---

<script setup>
import Changelog from '../components/Changelog.vue';
import changelog from '../data/changelogs/aestate.json';
</script>

<div class="app-hero">
  <img class="app-icon" src="/img/apps/aestate/icon.png" alt="Aestate icon" />
  <div>
    <h1>Aestate</h1>
    <p class="app-pitch">A lightweight, stable and easy-to-use network tool for Mac, iPhone, iPad and Apple TV, designed to minimize battery drain.</p>
    <a class="app-store-btn" href="https://apps.apple.com/us/app/aestate/id6749141594" target="_blank" rel="noopener">Download on the App Store</a>
  </div>
</div>

## Features

- Lightweight proxy that handles only proxy traffic to minimize battery drain
- Servers and subscriptions: AnyTLS, VLESS, VMess, Trojan, Shadowsocks (REALITY / gRPC)
- Enhanced Mode: route WebRTC (STUN/ICE) through the proxy, use Fake-IP DNS, and add custom or subscribed rule sets that sync via iCloud
- Share an HTTP proxy on your local network, with PAC routing that follows your rules
- Apple TV client: share your configuration from iPhone, iPad or Mac via iCloud or the local network
- Shortcuts and Siri: connect, disconnect, and toggle Global Mode or UDP Relay on iPhone, iPad and Mac
- Blocks unsupported IPv6 traffic in the tunnel to prevent leaks

## Screenshots

<div class="app-shots">
  <img src="/img/apps/aestate/shot-1.jpg" alt="Aestate screenshot: Servers" loading="lazy" />
  <img src="/img/apps/aestate/shot-2.jpg" alt="Aestate screenshot: Activity" loading="lazy" />
  <img src="/img/apps/aestate/shot-3.jpg" alt="Aestate screenshot: Routing" loading="lazy" />
  <img src="/img/apps/aestate/shot-4.jpg" alt="Aestate screenshot: HTTP proxy sharing (dark)" loading="lazy" />
</div>

## What's New

<Changelog :items="changelog" />
