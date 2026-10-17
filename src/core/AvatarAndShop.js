/* ============================================================================
 * 5. THREE.JS PROCEDURAL TEXTURES & 3D BLOCKY AVATAR ("NOOB")
 * ============================================================================ */
let sharedStudTexture = null;
let sharedNoobFaceTexture = null;

function getStudTexture() {
    if (sharedStudTexture) return sharedStudTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 128);

    // Draw 2x2 Roblox-style studs with subtle shadow and highlight
    const centers = [[32, 32], [96, 32], [32, 96], [96, 96]];
    centers.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#e5e7eb';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();

        // Inner B letter stamp hint
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('B', cx, cy);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    sharedStudTexture = tex;
    return tex;
}

function createNoobFaceTexture(isEvilBot = false, faceId = null) {
    return new THREE.CanvasTexture(createFaceCanvas(isEvilBot, faceId));
}

function createFaceCanvas(isEvilBot = false, faceId = null) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = isEvilBot ? '#ef4444' : '#F5CD30';
    ctx.fillRect(0, 0, 256, 256);

    const faceItem = !isEvilBot && faceId ? SHOP_ITEM_MAP[faceId] : null;
    if (faceItem && faceItem.draw) {
        faceItem.draw(ctx);
        return canvas;
    }

    // Eyes
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(88, 98, 15, 0, Math.PI * 2);
    ctx.arc(168, 98, 15, 0, Math.PI * 2);
    ctx.fill();

    if (isEvilBot) {
        // Angry eyebrows for SFOTH bots
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(64, 70);
        ctx.lineTo(110, 86);
        ctx.moveTo(192, 70);
        ctx.lineTo(146, 86);
        ctx.stroke();
    }

    // Classic Roblox smile curve
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (isEvilBot) {
        ctx.arc(128, 190, 42, 1.15 * Math.PI, 1.85 * Math.PI);
    } else {
        ctx.arc(128, 132, 48, 0.18 * Math.PI, 0.82 * Math.PI);
    }
    ctx.stroke();

    return canvas;
}

