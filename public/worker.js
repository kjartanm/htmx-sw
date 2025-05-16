

onmessage = async (event) => {
    if (event.data.type === 'update') {
        try {
            const { data, fileName } = event.data
            const opfsHandle = await navigator.storage.getDirectory()
            const fileHandle = await opfsHandle.getFileHandle(fileName, { create: true })
            const accessHandle = await fileHandle.createSyncAccessHandle();
            const writeSize = accessHandle.write(data, { "at": 0 });
            accessHandle.flush();
            accessHandle.close();
            postMessage({
                type: 'updateCompleted',
                message: 'Database saved successfully. Size: ' + writeSize,
            })
        } catch (err) {
            postMessage({
                type: 'error',
                message: 'Error while saving database: ' + err.message,
            })
        }
    }else{
        postMessage({
            type: 'info',
            message: 'Unhandled message type: ' + event.data.type,
        })
    }
}