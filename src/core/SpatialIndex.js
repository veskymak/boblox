(function (root) {
    class SpatialIndex {
        constructor(size = 8) {
            this.size = size;
            this.invalidate();
        }
        invalidate() {
            this.blocks = null;
        }
        cells(box, visit) {
            const s = this.size;
            const min = [box.min.x, box.min.y, box.min.z].map((n) => Math.floor(n / s));
            const max = [box.max.x, box.max.y, box.max.z].map((n) => Math.floor(n / s));
            if (
                max.some((n, i) => !Number.isFinite(n) || !Number.isFinite(min[i])) ||
                max.reduce((a, n, i) => a * (n - min[i] + 1), 1) > 4096
            )
                return false;
            for (let x = min[0]; x <= max[0]; x++)
                for (let y = min[1]; y <= max[1]; y++)
                    for (let z = min[2]; z <= max[2]; z++) visit(`${x},${y},${z}`);
            return true;
        }
        query(blocks, box) {
            if (this.blocks !== blocks || this.count !== blocks.length) {
                this.blocks = blocks;
                this.count = blocks.length;
                this.grid = new Map();
                this.dynamic = [];
                blocks.forEach((block, index) => {
                    const entry = { block, index };
                    if (
                        block.movingFn ||
                        block.destructible ||
                        block.playerBuilt ||
                        !this.cells(block.box, (key) => {
                            if (!this.grid.has(key)) this.grid.set(key, []);
                            this.grid.get(key).push(entry);
                        })
                    )
                        this.dynamic.push(entry);
                });
            }
            const found = new Set(this.dynamic);
            if (
                !this.cells(box, (key) => {
                    for (const entry of this.grid.get(key) || []) found.add(entry);
                })
            )
                return blocks;
            return [...found].sort((a, b) => a.index - b.index).map((entry) => entry.block);
        }
    }
    root.BobloxSpatialIndex = SpatialIndex;
    if (typeof module !== 'undefined') module.exports = SpatialIndex;
})(typeof window !== 'undefined' ? window : globalThis);
