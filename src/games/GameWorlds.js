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


/* ============================================================================
 * 3D CASINO LUCKY WHEEL & 3D MULTIPLAYER BLACKJACK TABLE BUILDERS
 * ============================================================================ */

// 4 Seats around the Semicircular Blackjack Table (X = -18, Z = -8)
const BJ_TABLE_SEATS = [
    { id: 0, label: 'Místo 1', pos: new THREE.Vector3(-21.2, 1.8, -5.8), chairPos: new THREE.Vector3(-21.2, 0.9, -5.0), cardPos: new THREE.Vector3(-20.5, 2.32, -6.8), betPos: new THREE.Vector3(-20.5, 2.32, -5.8), rotY: Math.PI * 0.25, cameraYaw: Math.PI * 0.25 },
    { id: 1, label: 'Místo 2', pos: new THREE.Vector3(-19.3, 1.8, -4.8), chairPos: new THREE.Vector3(-19.3, 0.9, -4.0), cardPos: new THREE.Vector3(-19.0, 2.32, -6.4), betPos: new THREE.Vector3(-19.0, 2.32, -5.4), rotY: Math.PI * 0.08, cameraYaw: Math.PI * 0.08 },
    { id: 2, label: 'Místo 3', pos: new THREE.Vector3(-16.7, 1.8, -4.8), chairPos: new THREE.Vector3(-16.7, 0.9, -4.0), cardPos: new THREE.Vector3(-17.0, 2.32, -6.4), betPos: new THREE.Vector3(-17.0, 2.32, -5.4), rotY: -Math.PI * 0.08, cameraYaw: -Math.PI * 0.08 },
    { id: 3, label: 'Místo 4', pos: new THREE.Vector3(-14.8, 1.8, -5.8), chairPos: new THREE.Vector3(-14.8, 0.9, -5.0), cardPos: new THREE.Vector3(-15.5, 2.32, -6.8), betPos: new THREE.Vector3(-15.5, 2.32, -6.1), rotY: -Math.PI * 0.25, cameraYaw: -Math.PI * 0.25 }
];

let bjTableState = {
    seats: BJ_TABLE_SEATS.map(s => ({
        ...s,
        occupied: false,
        peerId: null,
        username: '',
        bet: 50,
        confirmedBet: false,
        hands: [], // array of { cards: [], bet: 50, status: 'playing', score: 0 }
        activeHandIdx: 0,
        cardMeshes: [],
        chipMeshes: [],
        scoreSprite: null
    })),
    dealerHand: [],
    dealerCardMeshes: [],
    dealerScoreSprite: null,
    deck: [],
    phase: 'betting', // 'betting' | 'dealing' | 'players' | 'dealer' | 'payout' | 'cooldown'
    phaseTimer: 10,
    currentSeatTurn: -1,
    turnTimer: 15,
    localSeat: -1,
    tableGroup: null,
    dealingArmAnim: 0
};

// Generates canvas texture for Blackjack felt table
function createBlackjackFeltTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep rich emerald felt background
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle felt grain / texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let i = 0; i < 400; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 2, 2);
    }

    // Outer table border arc
    ctx.strokeStyle = '#FFE066';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(512, 100, 360, 0, Math.PI, false);
    ctx.stroke();

    // Secondary inner arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(512, 100, 330, 0, Math.PI, false);
    ctx.stroke();

    // Curved Text: "BLACKJACK PAYS 3 TO 2"
    ctx.save();
    ctx.translate(512, 100);
    ctx.fillStyle = '#FFE066';
    ctx.font = 'bold 26px Fredoka, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★  BLACKJACK PAYS 3 TO 2  ★', 0, 240);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('DEALER MUST STAND ON 17 AND DRAW TO 16', 0, 275);
    ctx.font = 'italic bold 22px Fredoka, cursive, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('The Diamond Casino & Resort', 0, 80);
    ctx.restore();

    // 4 Betting Circles & Card Spot outlines
    const angles = [Math.PI * 0.85, Math.PI * 0.62, Math.PI * 0.38, Math.PI * 0.15];
    angles.forEach((ang, idx) => {
        const bx = 512 + Math.cos(ang) * 310;
        const by = 100 + Math.sin(ang) * 310;

        // Betting circle
        ctx.strokeStyle = '#FFE066';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(bx, by, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fill();

        ctx.fillStyle = '#FFE066';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`MÍSTO ${idx + 1}`, bx, by + 5);

        // Card placeholder box
        const cx = 512 + Math.cos(ang) * 230;
        const cy = 100 + Math.sin(ang) * 230;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 24, cy - 34, 48, 68);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
}

// Builds the 3D Semicircular Blackjack Table at X = -18, Z = -8
function setup3DBlackjackTable() {
    const tableGroup = new THREE.Group();

    // 1. Mahogany Base Structure
    const baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(4.8, 5.0, 1.4, 28, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x27170e, roughness: 0.5, metalness: 0.15 })
    );
    baseMesh.position.set(0, 0.7, 0);
    baseMesh.rotation.y = Math.PI;
    tableGroup.add(baseMesh);

    // Brass Footrail around curved base
    const railMesh = new THREE.Mesh(
        new THREE.TorusGeometry(5.2, 0.08, 8, 28, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 })
    );
    railMesh.position.set(0, 0.35, 0);
    railMesh.rotation.x = Math.PI / 2;
    railMesh.rotation.z = Math.PI;
    tableGroup.add(railMesh);

    // 2. Semicircular Felt Top with Printed Markings
    const feltTex = createBlackjackFeltTexture();
    const feltMat = new THREE.MeshStandardMaterial({ map: feltTex, roughness: 0.75, metalness: 0.05 });
    const feltMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(4.7, 4.7, 0.18, 32, 1, false, 0, Math.PI),
        feltMat
    );
    feltMesh.position.set(0, 1.45, 0);
    feltMesh.rotation.y = Math.PI;
    tableGroup.add(feltMesh);

    // 3. Padded Black Leather Bolster (Armrest Rim around curve)
    const armrestMesh = new THREE.Mesh(
        new THREE.TorusGeometry(4.8, 0.28, 12, 32, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.35, metalness: 0.1 })
    );
    armrestMesh.position.set(0, 1.55, 0);
    armrestMesh.rotation.x = Math.PI / 2;
    armrestMesh.rotation.z = Math.PI;
    tableGroup.add(armrestMesh);

    // Flat mahogany dealer bumper bar along straight edge
    const dealerBumper = new THREE.Mesh(
        new THREE.BoxGeometry(9.8, 0.35, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x3d1d11, roughness: 0.4 })
    );
    dealerBumper.position.set(0, 1.55, 0);
    tableGroup.add(dealerBumper);

    // 4. Dealer Chip Tray with 3D Chips
    const trayGroup = new THREE.Group();
    const trayBox = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.18, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 })
    );
    trayGroup.add(trayBox);

    const chipColColors = [0xffffff, 0xef4444, 0x10b981, 0x3b82f6, 0x111827, 0xfacc15];
    for (let c = 0; c < 6; c++) {
        const cx = -0.9 + c * 0.36;
        for (let h = 0; h < 6; h++) {
            const chip = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12),
                new THREE.MeshStandardMaterial({ color: chipColColors[c], roughness: 0.3, metalness: 0.15 })
            );
            chip.position.set(cx, 0.1 + h * 0.03, (Math.random() - 0.5) * 0.1);
            trayGroup.add(chip);
        }
    }
    trayGroup.position.set(0, 1.58, -0.6);
    tableGroup.add(trayGroup);

    // 5. Acrylic Card Dealing Shoe (on Dealer's Right)
    const shoeGroup = new THREE.Group();
    const shoeBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.5, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.9 })
    );
    shoeGroup.add(shoeBody);
    // Red cards deck inside shoe
    const shoeDeck = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.38, 1.1),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 })
    );
    shoeDeck.position.set(0, 0.05, 0);
    shoeGroup.add(shoeDeck);
    shoeGroup.position.set(2.4, 1.72, -0.4);
    shoeGroup.rotation.y = -0.3;
    shoeGroup.rotation.x = 0.15;
    tableGroup.add(shoeGroup);

    // 6. Clear Acrylic Discard Holder (on Dealer's Left)
    const discardRack = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.6, 0.95),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, roughness: 0.1 })
    );
    discardRack.position.set(-2.5, 1.75, -0.4);
    tableGroup.add(discardRack);

    // 7. Four 3D Casino Armchairs / Swivel Stools
    BJ_TABLE_SEATS.forEach(seat => {
        const chairGroup = new THREE.Group();
        // Chrome Base & Post
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.65, 0.1, 16),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
        );
        chairGroup.add(base);
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.85, 12),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
        );
        pole.position.y = 0.45;
        chairGroup.add(pole);
        // Burgundy Padded Cushion
        const cushion = new THREE.Mesh(
            new THREE.CylinderGeometry(0.68, 0.65, 0.26, 16),
            new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.55 })
        );
        cushion.position.y = 0.95;
        chairGroup.add(cushion);
        // Curved Backrest
        const backrest = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 0.6, 0.18),
            new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.55 })
        );
        backrest.position.set(0, 1.35, 0.35);
        chairGroup.add(backrest);

        chairGroup.position.copy(seat.chairPos);
        chairGroup.rotation.y = seat.rotY + Math.PI;
        scene.add(chairGroup);
    });

    // 8. 3D Dealer NPC Character
    const dealerChar = createBlockyCharacterMesh({
        headColor: 0xF5CD30,
        torsoColor: 0x111827, // Tuxedo Vest
        legColor: 0x1e293b
    });
    dealerChar.root.position.set(-18, 1.8, -11.5);
    scene.add(dealerChar.root);

    // Position table group in casino world
    tableGroup.position.set(-18, 0.85, -8.0);
    scene.add(tableGroup);
    bjTableState.tableGroup = tableGroup;

    // Floating Neon Sign above Blackjack table
    createBlock(-18, 7.5, -8, 7.5, 1.2, 0.8, 0x10b981, {
        emissive: 0x059669,
        emissiveIntensity: 0.85,
        noStuds: true
    });

    return { tableGroup, dealerChar };
}

