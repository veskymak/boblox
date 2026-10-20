/* ============================================================================
 * 7. GAME 1: "CLASSIC MEGA OBBY" (PŘEKÁŽKOVÁ DRÁHA)
 * ============================================================================ */
function setupGame1Obby() {
    scene.background = new THREE.Color(0x38bdf8);
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.004);

    document.getElementById('hud-objective-title').textContent = 'CLASSIC MEGA OBBY';
    document.getElementById('hud-objective-text').textContent = 'Přeskákej překážky, vyhni se červeným laserům a dosáhni zlatého cíle!';
    document.getElementById('hud-extra-label').textContent = 'Checkpoint: ';
    document.getElementById('hud-extra-value').textContent = '1 / 4';

    playerState.spawnPoint.set(0, 3, 0);
    playerState.pos.copy(playerState.spawnPoint);

    gameSpecificData = {
        currentCheckpoint: 1,
        confettiParticles: [],
        spinnerMesh: null
    };

    // Start Spawn Platform
    createBlock(0, 0, 0, 10, 1.5, 10, 0x3b82f6);

    // Stage 1: Rainbow Stepping Stones (Z: -8 to -42)
    const rainbowCols = [0xef4444, 0xf97316, 0xeab308, 0x22c55e, 0x06b6d4, 0x8b5cf6];
    for (let i = 0; i < 6; i++) {
        const xOff = (i % 2 === 0 ? -2.2 : 2.2);
        createBlock(xOff, 0.4 * i, -9 - i * 6.2, 4.2, 1.2, 4.2, rainbowCols[i]);
    }

    // Checkpoint 2 Platform (Z = -48)
    createBlock(0, 2.5, -48, 9, 1.5, 9, 0x475569);
    createBlock(0, 3.4, -48, 3.5, 0.4, 3.5, 0xfacc15, { isCheckpoint: true, checkpointIdx: 2, emissive: 0xb45309 });

    // Stage 2: Laser Kill-Brick Hallway (Z: -55 to -90)
    createBlock(0, 2.5, -72, 7, 1.2, 38, 0xcbd5e1);
    for (let z = -58; z >= -86; z -= 5.6) {
        createBlock(0, 3.35, z, 6.8, 0.55, 1.1, 0xff0000, {
            isKill: true,
            emissive: 0xff0000,
            emissiveIntensity: 0.85,
            noStuds: true
        });
    }

    // Checkpoint 3 Platform (Z = -97)
    createBlock(0, 2.5, -97, 9, 1.5, 9, 0x475569);
    createBlock(0, 3.4, -97, 3.5, 0.4, 3.5, 0xfacc15, { isCheckpoint: true, checkpointIdx: 3, emissive: 0xb45309 });

    // Stage 3: Moving Pendulum Platforms (Z: -106 to -142)
    for (let i = 0; i < 4; i++) {
        const zPos = -106 - i * 9.5;
        const dir = i % 2 === 0 ? 1 : -1;
        createBlock(0, 2.8 + i * 0.5, zPos, 5.2, 1.2, 5.2, 0x10b981, {
            movingFn: (t, block) => {
                block.mesh.position.x = Math.sin(t * 2.1 + i) * 5.5 * dir;
            }
        });
    }

    // Checkpoint 4 Platform (Z = -146)
    createBlock(0, 4.8, -146, 9, 1.5, 9, 0x475569);
    createBlock(0, 5.7, -146, 3.5, 0.4, 3.5, 0xfacc15, { isCheckpoint: true, checkpointIdx: 4, emissive: 0xb45309 });

    // Stage 4: Narrow Balance Bridge & Ascending Final Pads (Z: -154 to -186)
    createBlock(0, 4.8, -162, 2.2, 1.2, 22, 0xf59e0b);
    // Deadly laser hurdles along narrow bridge
    createBlock(0, 5.7, -158, 2.4, 0.6, 0.8, 0xff0000, { isKill: true, emissive: 0xff0000, noStuds: true });
    createBlock(0, 5.7, -166, 2.4, 0.6, 0.8, 0xff0000, { isKill: true, emissive: 0xff0000, noStuds: true });

    createBlock(0, 6.5, -178, 5, 1.2, 5, 0x8b5cf6);
    createBlock(0, 8.2, -186, 5, 1.2, 5, 0xec4899);

    // FINAL WINNER ISLAND (Z = -198)
    createBlock(0, 9.5, -198, 14, 1.8, 14, 0x1e293b);
    // Golden Finish Pad
    createBlock(0, 10.6, -198, 6, 0.5, 6, 0xfde047, {
        isFinish: true,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.6
    });

    // Decorative Golden Arch on Finish Island
    createBlock(-4.5, 14.5, -202, 1.5, 8, 1.5, 0xfacc15);
    createBlock(4.5, 14.5, -202, 1.5, 8, 1.5, 0xfacc15);
    createBlock(0, 18.5, -202, 11, 1.6, 1.8, 0xfacc15);
}

function spawnObbyConfetti(origin) {
    const colors = [0xff0055, 0xfacc15, 0x00e08e, 0x00a2ff, 0xa855f7];
    for (let i = 0; i < 45; i++) {
        const m = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.35, 0.1),
            new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
        );
        m.position.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 6, 3 + Math.random() * 4, (Math.random() - 0.5) * 6));
        scene.add(m);
        gameSpecificData.confettiParticles.push({
            mesh: m,
            vel: new THREE.Vector3((Math.random() - 0.5) * 8, 5 + Math.random() * 8, (Math.random() - 0.5) * 8),
            life: 3.5
        });
    }
}

/* ============================================================================
 * 8. GAME 2: "THE FLOOR IS LAVA: TOWER ESCAPE"
 * ============================================================================ */
function setupGame2LavaTower() {
    scene.background = new THREE.Color(0x1e1b4b);
    scene.fog = new THREE.FogExp2(0x31102f, 0.008);

    document.getElementById('hud-objective-title').textContent = 'THE FLOOR IS LAVA';
    document.getElementById('hud-objective-text').textContent = 'Šplhej na vrchol věže! Láva stoupá každou sekundu!';
    document.getElementById('hud-extra-label').textContent = 'Výška: ';
    document.getElementById('hud-extra-value').textContent = '0m / 48m';

    playerState.spawnPoint.set(0, 2.5, 0);
    playerState.pos.copy(playerState.spawnPoint);

    // Base volcano floor & central tower core
    createBlock(0, 0, 0, 28, 1.5, 28, 0x334155);
    createBlock(0, 24, 0, 7, 48, 7, 0x1e293b);

    // Spiral platforms, ladders, and power-up coils up to Y = 48
    const numSteps = 22;
    const coils = [];

    for (let i = 1; i <= numSteps; i++) {
        const angle = i * 0.68;
        const radius = 8.2;
        const px = Math.cos(angle) * radius;
        const pz = Math.sin(angle) * radius;
        const py = i * 2.15;

        const platColor = i % 5 === 0 ? 0x0ea5e9 : 0x64748b;
        createBlock(px, py, pz, 5.2, 0.9, 5.2, platColor);

        // Every 4th platform has a climbable ladder shortcut to next tier
        if (i % 4 === 0 && i < numSteps) {
            createBlock(px * 0.65, py + 1.4, pz * 0.65, 1.4, 3.6, 1.4, 0xfacc15, { isLadder: true });
        }

        // Place Speed Coil at step 7 and Gravity Coil at step 14
        if (i === 7 || i === 14) {
            const isSpeed = i === 7;
            const coilMesh = new THREE.Mesh(
                new THREE.TorusGeometry(0.8, 0.22, 12, 24),
                new THREE.MeshStandardMaterial({
                    color: isSpeed ? 0xef4444 : 0x3b82f6,
                    emissive: isSpeed ? 0xdc2626 : 0x2563eb,
                    emissiveIntensity: 0.7
                })
            );
            coilMesh.position.set(px, py + 1.6, pz);
            scene.add(coilMesh);
            coils.push({ mesh: coilMesh, type: isSpeed ? 'speed' : 'gravity', collected: false });
        }
    }

    // Top Helicopter Rescue Roof Pad (Y = 48.5)
    createBlock(0, 48.5, 0, 14, 1.4, 14, 0x0f172a);
    // Yellow H helipad markings
    createBlock(-2, 49.25, 0, 1, 0.15, 5, 0xfacc15, { noStuds: true });
    createBlock(2, 49.25, 0, 1, 0.15, 5, 0xfacc15, { noStuds: true });
    createBlock(0, 49.25, 0, 4, 0.15, 1, 0xfacc15, { noStuds: true });

    // 3D Rescue Helicopter + Escape Portal
    const heliGroup = new THREE.Group();
    heliGroup.position.set(0, 51.2, -3.5);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 4.5), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 4.5), new THREE.MeshStandardMaterial({ color: 0x059669 }));
    tail.position.set(0, 0.3, -4.0);
    const rotor = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.15, 0.6), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    rotor.position.set(0, 1.45, 0);
    heliGroup.add(cabin, tail, rotor);
    scene.add(heliGroup);

    // Glowing Victory Extraction Pad next to Helicopter
    createBlock(0, 49.4, 2.5, 4.2, 0.5, 4.2, 0x00e08e, {
        isFinish: true,
        emissive: 0x00b06f,
        emissiveIntensity: 0.9
    });

    // Giant Glowing Rising Lava Plane
    const lavaGeo = new THREE.BoxGeometry(90, 20, 90);
    const lavaMat = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff2200,
        emissiveIntensity: 0.85,
        roughness: 0.2
    });
    const lavaMesh = new THREE.Mesh(lavaGeo, lavaMat);
    lavaMesh.position.set(0, -11, 0); // Top surface starts at Y = -1
    scene.add(lavaMesh);

    gameSpecificData = {
        lavaMesh,
        lavaHeight: -1.0,
        lavaSpeed: 1.55,
        coils,
        heliRotor: rotor
    };
}

/* ============================================================================
 * 9. GAME 3: "SWORD FIGHTS ON THE HEIGHTS" (SFOTH ARENA)
 * ============================================================================ */
function setupGame3SFOTH() {
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x1e1b4b, 0.005);

    document.getElementById('hud-objective-title').textContent = 'SWORD FIGHTS ON THE HEIGHTS';
    document.getElementById('hud-objective-text').textContent = 'Přepínej zbraně (1-4 / kolečko myši) a shoď AI rytíře z ostrova!';
    document.getElementById('hud-extra-label').textContent = 'Skóre (Killy): ';
    document.getElementById('hud-extra-value').textContent = '0';

    playerState.spawnPoint.set(0, 3, 24);
    playerState.pos.copy(playerState.spawnPoint);

    // Central Combat Island (Radius ~14)
    createBlock(0, 0, 0, 26, 2, 26, 0x475569);
    createBlock(0, 1.3, 0, 10, 0.6, 10, 0x64748b);
    // 4 Corner Pillars on Central Island
    createBlock(-10, 4, -10, 2.2, 6, 2.2, 0x94a3b8);
    createBlock(10, 4, -10, 2.2, 6, 2.2, 0x94a3b8);
    createBlock(-10, 4, 10, 2.2, 6, 2.2, 0x94a3b8);
    createBlock(10, 4, 10, 2.2, 6, 2.2, 0x94a3b8);

    // South Spawn Island & Narrow Bridge
    createBlock(0, 0, 26, 12, 2, 12, 0x334155);
    createBlock(0, 0.2, 16.5, 3.2, 1.2, 8, 0x92400e);

    // North, West, East Floating Islands & Narrow Bridges
    createBlock(0, 0, -26, 12, 2, 12, 0x334155);
    createBlock(0, 0.2, -16.5, 3.2, 1.2, 8, 0x92400e);

    createBlock(-26, 0, 0, 12, 2, 12, 0x334155);
    createBlock(-16.5, 0.2, 0, 8, 1.2, 3.2, 0x92400e);

    createBlock(26, 0, 0, 12, 2, 12, 0x334155);
    createBlock(16.5, 0.2, 0, 8, 1.2, 3.2, 0x92400e);

    // Spawn 3 AI Sword Bots
    gameSpecificData = {
        kills: 0,
        bots: []
    };
    spawnSFOTHWave();
}

function spawnSFOTHWave() {
    const botConfigs = [
        { name: 'Telamon_AI', torso: 0xdc2626, pos: new THREE.Vector3(0, 3, -24) },
        { name: 'DarkKnight_Bot', torso: 0x7c3aed, pos: new THREE.Vector3(-24, 3, 0) },
        { name: 'BloxSlayer_99', torso: 0xeab308, pos: new THREE.Vector3(24, 3, 0) }
    ];

    botConfigs.forEach(cfg => {
        const meshData = createBlockyCharacterMesh({
            headColor: 0xF5CD30,
            torsoColor: cfg.torso,
            legColor: 0x1e293b,
            hasSword: true,
            isEvilBot: true
        });

        // Floating HP bar above bot head
        const hpBg = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.22, 0.1),
            new THREE.MeshBasicMaterial({ color: 0x111827 })
        );
        hpBg.position.set(0, 4.3, 0);
        const hpFill = new THREE.Mesh(
            new THREE.BoxGeometry(1.74, 0.16, 0.14),
            new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        hpBg.add(hpFill);
        meshData.root.add(hpBg);

        meshData.root.position.copy(cfg.pos);
        scene.add(meshData.root);

        gameSpecificData.bots.push({
            name: cfg.name,
            meshData,
            hpFill,
            pos: cfg.pos.clone(),
            vel: new THREE.Vector3(),
            knockback: new THREE.Vector3(),
            hp: 100,
            maxHp: 100,
            attackCooldown: 0,
            walkPhase: Math.random() * 6,
            alive: true
        });
    });
}

/* ============================================================================
 * 10. GAME 4: "CLASSIC 2-STORY TYCOON"
 * ============================================================================ */
function setupGame4Tycoon() {
    scene.background = new THREE.Color(0x60a5fa);
    scene.fog = new THREE.FogExp2(0x60a5fa, 0.0035);

    document.getElementById('hud-objective-title').textContent = 'CLASSIC 2-STORY TYCOON';
    document.getElementById('hud-objective-text').textContent = 'Sbírej peníze na zeleném čudlíku a kupuj vylepšení své základny!';
    document.getElementById('hud-extra-label').textContent = 'Hotovost: ';
    document.getElementById('hud-extra-value').textContent = '$50';

    playerState.spawnPoint.set(0, 2.5, 16);
    playerState.pos.copy(playerState.spawnPoint);

    // Green Baseplate & Tycoon Plot Floor
    createBlock(0, -0.5, 0, 80, 1, 80, 0x15803d);
    createBlock(0, 0.2, 0, 32, 0.5, 32, 0x94a3b8);

    // Conveyor Belt (runs from X = -11 to X = -2 at Z = -8)
    createBlock(-6.5, 0.9, -8, 11, 0.8, 2.6, 0x1e293b, {
        isConveyor: true,
        conveyorVel: new THREE.Vector3(4.5, 0, 0)
    });
    // Conveyor side rails
    createBlock(-6.5, 1.4, -9.4, 11, 0.4, 0.25, 0x475569);
    createBlock(-6.5, 1.4, -6.6, 11, 0.4, 0.25, 0x475569);

    // Basic Silver Ore Dropper #1 (at X = -10.5, Z = -8)
    createBlock(-11.2, 2.8, -8, 1.4, 4.2, 1.4, 0x3b82f6);
    createBlock(-10.0, 4.5, -8, 3.2, 0.9, 1.4, 0x3b82f6);
    createBlock(-9.0, 3.8, -8, 0.9, 0.8, 0.9, 0x1e293b);

    // Glowing Ore Collector Furnace (at X = -0.5, Z = -8)
    createBlock(-0.4, 1.2, -8, 2.4, 1.5, 3.0, 0xdc2626, { emissive: 0x991b1b });

    // Green Cash Claim Pad (at X = -4, Z = 2)
    const claimPad = createBlock(-5, 0.6, 2, 3.6, 0.4, 3.6, 0x10b981, {
        emissive: 0x059669,
        emissiveIntensity: 0.6
    });

    // 4 Step-On Buy Buttons
    const buyButtons = [
        {
            id: 'walls',
            name: 'Stěny 1. patra ($100)',
            cost: 100,
            pos: new THREE.Vector3(4, 0.6, 6),
            purchased: false,
            mesh: null
        },
        {
            id: 'dropper2',
            name: '2. Zlatý Dropper ($250)',
            cost: 250,
            pos: new THREE.Vector3(-6, 0.6, -2.5),
            purchased: false,
            mesh: null
        },
        {
            id: 'stairs',
            name: 'Schodiště a 2. patro ($500)',
            cost: 500,
            pos: new THREE.Vector3(9, 0.6, 0),
            purchased: false,
            mesh: null
        },
        {
            id: 'tower',
            name: 'Laserové dveře & Věž ($1000)',
            cost: 1000,
            pos: new THREE.Vector3(4, 0.6, -5),
            purchased: false,
            mesh: null
        }
    ];

    buyButtons.forEach(btn => {
        const b = createBlock(btn.pos.x, btn.pos.y, btn.pos.z, 3.2, 0.45, 3.2, 0xef4444, {
            emissive: 0xb91c1c,
            emissiveIntensity: 0.5,
            uniqueMaterial: true
        });
        btn.mesh = b.mesh;
        btn.blockRef = b;
    });

    gameSpecificData = {
        cash: 50,
        unclaimedCash: 0,
        claimPad,
        ores: [],
        dropTimer1: 0,
        dropTimer2: 0,
        hasDropper2: false,
        hasTower: false,
        bobuxTrickleTimer: 0,
        buyButtons
    };
}

