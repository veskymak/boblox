/* ============================================================================
 * 6. CORE 3D ENGINE, WEAPON SWITCHING SYSTEM, CAMERA ORBIT & COLLISIONS
 * ============================================================================ */
let scene = null;
let camera = null;
let renderer = null;
let animationFrameId = null;
let activeGameMode = null;

// Player state
let playerAvatar = null;
const playerState = {
    pos: new THREE.Vector3(0, 3, 0),
    vel: new THREE.Vector3(0, 0, 0),
    knockback: new THREE.Vector3(0, 0, 0),
    spawnPoint: new THREE.Vector3(0, 3, 0),
    radius: 0.75,
    height: 3.7,
    onGround: false,
    onLadder: false,
    coyoteTimer: 0,
    hp: 100,
    maxHp: 100,
    speedMultiplier: 1.0,
    jumpMultiplier: 1.0,
    walkCycle: 0,
    attackTimer: 0,
    invulnTimer: 0,
    standingPlatform: null,
    weaponLoadout: [],
    activeWeaponSlot: 0,
    activeWeapon: null,
    weaponCooldownTimer: 0,
    weaponReloadTimer: 0
};

// Complete Weapon Catalog & Per-Game Loadouts (Bugfix #7)
const WEAPON_DEFINITIONS = {
    sword: { id: 'sword', name: 'Linked Sword', icon: '⚔️', type: 'melee', damage: 35, range: 5.4, cooldown: 0.32, knockback: 22 },
    axe: { id: 'axe', name: 'Battle Axe', icon: '🪓', type: 'melee', damage: 52, range: 5.8, cooldown: 0.55, knockback: 30 },
    pistol: { id: 'pistol', name: 'Pulse Blaster', icon: '🔫', type: 'gun', damage: 28, range: 45, cooldown: 0.25, magSize: 12, ammo: 12, reloadTime: 1.2, knockback: 8 },
    shotgun: { id: 'shotgun', name: 'Heavy Shotgun', icon: '💥', type: 'gun', damage: 68, range: 22, cooldown: 0.68, magSize: 6, ammo: 6, reloadTime: 1.6, knockback: 24 },
    pickaxe: { id: 'pickaxe', name: 'Diamond Pickaxe', icon: '⛏️', type: 'tool', damage: 24, range: 6.5, cooldown: 0.30, knockback: 12 },
    block: { id: 'block', name: 'Stavební Bloky', icon: '🧱', type: 'build', damage: 0, range: 12, cooldown: 0.16, ammo: 30, magSize: 99 },
    medkit: { id: 'medkit', name: 'Medkit (+40 HP)', icon: '❤️‍🩹', type: 'heal', damage: 0, heal: 40, cooldown: 3.5, ammo: 3, magSize: 3 },
    coil_speed: { id: 'coil_speed', name: 'Speed Coil', icon: '⚡', type: 'coil', speedMult: 1.42, jumpMult: 1.0, cooldown: 0.2 },
    coil_gravity: { id: 'coil_gravity', name: 'Gravity Coil', icon: '🌀', type: 'coil', speedMult: 1.0, jumpMult: 1.42, cooldown: 0.2 },
    scanner: { id: 'scanner', name: 'Prop Scanner', icon: '📡', type: 'scanner', damage: 50, range: 9.0, cooldown: 0.45 },
    prop_crate: { id: 'prop_crate', name: 'Maska: Bedna', icon: '📦', type: 'prop', cooldown: 0.25 },
    prop_barrel: { id: 'prop_barrel', name: 'Maska: Sud', icon: '🛢️', type: 'prop', cooldown: 0.25 },
    prop_bush: { id: 'prop_bush', name: 'Maska: Keř', icon: '🌿', type: 'prop', cooldown: 0.25 },
    pet_food: { id: 'pet_food', name: 'Krmení (Hlad)', icon: '🍎', type: 'pet_care', hint: 'Klikni pro nakrmení mazlíčka (splní potřebu Hlad)', cooldown: 0.35 },
    pet_water: { id: 'pet_water', name: 'Nápoj (Žízeň)', icon: '🍼', type: 'pet_care', hint: 'Klikni pro napojení mazlíčka (splní potřebu Žízeň)', cooldown: 0.35 },
    pet_ride: { id: 'pet_ride', name: 'Fly & Ride', icon: '🦄', type: 'pet_care', hint: 'Klikni pro nasednutí / létání na mazlíčkovi (Mezerník = Létání)', cooldown: 0.35 },
    pet_switch: { id: 'pet_switch', name: 'Sbírka Mazlíčků', icon: '🥚', type: 'pet_care', hint: 'Klikni pro přepnutí aktivního mazlíčka ze své sbírky', cooldown: 0.30 },
    casino_blackjack: { id: 'casino_blackjack', name: 'Blackjack (21)', icon: '🃏', type: 'casino_ui', hint: 'Klepni pro otevření Blackjack stolu (21)', cooldown: 0.2 },
    casino_slots: { id: 'casino_slots', name: 'Automaty (Slots)', icon: '🎰', type: 'casino_ui', hint: 'Klepni pro otevření výherních automatů Lucky 7', cooldown: 0.2 },
    casino_wheel: { id: 'casino_wheel', name: 'Kolo štěstí', icon: '🎡', type: 'casino_ui', hint: 'Klepni pro otevření Denního kola štěstí', cooldown: 0.2 },
    casino_derby: { id: 'casino_derby', name: 'Dostihy (Derby)', icon: '🏇', type: 'casino_ui', hint: 'Klepni pro sázky na koňské dostihy', cooldown: 0.2 },
    casino_cashier: { id: 'casino_cashier', name: 'Pokladna & Info', icon: '🪙', type: 'casino_ui', hint: 'Klepni pro informace o kasinu a zůstatek Bobuxů', cooldown: 0.2 },
    none: { id: 'none', name: 'Volné ruce', icon: '🖐️', type: 'hand', damage: 10, range: 4.0, cooldown: 0.3 }
};

