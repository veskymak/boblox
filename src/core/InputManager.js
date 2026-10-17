/* ============================================================================
 * 14. EVENT LISTENERS: ROBLOX-STYLE MOBILE TOUCH, WEAPON SWITCHING & CAMERA
 * ============================================================================ */
function initMobileTouchControls() {
    const joyZone = document.getElementById('touch-joystick-zone') || document.getElementById('roblox-joystick-zone');
    const joyBase = document.getElementById('touch-joystick-base') || document.getElementById('roblox-joystick-base');
    const joyKnob = document.getElementById('touch-joystick-knob') || document.getElementById('roblox-joystick-knob');
    const lookZone = document.getElementById('roblox-camera-touch-zone');
    const jumpBtn = document.getElementById('touch-jump-btn') || document.getElementById('roblox-jump-btn');
    const actionBtn = document.getElementById('touch-action-btn') || document.getElementById('roblox-action-btn');

    const maxRadius = 46;

    function updateJoystickVisual(dx, dy) {
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(maxRadius, dist);
        const angle = Math.atan2(dy, dx);
        const kx = Math.cos(angle) * clampedDist;
        const ky = Math.sin(angle) * clampedDist;

        if (joyKnob) {
            joyKnob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
        }
        // Normalized X/Y vector (-1..1) with amplitude proportional to tilt
        touchState.joyX = kx / maxRadius;
        touchState.joyY = ky / maxRadius;
    }

    function resetJoystick() {
        touchState.joyTouchId = null;
        touchState.joyX = 0;
        touchState.joyY = 0;
        if (joyKnob) joyKnob.style.transform = 'translate(-50%, -50%)';
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
    // Allow Escape to close chat input or toggle ESC menu
    const activeEl = document.activeElement;
    const tag = activeEl ? activeEl.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.code === 'Escape') {
            activeEl.blur();
        }
        return;
    }

    if (!activeGameMode) return;

    // 1. Escape key opens/closes authentic Roblox ESC Experience Menu
    if (e.code === 'Escape') {
        e.preventDefault();
        toggleRobloxEscMenu();
        return;
    }

    // 2. When Roblox ESC Menu is open: handle [L] Leave and [R] Respawn shortcuts
    if (typeof robloxUiState !== 'undefined' && robloxUiState.isMenuOpen) {
        if (e.code === 'KeyL') {
            e.preventDefault();
            leaveFromRobloxMenu();
        } else if (e.code === 'KeyR') {
            e.preventDefault();
            respawnFromRobloxMenu();
        }
        return;
    }

    keysPressed[e.code] = true;

    // 3. Shift Lock Switch (Pressing Left/Right Shift locks/unlocks mouse pointer)
    if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
        e.preventDefault();
        if (typeof toggleRobloxShiftLock === 'function') {
            toggleRobloxShiftLock();
        }
        return;
    }

    // 4. Roblox Help Tab Shortcuts (Tab = Leaderboard, / or - = Chat, ; or ` = Backpack, I/O = Zoom)
    if (e.code === 'Tab') {
        e.preventDefault();
        toggleRobloxPlayerList();
        return;
    }
    if (e.code === 'Slash' || e.code === 'Minus') {
        e.preventDefault();
        if (!robloxUiState.isChatOpen) {
            toggleRobloxChat(true);
        } else {
            document.getElementById('roblox-chat-input')?.focus();
        }
        return;
    }
    if (e.code === 'Semicolon' || e.code === 'Backquote') {
        const bp = document.getElementById('hud-backpack-container');
        if (bp) bp.classList.toggle('hidden');
        return;
    }
    if (e.code === 'KeyI') {
        camState.distance = Math.max(4, camState.distance - 2.0);
        return;
    }
    if (e.code === 'KeyO') {
        camState.distance = Math.min(28, camState.distance + 2.0);
        return;
    }
    if (e.code === 'F10' || (e.ctrlKey && e.shiftKey && e.code === 'F7')) {
        e.preventDefault();
        toggleRobloxPerfStats();
        return;
    }
    if (e.altKey && (e.code === 'Equal' || e.code === 'NumpadAdd')) {
        e.preventDefault();
        captureRobloxScreenshot();
        return;
    }

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

// Keep Shift Lock state & reticle synced with browser Pointer Lock state
document.addEventListener('pointerlockchange', () => {
    const isLocked = document.pointerLockElement === canvasEl;
    if (typeof robloxUiState !== 'undefined') {
        robloxUiState.isShiftLocked = isLocked;
        const reticle = document.getElementById('roblox-shiftlock-reticle');
        if (reticle) {
            reticle.classList.toggle('hidden', !isLocked);
        }
    }
});

canvasEl.addEventListener('contextmenu', (e) => {
    if (activeGameMode) e.preventDefault();
});

canvasEl.addEventListener('pointerdown', (e) => {
    if (!activeGameMode) return;
    if (typeof robloxUiState !== 'undefined' && robloxUiState.isMenuOpen) return;
    canvasEl.focus();

    if (e.button === 0) {
        // Left Mouse Button: Use equipped tool / attack ONLY (never drags camera)
        triggerPrimaryAction();
    } else if (e.button === 2) {
        // Right Mouse Button: Hold & drag to rotate camera when not in Shift Lock
        camState.isDragging = true;
        camState.lastMouseX = e.clientX;
        camState.lastMouseY = e.clientY;
        if (canvasEl.setPointerCapture && e.pointerId !== undefined) {
            try { canvasEl.setPointerCapture(e.pointerId); } catch (err) {}
        }
    }
});

window.addEventListener('pointerup', (e) => {
    if (e.button === 2 || e.buttons === 0) {
        camState.isDragging = false;
        if (canvasEl.releasePointerCapture && e.pointerId !== undefined) {
            try { canvasEl.releasePointerCapture(e.pointerId); } catch (err) {}
        }
    }
});

window.addEventListener('mousemove', (e) => {
    if (!activeGameMode) return;
    if (typeof robloxUiState !== 'undefined' && robloxUiState.isMenuOpen) return;

    if (document.pointerLockElement === canvasEl) {
        // Shift Lock active: mouse movement directly rotates camera
        camState.yaw -= e.movementX * 0.0045;
        camState.pitch = Math.max(0.08, Math.min(1.35, camState.pitch + e.movementY * 0.0045));
    } else if (camState.isDragging) {
        // Right Mouse Button held: drag rotates camera while cursor remains visible
        const dx = e.clientX - camState.lastMouseX;
        const dy = e.clientY - camState.lastMouseY;
        camState.lastMouseX = e.clientX;
        camState.lastMouseY = e.clientY;
        camState.yaw -= dx * 0.0065;
        camState.pitch = Math.max(0.08, Math.min(1.35, camState.pitch + dy * 0.0065));
    }
});

// Mouse Wheel: Zoom camera in/out
canvasEl.addEventListener('wheel', (e) => {
    if (!activeGameMode) return;
    if (typeof robloxUiState !== 'undefined' && robloxUiState.isMenuOpen) return;
    camState.distance = Math.max(4, Math.min(28, camState.distance + e.deltaY * 0.012));
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
