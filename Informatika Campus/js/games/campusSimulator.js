// js/games/campusSimulator.js

// ==========================================
// GAME STATE MANAGEMENT
// ==========================================
const GameState = {
    semester: 1,
    ipk: 3.00,
    money: 500000,
    energy: 100,
    health: 100,
    ammo: 30,
    maxAmmo: 30,
    isReloading: false,
    skillProg: 1,
    xpProg: 0,
    
    updateUI() {
        document.getElementById('val-sem').innerText = this.semester;
        document.getElementById('val-ipk').innerText = this.ipk.toFixed(2);
        document.getElementById('val-money').innerText = `Rp ${this.money.toLocaleString('id-ID')}`;
        
        document.getElementById('val-health').innerText = `${Math.floor(this.health)}%`;
        document.getElementById('bar-health').style.width = `${Math.max(0, this.health)}%`;
        
        document.getElementById('val-energy').innerText = `${Math.floor(this.energy)}%`;
        document.getElementById('bar-energy').style.width = `${this.energy}%`;
        
        if(this.isReloading) {
            document.getElementById('val-ammo').innerText = "Reloading...";
        } else {
            document.getElementById('val-ammo').innerText = `${this.ammo} / ${this.maxAmmo}`;
        }
        
        document.getElementById('val-skill').innerText = `Lv ${this.skillProg}`;
    },
    
    notify(msg) {
        const container = document.getElementById('notif-container');
        const notif = document.createElement('div');
        notif.className = 'notif';
        notif.innerText = msg;
        container.appendChild(notif);
        setTimeout(() => notif.remove(), 4000);
    },
    
    addXP(amt) {
        this.xpProg += amt;
        const requiredXP = this.skillProg * 100;
        if(this.xpProg >= requiredXP) {
            this.xpProg -= requiredXP;
            this.skillProg++;
            this.ipk = Math.min(4.0, this.ipk + 0.1);
            this.notify(`🌟 Level Up! Skill Programming Lv ${this.skillProg}`);
        }
        this.updateUI();
    },
    
    spendEnergy(amt) {
        this.energy -= amt;
        if(this.energy < 0) this.energy = 0;
        this.updateUI();
    },
    
    earnMoney(amt) {
        this.money += amt;
        this.notify(`💰 +Rp ${amt.toLocaleString('id-ID')}`);
        this.updateUI();
    }
};

// ==========================================
// THREE.JS ENGINE SETUP
// ==========================================
let scene, camera, renderer;
let playerGroup, head, leftArm, rightArm, leftLeg, rightLeg;
let gunMuzzle;

// PlayerState
window.PlayerState = 'FREE_ROAM'; // FREE_ROAM, COMBAT, CLASS, SLEEPING
window.combatKills = 0;

let interactables = [];
let colliders = [];
let shootableObjects = [];

let clock = new THREE.Clock();
const keys = { KeyW: false, KeyS: false, KeyA: false, KeyD: false, Space: false };
let isPointerLocked = false;
let isRightMouseDown = false;
let isLeftMouseDown = false;
let lastShootTime = 0;
let yaw = 0;
let pitch = 0;
const cameraPivot = new THREE.Group();

// TPS Controllers
let tpsStance, tpsState, tpsFreeLook, tpsRecoil, tpsCollision, tpsCamera;
let charMovement, charRotation, weaponAim;

// Managers
window.timeManager = new GameTimeManager();
window.questManager = new QuestManager();
window.npcManager = null;
window.worldManager = null;

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.003);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 200, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 200;
    dirLight.shadow.camera.bottom = -200;
    dirLight.shadow.camera.left = -200;
    dirLight.shadow.camera.right = 200;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);
    
    // Initialize Managers
    window.npcManager = new NPCManager(scene, colliders);
    window.worldManager = new WorldManager(scene, colliders, interactables);
    
    window.worldManager.buildVerticalSliceWorld();
    
    // Create NPCs
    window.npcManager.createNPC(-25, 0, -25, "Budi (Kating)", "Student");
    window.npcManager.createNPC(0, 0, 0, "Siti (Maba)", "Student");
    window.npcManager.createNPC(20, 0, 75, "Andi (Teman)", "Student");
    
    // Export for easy access
    window.shootableObjects = shootableObjects;
    window.colliders = colliders;
    
    buildPlayer();
    setupTPSControllers();
    setupControls();
    
    GameState.updateUI();
    window.questManager.init();
    window.timeManager.updateUI();
    GameState.notify("👋 Selamat datang! W,A,S,D jalan, E interaksi.");
    requestAnimationFrame(animate);
}

