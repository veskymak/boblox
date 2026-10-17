/* ============================================================================
 * 12. PLAYER ACTIONS, PHYSICS & AABB COLLISION RESOLUTION
 * ============================================================================ */
function triggerPrimaryAction() {
    if (!activeGameMode) return;
    const w = playerState.activeWeapon || WEAPON_DEFINITIONS.none;
    if (playerState.weaponCooldownTimer > 0 || playerState.weaponReloadTimer > 0) return;

    playerState.weaponCooldownTimer = w.cooldown || 0.28;
    playerState.attackTimer = 0.28;

    // 0. Adopt Me! Pet Care & Fly/Ride Actions (Slots 1-4)
    if (w.type === 'pet_care' && activeGameMode === 'adoptme') {
        const gd = gameSpecificData;
        if (!gd || !gd.pets || gd.pets.length === 0) return;
        const activePetEntry = gd.pets[gd.activePetIdx] || gd.pets[0];
        const petDef = ADOPT_ME_PET_CATALOG[activePetEntry.id] || ADOPT_ME_PET_CATALOG.dog;

        if (w.id === 'pet_food') {
            sfx.playCoin();
            if (!completeAdoptMeNeed('hungry')) {
                gd.bucks += 10;
                saveAdoptMeData(gd.bucks, gd.pets);
                refreshAdoptMeHUD();
                showHudToast(`🍎 Nakrmil jsi ${petDef.icon} ${petDef.name} pamlskem! (+$10 Bucks)`, 'green');
            }
            return;
        }

        if (w.id === 'pet_water') {
            sfx.playCoin();
            if (!completeAdoptMeNeed('thirsty')) {
                gd.bucks += 10;
                saveAdoptMeData(gd.bucks, gd.pets);
                refreshAdoptMeHUD();
                showHudToast(`🍼 Dal jsi napít ${petDef.icon} ${petDef.name}! (+$10 Bucks)`, 'blue');
            }
            return;
        }

        if (w.id === 'pet_ride') {
            gd.isRidingPet = !gd.isRidingPet;
            sfx.playJump();
            if (gd.isRidingPet) {
                playerState.speedMultiplier = 1.62;
                playerState.jumpMultiplier = 1.35;
                if (gd.activePetMesh) {
                    gd.activePetMesh.leftWingPivot.visible = true;
                    gd.activePetMesh.rightWingPivot.visible = true;
                }
                showHudToast(`🦄 Jedeš a létáš na ${petDef.icon} ${petDef.name}! Drž MEZERNÍK pro létání!`, 'gold');
            } else {
                playerState.speedMultiplier = 1.0;
                playerState.jumpMultiplier = 1.0;
                if (gd.activePetMesh && !petDef.hasWings) {
                    gd.activePetMesh.leftWingPivot.visible = false;
                    gd.activePetMesh.rightWingPivot.visible = false;
                }
                showHudToast(`Sesedl jsi z mazlíčka ${petDef.icon} ${petDef.name}.`, 'blue');
            }
            return;
        }

        if (w.id === 'pet_switch') {
            gd.activePetIdx = (gd.activePetIdx + 1) % gd.pets.length;
            const nextEntry = gd.pets[gd.activePetIdx];
            const nextDef = ADOPT_ME_PET_CATALOG[nextEntry.id] || ADOPT_ME_PET_CATALOG.dog;
            const stageName = ADOPT_ME_AGE_STAGES[Math.min(ADOPT_ME_AGE_STAGES.length - 1, nextEntry.ageIdx || 0)];
            sfx.playCoin();
            spawnAdoptMeActivePetMesh();
            showHudToast(`🥚 Vybrán mazlíček (${gd.activePetIdx + 1}/${gd.pets.length}): ${nextDef.icon} ${nextDef.name} [${nextDef.rarity} • ${stageName}]`, 'gold');
            return;
        }
    }

    // 1. Medkit Healing
    if (w.type === 'heal') {
        if (w.ammo <= 0) {
            showHudToast('Žádné lékárničky nezbývají!', 'red');
            return;
        }
        if (playerState.hp >= playerState.maxHp) {
            showHudToast('Máš plné zdraví (100 HP)!', 'blue');
            return;
        }
        w.ammo--;
        playerState.hp = Math.min(playerState.maxHp, playerState.hp + (w.heal || 40));
        sfx.playCoin();
        updateHealthHUD();
        renderHotbarUI();
        showHudToast(`Použit Medkit (+${w.heal} HP)!`, 'green');
        return;
    }

    // 2. Bedwars 3D Block Building
    if (w.type === 'build') {
        if (w.ammo <= 0) {
            showHudToast('Došly stavební bloky! Nasbírej železo u generátoru.', 'red');
            return;
        }
        w.ammo--;
        const forward = new THREE.Vector3(-Math.sin(camState.yaw), 0, -Math.cos(camState.yaw)).normalize();
        const bx = Math.round((playerState.pos.x + forward.x * 3.6) / 2.5) * 2.5;
        const bz = Math.round((playerState.pos.z + forward.z * 3.6) / 2.5) * 2.5;
        const by = Math.max(0.2, Math.round((playerState.pos.y - 0.5) * 2) / 2);
        createBlock(bx, by, bz, 2.5, 1.2, 2.5, 0x38bdf8, { destructible: true, playerBuilt: true });
        sfx.playJump();
        renderHotbarUI();
        return;
    }

    // 3. Hide and Seek Prop Scanner
    if (w.type === 'scanner') {
        sfx.playGunshot();
        if (activeGameMode === 'hideandseek' && gameSpecificData.hiderProps) {
            let foundAny = false;
            gameSpecificData.hiderProps.forEach(hp => {
                if (hp.found) return;
                if (hp.pos.distanceTo(playerState.pos) < (w.range || 9.0)) {
                    hp.found = true;
                    foundAny = true;
                    setCharacterWeaponMesh(hp.meshData, 'none');
                    sfx.playWinFanfare();
                    gameSpecificData.foundCount++;
                    addBobux(45, `Odhalen schovaný Hledač #${hp.id}!`);
                    showHudToast(`Odhalen schovaný Hledač (${gameSpecificData.foundCount}/${gameSpecificData.totalHiders})!`, 'green');
                }
            });
            if (!foundAny) {
                showHudToast('Scanner: V dosahu 9m není žádný schovaný hráč.', 'blue');
            }
        }
        return;
    }

    // 4. Ranged Firearm (Pistol / Shotgun)
    if (w.type === 'gun') {
        if (w.ammo <= 0) {
            reloadCurrentWeapon();
            return;
        }
        w.ammo--;
        sfx.playGunshot();
        renderHotbarUI();

        const shootDir = new THREE.Vector3(
            -Math.sin(camState.yaw) * Math.cos(camState.pitch * 0.35),
            -Math.sin(camState.pitch * 0.25),
            -Math.cos(camState.yaw) * Math.cos(camState.pitch * 0.35)
        ).normalize();

        const startPos = playerState.pos.clone().add(new THREE.Vector3(0, 2.3, 0)).addScaledVector(shootDir, 1.4);
        const tracer = new THREE.Mesh(
            new THREE.SphereGeometry(w.id === 'shotgun' ? 0.32 : 0.22, 8, 8),
            new THREE.MeshBasicMaterial({ color: w.id === 'shotgun' ? 0xf97316 : 0x38bdf8 })
        );
        tracer.position.copy(startPos);
        scene.add(tracer);
        setTimeout(() => {
            if (scene) scene.remove(tracer);
            tracer.geometry.dispose();
            tracer.material.dispose();
        }, 140);

        // Check hit against active bots / zombies / Bedwars enemies along forward cone/range
        const targets = [];
        if (activeGameMode === 'zombies' && gameSpecificData.zombies) targets.push(...gameSpecificData.zombies);
        if (activeGameMode === 'sfoth' && gameSpecificData.bots) targets.push(...gameSpecificData.bots);
        if (activeGameMode === 'bedwars' && gameSpecificData.enemies) targets.push(...gameSpecificData.enemies);

        targets.forEach(t => {
            if (!t.alive) return;
            const toTarget = t.pos.clone().sub(playerState.pos);
            const dist = toTarget.length();
            if (dist > (w.range || 35)) return;
            const horizDir = toTarget.clone().setY(0).normalize();
            const forwardFlat = new THREE.Vector3(-Math.sin(camState.yaw), 0, -Math.cos(camState.yaw)).normalize();
            const dot = horizDir.dot(forwardFlat);
            if (dot > 0.65 || dist < 4.0) {
                tracer.position.copy(t.pos).add(new THREE.Vector3(0, 2.2, 0));
                applyBotDamage(t, w.damage || 30, w.knockback || 12);
            }
        });

        if (w.ammo === 0) {
            reloadCurrentWeapon();
        }
        return;
    }

    // 5. Pickaxe Mining / Bed Destruction (Bedwars)
    if (w.type === 'tool') {
        sfx.playSwordSlash();
        if (activeGameMode === 'bedwars') {
            // Destroy Red Enemy Bed if within range
            if (gameSpecificData.redBedAlive && gameSpecificData.redBed) {
                const distBed = playerState.pos.distanceTo(gameSpecificData.redBed.mesh.position);
                if (distBed < 6.8) {
                    gameSpecificData.redBedAlive = false;
                    gameSpecificData.redBed.mesh.visible = false;
                    const idx = worldBlocks.indexOf(gameSpecificData.redBed);
                    if (idx !== -1) worldBlocks.splice(idx, 1);
                    sfx.playExplosion();
                    addBobux(120, 'Zničena ČERVENÁ POSTEL v Bedwars!');
                    showHudToast('ZNIČIL JSI ČERVENOU POSTEL! Nyní doraz obránce!', 'gold');
                    return;
                }
            }
            // Destroy nearby destructible defensive blocks
            for (let i = worldBlocks.length - 1; i >= 0; i--) {
                const b = worldBlocks[i];
                if (b.destructible && b.mesh.position.distanceTo(playerState.pos) < 6.0) {
                    scene.remove(b.mesh);
                    worldBlocks.splice(i, 1);
                    sfx.playSwordHit();
                    break;
                }
            }
        }
    }

    // 6. Melee Attack (Sword / Axe / Tool / Hand) against AI Bots, Zombies, or Bedwars Enemies
    sfx.playSwordSlash();
    const attackRange = w.range || 5.4;
    const dmg = w.damage || 35;
    const kb = w.knockback || 22;

    const meleeTargets = [];
    if (activeGameMode === 'sfoth' && gameSpecificData.bots) meleeTargets.push(...gameSpecificData.bots);
    if (activeGameMode === 'zombies' && gameSpecificData.zombies) meleeTargets.push(...gameSpecificData.zombies);
    if (activeGameMode === 'bedwars' && gameSpecificData.enemies) meleeTargets.push(...gameSpecificData.enemies);

    meleeTargets.forEach(bot => {
        if (!bot.alive) return;
        const dist = bot.pos.distanceTo(playerState.pos);
        if (dist < attackRange) {
            applyBotDamage(bot, dmg, kb);
        }
    });
}

