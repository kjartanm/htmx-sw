import { AutoRouter, withContent } from './itty-router-5.0.18/index.js'
import { layout, search, contactTable, contactRows, contactForm, contactView, updateForm } from './templates/index.js'
import { cacheFirst } from './caching.js'



const contactsMock = [
    { id: 1, name: 'John Doe', phone: '123-456-7890', email: 'john.doe@acme.com' },
    { id: 2, name: 'Jane Smith', phone: '987-654-3210', email: 'janes@gmail.com' },
    { id: 3, name: 'Alice Johnson', phone: '555-555-5555', email: 'johnson@capor.org' },
    { id: 4, name: 'Bob Brown', phone: '444-444-4444', email: 'bob@brown.no' },
    { id: 5, name: 'Charlie Black', phone: '333-333-3333', email: 'cblack@what.com' },
    { id: 6, name: 'Diana White', phone: '222-222-2222', email: 'diana.white@govern.org' },
    { id: 7, name: 'Eve Green', phone: '111-111-1111', email: 'eve.green@zetis.de' },
    { id: 8, name: 'Frank Blue', phone: '000-000-0000', email: 'blueberry@comic.ln' },
    { id: 9, name: 'Grace Yellow', phone: '123-123-1234', email: 'admin@yellowstone.org' },
    { id: 10, name: 'Hank Purple', phone: '456-456-4567', email: 'hank@purplehaze.yeah' },
    { id: 11, name: 'Ivy Orange', phone: '789-789-7890', email: 'poisonivy@gotham.night' },
]

const getRoot = async (query, headers, db, render, html, redirect = false) => {
    let contacts = []
    if (query.q) {
        contacts = await db.getContacts(query.q)
    } else {
        contacts = await db.getContacts()
    }
    const content = html`${search(query.q)} ${contactTable(contacts)}`
    if (headers.get('Hx-target') || headers.get('Hx-request')) {
        if (redirect) {
            return new Response(render(String, content,), { status: 200, headers: { 'HX-Replace-Url': '/', 'Content-Type': 'text/html' } })
        }
        return new Response(render(String, content,), { status: 200, headers: { 'Content-Type': 'text/html' } })
    } else {
        return new Response(render(String, layout(content),), { status: 200, headers: { 'Content-Type': 'text/html' } })
    }
}


const router = AutoRouter({})
router
    .get('/assets/*', cacheFirst)
    .get('/npm/*', cacheFirst)
    .get('/version.js', cacheFirst)
    .get('/worker.js', cacheFirst)
    .get('/manifest.json', cacheFirst)
    .get('/index.html', cacheFirst)
    .get('/icons/*', cacheFirst)
    .post('/mock', async ({ query, headers, }, { db, html, render, }, event) => {
        await db.batchInsertContacts(contactsMock)
        return getRoot(query, headers, db, render, html, true)
    })
    .get('/download', async ({ }, { db }) => {
        const blob = await db.getDBAsArrayBuffer()
        return new Response(blob, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename="contacts.db"',
            },
        })
    })
    .get('/archive', async ({ headers }, { db, render, html, }) => {
        const archive = await db.getArchive()
        if (headers.get('Hx-target') || headers.get('Hx-request')) {
            return new Response(render(String, contactTable(archive, true),), { status: 200, headers: { 'Content-Type': 'text/html' } })
        } else {
            return new Response(render(String, layout(contactTable(archive, true)),), { status: 200, headers: { 'Content-Type': 'text/html' } })
        }
    })
    .get('/new', async ({ headers }, { render, }, event) => {
        console.log('new', headers.get('Hx-request'))
        if (headers.get('Hx-request')) {
            return new Response(render(String, contactForm()), { headers: { 'Content-Type': 'text/html' } })
        } else {
            return new Response(render(String, layout(contactForm(),)), { headers: { 'Content-Type': 'text/html' } })
        }
    })
    .post('/new', async ({ formData, query, headers, }, { db, html, render, }, event) => {
        const form = await formData()
        const addedContact = await db.addContact(form.get('name'), form.get('email'), form.get('phone'))
        if (addedContact.status === 'error') {
            return new Response(render(String, layout(contactForm(addedContact),)), { headers: { 'Content-Type': 'text/html' } })
        }
        return getRoot(query, headers, db, render, html, true)
    })
    .get('/', async ({ query, headers }, { db, render, html, }, event) => {
        return getRoot(query, headers, db, render, html)
    })
    .get('/:id', async ({ params, headers }, { db, render, html, }, event) => {
        const contact = await db.getContact(params.id)
        if (!contact || contact.length === 0) {
            return new Response(render(String, layout(html`<p>Contact not found</p>`)), { status: 404, headers: { 'Content-Type': 'text/html' } })
        } else if (headers.get('Hx-request')) {
            return new Response(render(String, contactView(contact[0])), { status: 200, headers: { 'Content-Type': 'text/html' } })
        } else {
            return new Response(render(String, layout(contactView(contact[0]))), { status: 200, headers: { 'Content-Type': 'text/html' } })
        }
    })
    .delete('/:id', async ({ params }, { db, }, event) => {
        const result = await db.deleteContact(params.id)
        if (result.status === 'error') {
            return new Response(result.message, { status: 500, headers: { 'Content-Type': 'text/html' } })
        }
        return new Response('', { status: 200, headers: { 'Content-Type': 'text/html' } })
    })
    .get('/:id/edit', async ({ headers, params }, { db, render, html, }, event) => {
        const contact = await db.getContact(params.id)
        if (!contact || contact.length === 0) {
            return new Response(render(String, layout(html`<p>Contact not found</p>`)), { headers: { 'Content-Type': 'text/html' } })
        } else if (headers.get('Hx-request')) {
            return new Response(render(String, updateForm(contact[0])), { headers: { 'Content-Type': 'text/html' } })
        } else {
            return new Response(render(String, layout(updateForm(contact[0]))), { headers: { 'Content-Type': 'text/html' } })
        }
    })
    .post('/:id/edit', async ({ formData, params, query, headers }, { db, render, html, }, event) => {
        const form = await formData()
        const updatedContact = db.updateContact(params.id, form.get('name'), form.get('email'), form.get('phone'))
        if (updatedContact.status === 'error') {
            return new Response(render(String, layout(updateForm(updatedContact),)), { headers: { 'Content-Type': 'text/html' } })
        }
        return getRoot(query, headers, db, render, html, true)
    })
    .post('/:id/archive', async ({ params, query, headers }, { db, render, html, }, event) => {
        await db.archiveContact(params.id,)
        return getRoot(query, headers, db, render, html, true)
    })
    .delete('/:id/archive', async ({ params, query, headers }, { db, render, html, }, event) => {
        await db.deArchiveContact(params.id,)
        return getRoot(query, headers, db, render, html, true)
    })
    .all('*', async (request) => {
        return fetch(request.clone())
    })

export default router 