// Builds the 3D GTA 5 Casino Lucky Wheel at X = 0, Z = -18
function setup3DLuckyWheel() {
    // 1. Raised Marble Pedestal with Blue Neon Underglow
    createBlock(0, 1.0, -18, 9.5, 0.7, 9.5, 0x0f172a, {
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        roughness: 0.2
    });
    // Cyan LED edge border
    createBlock(0, 1.36, -13.2, 9.6, 0.1, 0.2, 0x00d2ff, { emissive: 0x00d2ff, emissiveIntensity: 1.0, noStuds: true });
    createBlock(0, 1.36, -22.8, 9.6, 0.1, 0.2, 0x00d2ff, { emissive: 0x00d2ff, emissiveIntensity: 1.0, noStuds: true });
    createBlock(-4.75, 1.36, -18, 0.2, 0.1, 9.6, 0x00d2ff, { emissive: 0x00d2ff, emissiveIntensity: 1.0, noStuds: true });
    createBlock(4.75, 1.36, -18, 0.2, 0.1, 9.6, 0x00d2ff, { emissive: 0x00d2ff, emissiveIntensity: 1.0, noStuds: true });

    // Decorative Illuminated Diamond Crystals on Left and Right of Pedestal (matching GTA 5 reference photo)
    const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x00d2ff,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.15,
        metalness: 0.2,
        transparent: true,
        opacity: 0.92
    });
    [-3.4, 3.4].forEach(cx => {
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), crystalMat);
        crystal.position.set(cx, 2.2, -18);
        crystal.rotation.y = Math.PI / 4;
        scene.add(crystal);
    });

    // 2. Chrome A-Frame Support Stand
    const standMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.15 });
    const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 4.6, 12), standMat);
    legLeft.position.set(-1.6, 3.2, -18.2);
    legLeft.rotation.z = -0.32;
    scene.add(legLeft);

    const legRight = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 4.6, 12), standMat);
    legRight.position.set(1.6, 3.2, -18.2);
    legRight.rotation.z = 0.32;
    scene.add(legRight);

    // Axle Housing
    const axleBox = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.8, 16), standMat);
    axleBox.position.set(0, 5.2, -18.2);
    axleBox.rotation.x = Math.PI / 2;
    scene.add(axleBox);

    // 3. Giant 3D Spinning Wheel Group (Facing South / +Z)
    const wheelGroup = new THREE.Group();

    // Outer Chrome Rim (Radius 3.7)
    const wheelRim = new THREE.Mesh(
        new THREE.CylinderGeometry(3.7, 3.7, 0.45, 36),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.1 })
    );
    wheelRim.rotation.x = Math.PI / 2;
    wheelGroup.add(wheelRim);

    // Glowing Cyan Neon Halo Outer Ring
    const neonHalo = new THREE.Mesh(
        new THREE.TorusGeometry(3.72, 0.08, 12, 36),
        new THREE.MeshStandardMaterial({ color: 0x00d2ff, emissive: 0x00d2ff, emissiveIntensity: 1.0 })
    );
    wheelGroup.add(neonHalo);

    // 20 Radial Wedges matching GTA 5 Lucky Wheel
    const numSlices = 20;
    const sliceAngle = (Math.PI * 2) / numSlices;
    const wedgeColors = [
        0xeab308, // 0: Vehicle Jackpot (Gold)
        0x0284c7, 0x3b82f6, 0x8b5cf6, 0xec4899,
        0x0284c7, 0x3b82f6, 0xf59e0b, 0x8b5cf6, 0xec4899,
        0x0284c7, 0x3b82f6, 0xec4899, 0x8b5cf6, 0x0284c7,
        0x3b82f6, 0x8b5cf6, 0xec4899, 0x0284c7, 0x8b5cf6
    ];

    for (let s = 0; s < numSlices; s++) {
        const col = wedgeColors[s % wedgeColors.length];
        const wedge = new THREE.Mesh(
            new THREE.CylinderGeometry(3.55, 3.55, 0.48, 4, 1, false, s * sliceAngle, sliceAngle),
            new THREE.MeshStandardMaterial({
                color: col,
                emissive: col,
                emissiveIntensity: (s === 0) ? 0.6 : 0.25,
                roughness: 0.35,
                metalness: 0.15
            })
        );
        wedge.rotation.x = Math.PI / 2;
        wheelGroup.add(wedge);

        // Chrome Divider Spoke
        const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 3.55, 0.52),
            new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 })
        );
        spoke.position.set(
            Math.cos(s * sliceAngle) * 1.77,
            Math.sin(s * sliceAngle) * 1.77,
            0
        );
        spoke.rotation.z = s * sliceAngle - Math.PI / 2;
        wheelGroup.add(spoke);

        // Golden Peg on outer rim
        const peg = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.8 })
        );
        peg.position.set(
            Math.cos(s * sliceAngle) * 3.65,
            Math.sin(s * sliceAngle) * 3.65,
            0.24
        );
        wheelGroup.add(peg);
    }

    // 4. Central Hub with "The Diamond" Script Logo Emblem
    const hubCanvas = document.createElement('canvas');
    hubCanvas.width = 256;
    hubCanvas.height = 256;
    const hctx = hubCanvas.getContext('2d');
    hctx.fillStyle = '#0f172a';
    hctx.beginPath();
    hctx.arc(128, 128, 126, 0, Math.PI * 2);
    hctx.fill();
    hctx.strokeStyle = '#00d2ff';
    hctx.lineWidth = 10;
    hctx.stroke();

    hctx.fillStyle = '#ffffff';
    hctx.font = 'bold 18px Inter, sans-serif';
    hctx.textAlign = 'center';
    hctx.fillText('THE', 128, 92);
    hctx.fillStyle = '#FFE066';
    hctx.font = 'italic bold 36px Fredoka, cursive, sans-serif';
    hctx.fillText('Diamond', 128, 136);
    hctx.font = 'bold 13px Inter, sans-serif';
    hctx.fillStyle = '#00d2ff';
    hctx.fillText('CASINO & RESORT', 128, 168);

    const hubTex = new THREE.CanvasTexture(hubCanvas);
    const hubMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 0.54, 28),
        [
            new THREE.MeshStandardMaterial({ color: 0x00d2ff, emissive: 0x00d2ff, emissiveIntensity: 0.5 }),
            new THREE.MeshStandardMaterial({ map: hubTex, roughness: 0.2 }),
            new THREE.MeshStandardMaterial({ color: 0x0f172a })
        ]
    );
    hubMesh.rotation.x = Math.PI / 2;
    wheelGroup.add(hubMesh);

    wheelGroup.position.set(0, 5.2, -18);
    scene.add(wheelGroup);

    // 5. Golden Top Pointer Needle pointing down into active top wedge
    const pointer = new THREE.Mesh(
        new THREE.ConeGeometry(0.42, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.85 })
    );
    pointer.position.set(0, 9.15, -18);
    pointer.rotation.z = Math.PI;
    scene.add(pointer);

    // 6. Hostess Croupier NPC Standing beside Wheel (matching reference image)
    const hostessChar = createBlockyCharacterMesh({
        headColor: 0xF5CD30,
        torsoColor: 0xec4899, // Elegant cocktail dress
        legColor: 0x111827
    });
    hostessChar.root.position.set(-2.6, 1.1, -17.2);
    hostessChar.root.rotation.y = 0.35; // Angled toward wheel and incoming players
    scene.add(hostessChar.root);

    // Floating Neon Sign above Wheel
    createBlock(0, 11.2, -18, 8, 1.2, 0.8, 0xfacc15, {
        emissive: 0xeab308,
        emissiveIntensity: 0.85,
        noStuds: true
    });

    return { wheelGroup, hostessChar };
}

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

    // 5. STATION 1: 🃏 3D MULTIPLAYER BLACKJACK TABLE (West at X = -18, Z = -8)
    const bjTableObj = setup3DBlackjackTable();

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
    createBlock(18, 7.5, -8, 7.5, 1.2, 0.8, 0xf59e0b, {
        emissive: 0xd97706,
        emissiveIntensity: 0.85,
        noStuds: true
    });

    // 7. STATION 3: 🎡 GTA 5 CASINO LUCKY WHEEL (North Center at X = 0, Z = -18)
    const wheelSetup = setup3DLuckyWheel();

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
        wheelMesh: wheelSetup.wheelGroup,
        wheelHostess: wheelSetup.hostessChar,
        horses3D,
        dealerChar: bjTableObj.dealerChar,
        bjTable: bjTableState,
        activeProximityStation: null,
        confettiParticles: [],
        wheelSpinning: false,
        wheelSpinSpeed: 0.45,
        isPlayerSeatedAtBj: false
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
    const elWheel = document.getElementById('wheel-modal-bobux-display');
    if (elWheel) elWheel.textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;
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
 * A. BLACKJACK (21) GAME ENGINE (3D IN-WORLD MULTIPLAYER SYSTEM)
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
            const isRed = card.color === 'red' || card.suit === '♥' || card.suit === '♦';
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
    const elInworld = document.getElementById('bj-inworld-current-bet');
    if (elInworld) elInworld.textContent = `${bjState.bet} B$`;
    const chipBtns = document.querySelectorAll('#casino-view-blackjack .casino-chip-btn, #bj-betting-controls .casino-chip-btn');
    chipBtns.forEach(btn => {
        btn.classList.toggle('casino-chip-active', parseInt(btn.textContent, 10) === amount);
    });
    if (typeof sfx !== 'undefined' && sfx.playJump) sfx.playJump();
}

function clearBjBet() {
    if (bjState.phase === 'playing') return;
    setBjBet(10);
}

// ----------------------------------------------------------------------------
// 3D In-World Physical Cards, Chip Stacks & Score Badges
// ----------------------------------------------------------------------------
function createCardTexture(card, faceDown = false) {
    if (typeof document === 'undefined' || !document.createElement) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 252;
    const ctx = canvas.getContext('2d');

    if (faceDown) {
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, 180, 252);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.strokeRect(6, 6, 168, 240);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        for (let x = 12; x < 170; x += 18) {
            for (let y = 12; y < 240; y += 18) {
                ctx.beginPath();
                ctx.moveTo(x + 9, y);
                ctx.lineTo(x + 18, y + 9);
                ctx.lineTo(x + 9, y + 18);
                ctx.lineTo(x, y + 9);
                ctx.closePath();
                ctx.stroke();
            }
        }
        ctx.fillStyle = '#FFE066';
        ctx.font = 'bold 20px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DIAMOND', 90, 130);
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 180, 252);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.strokeRect(3, 3, 174, 246);

        const isRed = card.color === 'red' || card.suit === '♥' || card.suit === '♦';
        ctx.fillStyle = isRed ? '#dc2626' : '#0f172a';
        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(card.val, 14, 38);
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(card.suit, 15, 68);

        ctx.textAlign = 'center';
        if (['K', 'Q', 'J'].includes(card.val)) {
            ctx.font = 'bold 64px sans-serif';
            ctx.fillText(card.val === 'K' ? '♔' : (card.val === 'Q' ? '♕' : '♘'), 90, 145);
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText(card.suit, 90, 188);
        } else {
            ctx.font = 'bold 74px sans-serif';
            ctx.fillText(card.suit, 90, 150);
        }

        ctx.save();
        ctx.translate(166, 214);
        ctx.rotate(Math.PI);
        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(card.val, 0, 0);
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(card.suit, 0, 30);
        ctx.restore();
    }

    if (typeof THREE !== 'undefined' && THREE.CanvasTexture) {
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 4;
        return tex;
    }
    return null;
}