function applyBotDamage(bot, dmg, knockbackPower) {
    if (!bot || !bot.alive) return;
    sfx.playSwordHit();
    bot.hp -= dmg;
    _aiVec1.subVectors(bot.pos, playerState.pos).setY(0).normalize();
    bot.knockback.addScaledVector(_aiVec1, knockbackPower);
    bot.vel.y = 8.5;

    triggerScreenShake(0.22, 0.14);
    spawnJuiceParticles(bot.pos.x, bot.pos.y + 1.8, bot.pos.z, 0xf97316, 10, 8.5, 1.1);

    if (bot.hpFill) {
        const hpRatio = Math.max(0.01, bot.hp / bot.maxHp);
        bot.hpFill.scale.x = hpRatio;
    }

    if (bot.hp <= 0) {
        spawnJuiceParticles(bot.pos.x, bot.pos.y + 1.5, bot.pos.z, 0xef4444, 18, 11.0, 1.35);
        if (activeGameMode === 'sfoth') {
            eliminateBot(bot);
        } else if (activeGameMode === 'zombies') {
            eliminateZombie(bot);
        } else if (activeGameMode === 'bedwars') {
            eliminateBedwarsEnemy(bot);
        }
    }
}

function eliminateBot(bot) {
    if (!bot.alive) return;
    bot.alive = false;
    bot.meshData.root.visible = false;
    sfx.playOof();
    gameSpecificData.kills++;
    document.getElementById('hud-extra-value').textContent = String(gameSpecificData.kills);
    addBobux(35, `Poražen ${bot.name}`);

    const remaining = gameSpecificData.bots.filter(b => b.alive).length;
    if (remaining === 0) {
        addBobux(100, 'Vyčištěna celá SFOTH vlna!');
        setTimeout(() => {
            if (activeGameMode === 'sfoth') {
                gameSpecificData.bots = [];
                spawnSFOTHWave();
            }
        }, 1500);
    }
}

function eliminateZombie(z) {
    if (!z.alive) return;
    z.alive = false;
    z.meshData.root.visible = false;
    sfx.playOof();
    gameSpecificData.score += z.points || 35;
    addBobux(20, `Zneškodněn ${z.name}`);
    document.getElementById('hud-extra-value').textContent = `Vlna ${gameSpecificData.wave} • ${gameSpecificData.score} bodů`;

    const remaining = gameSpecificData.zombies.filter(b => b.alive).length;
    if (remaining === 0) {
        gameSpecificData.wave++;
        addBobux(90, `Přežita Zombie Vlna ${gameSpecificData.wave - 1}!`);
        sfx.playWinFanfare();
        showHudToast(`VLNA ${gameSpecificData.wave} PŘICHÁZÍ!`, 'gold');
        setTimeout(() => {
            if (activeGameMode === 'zombies') {
                gameSpecificData.zombies = [];
                spawnZombieWave(gameSpecificData.wave);
            }
        }, 1600);
    }
}

function eliminateBedwarsEnemy(enemy) {
    if (!enemy.alive) return;
    enemy.alive = false;
    enemy.meshData.root.visible = false;
    sfx.playOof();
    addBobux(40, `Poražen ${enemy.name}`);

    if (gameSpecificData.redBedAlive) {
        showHudToast(`${enemy.name} se respawnuje za 4s (Červená postel stále stojí)!`, 'blue');
        setTimeout(() => {
            if (activeGameMode === 'bedwars' && gameSpecificData.redBedAlive) {
                enemy.hp = enemy.maxHp;
                if (enemy.hpFill) enemy.hpFill.scale.x = 1;
                enemy.pos.copy(enemy.homePos);
                enemy.vel.set(0, 0, 0);
                enemy.knockback.set(0, 0, 0);
                enemy.meshData.root.position.copy(enemy.pos);
                enemy.meshData.root.visible = true;
                enemy.alive = true;
            }
        }, 4000);
    } else {
        const aliveEnemies = gameSpecificData.enemies.filter(e => e.alive).length;
        if (aliveEnemies === 0) {
            sfx.playWinFanfare();
            addBobux(200, 'VÍTĚZSTVÍ V BEDWARS: ISLAND BATTLE!');
            showHudToast('VÍTĚZSTVÍ! Červený tým byl kompletně vyřazen!', 'gold');
            setTimeout(() => {
                if (activeGameMode === 'bedwars') setupGame10Bedwars();
            }, 3500);
        }
    }
}

// Pre-allocated Scratch Objects for Zero-GC Game Loop & Collisions
const _playerBox = new THREE.Box3();
const _forwardVec = new THREE.Vector3();
const _rightVec = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _smoothLookTarget = new THREE.Vector3();
let _camTargetInitialized = false;
const _aiVec1 = new THREE.Vector3();
const _aiVec2 = new THREE.Vector3();
const _originCenter = new THREE.Vector3(0, 1, 0);
let _cachedFpsEl = null;
let _cachedExtraEl = null;

// Screen Shake & Object-Pooled 3D Juice Particles (Zero-GC)
let _shakeTimer = 0;
let _shakeDuration = 0.2;
let _shakeIntensity = 0;
let _juiceParticlePool = [];

function triggerScreenShake(intensity = 0.35, duration = 0.22) {
    _shakeIntensity = Math.max(_shakeIntensity, intensity);
    _shakeDuration = Math.max(0.05, duration);
    _shakeTimer = Math.max(_shakeTimer, duration);
}

function spawnJuiceParticles(x, y, z, colorHex = 0xffffff, count = 8, speed = 6.5, scale = 1.0) {
    if (!scene) return;
    let spawned = 0;
    const geo = getCachedBoxGeometry(0.26, 0.26, 0.26);
    for (let i = 0; i < 64 && spawned < count; i++) {
        let p = _juiceParticlePool[i];
        if (!p) {
            const mat = new THREE.MeshBasicMaterial({ color: colorHex });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.visible = false;
            scene.add(mesh);
            p = { mesh, vel: new THREE.Vector3(), life: 0, maxLife: 0.45, active: false, baseScale: 1 };
            _juiceParticlePool[i] = p;
        }
        if (!p.active) {
            if (!p.mesh.parent) scene.add(p.mesh);
            p.active = true;
            p.maxLife = 0.32 + Math.random() * 0.25;
            p.life = p.maxLife;
            p.baseScale = scale * (0.7 + Math.random() * 0.6);
            p.mesh.material.color.setHex(colorHex);
            p.mesh.position.set(
                x + (Math.random() - 0.5) * 0.6,
                y + (Math.random() - 0.5) * 0.4,
                z + (Math.random() - 0.5) * 0.6
            );
            p.mesh.scale.setScalar(p.baseScale);
            const angle = Math.random() * Math.PI * 2;
            const horizSpd = (0.3 + Math.random() * 0.7) * speed;
            p.vel.set(
                Math.cos(angle) * horizSpd,
                (0.4 + Math.random() * 0.8) * speed,
                Math.sin(angle) * horizSpd
            );
            p.mesh.visible = true;
            spawned++;
        }
    }
}

function updateJuiceParticles(dt) {
    for (let i = 0; i < _juiceParticlePool.length; i++) {
        const p = _juiceParticlePool[i];
        if (!p || !p.active) continue;
        p.life -= dt;
        if (p.life <= 0) {
            p.active = false;
            p.mesh.visible = false;
            continue;
        }
        p.vel.y -= 18.0 * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += 6.0 * dt;
        p.mesh.rotation.y += 5.0 * dt;
        const s = Math.max(0.05, (p.life / p.maxLife) * p.baseScale);
        p.mesh.scale.setScalar(s);
    }
}

function getExtraHudEl() {
    if (!_cachedExtraEl) _cachedExtraEl = document.getElementById('hud-extra-value');
    return _cachedExtraEl;
}

function lerpAngle(current, target, t) {
    let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return current + diff * Math.min(1, t);
}

