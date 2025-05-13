# htmx-sw - Contacts PWA with HTMX and Service Worker

A progressive web application (PWA) for managing contacts that demonstrates using HTMX with a service worker for offline capabilities and client-side SQLite storage.

This is meant as a proof of concept how htmx and web platform can be used to create things with little overhead and complexity.

The app is based on the example used in the book Hypermedia Systems (https://hypermedia.systems/) (recommended).


## Overview

This project combines modern web technologies to create a fully-functional contacts application that works offline:

- **Progressive Web App (PWA)** - Installable on any device with full offline support
- **HTMX** - For dynamic UI updates
- **SQLite** - Client-side database storage through WASM (Web Assembly) and OPFS (Origin Private File System)
- **Service Worker** - Handles routing and caching strategy
- **DaisyUI/Tailwind** - For responsive, clean UI components

## Features

- Create, read, update, and delete contacts
- Search functionality for quick contact lookup
- Archive and restore contacts
- Responsive design that works on mobile and desktop
- Fully functional offline (after initial load)
- Download SQLite database for backup

## Architecture

The application uses a modern architecture:

- **Service Worker**: Intercepts network requests and serves data and cached content
- **Client-side SQLite**: Stores contact data in the browser's origin private file system
- **HTMX**: Handles UI updates by making partial page requests
- **Server-rendered HTML**: Uses uHTML for templating and server-side rendering

## Technical Stack

- [HTMX](https://htmx.org/) - HTML extensions for AJAX, WebSockets, etc.
- [SQLite WASM](https://sql.js.org/) - SQLite compiled to WebAssembly
- [uHTML-SSR](https://github.com/WebReflection/uhtml-ssr) - Server-side rendering library
- [itty-router](https://github.com/kwhitley/itty-router) - Tiny routing library
- [DaisyUI](https://daisyui.com/) - Tailwind CSS component library
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform

## Development

The application is structured to be deployed on Cloudflare Workers, but can be adapted for other environments.

### Project Structure:

- `/public` - Static assets and client-side code
  - `/assets` - JavaScript modules and libraries
    - `/db` - SQLite database implementation
    - `/templates` - HTML templates
  - `/icons` - Application icons

### Getting Started

1. Clone the repository

## Deployment

The application is deployed using [Wrangler](https://developers.cloudflare.com/workers/wrangler/), Cloudflare's command-line tool for Workers:

```bash
wrangler deploy
```