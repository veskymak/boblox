/* ============================================================================
 * 3. PROCEDURAL THUMBNAIL ARTWORK GENERATOR (FOR ALL 10 GAMES)
 * ============================================================================ */
function drawGameThumbnail(canvas, gameId) {
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (gameId === 'obby') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(1, '#bae6fd');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'];
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = colors[i];
            const pw = 95 - i * 11;
            const ph = 18 - i * 2;
            const px = 40 + i * 52;
            const py = h - 42 - i * 24;
            ctx.fillRect(px, py, pw, ph);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, pw, ph);
        }
        drawMiniNoob2D(ctx, 78, h - 85, 0.85);
    } else if (gameId === 'lava') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.6, '#7c2d12');
        grad.addColorStop(1, '#ea580c');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#475569';
        ctx.fillRect(w * 0.28, 25, w * 0.44, h - 50);
        ctx.fillStyle = '#94a3b8';
        for (let y = 40; y < h - 40; y += 34) {
            ctx.fillRect(w * 0.22, y, w * 0.56, 10);
        }
        ctx.fillStyle = '#ff5500';
        ctx.fillRect(0, h - 42, w, 42);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(0, h - 42, w, 8);
        drawMiniNoob2D(ctx, w * 0.5, h - 102, 0.8);
    } else if (gameId === 'sfoth') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#312e81');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#64748b';
        ctx.fillRect(25, h - 65, 110, 35);
        ctx.fillRect(w - 135, h - 65, 110, 35);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(135, h - 58, w - 270, 10);

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 35, h / 2 + 15);
        ctx.lineTo(w / 2 + 35, h / 2 - 45);
        ctx.moveTo(w / 2 + 35, h / 2 + 15);
        ctx.lineTo(w / 2 - 35, h / 2 - 45);
        ctx.stroke();

        drawMiniNoob2D(ctx, 75, h - 105, 0.8);
    } else if (gameId === 'tycoon') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#065f46');
        grad.addColorStop(1, '#10b981');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(w * 0.42, 36, w * 0.48, h - 60);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(w * 0.48, 52, w * 0.36, 32);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(25, h - 52, w * 0.5, 18);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(50, h - 68, 16, 16);
        ctx.fillRect(90, h - 68, 16, 16);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(130, h - 68, 16, 16);
        drawMiniNoob2D(ctx, 68, h - 98, 0.78);
    } else if (gameId === 'disasters') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#111827');
        grad.addColorStop(0.6, '#374151');
        grad.addColorStop(1, '#15803d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(w * 0.52, h - 95, 95, 65);
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(w * 0.48, h - 95);
        ctx.lineTo(w * 0.52 + 47, h - 135);
        ctx.lineTo(w * 0.52 + 105, h - 95);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(85, 55, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(85, 55, 10, 0, Math.PI * 2);
        ctx.fill();

        drawMiniNoob2D(ctx, w * 0.32, h - 75, 0.8);
    } else if (gameId === 'toh') {
        // Tower of Hell neon cylinders
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(1, '#3b0764');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const tierColors = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
        tierColors.forEach((col, idx) => {
            ctx.fillStyle = col;
            ctx.fillRect(w * 0.3, h - 36 - idx * 28, w * 0.4, 24);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(w * 0.3, h - 36 - idx * 28, w * 0.4, 24);
        });
        drawMiniNoob2D(ctx, w * 0.22, h - 65, 0.78);
    } else if (gameId === 'zombies') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#052e16');
        grad.addColorStop(1, '#111827');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Outpost walls & zombie silhouette
        ctx.fillStyle = '#334155';
        ctx.fillRect(20, h - 55, w - 40, 35);
        // Green Zombie head
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(w * 0.62, h - 110, 36, 36);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(w * 0.62 + 6, h - 98, 7, 7);
        ctx.fillRect(w * 0.62 + 22, h - 98, 7, 7);
        drawMiniNoob2D(ctx, w * 0.28, h - 85, 0.82);
    } else if (gameId === 'speedrun') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#22d3ee');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Neon speed track & chevrons
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(20, h);
        ctx.lineTo(w * 0.42, 40);
        ctx.lineTo(w * 0.68, 40);
        ctx.lineTo(w - 20, h);
        ctx.fill();

        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
            const y = h - 30 - i * 35;
            ctx.beginPath();
            ctx.moveTo(w * 0.44, y);
            ctx.lineTo(w * 0.52, y - 14);
            ctx.lineTo(w * 0.60, y);
            ctx.stroke();
        }
        drawMiniNoob2D(ctx, w * 0.35, h - 75, 0.8);
    } else if (gameId === 'hideandseek') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#312e81');
        grad.addColorStop(1, '#78350f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Crates & Barrels
        ctx.fillStyle = '#d97706';
        ctx.fillRect(42, h - 78, 48, 48);
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 4;
        ctx.strokeRect(42, h - 78, 48, 48);

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(w - 95, h - 82, 40, 52);
        drawMiniNoob2D(ctx, w * 0.5, h - 78, 0.8);
    } else if (gameId === 'bedwars') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0ea5e9');
        grad.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Two sky islands + bed
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(20, h - 55, 110, 26);
        ctx.fillRect(w - 130, h - 55, 110, 26);
        // Bed on left island
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(42, h - 73, 44, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(42, h - 73, 14, 18);
        drawMiniNoob2D(ctx, w - 80, h - 92, 0.8);
    } else if (gameId === 'adoptme') {
        // Iconic playadopt.me pastel sky + rainbow + Nursery + Egg + Unicorn & Dog
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.55, '#bae6fd');
        grad.addColorStop(1, '#4ade80');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Rainbow arch
        const rainbowColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a855f7'];
        rainbowColors.forEach((col, i) => {
            ctx.strokeStyle = col;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.82, 115 - i * 4, Math.PI * 1.08, Math.PI * 1.92);
            ctx.stroke();
        });

        // Turquoise river & green island grass
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(0, h - 46, w, 46);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h - 18, w * 0.48, 34, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nursery Castle in background (pastel cream walls + pink roof)
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(w * 0.34, h - 105, w * 0.32, 62);
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(w * 0.31, h - 105);
        ctx.lineTo(w * 0.50, h - 142);
        ctx.lineTo(w * 0.69, h - 105);
        ctx.closePath();
        ctx.fill();
        // Nursery door & heart sign
        ctx.fillStyle = '#db2777';
        ctx.fillRect(w * 0.46, h - 72, w * 0.08, 29);
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(w * 0.50, h - 118, 9, 0, Math.PI * 2);
        ctx.fill();

        // Royal Spotted Egg on left
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(w * 0.21, h - 62, 19, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(w * 0.19, h - 68, 4.5, 0, Math.PI * 2);
        ctx.arc(w * 0.24, h - 55, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(w * 0.23, h - 70, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Cute Neon Unicorn on right
        const ux = w * 0.77, uy = h - 56;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ux - 16, uy - 12, 28, 16); // body
        ctx.fillRect(ux - 22, uy - 26, 16, 16); // head
        ctx.fillRect(ux - 14, uy + 4, 5, 10);
        ctx.fillRect(ux + 4, uy + 4, 5, 10);
        // Neon pink mane & tail
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(ux - 9, uy - 24, 5, 14);
        ctx.fillRect(ux + 12, uy - 10, 7, 12);
        // Golden unicorn horn
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(ux - 18, uy - 26);
        ctx.lineTo(ux - 23, uy - 40);
        ctx.lineTo(ux - 12, uy - 26);
        ctx.closePath();
        ctx.fill();
        // Unicorn eye
        ctx.fillStyle = '#111827';
        ctx.fillRect(ux - 19, uy - 20, 3, 3);

        // Player character in center
        drawMiniNoob2D(ctx, w * 0.48, h - 66, 0.78);
    } else if (gameId === 'casino') {
        // Blox Vegas Casino & Derby Thumbnail Artwork
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#3b0764'); // Deep Royal Purple
        grad.addColorStop(0.5, '#450a0a'); // Casino Velvet Burgundy
        grad.addColorStop(1, '#0f172a'); // Dark Slate Floor
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Neon Vegas Sunburst / Spotlight Rays
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#facc15';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
            ctx.beginPath();
            ctx.moveTo(w * 0.5, h * 0.35);
            ctx.lineTo(w * 0.5 + Math.cos(a) * w, h * 0.35 + Math.sin(a) * w);
            ctx.lineTo(w * 0.5 + Math.cos(a + 0.22) * w, h * 0.35 + Math.sin(a + 0.22) * w);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Green Felt Blackjack Table (Bottom-Left)
        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.ellipse(w * 0.28, h - 35, 75, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 2 Playing Cards (Ace of Spades & King of Hearts)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(w * 0.20, h - 60, 22, 32);
        ctx.fillRect(w * 0.28, h - 62, 22, 32);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(w * 0.20, h - 60, 22, 32);
        ctx.strokeRect(w * 0.28, h - 62, 22, 32);
        // Card symbols
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('A♠', w * 0.21, h - 46);
        ctx.fillStyle = '#dc2626';
        ctx.fillText('K♥', w * 0.29, h - 48);

        // Slot Machine (Left side)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(18, h - 115, 45, 65);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.strokeRect(18, h - 115, 45, 65);
        // Screen with 777
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(22, h - 105, 37, 24);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'extrabold 12px sans-serif';
        ctx.fillText('7 7 7', 24, h - 88);

        // Daily Wheel of Fortune (Right top)
        const wx = w * 0.80, wy = 52, wr = 38;
        const wheelCols = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = wheelCols[i];
            ctx.beginPath();
            ctx.moveTo(wx, wy);
            ctx.arc(wx, wy, wr, (i * Math.PI) / 3, ((i + 1) * Math.PI) / 3);
            ctx.closePath();
            ctx.fill();
        }
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(wx, wy, wr, 0, Math.PI * 2);
        ctx.stroke();
        // Golden Center Hub
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(wx, wy, 10, 0, Math.PI * 2);
        ctx.fill();

        // Derby Race Horse Silhouette (Bottom-Right Turf)
        ctx.fillStyle = '#15803d';
        ctx.fillRect(w * 0.55, h - 28, w * 0.45, 28);
        ctx.fillStyle = '#b45309'; // Brown horse
        ctx.fillRect(w * 0.68, h - 52, 28, 14); // horse body
        ctx.fillRect(w * 0.84, h - 64, 12, 18); // horse neck/head
        ctx.fillRect(w * 0.66, h - 38, 5, 14); // leg 1
        ctx.fillRect(w * 0.74, h - 38, 5, 14); // leg 2
        ctx.fillRect(w * 0.88, h - 40, 5, 16); // leg 3
        ctx.fillStyle = '#38bdf8'; // Blue Jockey
        ctx.fillRect(w * 0.72, h - 64, 12, 14);

        // Floating Bobux Coins
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(w * 0.50, 35, 9, 0, Math.PI * 2);
        ctx.arc(w * 0.38, 50, 7, 0, Math.PI * 2);
        ctx.arc(w * 0.62, 50, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('B$', w * 0.46, 38);

        // Character in Center
        drawMiniNoob2D(ctx, w * 0.50, h - 62, 0.82);
    }
}

function drawMiniNoob2D(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#F5CD30';
    ctx.fillRect(-14, -28, 28, 26);
    ctx.fillStyle = '#000';
    ctx.fillRect(-7, -20, 4, 4);
    ctx.fillRect(3, -20, 4, 4);
    ctx.beginPath();
    ctx.arc(0, -11, 6, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#000';
    ctx.stroke();
    const localOutfit = (typeof avatarOutfit !== 'undefined') ? avatarOutfit : {};
    const miniShirt = localOutfit && localOutfit.shirt && typeof SHOP_ITEM_MAP !== 'undefined' ? SHOP_ITEM_MAP[localOutfit.shirt] : null;
    const miniPants = localOutfit && localOutfit.pants && typeof SHOP_ITEM_MAP !== 'undefined' ? SHOP_ITEM_MAP[localOutfit.pants] : null;
    const localTorso = (typeof avatarTorsoHex !== 'undefined') ? avatarTorsoHex : '#0D69AC';
    ctx.fillStyle = (miniShirt && miniShirt.color) || localTorso;
    ctx.fillRect(-16, -2, 32, 28);
    ctx.fillStyle = '#F5CD30';
    ctx.fillRect(-26, -2, 10, 26);
    ctx.fillRect(16, -2, 10, 26);
    ctx.fillStyle = miniPants ? miniPants.color : '#4B974B';
    ctx.fillRect(-16, 26, 15, 24);
    ctx.fillRect(1, 26, 15, 24);
    ctx.restore();
}

/* ============================================================================
 * 4. CATALOG RENDERING, REAL COUNTERS, LIKE/DISLIKE & XSS-SAFE COMMENTS
 * ============================================================================ */
async function fetchAllGamesSummary() {
    const res = await apiRequest('/api/games/summary');
    if (res.ok && res.data) {
        if (typeof res.data.totalOnline === 'number') {
            liveSocialState.totalOnline = Math.max(1, res.data.totalOnline);
        }
        if (res.data.games) {
            Object.keys(res.data.games).forEach(gid => {
                const g = res.data.games[gid];
                liveSocialState.ratingsByGame[gid] = g;
                if (typeof g.online === 'number') {
                    liveSocialState.perGameOnline[gid] = g.online;
                }
            });
        }
    }
    recomputeLivePlayerCounts();
    renderGameCatalog();
}

function setFilterTag(tag) {
    activeFilterTag = tag;
    document.querySelectorAll('.tag-btn').forEach(btn => {
        const isMatch = btn.getAttribute('data-tag') === tag;
        btn.className = isMatch
            ? 'tag-btn px-2.5 py-1 rounded-md bg-[#00A2FF] text-white transition text-xs font-semibold'
            : 'tag-btn px-2.5 py-1 rounded-md bg-[#232527] hover:bg-[#2C2F33] text-gray-300 border border-[#393B3D] transition text-xs font-semibold';
    });
    renderGameCatalog();
}

function filterCategory() {
    setFilterTag('ALL');
}

const DEFAULT_GAME_RATINGS_PCT = {
    adoptme: 97,
    obby: 93,
    lava: 88,
    sfoth: 91,
    tycoon: 86,
    disasters: 94,
    toh: 83,
    zombies: 89,
    speedrun: 92,
    hideandseek: 85,
    bedwars: 95
};

function renderGameCatalog() {
    const grid = document.getElementById('games-catalog-grid');
    if (!grid) return;
    const query = (document.getElementById('game-search-input')?.value || '').trim().toLowerCase();
    grid.innerHTML = '';

    const filtered = GAMES_CATALOG.filter(g => {
        const matchesTag = activeFilterTag === 'ALL' || g.tag === activeFilterTag;
        const matchesSearch = !query || g.title.toLowerCase().includes(query) || g.description.toLowerCase().includes(query) || g.badgeText.toLowerCase().includes(query);
        return matchesTag && matchesSearch;
    });

    const listToRender = filtered.length > 0 ? filtered : GAMES_CATALOG;

    listToRender.forEach(game => {
        const rInfo = liveSocialState.ratingsByGame[game.id] || {};
        const pct = (rInfo.ratingPct !== null && rInfo.ratingPct !== undefined)
            ? rInfo.ratingPct
            : (DEFAULT_GAME_RATINGS_PCT[game.id] || 90);
        const ratingText = `${pct}% Rating`;
        const liveOnline = liveSocialState.perGameOnline[game.id] || 0;

        const card = document.createElement('div');
        card.className = 'group cursor-pointer flex flex-col justify-between transition transform hover:-translate-y-1';
        card.onclick = () => openGameModal(game.id);

        card.innerHTML = `
            <div>
                <div class="relative aspect-video rounded-xl bg-[#232527] border border-[#2C2F33] group-hover:border-white/40 overflow-hidden shadow-md transition">
                    <canvas id="thumb-${game.id}" width="320" height="180" class="w-full h-full object-cover thumb-zoom"></canvas>
                    <span class="absolute top-2 left-2 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/75 text-white border border-white/15 backdrop-blur-sm">
                        ${escapeHtml(game.badgeText)}
                    </span>
                    <span class="absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-[#FFE066]">
                        ${escapeHtml(game.reward)}
                    </span>
                </div>
                <div class="pt-2 px-0.5">
                    <h3 class="font-bold text-sm text-white truncate group-hover:text-[#00A2FF] transition">${escapeHtml(game.title)}</h3>
                </div>
            </div>
            <div class="px-0.5 pt-1 flex items-center justify-between text-[11px] text-gray-400">
                <span class="flex items-center gap-1 font-medium text-gray-300">
                    <svg class="w-3.5 h-3.5 text-gray-300 fill-current" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                    </svg>
                    <span>${escapeHtml(ratingText)}</span>
                </span>
                <span class="flex items-center gap-1 font-medium text-gray-400">
                    <span class="w-1.5 h-1.5 rounded-full ${liveOnline > 0 ? 'bg-[#00B06F] animate-pulse' : 'bg-gray-500'}"></span>
                    <span id="card-online-${game.id}">${liveOnline}</span>
                </span>
            </div>
        `;
        grid.appendChild(card);

        const c = document.getElementById(`thumb-${game.id}`);
        drawGameThumbnail(c, game.id);
    });
}

async function openGameModal(gameId) {
    const game = GAMES_CATALOG.find(g => g.id === gameId);
    if (!game) return;
    selectedGameId = game.id;

    document.getElementById('modal-game-badge').textContent = game.badgeText;
    document.getElementById('modal-game-title').textContent = game.title;
    const authorEl = document.getElementById('modal-game-author');
    if (authorEl) {
        authorEl.textContent = `Vytvořil: ${game.author}`;
    }
    document.getElementById('modal-game-reward').textContent = game.reward;
    document.getElementById('modal-game-desc').textContent = game.description;

    const mechList = document.getElementById('modal-game-mechanics');
    mechList.innerHTML = '';
    game.mechanics.forEach(m => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2';
        const sp = document.createElement('span');
        sp.textContent = m;
        li.appendChild(sp);
        mechList.appendChild(li);
    });

    setMatchmakingMode(mpState.mode);
    refreshOnlineCounterDOM();

    const modal = document.getElementById('game-detail-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    drawGameThumbnail(document.getElementById('modal-preview-canvas'), game.id);
    updateModalRatingUI(game.id);
    renderSafeCommentsList(game.id);
    await loadGameSocialDetails(game.id);
}

async function loadGameSocialDetails(gameId) {
    const res = await apiRequest(`/api/games/${gameId}/social`);
    if (res.ok && res.data) {
        liveSocialState.ratingsByGame[gameId] = {
            likes: res.data.likes || 0,
            dislikes: res.data.dislikes || 0,
            ratingPct: res.data.ratingPct,
            myVote: res.data.myVote || null,
            commentCount: (res.data.comments || []).length
        };
        liveSocialState.commentsByGame[gameId] = res.data.comments || [];
        if (selectedGameId === gameId) {
            updateModalRatingUI(gameId);
            renderSafeCommentsList(gameId);
        }
    } else if (selectedGameId === gameId) {
        showCommentStatus(res.data?.error || 'Komentáře se nepodařilo načíst.', true);
    }
}

// Refresh from persistent storage while the detail is visible, including after mobile resume.
let gameSocialRefreshPending = false;
async function refreshVisibleGameSocial() {
    const modal = document.getElementById('game-detail-modal');
    if (gameSocialRefreshPending || document.hidden || !selectedGameId || !modal || modal.classList.contains('hidden')) return;
    gameSocialRefreshPending = true;
    try { await loadGameSocialDetails(selectedGameId); }
    finally { gameSocialRefreshPending = false; }
}
const gameSocialRefreshInterval = setInterval(refreshVisibleGameSocial, 15000);
if (gameSocialRefreshInterval && gameSocialRefreshInterval.unref) gameSocialRefreshInterval.unref();
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshVisibleGameSocial(); });

function updateModalRatingUI(gameId) {
    const info = liveSocialState.ratingsByGame[gameId] || { likes: 0, dislikes: 0, ratingPct: null, myVote: null };
    const ratingEl = document.getElementById('modal-game-rating');
    const likesEl = document.getElementById('modal-likes-count');
    const dislikesEl = document.getElementById('modal-dislikes-count');
    const btnLike = document.getElementById('btn-rate-like');
    const btnDislike = document.getElementById('btn-rate-dislike');

    if (ratingEl) {
        ratingEl.textContent = info.ratingPct !== null && info.ratingPct !== undefined
            ? `👍 ${info.ratingPct}% Doporučuje`
            : 'Zatím nehodnoceno';
    }
    if (likesEl) likesEl.textContent = String(info.likes || 0);
    if (dislikesEl) dislikesEl.textContent = String(info.dislikes || 0);

    if (btnLike) {
        btnLike.className = 'min-h-[44px] min-w-[44px] px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition ' +
            (info.myVote === 'like'
                ? 'bg-[#00B06F] border-green-300 text-white'
                : 'bg-[#232527] hover:bg-[#00B06F]/25 border-[#393B3D] text-gray-200');
    }
    if (btnDislike) {
        btnDislike.className = 'min-h-[44px] min-w-[44px] px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition ' +
            (info.myVote === 'dislike'
                ? 'bg-red-600 border-red-300 text-white'
                : 'bg-[#232527] hover:bg-red-500/25 border-[#393B3D] text-gray-200');
    }
}

async function rateSelectedGame(vote) {
    if (!selectedGameId) return;
    if (!authState.user) {
        showCommentStatus('Pro hlasování (Like/Dislike) se nejprve přihlas ke svému účtu!', true);
        openAuthModal();
        return;
    }
    const gameId = selectedGameId;
    const res = await apiRequest(`/api/games/${gameId}/rate`, {
        method: 'POST',
        body: { vote }
    });
    if (!res.ok) {
        showCommentStatus(res.data?.error || 'Hodnocení se nezdařilo.', true);
        return;
    }
    liveSocialState.ratingsByGame[gameId] = {
        likes: res.data.likes || 0,
        dislikes: res.data.dislikes || 0,
        ratingPct: res.data.ratingPct,
        myVote: res.data.myVote
    };
    if (selectedGameId !== gameId) return;
    sfx.playCoin();
    updateModalRatingUI(gameId);
    renderGameCatalog();
    showCommentStatus(`Tvé hodnocení (${vote === 'like' ? '👍 Like' : '👎 Dislike'}) bylo uloženo k účtu!`, false);
}

function updateCommentCharCounter() {
    const input = document.getElementById('comment-input');
    const counter = document.getElementById('comment-char-count');
    if (input && counter) {
        counter.textContent = `${input.value.length}/250`;
    }
}

function showCommentStatus(msg, isError) {
    const el = document.getElementById('comment-status-msg');
    if (!el) return;
    el.textContent = msg;
    el.className = 'text-xs font-semibold px-3 py-1.5 rounded-lg ' + (isError
        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
        : 'bg-[#00B06F]/20 text-green-300 border border-[#00B06F]/40');
    setTimeout(() => { el.className = 'hidden'; }, 3500);
}

// Strict XSS-proof comment rendering using textContent only (zero raw innerHTML injection)
function renderSafeCommentsList(gameId) {
    const listEl = document.getElementById('modal-comments-list');
    const countBadge = document.getElementById('modal-comment-count');
    if (!listEl) return;
    listEl.innerHTML = '';

    const comments = liveSocialState.commentsByGame[gameId] || [];
    if (countBadge) countBadge.textContent = String(comments.length);

    if (comments.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'text-xs text-gray-500 py-3 text-center';
        empty.textContent = 'Zatím žádné komentáře. Buď první, kdo tuto hru ohodnotí!';
        listEl.appendChild(empty);
        return;
    }

    comments.forEach(c => {
        const item = document.createElement('div');
        item.className = 'bg-[#232527] border border-[#393B3D] rounded-xl px-3.5 py-2.5 space-y-1';

        const header = document.createElement('div');
        header.className = 'flex items-center justify-between text-[11px]';

        const author = document.createElement('span');
        author.className = 'font-bold text-[#00A2FF]';
        author.textContent = c.username || 'Hráč';

        const dateSpan = document.createElement('span');
        dateSpan.className = 'text-gray-500 font-mono text-[10px]';
        const dt = new Date(c.createdAt || Date.now());
        dateSpan.textContent = dt.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });

        header.appendChild(author);
        header.appendChild(dateSpan);

        const body = document.createElement('p');
        body.className = 'text-xs text-gray-200 break-words leading-relaxed';
        // Safe assignment via textContent prevents any XSS execution
        body.textContent = c.content || '';

        item.appendChild(header);
        item.appendChild(body);
        listEl.appendChild(item);
    });
}

async function submitGameComment() {
    if (!selectedGameId) return;
    if (!authState.user) {
        showCommentStatus('Pro přidání komentáře se musíš přihlásit ke svému účtu!', true);
        openAuthModal();
        return;
    }

    const now = Date.now();
    if (now - authState.lastCommentTime < COMMENT_COOLDOWN_MS) {
        const waitSec = Math.ceil((COMMENT_COOLDOWN_MS - (now - authState.lastCommentTime)) / 1000);
        showCommentStatus(`Anti-spam limit: Další komentář můžeš odeslat za ${waitSec}s.`, true);
        return;
    }

    const input = document.getElementById('comment-input');
    const cleanText = sanitizeTextClient(input ? input.value : '', 250);
    if (cleanText.length < 2) {
        showCommentStatus('Komentář musí obsahovat alespoň 2 znaky (max. 250 znaků).', true);
        return;
    }

    const gameId = selectedGameId;
    const res = await apiRequest(`/api/games/${gameId}/comments`, {
        method: 'POST',
        body: { content: cleanText }
    });

    if (!res.ok) {
        showCommentStatus(res.data?.error || 'Komentář se nepodařilo uložit.', true);
        return;
    }

    authState.lastCommentTime = Date.now();
    if (!liveSocialState.commentsByGame[gameId]) liveSocialState.commentsByGame[gameId] = [];
    liveSocialState.commentsByGame[gameId].unshift(res.data.comment);
    if (selectedGameId !== gameId) return;
    if (input) input.value = '';
    updateCommentCharCounter();
    sfx.playCoin();

    renderSafeCommentsList(selectedGameId);
    showCommentStatus('Komentář byl bezpečně uložen!', false);

    // Visual 30s anti-spam cooldown badge
    const badge = document.getElementById('comment-cooldown-badge');
    if (badge) {
        badge.classList.remove('hidden');
        let rem = 30;
        badge.textContent = `⏳ Anti-spam: ${rem}s`;
        const iv = setInterval(() => {
            rem--;
            if (rem <= 0) {
                clearInterval(iv);
                badge.classList.add('hidden');
            } else {
                badge.textContent = `⏳ Anti-spam: ${rem}s`;
            }
        }, 1000);
    }
}