function updateBlockBoxFast(b) {
    const pos = b.mesh.position;
    const hx = b.size.x * 0.5;
    const hy = b.size.y * 0.5;
    const hz = b.size.z * 0.5;
    b.box.min.set(pos.x - hx, pos.y - hy, pos.z - hz);
    b.box.max.set(pos.x + hx, pos.y + hy, pos.z + hz);
}

function resolvePlayerCollisions(dt) {
    const p = playerState.pos;
    const r = playerState.radius;
    const h = playerState.height;

    playerState.onGround = false;
    playerState.onLadder = false;
    let currentPlat = null;

    _playerBox.min.set(p.x - r, p.y, p.z - r);
    _playerBox.max.set(p.x + r, p.y + h, p.z + r);

    for (let i = 0; i < worldBlocks.length; i++) {
        const b = worldBlocks[i];
        if (b.flyingDebris) continue;

        if (!_playerBox.intersectsBox(b.box)) continue;

        // Instant Kill Brick
        if (b.isKill) {
            damagePlayer(999, 'Dotyk smrtícího bloku!');
            return;
        }

        // Climbable Ladder
        if (b.isLadder) {
            playerState.onLadder = true;
        }

        // Speed Boost Pad (Speed Run)
        if (b.isBoost) {
            playerState.knockback.z = -26;
            if (!b.boostSoundCooldown) {
                b.boostSoundCooldown = true;
                sfx.playCoin();
                setTimeout(() => { b.boostSoundCooldown = false; }, 450);
            }
        }

        // Checkpoint Pad (Obby or Speed Run)
        if (b.isCheckpoint && (activeGameMode === 'obby' || activeGameMode === 'speedrun')) {
            if (b.checkpointIdx > gameSpecificData.currentCheckpoint) {
                gameSpecificData.currentCheckpoint = b.checkpointIdx;
                playerState.spawnPoint.set(b.mesh.position.x, b.box.max.y + 0.5, b.mesh.position.z);
                b.mesh.material.color.setHex(0x00e08e);
                b.mesh.material.emissive.setHex(0x059669);
                if (activeGameMode === 'obby') {
                    const extraEl = getExtraHudEl();
                    if (extraEl) extraEl.textContent = `${b.checkpointIdx} / 4`;
                }
                addBobux(20, `Checkpoint ${b.checkpointIdx}`);
            }
        }

        // Finish Pad (Obby, Lava Tower, Tower of Hell, Speed Run)
        if (b.isFinish) {
            if (!gameSpecificData.wonCooldown) {
                gameSpecificData.wonCooldown = true;
                sfx.playWinFanfare();
                if (activeGameMode === 'obby') {
                    spawnObbyConfetti(b.mesh.position);
                    addBobux(100, 'Vítězství v Classic Mega Obby!');
                    playerState.spawnPoint.set(0, 3, 0);
                    gameSpecificData.currentCheckpoint = 1;
                    const extraEl = getExtraHudEl();
                    if (extraEl) extraEl.textContent = 'VÍTĚZ! (1/4)';
                } else if (activeGameMode === 'lava') {
                    addBobux(120, 'Únik před lávou dokončen!');
                    gameSpecificData.lavaHeight = -1.0;
                } else if (activeGameMode === 'toh') {
                    addBobux(180, 'Pokořen TOWER OF HELL (60m)!');
                    showHudToast('POKOŘIL JSI TOWER OF HELL!', 'gold');
                } else if (activeGameMode === 'speedrun') {
                    const finalTime = (gameSpecificData.runTime || 0).toFixed(2);
                    addBobux(140, `Speed Run dokončen za ${finalTime}s!`);
                    showHudToast(`NOVÝ ČAS SPEED RUNU: ${finalTime}s!`, 'gold');
                    gameSpecificData.runTime = 0;
                    gameSpecificData.currentCheckpoint = 1;
                    playerState.spawnPoint.set(0, 3, 0);
                }
                setTimeout(() => {
                    if (gameSpecificData) gameSpecificData.wonCooldown = false;
                    respawnPlayer();
                }, 3000);
            }
        }

        // Compute overlap along X, Y, Z axes
        const overlapX1 = b.box.max.x - (p.x - r);
        const overlapX2 = (p.x + r) - b.box.min.x;
        const overlapX = overlapX1 < overlapX2 ? overlapX1 : -overlapX2;

        const overlapY1 = b.box.max.y - p.y;
        const overlapY2 = (p.y + h) - b.box.min.y;
        const overlapY = overlapY1 < overlapY2 ? overlapY1 : -overlapY2;

        const overlapZ1 = b.box.max.z - (p.z - r);
        const overlapZ2 = (p.z + r) - b.box.min.z;
        const overlapZ = overlapZ1 < overlapZ2 ? overlapZ1 : -overlapZ2;

        const absX = Math.abs(overlapX);
        const absY = Math.abs(overlapY);
        const absZ = Math.abs(overlapZ);

        if (absY <= absX && absY <= absZ) {
            if (overlapY > 0 && playerState.vel.y <= 0.5) {
                p.y += overlapY;
                playerState.vel.y = 0;
                playerState.onGround = true;
                currentPlat = b;
            } else if (overlapY < 0 && playerState.vel.y > 0) {
                p.y += overlapY;
                playerState.vel.y = 0;
            }
        } else {
            // Horizontal Collision: Check for Auto-Step / Step-Up onto small ledges (SFOTH bridges, raised slabs <= 0.75m)
            const stepUp = b.box.max.y - p.y;
            if (!b.isLadder && stepUp > 0.001 && stepUp <= 0.75 && playerState.vel.y <= 0.5 && playerState.vel.y >= -5.0) {
                const targetY = b.box.max.y;
                let canStep = true;
                for (let j = 0; j < worldBlocks.length; j++) {
                    const ob = worldBlocks[j];
                    if (ob === b || ob.flyingDebris || ob.isKill) continue;
                    if (p.x + r > ob.box.min.x && p.x - r < ob.box.max.x &&
                        p.z + r > ob.box.min.z && p.z - r < ob.box.max.z &&
                        targetY + h > ob.box.min.y && targetY < ob.box.max.y) {
                        canStep = false;
                        break;
                    }
                }
                if (canStep) {
                    p.y = targetY;
                    playerState.vel.y = 0;
                    playerState.onGround = true;
                    currentPlat = b;
                } else if (absX < absZ) {
                    p.x += overlapX;
                } else {
                    p.z += overlapZ;
                }
            } else if (absX < absZ) {
                p.x += overlapX;
            } else {
                p.z += overlapZ;
            }
        }

        _playerBox.min.set(p.x - r, p.y, p.z - r);
        _playerBox.max.set(p.x + r, p.y + h, p.z + r);
    }

    playerState.standingPlatform = currentPlat;
}

/* ============================================================================
 * 13. MAIN GAME LOOP & PER-GAME MECHANICS TICK
 * ============================================================================ */
let lastTickTime = performance.now();

// Roblox Mobile Touch State (Joystick + Camera Look + Jump)
const touchState = {
    joyTouchId: null,
    joyOriginX: 0,
    joyOriginY: 0,
    joyX: 0, // -1 (left) to +1 (right)
    joyY: 0, // -1 (up/forward) to +1 (down/backward)
    lookTouchId: null,
    lookLastX: 0,
    lookLastY: 0,
    jumpPressed: false
};