// ==========================================
// PLAYER & WEAPON SETUP
// ==========================================
function buildPlayer() {
    playerGroup = new THREE.Group();
    playerGroup.position.set(0, 10, 120); // Spawn di Kos
    scene.add(playerGroup);

    const skinMat = new THREE.MeshStandardMaterial({color: 0xf5c396});
    const shirtMat = new THREE.MeshStandardMaterial({color: 0xffffff}); // Baju putih
    const pantsMat = new THREE.MeshStandardMaterial({color: 0x37474f});

    const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 1), shirtMat);
    torso.position.y = 3.25;
    playerGroup.add(torso);

    head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), skinMat);
    head.position.y = 5.2;
    playerGroup.add(head);

    leftArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), shirtMat);
    leftArm.position.set(-1.6, 3.25, 0);
    playerGroup.add(leftArm);

    rightArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), shirtMat);
    rightArm.position.set(1.6, 3.25, 0);
    playerGroup.add(rightArm);

    leftLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), pantsMat);
    leftLeg.position.set(-0.6, 1.25, 0);
    playerGroup.add(leftLeg);

    rightLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), pantsMat);
    rightLeg.position.set(0.6, 1.25, 0);
    playerGroup.add(rightLeg);

    // WEAPON (Blaster)
    const gunMat = new THREE.MeshStandardMaterial({color: 0x222222});
    const gunMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 2.5), gunMat);
    gunMesh.position.set(0, -1, -1);
    rightArm.add(gunMesh);

    gunMuzzle = new THREE.Object3D();
    gunMuzzle.position.set(0, 0, -1.3);
    gunMesh.add(gunMuzzle);

    scene.add(cameraPivot);
    scene.add(camera);
}

function setupTPSControllers() {
    tpsStance = new StanceController();
    tpsState = new CameraStateController();
    tpsFreeLook = new FreeLookController();
    tpsRecoil = new RecoilController();
    tpsCollision = new CameraCollisionController(scene, colliders);
    tpsCamera = new ThirdPersonCameraController(camera, tpsState, tpsFreeLook, tpsRecoil, tpsCollision);
    
    charMovement = new CharacterMovementController(playerGroup, colliders);
    charRotation = new CharacterRotationController(playerGroup);
    weaponAim = new WeaponAimController(camera, colliders, shootableObjects);
}

