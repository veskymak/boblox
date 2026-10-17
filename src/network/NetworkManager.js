/* ============================================================================
 * 2C. GLOBAL MATCHMAKING (DEFAULT) vs. PRIVATE PARTY (6-DIGIT CODE) + LIVE PLAYERS
 * ============================================================================ */
const mpState = {
    mode: 'public', // 'public' (Default Global Matchmaking) | 'private' (6-digit code for friends)
    peer: null,
    ws: null,
    bc: typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('boblox_live_presence_v2') : null,
    isHost: false,
    roomCode: '',
    nickname: localStorage.getItem('boblox_mp_nick') || 'Guest',
    myId: 'peer_' + Math.random().toString(36).slice(2, 10),
    connections: [], // Active PeerJS DataConnections
    remotePlayers: {}, // peerId -> { id, nickname, torsoHex, outfit, weaponId, disguiseId, gameMode, pos, targetPos, rotY, walkCycle, onGround, attackTimer, meshData, lastSeen }
    localTabPeers: {}, // tabId -> { gameId, lastSeen }
    syncTimer: 0
};

function setMatchmakingMode(mode) {
    mpState.mode = mode === 'private' ? 'private' : 'public';
    const isPub = mpState.mode === 'public';

    // Update Game Detail Modal tabs
    const mmPub = document.getElementById('mm-tab-public');
    const mmPriv = document.getElementById('mm-tab-private');
    const privBox = document.getElementById('modal-private-party-box');
    const mmDesc = document.getElementById('modal-mm-desc');
    const playInd = document.getElementById('modal-play-mode-indicator');
    const playBtnTxt = document.getElementById('modal-play-btn-text');

    if (mmPub && mmPriv) {
        mmPub.className = isPub
            ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00B06F] text-white transition'
            : 'px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition';
        mmPriv.className = !isPub
            ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00A2FF] text-white transition'
            : 'px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition';
    }
    if (privBox) {
        privBox.classList.toggle('hidden', isPub);
        privBox.classList.toggle('grid', !isPub);
    }
    if (mmDesc) {
        mmDesc.textContent = isPub
            ? 'Automatické spárování s hráči ve veřejném globálním poolu bez zadávání kódu.'
            : 'Soukromá párty pouze pro přátele přes unikátní 6místný kód.';
    }
    if (playInd) {
        playInd.textContent = isPub
            ? 'Spustí hru ve veřejném globálním matchmakingu'
            : (mpState.roomCode ? `Spustí hru v soukromé párty (Kód: ${mpState.roomCode})` : 'Spustí soukromou párty pro kamarády (6místný kód)');
    }
    if (playBtnTxt) {
        playBtnTxt.textContent = isPub ? 'HRÁT VEŘEJNĚ' : 'HRÁT S PŘÁTELI';
    }

    // Update Multiplayer Modal tabs
    const mpModalPub = document.getElementById('mp-modal-tab-public');
    const mpModalPriv = document.getElementById('mp-modal-tab-private');
    const mpPubPanel = document.getElementById('mp-public-panel');
    const mpPrivPanel = document.getElementById('mp-private-panel');

    if (mpModalPub && mpModalPriv) {
        mpModalPub.className = isPub
            ? 'py-2 px-3 rounded-lg text-xs font-bold bg-[#00B06F] text-white transition'
            : 'py-2 px-3 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition';
        mpModalPriv.className = !isPub
            ? 'py-2 px-3 rounded-lg text-xs font-bold bg-[#00A2FF] text-white transition'
            : 'py-2 px-3 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition';
    }
    if (mpPubPanel) mpPubPanel.classList.toggle('hidden', !isPub);
    if (mpPrivPanel) {
        mpPrivPanel.classList.toggle('hidden', isPub);
        mpPrivPanel.classList.toggle('grid', !isPub);
    }

    updateMpCounters();
    sendWsPresence();
}

function openMultiplayerModal() {
    if (document.pointerLockElement) document.exitPointerLock();
    setMatchmakingMode(mpState.mode);
    const modal = document.getElementById('multiplayer-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeMultiplayerModal() {
    const modal = document.getElementById('multiplayer-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function updateNickname(val) {
    const clean = (val || '').trim().slice(0, 20) || 'Noob_CZ';
    mpState.nickname = clean;
    localStorage.setItem('boblox_mp_nick', clean);
    const navName = document.getElementById('nav-player-name');
    if (navName) navName.textContent = clean;
    const bannerName = document.getElementById('banner-player-name');
    if (bannerName && !authState.user) bannerName.textContent = clean;
}

function copyRoomCode() {
    if (!mpState.roomCode) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mpState.roomCode).catch(() => {});
    }
    sfx.playCoin();
    showHudToast(`6místný kód ${mpState.roomCode} zkopírován! Pošli ho kamarádům.`, 'green');
}