function gameLoop(now) {
    if (!activeGameMode) return;
    animationFrameId = requestAnimationFrame(gameLoop);

    const dt = Math.min(0.05, (now - lastTickTime) / 1000);
    lastTickTime = now;
    const elapsedSec = now * 0.001;

    // Update FPS Counter
    fpsFrames++;
    if (now - fpsLastTime >= 500) {
        const fps = Math.round((fpsFrames * 1000) / (now - fpsLastTime));
        if (!_cachedFpsEl) _cachedFpsEl = document.getElementById('hud-fps');
        if (_cachedFpsEl) _cachedFpsEl.textContent = `${Math.min(60, fps)} FPS`;
        fpsFrames = 0;
        fpsLastTime = now;
    }

    if (playerState.invulnTimer > 0) playerState.invulnTimer -= dt;
    if (playerState.weaponCooldownTimer > 0) playerState.weaponCooldownTimer = Math.max(0, playerState.weaponCooldownTimer - dt);

    // Coyote Time Timer (150ms generous jump window after walking off a ledge)
    if (playerState.onGround) {
        playerState.coyoteTimer = 0.15;
    } else if (playerState.coyoteTimer > 0) {
        playerState.coyoteTimer = Math.max(0, playerState.coyoteTimer - dt);
    }
    if (playerState.weaponReloadTimer > 0) {
        playerState.weaponReloadTimer -= dt;
        if (playerState.weaponReloadTimer <= 0) {
            playerState.weaponReloadTimer = 0;
            if (playerState.activeWeapon && playerState.activeWeapon.type === 'gun') {
                playerState.activeWeapon.ammo = playerState.activeWeapon.magSize;
                sfx.playCoin();
            }
            renderHotbarUI();
        }
    }

    // 1. Update ONLY Moving Platforms & Carry Player
    for (let i = 0; i < movingBlocks.length; i++) {
        const b = movingBlocks[i];
        b.prevPos.copy(b.mesh.position);
        b.movingFn(elapsedSec, b);
        updateBlockBoxFast(b);
        if (playerState.standingPlatform === b) {
            playerState.pos.x += b.mesh.position.x - b.prevPos.x;
            playerState.pos.y += b.mesh.position.y - b.prevPos.y;
            playerState.pos.z += b.mesh.position.z - b.prevPos.z;
        }
    }

    // 2. Player Movement Input relative to Camera Yaw (Zero-GC Scratch Vectors)
    let moveForward = 0;
    let moveRight = 0;
    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) moveForward += 1;
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) moveForward -= 1;
    if (keysPressed['KeyD'] || keysPressed['ArrowRight']) moveRight += 1;
    if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) moveRight -= 1;

    // Combine analog joystick vector (-joyY is forward, +joyX is right)
    if (Math.abs(touchState.joyX) > 0.04 || Math.abs(touchState.joyY) > 0.04) {
        moveForward += -touchState.joyY;
        moveRight += touchState.joyX;
    }

    _forwardVec.set(-Math.sin(camState.yaw), 0, -Math.cos(camState.yaw));
    _rightVec.set(Math.cos(camState.yaw), 0, -Math.sin(camState.yaw));

    _moveDir.set(0, 0, 0)
        .addScaledVector(_forwardVec, moveForward)
        .addScaledVector(_rightVec, moveRight);

    const inputMag = Math.min(1.0, _moveDir.length());
    const baseSpeed = 12.5 * playerState.speedMultiplier;
    if (inputMag > 0.03) {
        _moveDir.normalize();
        playerState.vel.x = _moveDir.x * baseSpeed * inputMag;
        playerState.vel.z = _moveDir.z * baseSpeed * inputMag;

        // Smoothly interpolate avatar rotation toward movement direction
        const targetAngle = Math.atan2(-_moveDir.x, -_moveDir.z);
        playerAvatar.root.rotation.y = lerpAngle(playerAvatar.root.rotation.y, targetAngle, dt * 16);
    } else {
        // Roblox-style instant stop (zero glide / zero inertia upon releasing controls)
        playerState.vel.x = 0;
        playerState.vel.z = 0;
    }

    // Conveyor belt push on player if standing on conveyor
    if (playerState.standingPlatform && playerState.standingPlatform.isConveyor) {
        playerState.pos.addScaledVector(playerState.standingPlatform.conveyorVel, dt);
    }

    // Apply Knockback Decay
    playerState.pos.addScaledVector(playerState.knockback, dt);
    playerState.knockback.multiplyScalar(Math.pow(0.08, dt));

    // Jump & Ladder Climbing (Keyboard Space or Mobile Touch Jump Button)
    const wasOnGround = playerState.onGround;
    const prevVelY = playerState.vel.y;
    const wantJump = keysPressed['Space'] || touchState.jumpPressed;
    if (activeGameMode === 'adoptme' && gameSpecificData && gameSpecificData.isRidingPet && wantJump) {
        playerState.vel.y = 11.5;
        playerState.onGround = false;
        playerState.coyoteTimer = 0;
    } else if (playerState.onLadder) {
        playerState.vel.y = (wantJump || Math.abs(moveForward) > 0.1) ? 10.5 : 2.0;
    } else {
        const canJump = playerState.onGround || (playerState.coyoteTimer > 0 && playerState.vel.y <= 0.5);
        if (wantJump && canJump) {
            playerState.vel.y = 16.5 * playerState.jumpMultiplier;
            playerState.onGround = false;
            playerState.coyoteTimer = 0;
            sfx.playJump();
            spawnJuiceParticles(playerState.pos.x, playerState.pos.y + 0.15, playerState.pos.z, 0xe2e8f0, 6, 4.5, 0.85);
        }
        // Gravity
        playerState.vel.y -= 38.0 * dt;
    }

    // Integrate Player Position & Resolve AABB Collisions
    playerState.pos.x += playerState.vel.x * dt;
    playerState.pos.y += playerState.vel.y * dt;
    playerState.pos.z += playerState.vel.z * dt;

    resolvePlayerCollisions(dt);

    // Spawn landing dust puff when landing from a jump/fall
    if (!wasOnGround && playerState.onGround && prevVelY < -14.0) {
        spawnJuiceParticles(playerState.pos.x, playerState.pos.y + 0.1, playerState.pos.z, 0xcbd5e1, 7, 5.2, 0.9);
    }

    // Update Object-Pooled 3D Juice Particles
    updateJuiceParticles(dt);

    // Check Fall into Void
    if (playerState.pos.y < -22) {
        damagePlayer(999, 'Pád do prázdnoty!');
    }

    // 3. Animate Player Limbs (Walking, Jumping, Weapon Swing)
    playerAvatar.root.position.copy(playerState.pos);
    if (activeGameMode === 'adoptme' && gameSpecificData && gameSpecificData.isRidingPet) {
        playerAvatar.root.position.y += 0.72; // Sit elevated on pet's back
    }
    const horizSpeed = Math.hypot(playerState.vel.x, playerState.vel.z);

    if (!playerState.onGround) {
        playerAvatar.leftLegPivot.rotation.x = -0.35;
        playerAvatar.rightLegPivot.rotation.x = 0.35;
        playerAvatar.leftArmPivot.rotation.x = 2.6;
    } else if (horizSpeed > 0.8) {
        playerState.walkCycle += dt * horizSpeed * 0.95;
        const swing = Math.sin(playerState.walkCycle) * 0.75;
        playerAvatar.leftLegPivot.rotation.x = swing;
        playerAvatar.rightLegPivot.rotation.x = -swing;
        playerAvatar.leftArmPivot.rotation.x = -swing * 0.8;
    } else {
        playerAvatar.leftLegPivot.rotation.x = 0;
        playerAvatar.rightLegPivot.rotation.x = 0;
        playerAvatar.leftArmPivot.rotation.x = 0;
    }

    const holdingGun = playerState.activeWeapon && playerState.activeWeapon.type === 'gun';
    if (playerState.attackTimer > 0) {
        playerState.attackTimer -= dt;
        playerAvatar.rightArmPivot.rotation.x = 1.9 + Math.sin(playerState.attackTimer * 25) * 0.9;
    } else if (holdingGun) {
        playerAvatar.rightArmPivot.rotation.x = 1.45;
    } else if (!playerState.onGround) {
        playerAvatar.rightArmPivot.rotation.x = 2.6;
    } else if (horizSpeed > 0.8) {
        playerAvatar.rightArmPivot.rotation.x = Math.sin(playerState.walkCycle) * 0.75;
    } else {
        playerAvatar.rightArmPivot.rotation.x = 0;
    }

    // 4. Run Game-Specific Frame Logic (All 11 Games)
    if (activeGameMode === 'adoptme') updateGame11AdoptMe(dt, elapsedSec);
    else if (activeGameMode === 'obby') updateGame1Obby(dt);
    else if (activeGameMode === 'lava') updateGame2Lava(dt, elapsedSec);
    else if (activeGameMode === 'sfoth') updateGame3SFOTH(dt);
    else if (activeGameMode === 'tycoon') updateGame4Tycoon(dt, elapsedSec);
    else if (activeGameMode === 'disasters') updateGame5Disasters(dt, elapsedSec);
    else if (activeGameMode === 'toh') updateGame6TowerOfHell(dt, elapsedSec);
    else if (activeGameMode === 'zombies') updateGame7Zombies(dt, elapsedSec);
    else if (activeGameMode === 'speedrun') updateGame8SpeedRun(dt);
    else if (activeGameMode === 'hideandseek') updateGame9HideAndSeek(dt);
    else if (activeGameMode === 'bedwars') updateGame10Bedwars(dt, elapsedSec);

    // 4B. P2P Multiplayer Network Sync & Remote Friends Rendering
    broadcastLocalPlayerState(dt);
    updateRemotePlayersInScene(dt);

    // 5. Third-Person Orbital Camera Follow with Smooth Lerp & Screen Shake
    _lookTarget.set(playerState.pos.x, playerState.pos.y + 2.6, playerState.pos.z);
    if (!_camTargetInitialized || _smoothLookTarget.distanceToSquared(_lookTarget) > 100) {
        _smoothLookTarget.copy(_lookTarget);
        _camTargetInitialized = true;
    } else {
        _smoothLookTarget.lerp(_lookTarget, Math.min(1, dt * 20));
    }

    let shakeX = 0, shakeY = 0;
    if (_shakeTimer > 0) {
        _shakeTimer = Math.max(0, _shakeTimer - dt);
        const mag = (_shakeTimer / _shakeDuration) * _shakeIntensity;
        shakeX = (Math.random() - 0.5) * 2 * mag;
        shakeY = (Math.random() - 0.5) * 2 * mag;
    }

    const cosPitch = Math.cos(camState.pitch);
    const camX = _smoothLookTarget.x + Math.sin(camState.yaw) * cosPitch * camState.distance + shakeX;
    const camY = _smoothLookTarget.y + Math.sin(camState.pitch) * camState.distance + shakeY;
    const camZ = _smoothLookTarget.z + Math.cos(camState.yaw) * cosPitch * camState.distance;

    camera.position.set(camX, Math.max(playerState.pos.y - 1, camY), camZ);
    camera.lookAt(_smoothLookTarget);

    renderer.render(scene, camera);
}

function updateGame1Obby(dt) {
    if (!gameSpecificData.confettiParticles) return;
    for (let i = gameSpecificData.confettiParticles.length - 1; i >= 0; i--) {
        const p = gameSpecificData.confettiParticles[i];
        p.life -= dt;
        p.vel.y -= 12 * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += 5 * dt;
        p.mesh.rotation.y += 4 * dt;
        if (p.life <= 0) {
            scene.remove(p.mesh);
            gameSpecificData.confettiParticles.splice(i, 1);
        }
    }
}

