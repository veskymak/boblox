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
    const rawName = (authState && authState.user && authState.user.username)
        ? authState.user.username
        : (typeof mpState !== 'undefined' && mpState.nickname ? mpState.nickname : 'Vendeez');
    const displayName = rawName;
    const handle = authState && authState.user && authState.user.username
        ? `@${authState.user.username}`
        : '@RusticOdpadlik';
    return {
        id: 'local',
        displayName,
        handle,
        torsoHex: avatarTorsoHex || '#1e293b',
        outfit: typeof avatarOutfit !== 'undefined' ? avatarOutfit : null,
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