// Strict 6-character code generator for Private Party
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Automatically joins the public global matchmaking pool for a given gameId (no code needed!)
function connectGlobalPublicMatchmaking(gameId) {
    mpState.mode = 'public';
    mpState.roomCode = `PUB_${gameId.toUpperCase()}`;
    sendWsPresence();

    if (typeof Peer === 'undefined') return;
    if (mpState.peer) mpState.peer.destroy();
    mpState.connections = [];

    // Deterministic public broker room ID: first player becomes public lobby host, others auto-join!
    const publicRoomPeerId = `boblox-cz-pub-pool-v2-${gameId}`;
    const tryHostPeer = new Peer(publicRoomPeerId);
    mpState.peer = tryHostPeer;

    tryHostPeer.on('open', (id) => {
        mpState.myId = id;
        mpState.isHost = true;
        updateMpCounters();
        sendWsPresence();
    });

    tryHostPeer.on('connection', (conn) => {
        setupPeerConnection(conn);
    });

    tryHostPeer.on('error', (err) => {
        // If publicRoomPeerId is already taken ('unavailable-id'), a public room is already active -> auto-connect as client!
        if (err && err.type === 'unavailable-id') {
            const clientPeer = new Peer();
            mpState.peer = clientPeer;
            mpState.isHost = false;
            clientPeer.on('open', (id) => {
                mpState.myId = id;
                const conn = clientPeer.connect(publicRoomPeerId, { reliable: false });
                setupPeerConnection(conn);
                sendWsPresence();
            });
        }
    });
}

function hostMultiplayerRoom() {
    setMatchmakingMode('private');
    const code = generateRoomCode(); // 6-digit code
    mpState.roomCode = code;
    mpState.isHost = true;

    const hostCodeModalEl = document.getElementById('modal-party-host-code');
    if (hostCodeModalEl) hostCodeModalEl.textContent = code;
    const box = document.getElementById('mp-room-code-box');
    if (box) {
        box.classList.remove('hidden');
        box.classList.add('flex');
    }
    const codeDisp = document.getElementById('mp-room-code-display');
    if (codeDisp) codeDisp.textContent = code;

    const statusEl = document.getElementById('mp-status-badge');
    if (statusEl) {
        statusEl.textContent = `Hostuješ soukromou párty (${code})`;
        statusEl.className = 'text-xs font-bold text-[#00B06F]';
    }

    sendWsPresence();

    if (typeof Peer === 'undefined') return;
    if (mpState.peer) mpState.peer.destroy();
    mpState.connections = [];

    const fullPeerId = `boblox-cz-party6-${code}`;
    const peer = new Peer(fullPeerId);
    mpState.peer = peer;

    peer.on('open', (id) => {
        mpState.myId = id;
        updateMpCounters();
        sfx.playWinFanfare();
        showHudToast(`Soukromá párty ${code} vytvořena! Pošli 6místný kód přátelům.`, 'green');
    });

    peer.on('connection', (conn) => {
        setupPeerConnection(conn);
    });
}

function joinMultiplayerRoomFromModal() {
    const val = document.getElementById('modal-party-join-input')?.value || '';
    const mainInput = document.getElementById('mp-join-code-input');
    if (mainInput) mainInput.value = val;
    joinMultiplayerRoom(val);
}

function joinMultiplayerRoom(overrideCode) {
    const rawInput = (overrideCode || document.getElementById('mp-join-code-input')?.value || '').trim().toUpperCase();
    if (rawInput.length !== 6) {
        showHudToast('Zadej platný 6místný kód soukromé párty (např. K7X9P2)!', 'red');
        return;
    }

    setMatchmakingMode('private');
    mpState.isHost = false;
    mpState.roomCode = rawInput;

    const statusEl = document.getElementById('mp-status-badge');
    if (statusEl) {
        statusEl.textContent = `Připojuji se k párty ${rawInput}...`;
        statusEl.className = 'text-xs font-bold text-[#FFE066]';
    }

    sendWsPresence();

    if (typeof Peer === 'undefined') return;
    if (mpState.peer) mpState.peer.destroy();
    mpState.connections = [];

    const peer = new Peer();
    mpState.peer = peer;

    peer.on('open', (id) => {
        mpState.myId = id;
        const hostConn = peer.connect(`boblox-cz-party6-${rawInput}`, { reliable: false });
        setupPeerConnection(hostConn);
    });

    peer.on('error', () => {
        if (statusEl) {
            statusEl.textContent = 'Párty nenalezena nebo kamarád není online!';
            statusEl.className = 'text-xs font-bold text-red-400';
        }
    });
}