function create3DCardMesh(card, faceDown = false) {
    if (typeof THREE === 'undefined') return null;
    const faceTex = createCardTexture(card, false);
    const backTex = createCardTexture(card, true);

    const sideMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const topMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.35 });
    const bottomMat = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.35 });

    const materials = [sideMat, sideMat, topMat, bottomMat, sideMat, sideMat];
    const cardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.015, 0.8), materials);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;

    if (faceDown) {
        cardMesh.rotation.x = Math.PI;
        cardMesh.userData.isFaceDown = true;
    } else {
        cardMesh.userData.isFaceDown = false;
    }
    cardMesh.userData.cardData = card;
    return cardMesh;
}

function flip3DCardMesh(cardMesh) {
    if (!cardMesh || !cardMesh.userData || !cardMesh.userData.isFaceDown) return;
    cardMesh.userData.isFaceDown = false;
    const startRotX = cardMesh.rotation.x;
    const startTime = performance.now();
    const duration = 300;

    function anim(now) {
        const t = Math.min(1, (now - startTime) / duration);
        cardMesh.rotation.x = startRotX + (0 - startRotX) * (1 - Math.pow(1 - t, 2));
        cardMesh.position.y = 2.32 + Math.sin(t * Math.PI) * 0.25;
        if (t < 1) {
            requestAnimationFrame(anim);
        } else {
            cardMesh.rotation.x = 0;
            cardMesh.position.y = 2.32;
        }
    }
    requestAnimationFrame(anim);
}

function create3DChipStack(amount, posVec) {
    if (typeof THREE === 'undefined') return null;
    const group = new THREE.Group();
    const denominations = [
        { val: 500, col: 0xec4899 },
        { val: 250, col: 0x8b5cf6 },
        { val: 100, col: 0x111827 },
        { val: 50, col: 0xef4444 },
        { val: 25, col: 0x10b981 },
        { val: 10, col: 0x3b82f6 }
    ];

    let rem = amount;
    let chipCount = 0;
    const maxChips = 10;

    denominations.forEach(d => {
        while (rem >= d.val && chipCount < maxChips) {
            const chip = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.18, 0.038, 16),
                new THREE.MeshStandardMaterial({ color: d.col, roughness: 0.3, metalness: 0.25 })
            );
            chip.position.set((Math.random() - 0.5) * 0.02, chipCount * 0.038, (Math.random() - 0.5) * 0.02);
            group.add(chip);
            rem -= d.val;
            chipCount++;
        }
    });

    if (chipCount === 0) {
        const chip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 0.038, 16),
            new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.25 })
        );
        group.add(chip);
    }

    if (posVec && posVec.copy) group.position.copy(posVec);
    return group;
}

function createInWorldScoreSprite(text, bgColor = 'rgba(15, 23, 42, 0.85)') {
    if (typeof document === 'undefined' || !document.createElement || typeof THREE === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.roundRect ? ctx.roundRect(4, 4, 120, 56, 12) : ctx.rect(4, 4, 120, 56);
    ctx.fill();
    ctx.strokeStyle = '#FFE066';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Fredoka, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.9, 0.45, 1);
    return sprite;
}

// ----------------------------------------------------------------------------
// Seating & Camera Management (GTA 5 Style In-World)
// ----------------------------------------------------------------------------
function isPlayerSeatedAtBjTable() {
    return !!(typeof gameSpecificData !== 'undefined' && gameSpecificData && gameSpecificData.isPlayerSeatedAtBj);
}

function sitAt3DBlackjackTable(seatIdx = null) {
    if (typeof activeGameMode !== 'undefined' && activeGameMode !== 'casino') return;
    if (typeof document !== 'undefined' && document.pointerLockElement) {
        try { document.exitPointerLock(); } catch (e) {}
    }

    if (typeof closeCasinoModal === 'function') closeCasinoModal();

    if (typeof bjTableState === 'undefined' || !bjTableState.seats) return;

    if (seatIdx === null || seatIdx < 0 || seatIdx >= bjTableState.seats.length) {
        seatIdx = bjTableState.seats.findIndex(s => !s.occupied);
        if (seatIdx === -1) seatIdx = 1;
    }

    const seat = bjTableState.seats[seatIdx];
    const myNick = (typeof authState !== 'undefined' && authState.user && authState.user.username)
        ? authState.user.username
        : (typeof mpState !== 'undefined' && mpState.nickname ? mpState.nickname : 'Ty');

    bjTableState.localSeat = seatIdx;
    seat.occupied = true;
    seat.peerId = (typeof mpState !== 'undefined') ? mpState.myId : 'local';
    seat.username = myNick;
    seat.bet = bjState.bet || 50;

    if (typeof gameSpecificData !== 'undefined') {
        gameSpecificData.isPlayerSeatedAtBj = true;
    }

    if (typeof playerState !== 'undefined') {
        playerState.pos.copy(seat.pos);
        playerState.vel.set(0, 0, 0);
    }

    const hud = document.getElementById('blackjack-3d-hud');
    if (hud) {
        hud.classList.remove('hidden');
        hud.classList.add('flex');
    }

    const seatNumEl = document.getElementById('bj-seated-seat-num');
    if (seatNumEl) seatNumEl.textContent = `${seat.label}`;

    showGtaNotification('Blackjack (21)', `Přisedl jsi k ${seat.label}. Zvol výši své sázky!`, '🪑');

    setInWorldBjBet(seat.bet);
    updateInWorldBjUI();

    if (typeof sendMultiplayerPacket === 'function') {
        sendMultiplayerPacket({
            type: 'casino_event',
            action: 'bj_sit',
            seatIdx: seatIdx,
            nickname: myNick,
            id: seat.peerId
        });
    }
}

function standUpFromBjTable() {
    if (typeof gameSpecificData === 'undefined' || !gameSpecificData.isPlayerSeatedAtBj) return;
    if (typeof bjTableState !== 'undefined' && bjTableState.localSeat >= 0 && bjTableState.localSeat < bjTableState.seats.length) {
        const seat = bjTableState.seats[bjTableState.localSeat];
        seat.occupied = false;
        seat.peerId = null;
        seat.username = '';
        seat.confirmedBet = false;
    }
    const oldSeat = typeof bjTableState !== 'undefined' ? bjTableState.localSeat : -1;
    if (typeof bjTableState !== 'undefined') bjTableState.localSeat = -1;
    gameSpecificData.isPlayerSeatedAtBj = false;

    if (typeof playerState !== 'undefined') {
        playerState.pos.set(-18, 1.8, -3.2);
    }

    const hud = document.getElementById('blackjack-3d-hud');
    if (hud) {
        hud.classList.add('hidden');
        hud.classList.remove('flex');
    }

    if (typeof showHudToast === 'function') showHudToast('Vstal jsi od stolu Blackjacku.', 'blue');

    if (typeof sendMultiplayerPacket === 'function') {
        sendMultiplayerPacket({
            type: 'casino_event',
            action: 'bj_stand_up',
            seatIdx: oldSeat
        });
    }

    const canvas = document.getElementById('three-canvas');
    if (canvas) canvas.focus();
}

function setInWorldBjBet(amount) {
    setBjBet(amount);
    if (typeof bjTableState !== 'undefined' && bjTableState.localSeat >= 0) {
        bjTableState.seats[bjTableState.localSeat].bet = amount;
    }
}

function clearInWorldBjBet() {
    clearBjBet();
    if (typeof bjTableState !== 'undefined' && bjTableState.localSeat >= 0) {
        bjTableState.seats[bjTableState.localSeat].bet = 10;
    }
}

function confirmInWorldBjBet() {
    if (typeof bjTableState === 'undefined' || bjTableState.localSeat < 0) return;
    const seat = bjTableState.seats[bjTableState.localSeat];
    if (typeof bobuxBalance !== 'undefined' && bobuxBalance < seat.bet) {
        if (typeof showHudToast === 'function') showHudToast(`Nemáš dostatek Bobuxů! (Máš ${bobuxBalance} B$, sázka je ${seat.bet} B$)`, 'red');
        return;
    }
    seat.confirmedBet = true;
    showGtaNotification('Sázka potvrzena', `Sázka ${seat.bet} B$ uzamčena pro další hru.`, '🪙');
    if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();

    if (typeof scene !== 'undefined') {
        seat.chipMeshes.forEach(m => scene.remove(m));
        seat.chipMeshes = [];
        const chipsGroup = create3DChipStack(seat.bet, seat.betPos);
        if (chipsGroup) {
            scene.add(chipsGroup);
            seat.chipMeshes.push(chipsGroup);
        }
    }

    if (typeof sendMultiplayerPacket === 'function') {
        sendMultiplayerPacket({
            type: 'casino_event',
            action: 'bj_bet',
            seatIdx: bjTableState.localSeat,
            amount: seat.bet
        });
    }
}

function showGtaNotification(title, message, icon = '🃏') {
    if (typeof document === 'undefined') return;
    const pill = document.getElementById('bj-gta-notification');
    const titleEl = document.getElementById('bj-gta-title');
    const msgEl = document.getElementById('bj-gta-message');
    const iconEl = document.getElementById('bj-gta-icon');
    if (!pill || !msgEl) return;

    if (titleEl) titleEl.textContent = title;
    msgEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;

    pill.classList.remove('hidden');
    clearTimeout(pill._timer);
    pill._timer = setTimeout(() => {
        pill.classList.add('hidden');
    }, 4500);
}

function updateInWorldBjUI() {
    if (typeof document === 'undefined') return;
    const phaseBanner = document.getElementById('bj-table-phase-banner');
    const phaseTitle = document.getElementById('bj-table-phase-title');
    const phaseTimer = document.getElementById('bj-table-phase-timer');
    const bettingBar = document.getElementById('bj-betting-controls');
    const actionBar = document.getElementById('bj-action-controls');

    if (!phaseBanner || typeof bjTableState === 'undefined') return;

    if (bjTableState.phase === 'betting') {
        if (phaseTitle) phaseTitle.textContent = 'FÁZE SÁZEK';
        if (phaseTimer) phaseTimer.textContent = `SÁZKY KONČÍ ZA: ${Math.ceil(bjTableState.phaseTimer)}s`;
        if (bettingBar) bettingBar.classList.remove('hidden');
        if (actionBar) actionBar.classList.add('hidden');
    } else if (bjTableState.phase === 'players') {
        const isMyTurn = (bjTableState.currentSeatTurn === bjTableState.localSeat);
        if (phaseTitle) phaseTitle.textContent = isMyTurn ? 'TVŮJ TAH' : 'TAH HRÁČŮ';
        if (phaseTimer) phaseTimer.textContent = `LIMIT NA TAH: ${Math.ceil(bjTableState.turnTimer)}s`;
        if (bettingBar) bettingBar.classList.add('hidden');
        if (actionBar) actionBar.classList.toggle('hidden', !isMyTurn);
    } else if (bjTableState.phase === 'dealer') {
        if (phaseTitle) phaseTitle.textContent = 'TAH KRUPIÉRA';
        if (phaseTimer) phaseTimer.textContent = 'KRUPIÉR HRAJE...';
        if (bettingBar) bettingBar.classList.add('hidden');
        if (actionBar) actionBar.classList.add('hidden');
    } else if (bjTableState.phase === 'payout' || bjTableState.phase === 'cooldown') {
        if (phaseTitle) phaseTitle.textContent = 'VÝSLEDKY';
        if (phaseTimer) phaseTimer.textContent = `DALŠÍ HRA ZA: ${Math.ceil(bjTableState.phaseTimer)}s`;
        if (bettingBar) bettingBar.classList.add('hidden');
        if (actionBar) actionBar.classList.add('hidden');
    }
}