const GAME_LOADOUTS = {
    adoptme: ['pet_food', 'pet_water', 'pet_ride', 'pet_switch'],
    obby: ['none', 'coil_speed'],
    lava: ['none', 'coil_speed', 'coil_gravity'],
    sfoth: ['sword', 'axe', 'pistol', 'medkit'],
    tycoon: ['none', 'sword', 'pistol'],
    disasters: ['none', 'medkit', 'coil_speed'],
    toh: ['none', 'coil_speed', 'coil_gravity'],
    zombies: ['pistol', 'shotgun', 'sword', 'medkit'],
    speedrun: ['coil_speed', 'coil_gravity', 'none'],
    hideandseek: ['scanner', 'prop_crate', 'prop_barrel', 'prop_bush'],
    bedwars: ['sword', 'pickaxe', 'block', 'pistol'],
    casino: ['casino_blackjack', 'casino_slots', 'casino_wheel', 'casino_derby', 'casino_cashier']
};

function setupGameWeaponLoadout(gameId) {
    const ids = GAME_LOADOUTS[gameId] || ['none', 'sword'];
    playerState.weaponLoadout = ids.map(id => {
        const base = WEAPON_DEFINITIONS[id] || WEAPON_DEFINITIONS.none;
        return Object.assign({}, base);
    });
    playerState.weaponCooldownTimer = 0;
    playerState.weaponReloadTimer = 0;
    equipWeaponSlot(0, true);
}

function equipWeaponSlot(slotIdx, silent = false) {
    if (!playerState.weaponLoadout || playerState.weaponLoadout.length === 0) return;
    const count = playerState.weaponLoadout.length;
    const normalizedIdx = ((slotIdx % count) + count) % count;
    playerState.activeWeaponSlot = normalizedIdx;
    const w = playerState.weaponLoadout[normalizedIdx];
    playerState.activeWeapon = w;
    playerState.weaponReloadTimer = 0;

    // Apply passive coil speed/jump modifiers when holding a coil (unless overridden by game pickups)
    if (w.type === 'coil') {
        playerState.speedMultiplier = w.speedMult || 1.0;
        playerState.jumpMultiplier = w.jumpMult || 1.0;
    } else if (activeGameMode !== 'speedrun' && activeGameMode !== 'adoptme') {
        playerState.speedMultiplier = gameSpecificData && gameSpecificData.permSpeedMult ? gameSpecificData.permSpeedMult : 1.0;
        playerState.jumpMultiplier = gameSpecificData && gameSpecificData.permJumpMult ? gameSpecificData.permJumpMult : 1.0;
    }

    // Update 3D Weapon model on Player Avatar (hides previous model & shows new one)
    if (playerAvatar) {
        setCharacterWeaponMesh(playerAvatar, w.id);
    }

    // Synchronize active weapon immediately with all multiplayer peers
    const packet = {
        type: 'weaponSwitch',
        peerId: mpState.peer ? mpState.peer.id : 'local',
        weaponId: w.id
    };
    if (mpState.isHost) {
        mpState.connections.forEach(c => { if (c.open) c.send(packet); });
    } else if (mpState.hostConn && mpState.hostConn.open) {
        mpState.hostConn.send(packet);
    }

    if (!silent && activeGameMode) {
        sfx.playCoin();
    }
    renderHotbarUI();
}