function setupPeerConnection(conn) {
    conn.on('open', () => {
        if (!mpState.connections.includes(conn)) {
            mpState.connections.push(conn);
        }
        const statusEl = document.getElementById('mp-status-badge');
        if (statusEl) {
            statusEl.textContent = mpState.mode === 'public'
                ? `Globální Pool (${mpState.connections.length + 1} hráčů ve hře)`
                : `Párty ${mpState.roomCode} (${mpState.connections.length + 1} hráčů)`;
            statusEl.className = 'text-xs font-bold text-[#00B06F]';
        }
        updateMpCounters();
        sfx.playCoin();
        showHudToast(mpState.mode === 'public' ? 'Hráč se připojil z globálního matchmakingu!' : 'Kamarád se připojil do párty!', 'green');

        if (mpState.isHost && activeGameMode) {
            conn.send({ type: 'hostGameSelect', gameMode: activeGameMode });
        }
    });

    conn.on('data', (data) => {
        handleMultiplayerPacket(data, conn);
    });

    conn.on('close', () => {
        mpState.connections = mpState.connections.filter(c => c !== conn);
        removeRemotePlayer(conn.peer);
        updateMpCounters();
    });
}

// WebSocket & BroadcastChannel Live Presence + Matchmaking Relay
function initLiveSocketAndPresence() {
    if (mpState.bc) {
        mpState.bc.onmessage = (ev) => {
            const data = ev.data;
            if (!data) return;
            if (data.type === 'tabHeartbeat' && data.tabId !== mpState.myId) {
                mpState.localTabPeers[data.tabId] = { gameId: data.gameId, lastSeen: Date.now() };
                recomputeLivePlayerCounts();
            } else if ((data.type === 'playerState' || data.type === 'weaponSwitch' || data.type === 'chatMessage') && data.id !== mpState.myId) {
                const samePublic = mpState.mode === 'public' && data.mode === 'public' && activeGameMode && data.gameMode === activeGameMode;
                const samePrivate = mpState.mode === 'private' && data.mode === 'private' && mpState.roomCode && data.roomCode === mpState.roomCode;
                if (samePublic || samePrivate) {
                    handleMultiplayerPacket(data, null);
                }
            }
        };
    }

    setInterval(() => {
        if (mpState.bc) {
            mpState.bc.postMessage({
                type: 'tabHeartbeat',
                tabId: mpState.myId,
                gameId: activeGameMode || null
            });
        }
        recomputeLivePlayerCounts();
    }, 2500);

    if (!isStaticHostingWithoutBackend() && (location.protocol === 'http:' || location.protocol === 'https:')) {
        try {
            let wsUrl;
            if (CUSTOM_API_BASE) {
                wsUrl = CUSTOM_API_BASE.replace(/^http/i, 'ws') + '/ws';
            } else {
                const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
                wsUrl = `${wsProto}//${location.host}/ws`;
            }
            const ws = new WebSocket(wsUrl);
            mpState.ws = ws;

            ws.onopen = () => {
                authState.backendConnected = true;
                updateAuthUI();
                sendWsPresence();
            };

            ws.onmessage = (ev) => {
                let msg;
                try { msg = JSON.parse(ev.data); } catch { return; }
                if (!msg) return;

                if (msg.type === 'welcome' || msg.type === 'onlineStats') {
                    if (typeof msg.serverTime === 'number') {
                        serverTimeOffsetMs = msg.serverTime - Date.now();
                    }
                    if (typeof msg.totalOnline === 'number') {
                        liveSocialState.totalOnline = Math.max(1, msg.totalOnline);
                        liveSocialState.perGameOnline = msg.perGame || {};
                        refreshOnlineCounterDOM();
                    }
                } else if (msg.type === 'peerLeft' && msg.id) {
                    removeRemotePlayer(msg.id);
                } else if (msg.type === 'playerState' || msg.type === 'weaponSwitch' || msg.type === 'hostGameSelect' || msg.type === 'chatMessage') {
                    handleMultiplayerPacket(msg, null);
                }
            };

            ws.onclose = () => {
                mpState.ws = null;
            };
        } catch {}
    }
}