// ==========================================
// CONTROLS & SHOOTING LOGIC
// ==========================================
function setupControls() {
    document.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('mousedown', (e) => {
        if(e.target.tagName !== 'BUTTON' && document.getElementById('minigame-modal').style.display !== 'block') {
            if (!isPointerLocked) {
                document.body.requestPointerLock();
            } else {
                if (e.button === 2) { 
                    isRightMouseDown = true;
                } else if (e.button === 0) { 
                    isLeftMouseDown = true;
                }
            }
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (e.button === 2) {
            isRightMouseDown = false;
        } else if (e.button === 0) {
            isLeftMouseDown = false;
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = (document.pointerLockElement === document.body);
        if(!isPointerLocked) {
            isRightMouseDown = false;
            isLeftMouseDown = false;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isPointerLocked) {
            tpsCamera.addInput(e.movementX, e.movementY);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
        
        if (e.code === 'AltLeft' || e.code === 'AltRight') {
            tpsFreeLook.isActive = true;
            e.preventDefault();
        }
        if (e.code === 'KeyC') tpsStance.setStance('CROUCH');
        if (e.code === 'KeyZ') tpsStance.setStance('PRONE');
        if (e.code === 'ShiftLeft') tpsState.setState('SPRINT');
        if (e.code === 'KeyQ') tpsState.toggleShoulder();
        if (e.code === 'KeyF') {
            if(tpsState.state === 'ADS') tpsState.setState('NORMAL');
            else tpsState.setState('ADS');
        }

        // Manual Reload
        if (e.code === 'KeyR' && isPointerLocked) {
            reloadGun();
        }

        if (e.code === 'KeyE' && currentInteractable && isPointerLocked) {
            handleInteraction(currentInteractable.userData);
        }
    });
    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
        
        if (e.code === 'AltLeft' || e.code === 'AltRight') {
            tpsFreeLook.isActive = false;
        }
        if (e.code === 'KeyC' || e.code === 'KeyZ') tpsStance.setStance('STAND');
        if (e.code === 'ShiftLeft' && tpsState.state === 'SPRINT') tpsState.setState('NORMAL');
    });
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function reloadGun() {
    if(GameState.isReloading || GameState.ammo === GameState.maxAmmo) return;
    GameState.isReloading = true;
    GameState.updateUI();
    GameState.notify("🔄 Reloading...");
    setTimeout(() => {
        GameState.ammo = GameState.maxAmmo;
        GameState.isReloading = false;
        GameState.updateUI();
    }, 1500);
}

function shoot() {
    if(GameState.isReloading) return;
    if(GameState.ammo <= 0) {
        reloadGun();
        return;
    }
    
    GameState.ammo--;
    GameState.updateUI();
    
    const startPos = new THREE.Vector3();
    gunMuzzle.getWorldPosition(startPos);
    
    if (weaponAim.checkMuzzleObstruction(startPos)) {
        return; // blocked
    }
    
    const fireDir = weaponAim.getFireDirection(startPos);
    const fireRay = new THREE.Raycaster(startPos, fireDir);
    const hits = fireRay.intersectObjects(shootableObjects);
    
    if(hits.length > 0) {
        const hit = hits[0];
        createTracer(startPos, hit.point);
        
        if(hit.object.userData.isEnemy) {
            window.npcManager.damageEnemy(hit.object.userData.id, hit.object.userData.isHeadshot);
        }
    } else {
        createTracer(startPos, weaponAim.aimTargetPoint.clone());
    }
    
    // Apply Recoil Controller
    const rPitch = Math.random() * 0.05 + 0.02;
    const rYaw = (Math.random() - 0.5) * 0.04;
    tpsRecoil.addRecoil(rPitch * TPSConfig.States[tpsState.state].recoilMultiplier, rYaw * TPSConfig.States[tpsState.state].recoilMultiplier);
}

function createTracer(start, end) {
    const mat = new THREE.LineBasicMaterial({color: 0xffff00, linewidth: 2});
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    setTimeout(() => scene.remove(line), 50); // Hapus setelah 50ms
}

function damageEnemy(id, isHeadshot) {
    const npc = npcs.find(n => n.id === id);
    if(npc && npc.health > 0) {
        const damage = isHeadshot ? 100 : 35;
        npc.health -= damage;
        
        // Hitmarker UI
        const hm = document.getElementById('hit-marker');
        hm.style.display = 'block';
        hm.style.color = isHeadshot ? '#ff3333' : '#ffffff';
        setTimeout(() => hm.style.display = 'none', 100);
        
        if(npc.health <= 0) {
            scene.remove(npc.group);
            npc.bubble.remove();
            GameState.earnMoney(25000);
            GameState.addXP(40);
            GameState.notify("🎯 Bug Zombie Tumbang! +Rp25k");
            // Bersihkan data
            shootableObjects = shootableObjects.filter(obj => obj.userData.id !== id);
            npcs = npcs.filter(n => n.id !== id);
        } else {
            npc.bubble.innerText = `HP: ${npc.health}`;
            npc.talkTimer = 2; // Tampilkan HP sejenak
        }
    }
}

// ==========================================
// GAME LOOP & MOVEMENT
// ==========================================
let velocityY = 0;
let currentInteractable = null;
const raycasterInteraction = new THREE.Raycaster();
let walkAnimTime = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);

    if (isLeftMouseDown && isPointerLocked && window.PlayerState === 'COMBAT') {
        if (Date.now() - lastShootTime > 100) {
            shoot();
            lastShootTime = Date.now();
        }
    }

    // Determine state
    let isAiming = false;
    if (isRightMouseDown && window.PlayerState === 'COMBAT') {
        if (tpsState.state !== 'ADS') tpsState.setState('SHOULDER_AIM');
        isAiming = true;
    } else if (keys.ShiftLeft) {
        tpsState.setState('SPRINT');
    } else if (tpsState.state !== 'ADS') {
        tpsState.setState('NORMAL');
    }
    
    document.getElementById('crosshair').style.opacity = (isAiming || tpsState.state === 'ADS') ? '1' : '0.2';
    
    // Update TPS Controllers in requested order
    tpsFreeLook.update(delta);
    tpsStance.update(delta);
    tpsState.update(delta, camera);
    tpsRecoil.update(delta);
    
    const isMoving = charMovement.update(delta, keys, tpsCamera.yaw, tpsStance.speedMultiplier);
    
    charRotation.update(delta, isAiming, tpsCamera.yaw, charMovement.moveDir, isMoving);
    
    // For ADS Anchor
    const gunPos = new THREE.Vector3();
    gunMuzzle.getWorldPosition(gunPos);
    const adsAnchorPos = gunPos.clone().add(new THREE.Vector3(0, 0.2, 0));
    
    tpsCamera.update(delta, playerGroup.position, tpsStance.height, isMoving, tpsState.state === 'SPRINT', adsAnchorPos);
    
    weaponAim.updateAimTarget();
    
    // Arm/Leg Animation
    if (isMoving) {
        const animSpeed = (TPSConfig.Stances.STAND.speed * tpsStance.speedMultiplier) / 2;
        walkAnimTime += delta * animSpeed;
        leftLeg.rotation.x = -Math.sin(walkAnimTime) * 0.5;
        rightLeg.rotation.x = Math.sin(walkAnimTime) * 0.5;
        leftArm.rotation.x = Math.sin(walkAnimTime) * 0.5;
    } else {
        leftLeg.rotation.x = 0; rightLeg.rotation.x = 0;
        leftArm.rotation.x = 0;
    }
    
    // Aiming dengan Tangan Kanan
    if(window.PlayerState === 'COMBAT') {
        rightArm.rotation.x = tpsCamera.pitch - Math.PI/2;
    } else {
        rightArm.rotation.x = 0; // Santai saat bukan combat
    }

    // Update Managers
    window.timeManager.update(delta);
    window.npcManager.update(delta, camera, playerGroup);

    // Location & Quest Triggers
    if(window.questManager.questState === 'WAKE_UP' && playerGroup.position.z < 60) {
        window.questManager.advanceQuest('ARRIVED_CAMPUS');
    } else if (window.questManager.questState === 'GO_TO_ORGANIZATION' && playerGroup.position.x > 50 && playerGroup.position.z > 0) {
        window.questManager.advanceQuest('ARRIVED_ORGANIZATION');
    } else if (window.questManager.questState === 'GO_HOME' && playerGroup.position.z > 100) {
        window.questManager.advanceQuest('ARRIVED_KOS');
    }

    // 4. Interaksi Raycasting (Bukan Menembak)
    raycasterInteraction.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycasterInteraction.intersectObjects(interactables);
    
    if (hits.length > 0 && hits[0].distance < 12) {
        currentInteractable = hits[0].object;
        document.getElementById('interact-text').innerText = currentInteractable.userData.title;
        document.getElementById('interact-prompt').style.display = 'block';
    } else {
        currentInteractable = null;
        document.getElementById('interact-prompt').style.display = 'none';
    }

    renderer.render(scene, camera);
}

