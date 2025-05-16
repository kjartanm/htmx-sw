import {initSqlJs} from './sql-wasm.js'

export const getDBFromOPFS = async (fileName) => {
    const SQL = await initSqlJs({
        locateFile: file => `/assets/db/${file}`
    })
    const opfsHandle = await navigator.storage.getDirectory()
    const fileHandle = await opfsHandle.getFileHandle(fileName, { create: true })
    const file = await fileHandle.getFile()
    const arrayBuffer = await file.arrayBuffer()
    return new SQL.Database(new Uint8Array(arrayBuffer))
}

export const saveDBToOPFS = async (db, fileName) => {
    let success = true
    try {
        const opfsHandle = await navigator.storage.getDirectory()
        const fileHandle = await opfsHandle.getFileHandle(fileName, { create: true })
        const writable = await fileHandle.createWritable()
        const data = db.export()
        await writable.write(data)
        await writable.close()
    } catch (err) {
        success = false
    }
    return success
}
