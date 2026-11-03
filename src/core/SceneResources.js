(function (root) {
    function disposeObject(object, sharedTexture) {
        if (!object?.traverse) return;
        const disposed = new Set();
        const release = (resource) => {
            if (!resource || disposed.has(resource) || resource === sharedTexture) return;
            if (resource.userData?.cachedGeo || resource.userData?.cachedMat || resource.userData?.cachedTex)
                return;
            disposed.add(resource);
            resource.dispose?.();
        };
        object.traverse((node) => {
            release(node.geometry);
            for (const material of node.material
                ? Array.isArray(node.material)
                    ? node.material
                    : [node.material]
                : []) {
                if (material.userData?.cachedMat) continue;
                for (const value of Object.values(material)) if (value?.isTexture) release(value);
                release(material.map);
                release(material);
            }
        });
    }
    root.BobloxSceneResources = Object.freeze({ disposeObject });
    if (typeof module !== 'undefined') module.exports = root.BobloxSceneResources;
})(typeof window !== 'undefined' ? window : globalThis);