function updateGame2Lava(dt, elapsedSec) {
    const gd = gameSpecificData;
    if (!gd || !gd.lavaMesh) return;

    if (gd.heliRotor) gd.heliRotor.rotation.y += 14 * dt;

    // Rise Lava
    gd.lavaHeight += gd.lavaSpeed * dt;
    if (gd.lavaHeight > 46.5) {
        gd.lavaHeight = -1.0; // Cycle lava after peak
    }
    gd.lavaMesh.position.y = gd.lavaHeight - 10;

    const heightMeters = Math.max(0, Math.round(playerState.pos.y));
    const extraEl = getExtraHudEl();
    if (extraEl) extraEl.textContent = `${heightMeters}m / 48m`;

    // Check Lava Contact
    if (playerState.pos.y < gd.lavaHeight + 0.3) {
        playerState.vel.y = 14;
        damagePlayer(28, 'Sežehnut stoupající lávou!');
    }

    // Collectible Speed & Gravity Coils
    gd.coils.forEach(c => {
        if (c.collected) return;
        c.mesh.rotation.y += 2.5 * dt;
        if (c.mesh.position.distanceTo(playerState.pos) < 2.4) {
            c.collected = true;
            c.mesh.visible = false;
            sfx.playCoin();
            if (c.type === 'speed') {
                gd.permSpeedMult = 1.45;
                equipWeaponSlot(1, true);
                showHudToast('Sebrán SPEED COIL! (+45% Rychlost běhu)', 'red');
            } else {
                gd.permJumpMult = 1.45;
                equipWeaponSlot(2, true);
                showHudToast('Sebrán GRAVITY COIL! (+45% Výška skoku)', 'blue');
            }
        }
    });
}

function updateGame3SFOTH(dt) {
    const gd = gameSpecificData;
    if (!gd || !gd.bots) return;

    for (let i = 0; i < gd.bots.length; i++) {
        const bot = gd.bots[i];
        if (!bot.alive) continue;

        // AI Movement toward player using zero-GC scratch vectors
        const dist = _aiVec1.subVectors(playerState.pos, bot.pos).length();

        let targetPoint = playerState.pos;
        if ((Math.abs(bot.pos.x) > 13 || Math.abs(bot.pos.z) > 13) && dist > 12) {
            targetPoint = _originCenter;
        }

        _aiVec2.subVectors(targetPoint, bot.pos).setY(0);
        if (_aiVec2.length() > 1.8) {
            _aiVec2.normalize();
            bot.pos.addScaledVector(_aiVec2, 7.2 * dt);
            bot.meshData.root.rotation.y = lerpAngle(bot.meshData.root.rotation.y, Math.atan2(-_aiVec2.x, -_aiVec2.z), dt * 12);

            bot.walkPhase += dt * 7;
            const sw = Math.sin(bot.walkPhase) * 0.65;
            bot.meshData.leftLegPivot.rotation.x = sw;
            bot.meshData.rightLegPivot.rotation.x = -sw;
        }

        // Apply Knockback & Gravity on Bot
        bot.pos.addScaledVector(bot.knockback, dt);
        bot.knockback.multiplyScalar(Math.pow(0.08, dt));

        // Simple ground check for SFOTH islands
        const onCenter = Math.abs(bot.pos.x) <= 13.5 && Math.abs(bot.pos.z) <= 13.5;
        const onNorthSouthBridge = Math.abs(bot.pos.x) <= 2.1 && Math.abs(bot.pos.z) <= 32;
        const onEastWestBridge = Math.abs(bot.pos.z) <= 2.1 && Math.abs(bot.pos.x) <= 32;
        const onOuterIsland = (Math.abs(bot.pos.x) <= 6.2 && Math.abs(Math.abs(bot.pos.z) - 26) <= 6.2) ||
                              (Math.abs(bot.pos.z) <= 6.2 && Math.abs(Math.abs(bot.pos.x) - 26) <= 6.2);

        if ((onCenter || onNorthSouthBridge || onEastWestBridge || onOuterIsland) && bot.pos.y <= 1.2) {
            bot.pos.y = 1.0;
            bot.vel.y = Math.max(0, bot.vel.y);
        } else {
            bot.vel.y -= 34 * dt;
        }
        bot.pos.y += bot.vel.y * dt;
        bot.meshData.root.position.copy(bot.pos);

        // Bot attacks player when close
        if (bot.attackCooldown > 0) bot.attackCooldown -= dt;
        if (dist < 3.6 && bot.attackCooldown <= 0) {
            bot.attackCooldown = 1.15;
            bot.meshData.rightArmPivot.rotation.x = 2.1;
            sfx.playSwordSlash();
            _aiVec1.subVectors(playerState.pos, bot.pos).setY(0).normalize();
            playerState.knockback.addScaledVector(_aiVec1, 15);
            playerState.vel.y = 7.5;
            damagePlayer(15, `Zasažen mečem (${bot.name})!`);
        } else {
            bot.meshData.rightArmPivot.rotation.x *= 0.85;
        }

        // Bot falls off arena into void
        if (bot.pos.y < -18) {
            eliminateBot(bot);
        }
    }
}

function updateGame4Tycoon(dt, elapsedSec) {
    const gd = gameSpecificData;
    if (!gd) return;

    // Dropper #1 spawns silver ore ($15) every 1.3s
    gd.dropTimer1 += dt;
    if (gd.dropTimer1 >= 1.3) {
        gd.dropTimer1 = 0;
        const oreMesh = new THREE.Mesh(
            getCachedBoxGeometry(0.75, 0.75, 0.75),
            getCachedBlockMaterial(0xe2e8f0, 1, 1, { noStuds: true, metalness: 0.7, roughness: 0.2 })
        );
        oreMesh.position.set(-9.0, 3.2, -8 + (Math.random() - 0.5) * 0.5);
        scene.add(oreMesh);
        gd.ores.push({ mesh: oreMesh, value: 15 });
    }

    // Dropper #2 spawns gold ore ($30) every 1.1s
    if (gd.hasDropper2) {
        gd.dropTimer2 += dt;
        if (gd.dropTimer2 >= 1.1) {
            gd.dropTimer2 = 0;
            const oreMesh = new THREE.Mesh(
                getCachedBoxGeometry(0.85, 0.85, 0.85),
                getCachedBlockMaterial(0xfacc15, 1, 1, { noStuds: true, metalness: 0.8, roughness: 0.15, emissive: 0xb45309, emissiveIntensity: 0.3 })
            );
            oreMesh.position.set(-5.5, 3.2, -8);
            scene.add(oreMesh);
            gd.ores.push({ mesh: oreMesh, value: 30 });
        }
    }

    // Move ores along conveyor into collector furnace at X = -1.2
    for (let i = gd.ores.length - 1; i >= 0; i--) {
        const o = gd.ores[i];
        if (o.mesh.position.y > 1.7) {
            o.mesh.position.y -= 9.5 * dt;
        } else {
            o.mesh.position.x += 4.5 * dt;
            o.mesh.rotation.z -= 3 * dt;
        }
        if (o.mesh.position.x >= -1.2) {
            gd.unclaimedCash += o.value;
            scene.remove(o.mesh);
            gd.ores.splice(i, 1);
        }
    }

    // Step on Green Claim Pad to collect accumulated cash
    if (playerState.pos.distanceTo(gd.claimPad.mesh.position) < 2.8 && gd.unclaimedCash > 0) {
        gd.cash += gd.unclaimedCash;
        showHudToast(`Vybráno +$${gd.unclaimedCash} ze sběrného koše!`, 'green');
        gd.unclaimedCash = 0;
        sfx.playCoin();
    }

    // VIP Tower generates bonus Bobux every 5 seconds
    if (gd.hasTower) {
        gd.bobuxTrickleTimer += dt;
        if (gd.bobuxTrickleTimer >= 5.0) {
            gd.bobuxTrickleTimer = 0;
            addBobux(10, 'VIP Tycoon Generátor');
        }
    }

    const extraEl = getExtraHudEl();
    if (extraEl) extraEl.textContent = `$${gd.cash} (+$${gd.unclaimedCash} v koši)`;

    // Check Step-On Buy Buttons
    gd.buyButtons.forEach(btn => {
        if (btn.purchased) return;
        btn.mesh.position.y = 0.6 + Math.sin(elapsedSec * 4) * 0.08;

        // Color button green if player can afford it, red otherwise
        btn.mesh.material.color.setHex(gd.cash >= btn.cost ? 0x10b981 : 0xef4444);

        if (playerState.pos.distanceTo(btn.pos) < 2.5) {
            if (gd.cash >= btn.cost) {
                gd.cash -= btn.cost;
                btn.purchased = true;
                btn.mesh.visible = false;
                // Remove button collider
                const idx = worldBlocks.indexOf(btn.blockRef);
                if (idx !== -1) worldBlocks.splice(idx, 1);
                buildTycoonUpgrade(btn.id);
            } else if (!btn.warnCooldown) {
                btn.warnCooldown = true;
                showHudToast(`Potřebuješ: ${btn.name}`, 'red');
                setTimeout(() => { btn.warnCooldown = false; }, 1800);
            }
        }
    });
}