function buildTycoonUpgrade(id) {
    sfx.playWinFanfare();
    if (id === 'walls') {
        createBlock(-15.5, 4.5, 0, 1, 8, 31, 0xe2e8f0);
        createBlock(15.5, 4.5, 0, 1, 8, 31, 0xe2e8f0);
        createBlock(0, 4.5, -15.5, 31, 8, 1, 0xe2e8f0);
        createBlock(-9, 4.5, 15.5, 12, 8, 1, 0xe2e8f0);
        createBlock(9, 4.5, 15.5, 12, 8, 1, 0xe2e8f0);
        showHudToast('Postaveny Stěny 1. patra!', 'green');
    } else if (id === 'dropper2') {
        createBlock(-5.5, 2.8, -10.8, 1.4, 4.2, 1.4, 0xfacc15);
        createBlock(-5.5, 4.5, -9.4, 1.4, 0.9, 3.2, 0xfacc15);
        gameSpecificData.hasDropper2 = true;
        showHudToast('Postaven 2. Zlatý Dropper ($25 za rudu)!', 'gold');
    } else if (id === 'stairs') {
        for (let s = 0; s < 8; s++) {
            createBlock(11, 1.0 + s * 0.95, 8 - s * 1.6, 4, 0.9, 1.8, 0x64748b);
        }
        createBlock(0, 8.5, -4, 30, 0.9, 22, 0xcbd5e1);
        showHudToast('Postaveno Schodiště a 2. patro!', 'green');
    } else if (id === 'tower') {
        createBlock(0, 4.0, 15.5, 6, 7, 0.3, 0x00a2ff, {
            opacity: 0.45,
            decorOnly: true,
            noStuds: true
        });
        createBlock(0, 13.5, -6, 14, 9, 14, 0x1e293b);
        createBlock(0, 18.5, -6, 16, 1.2, 16, 0xfacc15, { emissive: 0xd97706 });
        gameSpecificData.hasTower = true;
        addBobux(150, 'Dokončení 2-Story Tycoonu!');
    }
}

/* ============================================================================
 * 11. GAME 5: "SURVIVE THE NATURAL DISASTERS"
 * ============================================================================ */
function setupGame5Disasters() {
    scene.background = new THREE.Color(0x38bdf8);
    scene.fog = new THREE.FogExp2(0x475569, 0.005);

    document.getElementById('hud-objective-title').textContent = 'SURVIVE THE NATURAL DISASTERS';
    document.getElementById('hud-objective-text').textContent = 'Příprava 8s... Najdi úkryt v domě nebo na ostrově!';
    document.getElementById('hud-extra-label').textContent = 'Odpočet: ';
    document.getElementById('hud-extra-value').textContent = '60s';

    playerState.spawnPoint.set(0, 2.5, 14);
    playerState.pos.copy(playerState.spawnPoint);

    buildDisasterIslandStructure();

    const disasters = [
        { id: 'meteors', name: '☄️ METEORITICKÝ DÉŠŤ', hint: 'Vyhýbej se padajícím ohnivým koulím!' },
        { id: 'acid', name: '🧪 KYSELÝ DÉŠŤ', hint: 'Schovej se pod pevnou střechu domu, jinak ztrácíš HP!' },
        { id: 'tornado', name: '🌪️ OBŘÍ TORNÁDO', hint: 'Udržuj odstup od rotujícího víru!' }
    ];
    const chosen = disasters[Math.floor(Math.random() * disasters.length)];

    // Tornado visual funnel group (hidden unless tornado disaster is active)
    const tornadoGroup = new THREE.Group();
    for (let i = 0; i < 7; i++) {
        const cone = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2 + i * 1.1, 0.8 + i * 0.9, 3.2, 12),
            new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.78 })
        );
        cone.position.y = i * 2.8 + 1.5;
        tornadoGroup.add(cone);
    }
    tornadoGroup.visible = false;
    scene.add(tornadoGroup);

    gameSpecificData = {
        roundTimer: 60.0,
        prepTimer: 7.0,
        disasterActive: false,
        currentDisaster: chosen,
        meteors: [],
        rainDrops: [],
        tornadoGroup,
        tornadoAngle: 0,
        spawnTimer: 0
    };
}

function buildDisasterIslandStructure() {
    createBlock(0, -2.2, 0, 220, 2, 220, 0x0284c7, { isKill: true, noStuds: true });
    createBlock(0, 0, 0, 46, 2.2, 46, 0x16a34a);
    createBlock(0, -0.4, 0, 52, 1.4, 52, 0xfde047);

    const brickCol = 0xb91c1c;
    const roofCol = 0x334155;

    for (let x = -6; x <= 6; x += 4) {
        createBlock(x, 2.6, -6, 3.8, 3.2, 1.2, brickCol, { destructible: true });
        if (x !== 0) {
            createBlock(x, 2.6, 6, 3.8, 3.2, 1.2, brickCol, { destructible: true });
        }
    }
    for (let z = -2; z <= 2; z += 4) {
        createBlock(-6, 2.6, z, 1.2, 3.2, 3.8, brickCol, { destructible: true });
        createBlock(6, 2.6, z, 1.2, 3.2, 3.8, brickCol, { destructible: true });
    }

    for (let x = -4.5; x <= 4.5; x += 4.5) {
        for (let z = -4.5; z <= 4.5; z += 4.5) {
            createBlock(x, 4.6, z, 4.4, 0.8, 4.4, roofCol, { destructible: true, isRoof: true });
        }
    }

    createBlock(-4.5, 6.8, -4.5, 4.2, 3.4, 1.2, brickCol, { destructible: true });
    createBlock(4.5, 6.8, -4.5, 4.2, 3.4, 1.2, brickCol, { destructible: true });
    createBlock(0, 9.0, -2, 11, 1.0, 9, roofCol, { destructible: true, isRoof: true });

    const treeCoords = [[-16, -14], [16, -14], [-17, 12], [17, 12]];
    treeCoords.forEach(([tx, tz]) => {
        createBlock(tx, 2.8, tz, 1.4, 3.8, 1.4, 0x78350f, { destructible: true });
        createBlock(tx, 5.8, tz, 4.5, 3.2, 4.5, 0x15803d, { destructible: true, isRoof: true });
    });
}

/* ============================================================================
 * 11B. 5 NEW PLAYABLE 3D MINIGAMES (GAMES 6–10)
 * ============================================================================ */

// GAME 6: TOWER OF HELL: OBBY EXTREME (Vertical No-Checkpoint Tower + Rotating Lasers)
function setupGame6TowerOfHell() {
    scene.background = new THREE.Color(0x0f0722);
    scene.fog = new THREE.FogExp2(0x1a0b36, 0.006);

    document.getElementById('hud-objective-title').textContent = 'TOWER OF HELL: EXTREME';
    document.getElementById('hud-objective-text').textContent = 'Žádné checkpointy! Vyhni se rotujícím laserovým tyčím a dosáhni vrcholu věže (60m)!';
    document.getElementById('hud-extra-label').textContent = 'Patro: ';
    document.getElementById('hud-extra-value').textContent = '0m / 60m';

    playerState.spawnPoint.set(0, 2.5, 11);
    playerState.pos.copy(playerState.spawnPoint);

    // Base lobby floor inside the cylindrical tower
    createBlock(0, 0, 0, 28, 1.6, 28, 0x1e1b4b);
    // Central Neon Pillar
    createBlock(0, 30, 0, 4.5, 60, 4.5, 0x311042);

    // Outer Cylinder Tower Ring Walls (visual enclosure)
    for (let a = 0; a < 12; a++) {
        const ang = (a / 12) * Math.PI * 2;
        const wx = Math.cos(ang) * 16.5;
        const wz = Math.sin(ang) * 16.5;
        const wall = createBlock(wx, 30, wz, 5.5, 62, 1.2, 0x1e1b4b, { decorOnly: true, opacity: 0.35, noStuds: true });
        wall.mesh.rotation.y = -ang + Math.PI / 2;
    }

    const neonColors = [0xd946ef, 0x8b5cf6, 0xec4899, 0x06b6d4, 0xf43f5e, 0xa855f7];
    const sweepers = [];

    // 28 Spiral Parkour Steps up to Y = 58m
    for (let i = 1; i <= 28; i++) {
        const angle = i * 0.62;
        const radius = 9.2 + (i % 3 === 0 ? 1.4 : 0);
        const px = Math.cos(angle) * radius;
        const pz = Math.sin(angle) * radius;
        const py = i * 2.05;
        const col = neonColors[i % neonColors.length];

        if (i % 5 === 0) {
            // Moving Horizontal Neon Platform
            createBlock(px, py, pz, 4.4, 0.85, 4.4, col, {
                emissive: col,
                emissiveIntensity: 0.35,
                movingFn: (t, b) => {
                    b.mesh.position.y = py + Math.sin(t * 2.4 + i) * 1.2;
                }
            });
        } else {
            createBlock(px, py, pz, 4.5, 0.85, 4.5, col, {
                emissive: col,
                emissiveIntensity: 0.25
            });
        }

        // Every 4th step has a deadly laser bar on the platform edge or a central rotating sweeper
        if (i % 4 === 0) {
            const sweeper = new THREE.Mesh(
                new THREE.BoxGeometry(24, 0.45, 0.45),
                new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0044, emissiveIntensity: 0.95 })
            );
            sweeper.position.set(0, py + 1.0, 0);
            scene.add(sweeper);
            sweepers.push({
                mesh: sweeper,
                y: py + 1.0,
                speed: (i % 8 === 0 ? 1 : -1) * (1.2 + i * 0.03)
            });
        }
    }

    // Crown Winner Platform at Y = 60m
    createBlock(0, 59.5, 0, 12, 1.4, 12, 0xfacc15, { emissive: 0xb45309, emissiveIntensity: 0.4 });
    createBlock(0, 60.5, 0, 5, 0.5, 5, 0x00e08e, {
        isFinish: true,
        emissive: 0x00b06f,
        emissiveIntensity: 0.95
    });

    gameSpecificData = {
        sweepers,
        towerTimer: 0
    };
}

// GAME 7: ZOMBIE SURVIVAL OUTPOST (Wave Shooter + Weapons + Score)
function setupGame7ZombieOutpost() {
    scene.background = new THREE.Color(0x061914);
    scene.fog = new THREE.FogExp2(0x061914, 0.008);

    document.getElementById('hud-objective-title').textContent = 'ZOMBIE SURVIVAL OUTPOST';
    document.getElementById('hud-objective-text').textContent = 'Střílej zombie (LMB / Akce), přepínej zbraně (1-4) a sbírej bedny s municí!';
    document.getElementById('hud-extra-label').textContent = 'Vlna / Skóre: ';
    document.getElementById('hud-extra-value').textContent = 'Vlna 1 • 0 bodů';

    playerState.spawnPoint.set(0, 2.5, 0);
    playerState.pos.copy(playerState.spawnPoint);

    // Outpost Ground Arena & Perimeter Fortifications
    createBlock(0, -0.6, 0, 96, 1.2, 96, 0x1e293b);
    createBlock(0, 0.15, 0, 22, 0.5, 22, 0x334155); // Central bunker platform

    // Defensive Sandbag / Concrete Barricades & Watchtowers
    const walls = [
        [0, 1.8, -14, 12, 2.8, 1.6],
        [0, 1.8, 14, 12, 2.8, 1.6],
        [-14, 1.8, 0, 1.6, 2.8, 12],
        [14, 1.8, 0, 1.6, 2.8, 12]
    ];
    walls.forEach(([x, y, z, w, h, d]) => createBlock(x, y, z, w, h, d, 0x475569));

    // Elevated Sniper Platform in Center
    createBlock(0, 3.6, 0, 8, 0.8, 8, 0x475569);
    createBlock(0, 1.8, 4.5, 2.2, 3.8, 1.2, 0xfacc15, { isLadder: true });

    // 4 Glowing Ammo & Health Supply Crates around Outpost
    const ammoCrates = [];
    [[-9, -9], [9, -9], [-9, 9], [9, 9]].forEach(([cx, cz]) => {
        const crate = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 1.6, 1.6),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xb45309, emissiveIntensity: 0.45 })
        );
        crate.position.set(cx, 1.2, cz);
        scene.add(crate);
        ammoCrates.push({ mesh: crate, cooldown: 0 });
    });

    gameSpecificData = {
        wave: 1,
        score: 0,
        zombies: [],
        bullets: [],
        ammoCrates
    };

    spawnZombieWave(1);
}

function spawnZombieWave(waveNum) {
    const count = 4 + waveNum * 2;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 28 + Math.random() * 12;
        const zx = Math.cos(angle) * dist;
        const zz = Math.sin(angle) * dist;
        const isBoss = (i === 0 && waveNum >= 2);

        const meshData = createBlockyCharacterMesh({
            headColor: isBoss ? 0x16a34a : 0x4ade80,
            torsoColor: isBoss ? 0x581c87 : 0x3f6212,
            legColor: 0x1e293b,
            isEvilBot: true
        });
        // Zombies hold their arms forward menacingly
        meshData.leftArmPivot.rotation.x = 1.55;
        meshData.rightArmPivot.rotation.x = 1.55;
        if (isBoss) meshData.root.scale.set(1.35, 1.35, 1.35);

        const hpBg = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.22, 0.1),
            new THREE.MeshBasicMaterial({ color: 0x111827 })
        );
        hpBg.position.set(0, 4.3, 0);
        const hpFill = new THREE.Mesh(
            new THREE.BoxGeometry(1.74, 0.16, 0.14),
            new THREE.MeshBasicMaterial({ color: 0x22c55e })
        );
        hpBg.add(hpFill);
        meshData.root.add(hpBg);

        const spawnPos = new THREE.Vector3(zx, 1.0, zz);
        meshData.root.position.copy(spawnPos);
        scene.add(meshData.root);

        const maxHp = isBoss ? 180 + waveNum * 30 : 75 + waveNum * 15;
        gameSpecificData.zombies.push({
            name: isBoss ? `BOSS Zombie #${waveNum}` : `Zombie #${i + 1}`,
            meshData,
            hpFill,
            pos: spawnPos,
            vel: new THREE.Vector3(),
            knockback: new THREE.Vector3(),
            hp: maxHp,
            maxHp,
            speed: isBoss ? 5.8 : 6.4 + Math.min(3.5, waveNum * 0.35),
            attackCooldown: 0,
            walkPhase: Math.random() * 6,
            alive: true,
            points: isBoss ? 100 : 35
        });
    }
}

