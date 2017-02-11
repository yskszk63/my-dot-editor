export class EventEmitter {
    constructor() {
        this._listeners = new Map();
    }
    dispatch(type) {
        const l = this._listeners;
        if (l.has(type)) {
            l.get(type).forEach(listener => listener(this));
        }
    }
    on(type, listener) {
        const l = this._listeners;
        (l.get(type) || l.set(type, new Set()).get(type)).add(listener);
    }
    off(type, listener) {
        const l = this._listeners;
        if (l.has(type)) {
            const listeners = l.get(type);
            listeners.delete(listener);
            if (!listeners.size) {
                l.delete(type);
            }
        }
    }
}