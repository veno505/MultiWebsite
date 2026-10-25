const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'Informatika Campus', 'js', 'games', 'managers');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const files = {
    'GameTimeManager.js': `
class GameTimeManager {
    constructor() {
        this.day = 1;
        this.daysOfWeek = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"];
        this.currentDayIndex = 0;
        this.hours = 6;
        this.minutes = 30;
        this.timeScale = 30; // 1 real second = 30 in-game seconds (2 real mins = 1 in-game hour)
        this.accumulator = 0;
        this.isPaused = false;
    }
    
    update(delta) {
        if (this.isPaused) return;
        this.accumulator += delta * this.timeScale;
        
        if (this.accumulator >= 60) {
            let minsToAdd = Math.floor(this.accumulator / 60);
            this.minutes += minsToAdd;
            this.accumulator -= minsToAdd * 60;
            
            if (this.minutes >= 60) {
                this.hours += Math.floor(this.minutes / 60);
                this.minutes = this.minutes % 60;
                
                if (this.hours >= 24) {
                    this.hours = this.hours % 24;
                    this.nextDay();
                }
            }
            this.updateUI();
            
            // Dispatch time event for schedule checks
            window.dispatchEvent(new CustomEvent('GameTimeTick', { detail: { h: this.hours, m: this.minutes } }));
        }
    }
    
    nextDay() {
        this.day++;
        this.currentDayIndex = (this.currentDayIndex + 1) % 7;
        window.dispatchEvent(new CustomEvent('GameNewDay', { detail: { day: this.day } }));
    }
    
    sleep() {
        this.hours = 6;
        this.minutes = 0;
        this.nextDay();
        this.updateUI();
    }
    
    updateUI() {
        const timeStr = \`\${this.hours.toString().padStart(2, '0')}:\${this.minutes.toString().padStart(2, '0')}\`;
        const dayStr = this.daysOfWeek[this.currentDayIndex];
        const elem = document.getElementById('val-time');
        if(elem) elem.innerText = \`\${dayStr} | \${timeStr}\`;
    }
}
window.GameTimeManager = GameTimeManager;
`,
    'QuestManager.js': `
class QuestManager {
    constructor() {
        this.currentObjective = "";
        this.questState = "WAKE_UP"; 
        /* 
        States: WAKE_UP, GO_TO_CAMPUS, ATTEND_CLASS, GO_TO_ORGANIZATION, COMBAT_TRAINING, GO_HOME, SLEEP
        */
    }
    
    init() {
        this.setObjective("Bersiap dan pergi ke kampus.");
    }
    
    setObjective(text) {
        this.currentObjective = text;
        const elem = document.getElementById('val-objective');
        if(elem) elem.innerText = text;
        GameState.notify("📝 Objective Updated: " + text);
    }
    
    advanceQuest(trigger) {
        switch(this.questState) {
            case "WAKE_UP":
                if (trigger === "ARRIVED_CAMPUS") {
                    this.questState = "ATTEND_CLASS";
                    this.setObjective("Bicara dengan teman & masuk Kelas Algoritma (08:00)");
                }
                break;
            case "ATTEND_CLASS":
                if (trigger === "CLASS_FINISHED") {
                    this.questState = "GO_TO_ORGANIZATION";
                    this.setObjective("Kuliah selesai. Pergi ke Markas Organisasi Unit Taktis (17:00)");
                }
                break;
            case "GO_TO_ORGANIZATION":
                if (trigger === "ARRIVED_ORGANIZATION") {
                    this.questState = "COMBAT_TRAINING";
                    this.setObjective("Latihan Menembak: Kalahkan 3 Bug Zombie!");
                }
                break;
            case "COMBAT_TRAINING":
                if (trigger === "TRAINING_FINISHED") {
                    this.questState = "GO_HOME";
                    this.setObjective("Latihan selesai. Pulang ke kos.");
                }
                break;
            case "GO_HOME":
                if (trigger === "ARRIVED_KOS") {
                    this.questState = "SLEEP";
                    this.setObjective("Tidur di kasur untuk mengakhiri hari.");
                }
                break;
            case "SLEEP":
                if (trigger === "SLEPT") {
                    this.questState = "WAKE_UP";
                    this.setObjective("Bersiap dan pergi ke kampus.");
                }
                break;
        }
    }
}
window.QuestManager = QuestManager;
`,
    'NPCManager.js': `
class NPCManager {
    constructor(scene, colliders) {
        this.scene = scene;
        this.colliders = colliders;
        this.npcs = [];
        this.npcCounter = 0;
        this.bubbleContainer = document.getElementById('npc-bubbles-container');
    }
    
    createNPC(x, y, z, name, role, isEnemy = false, customDialogues = []) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        
        const skinMat = new THREE.MeshStandardMaterial({color: isEnemy ? 0x99cc33 : 0xf5c396}); 
        const shirtMat = new THREE.MeshStandardMaterial({color: isEnemy ? 0x333333 : (Math.random() * 0xffffff)});
        const pantsMat = new THREE.MeshStandardMaterial({color: 0x222222});
        
        const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 1), shirtMat);
        torso.position.y = 3.25;
        group.add(torso);
        
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), skinMat);
        head.position.y = 5.2;
        group.add(head);

        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), pantsMat);
        leftLeg.position.set(-0.6, 1.25, 0);
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), pantsMat);
        rightLeg.position.set(0.6, 1.25, 0);
        group.add(rightLeg);

        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), shirtMat);
        leftArm.position.set(-1.6, 3.25, 0);
        group.add(leftArm);

        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), shirtMat);
        rightArm.position.set(1.6, 3.25, 0);
        group.add(rightArm);
        
        this.scene.add(group);
        
        torso.userData = { isEnemy: isEnemy, id: this.npcCounter };
        head.userData = { isEnemy: isEnemy, id: this.npcCounter, isHeadshot: true };
        
        if(!isEnemy) {
            torso.userData = { action: 'talk', title: \`Bicara dengan \${name} [E]\`, npcId: this.npcCounter };
            interactables.push(torso);
        } else {
            shootableObjects.push(torso, head);
        }
        this.colliders.push(torso);
        
        const bubble = document.createElement('div');
        bubble.className = 'npc-bubble';
        bubble.innerText = name;
        this.bubbleContainer.appendChild(bubble);
        
        const npcData = {
            id: this.npcCounter,
            group: group,
            name: name,
            role: role,
            isEnemy: isEnemy,
            health: 100,
            bubble: bubble,
            talkTimer: 0,
            leftLeg: leftLeg, rightLeg: rightLeg,
            leftArm: leftArm, rightArm: rightArm,
            walkAnim: Math.random() * 10,
            dialogues: customDialogues.length > 0 ? customDialogues : [\`Halo, aku \${name}.\`]
        };
        
        this.npcs.push(npcData);
        this.npcCounter++;
        return npcData;
    }
    
    update(delta, camera, playerGroup) {
        this.npcs.forEach(npc => {
            if(npc.isEnemy && npc.health > 0) {
                npc.group.lookAt(playerGroup.position);
                const dist = npc.group.position.distanceTo(playerGroup.position);
                
                if(dist > 3 && dist < 80) {
                    const dir = new THREE.Vector3();
                    npc.group.getWorldDirection(dir);
                    npc.group.position.addScaledVector(dir, 12 * delta);
                    
                    npc.walkAnim += delta * 15;
                    npc.leftLeg.rotation.x = -Math.sin(npc.walkAnim) * 0.5;
                    npc.rightLeg.rotation.x = Math.sin(npc.walkAnim) * 0.5;
                    npc.leftArm.rotation.x = Math.sin(npc.walkAnim) * 0.5;
                    npc.rightArm.rotation.x = -Math.sin(npc.walkAnim) * 0.5;
                    npc.rightArm.rotation.z = Math.PI/8; 
                    npc.leftArm.rotation.z = -Math.PI/8;
                } else if (dist <= 3) {
                    if(Math.random() < 0.05 && PlayerState !== 'SLEEPING') {
                        GameState.health -= 5;
                        GameState.notify("⚠️ Diserang Bug Zombie!");
                        GameState.updateUI();
                        if(GameState.health <= 0) {
                            GameState.notify("💀 GAME OVER! Dirawat di UKS (-Rp 50k).");
                            GameState.health = 100;
                            GameState.money -= 50000; 
                            playerGroup.position.set(0, 10, 80); 
                            GameState.updateUI();
                        }
                    }
                } else {
                    npc.leftLeg.rotation.x = 0; npc.rightLeg.rotation.x = 0;
                }
            }
            
            // Bubble chat 2D projection
            const vec = new THREE.Vector3();
            npc.group.getWorldPosition(vec);
            vec.y += 8;
            vec.project(camera);
            
            if(vec.z > 1 || vec.z < -1) {
                npc.bubble.style.display = 'none';
            } else {
                npc.bubble.style.display = 'block';
                const x = (vec.x * .5 + .5) * window.innerWidth;
                const y = (vec.y * -.5 + .5) * window.innerHeight;
                npc.bubble.style.left = \`\${x}px\`;
                npc.bubble.style.top = \`\${y}px\`;
            }
            
            if(npc.talkTimer > 0) {
                npc.talkTimer -= delta;
                if(npc.talkTimer <= 0) {
                    npc.bubble.innerText = npc.name;
                    npc.bubble.classList.remove('talking');
                }
            }
        });
    }
    
    talkTo(id) {
        const npc = this.npcs.find(n => n.id === id);
        if(npc) {
            const dialogue = npc.dialogues[Math.floor(Math.random() * npc.dialogues.length)];
            npc.bubble.innerText = dialogue;
            npc.bubble.classList.add('talking');
            npc.talkTimer = 6;
            
            // Advance quest if talking to specific NPC
            if(window.questManager.questState === 'ATTEND_CLASS' && npc.role === 'Student') {
                GameState.notify("💡 Pergi ke ruang kelas sekarang!");
            }
        }
    }
    
    damageEnemy(id, isHeadshot) {
        const npc = this.npcs.find(n => n.id === id);
        if(npc && npc.health > 0) {
            const damage = isHeadshot ? 100 : 35;
            npc.health -= damage;
            
            const hm = document.getElementById('hit-marker');
            hm.style.display = 'block';
            hm.style.color = isHeadshot ? '#ff3333' : '#ffffff';
            setTimeout(() => hm.style.display = 'none', 100);
            
            if(npc.health <= 0) {
                this.scene.remove(npc.group);
                npc.bubble.remove();
                GameState.earnMoney(25000);
                GameState.addXP(40);
                GameState.notify("🎯 Bug Zombie Tumbang! +Rp25k");
                
                // Advance organization quest
                if(window.questManager.questState === 'COMBAT_TRAINING') {
                    window.combatKills = (window.combatKills || 0) + 1;
                    if(window.combatKills >= 3) {
                        window.questManager.advanceQuest("TRAINING_FINISHED");
                        GameState.notify("🏆 LATIHAN SELESAI!");
                    }
                }
                
                shootableObjects = shootableObjects.filter(obj => obj.userData.id !== id);
                this.npcs = this.npcs.filter(n => n.id !== id);
                this.colliders = this.colliders.filter(c => c.userData.id !== id);
                // Also remove from global arrays
                window.shootableObjects = shootableObjects;
                window.colliders = this.colliders;
            } else {
                npc.bubble.innerText = \`HP: \${npc.health}\`;
                npc.talkTimer = 2;
            }
        }
    }
}
window.NPCManager = NPCManager;
`,
    'WorldManager.js': `
class WorldManager {
    constructor(scene, colliders, interactables) {
        this.scene = scene;
        this.colliders = colliders;
        this.interactables = interactables;
    }
    
    createBlock(w, h, d, x, y, z, color, isCollider = true) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y + h/2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        if(isCollider) this.colliders.push(mesh);
        return mesh;
    }

    createTree(x, z) {
        this.createBlock(1, 4, 1, x, 0, z, 0x5c4033);
        const leaves = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshStandardMaterial({ color: 0x2e8b57 }));
        leaves.position.set(x, 6, z);
        leaves.castShadow = true;
        this.scene.add(leaves);
    }
    
    buildVerticalSliceWorld() {
        // Grass (Campus Area)
        this.createBlock(200, 1, 200, 0, -1, 0, 0x4CAF50);
        // Road from Kos to Campus
        this.createBlock(10, 1.1, 150, 0, -1, 75, 0x9e9e9e, false);
        
        // 1. KOS AREA (Start Point)
        // Platform Kos
        this.createBlock(30, 1, 30, 0, -0.5, 120, 0x8d6e63); 
        // Dinding Kos
        this.createBlock(30, 10, 2, 0, 0, 105, 0xffffff); // Depan (Pintu di tengah)
        this.createBlock(30, 10, 2, 0, 0, 135, 0xffffff); // Belakang
        this.createBlock(2, 10, 30, -15, 0, 120, 0xffffff); // Kiri
        this.createBlock(2, 10, 30, 15, 0, 120, 0xffffff); // Kanan
        
        // Bed
        let bed = this.createBlock(5, 2, 8, -10, 0, 128, 0x4fc3f7);
        bed.userData = { action: 'sleep', title: 'Tidur di Kasur [E]' };
        this.interactables.push(bed);
        
        // PC
        let pc = this.createBlock(3, 2, 0.5, 10, 3.5, 128, 0x111111);
        this.createBlock(6, 3, 3, 10, 0.5, 129, 0x5c4033); // Meja
        pc.userData = { action: 'code', title: 'Belajar Coding [E]' };
        this.interactables.push(pc);
        
        // 2. KAMPUS / KELAS AREA
        this.createBlock(60, 1.2, 50, -30, -1, -30, 0x607d8b); // Foundation
        this.createBlock(64, 2, 54, -30, 15, -30, 0x37474f); // Roof
        
        // Dinding Kelas
        this.createBlock(2, 15, 50, -60, 0, -30, 0xeeeeee);
        this.createBlock(2, 15, 50, 0, 0, -30, 0xeeeeee);
        this.createBlock(60, 15, 2, -30, 0, -55, 0xeeeeee);
        this.createBlock(60, 15, 2, -30, 0, -5, 0xeeeeee); // Depan
        
        // Pintu Kelas (Trigger)
        let pintuKelas = this.createBlock(6, 8, 2.5, -30, 0, -5, 0x8d6e63);
        pintuKelas.userData = { action: 'enter_class', title: 'Masuk Kelas Algoritma [E]' };
        this.interactables.push(pintuKelas);
        
        // 3. ORGANISASI AREA (Arena)
        this.createBlock(80, 1, 80, 80, -1, 0, 0x333333); // Aspal
        let regisOrganisasi = this.createBlock(5, 5, 5, 50, 0, 30, 0xff0000); // Meja Pendaftaran
        regisOrganisasi.userData = { action: 'register_org', title: 'Registrasi Latihan Taktis [E]' };
        this.interactables.push(regisOrganisasi);
        
        // Obstacles for arena
        this.createBlock(10, 6, 2, 70, 0, -10, 0x555555);
        this.createBlock(2, 6, 10, 90, 0, 10, 0x555555);
        this.createBlock(5, 4, 5, 100, 0, -20, 0x555555);
        
        // Trees
        for(let i=0; i<30; i++) {
            let px = Math.random() * 200 - 100;
            let pz = Math.random() * 200 - 100;
            if(Math.abs(px) > 20 && pz < 100 && px < 40) this.createTree(px, pz);
        }
    }
}
window.WorldManager = WorldManager;
`
};

for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
}
console.log('Successfully created manager scripts.');