// GAME 8: SPEED RUN: PARKOUR RUSH (High-Speed Track + Boost Pads + Precision Timer)
function setupGame8SpeedRun() {
    scene.background = new THREE.Color(0x022c22);
    scene.fog = new THREE.FogExp2(0x064e3b, 0.0035);

    document.getElementById('hud-objective-title').textContent = 'SPEED RUN: PARKOUR RUSH';
    document.getElementById('hud-objective-text').textContent = 'Proběhni neonovou dráhu v rekordním čase! Zelené šipky dávají MEGA BOOST!';
    document.getElementById('hud-extra-label').textContent = 'Časomíra: ';
    document.getElementById('hud-extra-value').textContent = '0.00s';

    playerState.spawnPoint.set(0, 3, 0);
    playerState.pos.copy(playerState.spawnPoint);
    playerState.speedMultiplier = 1.65; // Fast default Speed Run pace

    // Start Platform
    createBlock(0, 0, 0, 12, 1.5, 12, 0x0ea5e9);

    // Section 1: High-Speed Boost Runway (Z: -10 to -85)
    createBlock(0, 0, -45, 7, 1.2, 68, 0x1e293b);
    for (let z = -18; z >= -74; z -= 18) {
        createBlock(0, 0.75, z, 5, 0.35, 6, 0x10b981, {
            isBoost: true,
            emissive: 0x059669,
            emissiveIntensity: 0.9
        });
    }

    // Checkpoint 1 (Z = -92)
    createBlock(0, 1.5, -92, 10, 1.5, 10, 0x334155);
    createBlock(0, 2.4, -92, 4, 0.4, 4, 0xfacc15, { isCheckpoint: true, checkpointIdx: 2, emissive: 0xb45309 });

    // Section 2: Zig-Zag Sky Pads & Laser Hurdles (Z: -104 to -176)
    for (let i = 0; i < 7; i++) {
        const xOff = (i % 2 === 0 ? -5.5 : 5.5);
        const zPos = -105 - i * 11;
        createBlock(xOff, 2.2 + i * 0.7, zPos, 6.2, 1.2, 8.5, 0x06b6d4, {
            emissive: 0x0891b2,
            emissiveIntensity: 0.35
        });
        if (i % 2 === 1) {
            createBlock(xOff, 3.1 + i * 0.7, zPos, 5.8, 0.5, 0.9, 0xff0055, { isKill: true, emissive: 0xff0055, noStuds: true });
        }
    }

    // Checkpoint 2 (Z = -188)
    createBlock(0, 7.5, -188, 11, 1.5, 11, 0x334155);
    createBlock(0, 8.4, -188, 4, 0.4, 4, 0xfacc15, { isCheckpoint: true, checkpointIdx: 3, emissive: 0xb45309 });

    // Section 3: Final Turbo Bridge to Finish Portal (Z: -200 to -265)
    createBlock(0, 7.5, -230, 5.5, 1.2, 68, 0x3b82f6);
    createBlock(0, 8.25, -210, 4.5, 0.35, 8, 0x10b981, { isBoost: true, emissive: 0x059669, emissiveIntensity: 0.95 });
    createBlock(0, 8.25, -242, 4.5, 0.35, 8, 0x10b981, { isBoost: true, emissive: 0x059669, emissiveIntensity: 0.95 });

    // Finish Island (Z = -275)
    createBlock(0, 8.5, -275, 16, 1.8, 16, 0x0f172a);
    createBlock(0, 9.6, -275, 7, 0.5, 7, 0xfde047, {
        isFinish: true,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9
    });

    gameSpecificData = {
        runTime: 0,
        bestTime: null,
        currentCheckpoint: 1,
        permSpeedMult: 1.65
    };
}

// GAME 9: HIDE AND SEEK: PROP HUNT (Hider Disguises & Seeker Scanner)
function setupGame9HideAndSeek() {
    scene.background = new THREE.Color(0x1e293b);
    scene.fog = new THREE.FogExp2(0x1e293b, 0.006);

    document.getElementById('hud-objective-title').textContent = 'HIDE AND SEEK: PROP HUNT';
    document.getElementById('hud-objective-text').textContent = 'Slot 1 = Prop Scanner (najdi 4 schované Hledače) • Sloty 2-4 = Proměň se v předmět (Bedna/Sud/Keř)!';
    document.getElementById('hud-extra-label').textContent = 'Nalezeno / Čas: ';
    document.getElementById('hud-extra-value').textContent = '0 / 4 • 75s';

    playerState.spawnPoint.set(0, 2.5, 22);
    playerState.pos.copy(playerState.spawnPoint);

    // Warehouse & Courtyard Arena
    createBlock(0, -0.6, 0, 64, 1.2, 64, 0x334155);
    // Perimeter Walls
    createBlock(0, 4, -32, 64, 8, 1.5, 0x475569);
    createBlock(0, 4, 32, 64, 8, 1.5, 0x475569);
    createBlock(-32, 4, 0, 1.5, 8, 64, 0x475569);
    createBlock(32, 4, 0, 1.5, 8, 64, 0x475569);

    // Warehouse Shelves & Buildings
    createBlock(-14, 3, -10, 12, 6, 8, 0x64748b);
    createBlock(14, 3, -10, 12, 6, 8, 0x64748b);
    createBlock(0, 2.5, 6, 10, 5, 10, 0x64748b);

    // Scatter Static Environment Props (Crates, Barrels, Bushes)
    const propSpots = [
        [-22, -20, 'crate'], [-18, -20, 'barrel'], [20, -22, 'crate'], [24, -18, 'bush'],
        [-24, 14, 'bush'], [22, 16, 'barrel'], [-8, -22, 'crate'], [8, -22, 'barrel'],
        [-20, 0, 'crate'], [20, 2, 'crate'], [-10, 18, 'bush'], [12, 18, 'barrel']
    ];
    propSpots.forEach(([px, pz, kind]) => {
        if (kind === 'crate') {
            createBlock(px, 1.2, pz, 2.4, 2.4, 2.4, 0xb45309);
        } else if (kind === 'barrel') {
            createBlock(px, 1.3, pz, 2.0, 2.6, 2.0, 0xdc2626);
        } else {
            createBlock(px, 1.3, pz, 2.8, 2.6, 2.8, 0x15803d);
        }
    });

    // Spawn 4 Disguised Hider Bots that subtly shift positions when player looks away
    const hiderProps = [];
    const hiderTypes = ['prop_crate', 'prop_barrel', 'prop_bush', 'prop_crate'];
    for (let i = 0; i < 4; i++) {
        const hx = (Math.random() - 0.5) * 44;
        const hz = (Math.random() - 0.5) * 40 - 4;
        const meshData = createBlockyCharacterMesh({
            weaponId: hiderTypes[i]
        });
        meshData.root.position.set(hx, 0, hz);
        scene.add(meshData.root);
        hiderProps.push({
            id: i + 1,
            meshData,
            pos: new THREE.Vector3(hx, 0, hz),
            targetPos: new THREE.Vector3(hx, 0, hz),
            moveTimer: 2 + Math.random() * 3,
            found: false
        });
    }

    gameSpecificData = {
        roundTimer: 75.0,
        foundCount: 0,
        totalHiders: 4,
        hiderProps
    };
}

// GAME 10: BEDWARS: ISLAND BATTLE (Sky Islands PvP, Resource Mining, Block Building & Bed Destruction)
function setupGame10Bedwars() {
    scene.background = new THREE.Color(0x0ea5e9);
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.0035);

    document.getElementById('hud-objective-title').textContent = 'BEDWARS: ISLAND BATTLE';
    document.getElementById('hud-objective-text').textContent = 'Sbírej rudu, stavěj most (Slot 3: Bloky), znič ČERVENOU POSTEL krumpáčem (Slot 2) a poraz obránce!';
    document.getElementById('hud-extra-label').textContent = 'Postele: ';
    document.getElementById('hud-extra-value').textContent = '🟦 Živá | 🟥 Živá';

    playerState.spawnPoint.set(0, 3, 38);
    playerState.pos.copy(playerState.spawnPoint);

    // 1. Blue Team Island (Player Base at Z = +38)
    createBlock(0, 0, 38, 18, 2.5, 18, 0x1d4ed8);
    createBlock(0, 3.5, 44, 10, 5, 4, 0x1e3a8a);
    // Blue Bed (at Z = 33)
    const blueBed = createBlock(0, 1.6, 33, 3.0, 1.1, 4.4, 0x38bdf8, {
        isBed: 'blue',
        emissive: 0x0284c7,
        emissiveIntensity: 0.4
    });

    // 2. Center Diamond Generator Island (at Z = 0)
    createBlock(0, 0, 0, 20, 2.5, 20, 0x475569);
    createBlock(0, 2.2, 0, 4, 2.0, 4, 0x22d3ee, { emissive: 0x0891b2, emissiveIntensity: 0.6 });
    // Partial Starter Bridges toward center so player can either jump or build blocks
    createBlock(0, 0.2, 21, 3.2, 1.0, 12, 0x93c5fd);
    createBlock(0, 0.2, -21, 3.2, 1.0, 12, 0xfca5a5);

    // 3. Red Team Island (Enemy Base at Z = -38)
    createBlock(0, 0, -38, 18, 2.5, 18, 0xb91c1c);
    createBlock(0, 3.5, -44, 10, 5, 4, 0x7f1d1d);
    // Red Enemy Bed (at Z = -33) + Protective Destructible Endstone Shell
    const redBed = createBlock(0, 1.6, -33, 3.2, 1.2, 4.6, 0xef4444, {
        isBed: 'red',
        emissive: 0xdc2626,
        emissiveIntensity: 0.65
    });
    // Destructible defense blocks around Red Bed
    createBlock(0, 2.8, -30.2, 3.6, 2.4, 1.2, 0xfef08a, { destructible: true });
    createBlock(-2.2, 2.8, -33, 1.2, 2.4, 4.6, 0xfef08a, { destructible: true });
    createBlock(2.2, 2.8, -33, 1.2, 2.4, 4.6, 0xfef08a, { destructible: true });

    gameSpecificData = {
        blueBedAlive: true,
        redBedAlive: true,
        blueBed,
        redBed,
        ironCount: 0,
        genTimer: 0,
        ingots: [],
        enemies: []
    };

    spawnBedwarsEnemy('Red_Defender', new THREE.Vector3(-3, 3, -31));
    spawnBedwarsEnemy('Red_Rusher', new THREE.Vector3(3, 3, -26));
}

function spawnBedwarsEnemy(name, posVec) {
    const meshData = createBlockyCharacterMesh({
        headColor: 0xF5CD30,
        torsoColor: 0xdc2626,
        legColor: 0x1e293b,
        hasSword: true,
        isEvilBot: true
    });
    const hpBg = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.22, 0.1),
        new THREE.MeshBasicMaterial({ color: 0x111827 })
    );
    hpBg.position.set(0, 4.3, 0);
    const hpFill = new THREE.Mesh(
        new THREE.BoxGeometry(1.74, 0.16, 0.14),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    hpBg.add(hpFill);
    meshData.root.add(hpBg);
    meshData.root.position.copy(posVec);
    scene.add(meshData.root);

    gameSpecificData.enemies.push({
        name,
        meshData,
        hpFill,
        pos: posVec.clone(),
        homePos: posVec.clone(),
        vel: new THREE.Vector3(),
        knockback: new THREE.Vector3(),
        hp: 100,
        maxHp: 100,
        attackCooldown: 0,
        walkPhase: Math.random() * 6,
        alive: true
    });
}

/* ============================================================================
 * 11B. GAME 11: ADOPT ME! – ADOPTION ISLAND (playadopt.me Authentic Experience)
 * ============================================================================ */
// Storage keys STORAGE_KEY_ADOPTME_PETS and STORAGE_KEY_ADOPTME_BUCKS are inherited from PortalStore.js (STORAGE_KEYS SSOT)

const ADOPT_ME_AGE_STAGES = [
    'Newborn',
    'Junior',
    'Pre-Teen',
    'Teen',
    'Post-Teen',
    'Full Grown ✨ NEON'
];

const ADOPT_ME_PET_CATALOG = {
    dog: {
        id: 'dog', name: 'Starter Dog', icon: '🐶', rarity: 'Common',
        bodyColor: 0xb45309, secondaryColor: 0x78350f, neonColor: 0x38bdf8,
        earStyle: 'floppy', canFly: true
    },
    cat: {
        id: 'cat', name: 'Ginger Cat', icon: '🐱', rarity: 'Common',
        bodyColor: 0xf97316, secondaryColor: 0xfed7aa, neonColor: 0xf472b6,
        earStyle: 'pointy', canFly: true
    },
    penguin: {
        id: 'penguin', name: 'King Penguin', icon: '🐧', rarity: 'Rare',
        bodyColor: 0x1e293b, secondaryColor: 0xf8fafc, neonColor: 0x22d3ee,
        earStyle: 'penguin', canFly: true
    },
    bunny: {
        id: 'bunny', name: 'Snow Bunny', icon: '🐰', rarity: 'Rare',
        bodyColor: 0xffffff, secondaryColor: 0xf472b6, neonColor: 0xf472b6,
        earStyle: 'long', canFly: true
    },
    redpanda: {
        id: 'redpanda', name: 'Red Panda', icon: '🐼', rarity: 'Ultra-Rare',
        bodyColor: 0xc2410c, secondaryColor: 0xfef3c7, neonColor: 0xfb923c,
        earStyle: 'pointy', canFly: true
    },
    kitsune: {
        id: 'kitsune', name: 'Nine-Tail Kitsune', icon: '🦊', rarity: 'Ultra-Rare',
        bodyColor: 0xfffbeb, secondaryColor: 0xf97316, neonColor: 0x22d3ee,
        earStyle: 'pointy', hasMultiTail: true, canFly: true
    },
    unicorn: {
        id: 'unicorn', name: 'Neon Unicorn', icon: '🦄', rarity: 'Legendary',
        bodyColor: 0xffffff, secondaryColor: 0xf472b6, neonColor: 0xf472b6,
        earStyle: 'unicorn', hasHorn: true, hasWings: true, canFly: true
    },
    dragon: {
        id: 'dragon', name: 'Shadow Dragon', icon: '🐉', rarity: 'Legendary',
        bodyColor: 0x1e1b4b, secondaryColor: 0xa855f7, neonColor: 0xc084fc,
        earStyle: 'horns', hasWings: true, canFly: true
    }
};

const ADOPT_ME_NEEDS = [
    {
        id: 'hungry',
        name: '🍎 Hlad (Hungry)',
        hint: 'Nakrm mazlíčka [Slot 1: 🍎 Krmení] nebo u misky v Nursery!',
        color: 0xef4444,
        bucks: 30,
        bobux: 25
    },
    {
        id: 'thirsty',
        name: '💧 Žízeň (Thirsty)',
        hint: 'Dej mazlíčkovi napít [Slot 2: 🍼 Nápoj] nebo u fontány!',
        color: 0x38bdf8,
        bucks: 30,
        bobux: 25
    },
    {
        id: 'sleepy',
        name: '💤 Únava (Sleepy)',
        hint: 'Ulož mazlíčka do RŮŽOVÉ POSTÝLKY vlevo u Nursery (Zóna Spánku)!',
        color: 0xa855f7,
        bucks: 38,
        bobux: 30
    },
    {
        id: 'dirty',
        name: '🛁 Špinavý (Camping Shower)',
        hint: 'Vykoupej mazlíčka v TYRKYSOVÝCH HOT SPRINGS vpravo u Nursery!',
        color: 0x06b6d4,
        bucks: 38,
        bobux: 30
    },
    {
        id: 'sick',
        name: '🏥 Nemocný (Hospital)',
        hint: 'Vezmi mazlíčka do NEMOCNICE pro Zlaté Jablko (vlevo na ostrově)!',
        color: 0x22c55e,
        bucks: 45,
        bobux: 35
    },
    {
        id: 'bored',
        name: '🛝 Nuda (Playground)',
        hint: 'Zaskákej si s mazlíčkem na TRAMPOLÍNÁCH na hřišti (vpravo na ostrově)!',
        color: 0xfacc15,
        bucks: 42,
        bobux: 30
    }
];

