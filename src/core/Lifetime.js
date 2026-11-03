(function (root) {
    class Lifetime {
        constructor() {
            this.handles = new Map();
            this.generation = 0;
        }
        timeout(callback, delay) {
            let handle;
            handle = setTimeout(() => {
                this.handles.delete(handle);
                callback();
            }, delay);
            this.handles.set(handle, 'timeout');
            return handle;
        }
        interval(callback, delay) {
            const handle = setInterval(callback, delay);
            this.handles.set(handle, 'interval');
            return handle;
        }
        cancel(handle) {
            const type = this.handles.get(handle);
            if (type === 'interval') clearInterval(handle);
            else clearTimeout(handle);
            this.handles.delete(handle);
        }
        reset() {
            for (const handle of this.handles.keys()) this.cancel(handle);
            this.generation++;
        }
    }
    root.BobloxLifetime = Lifetime;
    if (typeof module !== 'undefined') module.exports = Lifetime;
})(typeof window !== 'undefined' ? window : globalThis);