function sendWsPresence() {
    if (mpState.ws && mpState.ws.readyState === 1) {
        mpState.ws.send(JSON.stringify({
            type: 'presence',
            username: mpState.nickname,
            peerId: mpState.myId,
            gameId: activeGameMode || null,
            mode: mpState.mode,
            roomCode: mpState.roomCode || null,
            isHost: mpState.isHost
        }));
    }
    recomputeLivePlayerCounts();
}

function recomputeLivePlayerCounts() {
    if (mpState.ws && mpState.ws.readyState === 1) {
        return; // Managed by live server broadcast
    }
    const now = Date.now();
    const perGame = {};
    GAMES_CATALOG.forEach(g => { perGame[g.id] = 0; });
    let total = 1; // Local player

    if (activeGameMode && perGame[activeGameMode] !== undefined) {
        perGame[activeGameMode]++;
    }

    // Count active BroadcastChannel tabs
    Object.keys(mpState.localTabPeers).forEach(tid => {
        const info = mpState.localTabPeers[tid];
        if (now - info.lastSeen > 7000) {
            delete mpState.localTabPeers[tid];
            return;
        }
        total++;
        if (info.gameId && perGame[info.gameId] !== undefined) {
            perGame[info.gameId]++;
        }
    });

    // Count active WebRTC peers not already counted
    Object.values(mpState.remotePlayers).forEach(rp => {
        if (performance.now() - rp.lastSeen <= 8000 && !mpState.localTabPeers[rp.id]) {
            total++;
            if (rp.gameMode && perGame[rp.gameMode] !== undefined) {
                perGame[rp.gameMode]++;
            }
        }
    });

    liveSocialState.totalOnline = total;
    liveSocialState.perGameOnline = perGame;
    refreshOnlineCounterDOM();
}

function refreshOnlineCounterDOM() {
    const bannerOnline = document.getElementById('banner-online-count');
    if (bannerOnline) bannerOnline.textContent = String(liveSocialState.totalOnline);

    GAMES_CATALOG.forEach(g => {
        const cardCounter = document.getElementById(`card-online-${g.id}`);
        const cnt = liveSocialState.perGameOnline[g.id] || 0;
        if (cardCounter) cardCounter.textContent = `${cnt} ve hře`;
    });

    if (selectedGameId) {
        const modalPlayers = document.getElementById('modal-game-players');
        const cnt = liveSocialState.perGameOnline[selectedGameId] || 0;
        if (modalPlayers) modalPlayers.textContent = `${cnt} aktivních hráčů`;
    }
}

function updateMpCounters() {
    const remoteCount = Object.values(mpState.remotePlayers).filter(rp => performance.now() - rp.lastSeen < 8000).length;
    const count = Math.max(mpState.connections.length, remoteCount) + 1;
    const navBadge = document.getElementById('mp-nav-count');
    const hudBadge = document.getElementById('hud-mp-status');
    const modeText = mpState.mode === 'private' && mpState.roomCode ? `Párty ${mpState.roomCode}` : 'Globální';
    if (navBadge) navBadge.textContent = count > 1 ? `${count} Hráčů (${modeText})` : modeText;
    if (hudBadge) hudBadge.textContent = count > 1 ? `${count} Hráčů (${modeText})` : modeText;
    if (typeof renderRobloxTopRightPlayerList === 'function') {
        renderRobloxTopRightPlayerList();
    }
    if (typeof robloxUiState !== 'undefined' && robloxUiState.isMenuOpen && typeof renderRobloxPeopleList === 'function') {
        renderRobloxPeopleList();
    }
    recomputeLivePlayerCounts();
}

function createNameplateSprite(nameText) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fillRect(18, 10, 220, 44);
    ctx.strokeStyle = '#00A2FF';
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 10, 220, 44);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(nameText || 'Hráč').slice(0, 15), 128, 32);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(4.5, 1.15, 1);
    sprite.position.set(0, 4.55, 0);
    return sprite;
}

