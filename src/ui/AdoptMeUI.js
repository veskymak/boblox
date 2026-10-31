/* Adopt Me interface. Progress belongs to GameWorlds / account sync; UI state is ephemeral. */
const ADOPT_ME_PLACES = [
    { name: 'Škola pro mazlíčky', icon: '🎓', x: -16, z: -28, need: 'school' },
    { name: 'Kemp u táboráku', icon: '🏕️', x: 16, z: -28, need: 'camping' },
    { name: 'Nursery · vajíčka', icon: '🥚', x: 0, z: -16.5 },
    { name: 'Miska s jídlem', icon: '🍎', x: -5.5, z: -8, need: 'hungry' },
    { name: 'Pitná fontána', icon: '💧', x: 5.5, z: -8, need: 'thirsty' },
    { name: 'Útulné postýlky', icon: '💤', x: -19, z: -16, need: 'sleepy' },
    { name: 'Horké prameny', icon: '🛁', x: 19, z: -16, need: 'dirty' },
    { name: 'Nemocnice', icon: '🏥', x: -14.5, z: 1, need: 'sick' },
    { name: 'Hřiště', icon: '🛝', x: 20, z: 1, need: 'bored' },
    { name: 'Domov a Money Tree', icon: '🏡', x: -3, z: 34 }
];

function mountAdoptMeUI() {
    unmountAdoptMeUI();
    const root = document.createElement('section');
    root.id = 'adoptme-ui';
    root.setAttribute('aria-label', 'Adopt Me herní panel');
    root.innerHTML = `<div class="adopt-toolbar">
        <button class="min-h-[44px]" data-tab="care">🐾 Péče</button>
        <button class="min-h-[44px]" data-tab="pets">🎒 Mazlíčci</button>
        <button class="min-h-[44px]" data-tab="atlas">📖 Atlas</button>
        <button class="min-h-[44px]" data-tab="map">🧭 Mapa</button>
        <button class="min-h-[44px]" data-tab="help" aria-label="Nápověda">?</button>
    </div><div id="adoptme-panel" hidden></div><div id="adoptme-route" role="status" hidden></div>`;
    root.addEventListener('pointerdown', e => e.stopPropagation());
    root.addEventListener('click', handleAdoptMeClick);
    document.getElementById('game-viewport').appendChild(root);
    gameSpecificData.adoptTab = null;
}

function unmountAdoptMeUI() {
    const root = document.getElementById('adoptme-ui');
    if (root) root.remove();
}

function handleAdoptMeClick(event) {
    const button = event.target.closest('button');
    if (!button || activeGameMode !== 'adoptme') return;
    const gd = gameSpecificData;
    if (button.dataset.tab) {
        gd.adoptTab = gd.adoptTab === button.dataset.tab ? null : button.dataset.tab;
        if (document.pointerLockElement) document.exitPointerLock();
    } else if (button.dataset.pet !== undefined) {
        selectAdoptMePet(Number(button.dataset.pet));
    } else if (button.dataset.place !== undefined) {
        gd.adoptDestination = ADOPT_ME_PLACES[Number(button.dataset.place)];
        gd.adoptTab = null;
    } else if (button.dataset.care) {
        if (!completeAdoptMeNeed(button.dataset.care)) showHudToast('Mazlíček tuto péči právě nepotřebuje. Vyber místo na mapě!', 'blue');
    } else if (button.dataset.ride) {
        const weapon = playerState.activeWeapon;
        playerState.activeWeapon = WEAPON_DEFINITIONS.pet_ride;
        triggerPrimaryAction();
        playerState.activeWeapon = weapon;
    } else if (button.dataset.close) {
        gd.adoptTab = null;
    } else if (button.dataset.cancel) {
        gd.adoptDestination = null;
    }
    renderAdoptMePanel();
}

function selectAdoptMePet(index) {
    const gd = gameSpecificData;
    if (!Number.isInteger(index) || !gd.pets[index]) return;
    gd.isRidingPet = false;
    playerState.speedMultiplier = 1;
    playerState.jumpMultiplier = 1;
    gd.activePetIdx = index;
    gd.activityTime = 0;
    spawnAdoptMeActivePetMesh();
}