function createBlockyCharacterMesh(options = {}) {
    const headColor = options.headColor || 0xF5CD30;
    const isEvilBot = !!options.isEvilBot;
    // Shop outfit (shirt / pants / face / hat). Bots never wear the local player's outfit.
    const outfit = isEvilBot ? null : sanitizeOutfit(options.outfit || avatarOutfit);
    const shirtItem = outfit && outfit.shirt ? SHOP_ITEM_MAP[outfit.shirt] : null;
    const pantsItem = outfit && outfit.pants ? SHOP_ITEM_MAP[outfit.pants] : null;
    const baseTorsoColor = options.torsoColor || new THREE.Color(avatarTorsoHex || '#0D69AC').getHex();
    const baseTorsoHex = '#' + new THREE.Color(baseTorsoColor).getHexString();
    const shirtBaseHex = shirtItem ? (shirtItem.color || baseTorsoHex) : null;
    const torsoColor = shirtBaseHex ? new THREE.Color(shirtBaseHex).getHex() : baseTorsoColor;
    const legColor = pantsItem ? new THREE.Color(pantsItem.color).getHex() : (options.legColor || 0x4B974B);

    const root = new THREE.Group();

    // Materials
    const yellowMat = new THREE.MeshStandardMaterial({ color: headColor, roughness: 0.35 });
    const faceMat = new THREE.MeshStandardMaterial({ map: createNoobFaceTexture(isEvilBot, outfit ? outfit.face : null), roughness: 0.35 });
    const torsoMat = new THREE.MeshStandardMaterial({ color: torsoColor, roughness: 0.45 });
    const legMat = new THREE.MeshStandardMaterial({ color: legColor, roughness: 0.45 });

    // Head (with face on -Z or +Z depending on orientation; our avatar faces -Z forward)
    const headGeo = new THREE.BoxGeometry(1.15, 1.15, 1.15);
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z
    const headMaterials = [yellowMat, yellowMat, yellowMat, yellowMat, yellowMat, faceMat];
    const headMesh = new THREE.Mesh(headGeo, headMaterials);
    headMesh.position.y = 3.15;
    headMesh.castShadow = true;
    root.add(headMesh);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.6, 1.6, 0.8);
    let torsoMesh;
    if (shirtItem && shirtItem.draw) {
        const shirtFrontMat = new THREE.MeshStandardMaterial({ map: createShirtTexture(shirtItem, shirtBaseHex), roughness: 0.45 });
        torsoMesh = new THREE.Mesh(torsoGeo, [torsoMat, torsoMat, torsoMat, torsoMat, torsoMat, shirtFrontMat]);
    } else {
        torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    }
    torsoMesh.position.y = 1.75;
    torsoMesh.castShadow = true;
    root.add(torsoMesh);

    // Left & Right Arm Pivots (at shoulder height Y = 2.45)
    const armGeo = new THREE.BoxGeometry(0.65, 1.55, 0.65);
    armGeo.translate(0, -0.65, 0); // Shift down so rotation is around shoulder

    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-1.15, 2.4, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, yellowMat);
    leftArmMesh.castShadow = true;
    leftArmPivot.add(leftArmMesh);
    root.add(leftArmPivot);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(1.15, 2.4, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, yellowMat);
    rightArmMesh.castShadow = true;
    rightArmPivot.add(rightArmMesh);
    root.add(rightArmPivot);

    // Left & Right Leg Pivots (at hip height Y = 0.95)
    const legGeo = new THREE.BoxGeometry(0.76, 1.5, 0.78);
    legGeo.translate(0, -0.75, 0);

    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.42, 0.95, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, legMat);
    leftLegMesh.castShadow = true;
    leftLegPivot.add(leftLegMesh);
    root.add(leftLegPivot);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.42, 0.95, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, legMat);
    rightLegMesh.castShadow = true;
    rightLegPivot.add(rightLegMesh);
    root.add(rightLegPivot);

    // Weapon Pivot & Multiple 3D Weapon Models attached to Right Arm
    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0, -1.25, -0.35);
    rightArmPivot.add(weaponPivot);

    // 1. Linked Sword / Katana
    const swordGroup = new THREE.Group();
    swordGroup.rotation.x = Math.PI * 0.35;
    const handleMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.7, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    const guardMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.14, 0.24),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.3 })
    );
    guardMesh.position.y = 0.35;
    const bladeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 2.35, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
    );
    bladeMesh.position.y = 1.6;
    swordGroup.add(handleMesh, guardMesh, bladeMesh);
    swordGroup.visible = false;
    weaponPivot.add(swordGroup);

    // 2. Battle Axe
    const axeGroup = new THREE.Group();
    axeGroup.rotation.x = Math.PI * 0.35;
    const axeShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.09, 2.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    axeShaft.position.y = 0.85;
    const axeHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.75, 0.95),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7, roughness: 0.25 })
    );
    axeHead.position.set(0, 1.65, -0.2);
    axeGroup.add(axeShaft, axeHead);
    axeGroup.visible = false;
    weaponPivot.add(axeGroup);

    // 3. Tactical Pistol / Blaster
    const pistolGroup = new THREE.Group();
    pistolGroup.rotation.x = Math.PI * 0.48;
    const pistolGrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.55, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    const pistolBarrel = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.95, 0.32),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6, roughness: 0.2, emissive: 0x0284c7, emissiveIntensity: 0.25 })
    );
    pistolBarrel.position.set(0, 0.45, -0.12);
    pistolGroup.add(pistolGrip, pistolBarrel);
    pistolGroup.visible = false;
    weaponPivot.add(pistolGroup);

    // 4. Heavy Shotgun
    const shotgunGroup = new THREE.Group();
    shotgunGroup.rotation.x = Math.PI * 0.48;
    const sgStock = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.7, 0.32),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    const sgBarrel = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 1.55, 0.32),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.25 })
    );
    sgBarrel.position.set(0, 0.85, -0.08);
    const sgPump = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.55, 0.28),
        new THREE.MeshStandardMaterial({ color: 0xf97316 })
    );
    sgPump.position.set(0, 0.75, 0.08);
    shotgunGroup.add(sgStock, sgBarrel, sgPump);
    shotgunGroup.visible = false;
    weaponPivot.add(shotgunGroup);

    // 5. Diamond Pickaxe (Bedwars / Mining)
    const pickaxeGroup = new THREE.Group();
    pickaxeGroup.rotation.x = Math.PI * 0.35;
    const pickShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 2.0, 8),
        new THREE.MeshStandardMaterial({ color: 0x92400e })
    );
    pickShaft.position.y = 0.8;
    const pickHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.28, 1.35),
        new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 0.3, metalness: 0.5 })
    );
    pickHead.position.set(0, 1.65, 0);
    pickaxeGroup.add(pickShaft, pickHead);
    pickaxeGroup.visible = false;
    weaponPivot.add(pickaxeGroup);

    // 6. Held Building Block (Bedwars Wool Block)
    const blockToolMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.75, 0.75),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.6 })
    );
    blockToolMesh.position.set(0, 0.35, -0.25);
    blockToolMesh.visible = false;
    weaponPivot.add(blockToolMesh);

    // 7. Seeker Prop Scanner / Medkit
    const scannerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5 })
    );
    scannerMesh.position.set(0, 0.35, -0.2);
    scannerMesh.visible = false;
    weaponPivot.add(scannerMesh);

    // Optional Power-up Coil around Left Arm (for Tower of Lava / Speed Run)
    const coilMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.45, 0.11, 10, 20),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b })
    );
    coilMesh.rotation.x = Math.PI / 2;
    coilMesh.position.set(0, -0.65, 0);
    coilMesh.visible = false;
    leftArmPivot.add(coilMesh);

    // Prop Disguise Mesh Group (for Hide and Seek Prop Hunt)
    const propGroup = new THREE.Group();
    const propCrate = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2.4, 2.4),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 })
    );
    propCrate.position.y = 1.2;
    const propBarrel = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.1, 2.6, 14),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4, roughness: 0.4 })
    );
    propBarrel.position.y = 1.3;
    const propBush = new THREE.Mesh(
        new THREE.SphereGeometry(1.55, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
    );
    propBush.position.y = 1.35;
    propGroup.add(propCrate, propBarrel, propBush);
    propGroup.visible = false;
    root.add(propGroup);

    // Optional shop hat sitting on top of the head (head top at Y = 3.725)
    const hatItem = outfit && outfit.hat ? SHOP_ITEM_MAP[outfit.hat] : null;
    let hatGroup = null;
    if (hatItem && hatItem.build) {
        hatGroup = hatItem.build();
        hatGroup.position.y = 3.725;
        hatGroup.traverse(o => { if (o.isMesh) o.castShadow = true; });
        root.add(hatGroup);
    }

    const weaponMeshes = {
        sword: swordGroup,
        axe: axeGroup,
        pistol: pistolGroup,
        shotgun: shotgunGroup,
        pickaxe: pickaxeGroup,
        block: blockToolMesh,
        scanner: scannerMesh,
        medkit: scannerMesh
    };

    const meshData = {
        hatGroup,
        root,
        headMesh,
        torsoMesh,
        leftArmMesh,
        rightArmMesh,
        leftLegMesh,
        rightLegMesh,
        leftArmPivot,
        rightArmPivot,
        leftLegPivot,
        rightLegPivot,
        weaponPivot,
        weaponMeshes,
        swordGroup,
        coilMesh,
        propGroup,
        propCrate,
        propBarrel,
        propBush,
        currentWeaponId: 'none'
    };

    if (options.weaponId) {
        setCharacterWeaponMesh(meshData, options.weaponId);
    } else if (options.hasSword) {
        setCharacterWeaponMesh(meshData, 'sword');
    }

    return meshData;
}