function reloadCurrentWeapon() {
    const w = playerState.activeWeapon;
    if (!w || w.type !== 'gun') return;
    if (w.ammo >= w.magSize || playerState.weaponReloadTimer > 0) return;
    playerState.weaponReloadTimer = w.reloadTime || 1.2;
    sfx.playReload();
    showHudToast(`Přebíjení: ${w.name}...`, 'blue');
    renderHotbarUI();
}

function renderHotbarUI() {
    const container = document.getElementById('hud-hotbar-slots');
    const nameEl = document.getElementById('hud-active-weapon-name');
    const statsEl = document.getElementById('hud-active-weapon-stats');
    if (!container) return;

    container.innerHTML = '';
    playerState.weaponLoadout.forEach((w, idx) => {
        const isSelected = idx === playerState.activeWeaponSlot;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `hotbar-slot w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center relative select-none cursor-pointer transition ${isSelected ? 'active' : 'opacity-80 hover:opacity-100'}`;
        btn.onclick = (e) => {
            e.stopPropagation();
            equipWeaponSlot(idx);
        };

        const keyBadge = document.createElement('span');
        keyBadge.className = 'absolute top-1 left-1.5 text-[9px] font-bold text-gray-400';
        keyBadge.textContent = String(idx + 1);

        const iconSpan = document.createElement('span');
        iconSpan.className = 'text-base sm:text-xl leading-none';
        iconSpan.textContent = w.icon;

        const labelSpan = document.createElement('span');
        labelSpan.className = 'text-[9px] font-bold text-gray-200 mt-0.5 truncate max-w-[44px]';
        if (w.type === 'gun' || w.type === 'build' || w.type === 'heal') {
            labelSpan.textContent = `${w.ammo}/${w.magSize}`;
        } else {
            labelSpan.textContent = w.name.split(' ')[0];
        }

        btn.appendChild(keyBadge);
        btn.appendChild(iconSpan);
        btn.appendChild(labelSpan);
        container.appendChild(btn);
    });

    const active = playerState.activeWeapon;
    if (active && nameEl && statsEl) {
        nameEl.textContent = `${active.icon} ${active.name}`;
        if (playerState.weaponReloadTimer > 0) {
            statsEl.textContent = `PŘEBÍJENÍ (${playerState.weaponReloadTimer.toFixed(1)}s)`;
        } else if (active.type === 'gun') {
            statsEl.textContent = `DMG ${active.damage} • Náboje: ${active.ammo}/${active.magSize} (Klávesa F = Přebít)`;
        } else if (active.type === 'melee' || active.type === 'tool') {
            statsEl.textContent = `DMG ${active.damage} • Dosah ${active.range}m`;
        } else if (active.type === 'build') {
            statsEl.textContent = `Bloky: ${active.ammo} ks • Klikni pro stavbu`;
        } else if (active.type === 'heal') {
            statsEl.textContent = `+${active.heal} HP • Zbývá: ${active.ammo}x`;
        } else if (active.type === 'pet_care') {
            statsEl.textContent = active.hint || 'Klikni pro akci s mazlíčkem';
        } else {
            statsEl.textContent = `Aktivní vybavení [Slot ${playerState.activeWeaponSlot + 1}]`;
        }
    }
}

// Camera state
const camState = {
    yaw: 0,
    pitch: 0.38,
    distance: 14,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
};

// Input state
const keysPressed = {};

// World Colliders & Dynamic Entities
let worldBlocks = []; // Each item: { mesh, box: THREE.Box3, size, isKill, isLadder, isCheckpoint, checkpointIdx, isFinish, movingFn, prevPos, destructible, hp }
let movingBlocks = []; // Subset of worldBlocks that have movingFn
let gameSpecificData = {};

