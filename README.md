# htmx-sw - Contacts PWA with HTMX and Service Worker

A progressive web application (PWA) for managing contacts that demonstrates using HTMX with a service worker for offline capabilities and client-side SQLite storage.

This is meant as a *proof of concept* of how HTMX and web platform can be used to create things with little overhead and complexity. And that it is possible to create something SPA-ish without compromising on web and hypermedia. But since it is a *poc*, it is missing the usual checks and redundancies that make a proper robust application.

The app is based on the example used in the book Hypermedia Systems (https://hypermedia.systems/) (recommended). See also https://github.com/bigskysoftware/contact-app for the original app.

Demo is available here: https://htmx-sw.krmuller.workers.dev/

On the page for adding new contacts (available from the kebab menu upper right corner), there is this button to fill the app with mock-data if you just want to have a quick look.


## Overview

This poc combines modern web technologies to create a contacts application that works offline:

- **Progressive Web App (PWA)** - Installable on any device with full offline support (offline works so good, that I sometimes don't understand why changes does not show, only to realize that the dev server is not running 😅)
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
- Automatically adjusts light/dark theme according to system preferences

## Architecture

The application uses a minimal architecture (total download 1,1 Mb, including SQLite):

- **Service Worker**: Intercepts network requests and serves data and cached content using itty-router
- **Client-side SQLite**: Stores contact data in the browser's origin private file system
- **HTMX**: Handles UI updates by making partial page requests
- **Server-rendered HTML**: Uses uHTML for templating and server-side rendering

OPFS (origin private file system - https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) is very interesting, but a bit tricky since implementation differs between browsers. Orginally I handled everything within the Service Worker, but Safari only allows writing to a file within a Web Worker, and that's why there is this some messaging back and forth involved. It would help if the different Worker environments was treated as equivalent in such matters.

## Technical Stack

- [HTMX](https://htmx.org/) - HTML extensions for AJAX, WebSockets, etc.
- [SQLite WASM](https://sql.js.org/) - SQLite compiled to WebAssembly
- [uHTML-SSR](https://github.com/WebReflection/uhtml-ssr) - Server-side rendering library
- [itty-router](https://github.com/kwhitley/itty-router) - Tiny routing library
- [DaisyUI](https://daisyui.com/) - Tailwind CSS component library
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform

## Development

The application is structured to be deployed on Cloudflare Workers, but this can easily be adapted for other environments that serves static resources.

### Project Structure:

- `/public` - Static assets and client-side code
  - `/assets` - JavaScript modules and libraries
    - `/db` - SQLite database implementation
    - `/templates` - HTML templates
  - `/icons` - Application icons

### Getting Started

1. Clone the repository

That's it! No dependencies to install, no build-steps, only js-modules and import-statements, all in `/assets`, or linked/traversable from `index.html`.

## Deployment

Any static site that can serve the content in `/public`.

For example, in this repo the application can be deployed using [Wrangler](https://developers.cloudflare.com/workers/wrangler/), Cloudflare's command-line tool for Workers:

```bash
wrangler deploy
```

A minimal Cloudflare Worker config for deploying static assets only can be found in `/wrangler.jsonc`.