function loadAdoptMeSavedData() {
    let bucks = parseInt(localStorage.getItem(STORAGE_KEY_ADOPTME_BUCKS) || '120', 10);
    if (!Number.isFinite(bucks) || bucks < 0) bucks = 120;
    let pets = [];
    try {
        pets = JSON.parse(localStorage.getItem(STORAGE_KEY_ADOPTME_PETS) || '[]');
    } catch (e) {
        pets = [];
    }
    if (!Array.isArray(pets) || pets.length === 0) {
        pets = [{ id: 'dog', tasksDone: 0, ageIdx: 0 }];
    }
    pets = pets.filter(p => p && ADOPT_ME_PET_CATALOG[p.id]);
    if (pets.length === 0) {
        pets = [{ id: 'dog', tasksDone: 0, ageIdx: 0 }];
    }
    return { bucks, pets };
}

function saveAdoptMeData(bucks, pets) {
    localStorage.setItem(STORAGE_KEY_ADOPTME_BUCKS, String(Math.max(0, Math.floor(bucks))));
    localStorage.setItem(STORAGE_KEY_ADOPTME_PETS, JSON.stringify(pets));
    if (typeof authState !== 'undefined' && authState.user) {
        syncAccountToServer();
    }
}

function createAdoptMePetMesh(petId, isNeon = false) {
    const def = ADOPT_ME_PET_CATALOG[petId] || ADOPT_ME_PET_CATALOG.dog;
    const root = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
        color: def.bodyColor,
        roughness: 0.4,
        metalness: 0.1
    });
    const secMat = new THREE.MeshStandardMaterial({
        color: isNeon ? def.neonColor : def.secondaryColor,
        emissive: (isNeon || def.rarity === 'Legendary') ? def.neonColor : 0x000000,
        emissiveIntensity: isNeon ? 0.85 : (def.rarity === 'Legendary' ? 0.5 : 0),
        roughness: 0.3
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: def.id === 'dragon' ? 0xc084fc : 0x111827 });

    // Body
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.9, 1.65), bodyMat);
    bodyMesh.position.set(0, 0.85, 0);
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    // Belly / Secondary chest patch
    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 0.25), secMat);
    chestMesh.position.set(0, 0.82, -0.78);
    root.add(chestMesh);

    // Head
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.98, 1.02), bodyMat);
    headMesh.position.set(0, 1.52, -0.72);
    headMesh.castShadow = true;
    root.add(headMesh);

    // Snout / Beak
    const snoutColor = def.id === 'penguin' ? 0xfacc15 : def.secondaryColor;
    const snoutMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.38, 0.42),
        new THREE.MeshStandardMaterial({ color: snoutColor, roughness: 0.4 })
    );
    snoutMesh.position.set(0, 1.38, -1.32);
    root.add(snoutMesh);

    // Cute Nose tip
    if (def.id !== 'penguin') {
        const noseMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.16, 0.12),
            new THREE.MeshBasicMaterial({ color: def.id === 'unicorn' || def.id === 'bunny' ? 0xf472b6 : 0x111827 })
        );
        noseMesh.position.set(0, 1.48, -1.52);
        root.add(noseMesh);
    }

    // Eyes
    [-0.28, 0.28].forEach(ex => {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.08), eyeMat);
        eye.position.set(ex, 1.62, -1.24);
        root.add(eye);
    });

    // Ears
    if (def.earStyle === 'long') {
        [-0.3, 0.3].forEach(ex => {
            const ear = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.82, 0.22), secMat);
            ear.position.set(ex, 2.28, -0.68);
            root.add(ear);
        });
    } else if (def.earStyle === 'floppy') {
        [-0.58, 0.58].forEach(ex => {
            const ear = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.55, 0.36), secMat);
            ear.position.set(ex, 1.52, -0.68);
            root.add(ear);
        });
    } else if (def.earStyle === 'horns') {
        [-0.36, 0.36].forEach(ex => {
            const horn = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.72, 8), secMat);
            horn.position.set(ex, 2.22, -0.62);
            horn.rotation.x = -0.3;
            root.add(horn);
        });
    } else {
        [-0.34, 0.34].forEach(ex => {
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 4), secMat);
            ear.position.set(ex, 2.15, -0.68);
            root.add(ear);
        });
    }

    // Unicorn Golden Horn & Rainbow Mane
    if (def.hasHorn) {
        const hornMesh = new THREE.Mesh(
            new THREE.ConeGeometry(0.16, 0.85, 12),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.75, metalness: 0.7 })
        );
        hornMesh.position.set(0, 2.32, -0.95);
        hornMesh.rotation.x = -0.45;
        root.add(hornMesh);

        const maneMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.75, 0.45), secMat);
        maneMesh.position.set(0, 1.72, -0.2);
        root.add(maneMesh);
    }

    // 4 Animated Legs
    const legs = [];
    const legPositions = [
        [-0.38, 0.4, -0.52],
        [0.38, 0.4, -0.52],
        [-0.38, 0.4, 0.52],
        [0.38, 0.4, 0.52]
    ];
    legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.3), bodyMat);
        leg.position.set(lx, ly, lz);
        root.add(leg);
        legs.push(leg);
    });

    // Tail (or Multi-Tail for Kitsune)
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 1.05, 0.85);
    if (def.hasMultiTail) {
        [-0.35, 0, 0.35].forEach(tx => {
            const t = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.65, 0.75), secMat);
            t.position.set(tx, 0.2, 0.3);
            t.rotation.x = 0.5;
            tailGroup.add(t);
        });
    } else {
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.75), secMat);
        tail.position.set(0, 0.15, 0.25);
        tail.rotation.x = 0.45;
        tailGroup.add(tail);
    }
    root.add(tailGroup);

    // Wings (for Unicorn, Dragon, or when flying!)
    const leftWingPivot = new THREE.Group();
    leftWingPivot.position.set(-0.58, 1.2, 0);
    const wingGeo = new THREE.BoxGeometry(1.25, 0.12, 0.85);
    const leftWing = new THREE.Mesh(wingGeo, secMat);
    leftWing.position.set(-0.6, 0.1, 0);
    leftWingPivot.add(leftWing);
    leftWingPivot.visible = !!def.hasWings;
    root.add(leftWingPivot);

    const rightWingPivot = new THREE.Group();
    rightWingPivot.position.set(0.58, 1.2, 0);
    const rightWing = new THREE.Mesh(wingGeo, secMat);
    rightWing.position.set(0.6, 0.1, 0);
    rightWingPivot.add(rightWing);
    rightWingPivot.visible = !!def.hasWings;
    root.add(rightWingPivot);

    // Floating Need Orb above pet head
    const needOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.85 })
    );
    needOrb.position.set(0, 2.85, -0.5);
    needOrb.visible = false;
    root.add(needOrb);

    // Neon Ring under pet when Full Grown Neon
    const neonRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.08, 10, 24),
        new THREE.MeshBasicMaterial({ color: def.neonColor })
    );
    neonRing.rotation.x = Math.PI / 2;
    neonRing.position.y = 0.15;
    neonRing.visible = isNeon;
    root.add(neonRing);

    return {
        root,
        legs,
        tailGroup,
        leftWingPivot,
        rightWingPivot,
        needOrb,
        neonRing,
        def
    };
}

function refreshAdoptMeHUD() {
    const gd = gameSpecificData;
    if (!gd || activeGameMode !== 'adoptme') return;
    const activePetEntry = gd.pets[gd.activePetIdx] || gd.pets[0];
    const petDef = ADOPT_ME_PET_CATALOG[activePetEntry.id] || ADOPT_ME_PET_CATALOG.dog;
    const stageName = ADOPT_ME_AGE_STAGES[Math.min(ADOPT_ME_AGE_STAGES.length - 1, activePetEntry.ageIdx || 0)];

    document.getElementById('hud-extra-label').textContent = 'Adopt Me: ';
    document.getElementById('hud-extra-value').textContent =
        `💵 $${gd.bucks} • ${petDef.icon} ${petDef.name} (${stageName}) • Sbírka: ${gd.pets.length}`;

    if (gd.currentNeed) {
        document.getElementById('hud-objective-title').textContent =
            `POTŘEBA MAZLÍČKA: ${gd.currentNeed.name}`;
        document.getElementById('hud-objective-text').textContent =
            `${gd.currentNeed.hint} (Odměna: +$${gd.currentNeed.bucks} & +${gd.currentNeed.bobux} B$)`;
    } else {
        document.getElementById('hud-objective-title').textContent =
            `ADOPT ME! – ${petDef.icon} ${petDef.name} (${petDef.rarity})`;
        document.getElementById('hud-objective-text').textContent =
            'Mazlíček je spokojený! Vylíhni vajíčka v Nursery ($35 / $65 / $120), létej [Slot 3] nebo obchoduj na Trade stanovišti!';
    }
}

function spawnAdoptMeActivePetMesh() {
    const gd = gameSpecificData;
    if (!gd) return;
    if (gd.activePetMesh && gd.activePetMesh.root) {
        scene.remove(gd.activePetMesh.root);
        disposeObject3D(gd.activePetMesh.root);
    }
    const activePetEntry = gd.pets[gd.activePetIdx] || gd.pets[0];
    const isNeon = (activePetEntry.ageIdx || 0) >= ADOPT_ME_AGE_STAGES.length - 1;
    gd.activePetMesh = createAdoptMePetMesh(activePetEntry.id, isNeon);
    gd.activePetMesh.root.position.copy(gd.petPos);
    scene.add(gd.activePetMesh.root);
    refreshAdoptMeHUD();
}

function completeAdoptMeNeed(needId) {
    const gd = gameSpecificData;
    if (!gd || !gd.currentNeed || gd.currentNeed.id !== needId) return false;

    const need = gd.currentNeed;
    gd.currentNeed = null;
    gd.needTimer = 7.5; // Next need in 7.5 seconds

    gd.bucks += need.bucks;
    addBobux(need.bobux, `Splněna potřeba mazlíčka (${need.name})`);

    const activePetEntry = gd.pets[gd.activePetIdx] || gd.pets[0];
    activePetEntry.tasksDone = (activePetEntry.tasksDone || 0) + 1;
    const prevAge = activePetEntry.ageIdx || 0;
    const newAge = Math.min(ADOPT_ME_AGE_STAGES.length - 1, Math.floor(activePetEntry.tasksDone / 2));
    activePetEntry.ageIdx = newAge;

    saveAdoptMeData(gd.bucks, gd.pets);
    sfx.playWinFanfare();
    spawnObbyConfetti(gd.petPos.clone().add(new THREE.Vector3(0, 2, 0)));

    const petDef = ADOPT_ME_PET_CATALOG[activePetEntry.id] || ADOPT_ME_PET_CATALOG.dog;
    if (newAge > prevAge) {
        const stageName = ADOPT_ME_AGE_STAGES[newAge];
        showHudToast(`🎉 ${petDef.icon} ${petDef.name} vyrostl na úroveň: ${stageName}!`, 'gold');
        if (newAge === ADOPT_ME_AGE_STAGES.length - 1) {
            addBobux(180, `Mazlíček ${petDef.name} dosáhl FULL GROWN NEON!`);
            spawnAdoptMeActivePetMesh();
        }
    } else {
        showHudToast(`Splněno: ${need.name}! (+$${need.bucks} Bucks & +${need.bobux} B$)`, 'green');
    }

    if (gd.activePetMesh && gd.activePetMesh.needOrb) {
        gd.activePetMesh.needOrb.visible = false;
    }
    refreshAdoptMeHUD();
    return true;
}

function hatchAdoptMeEgg(eggStand) {
    const gd = gameSpecificData;
    if (!gd || gd.hatchCooldown > 0) return;

    if (gd.bucks < eggStand.cost) {
        gd.hatchCooldown = 1.8;
        showHudToast(`Potřebuješ $${eggStand.cost} Bucks pro ${eggStand.name}! Plň potřeby mazlíčka nebo sbírej peníze u Money Tree.`, 'red');
        return;
    }

    gd.hatchCooldown = 2.6;
    gd.bucks -= eggStand.cost;

    // Weighted random pet selection from this egg's pool
    const pool = eggStand.pool;
    const totalWeight = pool.reduce((s, item) => s + item.weight, 0);
    let roll = Math.random() * totalWeight;
    let chosenId = pool[0].id;
    for (let i = 0; i < pool.length; i++) {
        roll -= pool[i].weight;
        if (roll <= 0) {
            chosenId = pool[i].id;
            break;
        }
    }

    const newPet = { id: chosenId, tasksDone: 0, ageIdx: 0 };
    gd.pets.push(newPet);
    gd.activePetIdx = gd.pets.length - 1;
    saveAdoptMeData(gd.bucks, gd.pets);

    const petDef = ADOPT_ME_PET_CATALOG[chosenId];
    sfx.playWinFanfare();
    spawnObbyConfetti(eggStand.pos.clone().add(new THREE.Vector3(0, 2.5, 0)));
    spawnAdoptMeActivePetMesh();

    const bonusBobux = petDef.rarity === 'Legendary' ? 120 : (petDef.rarity === 'Ultra-Rare' ? 75 : 45);
    addBobux(bonusBobux, `Vylíhnut ${petDef.icon} ${petDef.name} (${petDef.rarity})!`);
    showHudToast(`🥚 VYLÍHNUTO Z ${eggStand.name.toUpperCase()}: ${petDef.icon} ${petDef.name} [${petDef.rarity}]!`, 'gold');
}

