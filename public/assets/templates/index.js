import { html } from '../uhtml-ssr-0.9.1/es.js'
import { cacheVersion } from '../../sw.js'

export const layout = (content,) => html`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Contacts</title>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script defer src="/assets/htmx.org-1.9.12/dist/htmx.min.js"></script>
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" href="/icons/contact-logo.svg" type="image/svg+xml">
    <script>

        navigator.serviceWorker.getRegistration().then((reg) => {
            reg.addEventListener('updatefound', () => {
                console.log('Service Worker update found');
            })
        })

        const forceSWUpdate = async () => {
            //Force update the service worker
            swReg = await navigator.serviceWorker.getRegistration();
            if (swReg && swReg.active) {
                await swReg.update().catch((error) => {
                    alert('Service Worker update failed: ' + error);  
                })
                console.log('Service Worker updated');
                setTimeout(() => {
                    //Reload the page after a short delay to ensure newly cached resources are applied
                    location.reload();
                    console.log('Page reloaded to apply new Service Worker and cache');
                }, 1500);
            }
        }

        const fileWorker = new Worker('worker.js', {
            type: 'classic',
        })
        
        fileWorker.onmessage = (event) => {
            //If the worker sends an error message, show an alert
            if(event.data.type === 'error') {
                alert('Error: ' + event.data.msg)
            } else {
                console.log('Message from worker: ' + event.data.msg)
            }
        }

        navigator.serviceWorker.addEventListener("message", (event) => {
            //relaying messages from the service worker to the file worker
            fileWorker.postMessage(event.data)
        })
        
        const forceSave = () => {
            //Hidden force save function to trigger the service worker to save the database from the UI
            navigator.serviceWorker.controller.postMessage({
                type: 'force-update',
            })
        }

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
<body onload="checkDarkMode()" class="fixed flex flex-col justify-between h-dvh w-full md:max-w-4xl mx-auto">
    <header class="navbar z-10 p-4 bg-base-300 flex-none">
        <img onclick="forceSave()" src="/icons/contact-logo.svg" alt="Logo" class="w-8 h-8 flex-none" />
        <h2 class="text-2xl font-bold text-center inline-block flex-grow">My Contacts</h2>
        <details id="menu" class="dropdown dropdown-left flex-none">
            <summary class="btn btn-ghost btn-circle  link light:link-neutral">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="6" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="18" r="2" />
                </svg>
            </summary>
            <ul onclick="document.querySelector('#menu').open = false" class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                <li>
                    <a class="align-middle link light:link-neutral " hx-boost="true" hx-target="main" href="/new">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12M12 6.75a.75.75 0 0 1 .75.75v3.75h3.75a.75.75 0 0 1 0 1.5h-3.75v3.75a.75.75 0 0 1-1.5 0v-3.75H7.5a.75.75 0 0 1 0-1.5h3.75V7.5a.75.75 0 0 1 .75-.75" clip-rule="evenodd"></path></svg>
                        New Contact
                    </a>
                </li>
                <li>
                    <a class="align-middle link light:link-neutral" hx-boost="true" hx-target="main" href="/archive">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" fill-rule="evenodd" d="M4 3.25a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h16a.75.75 0 0 0 .75-.75V4a.75.75 0 0 0-.75-.75zm15.5 6a.25.25 0 0 1 .25.25V19A1.75 1.75 0 0 1 18 20.75H6A1.75 1.75 0 0 1 4.25 19V9.5a.25.25 0 0 1 .25-.25zm-4.75 3.25a.75.75 0 0 1-.75.75h-4a.75.75 0 0 1 0-1.5h4a.75.75 0 0 1 .75.75" clip-rule="evenodd"></path></svg>
                        Archive
                    </a>
                </li>
                <li>
                    <a class="align-middle link light:link-neutral" href="/download">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" fill-rule="evenodd" d="M11 2.25A5.75 5.75 0 0 0 5.25 8c0 .052-.017.1-.074.157a.66.66 0 0 1-.325.158A3.25 3.25 0 0 0 5.5 14.75h4a.25.25 0 0 0 .25-.25V11a2.25 2.25 0 0 1 4.5 0v3.5c0 .138.112.25.25.25h2.75a4.5 4.5 0 1 0 0-9h-.745c-.09 0-.236-.066-.33-.26A5.746 5.746 0 0 0 11 2.25m1 8a.75.75 0 0 1 .75.75v7.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V11a.75.75 0 0 1 .75-.75" clip-rule="evenodd"></path></svg>
                        Download SQLite-file
                    </a>
                </li>
                <li>
                    <span class="align-middle link light:link-neutral" onclick="forceSWUpdate()">
                        Cache version ${cacheVersion}, click to force update of SW.
                    </span>
                </li
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
            <td>
                <a class="align-middle link link-primary" hx-boost="true" hx-target="main" href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-6 h-6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" d="M4.47 11.47a.75.75 0 0 0 0 1.06l4.5 4.5a.75.75 0 0 0 1.06-1.06l-3.22-3.22H19a.75.75 0 0 0 0-1.5H6.81l3.22-3.22a.75.75 0 1 0-1.06-1.06z"></path></svg>
                    Back
                </a>
            </td>
            <td>
                <a class="align-middle link link-primary" hx-boost="true" hx-target="main" href="/${contact.id}/edit">
                    <svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-6 h-6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" fill-rule="evenodd" d="M19.638 4.417a3.25 3.25 0 0 0-4.608-.008.33.33 0 0 0 .003.467l.298.292 3.841 3.84a.324.324 0 0 0 .458 0 3.25 3.25 0 0 0 .008-4.59m-1.651 6.235a.5.5 0 0 0 0-.707l-3.714-3.713-.184-.181a.5.5 0 0 0-.704.003l-7.733 7.734a.75.75 0 0 0-.19.324l-1.415 4.95a.75.75 0 0 0 .925.927l4.94-1.398a.75.75 0 0 0 .327-.191z" clip-rule="evenodd"></path></svg>
                    Edit
                </a>
            </td>
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
            <input id="search" type="search" name="q" value="${ query || '' }"
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


export const contactRows = (contacts, isArchive) => html`
    ${contacts.map(contact => html`
        <tr class="w-full" id="contact-${contact.id}">
            <td class=""><a class="inline-block link light:link-neutral" hx-boost="true" hx-target="main" href="/${contact.id}">${contact.name}</a></td>
            <td class="hidden md:table-cell">${contact.phone}</td>
            <td class="hidden md:table-cell">${contact.email}</td>
            <td class="">
               ${ (!isArchive) ? html`
                <a class="inline-block link light:link-neutral" role="menuitem" hx-boost="true" hx-target="main" href="/${contact.id}/edit">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" fill-rule="evenodd" d="M14.97 4.47a3.2 3.2 0 0 1 4.562.001c1.26 1.27 1.268 3.368-.002 4.637l-8.5 8.5a.75.75 0 0 1-.38.204l-4.5.922a.75.75 0 0 1-.882-.897l1-4.5a.75.75 0 0 1 .202-.367zm3.498 1.058a1.7 1.7 0 0 0-2.438.002l-.97.97 2.479 2.478.93-.93c.68-.68.681-1.832-.001-2.52M7.685 13.876 14 7.56l2.478 2.478-6.35 6.35-3.145.644zM3.5 20.25a.75.75 0 0 0 0 1.5h17a.75.75 0 0 0 0-1.5z" clip-rule="evenodd"></path></svg>
                </a> 
                 <a class="ml-4 inline-block link link-info" role="menuitem" href="#"
                    hx-post="/${contact.id}/archive"
                    hx-confirm="Are you sure you want to archive this contact?"
                    hx-target="main"
                    hx-swap="innerHTML"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" fill-rule="evenodd" d="M3.25 4A.75.75 0 0 1 4 3.25h16a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-.75.75h-.25V19A1.75 1.75 0 0 1 18 20.75H6A1.75 1.75 0 0 1 4.25 19V8.75H4A.75.75 0 0 1 3.25 8zm2.5 4.75h12.5V19a.25.25 0 0 1-.25.25H6a.25.25 0 0 1-.25-.25zm-1-4v2.5h14.5v-2.5zm9.25 8.5a.75.75 0 0 0 0-1.5h-4a.75.75 0 0 0 0 1.5z" clip-rule="evenodd"></path></svg>                </a>    
                <a class="inline-block link link-warning float-right" role="menuitem" href="#"
                    hx-delete="/${contact.id}"
                    hx-confirm="Are you sure you want to delete this contact?"
                    hx-target="#contact-${contact.id}"
                    hx-swap="outerHTML"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" fill-rule="evenodd" d="M4.5 6.25a.75.75 0 0 0 0 1.5h.805l.876 11.384a1.75 1.75 0 0 0 1.745 1.616h8.148a1.75 1.75 0 0 0 1.745-1.616l.876-11.384h.805a.75.75 0 0 0 0-1.5h-2.75V6A2.75 2.75 0 0 0 14 3.25h-4A2.75 2.75 0 0 0 7.25 6v.25zm5.5-1.5c-.69 0-1.25.56-1.25 1.25v.25h6.5V6c0-.69-.56-1.25-1.25-1.25zm-3.19 3 .867 11.27c.01.13.118.23.249.23h8.148c.13 0 .24-.1.25-.23l.866-11.27zm3.19 2a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75m4 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75" clip-rule="evenodd"></path></svg>
                </a>
                
                ` : html`
                <a class="ml-4 inline-block link link-info" role="menuitem" href="#"
                    hx-delete="/${contact.id}/archive"
                    hx-confirm="Are you sure you want to restore this contact?"
                    hx-target="main"
                    hx-swap="innerHTML"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" fill-rule="evenodd" d="M14.344 4.002a.25.25 0 0 1 .215.121l1.253 2.087a.75.75 0 0 0 1.03.256l.297-.179-.496 2.761-2.67-.858.297-.179a.75.75 0 0 0 .257-1.029l-1.79-2.979zm-4.715.003h1.358l1.868 3.107-1.072.644a.75.75 0 0 0 .157 1.357L17 10.739a.75.75 0 0 0 .968-.582l.94-5.231a.75.75 0 0 0-1.125-.776l-1.071.644-.867-1.443a1.75 1.75 0 0 0-1.501-.849l-4.716.003a1.75 1.75 0 0 0-1.476.812L7.247 4.74a.75.75 0 1 0 1.266.804l.905-1.424a.25.25 0 0 1 .21-.116M7.894 7.944a.75.75 0 0 1 .387.484l1.302 5.153a.75.75 0 0 1-1.067.852l-1.114-.567-1.646 3.23.72 1.152a.25.25 0 0 0 .21.117l1.688.013a.75.75 0 1 1-.011 1.5l-1.688-.013a1.75 1.75 0 0 1-1.47-.821l-2.501-3.998a1.75 1.75 0 0 1-.076-1.723l.764-1.5-1.113-.568a.75.75 0 0 1 .061-1.364l4.935-1.975a.75.75 0 0 1 .62.028m-3.066 7.67 1.578-3.097a.75.75 0 0 1 1.009-.328l.309.157-.687-2.72-2.605 1.043.31.158a.75.75 0 0 1 .327 1.009l-1.105 2.168a.25.25 0 0 0 .011.246zm14.837-4.285a.75.75 0 0 1 1.006.336l.754 1.509a1.75 1.75 0 0 1-.064 1.683L18.934 18.9a1.75 1.75 0 0 1-1.5.85H15.75V21a.75.75 0 0 1-1.244.564l-4-3.5a.75.75 0 0 1 0-1.128l4-3.5A.75.75 0 0 1 15.75 14v1.25h3.625l.7-1.165a.25.25 0 0 0 .009-.24l-.755-1.51a.75.75 0 0 1 .336-1.006m-1.19 5.421H15a.75.75 0 0 1-.75-.75v-.347L12.139 17.5l2.111 1.847V19a.75.75 0 0 1 .75-.75h2.434a.25.25 0 0 0 .214-.121z" clip-rule="evenodd"></path></svg>                </a>      
                
                `}     
            </td>
        </tr>`)}`

export const contactTable = (contacts, isArchive = false) => html`
${ (isArchive) ? html`
    <h2 class="text-1.5xl font-bold text-center">Archived Contacts</h2>
    <p class="mb-4">
        <a class="align-middle link link-primary" hx-boost="true" hx-target="main" href="/">
            <svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-6 h-6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" d="M4.47 11.47a.75.75 0 0 0 0 1.06l4.5 4.5a.75.75 0 0 0 1.06-1.06l-3.22-3.22H19a.75.75 0 0 0 0-1.5H6.81l3.22-3.22a.75.75 0 1 0-1.06-1.06z"></path></svg>
            Back
        </a>
    </p>
    ` : '' 
}
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
            ${contactRows(contacts, isArchive)}
        </tbody>
    </table>`


    export const contactForm = (contact = {}) => html`
    <p class="mb-4">
        <a class="link link-primary" hx-boost="true" hx-target="main" href="/">
            <svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-6 h-6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" d="M4.47 11.47a.75.75 0 0 0 0 1.06l4.5 4.5a.75.75 0 0 0 1.06-1.06l-3.22-3.22H19a.75.75 0 0 0 0-1.5H6.81l3.22-3.22a.75.75 0 1 0-1.06-1.06z"></path></svg>
            Back
        </a>
    </p>
    <form id="contact-form" action="/new" method="post" hx-boost="true" hx-target="main" class="flex flex-col gap-4">
        ${ (contact.status === 'error') ? html`<div class="form-control w-full max-w-sm mx-auto bg-error">Error: ${contact.errorMsg}</div>` : '' }
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
    <p class="mb-4">
        <a class="link link-primary" hx-boost="true" hx-target="main" href="/">
            <svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-6 h-6" fill="none" viewBox="0 0 24 24" focusable="false" role="img"><path fill="currentColor" d="M4.47 11.47a.75.75 0 0 0 0 1.06l4.5 4.5a.75.75 0 0 0 1.06-1.06l-3.22-3.22H19a.75.75 0 0 0 0-1.5H6.81l3.22-3.22a.75.75 0 1 0-1.06-1.06z"></path></svg>
            Back
        </a>
    </p>
    <form id="contact-form" action="/${contact.id}/edit" hx-boost="true" hx-target="main" method="post" class="flex flex-col gap-4">
        ${ (contact.status === 'error') ? html`<div class="form-control w-full max-w-sm mx-auto bg-error">Error: ${contact.errorMsg}</div>` : '' }
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