// ----------------------------------------------------------------------------
// Core 3D Game Loop & State Transitions
// ----------------------------------------------------------------------------
function update3DBlackjackGame(dt, elapsedSec) {
    if (typeof gameSpecificData === 'undefined' || typeof activeGameMode === 'undefined' || activeGameMode !== 'casino') return;
    if (typeof bjTableState === 'undefined') return;

    if (gameSpecificData.dealerChar && gameSpecificData.dealerChar.rightArmPivot) {
        if (bjTableState.dealingArmAnim > 0) {
            bjTableState.dealingArmAnim -= dt * 3.5;
            gameSpecificData.dealerChar.rightArmPivot.rotation.x = 1.6 + Math.sin(bjTableState.dealingArmAnim * Math.PI) * 0.8;
            gameSpecificData.dealerChar.rightArmPivot.rotation.y = -0.4;
        } else {
            gameSpecificData.dealerChar.rightArmPivot.rotation.y = 0;
        }
    }

    if (bjTableState.phase === 'betting') {
        bjTableState.phaseTimer -= dt;
        updateInWorldBjUI();
        if (bjTableState.phaseTimer <= 0) {
            startInWorldBlackjackDealing();
        }
    } else if (bjTableState.phase === 'players') {
        bjTableState.turnTimer -= dt;
        updateInWorldBjUI();
        if (bjTableState.turnTimer <= 0) {
            if (bjTableState.currentSeatTurn === bjTableState.localSeat) {
                executeBjAction('stand');
            } else {
                advanceToNextPlayerTurn();
            }
        }
    } else if (bjTableState.phase === 'cooldown') {
        bjTableState.phaseTimer -= dt;
        updateInWorldBjUI();
        if (bjTableState.phaseTimer <= 0) {
            resetBlackjackTableForNewRound();
        }
    }
}

function startInWorldBlackjackDealing() {
    if (typeof bjTableState === 'undefined') return;
    const activeSeats = bjTableState.seats.filter(s => s.occupied && (s.confirmedBet || s.bet > 0));
    if (activeSeats.length === 0) {
        bjTableState.phase = 'betting';
        bjTableState.phaseTimer = 10;
        updateInWorldBjUI();
        return;
    }

    bjTableState.phase = 'dealing';
    updateInWorldBjUI();

    activeSeats.forEach(seat => {
        if (seat.id === bjTableState.localSeat && typeof spendBobux === 'function') {
            spendBobux(seat.bet, `Blackjack sázka (${seat.bet} B$)`);
            if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
        }
        seat.hands = [{
            cards: [],
            bet: seat.bet,
            status: 'playing',
            score: 0
        }];
        seat.activeHandIdx = 0;
    });

    if (bjTableState.deck.length < 20) {
        bjTableState.deck = createShuffledDeck();
    }

    showGtaNotification('Sázky uzavřeny', 'Krupiér rozdává karty...', '🃏');

    let dealStep = 0;
    const dealSteps = [];

    activeSeats.forEach(s => dealSteps.push({ target: 'seat', seat: s, faceDown: false }));
    dealSteps.push({ target: 'dealer', faceDown: false });
    activeSeats.forEach(s => dealSteps.push({ target: 'seat', seat: s, faceDown: false }));
    dealSteps.push({ target: 'dealer', faceDown: true });

    function runDealStep() {
        if (dealStep >= dealSteps.length) {
            evaluatePostDealState();
            return;
        }

        const step = dealSteps[dealStep++];
        const card = bjTableState.deck.pop();

        bjTableState.dealingArmAnim = 1.0;
        if (typeof sfx !== 'undefined' && sfx.playCardFlip) sfx.playCardFlip();

        if (step.target === 'seat') {
            const currentHand = step.seat.hands[0];
            currentHand.cards.push(card);
            const cardMesh = create3DCardMesh(card, false);

            if (cardMesh && typeof scene !== 'undefined') {
                const cardOffset = (currentHand.cards.length - 1) * 0.32;
                cardMesh.position.set(step.seat.cardPos.x + cardOffset, 2.32 + cardOffset * 0.01, step.seat.cardPos.z);
                cardMesh.rotation.y = step.seat.rotY;
                scene.add(cardMesh);
                step.seat.cardMeshes.push(cardMesh);
            }

            const scoreObj = calculateHandScore(currentHand.cards);
            currentHand.score = scoreObj.total;
            updateSeatScoreBadge(step.seat, scoreObj);

            if (step.seat.id === bjTableState.localSeat) {
                bjState.playerHand = currentHand.cards;
                renderHandCards('bj-player-cards', bjState.playerHand, false);
                const pScoreEl = document.getElementById('bj-player-score');
                if (pScoreEl) pScoreEl.textContent = `Součet: ${scoreObj.total}`;
            }
        } else {
            bjTableState.dealerHand.push(card);
            const cardMesh = create3DCardMesh(card, step.faceDown);
            if (cardMesh && typeof scene !== 'undefined') {
                const dOffset = (bjTableState.dealerHand.length - 1) * 0.45;
                cardMesh.position.set(-18.0 + dOffset - 0.22, 2.32, -9.2);
                scene.add(cardMesh);
                bjTableState.dealerCardMeshes.push(cardMesh);
            }

            const dScoreObj = calculateHandScore(bjTableState.dealerHand, step.faceDown);
            updateDealerScoreBadge(dScoreObj, step.faceDown);

            bjState.dealerHand = bjTableState.dealerHand;
            renderHandCards('bj-dealer-cards', bjState.dealerHand, step.faceDown);
            const dScoreEl = document.getElementById('bj-dealer-score');
            if (dScoreEl) dScoreEl.textContent = `Karta: ${dScoreObj.total}`;
        }

        setTimeout(runDealStep, 380);
    }

    setTimeout(runDealStep, 250);
}

function updateSeatScoreBadge(seat, scoreObj) {
    if (typeof scene === 'undefined') return;
    if (seat.scoreSprite) {
        scene.remove(seat.scoreSprite);
        seat.scoreSprite = null;
    }
    let label = `${scoreObj.total}`;
    let bg = 'rgba(15, 23, 42, 0.85)';
    if (scoreObj.isBlackjack) { label = 'BJ 21!'; bg = 'rgba(16, 185, 129, 0.9)'; }
    else if (scoreObj.isBust) { label = 'BUST!'; bg = 'rgba(239, 68, 68, 0.9)'; }

    const sprite = createInWorldScoreSprite(label, bg);
    if (sprite) {
        sprite.position.set(seat.cardPos.x + 0.15, 2.9, seat.cardPos.z);
        scene.add(sprite);
        seat.scoreSprite = sprite;
    }
}

function updateDealerScoreBadge(scoreObj, hideHole = false) {
    if (typeof scene === 'undefined') return;
    if (bjTableState.dealerScoreSprite) {
        scene.remove(bjTableState.dealerScoreSprite);
        bjTableState.dealerScoreSprite = null;
    }
    const label = hideHole ? `${scoreObj.total} + ?` : (scoreObj.isBust ? 'BUST!' : `${scoreObj.total}`);
    const bg = scoreObj.isBust ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.85)';
    const sprite = createInWorldScoreSprite(label, bg);
    if (sprite) {
        sprite.position.set(-18.0, 2.9, -9.2);
        scene.add(sprite);
        bjTableState.dealerScoreSprite = sprite;
    }
}

function evaluatePostDealState() {
    const dScore = calculateHandScore(bjTableState.dealerHand);
    if (dScore.isBlackjack) {
        showGtaNotification('Dealer Blackjack', 'Krupiér má přirozený Blackjack (21)!', '👑');
        startInWorldBlackjackDealerTurn();
        return;
    }

    bjTableState.phase = 'players';
    bjTableState.currentSeatTurn = -1;
    advanceToNextPlayerTurn();
}

function advanceToNextPlayerTurn() {
    let nextSeat = null;

    for (let i = 0; i < bjTableState.seats.length; i++) {
        const s = bjTableState.seats[i];
        if (s.occupied && s.hands.some(h => h.status === 'playing') && s.id > bjTableState.currentSeatTurn) {
            nextSeat = s;
            break;
        }
    }

    if (!nextSeat) {
        startInWorldBlackjackDealerTurn();
        return;
    }

    bjTableState.currentSeatTurn = nextSeat.id;
    bjTableState.turnTimer = 15;
    updateInWorldBjUI();

    if (nextSeat.id === bjTableState.localSeat) {
        showGtaNotification('Tvůj tah', 'Vezmi kartu (Hit), Stůj (Stand), Zdvojnásob nebo Rozděl!', '🎮');
        const currentHand = nextSeat.hands[nextSeat.activeHandIdx] || nextSeat.hands[0];
        const canDouble = (currentHand.cards.length === 2 && (typeof bobuxBalance === 'undefined' || bobuxBalance >= currentHand.bet));
        const canSplit = (currentHand.cards.length === 2 && currentHand.cards[0].val === currentHand.cards[1].val && (typeof bobuxBalance === 'undefined' || bobuxBalance >= currentHand.bet));

        const dBtn = document.getElementById('bj-action-double');
        const sBtn = document.getElementById('bj-action-split');
        if (dBtn) dBtn.disabled = !canDouble;
        if (sBtn) sBtn.disabled = !canSplit;
    } else {
        showGtaNotification('Tah hráče', `Hraje ${nextSeat.username || nextSeat.label}...`, '⏳');
    }
}