function closeGameModal() {
    const modal = document.getElementById('game-detail-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function openAvatarPreviewModal() {
    if (typeof openShopModal === 'function') {
        openShopModal('torso');
    } else {
        const modal = document.getElementById('avatar-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }
}

function closeAvatarPreviewModal() {
    const modal = document.getElementById('avatar-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    if (typeof renderGameCatalog === 'function') renderGameCatalog();
}

function setAvatarTorsoColor(hex) {
    avatarTorsoHex = hex;
    const storageKey = typeof STORAGE_KEY_TORSO !== 'undefined' ? STORAGE_KEY_TORSO : 'boblox_avatar_torso_hex_v1';
    try { localStorage.setItem(storageKey, hex); } catch (e) {}

    if (typeof invalidateAvatarHeadshotCache === 'function') invalidateAvatarHeadshotCache();
    if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();
    if (typeof rebuildShopPreviewAvatar === 'function') rebuildShopPreviewAvatar();
    if (typeof updateTorsoColorUI === 'function') updateTorsoColorUI();
    if (typeof renderShop === 'function') renderShop();
    if (typeof renderGameCatalog === 'function') renderGameCatalog();
    if (typeof refreshPortalAvatarVisuals === 'function') refreshPortalAvatarVisuals();
    if (typeof syncAccountToServer === 'function') {
        try { syncAccountToServer().catch(() => {}); } catch (e) {}
    }
}

/* ============================================================================
 * 4B. ROBLOX 1:1 IN-GAME UI CONTROLLER (TOPBAR, ESC MENU, PEOPLE, HELP, CHAT)
 * ============================================================================ */
const robloxUiState = {
    isMenuOpen: false,
    activeTab: 'people', // 'people' | 'settings' | 'gallery' | 'report' | 'help'
    peopleViewMode: 'grid', // 'grid' | 'list'
    isPlayerListOpen: true,
    isChatOpen: false,
    isBackpackOpen: true,
    isPerfStatsOpen: false,
    shiftLockEnabled: true,
    forcefieldEnabled: true,
    captures: []
};

function getLocalRobloxPlayerProfile() {
    const isLogged = typeof authState !== 'undefined' && authState.user && authState.user.username;
    const username = isLogged
        ? authState.user.username
        : (typeof mpState !== 'undefined' && mpState.nickname && mpState.nickname !== 'Guest' ? mpState.nickname : (typeof getGuestNickname === 'function' ? getGuestNickname() : 'Guest'));
    const savedBio = (typeof localStorage !== 'undefined' && localStorage.getItem) ? localStorage.getItem('boblox_custom_bio_v1') : null;
    const currentBio = (typeof authState !== 'undefined' && authState.user && typeof authState.user.bio === 'string' && authState.user.bio)
        ? authState.user.bio
        : (savedBio || 'No bio yet');

    return {
        id: 'local',
        username: username,
        displayName: username,
        handle: `@${username.replace(/\s+/g, '')}`,
        bio: currentBio,
        torsoHex: (typeof avatarTorsoHex !== 'undefined') ? avatarTorsoHex : '#0D69AC',
        outfit: typeof avatarOutfit !== 'undefined' ? avatarOutfit : null,
        followers: 0,
        following: 0,
        rap: (typeof bobuxBalance !== 'undefined') ? bobuxBalance : 250,
        status: 'online',
        isLocal: true,
        isVip: typeof isCurrentUserVip === 'function' ? isCurrentUserVip() : false
    };
}

function getServerPlayersList() {
    const list = [getLocalRobloxPlayerProfile()];
    if (typeof mpState !== 'undefined' && mpState.remotePlayers) {
        const now = performance.now();
        Object.values(mpState.remotePlayers).forEach(rp => {
            if (now - rp.lastSeen <= 8500 && (!activeGameMode || rp.gameMode === activeGameMode)) {
                list.push({
                    id: rp.id,
                    displayName: rp.nickname || 'Player',
                    handle: `@${(rp.nickname || 'player').replace(/\s+/g, '')}`,
                    torsoHex: rp.torsoHex || '#0D69AC',
                    outfit: rp.outfit || null,
                    isLocal: false,
                    isVip: !!rp.isVip
                });
            }
        });
    }
    return list;
}

function drawRobloxAvatarCardPortrait(canvas, player) {
    if (!canvas) return;
    if (typeof drawPlayerHeadshotCanvas === 'function') {
        drawPlayerHeadshotCanvas(canvas, player);
    }
}

function renderRobloxTopRightPlayerList() {
    const rowsEl = document.getElementById('roblox-playerlist-rows');
    if (!rowsEl) return;
    rowsEl.innerHTML = '';

    const players = getServerPlayersList();
    players.forEach(p => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between py-0.5 text-xs font-medium text-white truncate gap-2';
        
        const nameContainer = document.createElement('div');
        nameContainer.className = 'flex items-center gap-1.5 truncate';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'truncate';
        nameSpan.textContent = p.displayName;
        nameContainer.appendChild(nameSpan);

        if (getPlayerTag(p.username, p.isVip)) {
            const vipBadge = document.createElement('span');
            vipBadge.className = 'shrink-0 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-gradient-to-r from-[#FFE066] to-[#F59F00] text-black shadow-sm font-sans select-none';
            vipBadge.textContent = getPlayerTag(p.username, p.isVip);
            vipBadge.title = vipBadge.textContent;
            nameContainer.appendChild(vipBadge);
        }

        row.appendChild(nameContainer);
        rowsEl.appendChild(row);
    });
}

function toggleRobloxPlayerList() {
    robloxUiState.isPlayerListOpen = !robloxUiState.isPlayerListOpen;
    const card = document.getElementById('roblox-playerlist-card');
    const reopen = document.getElementById('roblox-playerlist-reopen');
    if (card) card.classList.toggle('hidden', !robloxUiState.isPlayerListOpen);
    if (reopen) reopen.classList.toggle('hidden', robloxUiState.isPlayerListOpen);
}

function renderRobloxPeopleList() {
    const container = document.getElementById('rblx-people-grid');
    if (!container) return;
    container.innerHTML = '';

    const sub = document.getElementById('rblx-invite-subtext');
    if (sub && typeof mpState !== 'undefined') {
        sub.textContent = mpState.mode === 'private' && mpState.roomCode
            ? `Party Code: ${mpState.roomCode}`
            : 'Invite Friends to Server';
    }

    const players = getServerPlayersList();
    const isGrid = robloxUiState.peopleViewMode === 'grid';
    container.className = isGrid
        ? 'flex flex-wrap gap-3'
        : 'flex flex-col gap-2';

    players.forEach((p, idx) => {
        if (isGrid) {
            const card = document.createElement('div');
            card.className = 'w-[136px] bg-[#222428] hover:bg-[#2b2e34] rounded-xl p-2.5 flex flex-col justify-between border border-white/5 transition cursor-pointer';
            const canvasId = `rblx-avatar-card-${idx}`;
            card.innerHTML = `
                <div class="w-full h-[108px] flex items-center justify-center overflow-hidden">
                    <canvas id="${canvasId}" width="110" height="108" class="block"></canvas>
                </div>
                <div class="mt-1 min-w-0">
                    <div class="font-bold text-xs text-white truncate"></div>
                    <div class="text-[11px] text-gray-400 truncate"></div>
                </div>
            `;
            const nameDiv = card.querySelector('.font-bold');
            const handleDiv = card.querySelector('.text-gray-400');
            if (nameDiv) {
                nameDiv.textContent = p.displayName;
                if (getPlayerTag(p.username, p.isVip)) {
                    const tag = document.createElement('span');
                    tag.className = 'ml-1 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-gradient-to-r from-[#FFE066] to-[#F59F00] text-black shadow-sm font-sans align-middle inline-block';
                    tag.textContent = getPlayerTag(p.username, p.isVip);
                    nameDiv.appendChild(tag);
                }
            }
            if (handleDiv) handleDiv.textContent = p.handle;
            container.appendChild(card);

            const c = document.getElementById(canvasId);
            drawRobloxAvatarCardPortrait(c, p);
        } else {
            const row = document.createElement('div');
            row.className = 'w-full bg-[#222428] hover:bg-[#2b2e34] rounded-xl px-3.5 py-2 flex items-center justify-between border border-white/5 transition';
            const canvasId = `rblx-avatar-list-${idx}`;
            row.innerHTML = `
                <div class="flex items-center gap-3 min-w-0">
                    <canvas id="${canvasId}" width="48" height="48" class="w-11 h-11 rounded-lg bg-[#191b1f] shrink-0"></canvas>
                    <div class="min-w-0">
                        <div class="font-bold text-xs sm:text-sm text-white truncate flex items-center gap-1.5"></div>
                        <div class="text-[11px] text-gray-400 truncate"></div>
                    </div>
                </div>
                <span class="text-[11px] text-gray-400 font-medium px-2.5 py-1 rounded bg-[#18191c]">In Server</span>
            `;
            const nameDiv = row.querySelector('.font-bold');
            const handleDiv = row.querySelector('.text-gray-400');
            if (nameDiv) {
                nameDiv.textContent = p.displayName;
                if (getPlayerTag(p.username, p.isVip)) {
                    const tag = document.createElement('span');
                    tag.className = 'px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-gradient-to-r from-[#FFE066] to-[#F59F00] text-black shadow-sm font-sans align-middle inline-block';
                    tag.textContent = getPlayerTag(p.username, p.isVip);
                    nameDiv.appendChild(tag);
                }
            }
            if (handleDiv) handleDiv.textContent = p.handle;
            container.appendChild(row);

            const c = document.getElementById(canvasId);
            drawRobloxAvatarCardPortrait(c, p);
        }
    });
}

function setRobloxPeopleViewMode(mode) {
    robloxUiState.peopleViewMode = mode === 'list' ? 'list' : 'grid';
    const btnGrid = document.getElementById('rblx-btn-view-grid');
    const btnList = document.getElementById('rblx-btn-view-list');
    if (btnGrid && btnList) {
        btnGrid.className = robloxUiState.peopleViewMode === 'grid'
            ? 'w-7 h-7 rounded-md bg-[#393b40] text-white flex items-center justify-center transition'
            : 'w-7 h-7 rounded-md text-gray-400 hover:text-white flex items-center justify-center transition';
        btnList.className = robloxUiState.peopleViewMode === 'list'
            ? 'w-7 h-7 rounded-md bg-[#393b40] text-white flex items-center justify-center transition'
            : 'w-7 h-7 rounded-md text-gray-400 hover:text-white flex items-center justify-center transition';
    }
    renderRobloxPeopleList();
}

function switchRobloxMenuTab(tabId) {
    const isAdmin = typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin();
    const validTabs = ['people', 'settings', 'gallery', 'report', 'help', ...(isAdmin ? ['admin'] : [])];
    const target = validTabs.includes(tabId) ? tabId : 'people';
    robloxUiState.activeTab = target;

    document.querySelectorAll('.rblx-menu-tab').forEach(btn => {
        const isAct = btn.getAttribute('data-rblx-tab') === target;
        btn.className = isAct
            ? 'rblx-menu-tab min-h-[44px] shrink-0 px-3 py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-white border-b-2 border-white transition'
            : 'rblx-menu-tab min-h-[44px] shrink-0 px-3 py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-gray-400 hover:text-white border-b-2 border-transparent transition';
        if (btn.getAttribute('data-rblx-tab') === 'admin' && !isAdmin) btn.classList.add('hidden');
        if (isAct) btn.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    });

    [...new Set([...validTabs, 'admin'])].forEach(t => {
        const panel = document.getElementById(`rblx-panel-${t}`);
        if (panel) {
            panel.classList.toggle('hidden', t !== target);
        }
    });

    if (target === 'people') renderRobloxPeopleList();
    if (target === 'settings') updateRobloxSettingsUI();
    if (typeof syncAdminCheatControls === 'function') syncAdminCheatControls();
}

function openRobloxEscMenu(initialTab) {
    if (!activeGameMode) return;
    if (typeof updateAdminUI === 'function') updateAdminUI();
    robloxUiState.isMenuOpen = true;
    robloxUiState.isShiftLocked = false;

    const reticle = document.getElementById('roblox-shiftlock-reticle');
    if (reticle) reticle.classList.add('hidden');

    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
    if (typeof keysPressed !== 'undefined') {
        Object.keys(keysPressed).forEach(k => { keysPressed[k] = false; });
    }
    if (typeof camState !== 'undefined') {
        camState.isDragging = false;
    }

    const menuEl = document.getElementById('roblox-esc-menu');
    if (menuEl) {
        menuEl.classList.remove('hidden');
        menuEl.classList.add('flex');
    }

    if (initialTab) {
        switchRobloxMenuTab(initialTab);
    } else {
        switchRobloxMenuTab(robloxUiState.activeTab || 'people');
    }
    renderRobloxTopRightPlayerList();
}

function closeRobloxEscMenu() {
    robloxUiState.isMenuOpen = false;
    const menuEl = document.getElementById('roblox-esc-menu');
    if (menuEl) {
        menuEl.classList.add('hidden');
        menuEl.classList.remove('flex');
    }
    const c = document.getElementById('three-canvas');
    if (c && activeGameMode) {
        c.focus();
    }
}

function setRobloxShiftLock(locked) {
    if (!activeGameMode || robloxUiState.isMenuOpen) return;
    const c = document.getElementById('three-canvas');
    const reticle = document.getElementById('roblox-shiftlock-reticle');

    if (locked && robloxUiState.shiftLockEnabled) {
        robloxUiState.isShiftLocked = true;
        if (reticle) reticle.classList.remove('hidden');
        if (c && c.requestPointerLock && document.pointerLockElement !== c) {
            try { c.requestPointerLock(); } catch (e) {}
        }
    } else {
        robloxUiState.isShiftLocked = false;
        if (reticle) reticle.classList.add('hidden');
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
    }
}

function toggleRobloxShiftLock() {
    if (!activeGameMode || robloxUiState.isMenuOpen) return;
    if (!robloxUiState.shiftLockEnabled) return;
    setRobloxShiftLock(!robloxUiState.isShiftLocked);
}

function toggleRobloxEscMenu() {
    if (!activeGameMode) return;
    if (robloxUiState.isMenuOpen) {
        closeRobloxEscMenu();
    } else {
        openRobloxEscMenu();
    }
}

function leaveFromRobloxMenu() {
    closeRobloxEscMenu();
    returnToLobby();
}

function respawnFromRobloxMenu() {
    closeRobloxEscMenu();
    respawnPlayerManual();
}

function toggleRobloxChat(focusInput = false, forceState = null) {
    const box = document.getElementById('roblox-chat-box');
    if (!box) return;
    if (typeof robloxUiState === 'undefined') return;

    if (typeof forceState === 'boolean') {
        robloxUiState.isChatOpen = forceState;
    } else {
        robloxUiState.isChatOpen = !robloxUiState.isChatOpen;
    }
    box.classList.toggle('hidden', !robloxUiState.isChatOpen);
    box.classList.toggle('flex', robloxUiState.isChatOpen);

    if (robloxUiState.isChatOpen && focusInput) {
        setTimeout(() => {
            const inp = document.getElementById('roblox-chat-input');
            if (inp) inp.focus();
        }, 20);
    }
}

function appendRobloxChatMessage(senderName, text, isVip = false) {
    const list = document.getElementById('roblox-chat-messages');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'leading-snug break-words flex items-baseline flex-wrap';

    if (getPlayerTag(senderName, isVip)) {
        const vipTag = document.createElement('span');
        vipTag.className = 'mr-1.5 px-1 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-gradient-to-r from-[#FFE066] to-[#F59F00] text-black shadow-sm font-sans shrink-0';
        vipTag.textContent = getPlayerTag(senderName, isVip);
        row.appendChild(vipTag);
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = isVip ? 'font-bold text-[#FFE066] mr-1.5' : 'font-bold text-[#00A2FF] mr-1.5';
    nameSpan.textContent = `[${senderName}]:`;

    const msgSpan = document.createElement('span');
    msgSpan.className = 'text-white';
    msgSpan.textContent = text;

    row.appendChild(nameSpan);
    row.appendChild(msgSpan);
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
}

function sendRobloxChatMessage() {
    const inp = document.getElementById('roblox-chat-input');
    if (!inp) return;
    const clean = sanitizeTextClient(inp.value, 160);
    inp.value = '';
    inp.blur();
    if (!clean) return;

    const myProfile = getLocalRobloxPlayerProfile();
    appendRobloxChatMessage(myProfile.displayName, clean, myProfile.isVip);

    // Spawn 3D Roblox Chat Bubble over local player's head
    if (typeof spawnChatBubbleOnAvatar === 'function' && typeof playerAvatar !== 'undefined' && playerAvatar) {
        spawnChatBubbleOnAvatar(playerAvatar, clean, true);
    }

    if (typeof sendMultiplayerPacket === 'function') {
        sendMultiplayerPacket({
            type: 'chatMessage',
            id: mpState.myId,
            nickname: myProfile.displayName,
            text: clean,
            isVip: myProfile.isVip,
            gameMode: activeGameMode
        });
    }
}

function updateRobloxSettingsUI() {
    const shiftBtn = document.getElementById('rblx-setting-shiftlock');
    if (shiftBtn) {
        shiftBtn.textContent = robloxUiState.shiftLockEnabled ? 'On' : 'Off';
    }
    const audioBtn = document.getElementById('rblx-setting-audio');
    if (audioBtn && typeof sfx !== 'undefined') {
        audioBtn.textContent = sfx.muted ? 'Vypnuto (Muted)' : 'Zapnuto (On)';
    }
    const fsBtn = document.getElementById('rblx-setting-fullscreen');
    if (fsBtn) {
        fsBtn.textContent = document.fullscreenElement ? 'On' : 'Off';
    }
    const perfBtn = document.getElementById('rblx-setting-perf');
    if (perfBtn) {
        perfBtn.textContent = robloxUiState.isPerfStatsOpen ? 'On' : 'Off';
    }
    const ffBtn = document.getElementById('rblx-setting-forcefield');
    if (ffBtn) {
        ffBtn.textContent = robloxUiState.forcefieldEnabled ? 'Active' : 'Off';
    }
    if (typeof sfx !== 'undefined' && typeof sfx.syncMusicUI === 'function') {
        sfx.syncMusicUI();
    }
}

function toggleRobloxSetting(key) {
    if (key === 'shiftLock') {
        robloxUiState.shiftLockEnabled = !robloxUiState.shiftLockEnabled;
        if (!robloxUiState.shiftLockEnabled) {
            setRobloxShiftLock(false);
        }
        const btn = document.getElementById('rblx-setting-shiftlock');
        if (btn) btn.textContent = robloxUiState.shiftLockEnabled ? 'On' : 'Off';
    }
}

function toggleRobloxFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
        document.exitFullscreen?.().catch(() => {});
    }
    setTimeout(updateRobloxSettingsUI, 150);
}

function toggleRobloxPerfStats() {
    robloxUiState.isPerfStatsOpen = !robloxUiState.isPerfStatsOpen;
    const bar = document.getElementById('roblox-perf-stats-bar');
    if (bar) {
        bar.classList.toggle('hidden', !robloxUiState.isPerfStatsOpen);
    }
    updateRobloxSettingsUI();
}

function toggleRobloxForceField() {
    robloxUiState.forcefieldEnabled = !robloxUiState.forcefieldEnabled;
    if (typeof playerState !== 'undefined') {
        playerState.forcefieldTimer = robloxUiState.forcefieldEnabled ? 12.0 : 0;
    }
    updateRobloxSettingsUI();
}

function captureRobloxScreenshot() {
    if (!renderer || !scene || !camera) return;
    try {
        renderer.render(scene, camera);
        const dataUrl = renderer.domElement.toDataURL('image/png');
        robloxUiState.captures.unshift({
            url: dataUrl,
            time: new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        const grid = document.getElementById('rblx-gallery-grid');
        const empty = document.getElementById('rblx-gallery-empty');
        if (empty) empty.remove();
        if (grid) {
            const card = document.createElement('div');
            card.className = 'bg-[#222428] rounded-xl overflow-hidden border border-white/10 shadow';
            card.innerHTML = `
                <img src="${dataUrl}" alt="Capture" class="w-full h-28 object-cover">
                <div class="px-2.5 py-1.5 flex items-center justify-between text-[10px] text-gray-300">
                    <span>Screenshot</span>
                    <span class="font-mono text-gray-400">${robloxUiState.captures[0].time}</span>
                </div>
            `;
            grid.prepend(card);
        }
        sfx.playCoin();
        showHudToast('📸 Screenshot uložen do záložky Gallery!', 'blue');
    } catch (e) {}
}

/* ============================================================================
 * 4C. ROBLOX MODERN WEB PORTAL: HOME, PROFILE, FRIENDS SYSTEM & PEOPLE SEARCH
 * ============================================================================ */
const STORAGE_KEY_FRIENDS = 'boblox_friends_list_v1';
const STORAGE_KEY_SENT_REQUESTS = 'boblox_sent_friend_requests_v1';
const STORAGE_KEY_RECEIVED_REQUESTS = 'boblox_received_friend_requests_v1';
const STORAGE_KEY_FRIENDS_CACHE = 'boblox_friends_profiles_cache_v1';

const ROBLOX_DIRECTORY_PLAYERS = [];
const DEMO_FRIEND_ID_PREFIXES = ['p_volvo', 'p_vanessik', 'p_wizardmax', 'p_legion_main', 'p_vojta', 'p_elsa', 'p_dylinkaa', 'p_roboctak', 'p_addarian', 'p_holymoly', 'p_mesty', 'p_swayy', 'p_nahoda'];

let sentFriendRequests = (typeof window !== 'undefined' && window.sentFriendRequests) || (() => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_SENT_REQUESTS);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
})();
if (typeof window !== 'undefined') window.sentFriendRequests = sentFriendRequests;

let receivedFriendRequests = (typeof window !== 'undefined' && window.receivedFriendRequests) || (() => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_RECEIVED_REQUESTS);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
})();
if (typeof window !== 'undefined') window.receivedFriendRequests = receivedFriendRequests;

const liveFriendsPresence = {}; // friendId/username -> { inGame: boolean, gameId, gameTitle, roomCode, mode, isParty, lastSeen }

function getPlayerPresence(playerOrId) {
    if (!playerOrId) {
        return {
            status: 'offline',
            isOnline: false,
            inGame: false,
            gameId: null,
            gameTitle: null,
            isParty: false,
            roomCode: null
        };
    }

    const myProfile = typeof getLocalRobloxPlayerProfile === 'function' ? getLocalRobloxPlayerProfile() : null;
    const myUName = (myProfile && (myProfile.username || myProfile.displayName) || '').toLowerCase();
    const myId = typeof getMyUniqueSocialId === 'function' ? getMyUniqueSocialId() : null;

    let id = null;
    let dbId = null;
    let username = null;
    let isLocal = false;

    if (typeof playerOrId === 'string') {
        id = playerOrId;
        username = playerOrId.replace(/^(db_|cloud_|peer_|user_)/, '');
    } else if (typeof playerOrId === 'object' && playerOrId !== null) {
        id = playerOrId.id || null;
        dbId = playerOrId.dbId || null;
        username = playerOrId.username || playerOrId.displayName || '';
        isLocal = !!playerOrId.isLocal;
    }

    const uLower = (username || '').toLowerCase();
    const idLower = id ? String(id).toLowerCase() : '';
    const cleanNick = uLower.replace(/^(db_|cloud_|peer_|user_)/, '');

    // 1. Local player is always active while portal page is open
    if (
        isLocal ||
        id === 'local' ||
        (myId && (id === myId || idLower === String(myId).toLowerCase())) ||
        (myUName && (uLower === myUName || cleanNick === myUName))
    ) {
        const inGame = typeof activeGameMode !== 'undefined' && !!activeGameMode;
        const gameId = inGame ? activeGameMode : null;
        const gameTitle = gameId ? ((typeof GAMES_CATALOG !== 'undefined' && GAMES_CATALOG.find(g => g.id === gameId)?.title) || gameId) : null;
        const isParty = (typeof mpState !== 'undefined') && (mpState.mode === 'private' || (!!mpState.roomCode && !String(mpState.roomCode).startsWith('PUB_')));
        const roomCode = (typeof mpState !== 'undefined') ? mpState.roomCode : null;

        return {
            status: inGame ? 'in_game' : 'online',
            isOnline: true,
            inGame: inGame,
            gameId: gameId,
            gameTitle: gameTitle,
            isParty: isParty,
            roomCode: roomCode
        };
    }

    // 2. Remote player presence lookup
    let pres = null;
    const now = Date.now();

    if (typeof liveFriendsPresence !== 'undefined') {
        pres = (id && liveFriendsPresence[id]) ||
               (dbId && liveFriendsPresence[dbId]) ||
               (idLower && liveFriendsPresence[idLower]) ||
               (uLower && liveFriendsPresence[uLower]) ||
               (cleanNick && liveFriendsPresence[cleanNick]) ||
               null;
    }

    // 3. Fallback to globalOnlinePeers
    if ((!pres || (now - (pres.lastSeen || 0) > 15000)) && typeof mpState !== 'undefined' && mpState.globalOnlinePeers) {
        const peer = (id && mpState.globalOnlinePeers[id]) ||
                     (dbId && mpState.globalOnlinePeers[dbId]) ||
                     (idLower && mpState.globalOnlinePeers[idLower]) ||
                     (uLower && mpState.globalOnlinePeers[uLower]) ||
                     null;
        if (peer && (now - (peer.lastSeen || 0) <= 15000)) {
            pres = peer;
        }
    }

    // 4. Fallback to active connected remote players
    if ((!pres || (now - (pres.lastSeen || 0) > 15000)) && typeof mpState !== 'undefined' && mpState.remotePlayers) {
        for (const rp of Object.values(mpState.remotePlayers)) {
            if (!rp) continue;
            const match = (id && rp.id === id) ||
                          (uLower && rp.nickname && rp.nickname.toLowerCase() === uLower);
            if (match && (performance.now() - (rp.lastSeen || 0) <= 10000)) {
                pres = {
                    id: rp.id,
                    username: rp.nickname,
                    inGame: true,
                    gameId: typeof activeGameMode !== 'undefined' ? activeGameMode : null,
                    isParty: (typeof mpState !== 'undefined') && (mpState.mode === 'private' || (!!mpState.roomCode && !String(mpState.roomCode).startsWith('PUB_'))),
                    roomCode: mpState.roomCode || null,
                    lastSeen: now
                };
                break;
            }
        }
    }

    if (pres && (now - (pres.lastSeen || 0) <= 15000)) {
        const inGame = !!(pres.inGame && pres.gameId);
        const gameId = inGame ? pres.gameId : null;
        const gameTitle = inGame ? (pres.gameTitle || ((typeof GAMES_CATALOG !== 'undefined' && GAMES_CATALOG.find(g => g.id === gameId)?.title) || gameId)) : null;
        const isParty = !!(pres.isParty || pres.mode === 'private' || (pres.roomCode && !String(pres.roomCode).startsWith('PUB_')));
        const roomCode = pres.roomCode || null;

        return {
            status: inGame ? 'in_game' : 'online',
            isOnline: true,
            inGame: inGame,
            gameId: gameId,
            gameTitle: gameTitle,
            isParty: isParty,
            roomCode: roomCode
        };
    }

    return {
        status: 'offline',
        isOnline: false,
        inGame: false,
        gameId: null,
        gameTitle: null,
        isParty: false,
        roomCode: null
    };
}

function saveSentFriendRequests() {
    localStorage.setItem(STORAGE_KEY_SENT_REQUESTS, JSON.stringify(sentFriendRequests));
}

function saveReceivedFriendRequests() {
    localStorage.setItem(STORAGE_KEY_RECEIVED_REQUESTS, JSON.stringify(receivedFriendRequests));
    updateSidebarFriendsBadge();
}

function hasSentFriendRequest(playerOrId) {
    if (!playerOrId) return false;
    if (typeof isPlayerFriend === 'function' && isPlayerFriend(playerOrId)) return false;
    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || '').toLowerCase();

    if (typeof playerOrId === 'object') {
        const p = playerOrId;
        const uName = (p.username || p.displayName || '').toLowerCase();
        if (p.id && sentFriendRequests[p.id]) return true;
        if (p.dbId && sentFriendRequests[p.dbId]) return true;
        if (uName && (sentFriendRequests[uName] || sentFriendRequests[`cloud_${uName}`] || sentFriendRequests[`db_${uName}`] || sentFriendRequests[`user_${uName}`])) return true;
        for (const [rid, req] of Object.entries(sentFriendRequests)) {
            const rLower = rid.toLowerCase();
            if (p.id && rLower === String(p.id).toLowerCase()) return true;
            if (uName && (rLower === uName || rLower === `cloud_${uName}` || rLower === `db_${uName}` || rLower === `user_${uName}`)) return true;
            if (req && req.username && uName && req.username.toLowerCase() === uName) return true;
            if (req && req.toUsername && uName && req.toUsername.toLowerCase() === uName) return true;
        }
        return false;
    }
    const idStr = String(playerOrId).toLowerCase();
    if (sentFriendRequests[playerOrId] || sentFriendRequests[idStr]) return true;
    const cleanNick = idStr.replace(/^(user_|cloud_|db_|peer_)/, '');
    if (sentFriendRequests[cleanNick] || sentFriendRequests[`cloud_${cleanNick}`] || sentFriendRequests[`db_${cleanNick}`] || sentFriendRequests[`user_${cleanNick}`] || sentFriendRequests[`peer_${cleanNick}`]) return true;
    for (const [rid, req] of Object.entries(sentFriendRequests)) {
        const rLower = rid.toLowerCase();
        if (rLower === idStr || rLower === cleanNick || rLower.replace(/^(user_|cloud_|db_|peer_)/, '') === cleanNick) return true;
        if (req && req.username && (req.username.toLowerCase() === idStr || req.username.toLowerCase() === cleanNick)) return true;
        if (req && req.toUsername && (req.toUsername.toLowerCase() === idStr || req.toUsername.toLowerCase() === cleanNick)) return true;
    }
    return false;
}

