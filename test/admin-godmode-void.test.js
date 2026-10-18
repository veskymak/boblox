const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// Setup minimal Three.js Vector3 shims
class MockVector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
}

class MockBox3 {
    constructor() {
        this.min = new MockVector3();
        this.max = new MockVector3();
    }
    set() { return this; }
    setFromCenterAndSize() { return this; }
    intersectsBox() { return false; }
}

global.THREE = {
    Vector3: MockVector3,
    Box3: MockBox3
};
global.window = global;
global.document = {
    getElementById: () => ({ style: {} }),
    querySelectorAll: () => []
};

global.showHudToast = () => {};
global.sfx = { playOof: () => {} };
global.flashDamageScreen = () => {};
global.updateHealthHUD = () => {};
global.activeGameMode = 'lobby';
global.gameSpecificData = {};

global.playerState = {
    hp: 100,
    maxHp: 100,
    pos: new MockVector3(0, 0, 0),
    spawnPoint: new MockVector3(0, 5, 0),
    vel: new MockVector3(0, 0, 0),
    knockback: new MockVector3(0, 0, 0),
    onGround: false,
    coyoteTimer: 0,
    forcefieldTimer: 0,
    invulnTimer: 0,
    godmode: false
};

// Mock respawnPlayer as defined in Engine.js
global.respawnPlayer = function() {
    global.playerState.hp = global.playerState.maxHp;
    global.playerState.pos.copy(global.playerState.spawnPoint);
    global.playerState.vel.set(0, 0, 0);
};

// Mock damagePlayer as defined in Engine.js
global.damagePlayer = function(amount, reason = '') {
    if (global.playerState.godmode) return;
    global.playerState.hp = Math.max(0, global.playerState.hp - amount);
    if (global.playerState.hp <= 0) {
        global.respawnPlayer();
    }
};

const PhysicsAndLoop = require('../src/core/PhysicsAndLoop.js');

describe('Seam 2: Void Fall Respawn under Godmode', () => {
    beforeEach(() => {
        global.playerState.hp = 100;
        global.playerState.pos.set(0, 5, 0);
        global.playerState.spawnPoint.set(0, 5, 0);
        global.playerState.godmode = false;
    });

    it('respawns player when falling into void with normal mortal state', () => {
        global.playerState.pos.set(0, -25, 0);
        PhysicsAndLoop.checkVoidFall();
        assert.strictEqual(global.playerState.pos.y, 5, 'Player should respawn to spawnPoint.y');
    });

    it('respawns player to spawn point when falling into void with Godmode enabled', () => {
        global.playerState.godmode = true;
        global.playerState.pos.set(0, -25, 0);
        PhysicsAndLoop.checkVoidFall();
        assert.strictEqual(global.playerState.pos.y, 5, 'Player with Godmode MUST respawn from void instead of falling infinitely');
    });
});
