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
            ? 'tag-btn px-3 py-1.5 rounded-lg bg-[#00A2FF] text-white transition font-semibold'
            : 'tag-btn px-3 py-1.5 rounded-lg bg-[#232527] hover:bg-[#2C2F33] text-gray-300 border border-[#393B3D] transition font-semibold';
    });
    renderGameCatalog();
}

function filterCategory() {
    setFilterTag('ALL');
}

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

    filtered.forEach(game => {
        const rInfo = liveSocialState.ratingsByGame[game.id] || {};
        const ratingText = rInfo.ratingPct !== null && rInfo.ratingPct !== undefined
            ? `${rInfo.ratingPct}% (${rInfo.likes || 0})`
            : 'Nové';
        const liveOnline = liveSocialState.perGameOnline[game.id] || 0;

        const card = document.createElement('div');
        card.className = 'game-card rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between';
        card.onclick = () => openGameModal(game.id);

        card.innerHTML = `
            <div>
                <div class="relative h-40 bg-[#191B1D] overflow-hidden">
                    <canvas id="thumb-${game.id}" width="320" height="180" class="w-full h-full object-cover thumb-zoom"></canvas>
                    <span class="absolute top-2.5 left-2.5 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-black/75 text-[#00A2FF] border border-[#00A2FF]/40 backdrop-blur-sm">
                        ${escapeHtml(game.badgeText)}
                    </span>
                    <span class="absolute bottom-2.5 right-2.5 text-[11px] font-bold px-2 py-0.5 rounded bg-[#00B06F] text-white shadow">
                        ${escapeHtml(game.reward)}
                    </span>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-base text-white truncate">${escapeHtml(game.title)}</h3>
                    <p class="text-xs text-gray-400 mt-0.5 truncate">Autor: <span class="text-gray-300">${escapeHtml(game.author)}</span></p>
                    <p class="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">${escapeHtml(game.description)}</p>
                </div>
            </div>
            <div class="px-4 pb-3.5 pt-2 border-t border-[#393B3D]/60 flex items-center justify-between text-xs text-gray-300">
                <span class="flex items-center gap-1 font-semibold text-[#00B06F]">
                    👍 ${escapeHtml(ratingText)}
                </span>
                <span class="flex items-center gap-1.5 font-semibold">
                    <span class="w-2 h-2 rounded-full ${liveOnline > 0 ? 'bg-[#00B06F] animate-pulse' : 'bg-gray-500'}"></span>
                    <span id="card-online-${game.id}">${liveOnline} ve hře</span>
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
    syncAccountToServer();
}