// ==========================================
// INTERACTION & MINIGAME
// ==========================================
function handleInteraction(data) {
    if (data.action === 'talk') {
        window.npcManager.talkTo(data.npcId);
    }
    else if (data.action === 'code') {
        if(GameState.energy < 15) {
            GameState.notify("⚠️ Terlalu lelah untuk coding! Cari tempat tidur.");
            return;
        }
        document.exitPointerLock();
        showMinigame();
    } 
    else if (data.action === 'eat') {
        if (GameState.money >= 15000) {
            GameState.money -= 15000;
            GameState.health = 100;
            GameState.energy += 40;
            if(GameState.energy > 100) GameState.energy = 100;
            GameState.notify("🍔 Makan Nasi Goreng: Health Penuh, Energi +40");
            GameState.updateUI();
        } else {
            GameState.notify("💸 Uang tidak cukup untuk makan!");
        }
    } 
    else if (data.action === 'sleep') {
        GameState.energy = 100;
        GameState.health = 100;
        window.timeManager.sleep();
        GameState.notify("💤 Tidur nyenyak. Semua status penuh!");
        GameState.updateUI();
        
        if (window.questManager.questState === 'SLEEP') {
            window.questManager.advanceQuest('SLEPT');
            window.PlayerState = 'FREE_ROAM'; // Reset state
        }
    }
    else if (data.action === 'enter_class') {
        if (window.questManager.questState === 'ATTEND_CLASS') {
            if (window.timeManager.hours >= 8 && window.timeManager.hours <= 10) {
                GameState.notify("🏫 Mengikuti kelas Algoritma...");
                // Fast forward time
                window.timeManager.hours += 2;
                window.timeManager.updateUI();
                GameState.spendEnergy(20);
                window.questManager.advanceQuest('CLASS_FINISHED');
            } else {
                GameState.notify("🕒 Kelas belum dimulai. Jadwal: 08:00");
            }
        } else {
            GameState.notify("❌ Kamu tidak ada jadwal kelas saat ini.");
        }
    }
    else if (data.action === 'register_org') {
        if (window.questManager.questState === 'COMBAT_TRAINING') {
            GameState.notify("🔫 Senjata Diaktifkan! Latihan Dimulai.");
            window.PlayerState = 'COMBAT';
            // Spawn 3 Bug Zombies
            window.combatKills = 0;
            for(let i=0; i<3; i++) {
                window.npcManager.createNPC(80 + (Math.random()*10), 0, 10 + (Math.random()*10), "Bug Zombie", "Enemy", true);
            }
        } else {
            GameState.notify("ℹ️ Belum saatnya latihan taktis.");
        }
    }
}