function setupGame11AdoptMe() {
    // Bright playadopt.me pastel sky & turquoise water surroundings
    scene.background = new THREE.Color(0x7dd3fc);
    scene.fog = new THREE.FogExp2(0xbae6fd, 0.0028);

    const saved = loadAdoptMeSavedData();

    playerState.spawnPoint.set(0, 3, 30);
    playerState.pos.copy(playerState.spawnPoint);

    // 1. Turquoise Ocean Floor
    createBlock(0, -1.8, 0, 170, 1.5, 170, 0x06b6d4, { roughness: 0.2, metalness: 0.1 });

    // 2. Neighborhood / Player Spawn Island (South at Z = +34)
    createBlock(0, 0, 34, 34, 2.2, 22, 0x4ade80);
    // Cozy Pastel Player House on Neighborhood Island (X = -10, Z = +35)
    createBlock(-10, 3.0, 35, 9, 4.8, 8, 0xfef08a);
    createBlock(-10, 6.2, 35, 10.2, 1.8, 9.2, 0xf472b6); // Pink Roof
    createBlock(-10, 2.1, 30.8, 2.2, 3.0, 0.4, 0xdb2777); // Door
    // Money Tree next to Player House (generates free Adopt Me Bucks!)
    createBlock(-3, 2.2, 34, 1.2, 3.4, 1.2, 0x78350f);
    const moneyTreeCrown = createBlock(-3, 4.6, 34, 3.8, 2.8, 3.8, 0x10b981, {
        emissive: 0x059669,
        emissiveIntensity: 0.45
    });

    // 3. Iconic Red Arched Adopt Me! Bridge connecting Neighborhood (Z=23) to Adoption Island (Z=13)
    createBlock(0, 0.6, 18, 7.5, 1.2, 12, 0xef4444);
    createBlock(-3.5, 2.1, 18, 0.6, 2.2, 12, 0xdc2626);
    createBlock(3.5, 2.1, 18, 0.6, 2.2, 12, 0xdc2626);
    // Golden Arch over the Red Bridge
    createBlock(-3.5, 4.5, 18, 0.7, 3.0, 1.2, 0xfacc15);
    createBlock(3.5, 4.5, 18, 0.7, 3.0, 1.2, 0xfacc15);
    createBlock(0, 6.2, 18, 7.8, 0.9, 1.4, 0xfacc15, { emissive: 0xca8a04, emissiveIntensity: 0.4 });

    // 4. Main Adoption Island Plaza (X = -30..+30, Z = -32..+12)
    createBlock(0, 0, -10, 62, 2.2, 46, 0x22c55e);
    // Cobblestone / Pastel Town Square Pathways
    createBlock(0, 1.15, -6, 10, 0.15, 36, 0xfef3c7);
    createBlock(0, 1.15, -6, 46, 0.15, 8, 0xfef3c7);

    // 5. THE NURSERY (Adopční Centrum) at North Plaza (X = 0, Z = -24)
    createBlock(0, 4.2, -25, 26, 6.5, 10, 0xfef9c3); // Cream Castle Walls
    createBlock(0, 8.4, -25, 28, 2.2, 11.5, 0xec4899); // Iconic Pink Nursery Roof
    createBlock(0, 10.6, -25, 12, 2.4, 7, 0xf472b6); // Upper Castle Tower
    createBlock(0, 12.6, -25, 4, 2.2, 4, 0xfacc15, { emissive: 0xeab308, emissiveIntensity: 0.6 }); // Golden Crown Top
    // Nursery Entrance Arch
    createBlock(0, 2.8, -19.8, 5.5, 3.8, 0.6, 0xdb2777);

    // 3 EGG HATCHING PEDESTALS (Gumball Machine Incubators) in front of the Nursery (Z = -16.5)
    const eggStands = [
        {
            id: 'cracked_egg',
            name: 'Cracked Egg ($35)',
            cost: 35,
            pos: new THREE.Vector3(-6.5, 1.2, -16.5),
            padColor: 0xfde047,
            eggColor: 0xfef3c7,
            spotColor: 0xd97706,
            pool: [
                { id: 'dog', weight: 40 },
                { id: 'cat', weight: 35 },
                { id: 'penguin', weight: 14 },
                { id: 'bunny', weight: 8 },
                { id: 'redpanda', weight: 3 }
            ]
        },
        {
            id: 'pet_egg',
            name: 'Pet Egg ($65)',
            cost: 65,
            pos: new THREE.Vector3(0, 1.2, -16.5),
            padColor: 0x38bdf8,
            eggColor: 0xe0f2fe,
            spotColor: 0x0284c7,
            pool: [
                { id: 'penguin', weight: 30 },
                { id: 'bunny', weight: 28 },
                { id: 'redpanda', weight: 22 },
                { id: 'kitsune', weight: 12 },
                { id: 'unicorn', weight: 5 },
                { id: 'dragon', weight: 3 }
            ]
        },
        {
            id: 'royal_egg',
            name: 'Royal Legendary Egg ($120)',
            cost: 120,
            pos: new THREE.Vector3(6.5, 1.2, -16.5),
            padColor: 0xec4899,
            eggColor: 0xffffff,
            spotColor: 0xfacc15,
            pool: [
                { id: 'redpanda', weight: 22 },
                { id: 'kitsune', weight: 28 },
                { id: 'unicorn', weight: 27 },
                { id: 'dragon', weight: 23 }
            ]
        }
    ];

    eggStands.forEach(stand => {
        // Pedestal Base
        createBlock(stand.pos.x, 1.4, stand.pos.z, 3.4, 0.6, 3.4, stand.padColor, {
            emissive: stand.padColor,
            emissiveIntensity: 0.35
        });
        // 3D Egg Mesh floating above pedestal
        const eggGroup = new THREE.Group();
        const eggShell = new THREE.Mesh(
            new THREE.SphereGeometry(0.95, 16, 16),
            new THREE.MeshStandardMaterial({ color: stand.eggColor, roughness: 0.25, metalness: 0.15 })
        );
        eggShell.scale.set(1, 1.32, 1);
        eggGroup.add(eggShell);

        // Egg Belt / Crown Ring
        const eggRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.88, 0.12, 8, 20),
            new THREE.MeshStandardMaterial({ color: stand.spotColor, emissive: stand.spotColor, emissiveIntensity: 0.4 })
        );
        eggRing.rotation.x = Math.PI / 2;
        eggGroup.add(eggRing);

        eggGroup.position.set(stand.pos.x, 3.1, stand.pos.z);
        scene.add(eggGroup);
        stand.eggMesh = eggGroup;
    });

    // 6. CARE STATION 1: SLEEPY CRIBS (vlevo u Nursery, X = -19, Z = -16)
    createBlock(-19, 1.3, -16, 8, 0.4, 8, 0xa855f7, { emissive: 0x7e22ce, emissiveIntensity: 0.4 });
    createBlock(-19, 2.2, -18.5, 6, 1.8, 2.5, 0xf472b6); // Pink Pet Crib
    createBlock(-19, 2.2, -13.5, 6, 1.8, 2.5, 0x38bdf8); // Blue Pet Crib

    // 7. CARE STATION 2: CAMPING & HOT SPRINGS BATH (vpravo u Nursery, X = +19, Z = -16)
    createBlock(19, 1.3, -16, 9, 0.45, 9, 0x06b6d4, { emissive: 0x0891b2, emissiveIntensity: 0.55 });
    createBlock(19, 2.0, -19.8, 9, 1.4, 1.2, 0x94a3b8); // Hot Spring Stone Rim

    // 8. CARE STATION 3: HOSPITAL & GOLDEN APPLE (vlevo dole na ostrově, X = -20, Z = +1)
    createBlock(-20, 3.2, 1, 9, 4.5, 8, 0xffffff); // White Hospital Building
    createBlock(-20, 6.0, 1, 9.6, 1.0, 8.6, 0xef4444); // Red Cross Roof
    createBlock(-14.5, 1.3, 1, 4.5, 0.4, 4.5, 0x22c55e, { emissive: 0x16a34a, emissiveIntensity: 0.5 }); // Healing Pad
    const goldenApple = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 14, 14),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.7, metalness: 0.8 })
    );
    goldenApple.position.set(-14.5, 2.4, 1);
    scene.add(goldenApple);

    // 9. CARE STATION 4: PLAYGROUND & BOUNCY TRAMPOLINES (vpravo dole na ostrově, X = +20, Z = +1)
    createBlock(20, 1.3, 1, 10, 0.4, 10, 0xfacc15, { emissive: 0xca8a04, emissiveIntensity: 0.35 });
    // 2 Bouncy Trampoline Pads (isBoost launches player upward!)
    const tramp1 = createBlock(18, 1.65, -1, 3.4, 0.5, 3.4, 0xec4899, { emissive: 0xdb2777, emissiveIntensity: 0.5 });
    const tramp2 = createBlock(22, 1.65, 3, 3.4, 0.5, 3.4, 0x38bdf8, { emissive: 0x0284c7, emissiveIntensity: 0.5 });

    // 10. CENTRAL TRADE HUB & FEEDER FOUNTAIN (X = 0, Z = -4)
    createBlock(0, 1.3, -4, 7.5, 0.45, 7.5, 0xf59e0b, { emissive: 0xd97706, emissiveIntensity: 0.4 });
    // Feeder & Water Bowls next to center plaza (X = -5, Z = -8)
    createBlock(-5.5, 1.5, -8, 2.2, 0.6, 2.2, 0xef4444); // Food Bowl
    createBlock(5.5, 1.5, -8, 2.2, 0.6, 2.2, 0x38bdf8);  // Water Bowl

    // 11. Friendly Adopt Me! NPC Collectors with their own 3D Pets
    const npcs = [
        { name: 'Trader_Mia', pos: new THREE.Vector3(-3.2, 1.2, -3.5), torso: 0xec4899, petId: 'unicorn', neon: true },
        { name: 'NeonCollector_Leo', pos: new THREE.Vector3(4.2, 1.2, -5.0), torso: 0x0284c7, petId: 'dragon', neon: true },
        { name: 'Nursery_Anna', pos: new THREE.Vector3(-9.5, 1.2, -13.5), torso: 0x10b981, petId: 'kitsune', neon: false }
    ];
    const npcEntities = npcs.map(n => {
        const charMesh = createBlockyCharacterMesh({
            headColor: 0xF5CD30,
            torsoColor: n.torso,
            legColor: 0x1e293b
        });
        charMesh.root.position.copy(n.pos);
        scene.add(charMesh.root);

        const petMesh = createAdoptMePetMesh(n.petId, n.neon);
        petMesh.root.position.set(n.pos.x + 1.8, n.pos.y, n.pos.z + 0.8);
        scene.add(petMesh.root);

        return {
            name: n.name,
            basePos: n.pos.clone(),
            charMesh,
            petMesh,
            phase: Math.random() * 6.28
        };
    });

    gameSpecificData = {
        bucks: saved.bucks,
        pets: saved.pets,
        activePetIdx: saved.pets.length - 1,
        activePetMesh: null,
        petPos: new THREE.Vector3(2.2, 1.2, 30),
        isRidingPet: false,
        currentNeed: ADOPT_ME_NEEDS[0], // Start with Hungry so player immediately experiences feeding!
        needTimer: 6.0,
        hatchCooldown: 0,
        tradeCooldown: 0,
        moneyTreeTimer: 0,
        eggStands,
        goldenApple,
        trampolines: [tramp1, tramp2],
        npcEntities,
        confettiParticles: []
    };

    spawnAdoptMeActivePetMesh();
    if (gameSpecificData.activePetMesh && gameSpecificData.activePetMesh.needOrb) {
        gameSpecificData.activePetMesh.needOrb.visible = true;
        gameSpecificData.activePetMesh.needOrb.material.color.setHex(ADOPT_ME_NEEDS[0].color);
        gameSpecificData.activePetMesh.needOrb.material.emissive.setHex(ADOPT_ME_NEEDS[0].color);
    }
    refreshAdoptMeHUD();
}

/* ============================================================================
 * 12. GAME 12: "BLOX VEGAS: CASINO & DERBY" (BLACKJACK, SLOTS, WHEEL, DERBY)
 * ============================================================================ */
const CASINO_STATIONS = [
    { id: 'blackjack', name: 'Blackjack (21)', icon: '🃏', pos: new THREE.Vector3(-18, 1.2, -8), radius: 6.0 },
    { id: 'slots', name: 'Výherní Automaty', icon: '🎰', pos: new THREE.Vector3(18, 1.2, -8), radius: 6.0 },
    { id: 'wheel', name: 'Denní Kolo Štěstí', icon: '🎡', pos: new THREE.Vector3(0, 1.2, -18), radius: 6.0 },
    { id: 'derby', name: 'Koňské Dostihy', icon: '🏇', pos: new THREE.Vector3(0, 1.2, 14), radius: 6.5 },
    { id: 'cashier', name: 'Pokladna & Info', icon: '🪙', pos: new THREE.Vector3(-20, 1.2, 24), radius: 6.0 }
];