function hasReceivedFriendRequest(playerOrId) {
    if (!playerOrId) return false;
    if (typeof playerOrId === 'object') {
        const p = playerOrId;
        const uName = (p.username || p.displayName || '').toLowerCase();
        if (p.id && receivedFriendRequests[p.id]) return true;
        if (p.dbId && receivedFriendRequests[p.dbId]) return true;
        if (uName && (receivedFriendRequests[uName] || receivedFriendRequests[`cloud_${uName}`] || receivedFriendRequests[`db_${uName}`] || receivedFriendRequests[`user_${uName}`])) return true;
        for (const [rid, req] of Object.entries(receivedFriendRequests)) {
            const rLower = rid.toLowerCase();
            if (p.id && rLower === String(p.id).toLowerCase()) return true;
            if (uName && (rLower === uName || rLower === `cloud_${uName}` || rLower === `db_${uName}` || rLower === `user_${uName}`)) return true;
            if (req && req.username && uName && req.username.toLowerCase() === uName) return true;
            if (req && req.fromUsername && uName && req.fromUsername.toLowerCase() === uName) return true;
        }
        return false;
    }
    const idStr = String(playerOrId).toLowerCase();
    if (receivedFriendRequests[playerOrId] || receivedFriendRequests[idStr]) return true;
    const cleanNick = idStr.replace(/^(user_|cloud_|db_|peer_)/, '');
    if (receivedFriendRequests[cleanNick] || receivedFriendRequests[`cloud_${cleanNick}`] || receivedFriendRequests[`db_${cleanNick}`] || receivedFriendRequests[`user_${cleanNick}`] || receivedFriendRequests[`peer_${cleanNick}`]) return true;
    for (const [rid, req] of Object.entries(receivedFriendRequests)) {
        const rLower = rid.toLowerCase();
        if (rLower === idStr || rLower === cleanNick || rLower.replace(/^(user_|cloud_|db_|peer_)/, '') === cleanNick) return true;
        if (req && req.username && (req.username.toLowerCase() === idStr || req.username.toLowerCase() === cleanNick)) return true;
        if (req && req.fromUsername && (req.fromUsername.toLowerCase() === idStr || req.fromUsername.toLowerCase() === cleanNick)) return true;
    }
    return false;
}

function updateSidebarFriendsBadge() {
    const badge = document.getElementById('sidebar-friends-badge');
    const seenUsers = new Set();
    Object.values(receivedFriendRequests).forEach(r => {
        if (r && r.username) seenUsers.add(r.username.toLowerCase());
        else if (r && r.id) seenUsers.add(String(r.id).toLowerCase());
    });
    const incomingCount = seenUsers.size;
    if (badge) {
        if (incomingCount > 0) {
            badge.textContent = String(incomingCount);
            badge.className = 'px-2 py-0.5 rounded-full bg-[#00A2FF] text-[10px] font-extrabold text-white animate-pulse';
            badge.title = `${incomingCount} příchozích žádostí o přátelství`;
            badge.classList.remove('hidden');
        } else {
            const count = (typeof getPlayerFriendsCount === 'function') ? getPlayerFriendsCount({ isLocal: true }) : friendsSet.size;
            badge.textContent = String(count);
            badge.className = 'px-2 py-0.5 rounded-full bg-[#2C2F33] text-[10px] font-bold text-gray-400';
            badge.title = '';
            badge.classList.toggle('hidden', count === 0);
        }
    }
}

function getMyUniqueSocialId() {
    const myProfile = getLocalRobloxPlayerProfile();
    const uName = (myProfile.username || '').toLowerCase();
    if (typeof authState !== 'undefined' && authState.user && authState.user.id) {
        return authState.user.id;
    }
    if (uName && !uName.startsWith('guest')) {
        return `cloud_${uName}`;
    }
    if (typeof mpState !== 'undefined' && mpState.myId && mpState.myId !== 'local') {
        return mpState.myId;
    }
    let guestId = localStorage.getItem('boblox_guest_social_id');
    if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('boblox_guest_social_id', guestId);
    }
    return guestId;
}

function handleIncomingSocialPacket(event, payload) {
    if (!payload) return;
    const myProfile = getLocalRobloxPlayerProfile();
    const myId = getMyUniqueSocialId();
    const myUName = (myProfile.username || myProfile.displayName || '').toLowerCase();
    const myPeerId = (typeof mpState !== 'undefined' && mpState.myId) ? mpState.myId : null;
    const isRegistered = typeof authState !== 'undefined' && authState.user && !myUName.startsWith('guest');

    const cleanToId = payload.toId ? String(payload.toId).toLowerCase().replace(/^(db_|cloud_|user_|peer_)/, '') : '';
    const cleanMyId = String(myId).toLowerCase().replace(/^(db_|cloud_|user_|peer_)/, '');

    if (event === 'friend_request_send') {
        const toIdMatch = payload.toId && (
            payload.toId === myId ||
            payload.toId === `db_${myUName}` ||
            payload.toId === `cloud_${myUName}` ||
            payload.toId === `user_${myUName}` ||
            (cleanToId && (cleanToId === myUName || cleanToId === cleanMyId)) ||
            (myPeerId && (payload.toId === myPeerId || payload.toId === `peer_${myPeerId}`))
        );
        const toNameMatch = payload.toUsername && (payload.toUsername.toLowerCase() === myUName);
        if (toIdMatch || toNameMatch) {
            const senderId = (payload.fromId && payload.fromId !== 'local') ? payload.fromId : (payload.fromUsername ? `cloud_${payload.fromUsername.toLowerCase()}` : null);
            if (!senderId || senderId === myId || (myPeerId && senderId === myPeerId)) return;
            if (payload.fromUsername && payload.fromUsername.toLowerCase() === myUName) return;

            // If we already sent a request to this player, this is a mutual request -> immediately become friends!
            if (hasSentFriendRequest(senderId) || (payload.fromUsername && hasSentFriendRequest(payload.fromUsername))) {
                acceptFriendRequest(senderId);
                return;
            }

            const senderNick = (payload.fromUsername || '').toLowerCase();
            const reqObj = {
                id: senderId,
                username: payload.fromUsername || 'Hráč',
                receivedAt: Date.now(),
                senderProfile: payload.senderProfile ? { ...payload.senderProfile, id: senderId, isLocal: false } : null
            };
            receivedFriendRequests[senderId] = reqObj;
            if (senderNick) {
                receivedFriendRequests[senderNick] = reqObj;
                receivedFriendRequests[`cloud_${senderNick}`] = reqObj;
            }
            saveReceivedFriendRequests();
            if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();
            if (typeof showHudToast === 'function') {
                showHudToast(`👥 ${payload.fromUsername || 'Hráč'} ti poslal žádost o přátelství!`, 'green');
            }
            renderHomeFriendsStrip();
            if (activePortalSection === 'profile') renderPortalProfileView();
            if (activePortalSection === 'people') renderPeopleResultsGrid();
        }
    } else if (event === 'friend_request_accept') {
        const toIdMatch = payload.toId && (
            payload.toId === myId ||
            payload.toId === `db_${myUName}` ||
            payload.toId === `cloud_${myUName}` ||
            payload.toId === `user_${myUName}` ||
            (cleanToId && (cleanToId === myUName || cleanToId === cleanMyId)) ||
            (myPeerId && (payload.toId === myPeerId || payload.toId === `peer_${myPeerId}`))
        );
        const toNameMatch = payload.toUsername && (payload.toUsername.toLowerCase() === myUName);
        if (toIdMatch || toNameMatch) {
            delete sentFriendRequests[payload.fromId];
            if (payload.toId) delete sentFriendRequests[payload.toId];
            if (payload.fromUsername) {
                const uLower = payload.fromUsername.toLowerCase();
                delete sentFriendRequests[uLower];
                delete sentFriendRequests[`cloud_${uLower}`];
            }
            saveSentFriendRequests();

            const acceptorId = (payload.fromId && payload.fromId !== 'local') ? payload.fromId : (payload.fromUsername ? `cloud_${payload.fromUsername.toLowerCase()}` : null);
            const canonicalName = (payload.fromUsername || acceptorId || '').toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
            if (canonicalName && canonicalName !== myUName) {
                friendsSet.add(canonicalName);
                saveFriendsList();
                if (payload.acceptorProfile) {
                    saveCachedFriendProfile({
                        ...payload.acceptorProfile,
                        id: acceptorId || canonicalName,
                        isLocal: false
                    });
                }
                if (typeof syncAccountToServer === 'function') {
                    syncAccountToServer().catch(() => {});
                }
            }
            if (typeof sfx !== 'undefined' && sfx.playWinFanfare) sfx.playWinFanfare();
            if (typeof showHudToast === 'function') {
                showHudToast(`🎉 ${payload.fromUsername || 'Hráč'} přijal tvou žádost o přátelství! Nyní jste přátelé.`, 'green');
            }
            renderHomeFriendsStrip();
            if (activePortalSection === 'profile') renderPortalProfileView();
            if (activePortalSection === 'people') renderPeopleResultsGrid();
        }
    } else if (event === 'friend_request_cancel') {
        const toIdMatch = payload.toId && (payload.toId === myId || payload.toId === `db_${myUName}` || payload.toId === `cloud_${myUName}` || cleanToId === myUName);
        const toNameMatch = payload.toUsername && payload.toUsername.toLowerCase() === myUName;
        if (toIdMatch || toNameMatch) {
            delete receivedFriendRequests[payload.fromId];
            if (payload.fromUsername) {
                const uLower = payload.fromUsername.toLowerCase();
                delete receivedFriendRequests[uLower];
                delete receivedFriendRequests[`cloud_${uLower}`];
            }
            saveReceivedFriendRequests();
            renderHomeFriendsStrip();
            if (activePortalSection === 'profile') renderPortalProfileView();
            if (activePortalSection === 'people') renderPeopleResultsGrid();
        }
    } else if (event === 'friend_presence') {
        const pId = payload.id;
        const pUser = (payload.username || '').toLowerCase();
        const gTitle = payload.gameTitle || (payload.gameId && typeof GAMES_CATALOG !== 'undefined' ? (GAMES_CATALOG.find(g => g.id === payload.gameId)?.title || payload.gameId) : null);
        const isParty = !!(payload.isParty || payload.mode === 'private' || (payload.roomCode && !String(payload.roomCode).startsWith('PUB_')));
        const enriched = {
            ...payload,
            gameTitle: gTitle,
            isParty: isParty,
            lastSeen: Date.now()
        };
        if (pId) {
            liveFriendsPresence[pId] = enriched;
        }
        if (pUser) {
            liveFriendsPresence[pUser] = enriched;
        }
        if (typeof mpState !== 'undefined' && mpState.globalOnlinePeers && pId) {
            mpState.globalOnlinePeers[pId] = {
                id: pId,
                username: payload.username || 'Hráč',
                inGame: !!payload.inGame,
                gameId: payload.gameId || null,
                gameTitle: gTitle,
                roomCode: payload.roomCode || null,
                isParty: isParty,
                lastSeen: Date.now()
            };
            if (typeof recomputeLivePlayerCounts === 'function') {
                recomputeLivePlayerCounts();
            }
        }
        renderHomeFriendsStrip();
        if (typeof activePortalSection !== 'undefined' && activePortalSection === 'people') renderPeopleResultsGrid();
        if (typeof activePortalSection !== 'undefined' && activePortalSection === 'profile') renderPortalProfileView();
    } else if (event === 'direct_chat_message') {
        if (typeof handleIncomingDirectChatMessage === 'function') {
            handleIncomingDirectChatMessage(payload);
        }
    } else if (event === 'casino_jackpot_win') {
        if (typeof handleIncomingJackpotWin === 'function') {
            handleIncomingJackpotWin(payload);
        }
    } else if (event === 'admin_broadcast') {
        if (typeof handleIncomingAdminBroadcast === 'function') {
            handleIncomingAdminBroadcast(payload);
        }
    }
}

function sendFriendRequest(playerId) {
    if (!playerId || playerId === 'local') return;
    const player = getPlayerById(playerId);
    const pName = player.username || player.displayName || 'Hráč';
    const myProfile = getLocalRobloxPlayerProfile();
    const mySenderId = getMyUniqueSocialId();
    const cleanNick = (pName || '').toLowerCase().replace(/^(db_|cloud_|user_|peer_)/, '');

    // If we already received request or are already friends, auto-accept immediately:
    if (hasReceivedFriendRequest(playerId) || (cleanNick && hasReceivedFriendRequest(cleanNick)) || isPlayerFriend(playerId) || (cleanNick && isPlayerFriend(cleanNick))) {
        acceptFriendRequest(playerId);
        return;
    }

    const reqObj = {
        id: playerId,
        toId: playerId,
        toUsername: pName,
        username: pName,
        sentAt: Date.now()
    };
    sentFriendRequests[playerId] = reqObj;
    if (cleanNick) {
        sentFriendRequests[cleanNick] = reqObj;
        sentFriendRequests[`cloud_${cleanNick}`] = reqObj;
    }
    saveSentFriendRequests();

    if (typeof sendSocialBroadcast === 'function') {
        sendSocialBroadcast('friend_request_send', {
            fromId: mySenderId,
            fromUsername: myProfile.username,
            fromPeerId: (typeof mpState !== 'undefined' && mpState.myId) ? mpState.myId : null,
            toId: playerId,
            toUsername: pName,
            senderProfile: {
                ...myProfile,
                id: mySenderId,
                isLocal: false
            }
        });
    }

    if (typeof syncAccountToServer === 'function') {
        syncAccountToServer().catch(() => {});
    }

    if (typeof apiRequest === 'function') {
        apiRequest('/api/friends/request', {
            method: 'POST',
            body: {
                targetUsername: pName,
                targetId: playerId,
                sender: {
                    id: mySenderId,
                    username: myProfile.username,
                    senderProfile: { ...myProfile, id: mySenderId, isLocal: false }
                }
            }
        }).catch(() => {});
    }

    if (typeof showHudToast === 'function') {
        showHudToast(`📩 Žádost o přátelství odeslána (${pName})!`, 'blue');
    }

    renderHomeFriendsStrip();
    if (activePortalSection === 'profile') renderPortalProfileView();
    if (activePortalSection === 'people') renderPeopleResultsGrid();
}

function cancelFriendRequest(playerOrId) {
    if (!playerOrId) return;
    const pid = typeof playerOrId === 'object' ? (playerOrId.id || playerOrId.username) : playerOrId;
    const player = getPlayerById(pid);
    const pName = player.username || player.displayName || (typeof playerOrId === 'object' ? playerOrId.username : pid);
    const mySenderId = getMyUniqueSocialId();
    const pidLower = String(pid).toLowerCase();
    const cleanNick = (pName || pidLower).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '');

    delete sentFriendRequests[pid];
    delete sentFriendRequests[pidLower];
    delete sentFriendRequests[cleanNick];
    delete sentFriendRequests[`cloud_${cleanNick}`];
    delete sentFriendRequests[`db_${cleanNick}`];
    delete sentFriendRequests[`user_${cleanNick}`];
    delete sentFriendRequests[`peer_${cleanNick}`];
    saveSentFriendRequests();

    if (typeof sendSocialBroadcast === 'function') {
        sendSocialBroadcast('friend_request_cancel', {
            fromId: mySenderId,
            toId: pid,
            toUsername: cleanNick
        });
    }

    if (typeof syncAccountToServer === 'function') {
        syncAccountToServer().catch(() => {});
    }

    if (typeof showHudToast === 'function') {
        showHudToast('Žádost o přátelství byla zrušena.', 'blue');
    }

    renderHomeFriendsStrip();
    if (activePortalSection === 'profile') renderPortalProfileView();
    if (activePortalSection === 'people') renderPeopleResultsGrid();
}

function acceptFriendRequest(playerId) {
    if (!playerId || playerId === 'local') return;
    const myProfile = getLocalRobloxPlayerProfile();
    const mySenderId = getMyUniqueSocialId();
    const req = receivedFriendRequests[playerId];
    const player = getPlayerById(playerId);
    const pName = req?.username || player.username || player.displayName || 'Hráč';
    const pidLower = String(playerId).toLowerCase();
    const cleanNick = (pName || pidLower).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '');

    delete receivedFriendRequests[playerId];
    delete receivedFriendRequests[pidLower];
    delete receivedFriendRequests[cleanNick];
    delete receivedFriendRequests[`cloud_${cleanNick}`];
    delete receivedFriendRequests[`db_${cleanNick}`];
    delete receivedFriendRequests[`user_${cleanNick}`];
    saveReceivedFriendRequests();

    delete sentFriendRequests[playerId];
    delete sentFriendRequests[pidLower];
    delete sentFriendRequests[cleanNick];
    delete sentFriendRequests[`cloud_${cleanNick}`];
    delete sentFriendRequests[`db_${cleanNick}`];
    delete sentFriendRequests[`user_${cleanNick}`];
    saveSentFriendRequests();

    friendsSet.add(cleanNick || pidLower);
    saveFriendsList();

    const profileToCache = req?.senderProfile || player;
    if (profileToCache) {
        saveCachedFriendProfile({
            ...profileToCache,
            id: playerId,
            isLocal: false
        });
    }

    if (typeof sendSocialBroadcast === 'function') {
        sendSocialBroadcast('friend_request_accept', {
            fromId: mySenderId,
            fromUsername: myProfile.username,
            toId: playerId,
            toUsername: pName,
            acceptorProfile: {
                ...myProfile,
                id: mySenderId,
                isLocal: false
            }
        });
    }

    if (typeof syncAccountToServer === 'function') {
        syncAccountToServer().catch(() => {});
    }

    if (typeof apiRequest === 'function') {
        apiRequest('/api/friends/accept', {
            method: 'POST',
            body: {
                targetUsername: pName,
                targetId: playerId
            }
        }).catch(() => {});
    }

    if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();
    if (typeof showHudToast === 'function') {
        showHudToast(`🎉 Nyní jste přátelé s ${pName}!`, 'green');
    }

    renderHomeFriendsStrip();
    if (activePortalSection === 'profile') renderPortalProfileView();
    if (activePortalSection === 'people') renderPeopleResultsGrid();
}

function declineFriendRequest(playerOrId) {
    if (!playerOrId) return;
    const pid = typeof playerOrId === 'object' ? (playerOrId.id || playerOrId.username) : playerOrId;
    const pidLower = String(pid).toLowerCase();
    const cleanNick = pidLower.replace(/^(user_|cloud_|db_|peer_)/, '');

    delete receivedFriendRequests[pid];
    delete receivedFriendRequests[pidLower];
    delete receivedFriendRequests[cleanNick];
    delete receivedFriendRequests[`cloud_${cleanNick}`];
    delete receivedFriendRequests[`db_${cleanNick}`];
    delete receivedFriendRequests[`user_${cleanNick}`];
    delete receivedFriendRequests[`peer_${cleanNick}`];
    saveReceivedFriendRequests();

    if (typeof showHudToast === 'function') {
        showHudToast('Žádost o přátelství odmítnuta.', 'blue');
    }

    renderHomeFriendsStrip();
    if (activePortalSection === 'profile') renderPortalProfileView();
    if (activePortalSection === 'people') renderPeopleResultsGrid();
}

function removeFriend(playerId) {
    if (!playerId) return;
    const player = getPlayerById(playerId);
    const pName = player.username || player.displayName || 'Hráč';
    const pidLower = String(playerId).toLowerCase();
    const cleanNick = (pName || pidLower).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '');

    friendsSet.delete(playerId);
    friendsSet.delete(pidLower);
    friendsSet.delete(cleanNick);
    friendsSet.delete(`cloud_${cleanNick}`);
    friendsSet.delete(`db_${cleanNick}`);
    friendsSet.delete(`user_${cleanNick}`);
    friendsSet.delete(`peer_${cleanNick}`);
    if (player.id) friendsSet.delete(player.id);
    if (player.dbId) friendsSet.delete(player.dbId);

    removeCachedFriendProfile(playerId);
    if (player.id && player.id !== playerId) removeCachedFriendProfile(player.id);
    saveFriendsList();

    if (typeof syncAccountToServer === 'function') {
        syncAccountToServer().catch(() => {});
    }

    if (typeof showHudToast === 'function') {
        showHudToast(`${pName} byl odebrán z přátel.`, 'blue');
    }

    renderHomeFriendsStrip();
    if (activePortalSection === 'profile') renderPortalProfileView();
    if (activePortalSection === 'people') renderPeopleResultsGrid();
}

function joinFriendGame(gameId, roomCode) {
    if (!gameId) return;
    const targetGame = typeof GAMES_CATALOG !== 'undefined' ? GAMES_CATALOG.find(g => g.id === gameId) : null;
    const title = targetGame ? targetGame.title : gameId.toUpperCase();

    if (typeof showHudToast === 'function') {
        showHudToast(`🎮 Připojuji se ke hře přítele (${title})...`, 'green');
    }

    if (roomCode) {
        setMatchmakingMode('private');
        joinMultiplayerRoom(roomCode);
    } else {
        setMatchmakingMode('public');
    }

    startGame(gameId);
}

function getCachedFriendsProfiles() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_FRIENDS_CACHE);
        if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
                return list.filter(p => p && p.id && p.id !== 'local' && !DEMO_FRIEND_ID_PREFIXES.includes(p.id));
            }
        }
    } catch (e) {}
    return [];
}

function saveCachedFriendProfile(profile) {
    if (!profile || !profile.id || profile.id === 'local' || DEMO_FRIEND_ID_PREFIXES.includes(profile.id)) return;
    const cleanProfile = {
        ...profile,
        isLocal: false
    };
    const cleanUName = (cleanProfile.username || '').toLowerCase();
    const cleanId = String(cleanProfile.id || '').toLowerCase();
    const list = getCachedFriendsProfiles().filter(p => {
        if (!p) return false;
        if (p.id === cleanProfile.id || String(p.id || '').toLowerCase() === cleanId) return false;
        if (cleanUName && (p.username || '').toLowerCase() === cleanUName) return false;
        return true;
    });
    list.push(cleanProfile);
    localStorage.setItem(STORAGE_KEY_FRIENDS_CACHE, JSON.stringify(list));
}

function removeCachedFriendProfile(playerId) {
    const pLower = String(playerId).toLowerCase();
    const list = getCachedFriendsProfiles().filter(p => p.id !== playerId && (p.username || '').toLowerCase() !== pLower);
    localStorage.setItem(STORAGE_KEY_FRIENDS_CACHE, JSON.stringify(list));
}

let friendsSet = new Set((() => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_FRIENDS));
        if (Array.isArray(saved)) {
            return saved.filter(id => id && id !== 'local' && !DEMO_FRIEND_ID_PREFIXES.includes(id));
        }
    } catch (e) {}
    return [];
})());

function sanitizeStoredFriends() {
    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || '').toLowerCase();
    const myId = getMyUniqueSocialId();
    const isRegistered = typeof authState !== 'undefined' && authState.user && !myUName.startsWith('guest');

    // Build map from user ID / dbId to clean username
    const idToUsernameMap = new Map();
    if (typeof getCloudUsersCache === 'function') {
        getCloudUsersCache().forEach(u => {
            if (u && u.username && u.id) idToUsernameMap.set(String(u.id).toLowerCase(), u.username.toLowerCase());
        });
    }
    if (typeof getLocalUsersDB === 'function') {
        getLocalUsersDB().forEach(u => {
            if (u && u.username && u.id) idToUsernameMap.set(String(u.id).toLowerCase(), u.username.toLowerCase());
        });
    }

    const cleanedFriends = new Set();
    for (const fid of friendsSet) {
        if (!fid || fid === 'local' || fid === myId) continue;
        let str = String(fid).toLowerCase().trim();
        if (idToUsernameMap.has(str)) {
            str = idToUsernameMap.get(str);
        }
        const clean = str.replace(/^(user_|cloud_|db_|peer_)/, '').trim();
        if (!clean) continue;
        if (isRegistered && clean === myUName) continue;
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)) continue;
        cleanedFriends.add(clean);
    }

    let changed = (cleanedFriends.size !== friendsSet.size);
    if (!changed) {
        for (const f of cleanedFriends) {
            if (!friendsSet.has(f)) { changed = true; break; }
        }
    }
    if (changed) {
        friendsSet.clear();
        cleanedFriends.forEach(f => friendsSet.add(f));
        localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify([...friendsSet]));
    }

    let reqChanged = false;
    for (const rid of Object.keys(receivedFriendRequests)) {
        if (!rid || rid === 'local' || rid === myId) {
            delete receivedFriendRequests[rid];
            reqChanged = true;
        } else if (isRegistered && typeof rid === 'string') {
            const rLower = rid.toLowerCase();
            if (rLower === myUName || rLower === `db_${myUName}` || rLower === `cloud_${myUName}`) {
                delete receivedFriendRequests[rid];
                reqChanged = true;
            }
        }
    }
    if (reqChanged) {
        saveReceivedFriendRequests();
    }

    try {
        const cached = getCachedFriendsProfiles();
        const seenUsernames = new Set();
        const cleanedCached = [];
        for (const p of cached) {
            if (!p || !p.id || p.id === 'local' || p.id === myId) continue;
            if (isRegistered && (p.username || '').toLowerCase() === myUName) continue;
            const pIdStr = String(p.id).toLowerCase();
            const pUserStr = (p.username || '').toLowerCase();
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pIdStr) && idToUsernameMap.has(pIdStr)) {
                continue;
            }
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pUserStr)) {
                continue;
            }
            if (pUserStr && seenUsernames.has(pUserStr)) continue;
            if (pUserStr) seenUsernames.add(pUserStr);
            cleanedCached.push(p);
        }
        if (cleanedCached.length !== cached.length) {
            localStorage.setItem(STORAGE_KEY_FRIENDS_CACHE, JSON.stringify(cleanedCached));
        }
    } catch (e) {}
}
sanitizeStoredFriends();

function saveFriendsList() {
    sanitizeStoredFriends();
    localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify([...friendsSet]));
    updateSidebarFriendsBadge();
}

function isPlayerFriend(playerOrId) {
    if (!playerOrId) return false;
    if (typeof playerOrId === 'object') {
        const p = playerOrId;
        const uName = (p.username || p.displayName || '').toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
        if (p.id) {
            const cleanId = String(p.id).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
            if (friendsSet.has(p.id) || friendsSet.has(cleanId)) return true;
        }
        if (p.dbId) {
            const cleanDb = String(p.dbId).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
            if (friendsSet.has(p.dbId) || friendsSet.has(cleanDb)) return true;
        }
        if (uName && (friendsSet.has(uName) || friendsSet.has(`user_${uName}`) || friendsSet.has(`cloud_${uName}`) || friendsSet.has(`db_${uName}`))) return true;
        for (const fid of friendsSet) {
            const fStr = String(fid).toLowerCase();
            const fClean = fStr.replace(/^(user_|cloud_|db_|peer_)/, '').trim();
            if (uName && (fStr === uName || fClean === uName)) return true;
            if (p.id && (fStr === String(p.id).toLowerCase() || fClean === String(p.id).toLowerCase())) return true;
        }
        return false;
    }

    const idStr = String(playerOrId).toLowerCase().trim();
    if (friendsSet.has(playerOrId) || friendsSet.has(idStr)) return true;

    const cleanNick = idStr.replace(/^(user_|cloud_|db_|peer_)/, '').trim();
    if (cleanNick && friendsSet.has(cleanNick)) return true;

    for (const fid of friendsSet) {
        const fStr = String(fid).toLowerCase();
        const fClean = fStr.replace(/^(user_|cloud_|db_|peer_)/, '').trim();
        if (fStr === idStr || fClean === cleanNick || fStr === cleanNick) return true;
        if (fClean && fClean === cleanNick) return true;
    }
    return false;
}