function updateGame5Disasters(dt, elapsedSec) {
    const gd = gameSpecificData;
    if (!gd) return;

    // Update flying destructible debris blocks
    for (let i = 0; i < worldBlocks.length; i++) {
        const b = worldBlocks[i];
        if (b.flyingDebris) {
            b.debrisVel.y -= 24 * dt;
            b.mesh.position.addScaledVector(b.debrisVel, dt);
            b.mesh.rotation.x += 3 * dt;
            b.mesh.rotation.z += 2 * dt;
        }
    }

    if (!gd.disasterActive) {
        gd.prepTimer -= dt;
        document.getElementById('hud-objective-text').textContent = `Varování! Za ${Math.ceil(gd.prepTimer)}s udeří: ${gd.currentDisaster.name}`;
        if (gd.prepTimer <= 0) {
            gd.disasterActive = true;
            sfx.playExplosion();
            showHudToast(`KATASTROFA ZAČÍNÁ: ${gd.currentDisaster.name}!`, 'red');
            document.getElementById('hud-objective-text').textContent = `${gd.currentDisaster.name} – ${gd.currentDisaster.hint}`;
            if (gd.currentDisaster.id === 'acid') {
                scene.background = new THREE.Color(0x14532d);
            } else if (gd.currentDisaster.id === 'meteors') {
                scene.background = new THREE.Color(0x451a03);
            } else {
                scene.background = new THREE.Color(0x1e293b);
                gd.tornadoGroup.visible = true;
            }
        }
        return;
    }

    // Countdown 60s survival timer
    gd.roundTimer -= dt;
    const extraEl = getExtraHudEl();
    if (extraEl) extraEl.textContent = `${Math.max(0, Math.ceil(gd.roundTimer))}s`;

    if (gd.roundTimer <= 0) {
        addBobux(125, `Přežil jsi katastrofu: ${gd.currentDisaster.name}!`);
        sfx.playWinFanfare();
        setupGame5Disasters(); // Start a fresh repaired round
        return;
    }

    // DISASTER 1: METEOR SHOWER
    if (gd.currentDisaster.id === 'meteors') {
        gd.spawnTimer += dt;
        if (gd.spawnTimer >= 0.65) {
            gd.spawnTimer = 0;
            const tx = (Math.random() - 0.5) * 38;
            const tz = (Math.random() - 0.5) * 38;
            const meteor = new THREE.Mesh(
                new THREE.SphereGeometry(1.6, 10, 10),
                new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xdc2626, emissiveIntensity: 0.9 })
            );
            meteor.position.set(tx + 8, 42, tz - 6);
            scene.add(meteor);
            gd.meteors.push({
                mesh: meteor,
                vel: new THREE.Vector3(-4, -26, 3)
            });
        }

        for (let i = gd.meteors.length - 1; i >= 0; i--) {
            const m = gd.meteors[i];
            m.mesh.position.addScaledVector(m.vel, dt);

            if (m.mesh.position.y <= 1.2) {
                sfx.playExplosion();
                // Destroy nearby destructible house blocks
                for (let j = 0; j < worldBlocks.length; j++) {
                    const b = worldBlocks[j];
                    if (b.destructible && !b.flyingDebris && b.mesh.position.distanceTo(m.mesh.position) < 6.5) {
                        b.flyingDebris = true;
                        b.debrisVel.set((Math.random() - 0.5) * 18, 12 + Math.random() * 8, (Math.random() - 0.5) * 18);
                    }
                }
                // Damage player if close to meteor impact
                if (playerState.pos.distanceTo(m.mesh.position) < 6.5) {
                    damagePlayer(34, 'Zásah meteoritem!');
                }
                scene.remove(m.mesh);
                m.mesh.geometry.dispose();
                m.mesh.material.dispose();
                gd.meteors.splice(i, 1);
            }
        }
    }

    // DISASTER 2: ACID RAIN
    else if (gd.currentDisaster.id === 'acid') {
        gd.spawnTimer += dt;
        if (gd.spawnTimer >= 0.08) {
            gd.spawnTimer = 0;
            const drop = new THREE.Mesh(
                getCachedBoxGeometry(0.15, 1.4, 0.15),
                getCachedBlockMaterial(0x4ade80, 1, 1, { noStuds: true, emissive: 0x22c55e })
            );
            drop.position.set((Math.random() - 0.5) * 44, 28, (Math.random() - 0.5) * 44);
            scene.add(drop);
            gd.rainDrops.push(drop);
        }

        for (let i = gd.rainDrops.length - 1; i >= 0; i--) {
            const d = gd.rainDrops[i];
            d.position.y -= 34 * dt;
            if (d.position.y <= 1.0) {
                scene.remove(d);
                gd.rainDrops.splice(i, 1);
            }
        }

        // Check if player has an intact roof block overhead
        let hasCover = false;
        for (let i = 0; i < worldBlocks.length; i++) {
            const b = worldBlocks[i];
            if (!b.isRoof || b.flyingDebris) continue;
            if (b.mesh.position.y > playerState.pos.y + 1.5 &&
                Math.abs(b.mesh.position.x - playerState.pos.x) < b.size.x * 0.55 &&
                Math.abs(b.mesh.position.z - playerState.pos.z) < b.size.z * 0.55) {
                hasCover = true;
                break;
            }
        }

        if (!hasCover) {
            gd.acidTick = (gd.acidTick || 0) + dt;
            if (gd.acidTick >= 0.75) {
                gd.acidTick = 0;
                damagePlayer(10, 'Kyselý déšť! Schovej se pod střechu domu!');
            }
        }
    }

    // DISASTER 3: TORNADO
    else if (gd.currentDisaster.id === 'tornado') {
        gd.tornadoAngle += dt * 0.85;
        const tx = Math.cos(gd.tornadoAngle) * 11;
        const tz = Math.sin(gd.tornadoAngle * 1.4) * 11;
        gd.tornadoGroup.position.set(tx, 1, tz);
        gd.tornadoGroup.rotation.y += 10 * dt;

        // Tornado sucks up destructible house parts
        for (let i = 0; i < worldBlocks.length; i++) {
            const b = worldBlocks[i];
            if (b.destructible && !b.flyingDebris) {
                const d = Math.hypot(b.mesh.position.x - tx, b.mesh.position.z - tz);
                if (d < 7.0 && Math.random() < 0.08) {
                    b.flyingDebris = true;
                    b.debrisVel.set((Math.random() - 0.5) * 16, 18, (Math.random() - 0.5) * 16);
                }
            }
        }

        // Tornado pulls and flings player if too close
        const distToPlayer = Math.hypot(playerState.pos.x - tx, playerState.pos.z - tz);
        if (distToPlayer < 8.5) {
            _aiVec1.set(-(playerState.pos.z - tz), 0, playerState.pos.x - tx).normalize();
            playerState.knockback.addScaledVector(_aiVec1, 38 * dt);
            playerState.vel.y = 13.5;
            damagePlayer(16, 'odmrštěn větrným tornádem!');
        }
    }
}

// Per-Frame Update Loops for New Games 6–10
function updateGame6TowerOfHell(dt, elapsedSec) {
    const gd = gameSpecificData;
    if (!gd || !gd.sweepers) return;

    const heightMeters = Math.max(0, Math.round(playerState.pos.y));
    const extraEl = getExtraHudEl();
    if (extraEl) extraEl.textContent = `${heightMeters}m / 60m`;

    // Rotate deadly laser sweepers & check collision with player
    gd.sweepers.forEach(sw => {
        sw.mesh.rotation.y += sw.speed * dt;
        if (Math.abs(playerState.pos.y + 1.0 - sw.y) < 1.35) {
            const angle = sw.mesh.rotation.y;
            const cosA = Math.cos(-angle);
            const sinA = Math.sin(-angle);
            // Transform player X/Z into sweeper's local coordinate frame
            const localX = playerState.pos.x * cosA - playerState.pos.z * sinA;
            const localZ = playerState.pos.x * sinA + playerState.pos.z * cosA;
            if (Math.abs(localX) < 12.0 && Math.abs(localZ) < 0.85) {
                playerState.vel.y = 12;
                damagePlayer(45, 'Zasažen rotujícím laserem v Tower of Hell!');
            }
        }
    });
}