// GPU Resource Caches (Geometries, Stud Textures, Block Materials)
const geoCache = new Map();
const matCache = new Map();
const texCache = new Map();

function getCachedStudTexture(repeatX, repeatY) {
    const key = `${repeatX}_${repeatY}`;
    let tex = texCache.get(key);
    if (!tex) {
        tex = getStudTexture().clone();
        tex.needsUpdate = true;
        tex.repeat.set(repeatX, repeatY);
        tex.userData = { cachedTex: true };
        texCache.set(key, tex);
    }
    return tex;
}

function getCachedBoxGeometry(w, h, d) {
    const key = `${w}_${h}_${d}`;
    let geo = geoCache.get(key);
    if (!geo) {
        geo = new THREE.BoxGeometry(w, h, d);
        geo.userData = { cachedGeo: true };
        geoCache.set(key, geo);
    }
    return geo;
}

function getCachedBlockMaterial(colorHex, repeatX, repeatY, opts) {
    const isDynamicMat = opts.isCheckpoint || opts.uniqueMaterial;
    const key = isDynamicMat
        ? null
        : `${colorHex}_${repeatX}_${repeatY}_${!!opts.noStuds}_${opts.roughness ?? 0.45}_${opts.metalness ?? 0.05}_${opts.emissive ?? 0}_${opts.emissiveIntensity ?? 0.4}_${opts.opacity ?? 1}`;

    if (key && matCache.has(key)) {
        return matCache.get(key);
    }

    const studTex = opts.noStuds ? null : getCachedStudTexture(repeatX, repeatY);
    const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        map: studTex,
        roughness: opts.roughness !== undefined ? opts.roughness : 0.45,
        metalness: opts.metalness || 0.05,
        emissive: opts.emissive || 0x000000,
        emissiveIntensity: opts.emissiveIntensity || 0.4,
        transparent: !!opts.opacity,
        opacity: opts.opacity || 1.0
    });

    if (key) {
        mat.userData = { cachedMat: true };
        matCache.set(key, mat);
    }
    return mat;
}

// FPS Counter tracking
let fpsFrames = 0;
let fpsLastTime = performance.now();

function initThreeEngine() {
    const canvas = document.getElementById('three-canvas');
    if (!renderer) {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7dd3fc);
    scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0045);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 600);

    // Standard Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(45, 85, 55);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 220;
    const d = 65;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Build Player Blocky Avatar
    playerAvatar = createBlockyCharacterMesh({
        weaponId: playerState.activeWeapon ? playerState.activeWeapon.id : 'none'
    });

    // Attach Iconic Roblox Spawn ForceField Bubble (Glowing Blue Sphere + Sparkles, matches Screenshot 1)
    const ffGroup = new THREE.Group();
    ffGroup.position.set(0, 1.85, 0);

    // Outer translucent blue ForceField sphere
    const ffSphereGeo = new THREE.SphereGeometry(2.55, 24, 24);
    const ffSphereMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const ffSphere = new THREE.Mesh(ffSphereGeo, ffSphereMat);
    ffGroup.add(ffSphere);

    // Inner bright core rim glow sphere
    const ffInnerGeo = new THREE.SphereGeometry(2.2, 20, 20);
    const ffInnerMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.14,
        depthWrite: false
    });
    ffGroup.add(new THREE.Mesh(ffInnerGeo, ffInnerMat));

    // Ground swirl ring at feet
    const ffRingGeo = new THREE.RingGeometry(1.3, 2.05, 32);
    const ffRingMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const ffRing = new THREE.Mesh(ffRingGeo, ffRingMat);
    ffRing.rotation.x = Math.PI / 2;
    ffRing.position.y = -1.75;
    ffGroup.add(ffRing);

    // Twinkling star sparkles inside the ForceField
    const sparkles = [];
    const spGeo = new THREE.OctahedronGeometry(0.11, 0);
    for (let i = 0; i < 8; i++) {
        const spMat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0xffffff : 0xfbcfe8,
            transparent: true,
            opacity: 0.9
        });
        const sp = new THREE.Mesh(spGeo, spMat);
        const angle = (i / 8) * Math.PI * 2;
        const rad = 1.15 + (i % 3) * 0.35;
        const yOff = -0.6 + (i % 4) * 0.55;
        sp.position.set(Math.cos(angle) * rad, yOff, Math.sin(angle) * rad);
        sp.userData = { baseAngle: angle, rad, baseY: yOff, phase: i * 0.9 };
        ffGroup.add(sp);
        sparkles.push(sp);
    }

    playerAvatar.forcefieldGroup = ffGroup;
    playerAvatar.forcefieldSphereMat = ffSphereMat;
    playerAvatar.forcefieldRing = ffRing;
    playerAvatar.forcefieldSparkles = sparkles;
    playerAvatar.root.add(ffGroup);

    scene.add(playerAvatar.root);
}