function executeBjAction(action) {
    if (typeof bjTableState === 'undefined' || (bjTableState.phase !== 'players' && bjTableState.phase !== 'playing')) return;
    const seatIdx = bjTableState.localSeat;
    if (seatIdx < 0) return;
    const seat = bjTableState.seats[seatIdx];
    if (!seat || seat.hands.length === 0) return;

    const currentHand = seat.hands[seat.activeHandIdx] || seat.hands[0];

    if (action === 'hit') {
        bjTableState.dealingArmAnim = 1.0;
        if (typeof sfx !== 'undefined' && sfx.playCardFlip) sfx.playCardFlip();

        const card = bjTableState.deck.pop();
        currentHand.cards.push(card);

        const cardMesh = create3DCardMesh(card, false);
        if (cardMesh && typeof scene !== 'undefined') {
            const offset = (currentHand.cards.length - 1) * 0.32;
            const handXShift = (seat.activeHandIdx === 1) ? 0.45 : (seat.hands.length > 1 ? -0.45 : 0);
            cardMesh.position.set(seat.cardPos.x + offset + handXShift, 2.32 + offset * 0.01, seat.cardPos.z);
            cardMesh.rotation.y = seat.rotY;
            scene.add(cardMesh);
            seat.cardMeshes.push(cardMesh);
        }

        const scoreObj = calculateHandScore(currentHand.cards);
        currentHand.score = scoreObj.total;
        updateSeatScoreBadge(seat, scoreObj);

        bjState.playerHand = currentHand.cards;
        renderHandCards('bj-player-cards', bjState.playerHand, false);
        const pScoreEl = document.getElementById('bj-player-score');
        if (pScoreEl) pScoreEl.textContent = `Součet: ${scoreObj.total}`;

        if (scoreObj.isBust) {
            currentHand.status = 'bust';
            if (typeof sfx !== 'undefined' && sfx.playOof) sfx.playOof();
            showGtaNotification('Překročeno 21 (Bust)', `Tvá ruka má součet ${scoreObj.total}!`, '💥');
            advanceToNextHandOrPlayer(seat);
        } else if (scoreObj.total === 21) {
            currentHand.status = 'stood';
            advanceToNextHandOrPlayer(seat);
        }
    } else if (action === 'stand') {
        currentHand.status = 'stood';
        advanceToNextHandOrPlayer(seat);
    } else if (action === 'double') {
        if (currentHand.cards.length !== 2) return;
        if (typeof bobuxBalance !== 'undefined' && bobuxBalance < currentHand.bet) return;
        if (typeof spendBobux === 'function') spendBobux(currentHand.bet, 'Blackjack Double Down');
        bjState.betBeforeDouble = currentHand.bet;
        currentHand.bet *= 2;
        bjState.bet = currentHand.bet;

        const curBetEl = document.getElementById('bj-current-bet');
        if (curBetEl) curBetEl.textContent = `${currentHand.bet} B$`;

        if (typeof scene !== 'undefined') {
            const secondChips = create3DChipStack(currentHand.bet / 2, seat.betPos.clone ? seat.betPos.clone().add(new THREE.Vector3(0.18, 0, 0.1)) : seat.betPos);
            if (secondChips) {
                scene.add(secondChips);
                seat.chipMeshes.push(secondChips);
            }
        }

        bjTableState.dealingArmAnim = 1.0;
        if (typeof sfx !== 'undefined' && sfx.playCardFlip) sfx.playCardFlip();

        const card = bjTableState.deck.pop();
        currentHand.cards.push(card);
        const cardMesh = create3DCardMesh(card, false);
        if (cardMesh && typeof scene !== 'undefined') {
            const offset = (currentHand.cards.length - 1) * 0.32;
            cardMesh.position.set(seat.cardPos.x + offset, 2.32 + offset * 0.01, seat.cardPos.z);
            cardMesh.rotation.y = seat.rotY;
            scene.add(cardMesh);
            seat.cardMeshes.push(cardMesh);
        }

        const scoreObj = calculateHandScore(currentHand.cards);
        currentHand.score = scoreObj.total;
        updateSeatScoreBadge(seat, scoreObj);

        currentHand.status = scoreObj.isBust ? 'bust' : 'stood';
        advanceToNextHandOrPlayer(seat);
    } else if (action === 'split') {
        if (currentHand.cards.length !== 2) return;
        if (typeof bobuxBalance !== 'undefined' && bobuxBalance < currentHand.bet) return;
        if (typeof spendBobux === 'function') spendBobux(currentHand.bet, 'Blackjack Split');
        if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();

        const splitCard2 = currentHand.cards.pop();
        const hand2 = {
            cards: [splitCard2],
            bet: currentHand.bet,
            status: 'playing',
            score: 0
        };
        seat.hands.push(hand2);

        if (seat.cardMeshes.length >= 2) {
            seat.cardMeshes[0].position.x -= 0.45;
            seat.cardMeshes[1].position.x += 0.45;
        }

        const c1 = bjTableState.deck.pop();
        currentHand.cards.push(c1);
        const meshC1 = create3DCardMesh(c1, false);
        if (meshC1 && typeof scene !== 'undefined') {
            meshC1.position.set(seat.cardPos.x - 0.45 + 0.3, 2.33, seat.cardPos.z);
            meshC1.rotation.y = seat.rotY;
            scene.add(meshC1);
            seat.cardMeshes.push(meshC1);
        }

        const c2 = bjTableState.deck.pop();
        hand2.cards.push(c2);
        const meshC2 = create3DCardMesh(c2, false);
        if (meshC2 && typeof scene !== 'undefined') {
            meshC2.position.set(seat.cardPos.x + 0.45 + 0.3, 2.33, seat.cardPos.z);
            meshC2.rotation.y = seat.rotY;
            scene.add(meshC2);
            seat.cardMeshes.push(meshC2);
        }

        showGtaNotification('Ruka rozdělena (Split)', 'Hraješ obě ruce samostatně!', '🟣');
    }

    if (typeof sendMultiplayerPacket === 'function') {
        sendMultiplayerPacket({
            type: 'casino_event',
            action: 'bj_action',
            seatIdx: seatIdx,
            bjAction: action
        });
    }
}

function advanceToNextHandOrPlayer(seat) {
    if (seat.activeHandIdx + 1 < seat.hands.length) {
        seat.activeHandIdx++;
        bjTableState.turnTimer = 15;
        updateInWorldBjUI();
        showGtaNotification('Druhá ruka', 'Hraješ druhou rozdělenou ruku!', '🟣');
    } else {
        advanceToNextPlayerTurn();
    }
}

function startInWorldBlackjackDealerTurn() {
    bjTableState.phase = 'dealer';
    updateInWorldBjUI();

    if (bjTableState.dealerCardMeshes.length >= 2) {
        flip3DCardMesh(bjTableState.dealerCardMeshes[1]);
    }
    renderHandCards('bj-dealer-cards', bjTableState.dealerHand, false);

    let dScoreObj = calculateHandScore(bjTableState.dealerHand);
    updateDealerScoreBadge(dScoreObj, false);

    function dealerDrawStep() {
        dScoreObj = calculateHandScore(bjTableState.dealerHand);
        updateDealerScoreBadge(dScoreObj, false);

        if (dScoreObj.total < 17) {
            bjTableState.dealingArmAnim = 1.0;
            if (typeof sfx !== 'undefined' && sfx.playCardFlip) sfx.playCardFlip();

            const card = bjTableState.deck.pop();
            bjTableState.dealerHand.push(card);
            const cardMesh = create3DCardMesh(card, false);
            if (cardMesh && typeof scene !== 'undefined') {
                const dOffset = (bjTableState.dealerHand.length - 1) * 0.45;
                cardMesh.position.set(-18.0 + dOffset - 0.22, 2.32, -9.2);
                scene.add(cardMesh);
                bjTableState.dealerCardMeshes.push(cardMesh);
            }

            renderHandCards('bj-dealer-cards', bjTableState.dealerHand, false);
            setTimeout(dealerDrawStep, 650);
        } else {
            resolveInWorldBlackjackPayout(dScoreObj);
        }
    }

    setTimeout(dealerDrawStep, 600);
}

function resolveInWorldBlackjackPayout(dScoreObj) {
    bjTableState.phase = 'payout';
    updateInWorldBjUI();

    const dTotal = dScoreObj.total;
    const isDealerBust = dScoreObj.isBust;
    const isDealerBJ = dScoreObj.isBlackjack;

    bjTableState.seats.forEach(seat => {
        if (!seat.occupied || seat.hands.length === 0) return;

        seat.hands.forEach((hand, hIdx) => {
            const pScoreObj = calculateHandScore(hand.cards);
            let payout = 0;
            let result = 'lose';
            let outcomeMsg = '';

            if (pScoreObj.isBust) {
                result = 'bust';
                outcomeMsg = 'Překročil jsi 21 (Bust). Sázka propadá.';
            } else if (pScoreObj.isBlackjack) {
                if (isDealerBJ) {
                    result = 'push';
                    payout = hand.bet;
                    outcomeMsg = 'Remíza přirozených Blackjacků! Sázka vrácena.';
                } else {
                    result = 'blackjack';
                    payout = Math.round(hand.bet * 2.5); // Natural 3:2 payout!
                    outcomeMsg = `PŘIROZENÝ BLACKJACK! Vyhráváš ${payout} B$ (3:2)!`;
                }
            } else if (isDealerBust) {
                result = 'win';
                payout = hand.bet * 2;
                outcomeMsg = `Krupiér přetáhl (${dTotal})! Vyhráváš ${payout} B$!`;
            } else if (pScoreObj.total > dTotal) {
                result = 'win';
                payout = hand.bet * 2;
                outcomeMsg = `Vítězství (${pScoreObj.total} vs ${dTotal})! Získáváš ${payout} B$!`;
            } else if (pScoreObj.total < dTotal) {
                result = 'lose';
                outcomeMsg = `Krupiér vyhrál (${dTotal} vs ${pScoreObj.total}).`;
            } else {
                result = 'push';
                payout = hand.bet;
                outcomeMsg = `Remíza (${pScoreObj.total} vs ${dTotal}). Sázka vrácena.`;
            }

            if (seat.id === bjTableState.localSeat) {
                if (result === 'win' || result === 'blackjack') {
                    if (typeof addBobux === 'function') addBobux(payout, 'Výhra v Blackjacku');
                    if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
                    if (typeof sfx !== 'undefined' && sfx.playWinFanfare) sfx.playWinFanfare();
                    showGtaNotification('Vítězství!', outcomeMsg, '🎉');
                    if (typeof spawnObbyConfetti === 'function' && seat.pos.clone) {
                        spawnObbyConfetti(seat.pos.clone().add(new THREE.Vector3(0, 1.5, 0)));
                    }
                } else if (result === 'push') {
                    if (typeof addBobux === 'function') addBobux(payout, 'Blackjack remíza');
                    if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
                    if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();
                    showGtaNotification('Remíza (Push)', outcomeMsg, '🪙');
                } else {
                    if (typeof sfx !== 'undefined' && sfx.playOof) sfx.playOof();
                    showGtaNotification('Prohra', outcomeMsg, '💥');
                }

                finishBlackjackRound(result, outcomeMsg, payout);
            }
        });
    });

    bjTableState.phase = 'cooldown';
    bjTableState.phaseTimer = 5;
    updateInWorldBjUI();
}

