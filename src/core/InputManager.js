/* ============================================================================
 * 14. EVENT LISTENERS: ROBLOX-STYLE MOBILE TOUCH, WEAPON SWITCHING & CAMERA
 * ============================================================================ */
function initMobileTouchControls() {
    const joyZone = document.getElementById('roblox-joystick-zone');
    const joyBase = document.getElementById('roblox-joystick-base');
    const joyKnob = document.getElementById('roblox-joystick-knob');
    const lookZone = document.getElementById('roblox-camera-touch-zone');
    const jumpBtn = document.getElementById('roblox-jump-btn');
    const actionBtn = document.getElementById('roblox-action-btn');

    const maxRadius = 46;

    function updateJoystickVisual(dx, dy) {
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(maxRadius, dist);
        const angle = Math.atan2(dy, dx);
        const kx = Math.cos(angle) * clampedDist;
        const ky = Math.sin(angle) * clampedDist;

        if (joyKnob) {
            joyKnob.style.transform = `translate(${kx}px, ${ky}px)`;
        }
        // Normalized X/Y vector (-1..1) with amplitude proportional to tilt
        touchState.joyX = kx / maxRadius;
        touchState.joyY = ky / maxRadius;
    }

    function resetJoystick() {
        touchState.joyTouchId = null;
        touchState.joyX = 0;
        touchState.joyY = 0;
        if (joyKnob) joyKnob.style.transform = 'translate(0px, 0px)';
        if (joyBase) {
            joyBase.style.left = '24px';
            joyBase.style.bottom = '24px';
            joyBase.style.top = 'auto';
        }
    }

    if (joyZone) {
        joyZone.addEventListener('touchstart', (e) => {
            if (!activeGameMode) return;
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (touchState.joyTouchId === null) {
                    touchState.joyTouchId = t.identifier;
                    const rect = joyBase.getBoundingClientRect();
                    touchState.joyOriginX = rect.left + rect.width / 2;
                    touchState.joyOriginY = rect.top + rect.height / 2;
                    updateJoystickVisual(t.clientX - touchState.joyOriginX, t.clientY - touchState.joyOriginY);
                    break;
                }
            }
        }, { passive: false });

        joyZone.addEventListener('touchmove', (e) => {
            if (!activeGameMode || touchState.joyTouchId === null) return;
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === touchState.joyTouchId) {
                    updateJoystickVisual(t.clientX - touchState.joyOriginX, t.clientY - touchState.joyOriginY);
                    break;
                }
            }
        }, { passive: false });

        const endJoy = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchState.joyTouchId) {
                    e.preventDefault();
                    resetJoystick();
                    break;
                }
            }
        };
        joyZone.addEventListener('touchend', endJoy, { passive: false });
        joyZone.addEventListener('touchcancel', endJoy, { passive: false });
    }

    // Right-Half Screen Touch Swipe for Smooth Camera Pitch/Yaw Rotation
    if (lookZone) {
        lookZone.addEventListener('touchstart', (e) => {
            if (!activeGameMode) return;
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (touchState.lookTouchId === null) {
                    touchState.lookTouchId = t.identifier;
                    touchState.lookLastX = t.clientX;
                    touchState.lookLastY = t.clientY;
                    break;
                }
            }
        }, { passive: false });

        lookZone.addEventListener('touchmove', (e) => {
            if (!activeGameMode || touchState.lookTouchId === null) return;
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === touchState.lookTouchId) {
                    const dx = t.clientX - touchState.lookLastX;
                    const dy = t.clientY - touchState.lookLastY;
                    touchState.lookLastX = t.clientX;
                    touchState.lookLastY = t.clientY;
                    camState.yaw -= dx * 0.0075;
                    camState.pitch = Math.max(0.08, Math.min(1.35, camState.pitch + dy * 0.0075));
                    break;
                }
            }
        }, { passive: false });

        const endLook = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchState.lookTouchId) {
                    e.preventDefault();
                    touchState.lookTouchId = null;
                    break;
                }
            }
        };
        lookZone.addEventListener('touchend', endLook, { passive: false });
        lookZone.addEventListener('touchcancel', endLook, { passive: false });
    }

    // Dedicated Circular Jump Button (Bottom Right)
    if (jumpBtn) {
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            touchState.jumpPressed = true;
            jumpBtn.classList.add('pressed');
        }, { passive: false });

        const releaseJump = (e) => {
            e.preventDefault();
            e.stopPropagation();
            touchState.jumpPressed = false;
            jumpBtn.classList.remove('pressed');
        };
        jumpBtn.addEventListener('touchend', releaseJump, { passive: false });
        jumpBtn.addEventListener('touchcancel', releaseJump, { passive: false });
    }

    // Dedicated Circular Action / Attack Button (Bottom Right)
    if (actionBtn) {
        actionBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            actionBtn.classList.add('pressed');
            triggerPrimaryAction();
        }, { passive: false });

        const releaseAction = (e) => {
            e.preventDefault();
            e.stopPropagation();
            actionBtn.classList.remove('pressed');
        };
        actionBtn.addEventListener('touchend', releaseAction, { passive: false });
        actionBtn.addEventListener('touchcancel', releaseAction, { passive: false });
    }
}