function getPlayerFriendsCount(profile) {
    if (!profile) return 0;
    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || myProfile.displayName || '').toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
    const myId = getMyUniqueSocialId();
    const isRegistered = typeof authState !== 'undefined' && authState.user && !myUName.startsWith('guest');

    const pUsername = (profile.username || profile.displayName || '').toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
    const pId = String(profile.id || '').toLowerCase();
    const pDbId = profile.dbId ? String(profile.dbId).toLowerCase() : '';

    const isMe = profile.isLocal || (pId === 'local') || (pId === String(myId).toLowerCase()) || (isRegistered && pUsername && pUsername === myUName);

    if (isMe) {
        const uniqueSet = new Set();
        for (const fid of friendsSet) {
            if (!fid || fid === 'local' || fid === myId) continue;
            const c = String(fid).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
            if (!c || (isRegistered && c === myUName)) continue;
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c)) continue;
            uniqueSet.add(c);
        }
        return uniqueSet.size;
    }

    const otherFriendsSet = new Set();

    // 1. If we are friends with this player, count ourselves as their friend
    if (isPlayerFriend(profile) || isPlayerFriend(pUsername)) {
        if (myUName && !myUName.startsWith('guest')) {
            otherFriendsSet.add(myUName);
        } else {
            otherFriendsSet.add('local_player');
        }
    }

    // 2. Check profile's own raw friends / inventory.friends if attached
    const profileInv = profile.inventory || (profile.style ? null : profile);
    const invFriends = Array.isArray(profile.friends) ? profile.friends : (Array.isArray(profileInv?.friends) ? profileInv.friends : []);
    invFriends.forEach(f => {
        if (!f || f === 'local') return;
        const c = String(f).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
        if (!c || c === pUsername) return;
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c)) return;
        otherFriendsSet.add(c);
    });

    // 3. Search cloud users cache for this player's inventory & friends
    if (typeof getCloudUsersCache === 'function') {
        const cloudUsers = getCloudUsersCache();
        const targetUserObj = cloudUsers.find(u => {
            if (!u) return false;
            const uName = (u.username || '').toLowerCase();
            return uName === pUsername || (u.id && (String(u.id).toLowerCase() === pId || String(u.id).toLowerCase() === pDbId));
        });
        if (targetUserObj) {
            const inv = (typeof targetUserObj.inventory === 'object' && targetUserObj.inventory !== null)
                ? targetUserObj.inventory
                : (typeof targetUserObj.inventory === 'string' ? (() => { try { return JSON.parse(targetUserObj.inventory); } catch { return {}; } })() : {});
            if (Array.isArray(inv.friends)) {
                inv.friends.forEach(f => {
                    if (!f || f === 'local') return;
                    const c = String(f).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
                    if (!c || c === pUsername) return;
                    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c)) return;
                    otherFriendsSet.add(c);
                });
            }
        }

        // 4. Also check if any other cloud users have this target player in their friends
        cloudUsers.forEach(cu => {
            if (!cu || !cu.username) return;
            const cuName = cu.username.toLowerCase();
            if (cuName === pUsername) return;
            const cuInv = (typeof cu.inventory === 'object' && cu.inventory !== null)
                ? cu.inventory
                : (typeof cu.inventory === 'string' ? (() => { try { return JSON.parse(cu.inventory); } catch { return {}; } })() : {});
            if (Array.isArray(cuInv.friends)) {
                const hasTarget = cuInv.friends.some(f => {
                    const c = String(f).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
                    return c === pUsername || (pDbId && c === pDbId) || (pId && c === pId);
                });
                if (hasTarget) {
                    otherFriendsSet.add(cuName);
                }
            }
        });
    }

    // 5. Check local users DB as well
    if (typeof getLocalUsersDB === 'function') {
        const localList = getLocalUsersDB();
        if (Array.isArray(localList)) {
            const localObj = localList.find(u => u && u.username && u.username.toLowerCase() === pUsername);
            if (localObj && localObj.inventory) {
                const inv = typeof localObj.inventory === 'object' ? localObj.inventory : {};
                if (Array.isArray(inv.friends)) {
                    inv.friends.forEach(f => {
                        const c = String(f).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();
                        if (c && c !== pUsername) otherFriendsSet.add(c);
                    });
                }
            }
        }
    }

    const explicitCount = typeof profile.friendsCount === 'number' ? profile.friendsCount : 0;
    return Math.max(otherFriendsSet.size, explicitCount);
}

function syncFriendRequestsWithCloudUsers(cloudUsers) {
    if (!Array.isArray(cloudUsers)) return;
    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || '').toLowerCase();
    if (!myUName || myUName.startsWith('guest')) return;
    const myId = getMyUniqueSocialId();

    let receivedChanged = false;
    let friendsChanged = false;
    let sentChanged = false;

    // Check both cloud users and local users DB
    const allUsersToCheck = [...cloudUsers];
    if (typeof getLocalUsersDB === 'function') {
        const localList = getLocalUsersDB();
        if (Array.isArray(localList)) {
            localList.forEach(lu => {
                if (lu && lu.username && !allUsersToCheck.some(cu => cu.username && cu.username.toLowerCase() === lu.username.toLowerCase())) {
                    allUsersToCheck.push(lu);
                }
            });
        }
    }

    for (const u of allUsersToCheck) {
        if (!u || !u.username) continue;
        const uName = u.username.toLowerCase();
        if (uName === myUName) continue;

        const inv = (typeof u.inventory === 'object' && u.inventory !== null)
            ? u.inventory
            : (typeof u.inventory === 'string' ? (() => { try { return JSON.parse(u.inventory); } catch { return {}; } })() : {});

        const cleanKey = `cloud_${uName}`;
        const alreadyFriends = isPlayerFriend(uName) || isPlayerFriend(cleanKey) || (u.id && isPlayerFriend(u.id));

        // 1. Check if user sent a friend request to ME
        const sentReqs = Array.isArray(inv.sent_friend_requests) ? inv.sent_friend_requests : [];
        const reqToMe = sentReqs.find(r => {
            if (!r) return false;
            const targetName = (r.toUsername || r.username || '').toLowerCase();
            const targetId = String(r.toId || r.id || '').toLowerCase();
            const cleanTargetId = targetId.replace(/^(db_|cloud_|user_|peer_)/, '');
            const cleanMyId = String(myId).toLowerCase().replace(/^(db_|cloud_|user_|peer_)/, '');
            return (
                targetName === myUName ||
                targetId === String(myId).toLowerCase() ||
                targetId === `cloud_${myUName}` ||
                targetId === `db_${myUName}` ||
                targetId === `user_${myUName}` ||
                cleanTargetId === myUName ||
                cleanTargetId === cleanMyId
            );
        });

        if (reqToMe && !alreadyFriends) {
            const iAlsoSent = hasSentFriendRequest(uName) || hasSentFriendRequest(cleanKey) || (u.id && hasSentFriendRequest(u.id));
            if (iAlsoSent) {
                // Mutual friend requests! Both players wanted to add each other -> instantly become friends!
                delete sentFriendRequests[cleanKey];
                delete sentFriendRequests[uName];
                delete sentFriendRequests[`db_${uName}`];
                if (u.id) delete sentFriendRequests[u.id];
                sentChanged = true;

                friendsSet.add(uName);
                friendsChanged = true;

                saveCachedFriendProfile({
                    id: cleanKey,
                    dbId: u.id,
                    username: u.username,
                    displayName: u.username,
                    handle: `@${u.username}`,
                    bio: u.bio || 'Registrovaný Boblox hráč',
                    torsoHex: inv.torsoHex || '#0D69AC',
                    outfit: inv.outfit || null,
                    isLocal: false
                });

                if (typeof showHudToast === 'function') {
                    showHudToast(`🎉 Vy i ${u.username} jste si poslali žádost! Nyní jste přátelé.`, 'green');
                }
                if (typeof sfx !== 'undefined' && sfx.playWinFanfare) sfx.playWinFanfare();
            } else {
                if (!receivedFriendRequests[cleanKey] && !receivedFriendRequests[uName]) {
                    const torsoHex = inv.torsoHex || '#0D69AC';
                    const outfit = inv.outfit || null;
                    const reqObj = {
                        id: cleanKey,
                        username: u.username,
                        receivedAt: reqToMe.sentAt || Date.now(),
                        senderProfile: {
                            id: cleanKey,
                            dbId: u.id,
                            username: u.username,
                            displayName: u.username,
                            handle: `@${u.username}`,
                            bio: u.bio || 'Registrovaný Boblox hráč',
                            torsoHex: torsoHex,
                            outfit: outfit,
                            isLocal: false
                        }
                    };
                    receivedFriendRequests[cleanKey] = reqObj;
                    receivedFriendRequests[uName] = reqObj;
                    receivedChanged = true;
                    if (typeof showHudToast === 'function') {
                        showHudToast(`👥 ${u.username} ti poslal žádost o přátelství!`, 'green');
                    }
                    if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();
                }
            }
        } else if (!reqToMe && !alreadyFriends) {
            // If we previously had a pending request from this cloud user, but they cancelled it:
            if (Array.isArray(inv.sent_friend_requests) && (receivedFriendRequests[cleanKey] || receivedFriendRequests[uName])) {
                delete receivedFriendRequests[cleanKey];
                delete receivedFriendRequests[uName];
                receivedChanged = true;
            }
        }

        // 2. Check if user accepted our friend request (they have me in their friends list)
        const theirFriends = Array.isArray(inv.friends) ? inv.friends.map(f => String(f).toLowerCase()) : [];
        const hasMeInFriends = theirFriends.some(f => f === myUName || f === `cloud_${myUName}` || f === `db_${myUName}` || f === String(myId).toLowerCase());

        if (hasMeInFriends) {
            if (hasSentFriendRequest(uName) || hasSentFriendRequest(cleanKey)) {
                delete sentFriendRequests[cleanKey];
                delete sentFriendRequests[uName];
                delete sentFriendRequests[`db_${uName}`];
                if (u.id) delete sentFriendRequests[u.id];
                sentChanged = true;

                if (!alreadyFriends) {
                    friendsSet.add(uName);
                    friendsChanged = true;
                    saveCachedFriendProfile({
                        id: cleanKey,
                        dbId: u.id,
                        username: u.username,
                        displayName: u.username,
                        handle: `@${u.username}`,
                        bio: u.bio || 'Registrovaný Boblox hráč',
                        torsoHex: inv.torsoHex || '#0D69AC',
                        outfit: inv.outfit || null,
                        isLocal: false
                    });
                    if (typeof showHudToast === 'function') {
                        showHudToast(`🎉 ${u.username} přijal tvou žádost o přátelství! Nyní jste přátelé.`, 'green');
                    }
                    if (typeof sfx !== 'undefined' && sfx.playWinFanfare) sfx.playWinFanfare();
                }
            }
        }

        // 3. Občerstvit profil v lokální cache pro stávající přátele při změně bio/outfitu v cloudu
        if (alreadyFriends) {
            const bioText = u.bio || inv.bio || 'Registrovaný Boblox hráč';
            saveCachedFriendProfile({
                id: cleanKey,
                dbId: u.id,
                username: u.username,
                displayName: u.username,
                handle: `@${u.username}`,
                bio: bioText,
                torsoHex: inv.torsoHex || '#0D69AC',
                outfit: inv.outfit || null,
                isLocal: false
            });
        }
    }

    if (receivedChanged) saveReceivedFriendRequests();
    if (sentChanged) saveSentFriendRequests();
    if (friendsChanged) {
        saveFriendsList();
        if (typeof syncAccountToServer === 'function') syncAccountToServer().catch(() => {});
    }
    if (receivedChanged || sentChanged || friendsChanged) {
        renderHomeFriendsStrip();
        if (typeof activePortalSection !== 'undefined' && activePortalSection === 'profile') renderPortalProfileView();
        if (typeof activePortalSection !== 'undefined' && activePortalSection === 'people') renderPeopleResultsGrid();
    }
}

// Periodic sync every 6 seconds for realtime cross-device friend requests & active presence
const friendSyncInterval = setInterval(() => {
    if (typeof fetchCloudUsers === 'function' && typeof authState !== 'undefined' && authState.user) {
        fetchCloudUsers().catch(() => {});
    }
    if (typeof activePortalSection !== 'undefined') {
        if (activePortalSection === 'home') renderHomeFriendsStrip();
        else if (activePortalSection === 'people') renderPeopleResultsGrid();
        else if (activePortalSection === 'profile') renderPortalProfileView();
    }
}, 6000);
if (friendSyncInterval && typeof friendSyncInterval.unref === 'function') {
    friendSyncInterval.unref();
}

function forceAddFriendDirectly(playerId) {
    sendFriendRequest(playerId);
}

function getAllSearchablePlayers() {
    const map = new Map();

    // 1. Include registered local accounts
    if (typeof getLocalUsersDB === 'function') {
        const localUsers = getLocalUsersDB();
        const myProfile = getLocalRobloxPlayerProfile();
        const myUName = (myProfile.username || myProfile.displayName || '').toLowerCase();
        localUsers.forEach(u => {
            if (!u || !u.username) return;
            if (u.username.toLowerCase() === myUName) return;
            const pid = `db_${u.username.toLowerCase()}`;
            if (!map.has(pid)) {
                const pres = getPlayerPresence({ id: pid, username: u.username });
                const playerObj = {
                    id: pid,
                    username: u.username,
                    displayName: u.username,
                    handle: `@${u.username}`,
                    bio: u.bio || 'Registered Boblox Player.',
                    status: pres.status,
                    presence: pres,
                    inventory: u.inventory || {},
                    friends: u.inventory?.friends || [],
                    followers: 0,
                    following: 0,
                    rap: String(u.coins || 250),
                    torsoHex: u.inventory?.torsoHex || '#0D69AC',
                    outfit: u.inventory?.outfit || null,
                    style: {
                        skinColor: '#f5cd30',
                        hairType: 'spiky_brown',
                        hairColor: '#5c2c16',
                        faceType: 'classic',
                        shirtColor: u.inventory?.torsoHex || '#0D69AC',
                        shirtPattern: 'plain',
                        pantsColor: '#4B974B'
                    }
                };
                playerObj.friendsCount = getPlayerFriendsCount(playerObj);
                map.set(pid, playerObj);
            }
        });
    }

    // 2. Include live connected multiplayer peers
    if (typeof mpState !== 'undefined' && mpState.remotePlayers) {
        Object.values(mpState.remotePlayers).forEach(rp => {
            if (!rp || !rp.id) return;
            const pid = `peer_${rp.id}`;
            const nick = rp.nickname || 'Player';
            if (!map.has(pid)) {
                const pres = getPlayerPresence({ id: pid, username: nick });
                const playerObj = {
                    id: pid,
                    username: nick,
                    displayName: nick,
                    handle: `@${nick.replace(/\s+/g, '')}`,
                    bio: 'Live multiplayer player in Boblox.',
                    status: pres.status,
                    presence: pres,
                    followers: 0,
                    following: 0,
                    rap: '250',
                    torsoHex: rp.torsoHex || '#0D69AC',
                    outfit: rp.outfit || null,
                    style: {
                        skinColor: '#f5cd30',
                        hairType: 'spiky_brown',
                        hairColor: '#5c2c16',
                        faceType: 'classic',
                        shirtColor: rp.torsoHex || '#0D69AC',
                        shirtPattern: 'plain',
                        pantsColor: '#4B974B'
                    }
                };
                playerObj.friendsCount = getPlayerFriendsCount(playerObj);
                map.set(pid, playerObj);
            }
        });
    }

    // 3. Include Cloud Accounts from Supabase profiles (Persistent Cross-Device Accounts)
    if (typeof getCloudUsersCache === 'function') {
        const cloudUsers = getCloudUsersCache();
        const myProfile = getLocalRobloxPlayerProfile();
        const myUName = (myProfile.username || myProfile.displayName || '').toLowerCase();
        cloudUsers.forEach(u => {
            if (!u || !u.username) return;
            if (u.username.toLowerCase() === myUName) return;
            const pid = `cloud_${u.username.toLowerCase()}`;
            if (!map.has(pid)) {
                const inv = (typeof u.inventory === 'object' && u.inventory !== null)
                    ? u.inventory
                    : (typeof u.inventory === 'string' ? (() => { try { return JSON.parse(u.inventory); } catch (e) { return {}; } })() : {});
                const outfit = inv.outfit || null;
                const torsoHex = inv.torsoHex || '#0D69AC';
                const pres = getPlayerPresence({ id: pid, dbId: u.id, username: u.username });
                const playerObj = {
                    id: pid,
                    dbId: u.id,
                    username: u.username,
                    displayName: u.username,
                    handle: `@${u.username}`,
                    bio: u.bio || `Registrovaný Boblox hráč • ${u.coins ?? 250} B$`,
                    status: pres.status,
                    presence: pres,
                    inventory: inv,
                    friends: inv.friends || [],
                    followers: 0,
                    following: 0,
                    rap: String(u.coins ?? 250),
                    torsoHex: torsoHex,
                    outfit: outfit,
                    style: {
                        skinColor: '#f5cd30',
                        hairType: outfit?.hat || 'spiky_brown',
                        hairColor: '#5c2c16',
                        faceType: outfit?.face || 'classic',
                        shirtColor: torsoHex,
                        shirtPattern: outfit?.shirt || 'plain',
                        pantsColor: outfit?.pants || '#4B974B'
                    }
                };
                playerObj.friendsCount = getPlayerFriendsCount(playerObj);
                map.set(pid, playerObj);
            }
        });
    }

    // 4. Include cached added friends and all IDs in friendsSet so they remain accessible even if offline
    const cachedFriends = getCachedFriendsProfiles();
    cachedFriends.forEach(p => {
        if (!p || !p.id) return;
        if (!map.has(p.id) && isPlayerFriend(p)) {
            const pres = getPlayerPresence(p);
            map.set(p.id, {
                ...p,
                status: pres.status,
                presence: pres
            });
        }
    });

    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || '').toLowerCase();
    const myId = getMyUniqueSocialId();

    friendsSet.forEach(fid => {
        if (!fid || fid === 'local' || fid === myId) return;
        const fidLower = String(fid).toLowerCase();
        if (myUName && fidLower === myUName) return;

        // Skip raw UUID strings
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fid)) return;

        let exists = false;
        for (const existing of map.values()) {
            if (
                existing.id === fid ||
                (existing.dbId && String(existing.dbId).toLowerCase() === fidLower) ||
                (existing.username && existing.username.toLowerCase() === fidLower) ||
                (existing.displayName && existing.displayName.toLowerCase() === fidLower)
            ) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            const cleanName = String(fid).replace(/^(db_|cloud_|peer_|user_)/, '');
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanName)) return;
            const pres = getPlayerPresence(fid);
            const playerObj = {
                id: fid,
                username: (pres && pres.username) || cleanName,
                displayName: (pres && pres.username) || cleanName,
                handle: `@${(pres && pres.username) || cleanName}`,
                bio: 'Přítel v Bobloxu',
                status: pres.status,
                presence: pres,
                followers: 0,
                following: 0,
                rap: '250',
                torsoHex: (pres && pres.torsoHex) || '#0D69AC',
                outfit: (pres && pres.outfit) || null,
                isLocal: false
            };
            playerObj.friendsCount = getPlayerFriendsCount(playerObj);
            map.set(fid, playerObj);
        }
    });

    return Array.from(map.values());
}

function getPlayerById(playerId) {
    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || '').toLowerCase();
    const myId = getMyUniqueSocialId();
    const isRegistered = typeof authState !== 'undefined' && authState.user && !myUName.startsWith('guest');

    if (!playerId || playerId === 'local' || playerId === myId || (isRegistered && typeof playerId === 'string' && playerId.toLowerCase() === myUName)) {
        const pres = getPlayerPresence('local');
        return { ...myProfile, status: pres.status, presence: pres, isLocal: true, friendsCount: getPlayerFriendsCount({ isLocal: true }) };
    }

    const pidLower = String(playerId).toLowerCase();
    const cleanNick = pidLower.replace(/^(db_|cloud_|peer_|user_)/, '');

    // 1. Check cached friends
    const cached = getCachedFriendsProfiles().find(p =>
        p && (
            p.id === playerId ||
            (p.username && p.username.toLowerCase() === pidLower) ||
            (p.username && p.username.toLowerCase() === cleanNick) ||
            (p.displayName && p.displayName.toLowerCase() === pidLower) ||
            (p.displayName && p.displayName.toLowerCase() === cleanNick)
        )
    );
    if (cached) {
        if (typeof getCloudUsersCache === 'function') {
            const cloudUser = getCloudUsersCache().find(u => u && u.username && u.username.toLowerCase() === cleanNick);
            if (cloudUser) {
                const cInv = (typeof cloudUser.inventory === 'object' && cloudUser.inventory !== null)
                    ? cloudUser.inventory
                    : (typeof cloudUser.inventory === 'string' ? (() => { try { return JSON.parse(cloudUser.inventory); } catch { return {}; } })() : {});
                const freshBio = cloudUser.bio || cInv.bio;
                if (freshBio && freshBio !== 'No bio yet') cached.bio = freshBio;
                if (cInv.torsoHex) cached.torsoHex = cInv.torsoHex;
                if (cInv.outfit) cached.outfit = cInv.outfit;
            }
        }
        const pres = getPlayerPresence(cached);
        const playerObj = {
            ...cached,
            status: pres.status,
            presence: pres,
            isLocal: false
        };
        playerObj.friendsCount = getPlayerFriendsCount(playerObj);
        return playerObj;
    }

    // 2. Check searchable players
    const all = getAllSearchablePlayers();
    const found = all.find(p =>
        p && (
            p.id === playerId ||
            (p.dbId && p.dbId === playerId) ||
            (p.username && p.username.toLowerCase() === pidLower) ||
            (p.username && p.username.toLowerCase() === cleanNick) ||
            (p.displayName && p.displayName.toLowerCase() === pidLower) ||
            (p.displayName && p.displayName.toLowerCase() === cleanNick) ||
            (p.handle && p.handle.toLowerCase() === `@${cleanNick}`)
        )
    );

    if (found) {
        const isMe = (found.id === 'local') || (found.id === myId) || (isRegistered && found.username && found.username.toLowerCase() === myUName);
        const pres = getPlayerPresence(found);
        const playerObj = {
            ...found,
            status: pres.status,
            presence: pres,
            isLocal: isMe
        };
        playerObj.friendsCount = getPlayerFriendsCount(playerObj);
        return playerObj;
    }

    // 3. Check live presence
    const pres = getPlayerPresence(playerId);
    if (pres.isOnline) {
        const uname = pres.username || cleanNick;
        const playerObj = {
            id: pres.id || playerId,
            username: uname,
            displayName: uname,
            handle: `@${uname}`,
            bio: 'Registrovaný Boblox hráč',
            status: pres.status,
            presence: pres,
            followers: 0,
            following: 0,
            rap: '250',
            torsoHex: pres.torsoHex || '#0D69AC',
            outfit: pres.outfit || null,
            isLocal: false
        };
        playerObj.friendsCount = getPlayerFriendsCount(playerObj);
        return playerObj;
    }

    // 4. Clean fallback (offline)
    const fallbackObj = {
        id: playerId,
        username: cleanNick,
        displayName: cleanNick,
        handle: `@${cleanNick}`,
        bio: 'Registrovaný Boblox hráč',
        status: 'offline',
        presence: pres,
        followers: 0,
        following: 0,
        rap: '250',
        torsoHex: '#0D69AC',
        outfit: null,
        isLocal: false
    };
    fallbackObj.friendsCount = getPlayerFriendsCount(fallbackObj);
    return fallbackObj;
}

/* ============================================================================
 * 2D PROCEDURAL AVATAR PORTRAITS (HEADSHOTS & FULL-BODY POSES)
 * ============================================================================ */
function resolvePlayerVisualStyle(player) {
    if (player.isLocal) {
        const outfit = (typeof avatarOutfit !== 'undefined' ? avatarOutfit : player.outfit) || {};
        const torsoColor = (typeof avatarTorsoHex !== 'undefined' ? avatarTorsoHex : player.torsoHex) || '#0D69AC';

        const shirtIt = outfit.shirt && typeof SHOP_ITEM_MAP !== 'undefined' ? SHOP_ITEM_MAP[outfit.shirt] : null;
        const pantsIt = outfit.pants && typeof SHOP_ITEM_MAP !== 'undefined' ? SHOP_ITEM_MAP[outfit.pants] : null;

        // Base classic Boblox avatar: Yellow skin, torso color, green pants, smile, no hair
        let skinColor = '#F5CD30';
        let hairType = 'none';
        let hairColor = '#5c2c16';
        let faceType = 'classic';
        let shirtColor = torsoColor;
        let shirtPattern = 'plain';
        let pantsColor = '#4B974B';
        let shoesColor = '#4B974B';

        if (shirtIt) {
            shirtColor = shirtIt.color || torsoColor;
            if (shirtIt.id === 'shirt_black_flannel' || shirtIt.id === 'shirt_flannel') shirtPattern = 'flannel_dark';
            else if (shirtIt.id === 'shirt_tux') shirtPattern = 'suit';
            else if (shirtIt.id === 'shirt_hoodie') shirtPattern = 'hoodie';
            else if (shirtIt.id === 'shirt_stripes') shirtPattern = 'stripes';
            else shirtPattern = 'plain';
        }

        if (pantsIt && pantsIt.color) {
            pantsColor = pantsIt.color;
            shoesColor = pantsIt.color;
        }

        if (outfit.face === 'face_cool') faceType = 'sunglasses_smirk';
        else if (outfit.face === 'face_kawaii') faceType = 'kawaii';
        else if (outfit.face === 'face_grin') faceType = 'creepy_grin';
        else if (outfit.face === 'face_robot') faceType = 'cyber_mask';
        else faceType = 'classic';

        if (outfit.hat === 'hat_brown_hair') { hairType = 'spiky_brown'; hairColor = '#5c2c16'; }
        else if (outfit.hat === 'hat_ponytail') { hairType = 'ponytail_dark'; hairColor = '#18181b'; }
        else if (outfit.hat === 'hat_cowboy') { hairType = 'cowboy'; hairColor = '#78350f'; }
        else if (outfit.hat === 'hat_cap') { hairType = 'blue_cap'; hairColor = '#1d4ed8'; }
        else if (outfit.hat === 'hat_crown') { hairType = 'crimson_halo'; hairColor = '#eab308'; }
        else { hairType = 'none'; }

        return {
            skinColor,
            hairType,
            hairColor,
            faceType,
            shirtColor,
            shirtPattern,
            pantsColor,
            shoesColor
        };
    }

    return Object.assign({
        skinColor: '#f5d0a9',
        hairType: 'none',
        hairColor: '#5c2c16',
        faceType: 'classic',
        shirtColor: player.torsoHex || '#0D69AC',
        shirtPattern: 'plain',
        pantsColor: '#1f2937',
        shoesColor: '#111827'
    }, player.style || {});
}

