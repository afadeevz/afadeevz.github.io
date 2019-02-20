class Storage {
    constructor(impl, prefix) {
        this._impl = impl;
        this._prefix = prefix + ":";
    }

    getItem(key) {
        return this._impl.getItem(this._prefix + key);
    }

    setItem(key, value) {
        this._impl.setItem(this._prefix + key, value);
    }

    clear() {
        let keys = [];
        for (let i = 0; i < this._impl.length; i++) {
            const key = this._impl.key(i);
            if (key.startsWith(this._prefix)) {
                keys.push(key);
            }
        }
        for (let key of keys.values()) {
            this._impl.removeItem(key);
        }
    }
}

export class LocalStorage extends Storage {
    constructor(prefix = "") {
        super(localStorage, prefix);
    }
}

export class SessionStorage extends Storage {
    constructor(prefix = "") {
        super(sessionStorage, prefix);
    }
}