// Cleanly hide old weapon model and attach/show newly selected weapon model on character rig
function setCharacterWeaponMesh(meshData, weaponId) {
    if (!meshData || !meshData.weaponMeshes) return;
    meshData.currentWeaponId = weaponId || 'none';

    // 1. Hide all hand weapons first (fixes overlapping weapon bug)
    Object.values(meshData.weaponMeshes).forEach(m => {
        if (m) m.visible = false;
    });
    if (meshData.coilMesh) meshData.coilMesh.visible = false;

    // Handle Prop Hunt disguise visibility
    const isProp = typeof weaponId === 'string' && weaponId.startsWith('prop_');
    if (meshData.propGroup) {
        meshData.propGroup.visible = isProp;
        meshData.propCrate.visible = weaponId === 'prop_crate';
        meshData.propBarrel.visible = weaponId === 'prop_barrel';
        meshData.propBush.visible = weaponId === 'prop_bush';
    }
    // Toggle humanoid body parts visibility when disguised as a prop
    const bodyVisible = !isProp;
    if (meshData.headMesh) meshData.headMesh.visible = bodyVisible;
    if (meshData.torsoMesh) meshData.torsoMesh.visible = bodyVisible;
    if (meshData.leftArmPivot) meshData.leftArmPivot.visible = bodyVisible;
    if (meshData.rightArmPivot) meshData.rightArmPivot.visible = bodyVisible;
    if (meshData.leftLegPivot) meshData.leftLegPivot.visible = bodyVisible;
    if (meshData.rightLegPivot) meshData.rightLegPivot.visible = bodyVisible;
    if (meshData.hatGroup) meshData.hatGroup.visible = bodyVisible;

    if (isProp) return;

    // 2. Show newly selected weapon or coil
    if (weaponId === 'coil_speed') {
        meshData.coilMesh.visible = true;
        meshData.coilMesh.material.color.setHex(0xef4444);
        meshData.coilMesh.material.emissive.setHex(0x991b1b);
    } else if (weaponId === 'coil_gravity') {
        meshData.coilMesh.visible = true;
        meshData.coilMesh.material.color.setHex(0x3b82f6);
        meshData.coilMesh.material.emissive.setHex(0x1d4ed8);
    } else if (weaponId === 'medkit') {
        meshData.weaponMeshes.scanner.visible = true;
        meshData.weaponMeshes.scanner.material.color.setHex(0xef4444);
        meshData.weaponMeshes.scanner.material.emissive.setHex(0x991b1b);
    } else if (weaponId === 'scanner') {
        meshData.weaponMeshes.scanner.visible = true;
        meshData.weaponMeshes.scanner.material.color.setHex(0x10b981);
        meshData.weaponMeshes.scanner.material.emissive.setHex(0x059669);
    } else if (weaponId === 'pet_food') {
        meshData.weaponMeshes.scanner.visible = true;
        meshData.weaponMeshes.scanner.material.color.setHex(0xef4444);
        meshData.weaponMeshes.scanner.material.emissive.setHex(0xb91c1c);
    } else if (weaponId === 'pet_water') {
        meshData.weaponMeshes.scanner.visible = true;
        meshData.weaponMeshes.scanner.material.color.setHex(0x38bdf8);
        meshData.weaponMeshes.scanner.material.emissive.setHex(0x0284c7);
    } else if (weaponId === 'pet_ride') {
        meshData.weaponMeshes.scanner.visible = true;
        meshData.weaponMeshes.scanner.material.color.setHex(0xec4899);
        meshData.weaponMeshes.scanner.material.emissive.setHex(0xbe185d);
    } else if (weaponId === 'pet_switch') {
        meshData.weaponMeshes.scanner.visible = true;
        meshData.weaponMeshes.scanner.material.color.setHex(0xfacc15);
        meshData.weaponMeshes.scanner.material.emissive.setHex(0xca8a04);
    } else if (meshData.weaponMeshes[weaponId]) {
        meshData.weaponMeshes[weaponId].visible = true;
    }
}

/* ============================================================================
 * 5b. AVATAR OBCHOD – OBLEČENÍ, OBLIČEJE & ČEPICE (KUPOVÁNO ZA BOBUX)
 * ============================================================================ */
const STORAGE_KEY_OUTFIT = 'boblox_avatar_outfit_v1';
const STORAGE_KEY_OWNED = 'boblox_shop_owned_v1';
const DEFAULT_FACE_ID = 'face_classic';