function drawAvatarHeadAndHair2D(ctx, style) {
    // Neck & Shoulders (Torso upper)
    ctx.fillStyle = style.shirtColor || '#181A1E';
    ctx.beginPath();
    ctx.roundRect(-30, 8, 60, 38, 8);
    ctx.fill();

    // Shirt pattern details
    if (style.shirtPattern === 'flannel_dark') {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        for (let x = -22; x <= 22; x += 8) {
            ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, 44); ctx.stroke();
        }
        for (let y = 14; y <= 40; y += 8) {
            ctx.beginPath(); ctx.moveTo(-28, y); ctx.lineTo(28, y); ctx.stroke();
        }
    } else if (style.shirtPattern === 'limbus_coat' || style.shirtPattern === 'suit') {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(-8, 8); ctx.lineTo(8, 8); ctx.lineTo(0, 26); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.strokeRect(-24, 12, 48, 30);
    }

    // Back Hair (for long hair / ponytails)
    if (style.hairType === 'ponytail_dark' || style.hairType === 'long_dark' || style.hairType === 'long_blonde' || style.hairType === 'pastel_fluff') {
        ctx.fillStyle = style.hairColor || '#1e2230';
        ctx.beginPath();
        ctx.ellipse(0, -8, 25, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-23, -8, 46, 28);
    }

    // Head Block
    ctx.fillStyle = style.skinColor || '#eac086';
    ctx.beginPath();
    ctx.roundRect(-18, -26, 36, 34, 7);
    ctx.fill();

    // Face Details
    const ft = style.faceType;
    if (ft === 'sunglasses_smirk') {
        // Classic Black Sunglasses
        ctx.fillStyle = '#090a0f';
        ctx.fillRect(-16, -15, 32, 3);
        ctx.beginPath();
        ctx.roundRect(-15, -15, 13, 9, 2);
        ctx.roundRect(2, -15, 13, 9, 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(-12, -13, 4, 2.5);
        ctx.fillRect(5, -13, 4, 2.5);
        // Confident smirk
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, -3, 6, 0.15 * Math.PI, 0.82 * Math.PI);
        ctx.stroke();
    } else if (ft === 'joy_mask') {
        // Joy Eyes Happy Blushing Mask (matches Legion Screenshot 4)
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        // Happy curved closed eyes
        ctx.beginPath();
        ctx.arc(-7, -11, 4.5, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(7, -11, 4.5, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        // Soft pink blush cheeks
        ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-10, -5, 4, 2.2, 0, 0, Math.PI * 2);
        ctx.ellipse(10, -5, 4, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Gentle cute smile
        ctx.beginPath();
        ctx.arc(0, -4, 5, 0.18 * Math.PI, 0.82 * Math.PI);
        ctx.stroke();
    } else if (ft === 'kawaii') {
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(-7, -11, 3.2, 0, Math.PI * 2);
        ctx.arc(7, -11, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-8, -12, 1.2, 0, Math.PI * 2);
        ctx.arc(6, -12, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(244, 114, 182, 0.55)';
        ctx.beginPath();
        ctx.ellipse(-10, -5, 3.8, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(10, -5, 3.8, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -4, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
    } else if (ft === 'creepy_grin') {
        ctx.fillStyle = '#090a0f';
        ctx.beginPath();
        ctx.arc(-7, -12, 2.8, 0, Math.PI * 2);
        ctx.arc(7, -12, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -5, 9, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    } else if (ft === 'cyber_mask' || ft === 'tactical_goggles' || ft === 'crimson_visor') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-15, -16, 30, 10);
        ctx.fillStyle = ft === 'crimson_visor' ? '#ef4444' : '#38bdf8';
        ctx.fillRect(-11, -13, 8, 4);
        ctx.fillRect(3, -13, 8, 4);
    } else if (ft === 'purple_shades') {
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-14, -15, 12, 8);
        ctx.fillRect(2, -15, 12, 8);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-14, -15, 12, 8);
        ctx.strokeRect(2, -15, 12, 8);
    } else if (ft === 'red_bandana') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-18, -16, 36, 8);
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -3, 5, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
    } else {
        // Classic smile
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(-6.5, -11, 2.6, 0, Math.PI * 2);
        ctx.arc(6.5, -11, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, -4, 5.5, 0.18 * Math.PI, 0.82 * Math.PI);
        ctx.stroke();
    }

    // Hair / Hat on Top
    const ht = style.hairType;
    ctx.fillStyle = style.hairColor || '#5c2c16';
    if (ht === 'spiky_brown' || ht === 'messy_brown' || ht === 'messy_black' || ht === 'spiky_red') {
        ctx.beginPath();
        ctx.moveTo(-20, -18);
        ctx.lineTo(-22, -28);
        ctx.lineTo(-14, -26);
        ctx.lineTo(-15, -36);
        ctx.lineTo(-5, -30);
        ctx.lineTo(1, -39);
        ctx.lineTo(7, -31);
        ctx.lineTo(16, -36);
        ctx.lineTo(14, -26);
        ctx.lineTo(22, -27);
        ctx.lineTo(19, -17);
        ctx.quadraticCurveTo(0, -22, -20, -18);
        ctx.closePath();
        ctx.fill();
    } else if (ht === 'ponytail_dark' || ht === 'long_dark' || ht === ' anime_blonde' || ht === 'long_blonde') {
        ctx.beginPath();
        ctx.arc(0, -20, 20, Math.PI, 0);
        ctx.lineTo(20, -10);
        ctx.quadraticCurveTo(10, -20, 0, -16);
        ctx.quadraticCurveTo(-10, -20, -20, -10);
        ctx.closePath();
        ctx.fill();
        // High ponytail puff on side
        if (ht === 'ponytail_dark') {
            ctx.beginPath();
            ctx.ellipse(14, -26, 9, 13, 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (ht === 'anime_blonde') {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, -19, 20, Math.PI * 0.95, Math.PI * 0.05);
        ctx.lineTo(18, -8);
        ctx.lineTo(8, -17);
        ctx.lineTo(0, -10);
        ctx.lineTo(-8, -17);
        ctx.lineTo(-18, -8);
        ctx.closePath();
        ctx.fill();
    } else if (ht === 'cowboy') {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(0, -24, 28, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(-14, -38, 28, 15, 5);
        ctx.fill();
    } else if (ht === 'blue_cap' || ht === 'white_cap' || ht === 'helmet_specops') {
        ctx.fillStyle = style.hairColor || '#1d4ed8';
        ctx.beginPath();
        ctx.arc(0, -21, 19, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-20, -23, 40, 5);
    } else if (ht === 'crimson_halo') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -34, 16, 4.5, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else if (ht === 'pastel_fluff') {
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(-10, -24, 11, 0, Math.PI * 2);
        ctx.arc(10, -24, 11, 0, Math.PI * 2);
        ctx.arc(0, -28, 12, 0, Math.PI * 2);
        ctx.fill();
    }
}

const headshotImageElementsCache = new Map();
const headshotPendingCallbacks = new Map();

function clearHeadshotImageElementsCache() {
    headshotImageElementsCache.clear();
    headshotPendingCallbacks.clear();
}

if (typeof window !== 'undefined') {
    window.clearHeadshotImageElementsCache = clearHeadshotImageElementsCache;
}

function drawPlayerHeadshotCanvas(canvas, player) {
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Circular gradient backdrop (Roblox dark aesthetic)
    const drawBackdrop = () => {
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.05, w * 0.5, h * 0.5, w * 0.55);
        grad.addColorStop(0, '#32353b');
        grad.addColorStop(1, '#1e2024');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    };
    drawBackdrop();

    const drawFallback2D = () => {
        const style = resolvePlayerVisualStyle(player || {});
        ctx.save();
        ctx.translate(w * 0.5, h * 0.64);
        const scale = (w / 92);
        ctx.scale(scale, scale);
        drawAvatarHeadAndHair2D(ctx, style);
        ctx.restore();
    };

    // Resolve outfit and torso hex (local player or inspected profile)
    const isLocal = !player || player.isLocal;
    const outfit = (isLocal && typeof avatarOutfit !== 'undefined')
        ? avatarOutfit
        : ((player && player.outfit) || {});
    const torsoHex = (isLocal && typeof avatarTorsoHex !== 'undefined')
        ? avatarTorsoHex
        : ((player && player.torsoHex) || '#0D69AC');

    let headshotDataUrl = null;
    if (typeof getAvatarHeadshotDataUrl === 'function') {
        try {
            headshotDataUrl = getAvatarHeadshotDataUrl(outfit, torsoHex);
        } catch (e) {
            headshotDataUrl = null;
        }
    }

    if (!headshotDataUrl) {
        drawFallback2D();
        return;
    }

    let img = headshotImageElementsCache.get(headshotDataUrl);
    if (!img) {
        img = new Image();
        headshotPendingCallbacks.set(headshotDataUrl, []);
        img.onload = () => {
            const cbs = headshotPendingCallbacks.get(headshotDataUrl) || [];
            headshotPendingCallbacks.delete(headshotDataUrl);
            cbs.forEach(cb => {
                try { cb(); } catch (e) {}
            });
        };
        img.src = headshotDataUrl;
        headshotImageElementsCache.set(headshotDataUrl, img);
    }

    const renderSnapshotOnThisCanvas = () => {
        ctx.clearRect(0, 0, w, h);
        drawBackdrop();
        ctx.drawImage(img, 0, 0, w, h);
    };

    if (img.complete && (img.naturalWidth !== 0 || img.width !== 0)) {
        renderSnapshotOnThisCanvas();
    } else {
        drawFallback2D();
        const pending = headshotPendingCallbacks.get(headshotDataUrl);
        if (pending) {
            pending.push(renderSnapshotOnThisCanvas);
        }
    }
}

function drawPlayerFullBodyCanvas(canvas, player) {
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const style = resolvePlayerVisualStyle(player);
    ctx.save();
    ctx.translate(w * 0.5, h * 0.52);
    const s = Math.min(w, h) / 145;
    ctx.scale(s, s);

    // Floor shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 56, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = style.pantsColor || '#111827';
    ctx.beginPath();
    ctx.roundRect(-16, 20, 14, 30, 3);
    ctx.roundRect(2, 20, 14, 30, 3);
    ctx.fill();

    // Shoes
    ctx.fillStyle = style.shoesColor || '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-17, 46, 16, 8, 3);
    ctx.roundRect(1, 46, 16, 8, 3);
    ctx.fill();

    // Left & Right Arms
    ctx.save();
    ctx.translate(-18, -10);
    ctx.rotate(0.14);
    ctx.fillStyle = style.shirtColor || '#181A1E';
    ctx.beginPath(); ctx.roundRect(-10, 0, 11, 26, 3); ctx.fill();
    ctx.fillStyle = style.skinColor || '#eac086';
    ctx.beginPath(); ctx.roundRect(-9, 25, 9, 6, 2); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(18, -10);
    ctx.rotate(-0.14);
    ctx.fillStyle = style.shirtColor || '#181A1E';
    ctx.beginPath(); ctx.roundRect(-1, 0, 11, 26, 3); ctx.fill();
    ctx.fillStyle = style.skinColor || '#eac086';
    ctx.beginPath(); ctx.roundRect(0, 25, 9, 6, 2); ctx.fill();
    ctx.restore();

    // Torso
    ctx.fillStyle = style.shirtColor || '#181A1E';
    ctx.beginPath();
    ctx.roundRect(-17, -12, 34, 34, 4);
    ctx.fill();

    if (style.shirtPattern === 'flannel_dark') {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        for (let x = -12; x <= 12; x += 8) {
            ctx.beginPath(); ctx.moveTo(x, -12); ctx.lineTo(x, 22); ctx.stroke();
        }
        for (let y = -6; y <= 18; y += 8) {
            ctx.beginPath(); ctx.moveTo(-16, y); ctx.lineTo(16, y); ctx.stroke();
        }
    } else if (style.shirtPattern === 'limbus_coat' || style.shirtPattern === 'suit') {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(-6, -12); ctx.lineTo(6, -12); ctx.lineTo(0, 6); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-14, -9, 28, 28);
    }

    // Head & Hair positioned at top of torso
    ctx.save();
    ctx.translate(0, -16);
    // Clip out shoulder part of drawAvatarHeadAndHair2D by drawing just head & hair
    ctx.beginPath();
    ctx.rect(-45, -55, 90, 64);
    ctx.clip();
    drawAvatarHeadAndHair2D(ctx, style);
    ctx.restore();

    ctx.restore();
}

/* ============================================================================
 * PORTAL NAVIGATION, HOME FRIENDS STRIP, PROFILE & PEOPLE SEARCH
 * ============================================================================ */
let activePortalSection = 'home'; // 'home' | 'profile' | 'people'
let currentInspectedProfile = null;
let currentPeopleSearchQuery = '';
let profileShowcase3DState = {
    is3D: false,
    renderer: null,
    scene: null,
    camera: null,
    avatar: null,
    rotY: 0.35,
    dragging: false,
    lastX: 0,
    rafId: null,
    lastTime: 0
};

function updateGreetingByTimeOfDay() {
    const el = document.getElementById('home-greeting-prefix');
    if (!el) return;
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) el.textContent = 'Morning';
    else if (hr >= 12 && hr < 18) el.textContent = 'Afternoon';
    else el.textContent = 'Evening';
}

const MOBILE_SIDEBAR_CLASSES = ['flex', 'fixed', 'top-12', 'bottom-0', 'left-0', 'z-50', 'shadow-2xl'];

function toggleMobileSidebar(forceOpen) {
    const sidebarEl = document.getElementById('portal-sidebar');
    const backdropEl = document.getElementById('portal-sidebar-backdrop');
    if (!sidebarEl) return;
    const isCurrentlyHidden = sidebarEl.classList.contains('hidden');
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : isCurrentlyHidden;

    if (shouldOpen) {
        sidebarEl.classList.remove('hidden');
        sidebarEl.classList.add(...MOBILE_SIDEBAR_CLASSES);
        if (backdropEl) {
            backdropEl.classList.remove('hidden');
        }
    } else {
        if (!sidebarEl.classList.contains('fixed')) return;
        sidebarEl.classList.add('hidden');
        sidebarEl.classList.remove(...MOBILE_SIDEBAR_CLASSES);
        if (backdropEl) {
            backdropEl.classList.add('hidden');
        }
    }
}

function initPortalSidebarMobileEvents() {
    const sidebarEl = document.getElementById('portal-sidebar');
    if (!sidebarEl) return;
    sidebarEl.addEventListener('click', (e) => {
        const btnOrLink = e.target && typeof e.target.closest === 'function' ? e.target.closest('button, a') : null;
        if (btnOrLink && sidebarEl.classList.contains('fixed')) {
            toggleMobileSidebar(false);
        }
    });
}

function switchPortalSection(sectionName) {
    activePortalSection = sectionName;
    const homeEl = document.getElementById('portal-home-view');
    const profEl = document.getElementById('portal-profile-view');
    const peopEl = document.getElementById('portal-people-results-view');

    if (homeEl) homeEl.classList.toggle('hidden', sectionName !== 'home');
    if (profEl) profEl.classList.toggle('hidden', sectionName !== 'profile');
    if (peopEl) peopEl.classList.toggle('hidden', sectionName !== 'people');

    // Stop 3D profile showcase RAF when leaving profile
    if (sectionName !== 'profile' && profileShowcase3DState.rafId) {
        cancelAnimationFrame(profileShowcase3DState.rafId);
        profileShowcase3DState.rafId = null;
    }

    // Highlight sidebar item
    document.querySelectorAll('.portal-nav-btn').forEach(btn => {
        const navKey = btn.getAttribute('data-sidebar-nav');
        const active = (navKey === sectionName) || (navKey === 'friends' && sectionName === 'people');
        btn.className = active
            ? 'portal-nav-btn w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#232527] text-white font-bold transition'
            : 'portal-nav-btn w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#232527] text-gray-300 hover:text-white transition';
    });

    // Close mobile sidebar and backdrop if open
    toggleMobileSidebar(false);

    // Update mobile bottom navigation buttons highlighting
    const mobileNavHome = document.getElementById('mobile-nav-home');
    const mobileNavFriends = document.getElementById('mobile-nav-friends');
    if (mobileNavHome) {
        mobileNavHome.classList.toggle('text-white', sectionName === 'home');
        mobileNavHome.classList.toggle('text-gray-400', sectionName !== 'home');
    }
    if (mobileNavFriends) {
        mobileNavFriends.classList.toggle('text-white', sectionName === 'people');
        mobileNavFriends.classList.toggle('text-gray-400', sectionName !== 'people');
    }

    if (sectionName === 'home') {
        refreshPortalAvatarVisuals();
        renderHomeFriendsStrip();
        renderGameCatalog();
    }
}

function renderHomeFriendsStrip() {
    const strip = document.getElementById('home-friends-strip');
    const countEl = document.getElementById('home-friends-count');
    const badgeEl = document.getElementById('sidebar-friends-badge');
    if (!strip) return;

    const allPlayers = getAllSearchablePlayers();
    const rawFriendList = allPlayers.filter(p => isPlayerFriend(p));
    const seenUsernames = new Set();
    const friendList = [];
    for (const f of rawFriendList) {
        const u = (f.username || f.displayName || '').toLowerCase();
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u)) continue;
        if (u && !seenUsernames.has(u)) {
            seenUsernames.add(u);
            friendList.push(f);
        }
    }

    if (countEl) countEl.textContent = String(friendList.length);
    if (badgeEl) {
        badgeEl.textContent = String(friendList.length);
        badgeEl.classList.toggle('hidden', friendList.length === 0);
    }

    strip.innerHTML = '';

    // 0. Incoming Friend Requests on Home View
    const incomingEntries = Object.entries(receivedFriendRequests);
    const seenHomeSenders = new Set();
    const uniqueIncomingHome = [];
    incomingEntries.forEach(([senderId, req]) => {
        const u = (req.username || senderId).toLowerCase();
        if (!seenHomeSenders.has(u)) {
            seenHomeSenders.add(u);
            uniqueIncomingHome.push([senderId, req]);
        }
    });

    if (uniqueIncomingHome.length > 0) {
        uniqueIncomingHome.forEach(([senderId, req]) => {
            const reqBox = document.createElement('div');
            reqBox.className = 'flex items-center gap-2 bg-[#00A2FF]/20 border border-[#00A2FF]/60 px-3 py-2 rounded-xl shrink-0 shadow-sm animate-pulse';
            reqBox.innerHTML = `
                <span class="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>👥</span>
                    <span>Žádost: <strong>${escapeHtml(req.username || 'Hráč')}</strong></span>
                </span>
                <button type="button" onclick="acceptFriendRequest('${senderId}')" class="px-2.5 py-1 rounded-lg bg-[#00B06F] hover:bg-[#009E63] text-white text-xs font-bold transition">
                    ✓ Přijmout
                </button>
                <button type="button" onclick="declineFriendRequest('${senderId}')" class="px-2 py-1 rounded-lg bg-[#2C2F33] hover:bg-[#393B3D] text-gray-300 text-xs font-bold transition">
                    ✕
                </button>
            `;
            strip.appendChild(reqBox);
        });
    }

    // 1. "+ Add Friends" Circle Button (Matches Screenshot 2)
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.onclick = () => openPeopleSearchResults('');
    addBtn.className = 'flex flex-col items-center gap-1.5 w-20 shrink-0 group text-center focus:outline-none';
    addBtn.innerHTML = `
        <div class="w-20 h-20 rounded-full bg-[#232527] group-hover:bg-[#2C2F33] border border-[#393B3D] group-hover:border-white/40 flex items-center justify-center text-gray-200 group-hover:text-white transition shadow-md">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
            </svg>
        </div>
        <span class="text-[11px] font-semibold text-gray-200 group-hover:text-white truncate w-full">Add Friends</span>
    `;
    strip.appendChild(addBtn);

    if (friendList.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'flex items-center text-xs text-gray-400 py-6 px-3 select-none';
        emptyMsg.textContent = 'Zatím nemáš žádné přátele. Klikni na Add Friends a přidej si kamarády!';
        strip.appendChild(emptyMsg);
    } else {
        // 2. Friend Avatar Circles
        friendList.forEach((friend, idx) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.onclick = () => openPlayerProfile(friend.id);
            item.className = 'flex flex-col items-center gap-1 w-20 shrink-0 group text-center focus:outline-none';

            const canvasId = `home-friend-canvas-${idx}`;
            const presence = getPlayerPresence(friend);
            const isPlaying = presence.inGame && presence.gameId;
            const isOnline = presence.isOnline;
            const gameTitle = presence.gameTitle || presence.gameId;
            const isParty = presence.isParty;
            const friendName = friend.username || friend.displayName;

            let statusDotHtml = '';
            let subtitleHtml = '';
            if (isPlaying) {
                const partyLabel = isParty ? ' (Soukromá party)' : '';
                const tooltipText = `Hraje: ${gameTitle}${partyLabel}`;
                statusDotHtml = `
                    <span class="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-[#00B06F] border-2 border-[#191B1D] flex items-center justify-center text-white shadow-md animate-pulse cursor-pointer" title="${escapeHtml(tooltipText)}">
                        <svg class="w-3 h-3 fill-white" viewBox="0 0 24 24">
                            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                    </span>`;
                subtitleHtml = `<span class="text-[9px] text-[#00B06F] font-bold truncate w-full -mt-0.5" title="${escapeHtml(tooltipText)}">🎮 ${escapeHtml(isParty ? `${gameTitle} (Party)` : gameTitle)}</span>`;
                item.title = `${friendName} • ${tooltipText}`;
            } else if (isOnline) {
                statusDotHtml = `<span class="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[#00A2FF] border-2 border-[#191B1D] shadow" title="Online na webu"></span>`;
                item.title = `${friendName} (Online na webu)`;
            } else {
                // Offline: NO BADGE OR SUBTITLE!
                statusDotHtml = '';
                subtitleHtml = '';
                item.title = `${friendName} (Offline)`;
            }

            item.innerHTML = `
                <div class="relative w-20 h-20 rounded-full bg-[#232527] border border-[#393B3D] group-hover:border-white/50 overflow-visible transition shadow-md">
                    <canvas id="${canvasId}" width="96" height="96" class="w-full h-full rounded-full block"></canvas>
                    ${statusDotHtml}
                </div>
                <span class="text-[11px] font-semibold text-gray-200 group-hover:text-white truncate w-full mt-0.5">${escapeHtml(friendName)}</span>
                ${subtitleHtml}
            `;
            strip.appendChild(item);

            const c = document.getElementById(canvasId);
            drawPlayerHeadshotCanvas(c, friend);
        });
    }
}

function refreshPortalAvatarVisuals() {
    updateGreetingByTimeOfDay();
    const myProfile = getLocalRobloxPlayerProfile();
    const myName = myProfile.username || myProfile.displayName;

    const navName = document.getElementById('nav-player-name');
    const sideName = document.getElementById('sidebar-player-name');
    const bannerName = document.getElementById('banner-player-name');

    if (navName) navName.textContent = myName;
    if (sideName) sideName.textContent = myName;
    if (bannerName) bannerName.textContent = myName;

    drawPlayerHeadshotCanvas(document.getElementById('top-nav-avatar-canvas'), myProfile);
    drawPlayerHeadshotCanvas(document.getElementById('sidebar-avatar-canvas'), myProfile);
    drawPlayerHeadshotCanvas(document.getElementById('home-user-avatar-canvas'), myProfile);

    renderHomeFriendsStrip();
    if (activePortalSection === 'profile' && currentInspectedProfile && currentInspectedProfile.isLocal) {
        currentInspectedProfile = myProfile;
        renderPortalProfileView();
    }
}

/* ============================================================================
 * PROFILE VIEW (MY PROFILE & OTHER PLAYERS + 3D/2D SHOWCASE + WEARING)
 * ============================================================================ */
function openPlayerProfile(playerId) {
    hideTopSearchDropdown();
    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || '').toLowerCase();
    const myId = getMyUniqueSocialId();
    const isRegistered = typeof authState !== 'undefined' && authState.user && !myUName.startsWith('guest');
    const isMe = !playerId || playerId === 'local' || playerId === myId || (isRegistered && typeof playerId === 'string' && playerId.toLowerCase() === myUName);

    if (isMe) {
        currentInspectedProfile = { ...myProfile, isLocal: true };
    } else {
        const p = getPlayerById(playerId);
        currentInspectedProfile = { ...p, isLocal: false };
    }

    switchPortalSection('profile');
    renderPortalProfileView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function drawCanvasRoundRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, radius);
    } else {
        const r = typeof radius === 'number' ? radius : 4;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
    }
}

