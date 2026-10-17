/* ============================================================================
 * 3. PROCEDURAL THUMBNAIL ARTWORK GENERATOR (FOR ALL 10 GAMES)
 * ============================================================================ */
function drawGameThumbnail(canvas, gameId) {
    if (!canvas) return;
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
    const miniShirt = avatarOutfit.shirt ? SHOP_ITEM_MAP[avatarOutfit.shirt] : null;
    const miniPants = avatarOutfit.pants ? SHOP_ITEM_MAP[avatarOutfit.pants] : null;
    ctx.fillStyle = (miniShirt && miniShirt.color) || avatarTorsoHex || '#0D69AC';
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
        updateModalRatingUI(gameId);
        renderSafeCommentsList(gameId);
    }
}

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
        btnLike.className = 'px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition ' +
            (info.myVote === 'like'
                ? 'bg-[#00B06F] border-green-300 text-white'
                : 'bg-[#232527] hover:bg-[#00B06F]/25 border-[#393B3D] text-gray-200');
    }
    if (btnDislike) {
        btnDislike.className = 'px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition ' +
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
    const res = await apiRequest(`/api/games/${selectedGameId}/rate`, {
        method: 'POST',
        body: { vote }
    });
    if (!res.ok) {
        showCommentStatus(res.data?.error || 'Hodnocení se nezdařilo.', true);
        return;
    }
    liveSocialState.ratingsByGame[selectedGameId] = {
        likes: res.data.likes || 0,
        dislikes: res.data.dislikes || 0,
        ratingPct: res.data.ratingPct,
        myVote: res.data.myVote
    };
    sfx.playCoin();
    updateModalRatingUI(selectedGameId);
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

    const res = await apiRequest(`/api/games/${selectedGameId}/comments`, {
        method: 'POST',
        body: { content: cleanText }
    });

    if (!res.ok) {
        showCommentStatus(res.data?.error || 'Komentář se nepodařilo uložit.', true);
        return;
    }

    authState.lastCommentTime = Date.now();
    if (input) input.value = '';
    updateCommentCharCounter();
    sfx.playCoin();

    if (!liveSocialState.commentsByGame[selectedGameId]) {
        liveSocialState.commentsByGame[selectedGameId] = [];
    }
    liveSocialState.commentsByGame[selectedGameId].unshift(res.data.comment);
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
    const modal = document.getElementById('avatar-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeAvatarPreviewModal() {
    const modal = document.getElementById('avatar-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    renderGameCatalog();
}

function setAvatarTorsoColor(hex) {
    avatarTorsoHex = hex;
    localStorage.setItem(STORAGE_KEY_TORSO, hex);
    sfx.playCoin();
    renderGameCatalog();
    if (typeof refreshPortalAvatarVisuals === 'function') refreshPortalAvatarVisuals();
    syncAccountToServer();
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
    const savedBio = localStorage.getItem('boblox_custom_bio_v1');

    return {
        id: 'local',
        username: username,
        displayName: username,
        handle: `@${username.replace(/\s+/g, '')}`,
        bio: savedBio || 'No bio yet',
        torsoHex: (typeof avatarTorsoHex !== 'undefined') ? avatarTorsoHex : '#0D69AC',
        outfit: typeof avatarOutfit !== 'undefined' ? avatarOutfit : null,
        followers: 0,
        following: 0,
        rap: (typeof bobuxBalance !== 'undefined') ? bobuxBalance : 250,
        status: 'online',
        isLocal: true
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
                    isLocal: false
                });
            }
        });
    }
    return list;
}