// Small helpers for hat builders
function hatMat(color, extra = {}) {
    return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.5 }, extra));
}
function hatMesh(geo, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    return m;
}
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
function faceEyes(ctx, r = 15) {
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(88, 98, r, 0, Math.PI * 2);
    ctx.arc(168, 98, r, 0, Math.PI * 2);
    ctx.fill();
}
function faceStroke(ctx, width = 11) {
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

const SHOP_ITEMS = [
    /* ---------- OBLEČENÍ: TRIČKA & MIKINY (slot shirt) ---------- */
    {
        id: 'shirt_logo', slot: 'shirt', category: 'clothing', name: 'Tričko BOBLOX', price: 50, color: null,
        desc: 'Klasické tričko s logem v barvě tvého torza.',
        draw(ctx) {
            ctx.save();
            ctx.translate(128, 108);
            ctx.rotate(14 * Math.PI / 180);
            ctx.fillStyle = '#ffffff';
            roundRect(ctx, -42, -42, 84, 84, 10);
            ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(-13, -13, 26, 26);
            ctx.restore();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 34px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('BOBLOX', 128, 210);
        }
    },
    {
        id: 'shirt_hoodie', slot: 'shirt', category: 'clothing', name: 'Šedá Mikina', price: 120, color: '#4B5563',
        desc: 'Pohodlná mikina s kapsou a tkaničkami.',
        draw(ctx) {
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.arc(128, -10, 70, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
            ctx.strokeStyle = '#F3F4F6';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(108, 58); ctx.lineTo(104, 120);
            ctx.moveTo(148, 58); ctx.lineTo(152, 120);
            ctx.stroke();
            ctx.fillStyle = '#374151';
            roundRect(ctx, 66, 160, 124, 66, 14);
            ctx.fill();
        }
    },
    {
        id: 'shirt_stripes', slot: 'shirt', category: 'clothing', name: 'Námořnické Pruhy', price: 80, color: '#F8FAFC',
        desc: 'Ahoj, kapitáne! Modrobílé pruhované triko.',
        draw(ctx) {
            ctx.fillStyle = '#1E3A8A';
            for (let y = 18; y < 256; y += 44) ctx.fillRect(0, y, 256, 20);
        }
    },
    {
        id: 'shirt_flannel', slot: 'shirt', category: 'clothing', name: 'Flanelová Košile', price: 100, color: '#B91C1C',
        desc: 'Drevorubecká kostkovaná košile.',
        draw(ctx) {
            ctx.fillStyle = 'rgba(17,17,17,0.45)';
            for (let i = 0; i < 256; i += 52) {
                ctx.fillRect(i, 0, 16, 256);
                ctx.fillRect(0, i, 256, 16);
            }
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            for (let i = 30; i < 256; i += 52) {
                ctx.fillRect(i, 0, 4, 256);
                ctx.fillRect(0, i, 256, 4);
            }
            ctx.fillStyle = '#F5F5F4';
            for (let y = 50; y < 256; y += 50) {
                ctx.beginPath(); ctx.arc(128, y, 6, 0, Math.PI * 2); ctx.fill();
            }
        }
    },
    {
        id: 'shirt_hero', slot: 'shirt', category: 'clothing', name: 'Super Bob Kostým', price: 200, color: '#1D4ED8',
        desc: 'Pro hrdiny, kteří přežijí každou katastrofu.',
        draw(ctx) {
            ctx.fillStyle = '#FACC15';
            ctx.beginPath();
            ctx.moveTo(128, 34); ctx.lineTo(206, 110); ctx.lineTo(128, 196); ctx.lineTo(50, 110);
            ctx.closePath(); ctx.fill();
            ctx.lineWidth = 8; ctx.strokeStyle = '#DC2626'; ctx.stroke();
            ctx.fillStyle = '#DC2626';
            ctx.font = 'bold 92px Fredoka, sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('B', 128, 118);
            ctx.fillStyle = '#B91C1C';
            ctx.fillRect(0, 220, 256, 36);
        }
    },
    {
        id: 'shirt_tux', slot: 'shirt', category: 'clothing', name: 'Elegantní Smoking', price: 250, color: '#111827',
        desc: 'Na VIP párty v Tycoonu jako stvořený.',
        draw(ctx) {
            ctx.fillStyle = '#F9FAFB';
            ctx.beginPath();
            ctx.moveTo(78, 0); ctx.lineTo(178, 0); ctx.lineTo(128, 200);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.moveTo(128, 30); ctx.lineTo(98, 14); ctx.lineTo(98, 46); ctx.closePath();
            ctx.moveTo(128, 30); ctx.lineTo(158, 14); ctx.lineTo(158, 46); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#111827';
            [80, 118, 156].forEach(y => { ctx.beginPath(); ctx.arc(128, y, 5, 0, Math.PI * 2); ctx.fill(); });
        }
    },
    {
        id: 'shirt_gold', slot: 'shirt', category: 'clothing', name: 'Zlatý VIP Oblek', price: 600, color: '#EAB308',
        desc: 'Ať všichni vidí, kolik máš Bobuxů.',
        draw(ctx) {
            const g = ctx.createLinearGradient(0, 0, 256, 256);
            g.addColorStop(0, '#FDE68A'); g.addColorStop(0.5, '#EAB308'); g.addColorStop(1, '#A16207');
            ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = '#111827';
            ctx.beginPath();
            ctx.moveTo(116, 0); ctx.lineTo(140, 0); ctx.lineTo(146, 150); ctx.lineTo(128, 176); ctx.lineTo(110, 150);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = 'bold 40px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('VIP', 196, 228);
        }
    },

    /* ---------- OBLEČENÍ: KALHOTY (slot pants) ---------- */
    { id: 'pants_jeans', slot: 'pants', category: 'clothing', name: 'Modré Džíny', price: 60, color: '#1E40AF', desc: 'Nestárnoucí klasika.' },
    { id: 'pants_black', slot: 'pants', category: 'clothing', name: 'Černé Kalhoty', price: 40, color: '#1F2937', desc: 'Ladí ke smokingu i ke SpecOps torzu.' },
    { id: 'pants_white', slot: 'pants', category: 'clothing', name: 'Bílé Tepláky', price: 45, color: '#E5E7EB', desc: 'Jen pozor na lávu, hrozně se špiní.' },
    { id: 'pants_red', slot: 'pants', category: 'clothing', name: 'Červené Kraťasy', price: 55, color: '#DC2626', desc: 'Rychlé nohy pro Mega Obby.' },
    { id: 'pants_khaki', slot: 'pants', category: 'clothing', name: 'Khaki Cargo', price: 70, color: '#A16207', desc: 'Spousta kapes na Bobuxy.' },

    /* ---------- OBLIČEJE (slot face) ---------- */
    {
        id: 'face_classic', slot: 'face', category: 'face', name: 'Klasický Úsměv', price: 0,
        desc: 'Původní Noob úsměv. Zdarma pro každého.',
        draw(ctx) {
            faceEyes(ctx);
            faceStroke(ctx);
            ctx.beginPath(); ctx.arc(128, 132, 48, 0.18 * Math.PI, 0.82 * Math.PI); ctx.stroke();
        }
    },
    {
        id: 'face_wink', slot: 'face', category: 'face', name: 'Mrknutí', price: 50,
        desc: 'Ty víš, co se děje. ;)',
        draw(ctx) {
            ctx.fillStyle = '#111111';
            ctx.beginPath(); ctx.arc(88, 98, 15, 0, Math.PI * 2); ctx.fill();
            faceStroke(ctx, 10);
            ctx.beginPath(); ctx.moveTo(150, 100); ctx.quadraticCurveTo(168, 84, 186, 100); ctx.stroke();
            faceStroke(ctx);
            ctx.beginPath(); ctx.arc(128, 128, 48, 0.12 * Math.PI, 0.72 * Math.PI); ctx.stroke();
        }
    },
    {
        id: 'face_surprised', slot: 'face', category: 'face', name: 'Překvapení', price: 40,
        desc: 'Když tě zasáhne meteorit.',
        draw(ctx) {
            [88, 168].forEach(x => {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(x, 96, 24, 0, Math.PI * 2); ctx.fill();
                ctx.lineWidth = 5; ctx.strokeStyle = '#111111'; ctx.stroke();
                ctx.fillStyle = '#111111';
                ctx.beginPath(); ctx.arc(x, 98, 10, 0, Math.PI * 2); ctx.fill();
            });
            ctx.fillStyle = '#111111';
            ctx.beginPath(); ctx.ellipse(128, 176, 20, 26, 0, 0, Math.PI * 2); ctx.fill();
        }
    },
    {
        id: 'face_grin', slot: 'face', category: 'face', name: 'Široký Úsměv', price: 60,
        desc: 'Úsměv od ucha k uchu.',
        draw(ctx) {
            faceEyes(ctx, 14);
            ctx.fillStyle = '#111111';
            ctx.beginPath(); ctx.moveTo(62, 140); ctx.quadraticCurveTo(128, 236, 194, 140); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.moveTo(72, 146); ctx.lineTo(184, 146); ctx.lineTo(176, 160); ctx.lineTo(80, 160); ctx.closePath(); ctx.fill();
        }
    },
    {
        id: 'face_angry', slot: 'face', category: 'face', name: 'Naštvaný Bojovník', price: 60,
        desc: 'Ideální na meče v SFOTH aréně.',
        draw(ctx) {
            faceEyes(ctx);
            faceStroke(ctx, 10);
            ctx.beginPath();
            ctx.moveTo(64, 70); ctx.lineTo(110, 86);
            ctx.moveTo(192, 70); ctx.lineTo(146, 86);
            ctx.stroke();
            faceStroke(ctx);
            ctx.beginPath(); ctx.arc(128, 190, 42, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
        }
    },
    {
        id: 'face_cool', slot: 'face', category: 'face', name: 'Cool Brýle', price: 75,
        desc: 'Sluneční brýle a sebevědomý úšklebek.',
        draw(ctx) {
            ctx.fillStyle = '#111111';
            ctx.fillRect(48, 80, 160, 10);
            roundRect(ctx, 52, 82, 66, 40, 12); ctx.fill();
            roundRect(ctx, 138, 82, 66, 40, 12); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.fillRect(62, 90, 18, 6);
            ctx.fillRect(148, 90, 18, 6);
            faceStroke(ctx, 10);
            ctx.beginPath(); ctx.moveTo(96, 172); ctx.quadraticCurveTo(140, 184, 172, 156); ctx.stroke();
        }
    },
    {
        id: 'face_kawaii', slot: 'face', category: 'face', name: 'Roztomilý', price: 90,
        desc: 'Lesklá očička a růžové tvářičky.',
        draw(ctx) {
            [88, 168].forEach(x => {
                ctx.fillStyle = '#111111';
                ctx.beginPath(); ctx.ellipse(x, 100, 16, 22, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(x - 5, 92, 6, 0, Math.PI * 2); ctx.fill();
            });
            ctx.fillStyle = 'rgba(244,114,182,0.7)';
            ctx.beginPath(); ctx.ellipse(56, 146, 20, 12, 0, 0, Math.PI * 2); ctx.ellipse(200, 146, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
            faceStroke(ctx, 8);
            ctx.beginPath();
            ctx.moveTo(104, 150); ctx.quadraticCurveTo(116, 168, 128, 152); ctx.quadraticCurveTo(140, 168, 152, 150);
            ctx.stroke();
        }
    },
    {
        id: 'face_villain', slot: 'face', category: 'face', name: 'Padouch s Knírem', price: 120,
        desc: 'Mwahaha! Zakroucený knír v ceně.',
        draw(ctx) {
            ctx.fillStyle = '#111111';
            ctx.beginPath(); ctx.ellipse(88, 100, 16, 8, 0, 0, Math.PI * 2); ctx.ellipse(168, 100, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
            faceStroke(ctx, 9);
            ctx.beginPath();
            ctx.moveTo(62, 70); ctx.lineTo(112, 84);
            ctx.moveTo(194, 70); ctx.lineTo(144, 84);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(128, 148);
            ctx.bezierCurveTo(100, 128, 64, 150, 70, 172); ctx.bezierCurveTo(74, 184, 90, 176, 84, 168);
            ctx.moveTo(128, 148);
            ctx.bezierCurveTo(156, 128, 192, 150, 186, 172); ctx.bezierCurveTo(182, 184, 166, 176, 172, 168);
            ctx.lineWidth = 14; ctx.stroke();
            faceStroke(ctx, 7);
            ctx.beginPath(); ctx.arc(128, 168, 26, 0.25 * Math.PI, 0.75 * Math.PI); ctx.stroke();
        }
    },
    {
        id: 'face_robot', slot: 'face', category: 'face', name: 'Robot Visor', price: 150,
        desc: 'Svítící kyber oči z budoucnosti.',
        draw(ctx) {
            ctx.fillStyle = '#1F2937';
            roundRect(ctx, 34, 66, 188, 66, 18); ctx.fill();
            ctx.fillStyle = '#22D3EE';
            ctx.shadowColor = '#22D3EE'; ctx.shadowBlur = 18;
            roundRect(ctx, 62, 88, 46, 22, 6); ctx.fill();
            roundRect(ctx, 148, 88, 46, 22, 6); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#374151';
            roundRect(ctx, 76, 158, 104, 40, 8); ctx.fill();
            ctx.fillStyle = '#9CA3AF';
            for (let x = 90; x < 176; x += 18) ctx.fillRect(x, 164, 6, 28);
        }
    },

    /* ---------- ČEPICE & KLOBOUKY (slot hat) ---------- */
    {
        id: 'hat_cone', slot: 'hat', category: 'hat', name: 'Dopravní Kužel', price: 40,
        desc: 'Legendární doplněk každého Nooba.',
        build() {
            const g = new THREE.Group();
            const orange = hatMat(0xF97316);
            g.add(hatMesh(new THREE.BoxGeometry(1.2, 0.1, 1.2), orange, 0, 0.05, 0));
            g.add(hatMesh(new THREE.ConeGeometry(0.5, 1.35, 20), orange, 0, 0.75, 0));
            g.add(hatMesh(new THREE.CylinderGeometry(0.29, 0.37, 0.22, 20), hatMat(0xffffff), 0, 0.68, 0));
            return g;
        }
    },
    {
        id: 'hat_party', slot: 'hat', category: 'hat', name: 'Párty Klobouček', price: 60,
        desc: 'Každý den je oslava výhry!',
        build() {
            const g = new THREE.Group();
            g.add(hatMesh(new THREE.ConeGeometry(0.38, 1.0, 20), hatMat(0xEC4899), 0, 0.5, 0));
            g.add(hatMesh(new THREE.SphereGeometry(0.15, 12, 10), hatMat(0xFACC15), 0, 1.02, 0));
            g.add(hatMesh(new THREE.TorusGeometry(0.3, 0.05, 8, 20), hatMat(0x22D3EE), 0, 0.22, 0));
            g.children[2].rotation.x = Math.PI / 2;
            g.rotation.z = -0.22;
            g.position.x = 0.1;
            return g;
        }
    },
    {
        id: 'hat_cap', slot: 'hat', category: 'hat', name: 'Kšiltovka', price: 80,
        desc: 'Sportovní kšiltovka s modrým kšiltem.',
        build() {
            const g = new THREE.Group();
            const red = hatMat(0xDC2626);
            const dome = hatMesh(new THREE.SphereGeometry(0.62, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), red, 0, -0.08, 0);
            dome.scale.y = 0.75;
            g.add(dome);
            g.add(hatMesh(new THREE.BoxGeometry(0.95, 0.07, 0.6), hatMat(0x1D4ED8), 0, -0.05, -0.75));
            g.add(hatMesh(new THREE.SphereGeometry(0.07, 8, 6), hatMat(0x1D4ED8), 0, 0.4, 0));
            return g;
        }
    },
    {
        id: 'hat_headphones', slot: 'hat', category: 'hat', name: 'Herní Sluchátka', price: 140,
        desc: 'Retro syntezátor zní v nich ještě lépe.',
        build() {
            const g = new THREE.Group();
            const black = hatMat(0x111827, { roughness: 0.3 });
            g.add(hatMesh(new THREE.TorusGeometry(0.68, 0.08, 8, 24, Math.PI), black, 0, -0.5, 0));
            const cupGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 20);
            const neon = hatMat(0x00A2FF, { emissive: 0x0369A1 });
            [-1, 1].forEach(side => {
                const cup = hatMesh(cupGeo, black, side * 0.66, -0.55, 0);
                cup.rotation.z = Math.PI / 2;
                g.add(cup);
                const ring = hatMesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16), neon, side * 0.77, -0.55, 0);
                ring.rotation.z = Math.PI / 2;
                g.add(ring);
            });
            return g;
        }
    },
    {
        id: 'hat_tophat', slot: 'hat', category: 'hat', name: 'Gentlemanský Cylindr', price: 150,
        desc: 'Vysoký černý cylindr s červenou stuhou.',
        build() {
            const g = new THREE.Group();
            const black = hatMat(0x111111, { roughness: 0.35 });
            g.add(hatMesh(new THREE.CylinderGeometry(0.85, 0.85, 0.07, 28), black, 0, 0.04, 0));
            g.add(hatMesh(new THREE.CylinderGeometry(0.55, 0.52, 1.05, 28), black, 0, 0.58, 0));
            g.add(hatMesh(new THREE.CylinderGeometry(0.535, 0.535, 0.18, 28), hatMat(0xB91C1C), 0, 0.2, 0));
            return g;
        }
    },
    {
        id: 'hat_cowboy', slot: 'hat', category: 'hat', name: 'Kovbojský Klobouk', price: 180,
        desc: 'Yeehaw! Na divoký západ Tycoonu.',
        build() {
            const g = new THREE.Group();
            const brown = hatMat(0x92400E);
            const brim = hatMesh(new THREE.CylinderGeometry(1.08, 1.08, 0.06, 32), brown, 0, 0.03, 0);
            brim.scale.z = 0.85;
            g.add(brim);
            g.add(hatMesh(new THREE.CylinderGeometry(0.48, 0.6, 0.62, 24), brown, 0, 0.34, 0));
            g.add(hatMesh(new THREE.CylinderGeometry(0.585, 0.6, 0.12, 24), hatMat(0x111827), 0, 0.1, 0));
            return g;
        }
    },
    {
        id: 'hat_viking', slot: 'hat', category: 'hat', name: 'Vikingská Helma', price: 300,
        desc: 'Ocelová helma s mohutnými rohy.',
        build() {
            const g = new THREE.Group();
            const steel = hatMat(0x9CA3AF, { metalness: 0.7, roughness: 0.3 });
            const dome = hatMesh(new THREE.SphereGeometry(0.66, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, -0.2, 0);
            dome.scale.y = 0.9;
            g.add(dome);
            g.add(hatMesh(new THREE.CylinderGeometry(0.67, 0.67, 0.14, 24), hatMat(0x78350F), 0, -0.16, 0));
            const hornMat = hatMat(0xFEF3C7);
            [-1, 1].forEach(side => {
                const horn = hatMesh(new THREE.ConeGeometry(0.14, 0.75, 12), hornMat, side * 0.78, 0.22, 0);
                horn.rotation.z = -side * 0.95;
                g.add(horn);
            });
            return g;
        }
    },
    {
        id: 'hat_crown', slot: 'hat', category: 'hat', name: 'Královská Koruna', price: 500,
        desc: 'Pro skutečné krále Bobloxu.',
        build() {
            const g = new THREE.Group();
            const gold = hatMat(0xFACC15, { metalness: 0.85, roughness: 0.25 });
            g.add(hatMesh(new THREE.CylinderGeometry(0.55, 0.55, 0.32, 24, 1, true), gold, 0, 0.16, 0));
            g.children[0].material.side = THREE.DoubleSide;
            const gemColors = [0xDC2626, 0x2563EB, 0x16A34A, 0xDC2626, 0x7C3AED];
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
                const x = Math.cos(a) * 0.5, z = -Math.sin(a) * 0.5;
                g.add(hatMesh(new THREE.ConeGeometry(0.13, 0.32, 8), gold, x, 0.46, z));
                g.add(hatMesh(new THREE.SphereGeometry(0.075, 10, 8), hatMat(gemColors[i], { emissive: gemColors[i], emissiveIntensity: 0.3 }), x * 1.1, 0.16, z * 1.1));
            }
            return g;
        }
    },
    {
        id: 'hat_halo', slot: 'hat', category: 'hat', name: 'Andělská Svatozář', price: 1000,
        desc: 'Zářící svatozář jen pro nejvěrnější hráče.',
        build() {
            const g = new THREE.Group();
            const halo = hatMesh(new THREE.TorusGeometry(0.48, 0.07, 10, 32), hatMat(0xFDE68A, { emissive: 0xFACC15, emissiveIntensity: 0.9 }), 0, 0.45, 0);
            halo.rotation.x = Math.PI / 2;
            g.add(halo);
            return g;
        }
    }
];
const SHOP_ITEM_MAP = Object.fromEntries(SHOP_ITEMS.map(it => [it.id, it]));
const SHOP_SLOTS = ['shirt', 'pants', 'face', 'hat'];
const SHOP_SLOT_LABELS = { shirt: 'Tričko', pants: 'Kalhoty', face: 'Obličej', hat: 'Čepice' };

// Keep only ids that exist in the catalog and match their slot (also guards multiplayer packets)
function sanitizeOutfit(raw) {
    const out = { shirt: null, pants: null, face: DEFAULT_FACE_ID, hat: null };
    if (raw && typeof raw === 'object') {
        SHOP_SLOTS.forEach(slot => {
            const item = SHOP_ITEM_MAP[raw[slot]];
            if (item && item.slot === slot) out[slot] = item.id;
        });
    }
    return out;
}

function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
}

let ownedShopItems = new Set([DEFAULT_FACE_ID, ...(Array.isArray(loadJSON(STORAGE_KEY_OWNED, [])) ? loadJSON(STORAGE_KEY_OWNED, []) : [])].filter(id => SHOP_ITEM_MAP[id]));
let avatarOutfit = sanitizeOutfit(loadJSON(STORAGE_KEY_OUTFIT, null));
// Never wear something that isn't owned (e.g. after a manual localStorage edit)
SHOP_SLOTS.forEach(slot => { if (avatarOutfit[slot] && !ownedShopItems.has(avatarOutfit[slot])) avatarOutfit[slot] = slot === 'face' ? DEFAULT_FACE_ID : null; });

function saveShopState() {
    localStorage.setItem(STORAGE_KEY_OWNED, JSON.stringify([...ownedShopItems]));
    localStorage.setItem(STORAGE_KEY_OUTFIT, JSON.stringify(avatarOutfit));
    syncAccountToServer();
}

function createShirtTexture(item, baseHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseHex || '#0D69AC';
    ctx.fillRect(0, 0, 256, 256);
    item.draw(ctx);
    return new THREE.CanvasTexture(canvas);
}

function disposeObject3D(obj) {
    obj.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
                if (m.map) m.map.dispose();
                m.dispose();
            });
        }
    });
}

