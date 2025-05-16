import {getDBFromOPFS, saveDBToOPFS} from './initSqlite.js'

class ContactDatabase {

    constructor(dbPath, onsave) {
        this.dbPath = dbPath
        this.db = null
        this.onsave = onsave
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

    async save(){
        let success = true  
        /*try {
            success = await saveDBToOPFS(this.db, this.dbPath)
        } catch (err) {
            success = false
            console.error('Error while saving database:', err.message)
        }*/
        try  {
            if (this.onsave) {
                const data = this.db.export()
                this.onsave(this.dbPath, data)         
            }
        } catch (err) {
            success = false
        }
        return success
    }

    async init() {
        try {
            this.db = await getDBFromOPFS(this.dbPath)
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
            await this.save()
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

    async batchInsertContacts(contacts) {
        const insertQuery = `INSERT INTO contacts (name, email, phone, status, errorMsg) VALUES (?, ?, ?, ?, ?)`    
        const insertStmt = this.db.prepare(insertQuery)
        const results = [] 
        for (const contact of contacts) {
            let {errorMsg, status} = this.validateContact(contact.name, contact.email, contact.phone);  
            try {
                insertStmt.run([contact.name, contact.email, contact.phone, status, errorMsg])  
            } catch (err) {
                status = 'error'
                errorMsg = err.message
            }
            results.push({name: contact.name, email: contact.email, phone: contact.phone, status, errorMsg})
        }
        insertStmt.free()
        await this.save()
        return results
    }

    async addContact(name, email, phone) {
        let {errorMsg, status} = this.validateContact(name, email, phone);
        const insertQuery = `INSERT INTO contacts (name, email, phone, status, errorMsg) VALUES (?, ?, ?, ?, ?)`
        try{
            this.db.exec(insertQuery, [name, email, phone, status, errorMsg])
        } catch (err) {
            status = 'error'
            errorMsg = err.message
        }
        await this.save()
        return { name, email, phone, status, errorMsg }
    }

    async getContacts(query) {
        if (query) {
            const selectQuery = `SELECT * FROM contacts WHERE name LIKE ? OR email LIKE ? AND status != 'archived'`
            const results = this.db.exec(selectQuery, ['%' + query + '%', '%' + query + '%'])
            return this.#serializeResult(results)
        }
        const selectQuery = `SELECT * FROM contacts WHERE status != 'archived'`
        const results = this.db.exec(selectQuery)
        return this.#serializeResult(results)
    }

    async getContact(id) {
        const selectQuery = `SELECT * FROM contacts WHERE id = ?`
        const results = this.db.exec(selectQuery, [id])
        return this.#serializeResult(results)
    }

    async updateContact(id, name, email, phone) {
        let {errorMsg, status} = this.validateContact(name, email, phone);
        const updateQuery = `
            UPDATE contacts
            SET name = ?, email = ?, phone = ?, status = ?, errorMsg = ?
            WHERE id = ?
        `
        try {
            this.db.exec(updateQuery, [name, email, phone, status, errorMsg, id])
        } catch (err) {
            status = 'error'
            errorMsg = err.message
        }
        await this.save()
        return {id, name, email, phone, status, errorMsg}
    }

    async archiveContact(id) {
        const updateStatusQuery = `
            UPDATE contacts
            SET status = 'archived'
            WHERE id = ?
        `
        this.db.exec(updateStatusQuery, [id])
        await this.save()
    }

    async deArchiveContact(id) {
        const updateStatusQuery = `
            UPDATE contacts
            SET status = 'ok'
            WHERE id = ?
        `
        this.db.exec(updateStatusQuery, [id])
        await this.save()
    }

    async getArchive() {
        const selectQuery = `SELECT * FROM contacts WHERE status = 'archived'`
        const results = this.db.exec(selectQuery)
        return this.#serializeResult(results)
    }

    async deleteContact(id) {
        const deleteQuery = `DELETE FROM contacts WHERE id = ?`
        try {
            this.db.exec(deleteQuery, [id])
        } catch (err) {
            return {status: 'error', message: err.message}
        }
        await this.save()
        return {status: 'ok'}
    }

    async getDBAsArrayBuffer() {
        const data = this.db.export()
        return data
    }

    async close() {
        this.db.close()
    }
}

export default ContactDatabase