const codeQuestions = [
    { q: "Apa fungsi fungsi push() pada array JavaScript?", opts: ["Menghapus data", "Menambah data ke akhir", "Mencari data"], ans: 1 },
    { q: "Cari bug di kode ini: let x = 5; x = 'Hello';", opts: ["Harusnya const x = 5", "Tipe data tercampur (opsional di JS)", "Tidak ada bug fatal"], ans: 2 },
    { q: "Bagaimana cara membuat fungsi di JavaScript?", opts: ["function myFunc() {}", "create myFunc()", "def myFunc():"], ans: 0 }
];

function showMinigame() {
    const q = codeQuestions[Math.floor(Math.random() * codeQuestions.length)];
    const modal = document.getElementById('minigame-modal');
    const optsDiv = document.getElementById('mg-options');
    
    document.getElementById('mg-content').innerText = q.q;
    optsDiv.innerHTML = '';
    
    q.opts.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (idx === q.ans) {
                GameState.notify("✅ Jawaban Benar! +30 XP, +Rp 75.000");
                GameState.addXP(30);
                GameState.earnMoney(75000);
            } else {
                GameState.notify("❌ Salah! HP berkurang.");
                GameState.health -= 10;
                GameState.updateUI();
            }
            GameState.spendEnergy(15);
            document.getElementById('minigame-modal').style.display = 'none';
            document.body.requestPointerLock();
        };
        optsDiv.appendChild(btn);
    });
    
    modal.style.display = 'block';
}