function addPreviewLights(targetScene) {
    targetScene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 0.75);
    key.position.set(4, 8, -10);
    targetScene.add(key);
    const rim = new THREE.DirectionalLight(0x9fd8ff, 0.35);
    rim.position.set(-6, 4, 8);
    targetScene.add(rim);
}

// --- Shop UI state ---
const shopState = {
    category: 'all',
    selectedId: null,
    renderer: null,
    scene: null,
    camera: null,
    avatar: null,
    rotY: 0,
    dragging: false,
    lastX: 0,
    rafId: null,
    lastTime: 0,
    thumbs: {}
};

function getTryOnOutfit() {
    const sel = shopState.selectedId ? SHOP_ITEM_MAP[shopState.selectedId] : null;
    if (!sel) return avatarOutfit;
    return Object.assign({}, avatarOutfit, { [sel.slot]: sel.id });
}

function generateShopThumbnails() {
    const pending = SHOP_ITEMS.filter(it => !shopState.thumbs[it.id]);
    if (pending.length === 0) return;

    // Faces are plain 2D canvases – no WebGL needed
    pending.filter(it => it.slot === 'face').forEach(it => {
        shopState.thumbs[it.id] = createFaceCanvas(false, it.id).toDataURL();
    });

    const meshItems = pending.filter(it => it.slot !== 'face');
    if (meshItems.length === 0) return;
    let thumbRenderer;
    try {
        thumbRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
        return;
    }
    thumbRenderer.setSize(192, 192);
    const thumbScene = new THREE.Scene();
    addPreviewLights(thumbScene);
    const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 50);

    meshItems.forEach(it => {
        const outfit = sanitizeOutfit({ [it.slot]: it.id });
        const mesh = createBlockyCharacterMesh({ outfit, torsoColor: 0x0D69AC });
        mesh.root.rotation.y = it.slot === 'hat' ? 0.5 : 0.35;
        thumbScene.add(mesh.root);
        if (it.slot === 'hat') {
            cam.position.set(1.4, 4.4, -3.6);
            cam.lookAt(0, 3.75, 0);
        } else if (it.slot === 'shirt') {
            cam.position.set(0.9, 2.3, -4.6);
            cam.lookAt(0, 1.85, 0);
        } else {
            cam.position.set(0.9, 1.0, -4.4);
            cam.lookAt(0, 0.5, 0);
        }
        thumbRenderer.render(thumbScene, cam);
        shopState.thumbs[it.id] = thumbRenderer.domElement.toDataURL();
        thumbScene.remove(mesh.root);
        disposeObject3D(mesh.root);
    });
    thumbRenderer.dispose();
    if (thumbRenderer.forceContextLoss) thumbRenderer.forceContextLoss();
}