function drawWearingItemCardCanvas(canvas, itemDesc) {
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const itemId = itemDesc?.shopId || itemDesc?.type || itemDesc?.id || '';
    const thumb = (typeof shopState !== 'undefined' && shopState.thumbs)
        ? (shopState.thumbs[itemId] || (itemDesc?.shopId && shopState.thumbs[itemDesc.shopId]) || (itemDesc?.type && shopState.thumbs[itemDesc.type]))
        : null;

    if (thumb && typeof Image !== 'undefined') {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
        };
        img.src = thumb;
        if (img.complete && img.naturalWidth > 0) {
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            return;
        }
    }

    ctx.save();
    ctx.translate(w * 0.5, h * 0.5);

    const t = itemDesc?.type || itemDesc?.shopId || '';

    // --- HATS & HEADWEAR ---
    if (t === 'hat_crown') {
        // Golden royal crown with gems
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -34, 10, 68, 14, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-34, 10);
        ctx.lineTo(-32, -18);
        ctx.lineTo(-16, 2);
        ctx.lineTo(0, -28);
        ctx.lineTo(16, 2);
        ctx.lineTo(32, -18);
        ctx.lineTo(34, 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#CA8A04';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        const gemColors = ['#DC2626', '#2563EB', '#16A34A', '#7C3AED'];
        [-24, -8, 8, 24].forEach((jx, idx) => {
            ctx.fillStyle = gemColors[idx % gemColors.length];
            ctx.beginPath();
            ctx.arc(jx, 17, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });
        [[-32, -18], [0, -28], [32, -18]].forEach(([px, py], idx) => {
            ctx.fillStyle = gemColors[idx % gemColors.length];
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    } else if (t === 'hat_cone') {
        // Traffic cone
        ctx.fillStyle = '#F97316';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -30, 20, 60, 10, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-22, 20);
        ctx.lineTo(0, -32);
        ctx.lineTo(22, 20);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-15, 6);
        ctx.lineTo(15, 6);
        ctx.lineTo(11, -6);
        ctx.lineTo(-11, -6);
        ctx.closePath();
        ctx.fill();
    } else if (t === 'hat_party') {
        // Party hat
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.moveTo(-22, 22);
        ctx.lineTo(0, -26);
        ctx.lineTo(22, 22);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(0, -28, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#22D3EE';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-23, 21);
        ctx.lineTo(23, 21);
        ctx.stroke();
    } else if (t === 'hat_cap') {
        // Cap
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(0, 0, 26, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#1D4ED8';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -24, 0, 52, 10, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -26, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (t === 'hat_headphones') {
        // Gaming headphones
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, -4, 28, Math.PI, 0);
        ctx.stroke();
        [-28, 28].forEach(hx => {
            ctx.fillStyle = '#111827';
            ctx.beginPath();
            drawCanvasRoundRect(ctx, hx - 6, -6, 12, 24, 4);
            ctx.fill();
            ctx.fillStyle = '#00A2FF';
            ctx.beginPath();
            drawCanvasRoundRect(ctx, hx - 4, -2, 8, 16, 2);
            ctx.fill();
        });
    } else if (t === 'hat_tophat') {
        // Top hat
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -36, 14, 72, 8, 3);
        ctx.fill();
        ctx.fillRect(-22, -30, 44, 44);
        ctx.fillStyle = '#B91C1C';
        ctx.fillRect(-22, 6, 44, 8);
    } else if (t === 'hat_cowboy') {
        // Cowboy hat
        ctx.fillStyle = '#92400E';
        ctx.beginPath();
        ctx.ellipse(0, 14, 38, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -20, -18, 40, 32, 6);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.fillRect(-20, 8, 40, 6);
    } else if (t === 'hat_viking') {
        // Viking helmet
        ctx.fillStyle = '#9CA3AF';
        ctx.beginPath();
        ctx.arc(0, 6, 26, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#78350F';
        ctx.fillRect(-28, 6, 56, 8);
        ctx.fillStyle = '#FEF3C7';
        ctx.beginPath();
        ctx.moveTo(-24, 6);
        ctx.quadraticCurveTo(-38, -12, -28, -26);
        ctx.quadraticCurveTo(-30, -10, -16, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(24, 6);
        ctx.quadraticCurveTo(38, -12, 28, -26);
        ctx.quadraticCurveTo(30, -10, 16, 0);
        ctx.closePath();
        ctx.fill();
    } else if (t === 'hat_halo') {
        // Halo
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(0, -4, 32, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else if (t === 'hat_brown_hair' || t === 'hair_brown') {
        ctx.fillStyle = '#5c2c16';
        ctx.beginPath();
        ctx.moveTo(-30, 15);
        ctx.lineTo(-34, -10);
        ctx.lineTo(-18, -28);
        ctx.lineTo(0, -35);
        ctx.lineTo(22, -26);
        ctx.lineTo(35, -8);
        ctx.lineTo(26, 22);
        ctx.quadraticCurveTo(0, -5, -30, 15);
        ctx.closePath();
        ctx.fill();
    } else if (t === 'hat_ponytail' || t === 'hair_ponytail' || t === 'hair_long_tail') {
        ctx.fillStyle = '#1E222D';
        ctx.beginPath();
        ctx.arc(-4, -8, 24, Math.PI, 0);
        ctx.lineTo(24, 26);
        ctx.quadraticCurveTo(4, 10, -24, 24);
        ctx.closePath();
        ctx.fill();
    }
    // --- FACES ---
    else if (t === 'face_cool' || t === 'sunglasses') {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#090a0f';
        ctx.fillRect(-28, -12, 56, 4);
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -26, -10, 22, 16, 3);
        drawCanvasRoundRect(ctx, 4, -10, 22, 16, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(-22, -7, 6, 4);
        ctx.fillRect(8, -7, 6, 4);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(4, 10, 10, 0.15 * Math.PI, 0.75 * Math.PI);
        ctx.stroke();
    } else if (t === 'face_classic') {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(-11, -6, 4, 0, Math.PI * 2);
        ctx.arc(11, -6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 4, 14, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
    } else if (t === 'face_wink') {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(-11, -6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(11, -4, 6, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 4, 13, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
    } else if (t === 'face_surprised') {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        [-11, 11].forEach(ex => {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex, -6, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#111111';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#111111';
            ctx.beginPath();
            ctx.arc(ex, -6, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.ellipse(0, 14, 6, 9, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (t === 'face_grin') {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(-11, -7, 4, 0, Math.PI * 2);
        ctx.arc(11, -7, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-16, 5);
        ctx.quadraticCurveTo(0, 24, 16, 5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-12, 6, 24, 5);
    } else if (t === 'face_angry') {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(-11, -4, 4, 0, Math.PI * 2);
        ctx.arc(11, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-17, -13); ctx.lineTo(-6, -8);
        ctx.moveTo(17, -13); ctx.lineTo(6, -8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 18, 11, 1.2 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();
    } else if (t === 'face_kawaii' || t === 'joy_mask') {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(-11, -6, 6, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.arc(11, -6, 6, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
        ctx.beginPath();
        ctx.ellipse(-15, 4, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.ellipse(15, 4, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.beginPath();
        ctx.arc(0, 6, 7, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
    } else if (t === 'face_villain') {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(-11, -7, 4, 0, Math.PI * 2);
        ctx.arc(11, -7, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.quadraticCurveTo(-14, 2, -20, 10);
        ctx.moveTo(0, 6);
        ctx.quadraticCurveTo(14, 2, 20, 10);
        ctx.stroke();
    } else if (t === 'face_robot') {
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -28, -26, 56, 52, 8);
        ctx.fill();
        ctx.fillStyle = '#22D3EE';
        ctx.fillRect(-20, -10, 40, 10);
        ctx.fillStyle = '#9CA3AF';
        for (let gx = -14; gx <= 14; gx += 7) {
            ctx.fillRect(gx, 10, 3, 8);
        }
    }
    // --- SHIRTS & CLOTHING ---
    else if (t === 'shirt_logo') {
        ctx.fillStyle = '#0D69AC';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -24, -24, 48, 48, 6);
        ctx.fill();
        ctx.save();
        ctx.rotate(0.2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-9, -15, 18, 18);
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(-4, -10, 8, 8);
        ctx.restore();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BOBLOX', 0, 14);
    } else if (t === 'shirt_hoodie') {
        ctx.fillStyle = '#4B5563';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -24, -24, 48, 48, 6);
        ctx.fill();
        ctx.strokeStyle = '#F3F4F6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -16); ctx.lineTo(-5, -4);
        ctx.moveTo(5, -16); ctx.lineTo(5, -4);
        ctx.stroke();
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -14, 2, 28, 14, 3);
        ctx.fill();
    } else if (t === 'shirt_stripes') {
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -24, -24, 48, 48, 6);
        ctx.fill();
        ctx.fillStyle = '#1E3A8A';
        for (let sy = -18; sy <= 18; sy += 10) {
            ctx.fillRect(-24, sy, 48, 5);
        }
    } else if (t === 'shirt_flannel') {
        ctx.fillStyle = '#B91C1C';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -24, -24, 48, 48, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(17,17,17,0.45)';
        for (let p = -18; p <= 18; p += 12) {
            ctx.fillRect(p, -24, 4, 48);
            ctx.fillRect(-24, p, 48, 4);
        }
    } else if (t === 'shirt_hero') {
        ctx.fillStyle = '#1D4ED8';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -24, -24, 48, 48, 6);
        ctx.fill();
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.moveTo(0, -18); ctx.lineTo(14, -6); ctx.lineTo(0, 8); ctx.lineTo(-14, -6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('B', 0, -5);
    } else if (t === 'shirt_tux') {
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -24, -24, 48, 48, 6);
        ctx.fill();
        ctx.fillStyle = '#F9FAFB';
        ctx.beginPath();
        ctx.moveTo(-10, -24); ctx.lineTo(10, -24); ctx.lineTo(0, 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.moveTo(0, -16); ctx.lineTo(-6, -20); ctx.lineTo(-6, -12); ctx.closePath();
        ctx.moveTo(0, -16); ctx.lineTo(6, -20); ctx.lineTo(6, -12); ctx.closePath();
        ctx.fill();
    } else if (t === 'shirt_gold') {
        ctx.fillStyle = '#EAB308';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -24, -24, 48, 48, 6);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.fillRect(-3, -24, 6, 26);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('VIP', 0, 16);
    } else if (t === 'shirt_black_flannel') {
        ctx.fillStyle = '#181A1E';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -24, -24, 48, 48, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(75, 85, 99, 0.4)';
        for (let p = -18; p <= 18; p += 10) {
            ctx.fillRect(p, -24, 3, 48);
            ctx.fillRect(-24, p, 48, 3);
        }
    } else if (t === 'shirt_limbus') {
        ctx.fillStyle = '#1f242d';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -24, -24, 48, 48, 6);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-20, -20, 40, 40);
    }
    // --- PANTS ---
    else if (t === 'pants_jeans' || t === 'jeans_outfit') {
        ctx.fillStyle = '#1E40AF';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -22, -24, 44, 48, 4);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.fillRect(-2, -2, 4, 26);
        ctx.fillStyle = '#A16207';
        ctx.fillRect(-22, -24, 44, 5);
    } else if (t === 'pants_black') {
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -22, -24, 44, 48, 4);
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.fillRect(-2, -2, 4, 26);
    } else if (t === 'pants_white') {
        ctx.fillStyle = '#E5E7EB';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -22, -24, 44, 48, 4);
        ctx.fill();
        ctx.fillStyle = '#9CA3AF';
        ctx.fillRect(-2, -2, 4, 26);
    } else if (t === 'pants_red') {
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -22, -24, 44, 48, 4);
        ctx.fill();
        ctx.fillStyle = '#991B1B';
        ctx.fillRect(-2, -2, 4, 26);
    } else if (t === 'pants_khaki') {
        ctx.fillStyle = '#A16207';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -22, -24, 44, 48, 4);
        ctx.fill();
        ctx.fillStyle = '#78350F';
        ctx.fillRect(-2, -2, 4, 26);
        ctx.fillRect(-20, 2, 7, 10);
        ctx.fillRect(13, 2, 7, 10);
    }
    // --- SPECIAL / EMOTES ---
    else if (t === 'tornado') {
        ctx.fillStyle = '#9ca3af';
        for (let i = 0; i < 14; i++) {
            const a = i * 1.1;
            const r = 8 + (i % 4) * 7;
            ctx.save();
            ctx.translate(Math.cos(a) * r, Math.sin(a) * r);
            ctx.rotate(a);
            ctx.fillRect(-4, -2, 8, 5);
            ctx.restore();
        }
    } else if (t === 'pose_v' || t === 'pose_monkey' || t === 'pose_pogo') {
        ctx.fillStyle = '#d1d5db';
        if (t === 'pose_v') ctx.rotate(-0.45);
        ctx.beginPath();
        ctx.arc(0, -28, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-7, -18, 14, 24);
        ctx.save();
        ctx.rotate(t === 'pose_pogo' ? -1.1 : -0.6);
        ctx.fillRect(-24, -16, 18, 6);
        ctx.restore();
        ctx.save();
        ctx.rotate(t === 'pose_pogo' ? 1.1 : 0.6);
        ctx.fillRect(6, -16, 18, 6);
        ctx.restore();
        ctx.fillRect(-7, 6, 6, 22);
        ctx.fillRect(1, 6, 6, 22);
    } else if (t === 'classic_noob') {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, -18, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0D69AC';
        ctx.fillRect(-14, -4, 28, 22);
        ctx.fillStyle = '#16A34A';
        ctx.fillRect(-13, 18, 11, 16);
        ctx.fillRect(2, 18, 11, 16);
    } else if (t.startsWith('hat_')) {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, 4, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(-16, -14, 32, 10);
    } else if (t.startsWith('face_')) {
        ctx.fillStyle = '#F5CD30';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(-10, -6, 4, 0, Math.PI * 2);
        ctx.arc(10, -6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 4, 12, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
    } else if (t.startsWith('shirt_')) {
        ctx.fillStyle = '#0D69AC';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -22, -22, 44, 44, 5);
        ctx.fill();
    } else if (t.startsWith('pants_')) {
        ctx.fillStyle = '#1E40AF';
        ctx.beginPath();
        drawCanvasRoundRect(ctx, -22, -22, 44, 44, 4);
        ctx.fill();
    } else {
        // Outfit mannequin fallback
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(-12, -26, 24, 24);
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(-16, -2, 32, 22);
        ctx.fillStyle = '#111827';
        ctx.fillRect(-15, 20, 13, 18);
        ctx.fillRect(2, 20, 13, 18);
    }

    ctx.restore();
}

function getProfileWearingItems(profile) {
    if (profile.isLocal) {
        const items = [];
        const outfit = (typeof avatarOutfit !== 'undefined') ? avatarOutfit : {};
        if (outfit.hat && typeof SHOP_ITEM_MAP !== 'undefined' && SHOP_ITEM_MAP[outfit.hat]) {
            const h = SHOP_ITEM_MAP[outfit.hat];
            items.push({ name: h.name, price: `${h.price} B$`, type: h.id, shopId: h.id, slot: h.slot });
        }
        if (outfit.face && typeof SHOP_ITEM_MAP !== 'undefined' && SHOP_ITEM_MAP[outfit.face]) {
            const f = SHOP_ITEM_MAP[outfit.face];
            items.push({ name: f.name, price: `${f.price} B$`, type: f.id, shopId: f.id, slot: f.slot });
        }
        if (outfit.shirt && typeof SHOP_ITEM_MAP !== 'undefined' && SHOP_ITEM_MAP[outfit.shirt]) {
            const s = SHOP_ITEM_MAP[outfit.shirt];
            items.push({ name: s.name, price: `${s.price} B$`, type: s.id, shopId: s.id, slot: s.slot });
        }
        if (outfit.pants && typeof SHOP_ITEM_MAP !== 'undefined' && SHOP_ITEM_MAP[outfit.pants]) {
            const p = SHOP_ITEM_MAP[outfit.pants];
            items.push({ name: p.name, price: `${p.price} B$`, type: p.id, shopId: p.id, slot: p.slot });
        }
        if (items.length === 0) {
            items.push({ name: 'Základní Noob Styl', price: '0 B$', type: 'classic_noob', shopId: 'classic_noob', slot: 'special' });
        }
        return items;
    }

    if (profile.customWearing) return profile.customWearing;

    const items = [];
    if (profile.outfit && typeof SHOP_ITEM_MAP !== 'undefined') {
        if (profile.outfit.hat && SHOP_ITEM_MAP[profile.outfit.hat]) {
            const h = SHOP_ITEM_MAP[profile.outfit.hat];
            items.push({ name: h.name, price: `${h.price} B$`, type: h.id, shopId: h.id, slot: h.slot });
        }
        if (profile.outfit.face && SHOP_ITEM_MAP[profile.outfit.face]) {
            const f = SHOP_ITEM_MAP[profile.outfit.face];
            items.push({ name: f.name, price: `${f.price} B$`, type: f.id, shopId: f.id, slot: f.slot });
        }
        if (profile.outfit.shirt && SHOP_ITEM_MAP[profile.outfit.shirt]) {
            const s = SHOP_ITEM_MAP[profile.outfit.shirt];
            items.push({ name: s.name, price: `${s.price} B$`, type: s.id, shopId: s.id, slot: s.slot });
        }
        if (profile.outfit.pants && SHOP_ITEM_MAP[profile.outfit.pants]) {
            const p = SHOP_ITEM_MAP[profile.outfit.pants];
            items.push({ name: p.name, price: `${p.price} B$`, type: p.id, shopId: p.id, slot: p.slot });
        }
    }
    if (items.length === 0) {
        items.push({ name: `${profile.username || profile.displayName}'s Signature Outfit`, price: '50 B$', type: 'jeans_outfit', shopId: 'pants_jeans', slot: 'clothing' });
    }
    return items;
}

function renderPortalProfileView() {
    if (typeof generateShopThumbnails === 'function') {
        generateShopThumbnails();
    }
    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || '').toLowerCase();
    const myId = getMyUniqueSocialId();
    const isRegistered = typeof authState !== 'undefined' && authState.user && !myUName.startsWith('guest');
    let profile = currentInspectedProfile || myProfile;

    const isMe = (profile.id === 'local') ||
                 (profile.id === myId) ||
                 (isRegistered && profile.username && profile.username.toLowerCase() === myUName);

    profile = isMe ? { ...myProfile, isLocal: true } : { ...profile, isLocal: false };
    currentInspectedProfile = profile;

    const nameEl = document.getElementById('profile-display-name');
    const handleEl = document.getElementById('profile-handle');
    const bioEl = document.getElementById('profile-bio-text');
    const friendsStat = document.getElementById('profile-stat-friends');
    const followersStat = document.getElementById('profile-stat-followers');
    const followingStat = document.getElementById('profile-stat-following');
    const rapStat = document.getElementById('profile-stat-rap');
    const actionsEl = document.getElementById('profile-action-buttons');

    const uName = profile.username || profile.displayName;
    if (nameEl) nameEl.textContent = uName;
    if (handleEl) handleEl.textContent = `@${uName}`;
    if (bioEl) bioEl.textContent = profile.bio || 'No bio yet';

    const vipBadge = document.getElementById('profile-vip-badge');
    if (vipBadge && vipBadge.classList) {
        const tag = getPlayerTag(profile.username, profile.isVip || (profile.isLocal && typeof isCurrentUserVip === 'function' && isCurrentUserVip()));
        vipBadge.textContent = tag;
        const isVip = !!tag;
        if (typeof vipBadge.classList.toggle === 'function') {
            vipBadge.classList.toggle('hidden', !isVip);
        } else if (isVip && typeof vipBadge.classList.remove === 'function') {
            vipBadge.classList.remove('hidden');
        } else if (!isVip && typeof vipBadge.classList.add === 'function') {
            vipBadge.classList.add('hidden');
        }
    }

    const pres = getPlayerPresence(profile);
    const isPlaying = pres.inGame && pres.gameId;
    const isOnline = pres.isOnline;
    const gameTitle = pres.gameTitle || pres.gameId;
    const isParty = pres.isParty;

    const badgeEl = document.getElementById('profile-status-badge');
    if (badgeEl) {
        if (isPlaying) {
            const partyLabel = isParty ? ' (Soukromá party)' : '';
            const tooltipText = `Hraje: ${gameTitle}${partyLabel}`;
            badgeEl.className = 'absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-[#00B06F] border-2 border-[#191B1D] flex items-center justify-center text-white shadow-lg animate-pulse';
            badgeEl.title = tooltipText;
            badgeEl.innerHTML = `
                <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
            `;
            badgeEl.style.display = 'flex';
        } else if (isOnline) {
            badgeEl.className = 'absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-[#00A2FF] border-2 border-[#191B1D] flex items-center justify-center text-white shadow';
            badgeEl.title = 'Online na webu';
            badgeEl.innerHTML = `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" fill="currentColor"/>
                </svg>
            `;
            badgeEl.style.display = 'flex';
        } else {
            badgeEl.style.display = 'none';
        }
    }

    let statusTextEl = document.getElementById('profile-status-text');
    if (!statusTextEl && handleEl && handleEl.parentNode) {
        statusTextEl = document.createElement('div');
        statusTextEl.id = 'profile-status-text';
        handleEl.parentNode.appendChild(statusTextEl);
    }
    if (statusTextEl) {
        if (isPlaying) {
            const partyLabel = isParty ? ' <span class="text-amber-400 font-bold">(Soukromá party)</span>' : '';
            statusTextEl.className = 'text-xs text-[#00B06F] font-bold flex items-center gap-1 mt-1';
            statusTextEl.innerHTML = `<span>🎮</span><span>Hraje: <strong>${escapeHtml(gameTitle)}</strong>${partyLabel}</span>`;
            statusTextEl.style.display = 'flex';
        } else if (isOnline) {
            statusTextEl.className = 'text-xs text-[#00A2FF] font-medium flex items-center gap-1 mt-1';
            statusTextEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#00A2FF]"></span><span>Online na webu</span>`;
            statusTextEl.style.display = 'flex';
        } else {
            statusTextEl.className = 'text-xs text-gray-500 font-medium mt-1';
            statusTextEl.textContent = 'Offline';
            statusTextEl.style.display = 'block';
        }
    }

    const fCount = getPlayerFriendsCount(profile);
    if (friendsStat) friendsStat.textContent = String(fCount);
    if (followersStat) followersStat.textContent = String(profile.followers ?? 0);
    if (followingStat) followingStat.textContent = String(profile.following ?? 0);
    if (rapStat) rapStat.textContent = profile.rap ? `${profile.rap} RAP` : '250 RAP';

    // Draw circular headshot & 2D full-body pose
    drawPlayerHeadshotCanvas(document.getElementById('profile-headshot-canvas'), profile);
    drawPlayerFullBodyCanvas(document.getElementById('profile-showcase-2d-canvas'), profile);

    if (profileShowcase3DState.is3D) {
        rebuildProfile3DAvatar(profile);
    }

    // Render Action Buttons (Self vs Other Player - Matches Screenshots 3 & 4)
    if (actionsEl) {
        if (profile.isLocal) {
            actionsEl.innerHTML = `
                <button type="button" onclick="openEditProfileModal()" class="px-4 py-2 rounded-lg bg-[#2C2F33] hover:bg-[#393B3D] text-xs sm:text-sm font-bold text-white border border-white/10 transition">
                    Edit profile
                </button>
                <button type="button" onclick="openShopModal('all')" class="px-4 py-2 rounded-lg bg-[#2C2F33] hover:bg-[#393B3D] text-xs sm:text-sm font-bold text-white border border-white/10 transition">
                    Edit avatar
                </button>
                <button type="button" onclick="openAuthModal()" class="w-9 h-9 rounded-lg bg-[#2C2F33] hover:bg-[#393B3D] text-white font-bold flex items-center justify-center border border-white/10 transition" title="Účet a přihlášení">
                    •••
                </button>
            `;
        } else {
            const isFriend = isPlayerFriend(profile);
            const isSent = hasSentFriendRequest(profile);
            const isReceived = hasReceivedFriendRequest(profile);

            let friendButtonsHtml = '';
            let joinBtnHtml = '';

            if (isPlaying) {
                const partyLabel = isParty ? ' (Soukromá party)' : '';
                const tooltipText = `Hraje: ${gameTitle}${partyLabel}`;
                joinBtnHtml = `
                    <button type="button" onclick="joinFriendGame('${pres.gameId}', '${pres.roomCode || ''}')" class="px-4 py-2 rounded-lg bg-[#00B06F] hover:bg-[#009E63] text-xs sm:text-sm font-bold text-white shadow transition flex items-center gap-1.5 animate-pulse" title="${escapeHtml(tooltipText)}">
                        <span>🎮</span>
                        <span>${isParty ? 'Připojit se k party' : 'Připojit se ke hře'}</span>
                    </button>
                `;
            }

            if (isFriend) {
                friendButtonsHtml = `
                    <span class="px-3.5 py-2 rounded-lg bg-[#232527] border border-[#393B3D] text-xs font-bold text-[#00A2FF] flex items-center gap-1">
                        <span>👥</span> Přátelé
                    </span>
                    <button type="button" onclick="removeFriend('${profile.id}')" class="px-3.5 py-2 rounded-lg bg-[#2C2F33] hover:bg-red-600/80 text-xs sm:text-sm font-bold text-gray-300 hover:text-white border border-white/10 transition" title="Odebrat z přátel">
                        Odebrat
                    </button>
                `;
            } else if (isReceived) {
                friendButtonsHtml = `
                    <button type="button" onclick="acceptFriendRequest('${profile.id}')" class="px-4 py-2 rounded-lg bg-[#00B06F] hover:bg-[#009E63] text-xs sm:text-sm font-bold text-white shadow transition">
                        ✓ Přijmout žádost
                    </button>
                    <button type="button" onclick="declineFriendRequest('${profile.id}')" class="px-3 py-2 rounded-lg bg-[#2C2F33] hover:bg-[#393B3D] text-xs sm:text-sm font-bold text-gray-300 transition">
                        ✕ Odmítnout
                    </button>
                `;
            } else if (isSent) {
                friendButtonsHtml = `
                    <button type="button" onclick="cancelFriendRequest('${profile.id}')" class="px-3.5 py-2 rounded-lg bg-[#2C2F33] hover:bg-red-600/80 text-xs sm:text-sm font-bold text-gray-200 hover:text-white border border-white/10 transition" title="Kliknutím zrušíš žádost">
                        Žádost odeslána ⏳ (Zrušit)
                    </button>
                `;
            } else {
                friendButtonsHtml = `
                    <button type="button" onclick="sendFriendRequest('${profile.id}')" class="px-4 py-2 rounded-lg bg-[#00A2FF] hover:bg-[#008BDB] text-xs sm:text-sm font-bold text-white shadow transition">
                        + Přidat do přátel
                    </button>
                `;
            }

            actionsEl.innerHTML = `
                ${joinBtnHtml}
                <button type="button" onclick="openBottomChatWithPlayer('${profile.id}')" class="px-4 py-2 rounded-lg bg-[#2C2F33] hover:bg-[#393B3D] text-xs sm:text-sm font-bold text-white border border-white/10 transition">
                    Chat
                </button>
                ${friendButtonsHtml}
                <button type="button" class="w-9 h-9 rounded-lg bg-[#2C2F33] hover:bg-[#393B3D] text-white font-bold flex items-center justify-center border border-white/10 transition">
                    •••
                </button>
            `;
        }
    }

    // Render Currently Wearing Grid
    const wearGrid = document.getElementById('profile-wearing-grid');
    if (wearGrid) {
        wearGrid.innerHTML = '';
        const items = getProfileWearingItems(profile);
        items.forEach((it, idx) => {
            const card = document.createElement('div');
            if (profile.isLocal) {
                card.onclick = () => openShopModal('all');
            } else {
                card.onclick = () => openFriendItemInspectModal(profile, it);
            }
            card.className = 'group cursor-pointer flex flex-col justify-between';
            const cid = `profile-wear-canvas-${idx}`;
            const thumb = (typeof shopState !== 'undefined' && shopState.thumbs)
                ? (shopState.thumbs[it.shopId] || shopState.thumbs[it.type] || shopState.thumbs[it.id])
                : null;

            const mediaHtml = thumb
                ? `<img src="${thumb}" alt="${escapeHtml(it.name)}" class="w-full h-full object-contain ${it.slot === 'face' ? 'p-3' : ''}">`
                : `<canvas id="${cid}" width="120" height="120" class="w-full h-full object-contain"></canvas>`;

            card.innerHTML = `
                <div>
                    <div class="aspect-square rounded-xl bg-[#2C2F33] group-hover:bg-[#35383D] border border-white/5 flex items-center justify-center overflow-hidden transition">
                        ${mediaHtml}
                    </div>
                    <div class="mt-2 text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-[#00A2FF] transition">${escapeHtml(it.name)}</div>
                </div>
                <div class="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                    <svg class="w-3 h-3 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 21 7 21 17 12 22 3 17 3 7"/>
                    </svg>
                    <span class="truncate">${escapeHtml(it.price)}</span>
                </div>
            `;
            wearGrid.appendChild(card);

            if (!thumb) {
                const c = document.getElementById(cid);
                if (c) drawWearingItemCardCanvas(c, it);
            }
        });
    }
}

/* ============================================================================
 * 3D INTERACTIVE SHOWCASE ON PROFILE BANNER
 * ============================================================================ */
function initProfile3DShowcase() {
    if (profileShowcase3DState.renderer) return true;
    const canvas = document.getElementById('profile-showcase-3d-canvas');
    if (!canvas) return false;
    try {
        profileShowcase3DState.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
        return false;
    }
    profileShowcase3DState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    profileShowcase3DState.scene = new THREE.Scene();
    if (typeof addPreviewLights === 'function') {
        addPreviewLights(profileShowcase3DState.scene);
    } else {
        profileShowcase3DState.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    }
    profileShowcase3DState.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    profileShowcase3DState.camera.position.set(0, 2.5, -10.5);
    profileShowcase3DState.camera.lookAt(0, 1.9, 0);

    canvas.addEventListener('pointerdown', e => {
        profileShowcase3DState.dragging = true;
        profileShowcase3DState.lastX = e.clientX;
        canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
        if (!profileShowcase3DState.dragging) return;
        profileShowcase3DState.rotY += (e.clientX - profileShowcase3DState.lastX) * 0.012;
        profileShowcase3DState.lastX = e.clientX;
    });
    const stop = () => { profileShowcase3DState.dragging = false; };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
    return true;
}

function rebuildProfile3DAvatar(profile) {
    if (!profileShowcase3DState.scene || typeof createBlockyCharacterMesh !== 'function') return;
    if (profileShowcase3DState.avatar) {
        profileShowcase3DState.scene.remove(profileShowcase3DState.avatar.root);
        if (typeof disposeObject3D === 'function') disposeObject3D(profileShowcase3DState.avatar.root);
    }
    const outfitToUse = profile.isLocal ? ((typeof avatarOutfit !== 'undefined') ? avatarOutfit : null) : (profile.outfit || null);
    const torsoHexToUse = profile.isLocal ? ((typeof avatarTorsoHex !== 'undefined') ? avatarTorsoHex : '#181A1E') : (profile.torsoHex || '#181A1E');
    profileShowcase3DState.avatar = createBlockyCharacterMesh({
        outfit: outfitToUse,
        torsoColor: new THREE.Color(torsoHexToUse).getHex()
    });
    profileShowcase3DState.avatar.root.position.y = -0.5;
    profileShowcase3DState.avatar.leftArmPivot.rotation.z = -0.14;
    profileShowcase3DState.avatar.rightArmPivot.rotation.z = 0.14;
    profileShowcase3DState.scene.add(profileShowcase3DState.avatar.root);
}

function profileShowcase3DLoop(now) {
    if (!profileShowcase3DState.is3D || activePortalSection !== 'profile') {
        profileShowcase3DState.rafId = null;
        return;
    }
    profileShowcase3DState.rafId = requestAnimationFrame(profileShowcase3DLoop);
    const dt = Math.min(0.05, (now - (profileShowcase3DState.lastTime || now)) / 1000);
    profileShowcase3DState.lastTime = now;

    const canvas = profileShowcase3DState.renderer.domElement;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w && h && (canvas.width !== Math.floor(w * profileShowcase3DState.renderer.getPixelRatio()) || canvas.height !== Math.floor(h * profileShowcase3DState.renderer.getPixelRatio()))) {
        profileShowcase3DState.renderer.setSize(w, h, false);
        profileShowcase3DState.camera.aspect = w / h;
        profileShowcase3DState.camera.updateProjectionMatrix();
    }
    if (!profileShowcase3DState.dragging) {
        profileShowcase3DState.rotY += dt * 0.55;
    }
    if (profileShowcase3DState.avatar) {
        profileShowcase3DState.avatar.root.rotation.y = profileShowcase3DState.rotY;
        profileShowcase3DState.avatar.root.position.y = -0.5 + Math.sin(now / 550) * 0.04;
    }
    profileShowcase3DState.renderer.render(profileShowcase3DState.scene, profileShowcase3DState.camera);
}

function toggleProfileShowcaseMode() {
    profileShowcase3DState.is3D = !profileShowcase3DState.is3D;
    const c2d = document.getElementById('profile-showcase-2d-canvas');
    const c3d = document.getElementById('profile-showcase-3d-canvas');
    const btn = document.getElementById('btn-profile-3d-toggle');

    if (btn) btn.textContent = profileShowcase3DState.is3D ? '2D' : '3D';
    if (c2d) c2d.classList.toggle('hidden', profileShowcase3DState.is3D);
    if (c3d) c3d.classList.toggle('hidden', !profileShowcase3DState.is3D);

    if (profileShowcase3DState.is3D) {
        if (initProfile3DShowcase()) {
            rebuildProfile3DAvatar(currentInspectedProfile || getLocalRobloxPlayerProfile());
            if (!profileShowcase3DState.rafId) {
                profileShowcase3DState.lastTime = 0;
                profileShowcase3DState.rafId = requestAnimationFrame(profileShowcase3DLoop);
            }
        }
    } else if (profileShowcase3DState.rafId) {
        cancelAnimationFrame(profileShowcase3DState.rafId);
        profileShowcase3DState.rafId = null;
    }
}

/* ============================================================================
 * FRIENDS ADD / REMOVE & EDIT PROFILE MODAL
 * ============================================================================ */
function toggleFriendStatus(playerId) {
    if (!playerId || playerId === 'local') return;
    const player = getPlayerById(playerId);
    const pName = player.username || player.displayName || 'Hráč';
    const cleanNick = (player.username || playerId).toLowerCase().replace(/^(user_|cloud_|db_|peer_)/, '').trim();

    if (isPlayerFriend(playerId) || isPlayerFriend(cleanNick)) {
        removeFriend(playerId);
    } else {
        friendsSet.add(cleanNick || String(playerId).toLowerCase());
        delete sentFriendRequests[playerId];
        delete sentFriendRequests[cleanNick];
        delete sentFriendRequests[`cloud_${cleanNick}`];
        delete sentFriendRequests[`db_${cleanNick}`];
        delete sentFriendRequests[`user_${cleanNick}`];
        delete sentFriendRequests[`peer_${cleanNick}`];
        if (typeof saveSentFriendRequests === 'function') saveSentFriendRequests();
        delete receivedFriendRequests[playerId];
        delete receivedFriendRequests[cleanNick];
        delete receivedFriendRequests[`cloud_${cleanNick}`];
        delete receivedFriendRequests[`db_${cleanNick}`];
        if (typeof saveReceivedFriendRequests === 'function') saveReceivedFriendRequests();
        saveCachedFriendProfile(player);
        saveFriendsList();
        if (typeof syncAccountToServer === 'function') {
            syncAccountToServer().catch(() => {});
        }
        if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();
        if (typeof showHudToast === 'function') {
            showHudToast(`👥 ${pName} byl přidán do přátel!`, 'green');
        }
        renderHomeFriendsStrip();
        if (activePortalSection === 'profile') renderPortalProfileView();
        if (activePortalSection === 'people') renderPeopleResultsGrid();
    }
}

function openEditProfileModal() {
    const my = getLocalRobloxPlayerProfile();
    const currentName = my.username || my.displayName || (typeof getGuestNickname === 'function' ? getGuestNickname() : 'Guest');
    const valSpan = document.getElementById('edit-profile-username-val');
    const dInp = document.getElementById('edit-profile-displayname');
    const hInp = document.getElementById('edit-profile-handle');
    const bInp = document.getElementById('edit-profile-bio');
    if (valSpan) valSpan.textContent = currentName;
    if (dInp) dInp.value = currentName;
    if (hInp) hInp.value = currentName;
    if (bInp) bInp.value = my.bio === 'No bio yet' ? '' : my.bio;

    const modal = document.getElementById('edit-profile-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function saveEditedProfile() {
    const rawBio = document.getElementById('edit-profile-bio')?.value || '';
    const bVal = typeof sanitizeTextClient === 'function'
        ? sanitizeTextClient(rawBio, 160)
        : rawBio.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 160);
    const finalBio = bVal || 'No bio yet';
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('boblox_custom_bio_v1', finalBio);
    }

    if (typeof authState !== 'undefined' && authState.user) {
        authState.user.bio = finalBio;
    }

    if (typeof syncAccountToServer === 'function') {
        syncAccountToServer().catch(err => {
            console.warn('Bio sync warning:', err);
        });
    }

    if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();
    closeEditProfileModal();
    refreshPortalAvatarVisuals();
    currentInspectedProfile = getLocalRobloxPlayerProfile();
    renderPortalProfileView();
}

function openFriendItemInspectModal(profile, item) {
    const modal = document.getElementById('friend-item-inspect-modal');
    if (!modal) return;
    const pName = profile.username || profile.displayName || 'Přítel';
    const titleEl = document.getElementById('friend-inspect-modal-title');
    const friendNameEl = document.getElementById('friend-inspect-friend-name');
    const itemNameEl = document.getElementById('friend-inspect-item-name');
    const itemPriceEl = document.getElementById('friend-inspect-item-price');
    const canvas = document.getElementById('friend-inspect-canvas');

    if (titleEl) titleEl.textContent = `Předmět hráče ${pName}`;
    if (friendNameEl) friendNameEl.textContent = pName;
    if (itemNameEl) itemNameEl.textContent = item.name;
    if (itemPriceEl) itemPriceEl.textContent = item.price;

    if (canvas) {
        drawWearingItemCardCanvas(canvas, item);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeFriendItemInspectModal() {
    const modal = document.getElementById('friend-item-inspect-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function formatBobuxTransaction(transaction) {
    const rawAmount = transaction && typeof transaction.amount === 'number'
        ? transaction.amount
        : Number(transaction?.amount || 0);
    const isExpense = rawAmount < 0;
    const absAmount = Math.abs(rawAmount).toLocaleString('cs-CZ');

    if (isExpense) {
        return {
            amount: rawAmount,
            isExpense: true,
            formattedAmount: `-${absAmount} B$`,
            amountClass: 'text-[#FF4D4D]',
            labelText: 'Výdaj / Sázka',
            iconColorClass: 'text-[#FF4D4D]'
        };
    }

    return {
        amount: rawAmount,
        isExpense: false,
        formattedAmount: `+${absAmount} B$`,
        amountClass: 'text-[#00B06F]',
        labelText: 'Získáno',
        iconColorClass: 'text-[#FFE066]'
    };
}

function openBobuxTransactionsModal() {
    const modal = document.getElementById('bobux-transactions-modal');
    if (!modal) return;
    const listEl = document.getElementById('bobux-transactions-list');
    const balEl = document.getElementById('bobux-transactions-balance');

    if (balEl && typeof bobuxBalance !== 'undefined') {
        balEl.textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;
    }

    if (listEl) {
        listEl.innerHTML = '';
        const txList = (typeof bobuxTransactions !== 'undefined' && Array.isArray(bobuxTransactions))
            ? bobuxTransactions
            : [];

        if (txList.length === 0) {
            listEl.innerHTML = '<div class="text-center text-gray-400 py-8 text-xs">Zatím žádné zaznamenané transakce. Hraj minihry a získej Bobuxy!</div>';
        } else {
            txList.forEach(tx => {
                const row = document.createElement('div');
                row.className = 'flex items-center justify-between p-3 rounded-xl bg-[#191B1D] border border-[#2C2F33] hover:border-[#393B3D] transition';
                const d = new Date(tx.timestamp || Date.now());
                const dateStr = d.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });

                const formattedTx = formatBobuxTransaction(tx);

                row.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-[#232527] border border-[#393B3D] flex items-center justify-center shrink-0">
                            <svg class="w-5 h-5 ${formattedTx.iconColorClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 21 7 21 17 12 22 3 17 3 7"/>
                                <rect x="9" y="9" width="6" height="6" rx="1"/>
                            </svg>
                        </div>
                        <div>
                            <div class="text-xs sm:text-sm font-bold text-white leading-tight">${escapeHtml(tx.game || 'Boblox Minihra')}</div>
                            <div class="text-[10px] sm:text-xs text-gray-400 font-mono mt-0.5">${dateStr}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs sm:text-sm font-extrabold ${formattedTx.amountClass} font-mono">${formattedTx.formattedAmount}</div>
                        <div class="text-[10px] text-gray-400 font-semibold">${formattedTx.labelText}</div>
                    </div>
                `;
                listEl.appendChild(row);
            });
        }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeBobuxTransactionsModal() {
    const modal = document.getElementById('bobux-transactions-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

/* ============================================================================
 * TOP SEARCH DROPDOWN & PEOPLE RESULTS PAGE (Matches Screenshot 5)
 * ============================================================================ */
function handleTopSearchInput(rawVal) {
    const val = (rawVal || '').trim();
    const clearBtn = document.getElementById('top-search-clear-btn');
    if (clearBtn) {
        clearBtn.classList.toggle('hidden', val.length === 0);
        clearBtn.classList.toggle('flex', val.length > 0);
    }

    if (activePortalSection === 'home') {
        renderGameCatalog();
    } else if (activePortalSection === 'people') {
        currentPeopleSearchQuery = val;
        const pageInp = document.getElementById('people-page-search-input');
        if (pageInp && pageInp.value !== rawVal) pageInp.value = rawVal;
        renderPeopleResultsGrid();
    }

    renderTopSearchDropdown(val);

    if (typeof fetchCloudUsers === 'function' && val) {
        fetchCloudUsers(val).then(() => {
            if (activePortalSection === 'people') {
                renderPeopleResultsGrid();
            }
            renderTopSearchDropdown(val);
        });
    }
}

function handleTopSearchFocus() {
    const val = (document.getElementById('game-search-input')?.value || '').trim();
    if (val.length > 0) {
        renderTopSearchDropdown(val);
    }
}

function handleTopSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const val = (document.getElementById('game-search-input')?.value || '').trim();
        hideTopSearchDropdown();
        openPeopleSearchResults(val);
    } else if (event.key === 'Escape') {
        hideTopSearchDropdown();
    }
}

function clearTopSearchInput() {
    const inp = document.getElementById('game-search-input');
    if (inp) inp.value = '';
    const clearBtn = document.getElementById('top-search-clear-btn');
    if (clearBtn) {
        clearBtn.classList.add('hidden');
        clearBtn.classList.remove('flex');
    }
    hideTopSearchDropdown();
    renderGameCatalog();
    if (activePortalSection === 'people') {
        currentPeopleSearchQuery = '';
        const pageInp = document.getElementById('people-page-search-input');
        if (pageInp) pageInp.value = '';
        renderPeopleResultsGrid();
    }
}

function hideTopSearchDropdown() {
    const dd = document.getElementById('top-search-dropdown');
    if (dd) dd.classList.add('hidden');
}

function renderTopSearchDropdown(query) {
    const dd = document.getElementById('top-search-dropdown');
    if (!dd) return;
    if (!query) {
        dd.classList.add('hidden');
        return;
    }

    const qLower = query.toLowerCase();
    const allPlayers = getAllSearchablePlayers();
    const matchingPlayers = allPlayers.filter(p =>
        p.displayName.toLowerCase().includes(qLower) ||
        p.handle.toLowerCase().includes(qLower)
    ).slice(0, 4);

    const matchingGames = GAMES_CATALOG.filter(g =>
        g.title.toLowerCase().includes(qLower) ||
        g.badgeText.toLowerCase().includes(qLower)
    ).slice(0, 3);

    dd.innerHTML = '';

    // 1. Search in People option
    const peopleOpt = document.createElement('button');
    peopleOpt.type = 'button';
    peopleOpt.onclick = () => {
        hideTopSearchDropdown();
        openPeopleSearchResults(query);
    };
    peopleOpt.className = 'w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-gray-200 hover:bg-[#2C2F33] transition text-left';
    peopleOpt.innerHTML = `
        <span class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-[#00A2FF]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4"/><path stroke-linecap="round" d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"/>
            </svg>
            <span>Search <strong class="text-white">"${escapeHtml(query)}"</strong> in <strong>People</strong></span>
        </span>
        <span class="text-[10px] text-gray-400">Enter ↵</span>
    `;
    dd.appendChild(peopleOpt);

    // 2. Search in Experiences option
    const gamesOpt = document.createElement('button');
    gamesOpt.type = 'button';
    gamesOpt.onclick = () => {
        hideTopSearchDropdown();
        switchPortalSection('home');
        renderGameCatalog();
    };
    gamesOpt.className = 'w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-gray-200 hover:bg-[#2C2F33] transition text-left';
    gamesOpt.innerHTML = `
        <span class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-[#00B06F]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>Search <strong class="text-white">"${escapeHtml(query)}"</strong> in <strong>Experiences</strong></span>
        </span>
    `;
    dd.appendChild(gamesOpt);

    // 3. Direct Player Previews
    matchingPlayers.forEach((p, idx) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.onclick = () => openPlayerProfile(p.id);
        row.className = 'w-full px-3.5 py-2 flex items-center justify-between hover:bg-[#2C2F33] transition text-left';
        const cid = `dd-player-canvas-${idx}`;
        const isFriend = isPlayerFriend(p.id);
        const isSent = hasSentFriendRequest(p.id);
        const isReceived = hasReceivedFriendRequest(p.id);
        const pres = getPlayerPresence(p);
        let tagText = 'Zobrazit profil';
        let tagClass = 'text-gray-400';
        if (pres.inGame && pres.gameId) {
            const partyLabel = pres.isParty ? ' (Party)' : '';
            tagText = `🎮 ${pres.gameTitle}${partyLabel}`;
            tagClass = 'text-[#00B06F] font-bold truncate max-w-[140px]';
        } else if (isFriend) {
            tagText = 'Přítel ✓';
            tagClass = 'text-[#00A2FF] font-bold';
        } else if (isReceived) {
            tagText = 'Žádost o přátelství';
            tagClass = 'text-[#00B06F] font-bold';
        } else if (isSent) {
            tagText = 'Žádost odeslána ⏳';
            tagClass = 'text-yellow-400';
        }

        let dotHtml = '';
        if (pres.inGame && pres.gameId) {
            const partyLabel = pres.isParty ? ' (Soukromá party)' : '';
            dotHtml = `<span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00B06F] border border-[#191B1D] flex items-center justify-center text-white" title="Hraje: ${escapeHtml(pres.gameTitle)}${escapeHtml(partyLabel)}"><svg class="w-2 h-2 fill-white" viewBox="0 0 24 24"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></span>`;
        } else if (pres.isOnline) {
            dotHtml = `<span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00A2FF] border border-[#191B1D]" title="Online na webu"></span>`;
        }

        const pName = p.username || p.displayName;
        row.innerHTML = `
            <div class="flex items-center gap-2.5 min-w-0">
                <div class="relative shrink-0">
                    <canvas id="${cid}" width="40" height="40" class="w-8 h-8 rounded-full bg-[#191B1D] block"></canvas>
                    ${dotHtml}
                </div>
                <div class="min-w-0">
                    <div class="text-xs font-bold text-white truncate">${escapeHtml(pName)}</div>
                    <div class="text-[10px] text-gray-400 truncate">@${escapeHtml(pName)}</div>
                </div>
            </div>
            <span class="text-[10px] font-semibold ${tagClass}">${tagText}</span>
        `;
        dd.appendChild(row);
        drawPlayerHeadshotCanvas(document.getElementById(cid), p);
    });

    // 4. Direct Game Previews
    matchingGames.forEach(g => {
        const row = document.createElement('button');
        row.type = 'button';
        row.onclick = () => {
            hideTopSearchDropdown();
            openGameModal(g.id);
        };
        row.className = 'w-full px-3.5 py-2 flex items-center justify-between hover:bg-[#2C2F33] transition text-left';
        row.innerHTML = `
            <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-xs">🎮</span>
                <div class="text-xs font-bold text-white truncate">${escapeHtml(g.title)}</div>
            </div>
            <span class="text-[10px] text-[#00B06F] font-semibold">Play</span>
        `;
        dd.appendChild(row);
    });

    dd.classList.remove('hidden');
}

function openPeopleSearchResults(query = '') {
    currentPeopleSearchQuery = (query || '').trim();
    switchPortalSection('people');

    const topInp = document.getElementById('game-search-input');
    const pageInp = document.getElementById('people-page-search-input');
    if (topInp && query !== undefined) topInp.value = currentPeopleSearchQuery;
    if (pageInp) pageInp.value = currentPeopleSearchQuery;

    renderPeopleResultsGrid();

    if (typeof fetchCloudUsers === 'function') {
        fetchCloudUsers(currentPeopleSearchQuery).then(() => {
            if (activePortalSection === 'people') {
                renderPeopleResultsGrid();
            }
        });
    }
}

function handlePeoplePageSearchInput(val) {
    currentPeopleSearchQuery = (val || '').trim();
    const topInp = document.getElementById('game-search-input');
    if (topInp) topInp.value = currentPeopleSearchQuery;
    renderPeopleResultsGrid();

    if (typeof fetchCloudUsers === 'function') {
        fetchCloudUsers(currentPeopleSearchQuery).then(() => {
            if (activePortalSection === 'people') {
                renderPeopleResultsGrid();
            }
        });
    }
}

function renderPeopleResultsGrid() {
    const grid = document.getElementById('people-results-grid');
    const labelEl = document.getElementById('people-results-query-text');
    if (!grid) return;

    // 1. Render Incoming Friend Requests Banner Section
    const reqContainer = document.getElementById('people-incoming-requests-container');
    const reqList = document.getElementById('people-incoming-requests-list');
    const reqBadge = document.getElementById('people-incoming-requests-badge');

    const incomingEntries = Object.entries(receivedFriendRequests);
    const seenReqSenders = new Set();
    const uniqueIncomingReqs = [];
    incomingEntries.forEach(([senderId, req]) => {
        const u = (req.username || senderId).toLowerCase();
        if (!seenReqSenders.has(u)) {
            seenReqSenders.add(u);
            uniqueIncomingReqs.push([senderId, req]);
        }
    });

    if (reqContainer && reqList) {
        if (uniqueIncomingReqs.length > 0) {
            reqContainer.classList.remove('hidden');
            if (reqBadge) reqBadge.textContent = String(uniqueIncomingReqs.length);
            reqList.innerHTML = '';
            uniqueIncomingReqs.forEach(([senderId, req]) => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between gap-3 bg-[#191B1D] p-3 rounded-xl border border-[#393B3D] shadow-sm';
                const senderName = req.username || 'Hráč';
                const cid = `req-headshot-${senderId.replace(/[^a-zA-Z0-9]/g, '_')}`;
                item.innerHTML = `
                    <div class="flex items-center gap-3 min-w-0 cursor-pointer" onclick="openPlayerProfile('${senderId}')">
                        <canvas id="${cid}" width="44" height="44" class="w-11 h-11 rounded-full bg-[#232527] border border-[#393B3D] shrink-0"></canvas>
                        <div class="min-w-0">
                            <div class="text-xs sm:text-sm font-bold text-white truncate">${escapeHtml(senderName)}</div>
                            <div class="text-[10px] text-gray-400">Ti poslal žádost o přátelství</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" onclick="acceptFriendRequest('${senderId}')" class="px-3.5 py-1.5 rounded-lg bg-[#00B06F] hover:bg-[#009E63] text-xs font-bold text-white shadow transition">
                            ✓ Přijmout
                        </button>
                        <button type="button" onclick="declineFriendRequest('${senderId}')" class="px-2.5 py-1.5 rounded-lg bg-[#2C2F33] hover:bg-[#393B3D] text-xs font-bold text-gray-300 hover:text-white transition">
                            ✕
                        </button>
                    </div>
                `;
                reqList.appendChild(item);
                setTimeout(() => {
                    const c = document.getElementById(cid);
                    if (c) {
                        const p = getPlayerById(senderId) || req.senderProfile;
                        drawPlayerHeadshotCanvas(c, p);
                    }
                }, 10);
            });
        } else {
            reqContainer.classList.add('hidden');
        }
    }

    // 2. Render Search Results / Friends Grid
    const q = currentPeopleSearchQuery.trim();
    const qLower = q.toLowerCase();
    const allPlayers = getAllSearchablePlayers();
    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || '').toLowerCase();
    const myId = getMyUniqueSocialId();
    const isRegistered = typeof authState !== 'undefined' && authState.user && !myUName.startsWith('guest');

    // Filter out myself & deduplicate by username
    const seenUsernames = new Set();
    const filteredPlayers = [];
    for (const p of allPlayers) {
        if (!p || p.id === 'local' || p.id === myId) continue;
        if (isRegistered && (p.username || '').toLowerCase() === myUName) continue;
        const u = (p.username || p.displayName || '').toLowerCase();
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u)) continue;
        if (u && !seenUsernames.has(u)) {
            seenUsernames.add(u);
            filteredPlayers.push(p);
        }
    }

    const friendsList = filteredPlayers.filter(p => isPlayerFriend(p));
    const nonFriendsList = filteredPlayers.filter(p => !isPlayerFriend(p));

    let displayPlayers = [];
    let isShowingRecommendations = false;

    if (qLower) {
        displayPlayers = filteredPlayers.filter(p =>
            (p.username || p.displayName || '').toLowerCase().includes(qLower) ||
            (p.handle || '').toLowerCase().includes(qLower)
        );
        if (labelEl) labelEl.textContent = `Výsledky pro "${q}" (${displayPlayers.length})`;
    } else {
        if (friendsList.length > 0) {
            displayPlayers = friendsList;
            if (labelEl) labelEl.textContent = `Přátelé (${friendsList.length})`;
        } else {
            // When user has no friends yet, show all available non-friends as recommendations!
            displayPlayers = nonFriendsList;
            isShowingRecommendations = true;
            if (labelEl) labelEl.textContent = `Doporučení hráči k seznámení (${nonFriendsList.length})`;
        }
    }

    grid.innerHTML = '';

    if (displayPlayers.length === 0) {
        if (!q) {
            grid.innerHTML = `
                <div class="col-span-full py-12 text-center text-sm text-gray-400 bg-[#232527] rounded-xl border border-[#2C2F33] space-y-2">
                    <div class="text-3xl">👥</div>
                    <div class="text-white font-bold text-base">Zatím nemáš přidané žádné přátele</div>
                    <p class="text-xs text-gray-400 max-w-sm mx-auto">Můžeš si přidat hráče z multiplayeru nebo je vyhledat v horním vyhledávacím panelu!</p>
                </div>
            `;
        } else {
            grid.innerHTML = `
                <div class="col-span-full py-12 text-center text-sm text-gray-400 bg-[#232527] rounded-xl border border-[#2C2F33]">
                    Nenalezen žádný hráč odpovídající dotazu "${escapeHtml(q)}".
                </div>
            `;
        }
        return;
    }

    if (isShowingRecommendations) {
        const infoBanner = document.createElement('div');
        infoBanner.className = 'col-span-full p-4 mb-2 bg-[#232527] border border-[#2C2F33] rounded-xl flex items-center justify-between gap-4 text-xs shadow-sm';
        infoBanner.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#00A2FF]/20 text-[#00A2FF] flex items-center justify-center text-lg font-bold">👥</div>
                <div>
                    <div class="text-white font-bold text-sm">Zatím nemáš žádné přátele</div>
                    <div class="text-gray-400">Přidej si některého z níže uvedených hráčů nebo vyhledej kamaráda v horním vyhledávači:</div>
                </div>
            </div>
        `;
        grid.appendChild(infoBanner);
    }

    displayPlayers.forEach((p, idx) => {
        const isFriend = isPlayerFriend(p);
        const isSent = hasSentFriendRequest(p);
        const isReceived = hasReceivedFriendRequest(p);
        const pres = getPlayerPresence(p);
        const isPlaying = pres.inGame && pres.gameId;
        const isOnline = pres.isOnline;
        const gameTitle = pres.gameTitle || pres.gameId;
        const isParty = pres.isParty;

        const card = document.createElement('div');
        card.className = 'bg-[#232527] border border-[#2C2F33] hover:border-[#393B3D] rounded-xl p-4 flex flex-col justify-between gap-4 shadow transition';
        const cid = `people-res-canvas-${idx}`;

        let badgeHtml = '';
        if (isPlaying) {
            const partyLabel = isParty ? ' (Soukromá party)' : '';
            const tooltipText = `Hraje: ${gameTitle}${partyLabel}`;
            badgeHtml = `
                <div class="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#00B06F] border-2 border-[#232527] flex items-center justify-center text-white shadow-md animate-pulse cursor-pointer" title="${escapeHtml(tooltipText)}">
                    <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                </div>`;
        } else if (isOnline) {
            badgeHtml = `<div class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00A2FF] border-2 border-[#232527] shadow" title="Online na webu"></div>`;
        } else {
            badgeHtml = '';
        }

        let statusLine = '';
        if (isPlaying) {
            const partyLabel = isParty ? ' <span class="text-amber-400 font-bold">(Soukromá party)</span>' : '';
            const tooltipText = `Hraje: ${gameTitle}${isParty ? ' (Soukromá party)' : ''}`;
            statusLine = `
                <div class="text-[11px] text-[#00B06F] font-semibold flex items-center gap-1 mt-0.5 truncate" title="${escapeHtml(tooltipText)}">
                    <span class="w-2 h-2 rounded-full bg-[#00B06F] shrink-0 animate-pulse"></span>
                    <span class="truncate">Hraje: <strong>${escapeHtml(gameTitle)}</strong>${partyLabel}</span>
                </div>`;
        } else if (isOnline) {
            statusLine = `
                <div class="text-[11px] text-[#00A2FF] font-medium flex items-center gap-1 mt-0.5">
                    <span class="w-2 h-2 rounded-full bg-[#00A2FF] shrink-0"></span>
                    <span>Online na webu</span>
                </div>`;
        } else {
            statusLine = `<div class="text-[11px] text-gray-500 font-medium mt-0.5">Offline</div>`;
        }

        let actionBtnHtml = '';
        if (isFriend) {
            let joinBtn = '';
            if (isPlaying) {
                const joinTitle = isParty ? `Připojit se k soukromé party (${pres.roomCode || ''})` : `Připojit se ke hře`;
                joinBtn = `
                    <button type="button" onclick="joinFriendGame('${pres.gameId}', '${pres.roomCode || ''}')" class="py-2 px-3 rounded-lg bg-[#00B06F] hover:bg-[#009E63] text-xs font-bold text-white shadow transition flex items-center justify-center gap-1 animate-pulse" title="${escapeHtml(joinTitle)}">
                        <span>🎮</span>
                        <span>${isParty ? 'Party' : 'Hrát'}</span>
                    </button>
                `;
            }
            actionBtnHtml = `
                <div class="flex items-center gap-2">
                    ${joinBtn}
                    <button type="button" onclick="openBottomChatWithPlayer('${p.id}')" class="flex-1 py-2 rounded-lg bg-[#393B3D] hover:bg-[#494B4D] text-xs font-bold text-white transition">
                        Chat
                    </button>
                    <button type="button" onclick="removeFriend('${p.id}')" title="Odebrat z přátel" class="px-3 py-2 rounded-lg bg-[#2C2F33] hover:bg-red-600/80 text-xs font-bold text-gray-300 hover:text-white transition">
                        ✕
                    </button>
                </div>
            `;
        } else if (isReceived) {
            actionBtnHtml = `
                <div class="flex items-center gap-2">
                    <button type="button" onclick="acceptFriendRequest('${p.id}')" class="flex-1 py-2 rounded-lg bg-[#00B06F] hover:bg-[#009E63] text-xs font-bold text-white transition">
                        ✓ Přijmout
                    </button>
                    <button type="button" onclick="declineFriendRequest('${p.id}')" class="px-3 py-2 rounded-lg bg-[#2C2F33] hover:bg-[#393B3D] text-xs font-bold text-gray-300 transition">
                        ✕
                    </button>
                </div>
            `;
        } else if (isSent) {
            actionBtnHtml = `
                <button type="button" onclick="cancelFriendRequest('${p.id}')" class="w-full py-2 rounded-lg bg-[#2C2F33] hover:bg-red-600/80 text-xs font-bold text-gray-300 hover:text-white transition" title="Kliknutím zrušíš žádost">
                    Žádost odeslána ⏳ (Zrušit)
                </button>
            `;
        } else {
            actionBtnHtml = `
                <button type="button" onclick="sendFriendRequest('${p.id}')" class="w-full py-2 rounded-lg bg-[#00A2FF] hover:bg-[#008BDB] text-xs font-bold text-white transition">
                    + Přidat do přátel
                </button>
            `;
        }

        const pName = p.username || p.displayName;
        card.innerHTML = `
            <div onclick="openPlayerProfile('${p.id}')" class="flex items-center gap-3.5 cursor-pointer group min-w-0">
                <div class="relative w-16 h-16 rounded-full bg-[#191B1D] shrink-0">
                    <canvas id="${cid}" width="96" height="96" class="w-full h-full rounded-full block"></canvas>
                    ${badgeHtml}
                </div>
                <div class="min-w-0">
                    <div class="text-sm font-bold text-white group-hover:text-[#00A2FF] truncate transition">${escapeHtml(pName)}</div>
                    <div class="text-xs text-gray-400 truncate">@${escapeHtml(pName)}</div>
                    ${statusLine}
                </div>
            </div>
            ${actionBtnHtml}
        `;
        grid.appendChild(card);

        drawPlayerHeadshotCanvas(document.getElementById(cid), p);
    });
}

/* ============================================================================
 * BOTTOM-RIGHT LOBBY DIRECT CHAT WIDGET
 * ============================================================================ */
let activeLobbyChatPartnerId = '';
const STORAGE_KEY_DIRECT_MESSAGES = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.CHAT_MESSAGES)
    ? STORAGE_KEYS.CHAT_MESSAGES
    : 'boblox_direct_messages_v2';
const STORAGE_KEY_UNREAD_MESSAGES = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.CHAT_UNREAD)
    ? STORAGE_KEYS.CHAT_UNREAD
    : 'boblox_unread_messages_v2';

let lobbyDirectMessages = (() => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_DIRECT_MESSAGES);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
})();