function resetBlackjackTableForNewRound() {
    if (typeof scene !== 'undefined') {
        bjTableState.dealerCardMeshes.forEach(m => scene.remove(m));
        bjTableState.dealerCardMeshes = [];
        if (bjTableState.dealerScoreSprite) {
            scene.remove(bjTableState.dealerScoreSprite);
            bjTableState.dealerScoreSprite = null;
        }

        bjTableState.seats.forEach(seat => {
            seat.cardMeshes.forEach(m => scene.remove(m));
            seat.cardMeshes = [];
            seat.chipMeshes.forEach(m => scene.remove(m));
            seat.chipMeshes = [];
            if (seat.scoreSprite) {
                scene.remove(seat.scoreSprite);
                seat.scoreSprite = null;
            }
            seat.hands = [];
            seat.activeHandIdx = 0;
            seat.confirmedBet = false;
        });
    }

    bjTableState.dealerHand = [];
    bjTableState.phase = 'betting';
    bjTableState.phaseTimer = 10;
    updateInWorldBjUI();

    if (bjTableState.localSeat >= 0) {
        showGtaNotification('Nové kolo', 'Zvol výši sázky a klikni na Potvrdit.', '🃏');
    }
}

// ----------------------------------------------------------------------------
// Test Compatibility Contract Functions & Fallbacks
// ----------------------------------------------------------------------------
function dealBlackjack() {
    if (typeof bjTableState !== 'undefined' && bjTableState.localSeat >= 0 && typeof scene !== 'undefined') {
        confirmInWorldBjBet();
        startInWorldBlackjackDealing();
        return;
    }
    // Standalone fallback for isolated unit tests / test mock context
    if (bjState.phase === 'playing') return;
    if (typeof bobuxBalance !== 'undefined' && bobuxBalance < bjState.bet) {
        if (typeof showHudToast === 'function') showHudToast(`Nemáš dostatek Bobuxů!`, 'red');
        return;
    }
    if (typeof spendBobux === 'function') spendBobux(bjState.bet, `Blackjack sázka (${bjState.bet} B$)`);
    if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
    if (typeof sfx !== 'undefined' && sfx.playCardFlip) sfx.playCardFlip();

    if (!bjState.deck || bjState.deck.length < 15) {
        bjState.deck = createShuffledDeck();
    }
    bjState.playerHand = [bjState.deck.pop(), bjState.deck.pop()];
    bjState.dealerHand = [bjState.deck.pop(), bjState.deck.pop()];
    bjState.phase = 'playing';

    const btnDeal = document.getElementById('bj-btn-deal');
    const btnHit = document.getElementById('bj-btn-hit');
    const btnStand = document.getElementById('bj-btn-stand');
    const btnDouble = document.getElementById('bj-btn-double');
    if (btnDeal) btnDeal.disabled = true;
    if (btnHit) btnHit.disabled = false;
    if (btnStand) btnStand.disabled = false;
    if (btnDouble) btnDouble.disabled = (typeof bobuxBalance !== 'undefined' && bobuxBalance < bjState.bet);

    renderHandCards('bj-dealer-cards', bjState.dealerHand, true);
    renderHandCards('bj-player-cards', bjState.playerHand, false);

    const pScore = calculateHandScore(bjState.playerHand);
    const dScoreVisible = calculateHandScore([bjState.dealerHand[1]]);
    const dScoreEl = document.getElementById('bj-dealer-score');
    if (dScoreEl) dScoreEl.textContent = `Karta: ${dScoreVisible.total}`;
    const pScoreEl = document.getElementById('bj-player-score');
    if (pScoreEl) pScoreEl.textContent = `Součet: ${pScore.total}`;
}

function hitBlackjack() {
    if (typeof bjTableState !== 'undefined' && bjTableState.localSeat >= 0 && typeof scene !== 'undefined') {
        executeBjAction('hit');
        return;
    }
    if (bjState.phase !== 'playing') return;
    if (typeof sfx !== 'undefined' && sfx.playCardFlip) sfx.playCardFlip();
    bjState.playerHand.push(bjState.deck.pop());
    renderHandCards('bj-player-cards', bjState.playerHand, false);

    const pScore = calculateHandScore(bjState.playerHand);
    const pScoreEl = document.getElementById('bj-player-score');
    if (pScoreEl) pScoreEl.textContent = `Součet: ${pScore.total}`;

    const btnDouble = document.getElementById('bj-btn-double');
    if (btnDouble) btnDouble.disabled = true;

    if (pScore.isBust) {
        finishBlackjackRound('bust');
    } else if (pScore.total === 21) {
        standBlackjack();
    }
}

function standBlackjack() {
    if (typeof bjTableState !== 'undefined' && bjTableState.localSeat >= 0 && typeof scene !== 'undefined') {
        executeBjAction('stand');
        return;
    }
    if (bjState.phase !== 'playing') return;
    bjState.phase = 'dealer';
    const btnHit = document.getElementById('bj-btn-hit');
    const btnStand = document.getElementById('bj-btn-stand');
    const btnDouble = document.getElementById('bj-btn-double');
    if (btnHit) btnHit.disabled = true;
    if (btnStand) btnStand.disabled = true;
    if (btnDouble) btnDouble.disabled = true;

    resolveBlackjackDealerTurn();
}

function doubleBlackjack() {
    if (typeof bjTableState !== 'undefined' && bjTableState.localSeat >= 0 && typeof scene !== 'undefined') {
        executeBjAction('double');
        return;
    }
    if (bjState.phase !== 'playing' || !bjState.playerHand || bjState.playerHand.length !== 2) return;
    if (typeof bobuxBalance !== 'undefined' && bobuxBalance < bjState.bet) {
        if (typeof showHudToast === 'function') showHudToast('Nemáš dostatek Bobuxů na zdvojnásobení!', 'red');
        return;
    }
    if (typeof spendBobux === 'function') spendBobux(bjState.bet, 'Blackjack Double Down');
    bjState.betBeforeDouble = bjState.bet;
    bjState.bet *= 2;
    if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
    const curBetEl = document.getElementById('bj-current-bet');
    if (curBetEl) curBetEl.textContent = `${bjState.bet} B$`;
    if (typeof sfx !== 'undefined' && sfx.playCardFlip) sfx.playCardFlip();
    bjState.playerHand.push(bjState.deck.pop());
    renderHandCards('bj-player-cards', bjState.playerHand, false);

    const pScore = calculateHandScore(bjState.playerHand);
    const pScoreEl = document.getElementById('bj-player-score');
    if (pScoreEl) pScoreEl.textContent = `Součet: ${pScore.total}`;

    if (pScore.isBust) {
        finishBlackjackRound('bust');
    } else {
        standBlackjack();
    }
}

function resolveBlackjackDealerTurn() {
    bjState.phase = 'dealer';
    renderHandCards('bj-dealer-cards', bjState.dealerHand, false);
    let dScore = calculateHandScore(bjState.dealerHand);
    const dScoreEl = document.getElementById('bj-dealer-score');
    if (dScoreEl) dScoreEl.textContent = `Součet: ${dScore.total}`;

    const pScore = calculateHandScore(bjState.playerHand);

    function dealerStep() {
        dScore = calculateHandScore(bjState.dealerHand);
        if (dScoreEl) dScoreEl.textContent = `Součet: ${dScore.total}`;
        if (dScore.total < 17) {
            if (typeof sfx !== 'undefined' && sfx.playCardFlip) sfx.playCardFlip();
            bjState.dealerHand.push(bjState.deck.pop());
            renderHandCards('bj-dealer-cards', bjState.dealerHand, false);
            setTimeout(dealerStep, 450);
        } else {
            evaluateBlackjackWinner(pScore, dScore);
        }
    }
    setTimeout(dealerStep, 400);
}