function handleMultiplayerPacket(packet, sourceConn) {
    if (!packet || !packet.type) return;

    if (mpState.isHost && sourceConn) {
        mpState.connections.forEach(c => {
            if (c !== sourceConn && c.open) c.send(packet);
        });
    }

    if (packet.type === 'hostGameSelect' && packet.gameMode) {
        if (activeGameMode !== packet.gameMode) {
            showHudToast(`Hostitel spustil hru: ${packet.gameMode.toUpperCase()}! Připojuji...`, 'blue');
            startGame(packet.gameMode);
        }
        return;
    }

    if (packet.type === 'chatMessage' && packet.id !== mpState.myId && packet.text) {
        const cleanSender = sanitizeTextClient(packet.nickname || 'Hráč', 16);
        const cleanMsg = sanitizeTextClient(packet.text, 160);
        if (typeof appendRobloxChatMessage === 'function') {
            appendRobloxChatMessage(cleanSender, cleanMsg);
        }
        const rp = mpState.remotePlayers[packet.id];
        if (rp) {
            if (rp.meshData && typeof spawnChatBubbleOnAvatar === 'function') {
                spawnChatBubbleOnAvatar(rp.meshData, cleanMsg, false);
            } else {
                if (!Array.isArray(rp.pendingBubbles)) rp.pendingBubbles = [];
                rp.pendingBubbles.push(cleanMsg);
            }
        }
        return;
    }

    if (packet.type === 'weaponSwitch' && packet.id && packet.id !== mpState.myId) {
        const rp = mpState.remotePlayers[packet.id];
        if (rp) {
            rp.weaponId = packet.weaponId || 'none';
            if (rp.meshData) {
                setCharacterWeaponMesh(rp.meshData, rp.weaponId);
            }
        }
        return;
    }

    if (packet.type === 'playerState' && packet.id && packet.id !== mpState.myId) {
        let rp = mpState.remotePlayers[packet.id];
        if (!rp) {
            rp = {
                id: packet.id,
                nickname: sanitizeTextClient(packet.nickname || 'Hráč', 16),
                torsoHex: packet.torsoHex || '#0D69AC',
                weaponId: packet.weaponId || 'none',
                disguiseId: packet.disguiseId || null,
                gameMode: packet.gameMode,
                pos: new THREE.Vector3(packet.x || 0, packet.y || 3, packet.z || 0),
                targetPos: new THREE.Vector3(packet.x || 0, packet.y || 3, packet.z || 0),
                rotY: packet.rotY || 0,
                walkCycle: packet.walkCycle || 0,
                onGround: packet.onGround !== false,
                attackTimer: packet.attackTimer || 0,
                meshData: null,
                lastSeen: performance.now()
            };
            mpState.remotePlayers[packet.id] = rp;
            updateMpCounters();
        }

        rp.nickname = sanitizeTextClient(packet.nickname || rp.nickname, 16);
        const nextOutfit = sanitizeOutfit(packet.outfit);
        const nextLookKey = JSON.stringify(nextOutfit) + '|' + (packet.torsoHex || rp.torsoHex);
        if (rp.lookKey !== nextLookKey) {
            rp.lookKey = nextLookKey;
            rp.outfit = nextOutfit;
            rp.torsoHex = packet.torsoHex || rp.torsoHex;
            if (rp.meshData && scene) {
                scene.remove(rp.meshData.root);
                rp.meshData = null;
            }
        }
        rp.gameMode = packet.gameMode;
        rp.targetPos.set(packet.x, packet.y, packet.z);
        rp.rotY = packet.rotY;
        rp.walkCycle = packet.walkCycle;
        rp.onGround = packet.onGround;

        if (packet.weaponId && packet.weaponId !== rp.weaponId) {
            rp.weaponId = packet.weaponId;
            if (rp.meshData) setCharacterWeaponMesh(rp.meshData, rp.weaponId);
        }

        if (packet.attackTimer > 0.1 && rp.attackTimer <= 0) {
            rp.attackTimer = 0.28;
            if ((activeGameMode === 'sfoth' || activeGameMode === 'bedwars') && rp.pos.distanceTo(playerState.pos) < 5.0) {
                const pushDir = playerState.pos.clone().sub(rp.pos).setY(0).normalize();
                playerState.knockback.add(pushDir.multiplyScalar(18));
                playerState.vel.y = 8.5;
                damagePlayer(18, `Zasažen hráčem (${rp.nickname})!`);
            }
        }
        rp.lastSeen = performance.now();
    }
}