let unreadDirectMessages = (() => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_UNREAD_MESSAGES);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
})();

function getLobbyDirectMessages() {
    return lobbyDirectMessages;
}

function saveLobbyDirectMessages() {
    try {
        localStorage.setItem(STORAGE_KEY_DIRECT_MESSAGES, JSON.stringify(lobbyDirectMessages));
    } catch (e) {}
}

function saveUnreadDirectMessages() {
    try {
        localStorage.setItem(STORAGE_KEY_UNREAD_MESSAGES, JSON.stringify(unreadDirectMessages));
    } catch (e) {}
    updateLobbyChatBadge();
}

async function syncDirectChatMessages(partnerName = null) {
    if (typeof apiRequest !== 'function') return;
    const isLogged = typeof authState !== 'undefined' && authState.user && authState.user.username;
    if (!isLogged) return;
    const myName = (authState.user.username || authState.user.displayName || '').toLowerCase();

    try {
        const query = partnerName ? ('?partner=' + encodeURIComponent(partnerName)) : '';
        const res = await apiRequest('/api/chat/messages' + query, { method: 'GET' });
        if (!res || !res.ok || !res.data || !Array.isArray(res.data.messages)) {
            return;
        }

        let hasNew = false;
        res.data.messages.forEach(msg => {
            if (!msg || !msg.text) return;
            const fromLower = (msg.from || '').toLowerCase();
            const toLower = (msg.to || '').toLowerCase();
            const isMe = fromLower === myName;
            const partner = isMe ? toLower : fromLower;
            const convKey = getConversationKey(partner);
            if (!convKey) return;

            if (!lobbyDirectMessages[convKey]) {
                lobbyDirectMessages[convKey] = [];
            }

            const existing = lobbyDirectMessages[convKey].some(m => {
                if (msg.id && m.id && m.id === msg.id) return true;
                return m.text === msg.text && Math.abs((m.timestamp || 0) - (msg.timestamp || 0)) < 1500;
            });

            if (!existing) {
                lobbyDirectMessages[convKey].push({
                    id: msg.id || ('msg_' + (msg.timestamp || Date.now())),
                    from: msg.from,
                    to: msg.to,
                    text: msg.text,
                    isMe: isMe,
                    timestamp: Number(msg.timestamp) || Date.now()
                });
                hasNew = true;
            }
        });

        if (hasNew) {
            Object.keys(lobbyDirectMessages).forEach(k => {
                if (Array.isArray(lobbyDirectMessages[k])) {
                    lobbyDirectMessages[k].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                }
            });
            saveLobbyDirectMessages();

            if (isLobbyChatDrawerOpen()) {
                if (activeLobbyChatPartnerId) {
                    renderLobbyDirectChatMessages();
                } else {
                    renderLobbyChatFriendsList();
                }
            }
            updateLobbyChatBadge();
        }
    } catch (e) {
        console.warn('[DirectChat] Chyba při synchronizaci chatu ze serveru:', e.message || e);
    }
}

