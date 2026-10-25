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
            torso.userData = { action: 'talk', title: `Bicara dengan ${name} [E]`, npcId: this.npcCounter };
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
            dialogues: customDialogues.length > 0 ? customDialogues : [`Halo, aku ${name}.`]
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
                npc.bubble.style.left = `${x}px`;
                npc.bubble.style.top = `${y}px`;
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
                        GameState.notify("🏆 LATIHAN SELESAI! Senjata Dinonaktifkan.");
                        window.PlayerState = 'FREE_ROAM';
                    }
                }
                
                shootableObjects = shootableObjects.filter(obj => obj.userData.id !== id);
                this.npcs = this.npcs.filter(n => n.id !== id);
                this.colliders = this.colliders.filter(c => c.userData.id !== id);
                // Also remove from global arrays
                window.shootableObjects = shootableObjects;
                window.colliders = this.colliders;
            } else {
                npc.bubble.innerText = `HP: ${npc.health}`;
                npc.talkTimer = 2;
            }
        }
    }
}
window.NPCManager = NPCManager;