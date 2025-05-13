import {getDBFromOPFS, saveDBToOPFS} from '/assets/db/initSqlite.js'

class ContactDatabase {
    constructor(dbPath) {
        this.dbPath = dbPath
        this.db = null
    }

    #serializeResult(dbresult){
        const result = []
        if (dbresult && dbresult.length === 1 && dbresult[0].columns && dbresult[0].values ) {
            for(const item of dbresult[0].values) {
                const obj = {}
                for (let i = 0; i < dbresult[0].columns.length; i++) {
                    obj[dbresult[0].columns[i]] = item[i]
                }
                result.push(obj)
            }
        }
        return result
    }

    async init() {

        try {
            this.db = await getDBFromOPFS(this.dbPath)
            this.db.updateHook(async (operation, database, table, rowId) => {
                await saveDBToOPFS(this.db, this.dbPath)
            })
        } catch (err) {
            console.error('Error opening database:', err.message)
            return
        }

        const tableExists = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='contacts';");
        if (!tableExists[0]) {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    phone TEXT,
                    status TEXT NOT NULL DEFAULT 'ok' CHECK(status IN ('ok', 'error', 'archived')),
                    errorMsg TEXT DEFAULT ''
                )
            `
            this.db.run(createTableQuery)
            await saveDBToOPFS(this.db, this.dbPath)
        }

    }

    validateContact (name, email, phone) {
        let errorMsg = '';
        let status = 'ok';
        if (!name || !email) {
            errorMsg = 'Name and email are required fields.';
            status = 'error'
        }
        if (typeof name !== 'string' || typeof email !== 'string') {
            errorMsg = 'Name and email must be strings.'
            status = 'error'
        }
        if (phone && typeof phone !== 'string') {
            errorMsg = 'Phone must be a string.';
            status = 'error'
        }
        if (!['ok', 'error', 'archived'].includes(status)) {
            errorMsg = 'Invalid status value.';
            status = 'error'
        }
        return {errorMsg, status};
    }

    batchInsertContacts(contacts) {
        const insertQuery = `INSERT INTO contacts (name, email, phone, status, errorMsg) VALUES (?, ?, ?, ?, ?)`    
        const insertStmt = this.db.prepare(insertQuery)
        const results = [] 
        for (const contact of contacts) {
            let {errorMsg, status} = this.validateContact(contact.name, contact.email, contact.phone);  
            try {
                insertStmt.run([contact.name, contact.email, contact.phone, status, errorMsg])  
            } catch (err) {
                console.error('Error inserting contact:', err.message)  
                status = 'error'
                errorMsg = err.message
            }
            results.push({name: contact.name, email: contact.email, phone: contact.phone, status, errorMsg})
        }
        insertStmt.free()
        return results
    }

    addContact(name, email, phone) {
        let {errorMsg, status} = this.validateContact(name, email, phone);
        const insertQuery = `INSERT INTO contacts (name, email, phone, status, errorMsg) VALUES (?, ?, ?, ?, ?)`
        try{
            this.db.exec(insertQuery, [name, email, phone, status, errorMsg])
        } catch (err) {
            console.error('Error inserting contact:', err.message)
            status = 'error'
            errorMsg = err.message
        }
        return { name, email, phone, status, errorMsg }
    }

    getContacts(query) {
        if (query) {
            const selectQuery = `SELECT * FROM contacts WHERE name LIKE ? OR email LIKE ? AND status != 'archived'`
            const results = this.db.exec(selectQuery, ['%' + query + '%', '%' + query + '%'])
            return this.#serializeResult(results)
        }
        const selectQuery = `SELECT * FROM contacts WHERE status != 'archived'`
        const results = this.db.exec(selectQuery)
        return this.#serializeResult(results)
    }

    getContact(id) {
        const selectQuery = `SELECT * FROM contacts WHERE id = ?`
        const results = this.db.exec(selectQuery, [id])
        return this.#serializeResult(results)
    }

    updateContact(id, name, email, phone) {
        let {errorMsg, status} = this.validateContact(name, email, phone);
        const updateQuery = `
            UPDATE contacts
            SET name = ?, email = ?, phone = ?, status = ?, errorMsg = ?
            WHERE id = ?
        `
        try {
            this.db.exec(updateQuery, [name, email, phone, status, errorMsg, id])
        } catch (err) {
            console.error('Error updating contact:', err.message)
            status = 'error'
            errorMsg = err.message
        }
        return {id, name, email, phone, status, errorMsg}
    }

    archiveContact(id) {
        const updateStatusQuery = `
            UPDATE contacts
            SET status = 'archived'
            WHERE id = ?
        `
        this.db.exec(updateStatusQuery, [id])
    }

    deArchiveContact(id) {
        const updateStatusQuery = `
            UPDATE contacts
            SET status = 'ok'
            WHERE id = ?
        `
        this.db.exec(updateStatusQuery, [id])
    }

    getArchive() {
        const selectQuery = `SELECT * FROM contacts WHERE status = 'archived'`
        const results = this.db.exec(selectQuery)
        return this.#serializeResult(results)
    }

    deleteContact(id) {
        const deleteQuery = `DELETE FROM contacts WHERE id = ?`
        try {
            this.db.exec(deleteQuery, [id])
        } catch (err) {
            console.error('Error deleting contact:', err.message)
            return {status: 'error', message: err.message}
        }
        return {status: 'ok'}
    }

    getDBAsBlob() {
        const data = this.db.export()
        console.log('getDBAsBlob', data)
        return data
    }

    close() {
        this.db.close()
    }
}

export default ContactDatabase