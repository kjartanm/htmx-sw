import { html } from 'https://cdn.jsdelivr.net/npm/uhtml-ssr@0.9.1/+esm'

export const layout = (content,) => html`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Contacts</title>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
    <script defer src="/assets/htmx.org@1.9.12/dist/htmx.min.js"></script>
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" href="/icons/contact-logo.svg" type="image/svg+xml">
    <script>
        const checkDarkMode = () => {
            const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (darkMode) {
                document.documentElement.setAttribute('data-theme', 'dark')
            } else {
                document.documentElement.setAttribute('data-theme', 'light')
            }
        }
        window.matchMedia('(prefers-color-scheme: dark)').addListener(checkDarkMode);
    </script>
</head>
<body onload="checkDarkMode()" class="min-h-screen fixed flex flex-col justify-between w-full md:max-w-4xl mx-auto">
    <header class="navbar z-10 p-2 bg-base-300 flex-none">
        <img src="/icons/contact-logo.svg" alt="Logo" class="w-8 h-8 flex-none" />
        <h2 class="text-2xl font-bold text-center inline-block flex-grow">My Contacts</h2>
        <details id="menu" class="dropdown dropdown-left flex-none">
            <summary class="btn btn-ghost btn-circle">
                <img src="/icons/menu.svg" alt="Menu" class="w-8 h-8" id="menu-toggle" />
            </summary>
            <ul onclick="document.querySelector('#menu').open = false" class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                <li>
                    <a class="link link-neutral" hx-boost="true" hx-target="main" href="/new">New Contact</a>
                </li>
                <li>
                    <a class="link link-neutral" hx-boost="true" hx-target="main" href="/archive">Archive</a>
                </li>
                <li>
                    <a class="link link-neutral" hx-boost="true" hx-target="main" href="/download">Download SQLite-file</a>
                </li>
            </ul>
        </details>
    </header>
    <main class="grow p-4 relative overflow-x-auto"> ${content} </main>
    <footer class="navbar p-4 bg-base-200 flex-none">
        <p class="mx-auto text-center">Made with ❤️ for Web by Kjartan</p>  
    </footer>
</body>
</html>`

export const contactView = (contact) => html`
    <table class="table table-compact w-full">
        <tr>
            <td><a class="link link-primary" hx-boost="true" hx-target="main" href="/"><- Back</a></td>
            <td><a class="link link-primary" hx-boost="true" hx-target="main" href="/${contact.id}/edit">Edit</a></td>
        </tr>
        <tr>
            <td class="font-bold">Name:</td>
            <td>${contact.name}</td>
        </tr>
        <tr>
            <td class="font-bold">Phone:</td>
            <td>${contact.phone}</td>
        </tr>
        <tr>
            <td class="font-bold">Email:</td>
            <td>${contact.email}</td>
        </tr>
    </table>
`

export const search = (query) => html`
    <form action="/" method="get" class="w-full join">
        <label class="input join-item">
            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2.5"
                fill="none"
                stroke="currentColor"
                >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
                </g>
            </svg>
            <input id="search" type="search" name="q" value="${query || ''}"
                hx-get="/"
                hx-trigger="search, keyup delay:200ms changed"
                hx-target="main"
                hx-push-url="true"
                hx-indicator="#spinner"
                placeholder="Search"
            />
        </label>
        <button class="btn btn-neutral join-item" type="submit">
            Search
            <span id="spinner" class="htmx-indicator loading loading-spinner loading-md"></span>
        </button>
    </form>`