function createBlock(x, y, z, w, h, d, colorHex, opts = {}) {
    const repeatX = Math.max(1, Math.round(w / 2));
    const repeatY = Math.max(1, Math.round(d / 2));

    const geo = getCachedBoxGeometry(w, h, d);
    const mat = getCachedBlockMaterial(colorHex, repeatX, repeatY, opts);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    const isHugeFloor = (w > 40 && d > 40 && h <= 2);
    mesh.castShadow = !opts.noShadow && !isHugeFloor;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const hx = w * 0.5, hy = h * 0.5, hz = d * 0.5;
    const box = new THREE.Box3(
        new THREE.Vector3(x - hx, y - hy, z - hz),
        new THREE.Vector3(x + hx, y + hy, z + hz)
    );
    const blockObj = {
        mesh,
        box,
        size: new THREE.Vector3(w, h, d),
        basePos: new THREE.Vector3(x, y, z),
        prevPos: new THREE.Vector3(x, y, z),
        isKill: !!opts.isKill,
        isLadder: !!opts.isLadder,
        isCheckpoint: !!opts.isCheckpoint,
        checkpointIdx: opts.checkpointIdx || 0,
        isFinish: !!opts.isFinish,
        isBoost: !!opts.isBoost,
        movingFn: opts.movingFn || null,
        isConveyor: !!opts.isConveyor,
        conveyorVel: opts.conveyorVel || null,
        destructible: !!opts.destructible,
        playerBuilt: !!opts.playerBuilt,
        isBed: opts.isBed || null,
        isRoof: !!opts.isRoof,
        flyingDebris: false,
        debrisVel: new THREE.Vector3()
    };

    if (!opts.decorOnly) {
        worldBlocks.push(blockObj);
        if (blockObj.movingFn) {
            movingBlocks.push(blockObj);
        }
    }
    return blockObj;
}

function cleanupCurrentGame() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (document.pointerLockElement) {
        document.exitPointerLock();
    }

    if (scene) {
        scene.traverse(obj => {
            if (obj.geometry && !obj.geometry.userData?.cachedGeo) {
                obj.geometry.dispose();
            }
            if (obj.material) {
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach(m => {
                    if (!m.userData?.cachedMat) {
                        if (m.map && m.map !== sharedStudTexture && !m.map.userData?.cachedTex) {
                            m.map.dispose();
                        }
                        m.dispose();
                    }
                });
            }
        });
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
    }

    worldBlocks = [];
    movingBlocks = [];
    if (typeof _juiceParticlePool !== 'undefined') _juiceParticlePool = [];
    if (typeof _camTargetInitialized !== 'undefined') _camTargetInitialized = false;
    if (typeof closeCasinoModal === 'function') closeCasinoModal();
    if (typeof sfx !== 'undefined' && typeof sfx.stopMusic === 'function') {
        sfx.stopMusic();
    }
    gameSpecificData = {};
    playerAvatar = null;
    Object.values(mpState.remotePlayers).forEach(rp => { rp.meshData = null; });
}

function launchSelectedGame() {
    if (!selectedGameId) return;
    const targetGameId = selectedGameId;
    closeGameModal();
    startGame(targetGameId);
}