function getConversationKey(playerOrId) {
    if (!playerOrId) return '';
    if (typeof playerOrId === 'object') {
        const name = playerOrId.username || playerOrId.displayName || playerOrId.id || '';
        return String(name).toLowerCase().replace(/^(cloud_|db_|user_|peer_)/, '');
    }
    return String(playerOrId).toLowerCase().replace(/^(cloud_|db_|user_|peer_)/, '');
}

function updateLobbyChatBadge() {
    const badge = document.getElementById('lobby-chat-unread-badge');
    if (!badge) return;
    let totalUnread = 0;
    Object.values(unreadDirectMessages).forEach(c => {
        totalUnread += (Number(c) || 0);
    });
    if (totalUnread > 0) {
        badge.textContent = totalUnread > 99 ? '99+' : String(totalUnread);
        badge.classList.remove('hidden');
        badge.classList.add('inline-flex');
    } else {
        badge.classList.add('hidden');
        badge.classList.remove('inline-flex');
    }
}

function isLobbyChatDrawerOpen() {
    const body = document.getElementById('lobby-chat-drawer-body');
    return body && !body.classList.contains('hidden');
}

function toggleLobbyChatDrawer(forceState) {
    const body = document.getElementById('lobby-chat-drawer-body');
    if (!body) return;
    const isHidden = body.classList.contains('hidden');
    const nextOpen = typeof forceState === 'boolean' ? forceState : isHidden;
    body.classList.toggle('hidden', !nextOpen);
    body.classList.toggle('flex', nextOpen);

    if (nextOpen) {
        if (typeof syncDirectChatMessages === 'function') {
            syncDirectChatMessages().catch(() => {});
        }
        if (activeLobbyChatPartnerId) {
            showLobbyChatConversationView();
        } else {
            showLobbyChatFriendsView();
        }
    }
    updateLobbyChatBadge();
}

function showLobbyChatFriendsView() {
    const friendsView = document.getElementById('lobby-chat-friends-view');
    const convView = document.getElementById('lobby-chat-conversation-view');
    if (friendsView) friendsView.classList.remove('hidden');
    if (convView) convView.classList.add('hidden');
    renderLobbyChatFriendsList();
}

function showLobbyChatConversationView() {
    const friendsView = document.getElementById('lobby-chat-friends-view');
    const convView = document.getElementById('lobby-chat-conversation-view');
    if (friendsView) friendsView.classList.add('hidden');
    if (convView) {
        convView.classList.remove('hidden');
        convView.classList.add('flex');
    }
    renderLobbyDirectChatMessages();
    setTimeout(() => document.getElementById('lobby-chat-input')?.focus(), 50);
}

function backToLobbyChatFriendsList() {
    activeLobbyChatPartnerId = '';
    showLobbyChatFriendsView();
}

function openBottomChatWithPlayer(playerId) {
    if (!playerId) return;
    activeLobbyChatPartnerId = playerId;
    const partner = typeof getPlayerById === 'function' ? getPlayerById(playerId) : null;
    const partnerName = partner ? (partner.username || partner.displayName) : null;
    const key = getConversationKey(partner || playerId);
    if (unreadDirectMessages[key]) {
        delete unreadDirectMessages[key];
        saveUnreadDirectMessages();
    }
    toggleLobbyChatDrawer(true);
    showLobbyChatConversationView();
    if (partnerName && typeof syncDirectChatMessages === 'function') {
        syncDirectChatMessages(partnerName).catch(() => {});
    }
}

function renderLobbyChatFriendsList() {
    const listEl = document.getElementById('lobby-chat-friends-list');
    if (!listEl) return;

    const allPlayers = getAllSearchablePlayers();
    const rawFriends = allPlayers.filter(p => isPlayerFriend(p));
    const seenUsernames = new Set();
    const friendList = [];

    for (const f of rawFriends) {
        const u = (f.username || f.displayName || '').toLowerCase();
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u)) continue;
        if (u && !seenUsernames.has(u)) {
            seenUsernames.add(u);
            friendList.push(f);
        }
    }

    listEl.innerHTML = '';

    if (friendList.length === 0) {
        listEl.innerHTML = `
            <div class="p-6 text-center text-gray-400 space-y-2">
                <div class="text-2xl">👥</div>
                <div class="text-white font-bold text-xs">Zatím nemáš žádné přátele</div>
                <p class="text-[11px] text-gray-400">Přidej si kamarády v sekci Přátelé a budeš si s nimi moci psát!</p>
                <button type="button" onclick="openPeopleSearchResults(''); toggleLobbyChatDrawer(false);" class="mt-2 px-3 py-1.5 rounded-lg bg-[#00A2FF] text-white text-xs font-bold hover:bg-[#008BDB] transition">
                    + Najít přátele
                </button>
            </div>
        `;
        return;
    }

    friendList.forEach((friend, idx) => {
        const key = getConversationKey(friend);
        const pres = getPlayerPresence(friend);
        const unread = Number(unreadDirectMessages[key]) || 0;
        const msgs = lobbyDirectMessages[key] || [];
        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

        let lastMsgSnippet = '';
        if (lastMsg) {
            const prefix = lastMsg.isMe ? 'Vy: ' : '';
            lastMsgSnippet = `${prefix}${lastMsg.text}`;
        } else if (pres.inGame && pres.gameId) {
            const partyLabel = pres.isParty ? ' (Party)' : '';
            lastMsgSnippet = `🎮 Hraje: ${pres.gameTitle}${partyLabel}`;
        } else if (pres.isOnline) {
            lastMsgSnippet = 'Online na webu';
        } else {
            lastMsgSnippet = 'Offline';
        }

        let dotHtml = '';
        if (pres.inGame && pres.gameId) {
            dotHtml = `<span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00B06F] border border-[#191B1D] flex items-center justify-center text-white shadow animate-pulse" title="Hraje: ${escapeHtml(pres.gameTitle)}"><svg class="w-2 h-2 fill-white" viewBox="0 0 24 24"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></span>`;
        } else if (pres.isOnline) {
            dotHtml = `<span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00A2FF] border border-[#191B1D]" title="Online na webu"></span>`;
        }

        const friendName = friend.username || friend.displayName;
        const cid = `lobby-chat-avatar-${idx}`;

        const unreadBadgeHtml = unread > 0
            ? `<span class="px-2 py-0.5 rounded-full bg-red-500 text-white font-black text-[10px] leading-none shrink-0 shadow animate-pulse">${unread > 99 ? '99+' : unread}</span>`
            : '';

        const item = document.createElement('button');
        item.type = 'button';
        item.onclick = () => openBottomChatWithPlayer(friend.id);
        item.className = 'w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 hover:bg-[#232527] transition text-left focus:outline-none';
        item.innerHTML = `
            <div class="flex items-center gap-2.5 min-w-0">
                <div class="relative shrink-0">
                    <canvas id="${cid}" width="40" height="40" class="w-9 h-9 rounded-full bg-[#232527] border border-[#393B3D] block"></canvas>
                    ${dotHtml}
                </div>
                <div class="min-w-0">
                    <div class="text-xs font-bold text-white truncate flex items-center gap-1.5">${escapeHtml(friendName)} ${getPlayerTag(friendName, friend.isVip) ? '<span class="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-gradient-to-r from-[#FFE066] to-[#F59F00] text-black shadow-sm font-sans align-middle inline-block">' + getPlayerTag(friendName, friend.isVip) + '</span>' : ''}</div>
                    <div class="text-[10px] ${unread > 0 ? 'text-white font-bold' : (pres.inGame ? 'text-[#00B06F] font-semibold' : 'text-gray-400')} truncate max-w-[150px] sm:max-w-[170px]">${escapeHtml(lastMsgSnippet)}</div>
                </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                ${unreadBadgeHtml}
                <span class="text-gray-500 text-xs font-bold">›</span>
            </div>
        `;
        listEl.appendChild(item);

        const canvasEl = document.getElementById(cid);
        drawPlayerHeadshotCanvas(canvasEl, friend);
    });
}

function renderLobbyDirectChatMessages() {
    const partner = getPlayerById(activeLobbyChatPartnerId);
    const titleEl = document.getElementById('lobby-chat-active-partner');
    const statusEl = document.getElementById('lobby-chat-active-partner-status');
    const listEl = document.getElementById('lobby-chat-messages-list');
    if (!listEl) return;

    const partnerName = partner.displayName || partner.username || 'Přítel';
    if (titleEl) {
        titleEl.innerHTML = `${escapeHtml(partnerName)} ${getPlayerTag(partnerName, partner.isVip) ? '<span class="ml-1 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-gradient-to-r from-[#FFE066] to-[#F59F00] text-black shadow-sm font-sans align-middle inline-block">' + getPlayerTag(partnerName, partner.isVip) + '</span>' : ''}`;
    }

    if (statusEl) {
        const pres = getPlayerPresence(partner);
        if (pres.inGame && pres.gameId) {
            const partyLabel = pres.isParty ? ' (Party)' : '';
            statusEl.className = 'text-[10px] text-[#00B06F] font-bold truncate';
            statusEl.textContent = `🎮 ${pres.gameTitle}${partyLabel}`;
            statusEl.title = `Hraje: ${pres.gameTitle}${pres.isParty ? ' (Soukromá party)' : ''}`;
        } else if (pres.isOnline) {
            statusEl.className = 'w-2 h-2 rounded-full bg-[#00A2FF] inline-block';
            statusEl.textContent = '';
            statusEl.title = 'Online na webu';
        } else {
            statusEl.className = 'text-[10px] text-gray-500';
            statusEl.textContent = 'Offline';
            statusEl.title = 'Offline';
        }
    }

    const key = getConversationKey(partner);
    const msgs = lobbyDirectMessages[key] || [];
    listEl.innerHTML = '';

    if (msgs.length === 0) {
        listEl.innerHTML = `
            <div class="p-6 text-center text-gray-400 space-y-1">
                <div class="text-2xl">👋</div>
                <div class="text-white font-bold text-xs">Začni chat s hráčem ${escapeHtml(partnerName)}</div>
                <p class="text-[11px] text-gray-400">Napiš zprávu do pole níže a odešli ji klávesou Enter.</p>
            </div>
        `;
        return;
    }

    msgs.forEach(m => {
        const row = document.createElement('div');
        row.className = m.isMe ? 'flex flex-col items-end' : 'flex flex-col items-start';
        const bubble = document.createElement('div');
        bubble.className = m.isMe
            ? 'px-3 py-1.5 rounded-xl rounded-tr-none bg-[#00A2FF] text-white max-w-[85%] break-words shadow-sm text-xs'
            : 'px-3 py-1.5 rounded-xl rounded-tl-none bg-[#2C2F33] text-gray-100 max-w-[85%] break-words border border-[#393B3D] shadow-sm text-xs';
        bubble.textContent = m.text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'text-[9px] text-gray-400 mt-0.5 px-1';
        if (m.timestamp) {
            const d = new Date(m.timestamp);
            timeSpan.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        row.appendChild(bubble);
        if (m.timestamp) row.appendChild(timeSpan);
        listEl.appendChild(row);
    });

    listEl.scrollTop = listEl.scrollHeight;
}

function sendLobbyDirectChatMessage() {
    const inp = document.getElementById('lobby-chat-input');
    if (!inp) return;
    const clean = sanitizeTextClient(inp.value, 160);
    inp.value = '';
    if (!clean) return;

    if (!activeLobbyChatPartnerId) {
        showLobbyChatFriendsView();
        return;
    }

    const partner = getPlayerById(activeLobbyChatPartnerId);
    const myProfile = getLocalRobloxPlayerProfile();
    const mySenderId = getMyUniqueSocialId();
    const mySenderName = myProfile.username || myProfile.displayName || 'Hráč';
    const partnerName = partner.username || partner.displayName || 'Přítel';
    const targetId = partner.dbId || partner.id;
    const key = getConversationKey(partner);

    const msgObj = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        from: mySenderName,
        text: clean,
        isMe: true,
        timestamp: Date.now()
    };

    if (!lobbyDirectMessages[key]) {
        lobbyDirectMessages[key] = [];
    }
    lobbyDirectMessages[key].push(msgObj);
    saveLobbyDirectMessages();

    // Broadcast across Realtime network to the recipient
    const packet = {
        id: msgObj.id,
        fromId: mySenderId,
        fromUsername: mySenderName,
        toId: targetId,
        toUsername: partnerName,
        text: clean,
        timestamp: msgObj.timestamp
    };

    if (typeof sendSocialBroadcast === 'function') {
        sendSocialBroadcast('direct_chat_message', packet);
    }

    // Persist to backend server via apiRequest for cross-device synchronization
    if (typeof apiRequest === 'function') {
        apiRequest('/api/chat/messages', {
            method: 'POST',
            body: {
                recipient: partnerName,
                text: clean,
                id: msgObj.id,
                timestamp: msgObj.timestamp
            }
        }).catch(err => {
            console.warn('[DirectChat] Nelze uložit zprávu na API:', err);
        });
    }

    renderLobbyDirectChatMessages();

    if (typeof sfx !== 'undefined' && sfx.playCoin) {
        sfx.playCoin();
    }
}

function handleIncomingDirectChatMessage(payload) {
    if (!payload || !payload.text) return;
    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || myProfile.displayName || '').toLowerCase();
    const myId = getMyUniqueSocialId();

    const targetUser = (payload.toUsername || '').toLowerCase();
    const targetId = payload.toId ? String(payload.toId).toLowerCase() : '';
    const myIdLower = myId ? String(myId).toLowerCase() : '';

    const isForMe = (
        (targetUser && targetUser === myUName) ||
        (targetId && (targetId === myIdLower || targetId === myUName || targetId === `cloud_${myUName}`))
    );

    if (!isForMe) return;

    // Do not process messages sent by ourselves
    const senderName = payload.fromUsername || 'Přítel';
    if (senderName.toLowerCase() === myUName) return;

    const senderKey = getConversationKey(payload.fromUsername || payload.fromId);
    if (!senderKey) return;

    if (!lobbyDirectMessages[senderKey]) {
        lobbyDirectMessages[senderKey] = [];
    }

    // Deduplicate by message id if already received
    if (payload.id && lobbyDirectMessages[senderKey].some(m => m.id === payload.id)) {
        return;
    }

    const msgObj = {
        id: payload.id || ('msg_' + Date.now()),
        from: senderName,
        text: payload.text,
        isMe: false,
        timestamp: payload.timestamp || Date.now()
    };
    lobbyDirectMessages[senderKey].push(msgObj);
    saveLobbyDirectMessages();

    // Check if user is currently looking at this active conversation
    const drawerOpen = isLobbyChatDrawerOpen();
    const activeKey = getConversationKey(activeLobbyChatPartnerId);
    const isCurrentlyChatting = drawerOpen && activeKey && (activeKey === senderKey);

    if (isCurrentlyChatting) {
        renderLobbyDirectChatMessages();
        if (typeof sfx !== 'undefined' && sfx.playCoin) {
            sfx.playCoin();
        }
    } else {
        unreadDirectMessages[senderKey] = (unreadDirectMessages[senderKey] || 0) + 1;
        saveUnreadDirectMessages();
        updateLobbyChatBadge();

        if (drawerOpen) {
            renderLobbyChatFriendsList();
        }

        if (typeof showHudToast === 'function') {
            showHudToast(`💬 ${senderName}: ${payload.text}`, 'blue');
        }
        if (typeof sfx !== 'undefined' && sfx.playCoin) {
            sfx.playCoin();
        }
    }
}

// Close search dropdown when clicking outside
document.addEventListener('pointerdown', e => {
    const dd = document.getElementById('top-search-dropdown');
    const inp = document.getElementById('game-search-input');
    if (dd && !dd.classList.contains('hidden')) {
        if (!dd.contains(e.target) && e.target !== inp) {
            dd.classList.add('hidden');
        }
    }
});

// Initialize Portal Visuals & Friends Strip
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        sanitizeStoredFriends();
        refreshPortalAvatarVisuals();
        updateLobbyChatBadge();
        initPortalSidebarMobileEvents();
    });
} else {
    const initTimer = setTimeout(() => {
        sanitizeStoredFriends();
        refreshPortalAvatarVisuals();
        updateLobbyChatBadge();
        initPortalSidebarMobileEvents();
    }, 0);
    if (initTimer && typeof initTimer.unref === 'function') initTimer.unref();
}

/* ============================================================================
 * LIVE UPDATE DETECTION & AUTO-RELOAD NOTIFICATION SYSTEM
 * ============================================================================ */
let updateCountdownInterval = null;
let updateCountdownRemaining = 15;
let isUpdatePromptActive = false;
let initialKnownBuildTime = null;

function getAppClientVersion() {
    const scripts = Array.from(document.querySelectorAll('script[src*="?v="]'));
    for (const s of scripts) {
        const srcAttr = s.getAttribute('src') || s.src || '';
        const m = srcAttr.match(/\?v=([\d\.]+)/);
        if (m) return m[1];
    }
    return null;
}

function reloadForUpdateNow() {
    if (typeof syncAccountToServer === 'function') {
        try { syncAccountToServer(); } catch (e) {}
    }
    const cleanUrl = window.location.origin + window.location.pathname;
    window.location.replace(cleanUrl + '?_update=' + Date.now());
}

function postponeUpdatePrompt() {
    const modal = document.getElementById('update-modal');
    const floatBar = document.getElementById('update-floating-bar');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    if (floatBar) {
        floatBar.classList.remove('hidden');
        floatBar.classList.add('flex');
    }
    updateCountdownRemaining = 60;
    const floatSecs = document.getElementById('update-float-secs');
    if (floatSecs) floatSecs.textContent = `${updateCountdownRemaining}s`;
}

function showUpdateNotificationModal(newVersion, buildTime, shouldBroadcast = true) {
    if (isUpdatePromptActive) return;

    const currentVer = getAppClientVersion();
    const cleanRemoteVer = newVersion ? String(newVersion).trim() : '';

    // If client is already running this version, NEVER show update modal!
    if (cleanRemoteVer && cleanRemoteVer === currentVer) {
        return;
    }

    isUpdatePromptActive = true;

    // Exit pointer lock if playing in 3D game
    if (document.pointerLockElement) {
        try { document.exitPointerLock(); } catch (e) {}
    }

    // Play alert sound
    if (typeof sfx !== 'undefined' && sfx.playDerbyHorn) {
        try { sfx.playDerbyHorn(); } catch (e) {}
    } else if (typeof sfx !== 'undefined' && sfx.playWinFanfare) {
        try { sfx.playWinFanfare(); } catch (e) {}
    }

    // Broadcast across other local tabs only if this tab initiated it
    if (shouldBroadcast && typeof mpState !== 'undefined' && mpState.bc) {
        try {
            mpState.bc.postMessage({
                type: 'boblox_update_detected',
                version: newVersion,
                buildTime: buildTime
            });
        } catch (e) {}
    }

    const modal = document.getElementById('update-modal');
    const verTag = document.getElementById('update-new-version-tag');
    const countText = document.getElementById('update-countdown-text');
    const countBar = document.getElementById('update-countdown-bar');

    if (verTag && newVersion) {
        verTag.textContent = `Verze v${newVersion} je připravena`;
    }

    updateCountdownRemaining = 15;
    const initialDuration = 15;

    if (countText) countText.textContent = `${updateCountdownRemaining}s`;
    if (countBar) countBar.style.width = '100%';

    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    if (updateCountdownInterval) clearInterval(updateCountdownInterval);
    updateCountdownInterval = setInterval(() => {
        updateCountdownRemaining--;
        if (countText) countText.textContent = `${updateCountdownRemaining}s`;
        const floatSecs = document.getElementById('update-float-secs');
        if (floatSecs) floatSecs.textContent = `${updateCountdownRemaining}s`;

        if (countBar) {
            const pct = Math.max(0, (updateCountdownRemaining / initialDuration) * 100);
            countBar.style.width = `${pct}%`;
        }

        if (updateCountdownRemaining <= 0) {
            clearInterval(updateCountdownInterval);
            reloadForUpdateNow();
        }
    }, 1000);
}

async function checkForBobloxUpdates() {
    if (isUpdatePromptActive) return;
    try {
        const res = await fetch(`version.json?_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.version) return;

        const currentClientVersion = getAppClientVersion();
        const remoteVersion = String(data.version).trim();
        const remoteBuildTime = data.buildTime || data.updatedAt || 0;

        if (!initialKnownBuildTime) {
            initialKnownBuildTime = remoteBuildTime;
        }

        const isNewVersion = remoteVersion !== currentClientVersion;
        const isNewerBuild = remoteBuildTime && initialKnownBuildTime && remoteBuildTime > initialKnownBuildTime;

        if (isNewVersion || isNewerBuild) {
            showUpdateNotificationModal(remoteVersion, remoteBuildTime);
        }
    } catch (e) {
        // Network error / offline, ignore
    }
}

// Initial check after 4 seconds, then periodically poll every 15 seconds
const updateTimer = setTimeout(checkForBobloxUpdates, 4000);
if (updateTimer && typeof updateTimer.unref === 'function') updateTimer.unref();
const updateInterval = setInterval(checkForBobloxUpdates, 15000);
if (updateInterval && typeof updateInterval.unref === 'function') updateInterval.unref();

/* ============================================================================
 * 28. DEDICATED ADMIN MENU & CONTROLS FOR VENDEEZ (EXTRACTED TO AdminUI.js)
 * ============================================================================ */
let AdminUIModule = {};
try {
    if (typeof require === 'function') {
        AdminUIModule = require('./AdminUI.js');
    } else if (typeof window !== 'undefined') {
        AdminUIModule = window;
    }
} catch (e) {}

if (typeof window !== 'undefined') {
    window.syncDirectChatMessages = syncDirectChatMessages;
    window.getLobbyDirectMessages = getLobbyDirectMessages;
    window.friendsSet = friendsSet;
    window.sentFriendRequests = sentFriendRequests;
    window.receivedFriendRequests = receivedFriendRequests;
    window.sendFriendRequest = sendFriendRequest;
    window.hasSentFriendRequest = hasSentFriendRequest;
    window.isPlayerFriend = isPlayerFriend;
    window.toggleFriendStatus = toggleFriendStatus;
    window.acceptFriendRequest = acceptFriendRequest;
    window.cancelFriendRequest = cancelFriendRequest;
    window.saveEditedProfile = saveEditedProfile;
    window.openEditProfileModal = openEditProfileModal;
    window.closeEditProfileModal = closeEditProfileModal;
    window.getLocalRobloxPlayerProfile = getLocalRobloxPlayerProfile;
    window.getServerPlayersList = getServerPlayersList;
    window.renderRobloxTopRightPlayerList = renderRobloxTopRightPlayerList;
    window.renderRobloxPeopleList = renderRobloxPeopleList;
    window.appendRobloxChatMessage = appendRobloxChatMessage;
    window.sendRobloxChatMessage = sendRobloxChatMessage;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatBobuxTransaction,
        openBobuxTransactionsModal,
        drawWearingItemCardCanvas,
        getProfileWearingItems,
        renderPortalProfileView,
        setAvatarTorsoColor,
        openAvatarPreviewModal,
        drawPlayerHeadshotCanvas,
        refreshPortalAvatarVisuals,
        toggleMobileSidebar,
        switchPortalSection,
        initPortalSidebarMobileEvents,
        getAppClientVersion,
        showUpdateNotificationModal,
        checkForBobloxUpdates,
        drawRobloxAvatarCardPortrait,
        syncDirectChatMessages,
        getLobbyDirectMessages,
        friendsSet,
        sentFriendRequests,
        receivedFriendRequests,
        sendFriendRequest,
        hasSentFriendRequest,
        isPlayerFriend,
        toggleFriendStatus,
        acceptFriendRequest,
        cancelFriendRequest,
        saveEditedProfile,
        openEditProfileModal,
        closeEditProfileModal,
        getLocalRobloxPlayerProfile,
        getServerPlayersList,
        renderRobloxTopRightPlayerList,
        renderRobloxPeopleList,
        appendRobloxChatMessage,
        sendRobloxChatMessage,
        ...(AdminUIModule || {})
    };
}