function evaluateBlackjackWinner(pScore, dScore) {
    if (pScore.isBlackjack) {
        if (dScore.isBlackjack) {
            finishBlackjackRound('push', 'Oba mají Blackjack! Sázka vrácena (Push).');
        } else {
            const payout = Math.round(bjState.bet * 2.5);
            finishBlackjackRound('blackjack', `🎉 PŘIROZENÝ BLACKJACK (3:2)! Vyhráváš ${payout} B$!`, payout);
        }
    } else if (dScore.isBust) {
        const payout = bjState.bet * 2;
        finishBlackjackRound('win', `🎉 KRUPIÉR PŘEBRAL (${dScore.total})! Vyhráváš ${payout} B$!`, payout);
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
    const dScoreEl = document.getElementById('bj-dealer-score');
    if (dScoreEl) dScoreEl.textContent = `Součet: ${dScore.total}`;

    const msgEl = document.getElementById('bj-status-msg');
    if (msgEl) {
        msgEl.textContent = msg || (result === 'win' ? 'Vyhrál jsi!' : 'Hra dokončena.');
    }

    if (result === 'win' || result === 'blackjack') {
        if (typeof sfx !== 'undefined' && sfx.playWinFanfare) sfx.playWinFanfare();
        if (typeof addBobux === 'function') addBobux(payout, 'Výhra v Blackjacku');
        if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
    } else if (result === 'push') {
        if (typeof sfx !== 'undefined' && sfx.playCoin) sfx.playCoin();
        if (typeof addBobux === 'function') addBobux(bjState.bet, 'Blackjack remíza');
        if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
    } else if (result === 'bust' || result === 'lose') {
        if (typeof sfx !== 'undefined' && sfx.playOof) sfx.playOof();
    }

    const dBtn = document.getElementById('bj-btn-deal');
    const hBtn = document.getElementById('bj-btn-hit');
    const sBtn = document.getElementById('bj-btn-stand');
    const dbBtn = document.getElementById('bj-btn-double');
    if (dBtn) dBtn.disabled = false;
    if (hBtn) hBtn.disabled = true;
    if (sBtn) sBtn.disabled = true;
    if (dbBtn) dbBtn.disabled = true;

    if (bjState.betBeforeDouble !== null) {
        bjState.bet = bjState.betBeforeDouble;
        bjState.betBeforeDouble = null;
        const betDisplay = document.getElementById('bj-current-bet');
        if (betDisplay) betDisplay.textContent = `${bjState.bet} B$`;
    }
}

function handleIncomingCasinoEvent(packet) {
    if (!packet || !packet.action) return;
    if (packet.action === 'wheel_spin') {
        startRemoteWheelSpin();
    } else if (packet.action === 'bj_sit' && packet.seatIdx >= 0) {
        if (typeof bjTableState !== 'undefined') {
            const seat = bjTableState.seats[packet.seatIdx];
            if (seat) {
                seat.occupied = true;
                seat.peerId = packet.id;
                seat.username = packet.nickname || 'Hráč';
            }
        }
    } else if (packet.action === 'bj_stand_up' && packet.seatIdx >= 0) {
        if (typeof bjTableState !== 'undefined') {
            const seat = bjTableState.seats[packet.seatIdx];
            if (seat) {
                seat.occupied = false;
                seat.peerId = null;
                seat.username = '';
            }
        }
    } else if (packet.action === 'bj_bet' && packet.seatIdx >= 0) {
        if (typeof bjTableState !== 'undefined') {
            const seat = bjTableState.seats[packet.seatIdx];
            if (seat) {
                seat.bet = packet.amount;
                if (typeof scene !== 'undefined') {
                    seat.chipMeshes.forEach(m => scene.remove(m));
                    seat.chipMeshes = [];
                    const chipsGroup = create3DChipStack(seat.bet, seat.betPos);
                    if (chipsGroup) {
                        scene.add(chipsGroup);
                        seat.chipMeshes.push(chipsGroup);
                    }
                }
            }
        }
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
 * C. DENNÍ KOLO ŠTĚSTÍ (DAILY LUCKY WHEEL) ENGINE - GTA 5 DIAMOND CASINO STYLE
 * ============================================================================ */
const WHEEL_PRIZES = [
    { label: 'VIP TAG', type: 'bobux', amount: 3500, color: '#f59e0b', icon: '👑', isJackpot: true, desc: 'VIP Status + 3 500 B$' },
    { label: '500 B$', type: 'bobux', amount: 500, color: '#10b981', icon: '💵', desc: 'Hotovost' },
    { label: '150 RP', type: 'bobux', amount: 150, color: '#3b82f6', icon: '⭐', desc: 'Reputace' },
    { label: '300 ŽETONŮ', type: 'bobux', amount: 300, color: '#06b6d4', icon: '🪙', desc: 'Žetony' },
    { label: 'TRIČKO', type: 'bobux', amount: 250, color: '#a855f7', icon: '👕', desc: 'Oblečení' },
    { label: '600 B$', type: 'bobux', amount: 600, color: '#10b981', icon: '💵', desc: 'Hotovost' },
    { label: '200 RP', type: 'bobux', amount: 200, color: '#3b82f6', icon: '⭐', desc: 'Reputace' },
    { label: '400 ŽETONŮ', type: 'bobux', amount: 400, color: '#06b6d4', icon: '🪙', desc: 'Žetony' },
    { label: 'VOLNÝ SPIN', type: 'extra', amount: 0, color: '#ec4899', icon: '🔄', desc: 'Točení zdarma' },
    { label: '700 B$', type: 'bobux', amount: 700, color: '#10b981', icon: '💵', desc: 'Hotovost' },
    { label: '250 RP', type: 'bobux', amount: 250, color: '#3b82f6', icon: '⭐', desc: 'Reputace' },
    { label: '500 ŽETONŮ', type: 'bobux', amount: 500, color: '#06b6d4', icon: '🪙', desc: 'Žetony' },
    { label: 'MIKINA', type: 'bobux', amount: 300, color: '#a855f7', icon: '👕', desc: 'Oblečení' },
    { label: '600 B$', type: 'bobux', amount: 600, color: '#10b981', icon: '💵', desc: 'Hotovost' },
    { label: '300 RP', type: 'bobux', amount: 300, color: '#3b82f6', icon: '⭐', desc: 'Reputace' },
    { label: '600 ŽETONŮ', type: 'bobux', amount: 600, color: '#06b6d4', icon: '🪙', desc: 'Žetony' },
    { label: 'MYSTERY', type: 'bobux', amount: 500, color: '#f97316', icon: '🎁', desc: 'Záhada' },
    { label: '900 B$', type: 'bobux', amount: 900, color: '#10b981', icon: '💵', desc: 'Hotovost' },
    { label: '400 RP', type: 'bobux', amount: 400, color: '#3b82f6', icon: '⭐', desc: 'Reputace' },
    { label: 'OBLEK', type: 'bobux', amount: 350, color: '#a855f7', icon: '👕', desc: 'Oblečení' }
];

const WHEEL_PAID_SPIN_PRICE = 600;
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
    const statusEls = [
        document.getElementById('wheel-daily-status'),
        document.getElementById('lucky-wheel-daily-status')
    ].filter(Boolean);
    const btnTexts = [
        document.getElementById('wheel-btn-text'),
        document.getElementById('lucky-wheel-btn-text')
    ].filter(Boolean);
    const timerEls = [
        document.getElementById('wheel-daily-timer'),
        document.getElementById('lucky-wheel-daily-timer')
    ].filter(Boolean);

    // Also update GTA 5 modal elements
    const gtaSpinBtns = [
        document.getElementById('lucky-wheel-spin-btn'),
        document.getElementById('wheel-spin-btn')
    ].filter(Boolean);
    const gtaSubtitle = document.getElementById('lucky-wheel-subtitle');
    const gtaSpinSubtext = document.getElementById('lucky-wheel-spin-subtext');

    if (isFree) {
        statusEls.forEach(el => { el.textContent = '🎁 1 VOLNÉ ZATOČENÍ PŘIPRAVENO!'; });
        btnTexts.forEach(el => { el.textContent = 'ZATOČIT ZDARMA!'; });
        timerEls.forEach(el => { el.textContent = 'Tvé denní volné zatočení je aktivní! Vytoč si až 3 500 B$ a VIP Tag zdarma.'; });
        if (gtaSubtitle) gtaSubtitle.textContent = 'Zatoč kolem štěstí a vyhraj exkluzivní VIP Status!';
        if (gtaSpinSubtext) gtaSpinSubtext.textContent = 'DENNÍ BONUS: ZDARMA';
        gtaSpinBtns.forEach(btn => {
            const sp = btn.querySelector('span:last-child') || btn.querySelector('span');
            if (sp && !isWheelSpinning) sp.textContent = 'ZATOČIT ZDARMA!';
        });
    } else {
        const last = parseInt(localStorage.getItem(STORAGE_KEY_CASINO_WHEEL) || '0', 10);
        const remMs = Math.max(0, 24 * 3600 * 1000 - (Date.now() - last));
        const remHms = typeof formatHMS === 'function' ? formatHMS(remMs) : Math.ceil(remMs / 1000) + 's';
        statusEls.forEach(el => { el.textContent = `⏳ Další volné zatočení za: ${remHms}`; });
        btnTexts.forEach(el => { el.textContent = `ZATOČIT (${WHEEL_PAID_SPIN_PRICE} B$)`; });
        timerEls.forEach(el => { el.textContent = `Denní bonus vyčerpán. Další zdarma za ${remHms}, nebo toč za ${WHEEL_PAID_SPIN_PRICE} B$. Extra zatočení stojí ${WHEEL_PAID_SPIN_PRICE} B$. Další točení stojí ${WHEEL_PAID_SPIN_PRICE} B$.`; });
        if (gtaSubtitle) gtaSubtitle.textContent = `Extra zatočení stojí ${WHEEL_PAID_SPIN_PRICE} B$. Další točení stojí ${WHEEL_PAID_SPIN_PRICE} B$.`;
        if (gtaSpinSubtext) gtaSpinSubtext.textContent = `CENA: ${WHEEL_PAID_SPIN_PRICE} B$`;
        gtaSpinBtns.forEach(btn => {
            const sp = btn.querySelector('span:last-child') || btn.querySelector('span');
            if (sp && !isWheelSpinning) sp.textContent = `ZATOČIT (${WHEEL_PAID_SPIN_PRICE} B$)`;
        });
    }
}

function renderCasinoWheel(rotation = wheelCurrentAngle) {
    const canvases = Array.from(document.querySelectorAll('#casino-wheel-canvas, #lucky-wheel-canvas')).filter(Boolean);

    if (canvases.length === 0) return;

    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = cx - 14;
        const numSlices = WHEEL_PRIZES.length;
        const sliceAngle = (Math.PI * 2) / numSlices;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Neon Outer Glow Ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();

        // 2. Wheel Disc with Slices
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

            // Slice separators
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Inner slice shading
            const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
            grad.addColorStop(0, 'rgba(0,0,0,0.35)');
            grad.addColorStop(1, 'rgba(0,0,0,0.05)');
            ctx.fillStyle = grad;
            ctx.fill();

            // Label & Icon
            ctx.save();
            ctx.rotate(start + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.85)';
            ctx.shadowBlur = 4;
            ctx.font = 'bold 13px Fredoka, Inter, sans-serif';
            ctx.fillText(`${p.icon} ${p.label}`, radius - 16, 5);
            ctx.restore();
        }

        // 3. Heavy Chrome Outer Rim
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 9;
        ctx.stroke();

        // 4. Chrome / Metallic Outer Studs & Pegs
        for (let i = 0; i < numSlices; i++) {
            const ang = i * sliceAngle;
            const px = Math.cos(ang) * (radius - 1);
            const py = Math.sin(ang) * (radius - 1);
            ctx.beginPath();
            ctx.arc(px, py, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#f8fafc';
            ctx.fill();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // 5. Authentic Diamond Casino Center Emblem
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.fillStyle = '#090d16';
        ctx.fill();
        ctx.strokeStyle = '#FFE066';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Diamond Icon & Text in Center Hub
        ctx.fillStyle = '#FFE066';
        ctx.font = 'bold 18px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💎', 0, -4);
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('DIAMOND', 0, 16);

        ctx.restore();

        // 6. Top Golden Triangular Pointer Pin
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius + 18);
        ctx.lineTo(cx - 14, cy - radius - 14);
        ctx.lineTo(cx + 14, cy - radius - 14);
        ctx.closePath();
        ctx.fillStyle = '#FFE066';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
    });
}