function updateGame7Zombies(dt, elapsedSec) {
    const gd = gameSpecificData;
    if (!gd || !gd.zombies) return;

    // Rotate & check Ammo/Medkit Supply Crates
    if (gd.ammoCrates) {
        gd.ammoCrates.forEach(crate => {
            if (crate.cooldown > 0) {
                crate.cooldown -= dt;
                crate.mesh.visible = crate.cooldown <= 0;
                return;
            }
            crate.mesh.rotation.y += 2.2 * dt;
            if (crate.mesh.position.distanceTo(playerState.pos) < 2.6) {
                crate.cooldown = 12.0;
                crate.mesh.visible = false;
                sfx.playCoin();
                playerState.weaponLoadout.forEach(w => {
                    if (w.type === 'gun' || w.type === 'heal') w.ammo = w.magSize;
                });
                playerState.hp = Math.min(playerState.maxHp, playerState.hp + 25);
                updateHealthHUD();
                renderHotbarUI();
                showHudToast('Sebrána bedna se zásobami (Plná munice + 25 HP)!', 'gold');
            }
        });
    }

    // Update Zombie AI Horde (Zero-GC scratch vectors)
    for (let i = 0; i < gd.zombies.length; i++) {
        const z = gd.zombies[i];
        if (!z.alive) continue;

        const dist = _aiVec1.subVectors(playerState.pos, z.pos).length();
        _aiVec2.copy(_aiVec1).setY(0);

        if (_aiVec2.length() > 1.5) {
            _aiVec2.normalize();
            z.pos.addScaledVector(_aiVec2, z.speed * dt);
            z.meshData.root.rotation.y = lerpAngle(z.meshData.root.rotation.y, Math.atan2(-_aiVec2.x, -_aiVec2.z), dt * 12);

            z.walkPhase += dt * 7.5;
            const sw = Math.sin(z.walkPhase) * 0.65;
            z.meshData.leftLegPivot.rotation.x = sw;
            z.meshData.rightLegPivot.rotation.x = -sw;
        }

        z.pos.addScaledVector(z.knockback, dt);
        z.knockback.multiplyScalar(Math.pow(0.08, dt));

        if (z.pos.y <= 0.1) {
            z.pos.y = 0;
            z.vel.y = Math.max(0, z.vel.y);
        } else {
            z.vel.y -= 34 * dt;
        }
        z.pos.y += z.vel.y * dt;
        z.meshData.root.position.copy(z.pos);

        if (z.attackCooldown > 0) z.attackCooldown -= dt;
        if (dist < 2.9 && z.attackCooldown <= 0) {
            z.attackCooldown = 1.1;
            _aiVec1.subVectors(playerState.pos, z.pos).setY(0).normalize();
            playerState.knockback.addScaledVector(_aiVec1, 12);
            damagePlayer(18, `Pokousán zombií (${z.name})!`);
        }
    }
}

function updateGame8SpeedRun(dt) {
    const gd = gameSpecificData;
    if (!gd) return;
    gd.runTime = (gd.runTime || 0) + dt;
    const extraEl = getExtraHudEl();
    if (extraEl) extraEl.textContent = `${gd.runTime.toFixed(2)}s (CP ${gd.currentCheckpoint}/3)`;
}

function updateGame9HideAndSeek(dt) {
    const gd = gameSpecificData;
    if (!gd) return;

    gd.roundTimer -= dt;
    const extraEl = getExtraHudEl();
    if (extraEl) extraEl.textContent = `${gd.foundCount} / ${gd.totalHiders} • ${Math.max(0, Math.ceil(gd.roundTimer))}s`;

    // Subtle movement of unfound disguised props so perceptive players can spot them
    if (gd.hiderProps) {
        for (let i = 0; i < gd.hiderProps.length; i++) {
            const hp = gd.hiderProps[i];
            if (hp.found) continue;
            hp.moveTimer -= dt;
            if (hp.moveTimer <= 0) {
                hp.moveTimer = 3.5 + Math.random() * 3.0;
                hp.targetPos.set(
                    Math.max(-26, Math.min(26, hp.pos.x + (Math.random() - 0.5) * 10)),
                    0,
                    Math.max(-26, Math.min(26, hp.pos.z + (Math.random() - 0.5) * 10))
                );
            }
            _aiVec1.subVectors(hp.targetPos, hp.pos);
            if (_aiVec1.length() > 0.2) {
                _aiVec1.normalize();
                hp.pos.addScaledVector(_aiVec1, 3.2 * dt);
                hp.meshData.root.position.copy(hp.pos);
            }
        }
    }

    if (gd.foundCount >= gd.totalHiders) {
        sfx.playWinFanfare();
        addBobux(150, 'Našel jsi všechny schované předměty v Hide and Seek!');
        showHudToast('VŠICHNI HLEDAČI NALEZENI! Nové kolo...', 'gold');
        setupGame9HideAndSeek();
        return;
    }

    if (gd.roundTimer <= 0) {
        const isDisguised = playerState.activeWeapon && playerState.activeWeapon.type === 'prop';
        if (isDisguised) {
            sfx.playWinFanfare();
            addBobux(110, 'Přežil jsi kolo Hide and Seek v přestrojení!');
            showHudToast('KOLO SKONČILO! Přežil jsi v přestrojení!', 'green');
        } else {
            showHudToast('Čas vypršel! Začíná nové kolo Hide and Seek.', 'blue');
        }
        setupGame9HideAndSeek();
    }
}

function updateGame10Bedwars(dt, elapsedSec) {
    const gd = gameSpecificData;
    if (!gd) return;

    // Resource Generator spawns Iron/Diamond Ingots on Blue Island (Z = 41) & Center Island (Z = 0)
    gd.genTimer += dt;
    if (gd.genTimer >= 2.2 && gd.ingots.length < 14) {
        gd.genTimer = 0;
        const isDiamond = Math.random() < 0.35;
        const ingotMesh = new THREE.Mesh(
            getCachedBoxGeometry(0.75, 0.35, 0.75),
            getCachedBlockMaterial(isDiamond ? 0x22d3ee : 0xe2e8f0, 1, 1, {
                noStuds: true,
                emissive: isDiamond ? 0x0891b2 : 0x475569,
                emissiveIntensity: 0.45,
                metalness: 0.8
            })
        );
        if (isDiamond) {
            ingotMesh.position.set((Math.random() - 0.5) * 4, 1.8, (Math.random() - 0.5) * 4);
        } else {
            ingotMesh.position.set((Math.random() - 0.5) * 4, 1.8, 40 + (Math.random() - 0.5) * 2);
        }
        scene.add(ingotMesh);
        gd.ingots.push({ mesh: ingotMesh, blocksGiven: isDiamond ? 12 : 6 });
    }

    // Collect Ingots to replenish Building Blocks & Ammo
    for (let i = gd.ingots.length - 1; i >= 0; i--) {
        const ing = gd.ingots[i];
        ing.mesh.rotation.y += 2.5 * dt;
        if (ing.mesh.position.distanceTo(playerState.pos) < 2.6) {
            sfx.playCoin();
            const blockWeapon = playerState.weaponLoadout.find(w => w.id === 'block');
            if (blockWeapon) {
                blockWeapon.ammo = Math.min(blockWeapon.magSize, blockWeapon.ammo + ing.blocksGiven);
            }
            const gunWeapon = playerState.weaponLoadout.find(w => w.id === 'pistol');
            if (gunWeapon) {
                gunWeapon.ammo = gunWeapon.magSize;
            }
            renderHotbarUI();
            showHudToast(`+${ing.blocksGiven} Stavebních bloků!`, 'blue');
            scene.remove(ing.mesh);
            gd.ingots.splice(i, 1);
        }
    }

    const blueStatus = gd.blueBedAlive ? '🟦 Živá' : '🟦 Zničena';
    const redStatus = gd.redBedAlive ? '🟥 Živá' : '🟥 Zničena';
    const extraEl = getExtraHudEl();
    if (extraEl) extraEl.textContent = `${blueStatus} | ${redStatus}`;

    // Update Red Team AI Defenders (Zero-GC scratch vectors)
    if (gd.enemies) {
        for (let i = 0; i < gd.enemies.length; i++) {
            const en = gd.enemies[i];
            if (!en.alive) continue;
            const dist = _aiVec1.subVectors(playerState.pos, en.pos).length();

            let targetPoint = en.homePos;
            if (dist < 24) {
                targetPoint = playerState.pos;
            }

            _aiVec2.subVectors(targetPoint, en.pos).setY(0);
            if (_aiVec2.length() > 1.8) {
                _aiVec2.normalize();
                en.pos.addScaledVector(_aiVec2, 6.8 * dt);
                en.meshData.root.rotation.y = lerpAngle(en.meshData.root.rotation.y, Math.atan2(-_aiVec2.x, -_aiVec2.z), dt * 12);

                en.walkPhase += dt * 7;
                const sw = Math.sin(en.walkPhase) * 0.65;
                en.meshData.leftLegPivot.rotation.x = sw;
                en.meshData.rightLegPivot.rotation.x = -sw;
            }

            en.pos.addScaledVector(en.knockback, dt);
            en.knockback.multiplyScalar(Math.pow(0.08, dt));

            const onRedIsland = Math.abs(en.pos.x) <= 9.2 && Math.abs(en.pos.z + 38) <= 9.2;
            const onCenterIsland = Math.abs(en.pos.x) <= 10.2 && Math.abs(en.pos.z) <= 10.2;
            const onBridge = Math.abs(en.pos.x) <= 2.2 && Math.abs(en.pos.z) <= 38;

            if ((onRedIsland || onCenterIsland || onBridge) && en.pos.y <= 1.4) {
                en.pos.y = 1.25;
                en.vel.y = Math.max(0, en.vel.y);
            } else {
                en.vel.y -= 34 * dt;
            }
            en.pos.y += en.vel.y * dt;
            en.meshData.root.position.copy(en.pos);

            if (en.attackCooldown > 0) en.attackCooldown -= dt;
            if (dist < 3.5 && en.attackCooldown <= 0) {
                en.attackCooldown = 1.1;
                en.meshData.rightArmPivot.rotation.x = 2.1;
                sfx.playSwordSlash();
                _aiVec1.subVectors(playerState.pos, en.pos).setY(0).normalize();
                playerState.knockback.addScaledVector(_aiVec1, 15);
                playerState.vel.y = 7.5;
                damagePlayer(16, `Zasažen obráncem (${en.name})!`);
            } else {
                en.meshData.rightArmPivot.rotation.x *= 0.85;
            }

            if (en.pos.y < -18) {
                eliminateBedwarsEnemy(en);
            }
        }
    }
}