function drawRobloxAvatarCardPortrait(canvas, player) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w * 0.5, h * 0.54);

    // Subtle ground shadow ellipse
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 38, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slightly angled 3D-style R15/Blocky character pose (like Screenshot 2)
    const shirtItem = player.outfit && player.outfit.shirt && typeof SHOP_ITEM_MAP !== 'undefined'
        ? SHOP_ITEM_MAP[player.outfit.shirt]
        : null;
    const pantsItem = player.outfit && player.outfit.pants && typeof SHOP_ITEM_MAP !== 'undefined'
        ? SHOP_ITEM_MAP[player.outfit.pants]
        : null;

    const torsoCol = (shirtItem && shirtItem.color) || player.torsoHex || '#1f2937';
    const legCol = (pantsItem && pantsItem.color) || '#111827';

    // Legs (dark pants + white sneakers like Screenshot 2)
    ctx.fillStyle = legCol;
    ctx.fillRect(-13, 12, 11, 22);
    ctx.fillRect(2, 12, 11, 22);

    // White shoes
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-14, 30, 12, 6);
    ctx.fillRect(2, 30, 12, 6);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-14, 34, 12, 2);
    ctx.fillRect(2, 34, 12, 2);

    // Left & Right Arms (slightly angled out)
    ctx.save();
    ctx.translate(-15, -14);
    ctx.rotate(0.14);
    ctx.fillStyle = torsoCol;
    ctx.fillRect(-8, 0, 9, 21);
    ctx.fillStyle = '#eac086'; // hand
    ctx.fillRect(-8, 21, 9, 5);
    ctx.restore();

    ctx.save();
    ctx.translate(15, -14);
    ctx.rotate(-0.14);
    ctx.fillStyle = torsoCol;
    ctx.fillRect(-1, 0, 9, 21);
    ctx.fillStyle = '#eac086'; // hand
    ctx.fillRect(-1, 21, 9, 5);
    ctx.restore();

    // Torso with plaid/flannel texture pattern
    ctx.fillStyle = torsoCol;
    ctx.fillRect(-14, -15, 28, 28);

    // Subtle plaid grid lines on torso
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    for (let x = -9; x <= 9; x += 6) {
        ctx.beginPath();
        ctx.moveTo(x, -15);
        ctx.lineTo(x, 13);
        ctx.stroke();
    }
    for (let y = -10; y <= 10; y += 6) {
        ctx.beginPath();
        ctx.moveTo(-14, y);
        ctx.lineTo(14, y);
        ctx.stroke();
    }

    // Head
    ctx.fillStyle = '#eac086';
    ctx.beginPath();
    ctx.roundRect(-11, -35, 22, 20, 4);
    ctx.fill();

    // Cool Sunglasses
    ctx.fillStyle = '#090a0c';
    ctx.fillRect(-10, -28, 9, 6);
    ctx.fillRect(1, -28, 9, 6);
    ctx.fillRect(-2, -27, 4, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(-8, -27, 3, 2);
    ctx.fillRect(3, -27, 3, 2);

    // Slight confident smirk
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -20, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Styled spiky brown hair on top (matching Screenshot 2)
    ctx.fillStyle = '#5c3317';
    ctx.beginPath();
    ctx.moveTo(-13, -32);
    ctx.lineTo(-10, -42);
    ctx.lineTo(-4, -38);
    ctx.lineTo(0, -44);
    ctx.lineTo(5, -39);
    ctx.lineTo(11, -42);
    ctx.lineTo(13, -32);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function renderRobloxTopRightPlayerList() {
    const rowsEl = document.getElementById('roblox-playerlist-rows');
    if (!rowsEl) return;
    rowsEl.innerHTML = '';

    const players = getServerPlayersList();
    players.forEach(p => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between py-0.5 text-xs font-medium text-white truncate';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'truncate';
        nameSpan.textContent = p.displayName;
        row.appendChild(nameSpan);
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
            if (nameDiv) nameDiv.textContent = p.displayName;
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
                        <div class="font-bold text-xs sm:text-sm text-white truncate"></div>
                        <div class="text-[11px] text-gray-400 truncate"></div>
                    </div>
                </div>
                <span class="text-[11px] text-gray-400 font-medium px-2.5 py-1 rounded bg-[#18191c]">In Server</span>
            `;
            const nameDiv = row.querySelector('.font-bold');
            const handleDiv = row.querySelector('.text-gray-400');
            if (nameDiv) nameDiv.textContent = p.displayName;
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
    const validTabs = ['people', 'settings', 'gallery', 'report', 'help'];
    const target = validTabs.includes(tabId) ? tabId : 'people';
    robloxUiState.activeTab = target;

    document.querySelectorAll('.rblx-menu-tab').forEach(btn => {
        const isAct = btn.getAttribute('data-rblx-tab') === target;
        btn.className = isAct
            ? 'rblx-menu-tab py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-white border-b-2 border-white transition'
            : 'rblx-menu-tab py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-gray-400 hover:text-white border-b-2 border-transparent transition';
    });

    validTabs.forEach(t => {
        const panel = document.getElementById(`rblx-panel-${t}`);
        if (panel) {
            panel.classList.toggle('hidden', t !== target);
        }
    });

    if (target === 'people') renderRobloxPeopleList();
    if (target === 'settings') updateRobloxSettingsUI();
}

function openRobloxEscMenu(initialTab) {
    if (!activeGameMode) return;
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

function toggleRobloxChat(focusInput = false) {
    const box = document.getElementById('roblox-chat-box');
    if (!box) return;
    robloxUiState.isChatOpen = !robloxUiState.isChatOpen;
    box.classList.toggle('hidden', !robloxUiState.isChatOpen);
    box.classList.toggle('flex', robloxUiState.isChatOpen);

    if (robloxUiState.isChatOpen && focusInput) {
        setTimeout(() => {
            const inp = document.getElementById('roblox-chat-input');
            if (inp) inp.focus();
        }, 20);
    }
}

function appendRobloxChatMessage(senderName, text) {
    const list = document.getElementById('roblox-chat-messages');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'leading-snug break-words';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'font-bold text-[#00A2FF] mr-1.5';
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
    appendRobloxChatMessage(myProfile.displayName, clean);

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

let sentFriendRequests = (() => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_SENT_REQUESTS);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
})();

let receivedFriendRequests = (() => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_RECEIVED_REQUESTS);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
})();

const liveFriendsPresence = {}; // friendId/username -> { inGame: boolean, gameId, gameTitle, roomCode, lastSeen }

function saveSentFriendRequests() {
    localStorage.setItem(STORAGE_KEY_SENT_REQUESTS, JSON.stringify(sentFriendRequests));
}

function saveReceivedFriendRequests() {
    localStorage.setItem(STORAGE_KEY_RECEIVED_REQUESTS, JSON.stringify(receivedFriendRequests));
    updateSidebarFriendsBadge();
}

function hasSentFriendRequest(playerOrId) {
    if (!playerOrId) return false;
    if (typeof playerOrId === 'object') {
        const p = playerOrId;
        const uName = (p.username || p.displayName || '').toLowerCase();
        if (p.id && sentFriendRequests[p.id]) return true;
        if (p.dbId && sentFriendRequests[p.dbId]) return true;
        if (uName && (sentFriendRequests[uName] || sentFriendRequests[`cloud_${uName}`] || sentFriendRequests[`db_${uName}`] || sentFriendRequests[`user_${uName}`])) return true;
        for (const rid of Object.keys(sentFriendRequests)) {
            const rLower = rid.toLowerCase();
            if (p.id && rLower === String(p.id).toLowerCase()) return true;
            if (uName && (rLower === uName || rLower === `cloud_${uName}` || rLower === `db_${uName}`)) return true;
        }
        return false;
    }
    const idStr = String(playerOrId).toLowerCase();
    if (sentFriendRequests[playerOrId] || sentFriendRequests[idStr]) return true;
    const cleanNick = idStr.replace(/^(user_|cloud_|db_|peer_)/, '');
    if (sentFriendRequests[cleanNick] || sentFriendRequests[`cloud_${cleanNick}`] || sentFriendRequests[`db_${cleanNick}`] || sentFriendRequests[`user_${cleanNick}`] || sentFriendRequests[`peer_${cleanNick}`]) return true;
    for (const rid of Object.keys(sentFriendRequests)) {
        const rLower = rid.toLowerCase();
        if (rLower === idStr || rLower === cleanNick || rLower.replace(/^(user_|cloud_|db_|peer_)/, '') === cleanNick) return true;
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
        for (const rid of Object.keys(receivedFriendRequests)) {
            const rLower = rid.toLowerCase();
            if (p.id && rLower === String(p.id).toLowerCase()) return true;
            if (uName && (rLower === uName || rLower === `cloud_${uName}` || rLower === `db_${uName}`)) return true;
        }
        return false;
    }
    const idStr = String(playerOrId).toLowerCase();
    if (receivedFriendRequests[playerOrId] || receivedFriendRequests[idStr]) return true;
    const cleanNick = idStr.replace(/^(user_|cloud_|db_|peer_)/, '');
    if (receivedFriendRequests[cleanNick] || receivedFriendRequests[`cloud_${cleanNick}`] || receivedFriendRequests[`db_${cleanNick}`] || receivedFriendRequests[`user_${cleanNick}`] || receivedFriendRequests[`peer_${cleanNick}`]) return true;
    for (const rid of Object.keys(receivedFriendRequests)) {
        const rLower = rid.toLowerCase();
        if (rLower === idStr || rLower === cleanNick || rLower.replace(/^(user_|cloud_|db_|peer_)/, '') === cleanNick) return true;
    }
    return false;
}

function updateSidebarFriendsBadge() {
    const badge = document.getElementById('sidebar-friends-badge');
    const incomingCount = Object.keys(receivedFriendRequests).length;
    if (badge) {
        if (incomingCount > 0) {
            badge.textContent = String(incomingCount);
            badge.className = 'px-2 py-0.5 rounded-full bg-[#00A2FF] text-[10px] font-extrabold text-white animate-pulse';
            badge.title = `${incomingCount} příchozích žádostí o přátelství`;
            badge.classList.remove('hidden');
        } else {
            const count = friendsSet.size;
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

    if (event === 'friend_request_send') {
        const toIdMatch = payload.toId && (
            payload.toId === myId ||
            payload.toId === `db_${myUName}` ||
            payload.toId === `cloud_${myUName}` ||
            payload.toId === `user_${myUName}` ||
            (myPeerId && (payload.toId === myPeerId || payload.toId === `peer_${myPeerId}`))
        );
        const toNameMatch = payload.toUsername && isRegistered && payload.toUsername.toLowerCase() === myUName;
        if (toIdMatch || toNameMatch) {
            const senderId = (payload.fromId && payload.fromId !== 'local') ? payload.fromId : (payload.fromUsername ? `user_${payload.fromUsername.toLowerCase()}` : null);
            if (!senderId || senderId === myId || (myPeerId && senderId === myPeerId)) return;
            if (isRegistered && payload.fromUsername && payload.fromUsername.toLowerCase() === myUName) return;

            receivedFriendRequests[senderId] = {
                id: senderId,
                username: payload.fromUsername || 'Hráč',
                receivedAt: Date.now(),
                senderProfile: payload.senderProfile ? { ...payload.senderProfile, id: senderId, isLocal: false } : null
            };
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
            (myPeerId && (payload.toId === myPeerId || payload.toId === `peer_${myPeerId}`))
        );
        const toNameMatch = payload.toUsername && isRegistered && payload.toUsername.toLowerCase() === myUName;
        if (toIdMatch || toNameMatch) {
            delete sentFriendRequests[payload.fromId];
            if (payload.toId) delete sentFriendRequests[payload.toId];
            saveSentFriendRequests();

            const acceptorId = (payload.fromId && payload.fromId !== 'local') ? payload.fromId : (payload.fromUsername ? `user_${payload.fromUsername.toLowerCase()}` : null);
            if (acceptorId && acceptorId !== myId) {
                friendsSet.add(acceptorId);
                if (payload.fromUsername) friendsSet.add(payload.fromUsername.toLowerCase());
                saveFriendsList();
                if (payload.acceptorProfile) {
                    saveCachedFriendProfile({
                        ...payload.acceptorProfile,
                        id: acceptorId,
                        isLocal: false
                    });
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
        const toIdMatch = payload.toId && (payload.toId === myId || payload.toId === `db_${myUName}` || payload.toId === `cloud_${myUName}`);
        const toNameMatch = payload.toUsername && payload.toUsername.toLowerCase() === myUName;
        if (toIdMatch || toNameMatch) {
            delete receivedFriendRequests[payload.fromId];
            saveReceivedFriendRequests();
            renderHomeFriendsStrip();
            if (activePortalSection === 'profile') renderPortalProfileView();
            if (activePortalSection === 'people') renderPeopleResultsGrid();
        }
    } else if (event === 'friend_presence') {
        if (payload.id) {
            liveFriendsPresence[payload.id] = payload;
        }
        if (payload.username) {
            liveFriendsPresence[payload.username.toLowerCase()] = payload;
        }
        if (typeof mpState !== 'undefined' && mpState.globalOnlinePeers && payload.id) {
            mpState.globalOnlinePeers[payload.id] = {
                id: payload.id,
                username: payload.username || 'Hráč',
                inGame: !!payload.inGame,
                gameId: payload.gameId || null,
                roomCode: payload.roomCode || null,
                lastSeen: Date.now()
            };
            if (typeof recomputeLivePlayerCounts === 'function') {
                recomputeLivePlayerCounts();
            }
        }
        if (isPlayerFriend(payload.id) || (payload.username && isPlayerFriend(payload.username))) {
            renderHomeFriendsStrip();
            if (activePortalSection === 'people') renderPeopleResultsGrid();
        }
    }
}

function sendFriendRequest(playerId) {
    if (!playerId || playerId === 'local') return;
    const player = getPlayerById(playerId);
    const pName = player.username || player.displayName || 'Hráč';
    const myProfile = getLocalRobloxPlayerProfile();
    const mySenderId = getMyUniqueSocialId();

    // If we already received request or are already friends, auto-accept immediately:
    if (hasReceivedFriendRequest(playerId) || isPlayerFriend(playerId)) {
        acceptFriendRequest(playerId);
        return;
    }

    sentFriendRequests[playerId] = {
        id: playerId,
        username: pName,
        sentAt: Date.now()
    };
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
    const mySenderId = getMyUniqueSocialId();
    const pidLower = String(pid).toLowerCase();
    const cleanNick = pidLower.replace(/^(user_|cloud_|db_|peer_)/, '');

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
            toId: pid
        });
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
    saveReceivedFriendRequests();

    friendsSet.add(playerId);
    if (pName) {
        const pLower = pName.toLowerCase();
        friendsSet.add(pLower);
        friendsSet.add(`cloud_${pLower}`);
        friendsSet.add(`db_${pLower}`);
    }
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
    const list = getCachedFriendsProfiles().filter(p => p.id !== cleanProfile.id && p.username !== cleanProfile.username);
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

    let changed = false;
    for (const fid of [...friendsSet]) {
        if (!fid || fid === 'local' || fid === myId) {
            friendsSet.delete(fid);
            changed = true;
        } else if (isRegistered && typeof fid === 'string') {
            const fLower = fid.toLowerCase();
            if (fLower === myUName || fLower === `db_${myUName}` || fLower === `cloud_${myUName}`) {
                friendsSet.delete(fid);
                changed = true;
            }
        }
    }
    if (changed) {
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
        const cleanedCached = cached.filter(p => {
            if (!p || !p.id || p.id === 'local' || p.id === myId) return false;
            if (isRegistered && (p.username || '').toLowerCase() === myUName) return false;
            return true;
        });
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
        const uName = (p.username || p.displayName || '').toLowerCase();
        if (p.id && friendsSet.has(p.id)) return true;
        if (p.dbId && friendsSet.has(p.dbId)) return true;
        if (uName && (friendsSet.has(uName) || friendsSet.has(`user_${uName}`) || friendsSet.has(`cloud_${uName}`) || friendsSet.has(`db_${uName}`))) return true;
        for (const fid of friendsSet) {
            const fStr = String(fid).toLowerCase();
            if (uName && (fStr === uName || fStr === `user_${uName}` || fStr === `cloud_${uName}` || fStr === `db_${uName}`)) return true;
            if (p.id && fStr === String(p.id).toLowerCase()) return true;
            if (p.dbId && fStr === String(p.dbId).toLowerCase()) return true;
        }
        return false;
    }

    const idStr = String(playerOrId).toLowerCase();
    if (friendsSet.has(playerOrId) || friendsSet.has(idStr)) return true;

    const cleanNick = idStr.replace(/^(user_|cloud_|db_|peer_)/, '');
    for (const fid of friendsSet) {
        const fStr = String(fid).toLowerCase();
        if (fStr === idStr || fStr === cleanNick) return true;
        if (fStr.replace(/^(user_|cloud_|db_|peer_)/, '') === cleanNick) return true;
    }
    return false;
}

function forceAddFriendDirectly(playerId) {
    if (!playerId || playerId === 'local') return;
    const player = getPlayerById(playerId);
    const pName = player.username || player.displayName || 'Hráč';
    const myProfile = getLocalRobloxPlayerProfile();
    const mySenderId = getMyUniqueSocialId();

    delete sentFriendRequests[playerId];
    saveSentFriendRequests();

    delete receivedFriendRequests[playerId];
    saveReceivedFriendRequests();

    friendsSet.add(playerId);
    if (pName) {
        const pLower = pName.toLowerCase();
        friendsSet.add(pLower);
        friendsSet.add(`cloud_${pLower}`);
        friendsSet.add(`db_${pLower}`);
    }
    saveFriendsList();

    saveCachedFriendProfile({
        ...player,
        id: playerId,
        isLocal: false
    });

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

    if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();
    if (typeof showHudToast === 'function') {
        showHudToast(`🎉 ${pName} byl přidán do tvých přátel!`, 'green');
    }

    renderHomeFriendsStrip();
    if (activePortalSection === 'profile') renderPortalProfileView();
    if (activePortalSection === 'people') renderPeopleResultsGrid();
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
                map.set(pid, {
                    id: pid,
                    username: u.username,
                    displayName: u.username,
                    handle: `@${u.username}`,
                    bio: u.bio || 'Registered Boblox Player.',
                    status: 'online',
                    friendsCount: 0,
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
                });
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
                map.set(pid, {
                    id: pid,
                    username: nick,
                    displayName: nick,
                    handle: `@${nick.replace(/\s+/g, '')}`,
                    bio: 'Live multiplayer player in Boblox.',
                    status: 'online',
                    friendsCount: 0,
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
                });
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
                map.set(pid, {
                    id: pid,
                    dbId: u.id,
                    username: u.username,
                    displayName: u.username,
                    handle: `@${u.username}`,
                    bio: u.bio || `Registrovaný Boblox hráč • ${u.coins ?? 250} B$`,
                    status: 'online',
                    friendsCount: 0,
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
                });
            }
        });
    }

    // 4. Include cached added friends and all IDs in friendsSet so they remain accessible even if offline
    const cachedFriends = getCachedFriendsProfiles();
    cachedFriends.forEach(p => {
        if (!p || !p.id) return;
        if (!map.has(p.id) && isPlayerFriend(p)) {
            map.set(p.id, p);
        }
    });

    const myProfile = getLocalRobloxPlayerProfile();
    const myUName = (myProfile.username || '').toLowerCase();
    const myId = getMyUniqueSocialId();

    friendsSet.forEach(fid => {
        if (!fid || fid === 'local' || fid === myId) return;
        const fidLower = String(fid).toLowerCase();
        if (myUName && fidLower === myUName) return;
        let exists = false;
        for (const existing of map.values()) {
            if (existing.id === fid || (existing.username && existing.username.toLowerCase() === fidLower)) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            const prof = getPlayerById(fid);
            if (prof && !prof.isLocal) {
                map.set(prof.id, prof);
            }
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
        return { ...myProfile, isLocal: true };
    }

    const pidLower = String(playerId).toLowerCase();
    const all = getAllSearchablePlayers();
    const found = all.find(p =>
        p.id === playerId ||
        (p.dbId && p.dbId === playerId) ||
        (p.username && p.username.toLowerCase() === pidLower) ||
        (p.displayName && p.displayName.toLowerCase() === pidLower) ||
        (p.handle && p.handle.toLowerCase() === `@${pidLower}`)
    );

    if (found) {
        const isMe = (found.id === 'local') || (found.id === myId) || (isRegistered && found.username && found.username.toLowerCase() === myUName);
        return {
            ...found,
            isLocal: isMe
        };
    }

    // Check cached friends
    const cached = getCachedFriendsProfiles().find(p =>
        p.id === playerId ||
        (p.username && p.username.toLowerCase() === pidLower) ||
        (p.displayName && p.displayName.toLowerCase() === pidLower)
    );
    if (cached) {
        return {
            ...cached,
            isLocal: false
        };
    }

    // Check live presence
    const pres = liveFriendsPresence[playerId] || liveFriendsPresence[pidLower];
    if (pres) {
        const uname = pres.username || playerId.replace(/^(db_|cloud_|peer_)/, '');
        return {
            id: pres.id || playerId,
            username: uname,
            displayName: uname,
            handle: `@${uname}`,
            bio: 'Registrovaný Boblox hráč',
            status: pres.inGame ? 'in_game' : 'online',
            friendsCount: 0,
            followers: 0,
            following: 0,
            rap: '250',
            torsoHex: pres.torsoHex || '#0D69AC',
            outfit: pres.outfit || null,
            isLocal: false
        };
    }

    // Fallback: construct friend profile with appropriate clean name instead of returning myself!
    const cleanName = playerId.replace(/^(db_|cloud_|peer_)/, '');
    return {
        id: playerId,
        username: cleanName,
        displayName: cleanName,
        handle: `@${cleanName}`,
        bio: 'Registrovaný Boblox hráč',
        status: 'online',
        friendsCount: 0,
        followers: 0,
        following: 0,
        rap: '250',
        torsoHex: '#0D69AC',
        outfit: null,
        isLocal: false
    };
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

function drawPlayerHeadshotCanvas(canvas, player) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Circular gradient backdrop
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.05, w * 0.5, h * 0.5, w * 0.55);
    grad.addColorStop(0, '#32353b');
    grad.addColorStop(1, '#1e2024');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const style = resolvePlayerVisualStyle(player);
    ctx.save();
    ctx.translate(w * 0.5, h * 0.64);
    const scale = (w / 92);
    ctx.scale(scale, scale);
    drawAvatarHeadAndHair2D(ctx, style);
    ctx.restore();
}

function drawPlayerFullBodyCanvas(canvas, player) {
    if (!canvas) return;
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

function toggleMobileSidebar() {
    const sb = document.getElementById('portal-sidebar');
    if (!sb) return;
    const isHidden = sb.classList.contains('hidden');
    if (isHidden) {
        sb.classList.remove('hidden');
        sb.classList.add('flex', 'fixed', 'top-12', 'bottom-0', 'left-0', 'shadow-2xl');
    } else {
        sb.classList.add('hidden');
        sb.classList.remove('flex', 'fixed', 'top-12', 'bottom-0', 'left-0', 'shadow-2xl');
    }
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

    // Close mobile sidebar if open
    const sb = document.getElementById('portal-sidebar');
    if (sb && sb.classList.contains('fixed')) {
        sb.classList.add('hidden');
        sb.classList.remove('flex', 'fixed', 'top-12', 'bottom-0', 'left-0', 'shadow-2xl');
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
        const u = (f.username || f.displayName || f.id || '').toLowerCase();
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
    if (incomingEntries.length > 0) {
        incomingEntries.forEach(([senderId, req]) => {
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
            const presence = liveFriendsPresence[friend.id] || liveFriendsPresence[(friend.username || '').toLowerCase()] || {};
            const isPlaying = presence.inGame && presence.gameId;
            const gameTitle = presence.gameTitle || presence.gameId;

            let statusDotHtml = '';
            let subtitleHtml = '';
            if (isPlaying) {
                statusDotHtml = `
                    <span class="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-[#00B06F] border-2 border-[#191B1D] flex items-center justify-center text-white shadow animate-pulse" title="Právě hraje: ${escapeHtml(gameTitle)}">
                        <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M4 8h12l2 6-3 2-3-3H8l-3 3-3-2 2-6z"/></svg>
                    </span>`;
                subtitleHtml = `<span class="text-[9px] text-[#00B06F] font-bold truncate w-full -mt-0.5">🎮 ${escapeHtml(gameTitle)}</span>`;
            } else if (friend.status === 'online') {
                statusDotHtml = `<span class="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[#00A2FF] border-2 border-[#191B1D]" title="Online"></span>`;
            }

            const friendName = friend.username || friend.displayName;
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

function drawWearingItemCardCanvas(canvas, itemDesc) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w * 0.5, h * 0.5);

    const t = itemDesc.type || '';
    if (t === 'sunglasses') {
        ctx.fillStyle = '#090a0f';
        ctx.rotate(-0.15);
        ctx.fillRect(-38, -10, 76, 5);
        ctx.beginPath();
        ctx.roundRect(-36, -8, 30, 20, 4);
        ctx.roundRect(6, -8, 30, 20, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(-30, -4, 9, 5);
        ctx.fillRect(12, -4, 9, 5);
    } else if (t === 'hair_brown') {
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
    } else if (t === 'hair_ponytail' || t === 'hair_long_tail') {
        ctx.fillStyle = '#333947';
        ctx.beginPath();
        ctx.arc(-4, -8, 24, Math.PI, 0);
        ctx.lineTo(24, 26);
        ctx.quadraticCurveTo(4, 10, -24, 24);
        ctx.closePath();
        ctx.fill();
    } else if (t === 'joy_mask') {
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.roundRect(-28, -32, 56, 64, 16);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-11, -6, 7, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(11, -6, 7, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-15, 4, 6, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(15, 4, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (t === 'pose_v' || t === 'pose_monkey' || t === 'pose_pogo') {
        // Silhouette emote figure (like Screenshots 3 & 4)
        ctx.fillStyle = '#d1d5db';
        if (t === 'pose_v') {
            ctx.rotate(-0.45);
        }
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
    } else if (t === 'tornado') {
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
    } else {
        // Outfit mannequin (like Ripped Black Jeans or Limbus Company suit)
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(-12, -26, 24, 24);
        ctx.fillStyle = t === 'shirt_limbus' ? '#1f242d' : '#f3f4f6';
        ctx.fillRect(-16, -2, 32, 22);
        if (t === 'shirt_limbus') {
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 2;
            ctx.strokeRect(-14, 0, 28, 18);
        }
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
            items.push({ name: h.name, price: `${h.price} B$`, type: h.id, shopId: h.id });
        }
        if (outfit.face && typeof SHOP_ITEM_MAP !== 'undefined' && SHOP_ITEM_MAP[outfit.face]) {
            const f = SHOP_ITEM_MAP[outfit.face];
            items.push({ name: f.name, price: `${f.price} B$`, type: f.id, shopId: f.id });
        }
        if (outfit.shirt && typeof SHOP_ITEM_MAP !== 'undefined' && SHOP_ITEM_MAP[outfit.shirt]) {
            const s = SHOP_ITEM_MAP[outfit.shirt];
            items.push({ name: s.name, price: `${s.price} B$`, type: s.id, shopId: s.id });
        }
        if (outfit.pants && typeof SHOP_ITEM_MAP !== 'undefined' && SHOP_ITEM_MAP[outfit.pants]) {
            const p = SHOP_ITEM_MAP[outfit.pants];
            items.push({ name: p.name, price: `${p.price} B$`, type: p.id, shopId: p.id });
        }
        if (items.length === 0) {
            items.push({ name: 'Základní Noob Styl', price: '0 B$', type: 'classic_noob' });
        }
        return items;
    }

    if (profile.customWearing) return profile.customWearing;

    const items = [];
    if (profile.outfit && typeof SHOP_ITEM_MAP !== 'undefined') {
        if (profile.outfit.hat && SHOP_ITEM_MAP[profile.outfit.hat]) {
            const h = SHOP_ITEM_MAP[profile.outfit.hat];
            items.push({ name: h.name, price: `${h.price} B$`, type: h.id, shopId: h.id });
        }
        if (profile.outfit.face && SHOP_ITEM_MAP[profile.outfit.face]) {
            const f = SHOP_ITEM_MAP[profile.outfit.face];
            items.push({ name: f.name, price: `${f.price} B$`, type: f.id, shopId: f.id });
        }
        if (profile.outfit.shirt && SHOP_ITEM_MAP[profile.outfit.shirt]) {
            const s = SHOP_ITEM_MAP[profile.outfit.shirt];
            items.push({ name: s.name, price: `${s.price} B$`, type: s.id, shopId: s.id });
        }
        if (profile.outfit.pants && SHOP_ITEM_MAP[profile.outfit.pants]) {
            const p = SHOP_ITEM_MAP[profile.outfit.pants];
            items.push({ name: p.name, price: `${p.price} B$`, type: p.id, shopId: p.id });
        }
    }
    if (items.length === 0) {
        items.push({ name: `${profile.username || profile.displayName}'s Signature Outfit`, price: '50 B$', type: 'jeans_outfit' });
    }
    return items;
}

function renderPortalProfileView() {
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

    const fCount = profile.isLocal ? friendsSet.size : (profile.friendsCount || 0);
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
            const presence = liveFriendsPresence[profile.id] || liveFriendsPresence[(profile.username || '').toLowerCase()] || {};
            const isPlaying = isFriend && presence.inGame && presence.gameId;

            let friendButtonsHtml = '';
            let joinBtnHtml = '';

            if (isPlaying) {
                const gameTitle = presence.gameTitle || presence.gameId;
                joinBtnHtml = `
                    <button type="button" onclick="joinFriendGame('${presence.gameId}', '${presence.roomCode || ''}')" class="px-4 py-2 rounded-lg bg-[#00B06F] hover:bg-[#009E63] text-xs sm:text-sm font-bold text-white shadow transition flex items-center gap-1.5 animate-pulse" title="Připojit se ke hře">
                        <span>🎮</span>
                        <span>Připojit se ke hře</span>
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
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="cancelFriendRequest('${profile.id}')" class="px-3.5 py-2 rounded-lg bg-[#2C2F33] hover:bg-red-600/80 text-xs sm:text-sm font-bold text-gray-200 hover:text-white border border-white/10 transition" title="Kliknutím zrušíš žádost">
                            Žádost odeslána ⏳
                        </button>
                        <button type="button" onclick="forceAddFriendDirectly('${profile.id}')" class="px-3.5 py-2 rounded-lg bg-[#00A2FF]/20 hover:bg-[#00A2FF] text-[#00A2FF] hover:text-white border border-[#00A2FF]/40 text-xs sm:text-sm font-bold transition whitespace-nowrap" title="Přidat do přátel rovnou bez čekání">
                            + Přidat hned
                        </button>
                    </div>
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

            card.innerHTML = `
                <div>
                    <div class="aspect-square rounded-xl bg-[#2C2F33] group-hover:bg-[#35383D] border border-white/5 flex items-center justify-center overflow-hidden transition">
                        <canvas id="${cid}" width="120" height="120" class="w-full h-full object-contain"></canvas>
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

            const c = document.getElementById(cid);
            drawWearingItemCardCanvas(c, it);
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
    const outfitToUse = profile.isLocal ? avatarOutfit : (profile.outfit || null);
    const torsoHexToUse = profile.isLocal ? avatarTorsoHex : (profile.torsoHex || '#181A1E');
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
    if (friendsSet.has(playerId)) {
        friendsSet.delete(playerId);
        removeCachedFriendProfile(playerId);
        if (typeof showHudToast === 'function') {
            showHudToast(`${pName} byl odebrán z přátel.`, 'blue');
        }
    } else {
        friendsSet.add(playerId);
        saveCachedFriendProfile(player);
        if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();
        if (typeof showHudToast === 'function') {
            showHudToast(`👥 ${pName} byl přidán do přátel!`, 'green');
        }
    }
    saveFriendsList();
    renderHomeFriendsStrip();
    if (activePortalSection === 'profile') renderPortalProfileView();
    if (activePortalSection === 'people') renderPeopleResultsGrid();
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
    const bVal = sanitizeTextClient(document.getElementById('edit-profile-bio')?.value || '', 160);
    localStorage.setItem('boblox_custom_bio_v1', bVal || 'No bio yet');

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

                row.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-[#232527] border border-[#393B3D] flex items-center justify-center shrink-0">
                            <svg class="w-5 h-5 text-[#FFE066]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                        <div class="text-xs sm:text-sm font-extrabold text-[#00B06F] font-mono">+${Number(tx.amount || 0).toLocaleString('cs-CZ')} B$</div>
                        <div class="text-[10px] text-gray-400 font-semibold">Získáno</div>
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
        let tagText = 'Zobrazit profil';
        let tagClass = 'text-gray-400';
        if (isFriend) {
            tagText = 'Přítel ✓';
            tagClass = 'text-[#00A2FF] font-bold';
        } else if (isReceived) {
            tagText = 'Žádost o přátelství';
            tagClass = 'text-[#00B06F] font-bold';
        } else if (isSent) {
            tagText = 'Žádost odeslána ⏳';
            tagClass = 'text-yellow-400';
        }
        const pName = p.username || p.displayName;
        row.innerHTML = `
            <div class="flex items-center gap-2.5 min-w-0">
                <canvas id="${cid}" width="40" height="40" class="w-8 h-8 rounded-full bg-[#191B1D] shrink-0"></canvas>
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
    if (reqContainer && reqList) {
        if (incomingEntries.length > 0) {
            reqContainer.classList.remove('hidden');
            if (reqBadge) reqBadge.textContent = String(incomingEntries.length);
            reqList.innerHTML = '';
            incomingEntries.forEach(([senderId, req]) => {
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
        const u = (p.username || p.displayName || p.id || '').toLowerCase();
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
        const presence = liveFriendsPresence[p.id] || liveFriendsPresence[(p.username || '').toLowerCase()] || {};
        const isPlaying = isFriend && presence.inGame && presence.gameId;

        const card = document.createElement('div');
        card.className = 'bg-[#232527] border border-[#2C2F33] hover:border-[#393B3D] rounded-xl p-4 flex flex-col justify-between gap-4 shadow transition';
        const cid = `people-res-canvas-${idx}`;

        const badgeHtml = isFriend
            ? `<div class="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#00A2FF] border-2 border-[#232527] flex items-center justify-center text-white">
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                       <circle cx="12" cy="8" r="3.5"/><path stroke-linecap="round" d="M5 19c0-3 3.1-5 7-5s7 2 7 5"/>
                   </svg>
               </div>`
            : '';

        let statusLine = '';
        if (isPlaying) {
            statusLine = `<div class="text-[11px] text-[#00B06F] font-semibold flex items-center gap-1 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-[#00B06F] animate-pulse"></span>
                <span>Hraje: ${escapeHtml(presence.gameTitle || presence.gameId)}</span>
            </div>`;
        } else if (isFriend) {
            statusLine = `<div class="text-[11px] text-gray-300 flex items-center gap-1 mt-0.5">
                <span>👥</span>
                <span>Přítel</span>
            </div>`;
        } else {
            statusLine = `<div class="text-[11px] text-gray-400 mt-0.5">${p.status === 'online' ? 'Online' : 'Offline'}</div>`;
        }

        let actionBtnHtml = '';
        if (isFriend) {
            let joinBtn = '';
            if (isPlaying) {
                joinBtn = `
                    <button type="button" onclick="joinFriendGame('${presence.gameId}', '${presence.roomCode || ''}')" class="py-2 px-3 rounded-lg bg-[#00B06F] hover:bg-[#009E63] text-xs font-bold text-white shadow transition flex items-center justify-center gap-1 animate-pulse" title="Připojit se ke hře">
                        <span>🎮</span>
                        <span>Hrát</span>
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
                <div class="flex items-center gap-1.5">
                    <button type="button" onclick="cancelFriendRequest('${p.id}')" class="flex-1 py-2 rounded-lg bg-[#2C2F33] hover:bg-red-600/80 text-xs font-bold text-gray-300 hover:text-white transition" title="Kliknutím zrušíš žádost">
                        Čeká ⏳
                    </button>
                    <button type="button" onclick="forceAddFriendDirectly('${p.id}')" class="px-2.5 py-2 rounded-lg bg-[#00A2FF]/20 hover:bg-[#00A2FF] text-[#00A2FF] hover:text-white border border-[#00A2FF]/40 text-xs font-bold transition whitespace-nowrap" title="Přidat do přátel ihned">
                        + Přidat hned
                    </button>
                </div>
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
const lobbyDirectMessages = {};

function toggleLobbyChatDrawer(forceState) {
    const body = document.getElementById('lobby-chat-drawer-body');
    if (!body) return;
    const isHidden = body.classList.contains('hidden');
    const nextOpen = typeof forceState === 'boolean' ? forceState : isHidden;
    body.classList.toggle('hidden', !nextOpen);
    body.classList.toggle('flex', nextOpen);
    if (nextOpen) {
        renderLobbyDirectChatMessages();
        setTimeout(() => document.getElementById('lobby-chat-input')?.focus(), 30);
    }
}

function openBottomChatWithPlayer(playerId) {
    activeLobbyChatPartnerId = playerId;
    toggleLobbyChatDrawer(true);
}

function renderLobbyDirectChatMessages() {
    const partner = getPlayerById(activeLobbyChatPartnerId);
    const titleEl = document.getElementById('lobby-chat-active-partner');
    const listEl = document.getElementById('lobby-chat-messages-list');
    if (titleEl) titleEl.textContent = `Chat • ${partner.displayName}`;
    if (!listEl) return;

    const msgs = lobbyDirectMessages[activeLobbyChatPartnerId] || [];
    listEl.innerHTML = '';

    if (msgs.length === 0) {
        listEl.innerHTML = `<div class="text-gray-400 text-center py-4">Napiš první zprávu hráči <strong>${escapeHtml(partner.displayName)}</strong>!</div>`;
        return;
    }

    msgs.forEach(m => {
        const row = document.createElement('div');
        row.className = m.isMe ? 'flex flex-col items-end' : 'flex flex-col items-start';
        const bubble = document.createElement('div');
        bubble.className = m.isMe
            ? 'px-3 py-1.5 rounded-xl bg-[#00A2FF] text-white max-w-[85%] break-words'
            : 'px-3 py-1.5 rounded-xl bg-[#2C2F33] text-gray-100 max-w-[85%] break-words';
        bubble.textContent = m.text;
        row.appendChild(bubble);
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

    if (!lobbyDirectMessages[activeLobbyChatPartnerId]) {
        lobbyDirectMessages[activeLobbyChatPartnerId] = [];
    }
    lobbyDirectMessages[activeLobbyChatPartnerId].push({
        from: getLocalRobloxPlayerProfile().displayName,
        text: clean,
        isMe: true
    });
    renderLobbyDirectChatMessages();

    // Also broadcast over P2P if connected
    const myProfile = getLocalRobloxPlayerProfile();
    if (typeof sendMultiplayerPacket === 'function') {
        sendMultiplayerPacket({
            type: 'chatMessage',
            id: mpState.myId,
            nickname: myProfile.displayName,
            text: clean,
            gameMode: activeGameMode
        });
    }

    // Friendly simulated reply from preset friend
    const partner = getPlayerById(activeLobbyChatPartnerId);
    setTimeout(() => {
        const replies = [
            'Super, pojďme do hry! 🎮',
            'Jasně, připoj se ke mně přes veřejný matchmaking!',
            'Dobrý nápad! 👍',
            'Haha, přesně tak! 😄'
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        lobbyDirectMessages[activeLobbyChatPartnerId].push({
            from: partner.displayName,
            text: reply,
            isMe: false
        });
        renderLobbyDirectChatMessages();
    }, 900);
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
    });
} else {
    setTimeout(() => {
        sanitizeStoredFriends();
        refreshPortalAvatarVisuals();
    }, 0);
}