function openLuckyWheelModal() {
    if (document.pointerLockElement) {
        try { document.exitPointerLock(); } catch (e) {}
    }
    const modal = document.getElementById('lucky-wheel-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
    updateDailyWheelTimer();
    updateWheelAutoSpinUI();
    renderCasinoWheel(wheelCurrentAngle);
    if (typeof sfx !== 'undefined' && sfx.playCardFlip) sfx.playCardFlip();
}

function updateWheelAutoSpinUI() {
    const autoBtns = [
        document.getElementById('lucky-wheel-autospin-btn'),
        document.getElementById('wheel-autospin-toggle-btn')
    ].filter(Boolean);
    const statusBadges = [
        document.getElementById('lucky-wheel-autospin-status'),
        document.getElementById('wheel-autospin-label')
    ].filter(Boolean);
    const icons = [
        document.getElementById('wheel-autospin-icon')
    ].filter(Boolean);
    const checkboxes = Array.from(document.querySelectorAll('#wheel-auto-spin, #lucky-wheel-auto-spin'));

    checkboxes.forEach(cb => { cb.checked = wheelAutoSpin; });

    autoBtns.forEach(btn => {
        if (wheelAutoSpin) {
            btn.classList.add('bg-cyan-600', 'border-cyan-400', 'shadow-[0_0_15px_rgba(0,210,255,0.5)]');
            btn.classList.remove('bg-[#232527]');
        } else {
            btn.classList.remove('bg-cyan-600', 'border-cyan-400', 'shadow-[0_0_15px_rgba(0,210,255,0.5)]');
            btn.classList.add('bg-[#232527]');
        }
    });

    statusBadges.forEach(badge => {
        badge.textContent = wheelAutoSpin ? 'AUTOSPIN: ZAPNUTO' : 'AUTOSPIN: VYPNUTO';
        if (wheelAutoSpin) {
            badge.className = 'text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-200';
        } else {
            badge.className = 'text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-300';
        }
    });

    icons.forEach(ic => {
        if (wheelAutoSpin) {
            ic.classList.add('animate-spin');
        } else {
            ic.classList.remove('animate-spin');
        }
    });
}

function closeLuckyWheelModal() {
    const modal = document.getElementById('lucky-wheel-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if (wheelAutoSpin) {
        wheelAutoSpin = false;
        updateWheelAutoSpinUI();
    }
}

function toggleWheelAutoSpinBtn() {
    wheelAutoSpin = !wheelAutoSpin;
    updateWheelAutoSpinUI();
    if (wheelAutoSpin && !isWheelSpinning) {
        spinDailyWheel();
    }
}

function toggleWheelAutoSpin() {
    const cb = document.getElementById('wheel-auto-spin') || document.getElementById('lucky-wheel-auto-spin');
    wheelAutoSpin = !!(cb && cb.checked);
    updateWheelAutoSpinUI();
    if (wheelAutoSpin && !isWheelSpinning) {
        spinDailyWheel();
    }
}

function spinDailyWheel() {
    if (isWheelSpinning) return;
    const isFree = isDailyWheelFree();

    if (!isFree) {
        if (bobuxBalance < WHEEL_PAID_SPIN_PRICE) {
            wheelAutoSpin = false;
            const cb = document.getElementById('wheel-auto-spin');
            if (cb) cb.checked = false;
            updateWheelAutoSpinUI();
            if (typeof showHudToast === 'function') {
                showHudToast(`Nemáš ${WHEEL_PAID_SPIN_PRICE} Bobuxů na placené zatočení kola!`, 'red');
            }
            return;
        }
        if (typeof spendBobux === 'function') {
            if (!spendBobux(WHEEL_PAID_SPIN_PRICE, `Zatočení Kola Štěstí (${WHEEL_PAID_SPIN_PRICE} B$)`)) return;
        }
        if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
        if (typeof updateBobuxUI === 'function') updateBobuxUI();
    } else {
        localStorage.setItem(STORAGE_KEY_CASINO_WHEEL, String(Date.now()));
    }

    // Multiplayer: broadcast generic spin event so peers see physical 3D wheel spin locally
    if (typeof networkManager !== 'undefined' && networkManager.sendWsPacket) {
        networkManager.sendWsPacket({
            type: 'casino_event',
            action: 'wheel_spin',
            nickname: typeof myPlayerName !== 'undefined' ? myPlayerName : 'Hráč'
        });
    }

    isWheelSpinning = true;
    const spinBtns = [
        document.getElementById('wheel-spin-btn'),
        document.getElementById('lucky-wheel-spin-btn')
    ].filter(Boolean);
    spinBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-60', 'cursor-not-allowed');
    });

    const msgEls = [
        document.getElementById('wheel-status-msg'),
        document.getElementById('lucky-wheel-status-msg')
    ].filter(Boolean);
    msgEls.forEach(el => {
        el.textContent = 'Kolo štěstí se točí...';
        el.className = 'py-2.5 px-4 rounded-xl bg-cyan-950/80 border border-cyan-400 text-xs sm:text-sm font-black text-cyan-200 shadow animate-pulse flex items-center justify-center';
    });

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
            if (typeof sfx !== 'undefined' && sfx.playWheelTick) sfx.playWheelTick();
            lastTickAngle = wheelCurrentAngle;
        }

        renderCasinoWheel(wheelCurrentAngle);

        // Spin physical 3D wheel in world
        if (typeof gameSpecificData !== 'undefined' && gameSpecificData.wheelRotor) {
            gameSpecificData.wheelRotor.rotation.z = -wheelCurrentAngle;
        }

        if (t < 1) {
            requestAnimationFrame(animateWheel);
        } else {
            isWheelSpinning = false;
            spinBtns.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('opacity-60', 'cursor-not-allowed');
            });
            updateDailyWheelTimer();
            if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
            if (typeof updateBobuxUI === 'function') updateBobuxUI();

            const prize = WHEEL_PRIZES[targetIdx];
            if (prize.isJackpot) {
                triggerLuckyWheelJackpot(prize);
            } else if (prize.type === 'bobux') {
                if (prize.amount >= 1000) {
                    if (typeof sfx !== 'undefined' && sfx.playJackpot) sfx.playJackpot();
                } else {
                    if (typeof sfx !== 'undefined' && sfx.playWinFanfare) sfx.playWinFanfare();
                }
                if (typeof addBobux === 'function') addBobux(prize.amount, `Kolo Štěstí (${prize.label})`);
                if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
                if (typeof updateBobuxUI === 'function') updateBobuxUI();
                const victoryText = `🎉 GRATULACE! Vyhrál jsi ${prize.label} (${prize.amount} Bobuxů)!`;
                msgEls.forEach(el => {
                    el.textContent = victoryText;
                    el.className = 'py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-400 text-xs sm:text-sm font-black text-emerald-200 shadow animate-bounce flex items-center justify-center';
                });
                spawnLuckyWheelConfettiBurst();
            } else {
                if (typeof sfx !== 'undefined' && sfx.playWinFanfare) sfx.playWinFanfare();
                const freeText = '🎁 EXTRA VOLNÉ ZATOČENÍ! Zatoč si ještě jednou zdarma!';
                msgEls.forEach(el => {
                    el.textContent = freeText;
                    el.className = 'py-2.5 px-4 rounded-xl bg-pink-950/80 border border-pink-400 text-xs sm:text-sm font-black text-pink-200 shadow flex items-center justify-center';
                });
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

function triggerLuckyWheelJackpot(prize) {
    const winnerName = typeof myPlayerName !== 'undefined' && myPlayerName ? myPlayerName : 'Hráč';
    if (typeof sfx !== 'undefined' && sfx.playJackpot) sfx.playJackpot();
    if (typeof addBobux === 'function') addBobux(prize.amount, `JACKPOT KOLO ŠTĚSTÍ (${prize.label})`);
    if (typeof updateCasinoBobuxDisplay === 'function') updateCasinoBobuxDisplay();
    if (typeof updateBobuxUI === 'function') updateBobuxUI();

    // Grant permanent VIP Status
    if (typeof grantCurrentUserVip === 'function') {
        grantCurrentUserVip();
    }

    const msgEls = [
        document.getElementById('wheel-status-msg'),
        document.getElementById('lucky-wheel-status-msg')
    ].filter(Boolean);
    msgEls.forEach(el => {
        el.textContent = `👑 JACKPOT! Získal jsi VIP TAG a ${prize.amount.toLocaleString()} Bobuxů!`;
        el.className = 'py-2.5 px-4 rounded-xl bg-amber-950/90 border-2 border-[#FFE066] text-xs sm:text-sm font-black text-[#FFE066] shadow animate-bounce flex items-center justify-center';
    });

    // Broadcast server-wide celebration to all players in session
    if (typeof networkManager !== 'undefined') {
        if (networkManager.sendWsPacket) {
            networkManager.sendWsPacket({
                type: 'casino_event',
                action: 'jackpot_win',
                winnerName,
                prizeName: prize.label,
                amount: prize.amount
            });
        }
        if (networkManager.broadcastSocialPacket) {
            networkManager.broadcastSocialPacket('casino_jackpot_win', {
                winnerName,
                prizeName: prize.label,
                amount: prize.amount
            });
        }
        if (typeof broadcastGameAnnounce === 'function') {
            broadcastGameAnnounce();
        }
    }

    // Local celebration presentation
    showJackpotCelebrationScreen(winnerName, prize.label, prize.amount);
    spawnLuckyWheelConfettiBurst();
    if (typeof showHudToast === 'function') {
        showHudToast(`👑 VIP JACKPOT! ${winnerName} právě vyhrál VIP TAG a ${prize.amount.toLocaleString()} B$ na Kole štěstí!`, 'amber');
    }
}

function startRemoteWheelSpin() {
    if (typeof gameSpecificData === 'undefined' || !gameSpecificData.wheelRotor) return;
    const startRot = gameSpecificData.wheelRotor.rotation.z;
    const spinAmount = (Math.PI * 2 * (4 + Math.floor(Math.random() * 3))) + Math.random() * Math.PI * 2;
    const startTime = performance.now();
    const duration = 4500;

    function anim(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - t, 3);
        if (gameSpecificData && gameSpecificData.wheelRotor) {
            gameSpecificData.wheelRotor.rotation.z = startRot - spinAmount * ease;
        }
        if (t < 1) {
            requestAnimationFrame(anim);
        }
    }
    requestAnimationFrame(anim);
}

function showJackpotCelebrationScreen(winnerName, prizeName, amount = 3500) {
    const overlay = document.getElementById('jackpot-celebration-overlay');
    if (!overlay) return;
    const nameEl = document.getElementById('jackpot-winner-name') || document.getElementById('jackpot-winner-title');
    if (nameEl) nameEl.textContent = `${(winnerName || 'HRÁČ').toUpperCase()} VYHRÁL VIP JACKPOT!`;
    const prizeEl = document.getElementById('jackpot-prize-text') || document.getElementById('jackpot-winner-prize');
    if (prizeEl) prizeEl.textContent = `+${amount.toLocaleString()} B$ + 👑 VIP STATUS`;

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    if (typeof sfx !== 'undefined' && sfx.playWinFanfare) sfx.playWinFanfare();

    setTimeout(() => {
        closeJackpotCelebrationOverlay();
    }, 7000);
}

function closeJackpotCelebrationOverlay() {
    const overlay = document.getElementById('jackpot-celebration-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    }
}

function spawnLuckyWheelConfettiBurst(originPos = new THREE.Vector3(0, 5, -18)) {
    if (typeof scene === 'undefined') return;
    if (typeof gameSpecificData === 'undefined') return;

    if (!gameSpecificData.confettiParticles) {
        gameSpecificData.confettiParticles = [];
    }

    const colors = [0xfacc15, 0xef4444, 0x3b82f6, 0x10b981, 0xec4899, 0x8b5cf6, 0xffffff];
    const count = 120;

    for (let i = 0; i < count; i++) {
        const col = colors[Math.floor(Math.random() * colors.length)];
        const geo = Math.random() > 0.5
            ? new THREE.PlaneGeometry(0.22, 0.22)
            : new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const mat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat);

        const angle = Math.random() * Math.PI * 2;
        const speed = 3.0 + Math.random() * 8.0;
        mesh.position.set(
            originPos.x + (Math.random() - 0.5) * 2,
            originPos.y + (Math.random() - 0.5) * 1.5,
            originPos.z + (Math.random() - 0.5) * 2
        );

        mesh.userData.vel = new THREE.Vector3(
            Math.cos(angle) * speed,
            6.0 + Math.random() * 9.0,
            Math.sin(angle) * speed
        );
        mesh.userData.rotSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12
        );
        mesh.userData.life = 5.5;
        scene.add(mesh);
        gameSpecificData.confettiParticles.push(mesh);
    }
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