function initShopPreview() {
    if (shopState.renderer) return true;
    const canvas = document.getElementById('shop-preview-canvas');
    try {
        shopState.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
        return false;
    }
    shopState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    shopState.scene = new THREE.Scene();
    addPreviewLights(shopState.scene);
    shopState.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    shopState.camera.position.set(0, 2.6, -11);
    shopState.camera.lookAt(0, 2.0, 0);

    const floor = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 2.1, 0.12, 40),
        new THREE.MeshStandardMaterial({ color: 0x2C2F33, roughness: 0.8 })
    );
    floor.position.y = -0.62;
    shopState.scene.add(floor);

    canvas.addEventListener('pointerdown', e => {
        shopState.dragging = true;
        shopState.lastX = e.clientX;
        canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
        if (!shopState.dragging) return;
        shopState.rotY += (e.clientX - shopState.lastX) * 0.012;
        shopState.lastX = e.clientX;
    });
    const stopDrag = () => { shopState.dragging = false; };
    canvas.addEventListener('pointerup', stopDrag);
    canvas.addEventListener('pointercancel', stopDrag);
    return true;
}

function rebuildShopPreviewAvatar() {
    if (!shopState.scene) return;
    if (shopState.avatar) {
        shopState.scene.remove(shopState.avatar.root);
        disposeObject3D(shopState.avatar.root);
    }
    shopState.avatar = createBlockyCharacterMesh({ outfit: getTryOnOutfit() });
    shopState.avatar.root.position.y = -0.56;
    shopState.avatar.leftArmPivot.rotation.z = -0.12;
    shopState.avatar.rightArmPivot.rotation.z = 0.12;
    shopState.scene.add(shopState.avatar.root);
}