function startGame(gameId, skipAutoMatchmaking = false) {
    cleanupCurrentGame();
    if (typeof closeRobloxEscMenu === 'function') closeRobloxEscMenu();
    activeGameMode = gameId;
    if (typeof broadcastSocialPresence === 'function') {
        broadcastSocialPresence(true);
    }

    // 1. Default Public Global Matchmaking vs. Private Party Code
    if (!skipAutoMatchmaking) {
        if (mpState.mode === 'public') {
            // Automatically connect to global matchmaking pool for this game
            connectGlobalPublicMatchmaking(gameId);
        } else if (mpState.isHost && mpState.connections.length > 0) {
            // Private party host pulls connected friends into the selected game
            mpState.connections.forEach(c => {
                if (c.open) c.send({ type: 'hostGameSelect', gameMode: gameId });
            });
        }
    }
    sendWsPresence();

    gamesPlayedCount++;
    localStorage.setItem(STORAGE_KEY_PLAYED, String(gamesPlayedCount));
    updateBobuxUI();
    if (typeof touchUserActivity === 'function') {
        touchUserActivity(true);
    }

    document.getElementById('lobby-view').classList.add('hidden');
    document.getElementById('game-viewport').style.display = 'block';

    initThreeEngine();

    // Automatically capture focus into the 3D game window upon launching the game
    const gameCanvas = document.getElementById('three-canvas');
    if (gameCanvas) {
        gameCanvas.focus();
    }
    if (typeof setRobloxShiftLock === 'function') {
        setRobloxShiftLock(false);
    }
    if (typeof updateMobileControlsVisibility === 'function') {
        updateMobileControlsVisibility();
    }

    // Reset Player State
    playerState.hp = 100;
    playerState.maxHp = 100;
    playerState.vel.set(0, 0, 0);
    playerState.knockback.set(0, 0, 0);
    playerState.speedMultiplier = 1.0;
    playerState.jumpMultiplier = 1.0;
    playerState.onGround = false;
    playerState.onLadder = false;
    playerState.attackTimer = 0;
    playerState.invulnTimer = 0;
    playerState.forcefieldTimer = (typeof robloxUiState === 'undefined' || robloxUiState.forcefieldEnabled) ? 10.0 : 0;
    camState.yaw = 0;
    camState.pitch = 0.35;
    camState.isDragging = false;

    updateHealthHUD();
    if (typeof renderRobloxTopRightPlayerList === 'function') {
        renderRobloxTopRightPlayerList();
    }

    const gameMeta = GAMES_CATALOG.find(g => g.id === gameId);
    document.getElementById('hud-game-title').textContent = gameMeta ? gameMeta.title : 'Boblox World';

    // Initialize Game Weapon Loadout & Hotbar
    setupGameWeaponLoadout(gameId);

    // Configure specific game world (11 Playable Games)
    if (gameId === 'adoptme') setupGame11AdoptMe();
    else if (gameId === 'obby') setupGame1Obby();
    else if (gameId === 'lava') setupGame2LavaTower();
    else if (gameId === 'sfoth') setupGame3SFOTH();
    else if (gameId === 'tycoon') setupGame4Tycoon();
    else if (gameId === 'disasters') setupGame5Disasters();
    else if (gameId === 'toh') setupGame6TowerOfHell();
    else if (gameId === 'zombies') setupGame7ZombieOutpost();
    else if (gameId === 'speedrun') setupGame8SpeedRun();
    else if (gameId === 'hideandseek') setupGame9HideAndSeek();
    else if (gameId === 'bedwars') setupGame10Bedwars();
    else if (gameId === 'casino') setupGame12Casino();

    // Re-apply initial equipped weapon model after game setup
    if (playerAvatar && playerState.activeWeapon) {
        setCharacterWeaponMesh(playerAvatar, playerState.activeWeapon.id);
    }
    renderHotbarUI();

    sfx.playJump();
    lastTickTime = performance.now();
    gameLoop(lastTickTime);
}

function leavePublicMatchmaking() {
    if (typeof leaveGameNetwork === 'function') {
        leaveGameNetwork();
        return;
    }
    mpState.connections.forEach(c => { try { c.close(); } catch (e) { } });
    mpState.connections = [];
    Object.keys(mpState.remotePlayers).forEach(pid => { delete mpState.remotePlayers[pid]; });
    if (mpState.peer) {
        try { mpState.peer.destroy(); } catch (e) { }
        mpState.peer = null;
    }
    mpState.isHost = false;
    try { updateMpCounters(); } catch (e) { }
}