window.addEventListener('keydown', (e) => {
    // Do not hijack keys when typing in an input or textarea
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    keysPressed[e.code] = true;
    if (e.code === 'Escape' && activeGameMode) {
        returnToLobby();
        return;
    }
    if (!activeGameMode) return;

    // Weapon Switching via Keys 1–9 and Numpad 1–9 (Task #7 Bugfix)
    if (e.code.startsWith('Digit') || e.code.startsWith('Numpad')) {
        const num = parseInt(e.code.replace('Digit', '').replace('Numpad', ''), 10);
        if (num >= 1 && num <= 9) {
            if (num <= playerState.weaponLoadout.length) {
                equipWeaponSlot(num - 1);
            }
            return;
        }
    }

    if (e.code === 'KeyF') {
        reloadCurrentWeapon();
    } else if (e.code === 'KeyR') {
        respawnPlayerManual();
    } else if (e.code === 'KeyE') {
        triggerPrimaryAction();
    }
});

window.addEventListener('keyup', (e) => {
    keysPressed[e.code] = false;
});

const canvasEl = document.getElementById('three-canvas');

canvasEl.addEventListener('mousedown', (e) => {
    if (!activeGameMode) return;
    camState.isDragging = true;
    camState.lastMouseX = e.clientX;
    camState.lastMouseY = e.clientY;

    if (e.button === 0) {
        triggerPrimaryAction();
    }
});

window.addEventListener('mouseup', () => {
    camState.isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (!activeGameMode) return;
    if (document.pointerLockElement === canvasEl) {
        camState.yaw -= e.movementX * 0.0045;
        camState.pitch = Math.max(0.08, Math.min(1.35, camState.pitch + e.movementY * 0.0045));
    } else if (camState.isDragging) {
        const dx = e.clientX - camState.lastMouseX;
        const dy = e.clientY - camState.lastMouseY;
        camState.lastMouseX = e.clientX;
        camState.lastMouseY = e.clientY;
        camState.yaw -= dx * 0.0065;
        camState.pitch = Math.max(0.08, Math.min(1.35, camState.pitch + dy * 0.0065));
    }
});

canvasEl.addEventListener('dblclick', () => {
    if (activeGameMode && canvasEl.requestPointerLock) {
        canvasEl.requestPointerLock();
    }
});

// Mouse Wheel: Switch Weapons in Hotbar (or hold Shift + Wheel to zoom camera)
canvasEl.addEventListener('wheel', (e) => {
    if (!activeGameMode) return;
    if (e.shiftKey) {
        camState.distance = Math.max(6, Math.min(28, camState.distance + e.deltaY * 0.01));
    } else if (playerState.weaponLoadout && playerState.weaponLoadout.length > 1) {
        const dir = e.deltaY > 0 ? 1 : -1;
        equipWeaponSlot(playerState.activeWeaponSlot + dir);
    }
}, { passive: true });

window.addEventListener('resize', () => {
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize Boblox Portal on Window Load
window.onload = function () {
    updateNickname(mpState.nickname);
    updateBobuxUI();
    updateDailyBonusUI();
    setMatchmakingMode('public');
    initMobileTouchControls();
    initAuthSession();
    initLiveSocketAndPresence();
    renderGameCatalog();
};