function setupGame12Casino() {
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.007);

    document.getElementById('hud-objective-title').textContent = '🎰 BLOX VEGAS CASINO';
    document.getElementById('hud-objective-text').textContent = 'Vstup do světa her! Přistup ke stolům nebo vyber hru z lišty (1-5) a vyhraj Bobuxy!';
    document.getElementById('hud-extra-label').textContent = 'Zůstatek: ';
    document.getElementById('hud-extra-value').textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;

    if (typeof sfx !== 'undefined' && typeof sfx.playCasinoMusic === 'function') {
        sfx.playCasinoMusic();
    }

    playerState.spawnPoint.set(0, 3, 26);
    playerState.pos.copy(playerState.spawnPoint);

    // 1. Luxurious Velvet Royal Carpet Floor (80x80)
    createBlock(0, 0, 0, 80, 1.5, 80, 0x4c0519); // Deep Burgundy Velvet Carpet
    // Center Golden Plaza Disc / Crossways
    createBlock(0, 0.8, 0, 18, 0.2, 18, 0xd97706); // Golden Center Star
    createBlock(0, 0.82, -9, 4.5, 0.18, 18, 0xf59e0b); // North Golden Carpet Path
    createBlock(0, 0.82, 9, 4.5, 0.18, 18, 0xf59e0b);  // South Golden Carpet Path
    createBlock(-9, 0.82, 0, 18, 0.18, 4.5, 0xf59e0b); // West Golden Carpet Path
    createBlock(9, 0.82, 0, 18, 0.18, 4.5, 0xf59e0b);  // East Golden Carpet Path

    // 2. Mahogany Walls & Grand Casino Perimeter
    createBlock(0, 6.5, -40, 80, 14, 2, 0x1e1b18); // North Wall
    createBlock(0, 6.5, 40, 80, 14, 2, 0x1e1b18);  // South Wall
    createBlock(-40, 6.5, 0, 2, 14, 80, 0x1e1b18); // West Wall
    createBlock(40, 6.5, 0, 2, 14, 80, 0x1e1b18);  // East Wall

    // 3. Classical Golden Pillars (8 Columns)
    const pillarPositions = [
        [-14, -14], [14, -14], [-14, 14], [14, 14],
        [-28, -24], [28, -24], [-28, 24], [28, 24]
    ];
    pillarPositions.forEach(p => {
        // Pillar Base & Top Rings
        createBlock(p[0], 1.2, p[1], 2.8, 0.8, 2.8, 0xfacc15);
        createBlock(p[0], 7.0, p[1], 2.0, 11, 2.0, 0x1e293b);
        createBlock(p[0], 12.8, p[1], 2.8, 0.8, 2.8, 0xfacc15);
    });

    // 4. Grand Golden Chandeliers Hanging from Ceiling
    const chandelierPositions = [[0, 0], [-18, -10], [18, -10], [0, 16], [-20, 22]];
    chandelierPositions.forEach(cp => {
        const chan = new THREE.Mesh(
            new THREE.SphereGeometry(1.4, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.85 })
        );
        chan.position.set(cp[0], 13.5, cp[1]);
        scene.add(chan);
    });

    // 5. STATION 1: 🃏 BLACKJACK ZONE (West at X = -18, Z = -8)
    createBlock(-18, 0.85, -8, 14, 0.25, 12, 0x064e3b, { emissive: 0x064e3b, emissiveIntensity: 0.2 }); // Emerald Felt Pad
    // Semicircular / Pill-shaped Blackjack Table
    createBlock(-18, 1.8, -8, 8.5, 1.6, 5.2, 0x065f46);
    createBlock(-18, 2.65, -8, 9.2, 0.2, 5.8, 0x78350f); // Mahogany Trim
    // 3D Dealer NPC Character
    const dealerChar = createBlockyCharacterMesh({
        headColor: 0xF5CD30,
        torsoColor: 0x111827, // Black Tuxedo / Vest
        legColor: 0x1e293b
    });
    dealerChar.root.position.set(-18, 1.8, -11.5);
    scene.add(dealerChar.root);
    // Floating Neon Sign above Blackjack table
    const bjNeon = createBlock(-18, 7.5, -8, 7.5, 1.2, 0.8, 0x10b981, {
        emissive: 0x059669,
        emissiveIntensity: 0.85,
        noStuds: true
    });

    // 6. STATION 2: 🎰 SLOTS ZONE (East at X = 18, Z = -8)
    createBlock(18, 0.85, -8, 14, 0.25, 12, 0x831843, { emissive: 0x701a75, emissiveIntensity: 0.2 });
    // Row of 4 3D Slot Machines
    for (let i = 0; i < 4; i++) {
        const sx = 13.5 + i * 3.0;
        createBlock(sx, 2.6, -10, 2.2, 3.6, 2.2, 0x991b1b); // Red casing
        createBlock(sx, 4.4, -10, 2.2, 0.4, 2.2, 0xfacc15); // Gold top marquee
        createBlock(sx, 2.8, -8.8, 1.6, 1.4, 0.2, 0x0f172a, { emissive: 0xf59e0b, emissiveIntensity: 0.5 }); // Screen
        // Lever
        createBlock(sx + 1.2, 2.6, -9.5, 0.2, 1.8, 0.2, 0x94a3b8);
        const leverKnob = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        leverKnob.position.set(sx + 1.2, 3.5, -9.5);
        scene.add(leverKnob);
    }
    // Floating Neon Sign above Slots
    const slotsNeon = createBlock(18, 7.5, -8, 7.5, 1.2, 0.8, 0xf59e0b, {
        emissive: 0xd97706,
        emissiveIntensity: 0.85,
        noStuds: true
    });

    // 7. STATION 3: 🎡 DENNÍ KOLO ŠTĚSTÍ (North Center at X = 0, Z = -18)
    createBlock(0, 1.1, -18, 9, 0.7, 9, 0xd97706); // Golden Raised Pedestal
    // Giant 3D Spinning Wheel Mesh Standing Vertically
    const wheelGroup = new THREE.Group();
    const wheelRim = new THREE.Mesh(
        new THREE.CylinderGeometry(3.6, 3.6, 0.6, 24),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.25 })
    );
    wheelRim.rotation.x = Math.PI / 2;
    wheelGroup.add(wheelRim);
    // Colored Pie Slices
    const wColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x06b6d4, 0xec4899, 0xfde047];
    for (let s = 0; s < 8; s++) {
        const wedge = new THREE.Mesh(
            new THREE.CylinderGeometry(3.4, 3.4, 0.65, 3, 1, false, (s * Math.PI) / 4, Math.PI / 4),
            new THREE.MeshStandardMaterial({ color: wColors[s % wColors.length], emissive: wColors[s % wColors.length], emissiveIntensity: 0.25 })
        );
        wedge.rotation.x = Math.PI / 2;
        wheelGroup.add(wedge);
    }
    // Golden Center Hub
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfacc15, emissiveIntensity: 0.6 }));
    wheelGroup.add(hub);

    wheelGroup.position.set(0, 5.2, -18);
    scene.add(wheelGroup);

    // Golden Pointer Needle at Top of Wheel
    const pointer = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.1, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.6 }));
    pointer.position.set(0, 9.2, -18);
    pointer.rotation.z = Math.PI;
    scene.add(pointer);

    // Floating Neon Sign above Wheel
    createBlock(0, 11.2, -18, 8, 1.2, 0.8, 0xfacc15, {
        emissive: 0xeab308,
        emissiveIntensity: 0.85,
        noStuds: true
    });

    // 8. STATION 4: 🏇 KOŇSKÉ DOSTIHY (South Arena at X = 0, Z = 14)
    createBlock(0, 0.9, 14, 22, 0.35, 12, 0x15803d); // Green Turf Track
    // White Wooden Rail Fences around track
    createBlock(0, 1.5, 8.2, 22, 0.7, 0.3, 0xffffff);
    createBlock(0, 1.5, 19.8, 22, 0.7, 0.3, 0xffffff);
    createBlock(-10.8, 1.5, 14, 0.3, 0.7, 12, 0xffffff);
    createBlock(10.8, 1.5, 14, 0.3, 0.7, 12, 0xffffff);

    // 5 Miniature 3D Blocky Racing Horses in Stalls
    const horseColors = [0x00A2FF, 0xEF4444, 0x8B5CF6, 0x10B981, 0xFACC15];
    const horses3D = [];
    for (let h = 0; h < 5; h++) {
        const horseGroup = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
        const saddleMat = new THREE.MeshStandardMaterial({ color: horseColors[h], emissive: horseColors[h], emissiveIntensity: 0.35 });
        // Horse Body & Neck
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.7), bodyMat);
        body.position.y = 1.1;
        horseGroup.add(body);
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), bodyMat);
        neck.position.set(0.65, 1.6, 0);
        neck.rotation.z = -0.35;
        horseGroup.add(neck);
        // Jockey Torso on saddle
        const jockey = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.55), saddleMat);
        jockey.position.set(0.1, 1.8, 0);
        horseGroup.add(jockey);
        const jockeyHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xF5CD30 }));
        jockeyHead.position.set(0.1, 2.3, 0);
        horseGroup.add(jockeyHead);

        // Position in starting lane
        horseGroup.position.set(-8.0, 0.9, 10.0 + h * 2.0);
        horseGroup.rotation.y = Math.PI / 2; // Facing right (towards finish)
        scene.add(horseGroup);
        horses3D.push({ group: horseGroup, baseZ: 10.0 + h * 2.0, idx: h });
    }

    // Floating Neon Sign above Derby Track
    createBlock(0, 5.8, 14, 8, 1.2, 0.8, 0x06b6d4, {
        emissive: 0x0891b2,
        emissiveIntensity: 0.85,
        noStuds: true
    });

    // 9. STATION 5: 🪙 POKLADNA & VIP LOUNGE (X = -20, Z = 24)
    createBlock(-20, 1.8, 24, 7, 1.6, 3, 0x1e293b);
    createBlock(-20, 2.65, 24, 7.6, 0.2, 3.4, 0xfacc15); // Golden top counter
    // Golden Bullion Bars on Counter
    for (let g = 0; g < 3; g++) {
        createBlock(-22 + g * 1.8, 2.9, 24, 1.2, 0.35, 0.6, 0xfacc15, { emissive: 0xca8a04, emissiveIntensity: 0.5 });
    }
    // Cashier NPC
    const cashierChar = createBlockyCharacterMesh({ headColor: 0xF5CD30, torsoColor: 0x059669, legColor: 0x111827 });
    cashierChar.root.position.set(-20, 1.8, 26.2);
    scene.add(cashierChar.root);

    // Initialize Game Specific State
    gameSpecificData = {
        stations: CASINO_STATIONS,
        wheelMesh: wheelGroup,
        horses3D,
        dealerChar,
        activeProximityStation: null,
        confettiParticles: []
    };

    updateCasinoBobuxDisplay();
    renderDerbyHorsesList();
    renderCasinoWheel();
    updateDailyWheelTimer();
}

/* ============================================================================
 * CASINO UI MODAL & VIEW SWITCHER
 * ============================================================================ */
let activeCasinoTab = 'blackjack';

function updateCasinoBobuxDisplay() {
    const el = document.getElementById('casino-bobux-display');
    if (el) el.textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;
    const elHud = document.getElementById('hud-bobux-count');
    if (elHud) elHud.textContent = bobuxBalance.toLocaleString('cs-CZ');
    const elExtra = document.getElementById('hud-extra-value');
    if (elExtra && activeGameMode === 'casino') elExtra.textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;
}

