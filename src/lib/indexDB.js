class IDB {
    dbName = 'test';
    openDB (version, success, error) {
        const req = window.indexedDB.open(this.dbName, version);
        req.onsuccess = function () {
            success && (typeof success === 'function') ? success() : '';
        };
        req.onerror = function () {
            console.error('indexDB打开或创建失败，请重试');
            error && (typeof error === 'function') ? error() : '';
        };
        return req;
    }

    
}

const indexDB = new IDB();

export {
    indexDB as default,
    indexDB,
};

// dev
window.IDB = indexDB;