function updateGame11AdoptMe(dt, elapsedSec) {
    const gd = gameSpecificData;
    if (!gd) return;

    // 1. Update confetti particles
    updateGame1Obby(dt);

    if (gd.hatchCooldown > 0) gd.hatchCooldown = Math.max(0, gd.hatchCooldown - dt);
    if (gd.tradeCooldown > 0) gd.tradeCooldown = Math.max(0, gd.tradeCooldown - dt);

    // 2. Money Tree passive paycheck (+$15 Bucks every 9 seconds, just like Adopt Me Paycheck!)
    gd.moneyTreeTimer = (gd.moneyTreeTimer || 0) + dt;
    if (gd.moneyTreeTimer >= 9.0) {
        gd.moneyTreeTimer = 0;
        gd.bucks += 15;
        saveAdoptMeData(gd.bucks, gd.pets);
        refreshAdoptMeHUD();
        showHudToast('💵 Adopt Me! Výplata (Paycheck): +$15 Bucks!', 'green');
    }

    // 3. Pet Needs (Ailments) generator
    if (!gd.currentNeed) {
        gd.needTimer -= dt;
        if (gd.needTimer <= 0) {
            const nextNeed = ADOPT_ME_NEEDS[Math.floor(Math.random() * ADOPT_ME_NEEDS.length)];
            gd.currentNeed = nextNeed;
            sfx.playJump();
            if (gd.activePetMesh && gd.activePetMesh.needOrb) {
                gd.activePetMesh.needOrb.visible = true;
                gd.activePetMesh.needOrb.material.color.setHex(nextNeed.color);
                gd.activePetMesh.needOrb.material.emissive.setHex(nextNeed.color);
            }
            refreshAdoptMeHUD();
            showHudToast(`🐾 Tvůj mazlíček má novou potřebu: ${nextNeed.name}!`, 'blue');
        }
    }

    // 4. Animate Active 3D Pet (Zero-GC scratch vectors)
    if (gd.activePetMesh && gd.activePetMesh.root) {
        const pm = gd.activePetMesh;
        if (gd.isRidingPet) {
            gd.petPos.set(playerState.pos.x, playerState.pos.y, playerState.pos.z);
            pm.root.position.copy(gd.petPos);
            pm.root.rotation.y = playerAvatar.root.rotation.y;
        } else {
            const targetX = playerState.pos.x + Math.sin(playerAvatar.root.rotation.y + 0.7) * 2.5;
            const targetZ = playerState.pos.z + Math.cos(playerAvatar.root.rotation.y + 0.7) * 2.5;
            const dx = targetX - gd.petPos.x;
            const dz = targetZ - gd.petPos.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.25) {
                gd.petPos.x += dx * Math.min(1, dt * 6.5);
                gd.petPos.z += dz * Math.min(1, dt * 6.5);
                pm.root.rotation.y = lerpAngle(pm.root.rotation.y, Math.atan2(-dx, -dz), dt * 10);
            }
            gd.petPos.y = playerState.pos.y + Math.abs(Math.sin(elapsedSec * 5.5)) * (dist > 0.35 ? 0.28 : 0.06);
            pm.root.position.copy(gd.petPos);
        }

        // Animate pet legs, wagging tail, flapping wings & floating Need Orb
        const walkSpeed = Math.hypot(playerState.vel.x, playerState.vel.z);
        const legSwing = walkSpeed > 0.6 ? Math.sin(elapsedSec * 12) * 0.45 : 0;
        if (pm.legs && pm.legs.length === 4) {
            pm.legs[0].rotation.x = legSwing;
            pm.legs[1].rotation.x = -legSwing;
            pm.legs[2].rotation.x = -legSwing;
            pm.legs[3].rotation.x = legSwing;
        }
        if (pm.tailGroup) {
            pm.tailGroup.rotation.y = Math.sin(elapsedSec * 7.5) * 0.45;
        }
        if (pm.leftWingPivot && pm.rightWingPivot && (pm.leftWingPivot.visible || gd.isRidingPet)) {
            const flap = Math.sin(elapsedSec * (gd.isRidingPet && !playerState.onGround ? 14 : 6.5)) * 0.52;
            pm.leftWingPivot.rotation.z = flap;
            pm.rightWingPivot.rotation.z = -flap;
        }
        if (pm.needOrb && pm.needOrb.visible) {
            pm.needOrb.position.y = 2.85 + Math.sin(elapsedSec * 4.5) * 0.22;
        }
        if (pm.neonRing && pm.neonRing.visible) {
            pm.neonRing.rotation.z = elapsedSec * 2.5;
        }
    }

    // 5. Animate Egg Pedestals in Nursery & Check Egg Purchase / Hatching
    if (gd.eggStands) {
        gd.eggStands.forEach(stand => {
            if (stand.eggMesh) {
                stand.eggMesh.rotation.y = elapsedSec * 1.8;
                stand.eggMesh.position.y = 3.1 + Math.sin(elapsedSec * 3.2 + stand.pos.x) * 0.2;
            }
            if (playerState.pos.distanceTo(stand.pos) < 2.65) {
                hatchAdoptMeEgg(stand);
            }
        });
    }

    // 6. Animate Golden Apple in Hospital
    if (gd.goldenApple) {
        gd.goldenApple.rotation.y = elapsedSec * 2.2;
        gd.goldenApple.position.y = 2.4 + Math.sin(elapsedSec * 3.5) * 0.18;
    }

    // 7. Check Care Stations on Adoption Island
    // A) Feeder Bowl (X = -5.5, Z = -8) -> Hungry
    if (Math.hypot(playerState.pos.x + 5.5, playerState.pos.z + 8) < 2.6) {
        completeAdoptMeNeed('hungry');
    }
    // B) Water Bowl (X = +5.5, Z = -8) -> Thirsty
    if (Math.hypot(playerState.pos.x - 5.5, playerState.pos.z + 8) < 2.6) {
        completeAdoptMeNeed('thirsty');
    }
    // C) Nursery Cribs (X = -19, Z = -16) -> Sleepy
    if (Math.hypot(playerState.pos.x + 19, playerState.pos.z + 16) < 4.5) {
        completeAdoptMeNeed('sleepy');
    }
    // D) Camping & Hot Springs Shower (X = +19, Z = -16) -> Dirty
    if (Math.hypot(playerState.pos.x - 19, playerState.pos.z + 16) < 4.8) {
        completeAdoptMeNeed('dirty');
    }
    // E) Hospital Golden Apple Pad (X = -14.5, Z = +1) -> Sick + Full Player Heal
    if (Math.hypot(playerState.pos.x + 14.5, playerState.pos.z - 1) < 3.2) {
        if (playerState.hp < playerState.maxHp) {
            playerState.hp = playerState.maxHp;
            updateHealthHUD();
        }
        completeAdoptMeNeed('sick');
    }
    // F) Playground Bouncy Trampolines (X = +20, Z = +1) -> Bored + Super Bounce
    if (gd.trampolines) {
        gd.trampolines.forEach(tr => {
            if (Math.hypot(playerState.pos.x - tr.mesh.position.x, playerState.pos.z - tr.mesh.position.z) < 2.3 &&
                playerState.pos.y <= tr.mesh.position.y + 1.8) {
                playerState.vel.y = 22.5;
                playerState.onGround = false;
                playerState.coyoteTimer = 0;
                sfx.playJump();
                completeAdoptMeNeed('bored');
            }
        });
    }
    if (Math.hypot(playerState.pos.x - 20, playerState.pos.z - 1) < 5.2) {
        completeAdoptMeNeed('bored');
    }

    // 8. Central Trade Hub Pad (X = 0, Z = -4) -> Trade Showcase Bonus with NPCs/Players
    if (Math.hypot(playerState.pos.x, playerState.pos.z + 4) < 3.5 && gd.tradeCooldown <= 0) {
        gd.tradeCooldown = 16.0;
        gd.bucks += 40;
        saveAdoptMeData(gd.bucks, gd.pets);
        addBobux(35, 'Adopt Me! Trade Hub bonus s Trader_Mia');
        sfx.playCoin();
        refreshAdoptMeHUD();
        showHudToast('🔁 TRADE HUB: Obchodoval jsi s Trader_Mia! (+$40 Bucks & +35 B$)', 'gold');
    }

    // 9. Animate NPC Collectors & their Pets
    if (gd.npcEntities) {
        gd.npcEntities.forEach(npc => {
            npc.phase += dt * 1.6;
            const nx = npc.basePos.x + Math.cos(npc.phase) * 1.4;
            const nz = npc.basePos.z + Math.sin(npc.phase) * 1.4;
            npc.charMesh.root.position.set(nx, npc.basePos.y, nz);
            npc.charMesh.root.rotation.y = -npc.phase;
            const sw = Math.sin(npc.phase * 4) * 0.45;
            npc.charMesh.leftLegPivot.rotation.x = sw;
            npc.charMesh.rightLegPivot.rotation.x = -sw;

            npc.petMesh.root.position.set(
                nx + Math.cos(npc.phase - 0.9) * 1.8,
                npc.basePos.y + Math.abs(Math.sin(npc.phase * 3)) * 0.18,
                nz + Math.sin(npc.phase - 0.9) * 1.8
            );
            npc.petMesh.root.rotation.y = -npc.phase;
            if (npc.petMesh.leftWingPivot && npc.petMesh.leftWingPivot.visible) {
                const flap = Math.sin(elapsedSec * 7 + npc.phase) * 0.45;
                npc.petMesh.leftWingPivot.rotation.z = flap;
                npc.petMesh.rightWingPivot.rotation.z = -flap;
            }
        });
    }
}

