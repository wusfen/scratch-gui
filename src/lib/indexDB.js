class IDB {
    constructor () {
        if (!IDB.instance) { // 保持单例
            this.dbName = 'editorProjectDB';
            this.version = 1;
            this.tableName = 'project';
            IDB.instance = this;
        }
        return IDB.instance;
    }
    // /**
    //  * 创建数据库，已经存在就打开，否则就创建
    //  * @param {成功回调} success 
    //  * @param {失败回调} error 
    //  * @returns 
    //  */
    openDB (success, error) {
        const req = window.indexedDB.open(this.dbName, this.version);
        req.onsuccess = function () {
            success && (typeof success === 'function') ? success() : '';
        };
        req.onerror = function () {
            console.error('indexDB打开或创建失败，请重试');
            error && (typeof error === 'function') ? error() : '';
        };
        return req;
    }

    // /**
    //  * 获取仓库对象，支持事务（transaction），这意味着一系列操作步骤之中，只要有一步失败，整个事务就都取消，数据库回滚到事务发生之前的状态，不存在只改写一部分数据的情况
    //  * @param {事件对象} e
    //  * @param {表明} tableName 
    //  * @returns 
    //  */
    getStore (e, tableName) {
        const db = e.target.result;
        const transaction = db.transaction([tableName], 'readwrite');
        return transaction.objectStore(tableName);
    }

    // /**
    //  * 创建表
    //  * @param {主键} primaryKey 
    //  * @param {表格列} keyList 
    //  * @param {成功回调} success 
    //  * @param {失败回调} error 
    //  */
    createTable (primaryKey, keyList, success, error) {
        const req = this.openDB(success, error);
        req.onupgradeneeded = function (e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(this.tableName)) {
                // 创建一张数据表
                const conf = primaryKey ? {keyPath: primaryKey} : {autoIncrement: true};
                const store = db.createObjectStore(this.tableName, conf);
                keyList.forEach(key => {
                    store.createIndex(key.name, key.name, {unique: key.unique});
                });
            }
        };
    }

    // /**
    //  * 添加数据
    //  * @param {要添加的数据} data 
    //  * @param {成功回调} success 
    //  * @param {失败回调} error 
    //  */
    add (data, isRetry = false, success, error) {
        return new Promise((resolve, reject) => {
            const req = this.openDB();
            req.onsuccess = e => {
                try {
                    const store = this.getStore(e, this.tableName);
                    const request = store.add(data);
                    request.onsuccess = function () {
                        success && (typeof success === 'function') ? success() : '';
                        resolve();
                    };
                    request.onerror = async function (e) {
                        error && (typeof error === 'function') ? error() : '';
                        if (isRetry) { // 添加失败时，会删除占用存储最大的一条数据，然后再尝试添加
                            try {
                                const dataList = await this.indexDB.getList();
                                const largestProject = dataList.find(item => item.zip.size === Math.max(...dataList.map(it => it.zip.size)));
                                await this.deleteData(largestProject.id);
                                await this.add(data);
                            } catch (err) {
                                console.log('indexDB---retry---error', err);
                            }
                        } else {
                            reject(e);
                        }
                    };
                } catch (err) {
                    reject(err);
                }
                
            };
        });
        
    }

    // /**
    //  * 根据主键查询数据
    //  * @param {主键} primaryKey 
    //  * @param {成功回调} success 
    //  * @param {失败回调} error 
    //  */
    getData (primaryKey, success, error) {
        return new Promise((resolve, reject) => {
            const req = this.openDB();
            req.onsuccess = e => {
                try {
                    const store = this.getStore(e, this.tableName);
                    const request = store.get(primaryKey);
                    request.onsuccess = function () {
                        success && (typeof success === 'function') ? success(request.result) : '';
                        resolve(request.result);
                    };
                    request.onerror = function (e) {
                        error && (typeof error === 'function') ? error() : '';
                        reject(e);
                    };    
                } catch (err) {
                    reject(err);
                }
                
            };
        });
        
    }

    // /**
    //  * 获取表中的数据列表
    //  * @param {成功回调} success 
    //    @param {失败回调} error 
    //  */
    getList (success, error) {
        return new Promise((resolve, reject) => {
            const req = this.openDB();
            req.onsuccess = e => {
                try {
                    const store = this.getStore(e, this.tableName);
                    const result = [];
                    store.openCursor().onsuccess = function (e) {
                        const cursor = e.target.result;
                        if (cursor) {
                            result.push(cursor.value);
                            cursor.continue(); // 循环去获取数据
                        } else {
                            success && (typeof success === 'function') ? success(result) : '';
                            resolve(result);
                        }
                    };
                    store.openCursor().onerror = function (e) {
                        error && (typeof error === 'function') ? error(e) : '';
                        reject(e);
                    }; 
                } catch (err) {
                    reject(err);
                }
            };
        });
    }

    // /**
    //  * 删除数据
    //  * @param {主键} primaryKey 
    //  * @param {成功回调} success 
    //  * @param {失败回调} error 
    //  */
    deleteData (primaryKey, success, error) {
        return new Promise((resolve, reject) => {
            const req = this.openDB();
            req.onsuccess = e => {
                try {
                    const store = this.getStore(e, this.tableName);
                    const request = store.delete(primaryKey);
                    request.onsuccess = function () {
                        success && (typeof success === 'function') ? success(request.result) : '';
                        resolve(request.result);
                    };
                    request.onerror = function (e) {
                        error && (typeof error === 'function') ? error() : '';
                        reject(e);
                    };  
                } catch (err) {
                    reject(err);
                }  
            };
        });
        
    }

    // /**
    //  * 更新数据
    //  * @param {主键} primaryKey 
    //  * @param {新数据} newData 
    //  * @param {成功回调} success 
    //  * @param {} error 
    //  */
    update (primaryKey, newData, success, error) {
        return new Promise((resolve, reject) => {
            const req = this.openDB();
            req.onsuccess = e => {
                try {
                    const store = this.getStore(e, this.tableName);
                    const request = store.get(primaryKey);
                    request.onerror = function (e) {
                        console.error('数据服务器错误');
                        reject(e);
                    };
                    request.onsuccess = function (e) {
                        const data = e.target.result;
                        for (const key in newData) {
                            data[key] = newData[key];
                        }
                        const requestUpdate = store.put(data);
                        requestUpdate.onerror = function (e) {
                            error && (typeof error === 'function') ? error() : '';
                            reject(e);
                        };
                        requestUpdate.onsuccess = function () {
                            success && typeof success === 'function' ? success() : '';
                            resolve();
                        };
                    }; 
                } catch (err) {
                    reject(err);
                }
                
            };
        });
        
    }

}

// eslint-disable-next-line import/no-mutable-exports
let indexDB = null;

if ('indexedDB' in window) {
    indexDB = new IDB();
} else {
    indexDB = null;
}

export {
    indexDB as default,
    indexDB,
};

// dev
window.IDB = indexDB;
