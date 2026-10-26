/* ============================================================================
 * 14. EVENT LISTENERS: ROBLOX-STYLE MOBILE TOUCH, WEAPON SWITCHING & CAMERA
 * ============================================================================ */
let _mobileTouchControlsInitialized = false;

function isMobileOrTouchDevice() {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (window._bobloxTouchDetected === true) ||
           (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
}

function updateMobileControlsVisibility() {
    const overlay = document.getElementById('mobile-touch-controls');
    if (!overlay) return;
    if (activeGameMode && isMobileOrTouchDevice()) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'block';
    } else {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }
}

function initMobileTouchControls() {
    if (_mobileTouchControlsInitialized) {
        updateMobileControlsVisibility();
        return;
    }
    _mobileTouchControlsInitialized = true;

    const moveZone = document.getElementById('touch-move-zone') || document.getElementById('touch-joystick-zone');
    const joyZone = document.getElementById('touch-joystick-zone');
    const joyBase = document.getElementById('touch-joystick-base');
    const joyKnob = document.getElementById('touch-joystick-knob');
    const lookZone = document.getElementById('roblox-camera-touch-zone');
    const jumpBtn = document.getElementById('touch-jump-btn');
    const actionBtn = document.getElementById('touch-action-btn');

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
        if (joyZone) {
            joyZone.style.left = '';
            joyZone.style.top = '';
            joyZone.style.bottom = '';
            joyZone.style.transform = '';
        }
    }

    // Window-level touch detection to auto-enable mobile overlay if user touches screen
    window.addEventListener('touchstart', () => {
        if (!window._bobloxTouchDetected) {
            window._bobloxTouchDetected = true;
            updateMobileControlsVisibility();
        }
    }, { passive: true });

    // 1. Movement & Dynamic Thumbstick Zone (Left half of screen)
    if (moveZone) {
        moveZone.addEventListener('touchstart', (e) => {
            if (!activeGameMode) return;
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (touchState.joyTouchId === null) {
                    touchState.joyTouchId = t.identifier;
                    // Dynamic thumbstick: center joystick base right under player's touch
                    if (joyZone) {
                        joyZone.style.left = `${t.clientX}px`;
                        joyZone.style.top = `${t.clientY}px`;
                        joyZone.style.bottom = 'auto';
                        joyZone.style.transform = 'translate(-50%, -50%)';
                    }
                    touchState.joyOriginX = t.clientX;
                    touchState.joyOriginY = t.clientY;
                    updateJoystickVisual(0, 0);
                    break;
                }
            }
        }, { passive: false });
    }

    // 2. Camera Rotation Swipe Zone (Right half of screen)
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
    }

    // 3. Global Window-Level TouchMove & TouchEnd for unbreakable tracking across screen
    window.addEventListener('touchmove', (e) => {
        if (!activeGameMode) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === touchState.joyTouchId) {
                e.preventDefault();
                updateJoystickVisual(t.clientX - touchState.joyOriginX, t.clientY - touchState.joyOriginY);
            } else if (t.identifier === touchState.lookTouchId) {
                e.preventDefault();
                const dx = t.clientX - touchState.lookLastX;
                const dy = t.clientY - touchState.lookLastY;
                touchState.lookLastX = t.clientX;
                touchState.lookLastY = t.clientY;
                camState.yaw -= dx * 0.007;
                camState.pitch = Math.max(0.08, Math.min(1.35, camState.pitch + dy * 0.007));
            }
        }
    }, { passive: false });

    const handleGlobalTouchEnd = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === touchState.joyTouchId) {
                resetJoystick();
            }
            if (t.identifier === touchState.lookTouchId) {
                touchState.lookTouchId = null;
            }
        }
    };
    window.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleGlobalTouchEnd, { passive: false });

    // 4. Dedicated Circular Jump Button (Bottom Right)
    if (jumpBtn) {
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            touchState.jumpPressed = true;
            jumpBtn.classList.add('touch-active');
        }, { passive: false });

        const releaseJump = (e) => {
            e.preventDefault();
            e.stopPropagation();
            touchState.jumpPressed = false;
            jumpBtn.classList.remove('touch-active');
        };
        jumpBtn.addEventListener('touchend', releaseJump, { passive: false });
        jumpBtn.addEventListener('touchcancel', releaseJump, { passive: false });
    }

    // 5. Dedicated Circular Action / Attack Button (Bottom Right)
    if (actionBtn) {
        actionBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            actionBtn.classList.add('touch-active');
            triggerPrimaryAction();
        }, { passive: false });

        const releaseAction = (e) => {
            e.preventDefault();
            e.stopPropagation();
            actionBtn.classList.remove('touch-active');
        };
        actionBtn.addEventListener('touchend', releaseAction, { passive: false });
        actionBtn.addEventListener('touchcancel', releaseAction, { passive: false });
    }

    updateMobileControlsVisibility();
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
    if (e.key === '/' || e.code === 'Slash' || e.code === 'NumpadDivide' || e.code === 'Minus') {
        e.preventDefault();
        const chatBox = document.getElementById('roblox-chat-box');
        const isHidden = !chatBox || chatBox.classList.contains('hidden');
        if (typeof robloxUiState === 'undefined' || !robloxUiState.isChatOpen || isHidden) {
            if (typeof toggleRobloxChat === 'function') {
                toggleRobloxChat(true, true);
            }
        } else {
            const inp = document.getElementById('roblox-chat-input');
            if (inp) inp.focus();
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

// Sync browser Pointer Lock with Shift Lock reticle and camera dragging
document.addEventListener('pointerlockchange', () => {
    const isLocked = document.pointerLockElement === canvasEl;
    const reticle = document.getElementById('roblox-shiftlock-reticle');
    if (!isLocked) {
        // Pointer was unlocked (via Escape, RMB release, or window blur)
        camState.isDragging = false;
        if (typeof robloxUiState !== 'undefined') {
            robloxUiState.isShiftLocked = false;
        }
        if (reticle) reticle.classList.add('hidden');
    } else {
        // Pointer was locked
        if (reticle) {
            reticle.classList.toggle('hidden', !(typeof robloxUiState !== 'undefined' && robloxUiState.isShiftLocked));
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
        // Right Mouse Button: Lock mouse cursor in place & rotate camera (authentic Roblox behavior)
        e.preventDefault();
        camState.isDragging = true;
        camState.lastMouseX = e.clientX;
        camState.lastMouseY = e.clientY;
        const isShiftLocked = typeof robloxUiState !== 'undefined' && robloxUiState.isShiftLocked;
        if (!isShiftLocked && canvasEl.requestPointerLock && document.pointerLockElement !== canvasEl) {
            try { canvasEl.requestPointerLock(); } catch (err) {}
        }
    }
});

function handleRmbRelease() {
    if (camState.isDragging) {
        camState.isDragging = false;
        const isShiftLocked = typeof robloxUiState !== 'undefined' && robloxUiState.isShiftLocked;
        if (!isShiftLocked && document.pointerLockElement === canvasEl) {
            try { document.exitPointerLock(); } catch (err) {}
        }
    }
}

window.addEventListener('pointerup', (e) => {
    if (e.button === 2 || e.buttons === 0) {
        handleRmbRelease();
    }
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 2 || e.buttons === 0) {
        handleRmbRelease();
    }
});

window.addEventListener('mousemove', (e) => {
    if (!activeGameMode) return;
    if (typeof robloxUiState !== 'undefined' && robloxUiState.isMenuOpen) return;

    const isLocked = document.pointerLockElement === canvasEl;
    if (isLocked) {
        // Cursor is locked in place: camera rotates smoothly with relative movement (mouse does not drift)
        const isShiftLocked = typeof robloxUiState !== 'undefined' && robloxUiState.isShiftLocked;
        if (isShiftLocked || camState.isDragging) {
            const mx = e.movementX || 0;
            const my = e.movementY || 0;
            camState.yaw -= mx * 0.0045;
            camState.pitch = Math.max(0.08, Math.min(1.35, camState.pitch + my * 0.0045));
        }
    } else if (camState.isDragging) {
        // Fallback before pointer lock resolves or if blocked
        const dx = e.movementX !== undefined && Math.abs(e.movementX) > 0 ? e.movementX : (e.clientX - camState.lastMouseX);
        const dy = e.movementY !== undefined && Math.abs(e.movementY) > 0 ? e.movementY : (e.clientY - camState.lastMouseY);
        camState.lastMouseX = e.clientX;
        camState.lastMouseY = e.clientY;
        camState.yaw -= dx * 0.0055;
        camState.pitch = Math.max(0.08, Math.min(1.35, camState.pitch + dy * 0.0055));
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

// Initialize Boblox Portal reliably on Window / DOM Load
let _bobloxPortalBooted = false;
function bootBobloxPortal() {
    if (_bobloxPortalBooted) return;
    _bobloxPortalBooted = true;
    updateNickname(mpState.nickname);
    updateBobuxUI();
    updateDailyBonusUI();
    setMatchmakingMode('public');
    initMobileTouchControls();
    initAuthSession();
    initLiveSocketAndPresence();
    renderGameCatalog();
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootBobloxPortal);
    window.addEventListener('load', bootBobloxPortal);
} else {
    bootBobloxPortal();
}