function renderAdoptMePanel() {
    const panel = document.getElementById('adoptme-panel');
    if (!panel || activeGameMode !== 'adoptme') return;
    const gd = gameSpecificData;
    panel.hidden = !gd.adoptTab;
    document.querySelectorAll('#adoptme-ui [data-tab]').forEach(b => b.setAttribute('aria-expanded', String(b.dataset.tab === gd.adoptTab)));
    if (!gd.adoptTab) return;
    const pet = gd.pets[gd.activePetIdx] || gd.pets[0];
    const def = ADOPT_ME_PET_CATALOG[pet.id];
    const unique = new Set(gd.pets.map(p => p.id));
    const button = (attr, label) => `<button class="min-h-[44px]" ${attr}>${label}</button>`;
    const titles = { care: 'Péče o parťáka', pets: 'Moji mazlíčci', atlas: 'Atlas ostrova', map: 'Kam vyrazíme?', help: 'Vítej na Adoption Island' };
    let content = '';
    if (gd.adoptTab === 'care') {
        const tasks = Math.min(10, pet.tasksDone || 0);
        content = `<div class="adopt-hero"><span>${def.icon}</span><div><h3>${def.name}</h3><p>${def.rarity} · ${ADOPT_ME_AGE_STAGES[pet.ageIdx || 0]}</p></div></div>
            <label>Růst do NEON podoby · ${tasks}/10 úkolů<progress max="10" value="${tasks}"></progress></label>
            <div class="adopt-card"><strong>${gd.currentNeed ? gd.currentNeed.name : '💚 Spokojený mazlíček'}</strong><p>${gd.currentNeed ? gd.currentNeed.hint : 'Další potřeba se objeví za chvíli. Mezitím prozkoumej ostrov.'}</p>
            ${gd.currentNeed ? `<p>Odměna: $${gd.currentNeed.bucks} Bucks + <span class="text-[#FFE066]">${gd.currentNeed.bobux} B$</span></p>` : ''}</div>
            <div class="adopt-grid">${button('data-care="hungry"', '🍎 Nakrmit')}${button('data-care="thirsty"', '💧 Napojit')}${button('data-ride="true"', gd.isRidingPet ? '🐾 Sesednout' : '🪽 Letět / jet')}${button('data-tab="map"', '🧭 Najít stanoviště')}</div>`;
    } else if (gd.adoptTab === 'pets') {
        content = `<p>${gd.pets.length}/200 mazlíčků · ${unique.size}/${Object.keys(ADOPT_ME_PET_CATALOG).length} druhů</p><div class="adopt-grid">` + gd.pets.map((p, i) => {
            const d = ADOPT_ME_PET_CATALOG[p.id];
            return button(`data-pet="${i}" aria-pressed="${i === gd.activePetIdx}"`, `${d.icon} ${d.name}<small>${d.rarity} · ${Math.min(10, p.tasksDone || 0)}/10 péče${i === gd.activePetIdx ? ' · VYBRÁN' : ''}</small>`);
        }).join('') + '</div>';
    } else if (gd.adoptTab === 'atlas') {
        content = `<p>Objeveno ${unique.size}/${Object.keys(ADOPT_ME_PET_CATALOG).length} druhů. Vejce najdeš v Nursery.</p><div class="adopt-grid">` + Object.values(ADOPT_ME_PET_CATALOG).map(d => `<div class="adopt-card">${d.icon} <strong>${d.name}</strong><small>${d.rarity} · ${unique.has(d.id) ? '✓ Ve sbírce' : 'Ještě neobjeven'}</small></div>`).join('') + '</div><h3>Průvodce vejci</h3>' + gd.eggStands.map(s => {
            const total = s.pool.reduce((sum, p) => sum + p.weight, 0);
            return `<div class="adopt-card"><strong>${s.name}</strong><p>${s.pool.map(p => `${ADOPT_ME_PET_CATALOG[p.id].icon} ${Math.round(p.weight / total * 100)} %`).join(' · ')}</p></div>`;
        }).join('');
    } else if (gd.adoptTab === 'map') {
        content = '<p>Vyber místo a sleduj směr a vzdálenost. Pohyb zůstává na tobě.</p><div class="adopt-grid">' + ADOPT_ME_PLACES.map((p, i) => button(`data-place="${i}"`, `${p.icon} ${p.name}${gd.currentNeed && p.need === gd.currentNeed.id ? '<small>★ Aktuální potřeba</small>' : ''}`)).join('') + '</div>';
    } else {
        content = '<div class="adopt-card"><strong>1 · Postarej se o mazlíčka</strong><p>Krmení a pití zvládneš zde. Spánek, koupel, nemoc a zábavu vyřešíš na stanovištích. Každé dva úkoly mazlíčka posunou ve vývoji.</p></div><div class="adopt-card"><strong>2 · Rozšiř sbírku</strong><p>Bucks získáš péčí a pravidelnou výplatou. V Nursery se přibliž k vejci a vylíhni nového parťáka. Atlas ukazuje šance i objevené druhy.</p></div><div class="adopt-card"><strong>3 · Prozkoumej ostrov</strong><p>Na PC použij WASD, myš a mezerník. Na mobilu joystick, skok a akci. Sloty 1–4 slouží pro péči, létání a střídání mazlíčků.</p></div><p>Přihlas se pro ukládání sbírky mezi zařízeními. Host má postup jen v tomto prohlížeči.</p>';
    }
    panel.innerHTML = `<header><h2>${titles[gd.adoptTab]}</h2>${button('data-close="true" aria-label="Zavřít panel"', '✕')}</header><div class="adopt-balance">💵 $${gd.bucks} Bucks</div>${content}`;
}

function updateAdoptMeNavigation(dt) {
    const gd = gameSpecificData;
    gd.adoptUITimer = (gd.adoptUITimer || 0) - dt;
    if (gd.adoptUITimer > 0) return;
    gd.adoptUITimer = 0.25;
    const route = document.getElementById('adoptme-route');
    if (!route) return;
    const place = gd.adoptDestination;
    route.hidden = !place;
    if (!place) return;
    const dx = place.x - playerState.pos.x;
    const dz = place.z - playerState.pos.z;
    const distance = Math.hypot(dx, dz);
    const heading = Math.atan2(dx, dz) - camState.yaw;
    const arrival = gd.activityTime > 0 ? `Péče ${Math.min(5, Math.floor(gd.activityTime))}/5 s` : 'Jsi na místě ✓';
    route.innerHTML = `<span style="display:inline-block;transform:rotate(${-heading}rad)">↓</span> ${place.icon} ${place.name} · ${distance < 4 ? arrival : Math.round(distance) + ' m'} <button class="min-h-[44px]" data-cancel="true" aria-label="Zrušit trasu">✕</button>`;
}