function openCasinoModal(tabName = 'blackjack') {
    if (document.pointerLockElement) {
        try { document.exitPointerLock(); } catch (e) {}
    }
    const modal = document.getElementById('casino-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    updateCasinoBobuxDisplay();
    if (typeof sfx !== 'undefined') {
        if (typeof sfx.syncMusicUI === 'function') sfx.syncMusicUI();
        if (sfx.isPlayingMusic && sfx.musicAudio && sfx.musicAudio.paused) {
            sfx.musicAudio.play().catch(() => {});
        }
    }
    switchCasinoTab(tabName);
}

function closeCasinoModal() {
    const modal = document.getElementById('casino-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    // Refocus canvas for smooth gameplay
    const canvas = document.getElementById('three-canvas');
    if (canvas && activeGameMode === 'casino') {
        canvas.focus();
    }
}

function switchCasinoTab(tabName) {
    activeCasinoTab = tabName;
    const tabs = ['blackjack', 'slots', 'wheel', 'derby', 'cashier'];
    tabs.forEach(t => {
        const btn = document.getElementById(`casino-tab-btn-${t}`);
        const view = document.getElementById(`casino-view-${t}`);
        if (btn) {
            if (t === tabName) {
                btn.className = 'casino-nav-tab px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-[#00B06F] text-white shrink-0';
            } else {
                btn.className = 'casino-nav-tab px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition text-gray-300 hover:text-white hover:bg-white/10 shrink-0';
            }
        }
        if (view) {
            if (t === tabName) view.classList.remove('hidden');
            else view.classList.add('hidden');
        }
    });

    updateCasinoBobuxDisplay();

    if (tabName === 'wheel') {
        renderCasinoWheel();
        updateDailyWheelTimer();
    } else if (tabName === 'derby') {
        renderDerbyHorsesList();
    }
}

/* ============================================================================
 * A. BLACKJACK (21) GAME ENGINE
 * ============================================================================ */
const bjState = {
    deck: [],
    dealerHand: [],
    playerHand: [],
    bet: 50,
    betBeforeDouble: null,
    phase: 'betting' // 'betting' | 'playing' | 'dealer' | 'finished'
};

function createShuffledDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    suits.forEach(suit => {
        values.forEach(val => {
            deck.push({ val, suit, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' });
        });
    });
    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function calculateHandScore(hand, hideFirstCard = false) {
    if (!hand || hand.length === 0) return { total: 0, isSoft: false, isBust: false, isBlackjack: false };
    const cardsToScore = hideFirstCard ? hand.slice(1) : hand;
    let sum = 0;
    let aces = 0;
    cardsToScore.forEach(card => {
        if (card.val === 'A') {
            aces++;
            sum += 11;
        } else if (['K', 'Q', 'J'].includes(card.val)) {
            sum += 10;
        } else {
            sum += parseInt(card.val, 10);
        }
    });
    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    const isBust = sum > 21;
    const isBlackjack = hand.length === 2 && sum === 21;
    return { total: sum, isSoft: aces > 0, isBust, isBlackjack };
}

function renderHandCards(containerId, hand, hideHoleCard = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    hand.forEach((card, idx) => {
        const cardEl = document.createElement('div');
        if (hideHoleCard && idx === 0) {
            cardEl.className = 'casino-playing-card casino-card-hidden';
            cardEl.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white/50 text-xl font-bold">🂠</div>';
        } else {
            const isRed = card.color === 'red';
            const colClass = isRed ? 'text-red-600' : 'text-slate-900';
            cardEl.className = `casino-playing-card ${colClass}`;
            cardEl.innerHTML = `
                <div class="text-left text-xs font-black leading-none">${card.val}<br>${card.suit}</div>
                <div class="text-center text-2xl font-black leading-none">${card.suit}</div>
                <div class="text-right text-xs font-black leading-none rotate-180">${card.val}<br>${card.suit}</div>
            `;
        }
        container.appendChild(cardEl);
    });
}

function setBjBet(amount) {
    if (bjState.phase === 'playing') return;
    bjState.bet = amount;
    const el = document.getElementById('bj-current-bet');
    if (el) el.textContent = `${bjState.bet} B$`;
    // Update chip active classes
    const chipBtns = document.querySelectorAll('#casino-view-blackjack .casino-chip-btn');
    chipBtns.forEach(btn => {
        btn.classList.toggle('casino-chip-active', parseInt(btn.textContent, 10) === amount);
    });
    sfx.playJump();
}

function clearBjBet() {
    if (bjState.phase === 'playing') return;
    setBjBet(10);
}

function dealBlackjack() {
    if (bjState.phase === 'playing') return;
    if (bobuxBalance < bjState.bet) {
        showHudToast(`Nemáš dostatek Bobuxů! (Máš ${bobuxBalance} B$, sázka je ${bjState.bet} B$)`, 'red');
        return;
    }
    if (!spendBobux(bjState.bet, `Blackjack sázka (${bjState.bet} B$)`)) return;

    updateCasinoBobuxDisplay();
    sfx.playCardFlip();

    if (bjState.deck.length < 15) {
        bjState.deck = createShuffledDeck();
    }

    bjState.playerHand = [bjState.deck.pop(), bjState.deck.pop()];
    bjState.dealerHand = [bjState.deck.pop(), bjState.deck.pop()];
    bjState.phase = 'playing';

    // Update buttons state
    document.getElementById('bj-btn-deal').disabled = true;
    document.getElementById('bj-btn-hit').disabled = false;
    document.getElementById('bj-btn-stand').disabled = false;
    document.getElementById('bj-btn-double').disabled = (bobuxBalance < bjState.bet);

    renderHandCards('bj-dealer-cards', bjState.dealerHand, true);
    renderHandCards('bj-player-cards', bjState.playerHand, false);

    const pScore = calculateHandScore(bjState.playerHand);
    const dScoreVisible = calculateHandScore([bjState.dealerHand[1]]);
    document.getElementById('bj-dealer-score').textContent = `Karta: ${dScoreVisible.total}`;
    document.getElementById('bj-player-score').textContent = `Součet: ${pScore.total}`;

    // Check Natural Blackjack for player
    if (pScore.isBlackjack) {
        setTimeout(resolveBlackjackDealerTurn, 600);
    } else {
        document.getElementById('bj-status-msg').textContent = 'Tvůj tah: Vezmi kartu (Hit), Stůj (Stand) nebo Zdvojnásob (Double)';
    }
}

function hitBlackjack() {
    if (bjState.phase !== 'playing') return;
    sfx.playCardFlip();
    bjState.playerHand.push(bjState.deck.pop());
    renderHandCards('bj-player-cards', bjState.playerHand, false);

    const pScore = calculateHandScore(bjState.playerHand);
    document.getElementById('bj-player-score').textContent = `Součet: ${pScore.total}`;
    document.getElementById('bj-btn-double').disabled = true;

    if (pScore.isBust) {
        finishBlackjackRound('bust');
    } else if (pScore.total === 21) {
        standBlackjack();
    }
}

function standBlackjack() {
    if (bjState.phase !== 'playing') return;
    bjState.phase = 'dealer';
    document.getElementById('bj-btn-hit').disabled = true;
    document.getElementById('bj-btn-stand').disabled = true;
    document.getElementById('bj-btn-double').disabled = true;
    resolveBlackjackDealerTurn();
}

function doubleBlackjack() {
    if (bjState.phase !== 'playing' || bjState.playerHand.length !== 2) return;
    if (bobuxBalance < bjState.bet) {
        showHudToast('Nemáš dostatek Bobuxů na zdvojnásobení!', 'red');
        return;
    }
    spendBobux(bjState.bet, 'Blackjack Double Down');
    bjState.betBeforeDouble = bjState.bet;
    bjState.bet *= 2;
    updateCasinoBobuxDisplay();
    document.getElementById('bj-current-bet').textContent = `${bjState.bet} B$`;
    sfx.playCardFlip();
    bjState.playerHand.push(bjState.deck.pop());
    renderHandCards('bj-player-cards', bjState.playerHand, false);

    const pScore = calculateHandScore(bjState.playerHand);
    document.getElementById('bj-player-score').textContent = `Součet: ${pScore.total}`;

    if (pScore.isBust) {
        finishBlackjackRound('bust');
    } else {
        standBlackjack();
    }
}

function resolveBlackjackDealerTurn() {
    bjState.phase = 'dealer';
    // Reveal dealer's hole card
    renderHandCards('bj-dealer-cards', bjState.dealerHand, false);
    let dScore = calculateHandScore(bjState.dealerHand);
    document.getElementById('bj-dealer-score').textContent = `Součet: ${dScore.total}`;

    const pScore = calculateHandScore(bjState.playerHand);

    // Dealer draws to soft/hard 17
    function dealerStep() {
        dScore = calculateHandScore(bjState.dealerHand);
        document.getElementById('bj-dealer-score').textContent = `Součet: ${dScore.total}`;
        if (dScore.total < 17) {
            sfx.playCardFlip();
            bjState.dealerHand.push(bjState.deck.pop());
            renderHandCards('bj-dealer-cards', bjState.dealerHand, false);
            setTimeout(dealerStep, 500);
        } else {
            evaluateBlackjackWinner(pScore, dScore);
        }
    }
    setTimeout(dealerStep, 450);
}

function evaluateBlackjackWinner(pScore, dScore) {
    if (pScore.isBlackjack) {
        if (dScore.isBlackjack) {
            finishBlackjackRound('push', 'Oba mají Blackjack! Sázka vrácena (Push).');
        } else {
            const payout = Math.round(bjState.bet * 2.5); // Natural 3:2 payout
            finishBlackjackRound('blackjack', `🎉 PŘIROZENÝ BLACKJACK (3:2)! Vyhráváš ${payout} B$!`, payout);
        }
    } else if (dScore.isBust) {
        const payout = bjState.bet * 2;
        finishBlackjackRound('win', `🎉 KRUPIÉR PŘEBRA L (${dScore.total})! Vyhráváš ${payout} B$!`, payout);
    } else if (pScore.total > dScore.total) {
        const payout = bjState.bet * 2;
        finishBlackjackRound('win', `🎉 VYHRÁVÁŠ (${pScore.total} vs ${dScore.total})! Získáváš ${payout} B$!`, payout);
    } else if (pScore.total < dScore.total) {
        finishBlackjackRound('lose', `Krupiér vyhrál (${dScore.total} vs ${pScore.total}).`);
    } else {
        finishBlackjackRound('push', `Remíza (${pScore.total} vs ${dScore.total}). Sázka vrácena.`);
    }
}

function finishBlackjackRound(result, msg = '', payout = 0) {
    bjState.phase = 'finished';
    renderHandCards('bj-dealer-cards', bjState.dealerHand, false);
    const dScore = calculateHandScore(bjState.dealerHand);
    document.getElementById('bj-dealer-score').textContent = `Součet: ${dScore.total}`;

    const msgEl = document.getElementById('bj-status-msg');

    if (result === 'bust') {
        sfx.playOof();
        msgEl.textContent = `💥 PŘEKROČIL JSI 21 (BUST)! Ztráta sázky ${bjState.bet} B$.`;
        msgEl.className = 'py-2.5 px-4 rounded-xl bg-red-950/80 border border-red-500/60 text-center text-xs sm:text-sm font-black text-red-200 shadow';
    } else if (result === 'win' || result === 'blackjack') {
        sfx.playWinFanfare();
        addBobux(payout, 'Výhra v Blackjacku');
        updateCasinoBobuxDisplay();
        msgEl.textContent = msg;
        msgEl.className = 'py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-400 text-center text-xs sm:text-sm font-black text-emerald-200 shadow';
        if (gameSpecificData && gameSpecificData.dealerChar) {
            spawnObbyConfetti(gameSpecificData.dealerChar.root.position.clone().add(new THREE.Vector3(0, 2, 0)));
        }
    } else if (result === 'push') {
        sfx.playCoin();
        addBobux(bjState.bet, 'Blackjack remíza');
        updateCasinoBobuxDisplay();
        msgEl.textContent = msg;
        msgEl.className = 'py-2.5 px-4 rounded-xl bg-blue-950/80 border border-blue-400 text-center text-xs sm:text-sm font-bold text-blue-200 shadow';
    } else {
        sfx.playOof();
        msgEl.textContent = msg || 'Prohrál jsi tuto hru.';
        msgEl.className = 'py-2.5 px-4 rounded-xl bg-red-950/80 border border-red-500/60 text-center text-xs sm:text-sm font-bold text-red-200 shadow';
    }

    document.getElementById('bj-btn-deal').disabled = false;
    document.getElementById('bj-btn-hit').disabled = true;
    document.getElementById('bj-btn-stand').disabled = true;
    document.getElementById('bj-btn-double').disabled = true;

    if (bjState.betBeforeDouble !== null) {
        bjState.bet = bjState.betBeforeDouble;
        bjState.betBeforeDouble = null;
        const betDisplay = document.getElementById('bj-current-bet');
        if (betDisplay) betDisplay.textContent = `${bjState.bet} B$`;
    }
}

/* ============================================================================
 * B. VÝHERNÍ AUTOMATY (SLOTS) ENGINE
 * ============================================================================ */
const SLOTS_SYMBOLS = [
    { icon: '🍒', name: 'Třešně', mult: 2, weight: 30 },
    { icon: '🍋', name: 'Citron', mult: 4, weight: 24 },
    { icon: '🍇', name: 'Hrozny', mult: 8, weight: 18 },
    { icon: '🔔', name: 'Zvonec', mult: 15, weight: 14 },
    { icon: '💎', name: 'Diamant', mult: 25, weight: 8 },
    { icon: '🪙', name: 'Bobux', mult: 35, weight: 5 },
    { icon: '7️⃣', name: 'Lucky 7', mult: 50, weight: 3 }
];

const slotsState = {
    bet: 25,
    spinning: false,
    autoSpin: false,
    reels: [0, 0, 0]
};

function setSlotsBet(amount) {
    if (slotsState.spinning) return;
    slotsState.bet = amount;
    const el = document.getElementById('slots-current-bet');
    if (el) el.textContent = `${amount} B$`;
    const chipBtns = document.querySelectorAll('#casino-view-slots .casino-chip-btn');
    chipBtns.forEach(btn => {
        btn.classList.toggle('casino-chip-active', parseInt(btn.textContent, 10) === amount);
    });
    sfx.playJump();
}

function toggleSlotsAutoSpin() {
    const cb = document.getElementById('slots-auto-spin');
    slotsState.autoSpin = !!(cb && cb.checked);
    if (slotsState.autoSpin && !slotsState.spinning) {
        spinSlots();
    }
}

function pickRandomSlotSymbol() {
    const totalWeight = SLOTS_SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let r = Math.random() * totalWeight;
    for (let i = 0; i < SLOTS_SYMBOLS.length; i++) {
        r -= SLOTS_SYMBOLS[i].weight;
        if (r <= 0) return i;
    }
    return 0;
}

function spinSlots() {
    if (slotsState.spinning) return;
    if (bobuxBalance < slotsState.bet) {
        slotsState.autoSpin = false;
        const cb = document.getElementById('slots-auto-spin');
        if (cb) cb.checked = false;
        showHudToast(`Nemáš dostatek Bobuxů! (Máš ${bobuxBalance} B$, sázka je ${slotsState.bet} B$)`, 'red');
        return;
    }

    if (!spendBobux(slotsState.bet, `Automaty sázka (${slotsState.bet} B$)`)) return;
    updateCasinoBobuxDisplay();

    slotsState.spinning = true;
    document.getElementById('slots-spin-btn').disabled = true;
    const msgEl = document.getElementById('slots-status-msg');
    msgEl.textContent = 'Válce se točí... Hodně štěstí!';
    msgEl.className = 'py-2.5 px-4 rounded-xl bg-[#121316]/90 border border-[#facc15]/40 text-xs sm:text-sm font-extrabold text-[#FFE066] shadow flex items-center justify-center';

    const r1 = document.getElementById('slot-reel-1');
    const r2 = document.getElementById('slot-reel-2');
    const r3 = document.getElementById('slot-reel-3');

    // Rapid emoji cycling simulation
    const cycleInterval = setInterval(() => {
        r1.textContent = SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)].icon;
        r2.textContent = SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)].icon;
        r3.textContent = SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)].icon;
        sfx.playSlotSpin();
    }, 60);

    const final1 = pickRandomSlotSymbol();
    const final2 = pickRandomSlotSymbol();
    const final3 = pickRandomSlotSymbol();

    // Stop Reel 1
    setTimeout(() => {
        r1.textContent = SLOTS_SYMBOLS[final1].icon;
        sfx.playWheelTick();
    }, 600);

    // Stop Reel 2
    setTimeout(() => {
        r2.textContent = SLOTS_SYMBOLS[final2].icon;
        sfx.playWheelTick();
    }, 1100);

    // Stop Reel 3 and Resolve
    setTimeout(() => {
        clearInterval(cycleInterval);
        r3.textContent = SLOTS_SYMBOLS[final3].icon;
        sfx.playWheelTick();

        slotsState.reels = [final1, final2, final3];
        slotsState.spinning = false;
        document.getElementById('slots-spin-btn').disabled = false;

        const s1 = SLOTS_SYMBOLS[final1];
        const s2 = SLOTS_SYMBOLS[final2];
        const s3 = SLOTS_SYMBOLS[final3];

        if (final1 === final2 && final2 === final3) {
            // 3-of-a-kind JACKPOT
            const win = slotsState.bet * s1.mult;
            if (s1.mult >= 35) sfx.playJackpot();
            else sfx.playWinFanfare();
            addBobux(win, `Výhra na automatech: 3x ${s1.icon}`);
            updateCasinoBobuxDisplay();
            msgEl.textContent = `🎉 3x ${s1.icon} ${s1.name.toUpperCase()}! VÝHRA ${win} B$ (${s1.mult}x)!`;
            msgEl.className = 'py-2.5 px-4 rounded-xl bg-amber-950/80 border border-amber-400 text-xs sm:text-sm font-black text-amber-200 shadow animate-bounce';
            spawnObbyConfetti(new THREE.Vector3(18, 3, -8));
        } else if (s1.icon === '🍒' && s2.icon === '🍒') {
            const win = Math.round(slotsState.bet * 1.5);
            sfx.playCoin();
            addBobux(win, 'Výhra na automatech: 2x 🍒');
            updateCasinoBobuxDisplay();
            msgEl.textContent = `🍒 2x Třešně! Výhra ${win} B$ (1.5x)`;
            msgEl.className = 'py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-400 text-xs sm:text-sm font-bold text-emerald-200 shadow';
        } else {
            msgEl.textContent = 'Žádná výhra. Zkus to znovu!';
            msgEl.className = 'py-2.5 px-4 rounded-xl bg-[#121316]/90 border border-white/10 text-xs sm:text-sm font-bold text-gray-400 shadow';
        }

        // Auto Spin continuation
        if (slotsState.autoSpin) {
            setTimeout(() => {
                if (slotsState.autoSpin && !slotsState.spinning) spinSlots();
            }, 1200);
        }
    }, 1600);
}

/* ============================================================================
 * C. DENNÍ KOLO ŠTĚSTÍ (DAILY WHEEL) ENGINE
 * ============================================================================ */
const WHEEL_PRIZES = [
    { label: '100 B$', type: 'bobux', amount: 100, color: '#3b82f6', icon: '🪙' },
    { label: '250 B$', type: 'bobux', amount: 250, color: '#10b981', icon: '🪙' },
    { label: '50 B$', type: 'bobux', amount: 50, color: '#64748b', icon: '🪙' },
    { label: '500 B$', type: 'bobux', amount: 500, color: '#f59e0b', icon: '🪙' },
    { label: 'VOLNÉ TOČENÍ', type: 'extra', amount: 0, color: '#ec4899', icon: '🎁' },
    { label: '150 B$', type: 'bobux', amount: 150, color: '#06b6d4', icon: '🪙' },
    { label: '75 B$', type: 'bobux', amount: 75, color: '#8b5cf6', icon: '🪙' },
    { label: '1 000 B$', type: 'bobux', amount: 1000, color: '#ef4444', icon: '👑' },
    { label: '200 B$', type: 'bobux', amount: 200, color: '#14b8a6', icon: '🪙' },
    { label: 'JACKPOT 2500', type: 'bobux', amount: 2500, color: '#eab308', icon: '⭐' }
];

const STORAGE_KEY_CASINO_WHEEL = 'boblox_casino_wheel_last_spin_v2';
let wheelCurrentAngle = 0;
let isWheelSpinning = false;
let wheelAutoSpin = false;

function isDailyWheelFree() {
    const last = parseInt(localStorage.getItem(STORAGE_KEY_CASINO_WHEEL) || '0', 10);
    return (Date.now() - last) >= 24 * 3600 * 1000;
}

function updateDailyWheelTimer() {
    const isFree = isDailyWheelFree();
    const statusEl = document.getElementById('wheel-daily-status');
    const btnText = document.getElementById('wheel-btn-text');
    const timerEl = document.getElementById('wheel-daily-timer');

    if (isFree) {
        if (statusEl) statusEl.textContent = '🎁 1 VOLNÉ ZATOČENÍ PŘIPRAVENO!';
        if (btnText) btnText.textContent = 'ZATOČIT ZDARMA!';
        if (timerEl) timerEl.textContent = 'Tvé denní volné zatočení je aktivní! Vytoč si až 2 500 B$ zdarma.';
    } else {
        const last = parseInt(localStorage.getItem(STORAGE_KEY_CASINO_WHEEL) || '0', 10);
        const remMs = Math.max(0, 24 * 3600 * 1000 - (Date.now() - last));
        const remHms = formatHMS(remMs);
        if (statusEl) statusEl.textContent = `⏳ Další volné zatočení za: ${remHms}`;
        if (btnText) btnText.textContent = 'ZATOČIT (100 B$)';
        if (timerEl) timerEl.textContent = `Denní bonus vyčerpán. Další zdarma za ${remHms}, nebo toč za 100 B$.`;
    }
}