function sendMultiplayerPacket(payload) {
    mpState.connections.forEach(c => {
        if (c.open) c.send(payload);
    });
    if (mpState.ws && mpState.ws.readyState === 1) {
        mpState.ws.send(JSON.stringify(payload));
    }
    if (mpState.bc) {
        mpState.bc.postMessage(Object.assign({}, payload, {
            mode: mpState.mode,
            roomCode: mpState.roomCode
        }));
    }
}

function broadcastLocalPlayerState(dt) {
    if (!activeGameMode) return;
    mpState.syncTimer += dt;
    if (mpState.syncTimer < 0.05) return; // 20 Hz network tick
    mpState.syncTimer = 0;

    const payload = {
        type: 'playerState',
        id: mpState.myId,
        nickname: mpState.nickname,
        torsoHex: avatarTorsoHex,
        outfit: avatarOutfit,
        weaponId: playerState.activeWeapon ? playerState.activeWeapon.id : 'none',
        gameMode: activeGameMode,
        x: Number(playerState.pos.x.toFixed(2)),
        y: Number(playerState.pos.y.toFixed(2)),
        z: Number(playerState.pos.z.toFixed(2)),
        rotY: Number((playerAvatar ? playerAvatar.root.rotation.y : 0).toFixed(2)),
        walkCycle: Number(playerState.walkCycle.toFixed(2)),
        onGround: playerState.onGround,
        attackTimer: Number(playerState.attackTimer.toFixed(2))
    };

    sendMultiplayerPacket(payload);
}

function updateRemotePlayersInScene(dt) {
    if (!scene || !activeGameMode) return;
    const now = performance.now();

    Object.keys(mpState.remotePlayers).forEach(pid => {
        const rp = mpState.remotePlayers[pid];

        if (now - rp.lastSeen > 8000 || rp.gameMode !== activeGameMode) {
            if (rp.meshData && rp.meshData.root.parent) {
                scene.remove(rp.meshData.root);
                rp.meshData = null;
            }
            return;
        }

        if (!rp.meshData) {
            rp.meshData = createBlockyCharacterMesh({
                torsoColor: new THREE.Color(rp.torsoHex).getHex(),
                outfit: rp.outfit || sanitizeOutfit(null),
                weaponId: rp.weaponId || (activeGameMode === 'sfoth' ? 'sword' : 'none')
            });
            rp.meshData.isRemoteAvatar = true;
            const badge = createNameplateSprite(rp.nickname);
            rp.meshData.root.add(badge);
            rp.meshData.root.position.copy(rp.targetPos);
            scene.add(rp.meshData.root);

            if (Array.isArray(rp.pendingBubbles) && rp.pendingBubbles.length > 0 && typeof spawnChatBubbleOnAvatar === 'function') {
                rp.pendingBubbles.forEach(txt => spawnChatBubbleOnAvatar(rp.meshData, txt, false));
                rp.pendingBubbles = [];
            }
        }

        if (typeof updateAvatarChatBubbles === 'function') {
            updateAvatarChatBubbles(rp.meshData, dt);
        }

        rp.pos.lerp(rp.targetPos, Math.min(1, dt * 15));
        rp.meshData.root.position.copy(rp.pos);
        rp.meshData.root.rotation.y = rp.rotY;

        if (!rp.onGround) {
            rp.meshData.leftLegPivot.rotation.x = -0.35;
            rp.meshData.rightLegPivot.rotation.x = 0.35;
        } else {
            const sw = Math.sin(rp.walkCycle) * 0.7;
            rp.meshData.leftLegPivot.rotation.x = sw;
            rp.meshData.rightLegPivot.rotation.x = -sw;
            rp.meshData.leftArmPivot.rotation.x = -sw * 0.75;
        }

        const hasHeldItem = rp.weaponId && rp.weaponId !== 'none';
        if (rp.attackTimer > 0) {
            rp.attackTimer -= dt;
            rp.meshData.rightArmPivot.rotation.x = 1.9 + Math.sin(rp.attackTimer * 25) * 0.9;
        } else if (hasHeldItem) {
            rp.meshData.rightArmPivot.rotation.x = 1.35 + Math.sin(rp.walkCycle) * 0.2;
        } else {
            rp.meshData.rightArmPivot.rotation.x = Math.sin(rp.walkCycle) * 0.65;
        }
    });
}

function removeRemotePlayer(peerId) {
    const rp = mpState.remotePlayers[peerId];
    if (rp && rp.meshData && scene) {
        scene.remove(rp.meshData.root);
    }
    delete mpState.remotePlayers[peerId];
    updateMpCounters();
}