export const contactRows = (contacts) => html`
    ${contacts.map(contact => html`
        <tr class="w-full" id="contact-${contact.id}">
            <td class=""><a class="inline-block link light:link-neutral" hx-boost="true" hx-target="main" href="/${contact.id}">${contact.name}</a></td>
            <td class="hidden md:table-cell">${contact.phone}</td>
            <td class="hidden md:table-cell">${contact.email}</td>
            <td class="">
                <a class="inline-block link light:link-neutral" role="menuitem" hx-boost="true" hx-target="main" href="/${contact.id}/edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                </a>      
                <a class="ml-4 inline-block link link-info" role="menuitem" href="#"
                    hx-post="/${contact.id}/archive"
                    hx-confirm="Are you sure you want to archive this contact?"
                    hx-target="#contact-${contact.id}"
                    hx-swap="outerHTML" 
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="4" width="20" height="5" rx="1"></rect>
                        <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"></path>
                        <path d="M10 13h4"></path>
                    </svg>
                </a>      
                <a class="inline-block link link-warning float-right" role="menuitem" href="#"
                    hx-delete="/${contact.id}"
                    hx-confirm="Are you sure you want to delete this contact?"
                    hx-target="#contact-${contact.id}"
                    hx-swap="outerHTML"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </a>
            </td>
        </tr>`)}`

export const contactTable = (contacts) => html`
    <table class="w-full table table-zebra table-compact">
        <thead>
            <tr>
                <th class="">Name</th>
                <th class="hidden md:table-cell">Phone</th>
                <th class="hidden md:table-cell">Email</th>
                <th class="">Actions</th>
            </tr>
        </thead>
        <tbody class="w-full" id="contact-list">
            ${contactRows(contacts)}
        </tbody>
    </table>`


export const contactForm = (contact = {}) => html`
    <p class="mb-4"><a class="link link-primary" hx-boost="true" hx-target="main" href="/"><- Back</a></p>
    <form id="contact-form" action="/new" method="post" hx-boost="true" hx-target="main" class="flex flex-col gap-4">
        ${(contact.status === 'error') ? html`<div class="form-control w-full max-w-sm mx-auto bg-error">Error: ${contact.errorMsg}</div>` : ''}
        <div class="form-control w-full max-w-sm mx-auto">
            <label for="name" class="label">Name</label>
            <input type="text" name="name" id="name" value="${contact.name || ''}" class="input input-bordered w-full" required />
        </div>
        <div class="form-control w-full max-w-sm mx-auto">
            <label for="phone" class="label">Phone</label>
            <input type="tel" name="phone" id="phone" value="${contact.phone || ''}" class="input input-bordered w-full" required />
        </div>
        <div class="form-control w-full max-w-sm mx-auto">
            <label for="email" class="label">Email</label>
            <input type="email" name="email" id="email" value="${contact.email || ''}" class="input input-bordered w-full" required />
        </div>
        <button type="submit" class=" w-full max-w-sm mx-auto btn btn-accent">Save</button>
    </form>
    <form class="flex flex-col mt-16" action="/mock" hx-boost="true" hx-target="main" method="post">
    <button type="submit" class="max-w-sm mx-auto btn btn-warning">Add mockdata</button>
    </form>
    `

export const updateForm = (contact = {}) => html`
    <p class="mb-4"><a class="link link-primary" hx-boost="true" hx-target="main" href="/"><- Back</a></p>
    <form id="contact-form" action="/${contact.id}/edit" hx-boost="true" hx-target="main" method="post" class="flex flex-col gap-4">
        ${(contact.status === 'error') ? html`<div class="form-control w-full max-w-sm mx-auto bg-error">Error: ${contact.errorMsg}</div>` : ''}
        <div class="form-control w-full max-w-sm mx-auto">
            <label for="name" class="label">Name</label>
            <input type="text" name="name" id="name" value="${contact.name || ''}" class="input input-bordered w-full" required />
        </div>
        <div class="form-control w-full max-w-sm mx-auto">
            <label for="phone" class="label">Phone</label>
            <input type="tel" name="phone" id="phone" value="${contact.phone || ''}" class="input input-bordered w-full" required />
        </div>
        <div class="form-control w-full max-w-sm mx-auto">
            <label for="email" class="label">Email</label>
            <input type="email" name="email" id="email" value="${contact.email || ''}" class="input input-bordered w-full" required />
        </div>
        <button type="submit" class=" w-full max-w-sm mx-auto btn btn-accent">Update</button>
    </form>`