function returnToLobby() {
    activeGameMode = null;
    if (typeof broadcastSocialPresence === 'function') {
        broadcastSocialPresence(false);
    }
    if (typeof closeRobloxEscMenu === 'function') closeRobloxEscMenu();

    // Restore the lobby UI first so it can never stay stuck, even if cleanup throws
    document.getElementById('game-viewport').style.display = 'none';
    document.getElementById('lobby-view').classList.remove('hidden');

    try {
        touchState.joyTouchId = null; touchState.joyX = 0; touchState.joyY = 0;
        touchState.lookTouchId = null; touchState.jumpPressed = false;
        if (typeof updateMobileControlsVisibility === 'function') {
            updateMobileControlsVisibility();
        }
        Object.keys(keysPressed).forEach(k => { keysPressed[k] = false; });
        cleanupCurrentGame();
        if (mpState.mode === 'public' && mpState.peer) leavePublicMatchmaking();
        sendWsPresence();
        updateBobuxUI();
        renderGameCatalog();
        if (typeof touchUserActivity === 'function') {
            touchUserActivity(true);
        }
    } catch (err) {
        console.error('returnToLobby cleanup error:', err);
    }
}

function respawnPlayerManual() {
    if (!activeGameMode) return;
    sfx.playOof();
    respawnPlayer();
}

function respawnPlayer() {
    playerState.hp = playerState.maxHp;
    playerState.pos.copy(playerState.spawnPoint);
    playerState.vel.set(0, 0, 0);
    playerState.knockback.set(0, 0, 0);
    playerState.onGround = false;
    playerState.coyoteTimer = 0;
    playerState.forcefieldTimer = (typeof robloxUiState === 'undefined' || robloxUiState.forcefieldEnabled) ? 8.0 : 0;
    updateHealthHUD();
    flashDamageScreen();
}

function damagePlayer(amount, reason = '') {
    if (playerState.godmode) return; // Godmode cheat for Vendeez
    if (playerState.invulnTimer > 0) return;
    playerState.hp = Math.max(0, playerState.hp - amount);
    playerState.invulnTimer = 0.35;
    sfx.playOof();
    flashDamageScreen();
    updateHealthHUD();
    if (typeof triggerScreenShake === 'function') triggerScreenShake(0.42, 0.24);
    if (typeof spawnJuiceParticles === 'function') spawnJuiceParticles(playerState.pos.x, playerState.pos.y + 1.6, playerState.pos.z, 0xef4444, 12, 8.0, 1.15);

    if (playerState.hp <= 0) {
        showHudToast(reason ? `OOF! ${reason}` : 'OOF! Zemřel jsi, respawn...', 'red');
        if (activeGameMode === 'bedwars' && gameSpecificData && !gameSpecificData.blueBedAlive) {
            showHudToast('Tvoje postel byla zničena! Nové kolo Bedwars začíná...', 'red');
            setupGame10Bedwars();
            return;
        }
        respawnPlayer();
        if (activeGameMode === 'lava' && gameSpecificData.lavaMesh) {
            gameSpecificData.lavaHeight = Math.max(-2, playerState.spawnPoint.y - 12);
        }
    }
}

function flashDamageScreen() {
    const el = document.getElementById('damage-flash');
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 190);
}

function updateHealthHUD() {
    const pct = Math.max(0, Math.min(100, Math.round((playerState.hp / playerState.maxHp) * 100)));
    const bar = document.getElementById('hud-hp-bar');
    const txt = document.getElementById('hud-hp-text');
    if (bar) {
        bar.style.width = `${pct}%`;
        bar.className = pct > 50
            ? 'h-full bg-gradient-to-r from-[#00B06F] to-[#00E08E] transition-all duration-150'
            : pct > 25
                ? 'h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-150'
                : 'h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-150';
    }
    if (txt) txt.textContent = `${Math.ceil(playerState.hp)} / ${playerState.maxHp}`;
}

function showHudToast(text, theme = 'blue') {
    const container = document.getElementById('hud-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const colors = {
        blue: 'bg-[#00A2FF]/95 border-blue-300 text-white',
        gold: 'bg-amber-500/95 border-yellow-200 text-black',
        red: 'bg-red-600/95 border-red-300 text-white',
        green: 'bg-[#00B06F]/95 border-green-200 text-white'
    };
    if (!colors[theme] && typeof console !== 'undefined' && console.warn) {
        console.warn(`[showHudToast] Neznámé téma: "${theme}". Povolená témata jsou: blue, gold, red, green.`);
    }
    toast.className = `toast-anim px-4 py-2 rounded-xl border font-bold text-xs sm:text-sm shadow-xl ${colors[theme] || colors.blue}`;
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
}