function shopPreviewLoop(now) {
    shopState.rafId = requestAnimationFrame(shopPreviewLoop);
    const dt = Math.min(0.05, (now - (shopState.lastTime || now)) / 1000);
    shopState.lastTime = now;
    const canvas = shopState.renderer.domElement;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w && h && (canvas.width !== Math.floor(w * shopState.renderer.getPixelRatio()) || canvas.height !== Math.floor(h * shopState.renderer.getPixelRatio()))) {
        shopState.renderer.setSize(w, h, false);
        shopState.camera.aspect = w / h;
        shopState.camera.updateProjectionMatrix();
    }
    if (!shopState.dragging) shopState.rotY += dt * 0.6;
    if (shopState.avatar) {
        shopState.avatar.root.rotation.y = shopState.rotY;
        shopState.avatar.root.position.y = -0.56 + Math.sin(now / 600) * 0.04;
    }
    shopState.renderer.render(shopState.scene, shopState.camera);
}

function openShopModal(category) {
    closeAvatarPreviewModal();
    const modal = document.getElementById('shop-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (category) shopState.category = category;
    shopState.selectedId = null;
    generateShopThumbnails();
    if (initShopPreview()) {
        rebuildShopPreviewAvatar();
        if (!shopState.rafId) {
            shopState.lastTime = 0;
            shopState.rafId = requestAnimationFrame(shopPreviewLoop);
        }
    }
    renderShop();
}

function closeShopModal() {
    const modal = document.getElementById('shop-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if (shopState.rafId) {
        cancelAnimationFrame(shopState.rafId);
        shopState.rafId = null;
    }
    shopState.selectedId = null;
    renderGameCatalog();
}

function setShopCategory(cat) {
    shopState.category = cat;
    renderShop();
}

function selectShopItem(id) {
    shopState.selectedId = shopState.selectedId === id ? null : id;
    rebuildShopPreviewAvatar();
    renderShop();
}

function buyShopItem(id) {
    const item = SHOP_ITEM_MAP[id];
    if (!item || ownedShopItems.has(id)) return;
    if (bobuxBalance < item.price) {
        showShopToast(`Chybí ti ${(item.price - bobuxBalance).toLocaleString('cs-CZ')} B$. Zahraj si nějakou hru!`, 'error');
        return;
    }
    bobuxBalance -= item.price;
    localStorage.setItem(STORAGE_KEY_BOBUX, String(bobuxBalance));
    updateBobuxUI();
    ownedShopItems.add(id);
    avatarOutfit[item.slot] = id;
    saveShopState();
    sfx.playCoin();
    showShopToast(`Koupeno a nasazeno: ${item.name}!`, 'success');
    rebuildShopPreviewAvatar();
    renderShop();
}

function equipShopItem(id) {
    const item = SHOP_ITEM_MAP[id];
    if (!item || !ownedShopItems.has(id)) return;
    avatarOutfit[item.slot] = id;
    saveShopState();
    sfx.playCoin();
    rebuildShopPreviewAvatar();
    renderShop();
}

function unequipShopSlot(slot) {
    if (!SHOP_SLOTS.includes(slot)) return;
    avatarOutfit[slot] = slot === 'face' ? DEFAULT_FACE_ID : null;
    if (shopState.selectedId && SHOP_ITEM_MAP[shopState.selectedId].slot === slot) shopState.selectedId = null;
    saveShopState();
    rebuildShopPreviewAvatar();
    renderShop();
}

let shopToastTimer = null;
function showShopToast(text, kind) {
    const el = document.getElementById('shop-toast');
    if (!el) return;
    el.textContent = text;
    el.className = 'text-xs font-semibold px-3 py-2 rounded-lg ' + (kind === 'error'
        ? 'bg-red-500/15 text-red-300 border border-red-500/40'
        : 'bg-[#00B06F]/15 text-[#4ADE80] border border-[#00B06F]/40');
    clearTimeout(shopToastTimer);
    shopToastTimer = setTimeout(() => { el.className = 'hidden'; }, 2600);
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderShop() {
    // Category tabs
    document.querySelectorAll('.shop-tab').forEach(btn => {
        const active = btn.getAttribute('data-cat') === shopState.category;
        btn.className = 'shop-tab px-3 py-1.5 rounded-lg text-xs font-semibold transition ' + (active
            ? 'bg-[#00A2FF] text-white'
            : 'bg-[#191B1D] hover:bg-[#2C2F33] text-gray-300 border border-[#393B3D]');
    });

    const balanceEl = document.getElementById('shop-bobux-count');
    if (balanceEl) balanceEl.textContent = `${bobuxBalance.toLocaleString('cs-CZ')} B$`;

    // Item grid
    const items = SHOP_ITEMS.filter(it => {
        if (shopState.category === 'all') return true;
        if (shopState.category === 'owned') return ownedShopItems.has(it.id);
        return it.category === shopState.category;
    });
    const grid = document.getElementById('shop-grid');
    grid.innerHTML = items.length ? items.map(it => {
        const owned = ownedShopItems.has(it.id);
        const equipped = avatarOutfit[it.slot] === it.id;
        const selected = shopState.selectedId === it.id;
        const badge = equipped
            ? '<span class="text-[11px] font-bold text-[#00B06F]">✓ Nasazeno</span>'
            : owned
                ? '<span class="text-[11px] font-bold text-gray-400">Vlastníš</span>'
                : `<span class="text-[11px] font-bold text-[#FFE066]">${it.price === 0 ? 'ZDARMA' : it.price.toLocaleString('cs-CZ') + ' B$'}</span>`;
        const thumb = shopState.thumbs[it.id];
        return `
            <button onclick="selectShopItem('${it.id}')" class="text-left rounded-xl overflow-hidden border-2 transition ${selected ? 'border-[#00A2FF] bg-[#2C2F33]' : equipped ? 'border-[#00B06F]/60 bg-[#191B1D]' : 'border-[#393B3D] bg-[#191B1D] hover:border-[#5A5D61]'}">
                <div class="aspect-square bg-gradient-to-b from-[#2C2F33] to-[#1E2022] flex items-center justify-center">
                    ${thumb ? `<img src="${thumb}" alt="${escapeHtml(it.name)}" class="w-full h-full object-contain ${it.slot === 'face' ? 'p-5' : ''}">` : `<span class="text-xs text-gray-500">${SHOP_SLOT_LABELS[it.slot]}</span>`}
                </div>
                <div class="p-2 space-y-0.5">
                    <div class="text-xs font-bold text-white truncate">${escapeHtml(it.name)}</div>
                    <div class="flex items-center justify-between gap-1">
                        <span class="text-[10px] uppercase text-gray-500">${SHOP_SLOT_LABELS[it.slot]}</span>
                        ${badge}
                    </div>
                </div>
            </button>`;
    }).join('') : '<div class="col-span-full text-sm text-gray-400 py-10 text-center">Zatím tu nic nemáš. Kup si něco v ostatních kategoriích!</div>';

    // Selected item action panel
    const panel = document.getElementById('shop-action-panel');
    const sel = shopState.selectedId ? SHOP_ITEM_MAP[shopState.selectedId] : null;
    if (!sel) {
        panel.innerHTML = '<div class="text-xs text-gray-400">Klikni na předmět a vyzkoušej si ho na avatarovi.</div>';
    } else {
        const owned = ownedShopItems.has(sel.id);
        const equipped = avatarOutfit[sel.slot] === sel.id;
        const canAfford = bobuxBalance >= sel.price;
        let btn;
        if (equipped) {
            btn = sel.id === DEFAULT_FACE_ID
                ? '<button disabled class="w-full px-4 py-2.5 rounded-xl bg-[#393B3D] text-sm font-bold text-gray-400">Nasazeno</button>'
                : `<button onclick="unequipShopSlot('${sel.slot}')" class="w-full px-4 py-2.5 rounded-xl bg-[#393B3D] hover:bg-[#4B4E52] text-sm font-bold text-white transition">Sundat</button>`;
        } else if (owned) {
            btn = `<button onclick="equipShopItem('${sel.id}')" class="w-full px-4 py-2.5 rounded-xl bg-[#00A2FF] hover:bg-[#008BDB] text-sm font-bold text-white transition">Nasadit</button>`;
        } else {
            btn = `<button onclick="buyShopItem('${sel.id}')" class="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white transition ${canAfford ? 'btn-play-green' : 'bg-[#393B3D] text-gray-400'}">Koupit za ${sel.price.toLocaleString('cs-CZ')} B$</button>`;
        }
        panel.innerHTML = `
            <div>
                <div class="text-sm font-bold text-white">${escapeHtml(sel.name)}</div>
                <div class="text-xs text-gray-400 mt-0.5">${escapeHtml(sel.desc || '')}</div>
            </div>
            ${btn}`;
    }

    // Currently worn list
    const worn = document.getElementById('shop-worn-list');
    worn.innerHTML = SHOP_SLOTS.map(slot => {
        const it = avatarOutfit[slot] ? SHOP_ITEM_MAP[avatarOutfit[slot]] : null;
        const removable = it && !(slot === 'face' && it.id === DEFAULT_FACE_ID);
        return `
            <div class="flex items-center justify-between gap-2 text-xs">
                <span class="text-gray-500 w-16 shrink-0">${SHOP_SLOT_LABELS[slot]}</span>
                <span class="flex-1 truncate ${it ? 'text-white font-semibold' : 'text-gray-500'}">${it ? escapeHtml(it.name) : '—'}</span>
                ${removable ? `<button onclick="unequipShopSlot('${slot}')" title="Sundat" class="text-gray-400 hover:text-red-400">✕</button>` : ''}
            </div>`;
    }).join('');
}