function renderCasinoWheel(rotation = wheelCurrentAngle) {
    const canvas = document.getElementById('casino-wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = cx - 12;
    const numSlices = WHEEL_PRIZES.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    for (let i = 0; i < numSlices; i++) {
        const p = WHEEL_PRIZES[i];
        const start = i * sliceAngle;
        const end = start + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label & Icon
        ctx.save();
        ctx.rotate(start + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Fredoka, Inter, sans-serif';
        ctx.fillText(`${p.icon} ${p.label}`, radius - 16, 4);
        ctx.restore();
    }

    // Outer Decorative Golden Rim & Lights
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 7;
    ctx.stroke();

    // Golden Pegs
    for (let i = 0; i < numSlices; i++) {
        const ang = i * sliceAngle;
        const px = Math.cos(ang) * (radius - 2);
        const py = Math.sin(ang) * (radius - 2);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }

    // Center Golden Hub
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#191B1D';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('B$', 0, 6);

    ctx.restore();
}

function toggleWheelAutoSpin() {
    const cb = document.getElementById('wheel-auto-spin');
    wheelAutoSpin = !!(cb && cb.checked);
    if (wheelAutoSpin && !isWheelSpinning) {
        spinDailyWheel();
    }
}

function spinDailyWheel() {
    if (isWheelSpinning) return;
    const isFree = isDailyWheelFree();

    if (!isFree) {
        if (bobuxBalance < 100) {
            wheelAutoSpin = false;
            const cb = document.getElementById('wheel-auto-spin');
            if (cb) cb.checked = false;
            showHudToast('Nemáš 100 Bobuxů na placené zatočení kola!', 'red');
            return;
        }
        if (!spendBobux(100, 'Zatočení Kola Štěstí (100 B$)')) return;
        updateCasinoBobuxDisplay();
    } else {
        localStorage.setItem(STORAGE_KEY_CASINO_WHEEL, String(Date.now()));
    }

    isWheelSpinning = true;
    document.getElementById('wheel-spin-btn').disabled = true;
    const msgEl = document.getElementById('wheel-status-msg');
    msgEl.textContent = 'Kolo štěstí se točí...';

    // Pick target prize
    const targetIdx = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const numSlices = WHEEL_PRIZES.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    // Pointer is at TOP (-PI/2). To align targetIdx at top:
    // angle = (3 * PI / 2) - (targetIdx + 0.5) * sliceAngle
    const fullRevs = 5 + Math.floor(Math.random() * 3);
    const targetSliceCenter = (targetIdx + 0.5) * sliceAngle;
    const finalAngle = fullRevs * Math.PI * 2 + (Math.PI * 1.5 - targetSliceCenter);

    const startAngle = wheelCurrentAngle % (Math.PI * 2);
    const totalRotation = finalAngle - startAngle;
    const durationMs = 4500;
    const startTime = performance.now();
    let lastTickAngle = startAngle;

    function animateWheel(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / durationMs);
        // Cubic ease-out
        const ease = 1 - Math.pow(1 - t, 3);
        wheelCurrentAngle = startAngle + totalRotation * ease;

        if (Math.abs(wheelCurrentAngle - lastTickAngle) >= sliceAngle * 0.95) {
            sfx.playWheelTick();
            lastTickAngle = wheelCurrentAngle;
        }

        renderCasinoWheel(wheelCurrentAngle);

        if (t < 1) {
            requestAnimationFrame(animateWheel);
        } else {
            isWheelSpinning = false;
            document.getElementById('wheel-spin-btn').disabled = false;
            updateDailyWheelTimer();

            const prize = WHEEL_PRIZES[targetIdx];
            if (prize.type === 'bobux') {
                if (prize.amount >= 1000) sfx.playJackpot();
                else sfx.playWinFanfare();
                addBobux(prize.amount, `Kolo Štěstí (${prize.label})`);
                updateCasinoBobuxDisplay();
                msgEl.textContent = `🎉 GRATULACE! Vyhrál jsi ${prize.amount} Bobuxů!`;
                msgEl.className = 'py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-400 text-xs sm:text-sm font-black text-emerald-200 shadow animate-bounce';
                spawnObbyConfetti(new THREE.Vector3(0, 5, -18));
            } else {
                sfx.playWinFanfare();
                msgEl.textContent = '🎁 EXTRA VOLNÉ ZATOČENÍ! Zatoč si ještě jednou zdarma!';
                msgEl.className = 'py-2.5 px-4 rounded-xl bg-pink-950/80 border border-pink-400 text-xs sm:text-sm font-black text-pink-200 shadow';
                localStorage.removeItem(STORAGE_KEY_CASINO_WHEEL);
                updateDailyWheelTimer();
            }

            if (wheelAutoSpin) {
                setTimeout(() => {
                    if (wheelAutoSpin && !isWheelSpinning) spinDailyWheel();
                }, 1200);
            }
        }
    }
    requestAnimationFrame(animateWheel);
}

/* ============================================================================
 * D. KOŇSKÉ DOSTIHY (BLOX DERBY) ENGINE
 * ============================================================================ */
const DERBY_HORSES = [
    { id: 1, name: 'Blesk', color: '#00A2FF', odds: 2.2, icon: '🐎', desc: 'Favorit (2.2x)' },
    { id: 2, name: 'Tornádo', color: '#EF4444', odds: 3.5, icon: '🐎', desc: 'Dravý kůň (3.5x)' },
    { id: 3, name: 'Stín', color: '#8B5CF6', odds: 5.0, icon: '🐎', desc: 'Taktik (5.0x)' },
    { id: 4, name: 'Kometa', color: '#10B981', odds: 8.0, icon: '🐎', desc: 'Vytrvalec (8.0x)' },
    { id: 5, name: 'Zlatovláska', color: '#FACC15', odds: 15.0, icon: '🐎', desc: 'Outsider (15x!)' }
];

const derbyState = {
    selectedHorseId: 1,
    bet: 50,
    racing: false,
    raceProgress: [0, 0, 0, 0, 0]
};

function renderDerbyHorsesList() {
    const list = document.getElementById('derby-horses-list');
    if (!list) return;
    list.innerHTML = '';
    DERBY_HORSES.forEach(h => {
        const isSel = h.id === derbyState.selectedHorseId;
        const card = document.createElement('button');
        card.type = 'button';
        card.onclick = () => selectDerbyHorse(h.id);
        card.className = `p-3 rounded-xl border-2 text-left transition ${
            isSel ? 'bg-[#2a2c30] border-[#00A2FF] shadow-[0_0_12px_rgba(0,162,255,0.4)]' : 'bg-[#191B1D] border-white/10 hover:border-white/30'
        }`;
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style="background:${h.color}">#${h.id}</span>
                <span class="text-xs font-black px-1.5 py-0.5 rounded bg-black/50 text-[#FFE066]">${h.odds}x</span>
            </div>
            <div class="mt-2 font-bold text-xs sm:text-sm text-white">${h.name}</div>
            <div class="text-[10px] text-gray-400 truncate">${h.desc}</div>
        `;
        list.appendChild(card);
    });
    updateDerbyBetUI();
}

function selectDerbyHorse(id) {
    if (derbyState.racing) return;
    derbyState.selectedHorseId = id;
    renderDerbyHorsesList();
    sfx.playJump();
}

function setDerbyBet(amount) {
    if (derbyState.racing) return;
    derbyState.bet = amount;
    updateDerbyBetUI();
    const chipBtns = document.querySelectorAll('#casino-view-derby .casino-chip-btn');
    chipBtns.forEach(btn => {
        btn.classList.toggle('casino-chip-active', parseInt(btn.textContent, 10) === amount);
    });
    sfx.playJump();
}

function updateDerbyBetUI() {
    const horse = DERBY_HORSES.find(h => h.id === derbyState.selectedHorseId) || DERBY_HORSES[0];
    const betEl = document.getElementById('derby-current-bet');
    const potEl = document.getElementById('derby-potential-win');
    if (betEl) betEl.textContent = `${derbyState.bet} B$`;
    if (potEl) potEl.textContent = `${Math.round(derbyState.bet * horse.odds)} B$`;
}

function startDerbyRace() {
    if (derbyState.racing) return;
    if (bobuxBalance < derbyState.bet) {
        showHudToast(`Nemáš dostatek Bobuxů! (Máš ${bobuxBalance} B$, sázka je ${derbyState.bet} B$)`, 'red');
        return;
    }

    const horse = DERBY_HORSES.find(h => h.id === derbyState.selectedHorseId) || DERBY_HORSES[0];
    if (!spendBobux(derbyState.bet, `Sázka na koně #${horse.id} ${horse.name} (${derbyState.bet} B$)`)) return;
    updateCasinoBobuxDisplay();

    derbyState.racing = true;
    document.getElementById('derby-start-btn').disabled = true;

    // Play Bugle Fanfare
    sfx.playDerbyHorn();

    // Show 2D Live Track
    const trackCont = document.getElementById('derby-track-container');
    const resultBanner = document.getElementById('derby-result-banner');
    trackCont.classList.remove('hidden');
    resultBanner.classList.add('hidden');

    const statusLabel = document.getElementById('derby-status-label');
    statusLabel.textContent = `🐎 DOSTIHY ODSTARTOVÁNY! Fandíš koni: #${horse.id} ${horse.name}`;

    derbyState.raceProgress = [0, 0, 0, 0, 0];
    const metersEl = document.getElementById('derby-meters-counter');

    // Build Track Lanes
    const lanesEl = document.getElementById('derby-lanes');
    lanesEl.innerHTML = '';
    DERBY_HORSES.forEach(h => {
        const lane = document.createElement('div');
        lane.className = 'relative bg-[#1e293b] rounded-lg h-7 overflow-hidden border border-white/10 flex items-center px-2';
        lane.innerHTML = `
            <div id="derby-horse-bar-${h.id}" class="absolute left-0 top-0 bottom-0 transition-all duration-75 flex items-center justify-end pr-1 text-sm font-bold text-white shadow" style="width: 4%; background: ${h.color};">
                🐎 #${h.id}
            </div>
            <span class="relative z-10 text-[10px] font-bold text-white/80 pointer-events-none">${h.name}</span>
        `;
        lanesEl.appendChild(lane);
    });

    // 1. Fair Weighted Random Logic for Winner Selection:
    // Probability is proportional to 1 / odds so all horses can win and payouts reflect true risk!
    const weights = DERBY_HORSES.map(h => 1 / h.odds);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * totalWeight;
    let winnerIndex = 0;
    for (let i = 0; i < DERBY_HORSES.length; i++) {
        if (roll < weights[i]) {
            winnerIndex = i;
            break;
        }
        roll -= weights[i];
    }
    const predeterminedWinner = DERBY_HORSES[winnerIndex];

    // 2. Setup target finish frames and dynamic pace profiles
    const nonWinnerIndices = [0, 1, 2, 3, 4].filter(idx => idx !== winnerIndex);
    // Shuffle non-winners randomly with weights for realistic 2nd to 5th placements
    nonWinnerIndices.sort((a, b) => (1 / DERBY_HORSES[b].odds) * (Math.random() + 0.5) - (1 / DERBY_HORSES[a].odds) * (Math.random() + 0.5));

    const targetFinishTicks = new Array(5);
    // Winner crosses 1000m at tick ~96 (~6.7 seconds)
    const baseWinTick = 96;
    targetFinishTicks[winnerIndex] = baseWinTick;
    targetFinishTicks[nonWinnerIndices[0]] = baseWinTick + Math.floor(2 + Math.random() * 2); // 2nd place (neck-and-neck!)
    targetFinishTicks[nonWinnerIndices[1]] = baseWinTick + Math.floor(4 + Math.random() * 3); // 3rd place
    targetFinishTicks[nonWinnerIndices[2]] = baseWinTick + Math.floor(7 + Math.random() * 4); // 4th place
    targetFinishTicks[nonWinnerIndices[3]] = baseWinTick + Math.floor(11 + Math.random() * 5); // 5th place

    // Horse Running Dynamics (Early speed, mid-race surge, and individual stamina)
    const horseProfiles = DERBY_HORSES.map((h, i) => {
        const isWinner = (i === winnerIndex);
        return {
            earlyPace: 0.92 + Math.random() * 0.22,
            spurtStartTick: 20 + Math.floor(Math.random() * 40),
            spurtLength: 12 + Math.floor(Math.random() * 8),
            spurtMultiplier: 1.15 + Math.random() * 0.25,
            isWinner
        };
    });

    let currentTick = 0;
    let currentLeadMeters = 0;
    const raceInterval = setInterval(() => {
        currentTick++;
        let maxMeters = 0;

        // Simulate step for each horse
        for (let i = 0; i < 5; i++) {
            const h = DERBY_HORSES[i];
            const profile = horseProfiles[i];
            const targetTicks = targetFinishTicks[i];

            // Base nominal step to reach 1000m around targetTicks
            let step = (1000 / targetTicks);

            // Phase 1: First 300m (Opening bursts & jockey positioning)
            if (derbyState.raceProgress[i] < 300) {
                step *= profile.earlyPace;
            }

            // Phase 2: Mid-race spurt (random horse makes an exciting move!)
            if (currentTick >= profile.spurtStartTick && currentTick < profile.spurtStartTick + profile.spurtLength) {
                step *= profile.spurtMultiplier;
            }

            // Phase 3: Final 250m (Home stretch sprint)
            if (derbyState.raceProgress[i] >= 750) {
                if (profile.isWinner) {
                    step *= 1.25;
                } else {
                    step *= (0.92 + Math.random() * 0.12);
                }
            }

            // Small micro random bounce (±1.2m)
            step += (Math.random() - 0.48) * 2.4;

            derbyState.raceProgress[i] += Math.max(1.5, step);

            // Cap non-winners at 992m until winner crosses 1000m
            if (!profile.isWinner && derbyState.raceProgress[i] >= 992) {
                derbyState.raceProgress[i] = 992 + Math.random() * 4;
            }

            const bar = document.getElementById(`derby-horse-bar-${h.id}`);
            const pct = Math.min(100, (derbyState.raceProgress[i] / 1000) * 100);
            if (bar) bar.style.width = `${Math.max(4, pct)}%`;

            if (derbyState.raceProgress[i] > maxMeters) {
                maxMeters = derbyState.raceProgress[i];
            }

            // Animate 3D horse meshes in derby arena
            if (gameSpecificData && gameSpecificData.horses3D && gameSpecificData.horses3D[i]) {
                const mesh = gameSpecificData.horses3D[i].group;
                mesh.position.x = -8.0 + (pct / 100) * 16.0;
                // Galloping bounce
                mesh.position.y = 0.9 + Math.abs(Math.sin(performance.now() * 0.015 + i)) * 0.35;
                mesh.rotation.z = Math.sin(performance.now() * 0.012 + i) * 0.08;
            }
        }

        // Find current race leader for commentary
        let leaderIdx = 0;
        let leadDistance = 0;
        for (let i = 0; i < 5; i++) {
            if (derbyState.raceProgress[i] > leadDistance) {
                leadDistance = derbyState.raceProgress[i];
                leaderIdx = i;
            }
        }
        const leader = DERBY_HORSES[leaderIdx];

        // Dynamic exciting commentary
        if (leadDistance < 250) {
            statusLabel.textContent = `🐎 Odstartováno! Koně vyrazily ze startovních boxů! Fandíš: #${horse.id} ${horse.name}`;
        } else if (leadDistance < 550) {
            statusLabel.textContent = `⚡ 1. úsek: V čele běží #${leader.id} ${leader.name}! #${horse.id} ${horse.name} se drží v poli!`;
        } else if (leadDistance < 800) {
            statusLabel.textContent = `🔥 Zatáčka před cílem: #${leader.id} ${leader.name} drží těsné vedení! Boj o každou pozici!`;
        } else {
            statusLabel.textContent = `💥 CÍLOVÁ ROVINKA! Plný sprint do cíle, #${leader.id} ${leader.name} finišuje!`;
        }

        currentLeadMeters = Math.min(1000, Math.round(maxMeters));
        if (metersEl) metersEl.textContent = `${currentLeadMeters} m / 1 000 m`;

        if (derbyState.raceProgress[winnerIndex] >= 1000) {
            clearInterval(raceInterval);
            finishDerbyRace(predeterminedWinner.id);
        }
    }, 70);
}

function finishDerbyRace(winnerId) {
    derbyState.racing = false;
    document.getElementById('derby-start-btn').disabled = false;

    const winner = DERBY_HORSES.find(h => h.id === winnerId);
    const chosen = DERBY_HORSES.find(h => h.id === derbyState.selectedHorseId);
    const resultBanner = document.getElementById('derby-result-banner');
    const statusLabel = document.getElementById('derby-status-label');
    resultBanner.classList.remove('hidden');

    if (winnerId === derbyState.selectedHorseId) {
        // Player Won!
        const payout = Math.round(derbyState.bet * chosen.odds);
        sfx.playJackpot();
        addBobux(payout, `Výhra v dostizích (${chosen.name})`);
        updateCasinoBobuxDisplay();

        statusLabel.textContent = `🏆 TVŮJ KŮŇ #${chosen.id} ${chosen.name.toUpperCase()} ZVÍTĚZIL!`;
        resultBanner.className = 'py-3 px-4 rounded-xl bg-emerald-950/90 border-2 border-emerald-400 text-center text-sm sm:text-base font-black text-emerald-200 shadow animate-bounce';
        resultBanner.innerHTML = `🎉 VÍTĚZSTVÍ! #${chosen.id} ${chosen.name} dorazil první!<br><span class="text-[#FFE066] text-lg font-black">+${payout} Bobuxů (Kurz ${chosen.odds}x)!</span>`;
        spawnObbyConfetti(new THREE.Vector3(0, 3, 14));
    } else {
        sfx.playOof();
        statusLabel.textContent = `Vítězem je kůň #${winner.id} ${winner.name} (${winner.odds}x).`;
        resultBanner.className = 'py-3 px-4 rounded-xl bg-red-950/80 border border-red-500/60 text-center text-xs sm:text-sm font-bold text-red-200 shadow';
        resultBanner.innerHTML = `Bohužel, tvůj kůň #${chosen.id} ${chosen.name} nevyhrál.<br>Vítězem dostihů se stal <strong class="text-white">#${winner.id} ${winner.name}</strong>. Zkus to v dalším závodě!`;
    }
}

