const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'Informatika Campus', 'js', 'games', 'tps');

const files = {
    'TPSConfig.js': `
window.TPSConfig = {
    Camera: {
        minPitch: -Math.PI / 2.5,
        maxPitch: Math.PI / 2.5,
        defaultSensitivity: 0.002,
        adsSensitivity: 0.001,
        collisionRadius: 0.3,
        collisionPadding: 0.1,
        smoothing: 15,
        pivotSmoothing: 10
    },
    States: {
        NORMAL: { distance: 3.5, shoulderOffset: 0.8, heightOffset: 1.5, fov: 75, recoilMultiplier: 1 },
        SPRINT: { distance: 4.0, shoulderOffset: 0.8, heightOffset: 1.5, fov: 85, recoilMultiplier: 1.5 },
        SHOULDER_AIM: { distance: 1.5, shoulderOffset: 1.0, heightOffset: 1.6, fov: 60, recoilMultiplier: 0.7 },
        ADS: { distance: 0, shoulderOffset: 0, heightOffset: 0, fov: 45, recoilMultiplier: 0.4 }, // Distance 0 means use ADS Anchor
    },
    Stances: {
        STAND: { height: 4, speed: 30 },
        CROUCH: { height: 2, speed: 15 },
        PRONE: { height: 0.5, speed: 5 }
    },
    Recoil: {
        recoverySpeed: 5,
        maxRecoilPitch: 0.5
    }
};
`,
    'StanceController.js': `
class StanceController {
    constructor() {
        this.currentStance = 'STAND';
        this.height = TPSConfig.Stances.STAND.height;
        this.speedMultiplier = 1;
    }
    
    setStance(stance) {
        if(TPSConfig.Stances[stance]) {
            this.currentStance = stance;
        }
    }
    
    update(delta) {
        const targetHeight = TPSConfig.Stances[this.currentStance].height;
        this.height += (targetHeight - this.height) * 10 * delta;
        this.speedMultiplier = TPSConfig.Stances[this.currentStance].speed / TPSConfig.Stances.STAND.speed;
    }
}
window.StanceController = StanceController;
`,
    'CameraStateController.js': `
class CameraStateController {
    constructor() {
        this.state = 'NORMAL';
        this.distance = TPSConfig.States.NORMAL.distance;
        this.shoulderOffset = TPSConfig.States.NORMAL.shoulderOffset;
        this.heightOffset = TPSConfig.States.NORMAL.heightOffset;
        this.fov = TPSConfig.States.NORMAL.fov;
        
        this.shoulderSide = 1; // 1 for right, -1 for left
    }
    
    setState(newState) {
        this.state = newState;
    }
    
    toggleShoulder() {
        this.shoulderSide *= -1;
    }
    
    update(delta, camera) {
        const config = TPSConfig.States[this.state] || TPSConfig.States.NORMAL;
        
        this.distance += (config.distance - this.distance) * 10 * delta;
        this.shoulderOffset += ((config.shoulderOffset * this.shoulderSide) - this.shoulderOffset) * 10 * delta;
        this.heightOffset += (config.heightOffset - this.heightOffset) * 10 * delta;
        this.fov += (config.fov - this.fov) * 10 * delta;
        
        camera.fov = this.fov;
        camera.updateProjectionMatrix();
    }
}
window.CameraStateController = CameraStateController;
`,
    'FreeLookController.js': `
class FreeLookController {
    constructor() {
        this.isActive = false;
        this.yawOffset = 0;
        this.pitchOffset = 0;
    }
    
    addInput(dx, dy, sens) {
        if (this.isActive) {
            this.yawOffset -= dx * sens;
            this.pitchOffset -= dy * sens;
            // clamp pitch
            this.pitchOffset = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitchOffset));
            // clamp yaw
            this.yawOffset = Math.max(-Math.PI, Math.min(Math.PI, this.yawOffset));
        }
    }
    
    update(delta) {
        if (!this.isActive) {
            // Smoothly return to 0
            this.yawOffset += (0 - this.yawOffset) * 15 * delta;
            this.pitchOffset += (0 - this.pitchOffset) * 15 * delta;
        }
    }
}
window.FreeLookController = FreeLookController;
`,
    'RecoilController.js': `
class RecoilController {
    constructor() {
        this.pitch = 0;
        this.yaw = 0;
    }
    
    addRecoil(pitchAmt, yawAmt) {
        this.pitch += pitchAmt;
        this.yaw += yawAmt;
    }
    
    update(delta) {
        this.pitch += (0 - this.pitch) * TPSConfig.Recoil.recoverySpeed * delta;
        this.yaw += (0 - this.yaw) * TPSConfig.Recoil.recoverySpeed * delta;
    }
}
window.RecoilController = RecoilController;
`,
    'CameraCollisionController.js': `
class CameraCollisionController {
    constructor(scene, colliders) {
        this.scene = scene;
        this.colliders = colliders;
        this.raycaster = new THREE.Raycaster();
    }
    
    resolveCollision(pivotPos, desiredPos) {
        const dir = new THREE.Vector3().subVectors(desiredPos, pivotPos);
        const dist = dir.length();
        dir.normalize();
        
        this.raycaster.set(pivotPos, dir);
        this.raycaster.far = dist;
        
        const hits = this.raycaster.intersectObjects(this.colliders);
        if (hits.length > 0) {
            // Collision found
            const hitDist = hits[0].distance - TPSConfig.Camera.collisionPadding;
            if (hitDist < 0) return pivotPos.clone();
            return pivotPos.clone().add(dir.multiplyScalar(hitDist));
        }
        
        return desiredPos;
    }
}
window.CameraCollisionController = CameraCollisionController;
`,
    'ThirdPersonCameraController.js': `
class ThirdPersonCameraController {
    constructor(camera, cameraState, freeLook, recoil, collision) {
        this.camera = camera;
        this.state = cameraState;
        this.freeLook = freeLook;
        this.recoil = recoil;
        this.collision = collision;
        
        this.yaw = 0;
        this.pitch = 0;
        
        this.currentPivot = new THREE.Vector3();
        this.currentCamPos = new THREE.Vector3();
        this.swayTime = 0;
    }
    
    addInput(dx, dy) {
        const sens = this.state.state === 'ADS' ? TPSConfig.Camera.adsSensitivity : TPSConfig.Camera.defaultSensitivity;
        
        if (this.freeLook.isActive) {
            this.freeLook.addInput(dx, dy, sens);
        } else {
            this.yaw -= dx * sens;
            this.pitch -= dy * sens;
            this.pitch = Math.max(TPSConfig.Camera.minPitch, Math.min(TPSConfig.Camera.maxPitch, this.pitch));
        }
    }
    
    update(delta, characterPos, stanceHeight, isMoving, isSprint, adsAnchorPos) {
        // 1. Smooth Pivot
        const targetPivot = characterPos.clone();
        targetPivot.y += stanceHeight;
        this.currentPivot.lerp(targetPivot, TPSConfig.Camera.pivotSmoothing * delta);
        
        // 2. Base Rotation + FreeLook + Recoil
        const finalYaw = this.yaw + this.freeLook.yawOffset + this.recoil.yaw;
        const finalPitch = this.pitch + this.freeLook.pitchOffset + this.recoil.pitch;
        
        const camRotation = new THREE.Euler(finalPitch, finalYaw, 0, 'YXZ');
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(camRotation);
        const right = new THREE.Vector3(1, 0, 0).applyEuler(camRotation);
        const up = new THREE.Vector3(0, 1, 0).applyEuler(camRotation);
        
        // 3. Movement Sway
        if (isMoving) {
            const swaySpeed = isSprint ? 15 : 10;
            const swayAmount = isSprint ? 0.05 : 0.02;
            this.swayTime += delta * swaySpeed;
            up.x += Math.sin(this.swayTime) * swayAmount;
            up.y += Math.cos(this.swayTime * 2) * swayAmount;
            up.normalize();
        } else {
            this.swayTime = 0;
        }
        
        // 4. Desired Position
        let desiredPos = this.currentPivot.clone();
        
        if (this.state.state === 'ADS' && adsAnchorPos) {
            // ADS goes straight to anchor
            desiredPos.copy(adsAnchorPos);
        } else {
            // TPP Offset
            desiredPos.add(forward.clone().multiplyScalar(-this.state.distance));
            desiredPos.add(right.clone().multiplyScalar(this.state.shoulderOffset));
            desiredPos.add(up.clone().multiplyScalar(this.state.heightOffset));
            
            // 5. Camera Collision (Sweep)
            desiredPos = this.collision.resolveCollision(this.currentPivot, desiredPos);
        }
        
        // 6. Smooth Camera Position Apply
        this.currentCamPos.lerp(desiredPos, TPSConfig.Camera.smoothing * delta);
        
        this.camera.position.copy(this.currentCamPos);
        this.camera.quaternion.setFromEuler(camRotation);
    }
}
window.ThirdPersonCameraController = ThirdPersonCameraController;
`,
    'CharacterMovementController.js': `
class CharacterMovementController {
    constructor(characterGroup, colliders) {
        this.group = characterGroup;
        this.colliders = colliders;
        this.velocityY = 0;
        this.isGrounded = false;
        this.moveDir = new THREE.Vector3();
    }
    
    update(delta, input, cameraYaw, speedMultiplier) {
        // Calculate Camera Relative Movement
        const camRotation = new THREE.Euler(0, cameraYaw, 0, 'YXZ');
        const camForward = new THREE.Vector3(0, 0, -1).applyEuler(camRotation);
        const camRight = new THREE.Vector3(1, 0, 0).applyEuler(camRotation);
        
        this.moveDir.set(0, 0, 0);
        
        if (input.W) this.moveDir.add(camForward);
        if (input.S) this.moveDir.sub(camForward);
        if (input.A) this.moveDir.sub(camRight);
        if (input.D) this.moveDir.add(camRight);
        
        const isMoving = this.moveDir.lengthSq() > 0.1;
        
        if (isMoving) {
            this.moveDir.normalize();
            
            const speed = TPSConfig.Stances.STAND.speed * speedMultiplier;
            
            // Wall Collision Check
            const checkRay = new THREE.Raycaster(this.group.position.clone().add(new THREE.Vector3(0, 1, 0)), this.moveDir.clone(), 0, 2);
            const wallHits = checkRay.intersectObjects(this.colliders);
            
            if(wallHits.length === 0) {
                this.group.position.addScaledVector(this.moveDir, speed * delta);
            }
        }
        
        // Gravity
        this.velocityY -= 60 * delta; 
        const downRay = new THREE.Raycaster(this.group.position.clone().add(new THREE.Vector3(0, 2, 0)), new THREE.Vector3(0, -1, 0), 0, 2.1);
        const floorHits = downRay.intersectObjects(this.colliders);
        
        this.isGrounded = false;
        if (floorHits.length > 0) {
            this.velocityY = Math.max(0, this.velocityY);
            this.group.position.y = floorHits[0].point.y;
            this.isGrounded = true;
        }

        if (input.Space && this.isGrounded) this.velocityY = 30;
        this.group.position.y += this.velocityY * delta;
        
        return isMoving;
    }
}
window.CharacterMovementController = CharacterMovementController;
`,
    'CharacterRotationController.js': `
class CharacterRotationController {
    constructor(characterGroup) {
        this.group = characterGroup;
        this.currentYaw = 0;
    }
    
    // Smooth angle interpolation
    lerpAngle(a, b, t) {
        let diff = b - a;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        return a + diff * t;
    }
    
    update(delta, isAiming, cameraYaw, moveDir, isMoving) {
        let targetYaw = this.currentYaw;
        
        if (isAiming) {
            // Badan mengikuti arah kamera
            targetYaw = cameraYaw;
        } else if (isMoving) {
            // Badan mengikuti arah jalan
            targetYaw = Math.atan2(moveDir.x, moveDir.z);
        }
        
        this.currentYaw = this.lerpAngle(this.currentYaw, targetYaw, 10 * delta);
        this.group.rotation.y = this.currentYaw;
    }
}
window.CharacterRotationController = CharacterRotationController;
`,
    'WeaponAimController.js': `
class WeaponAimController {
    constructor(camera, colliders, shootableObjects) {
        this.camera = camera;
        this.colliders = colliders;
        this.shootable = shootableObjects;
        this.raycaster = new THREE.Raycaster();
        
        this.aimTargetPoint = new THREE.Vector3();
    }
    
    updateAimTarget() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        // We can intersect world + enemies to find exact crosshair hit
        const allTargets = [...this.colliders, ...this.shootable];
        const hits = this.raycaster.intersectObjects(allTargets);
        
        if (hits.length > 0) {
            this.aimTargetPoint.copy(hits[0].point);
        } else {
            // Default far point
            this.aimTargetPoint.copy(this.raycaster.ray.origin).add(this.raycaster.ray.direction.multiplyScalar(100));
        }
    }
    
    checkMuzzleObstruction(muzzlePos) {
        const dir = new THREE.Vector3().subVectors(this.aimTargetPoint, muzzlePos);
        const dist = dir.length();
        dir.normalize();
        
        this.raycaster.set(muzzlePos, dir);
        const hits = this.raycaster.intersectObjects(this.colliders);
        if (hits.length > 0 && hits[0].distance < dist) {
            return true; // Obstructed by wall
        }
        return false;
    }
    
    getFireDirection(muzzlePos) {
        return new THREE.Vector3().subVectors(this.aimTargetPoint, muzzlePos).normalize();
    }
}
window.WeaponAimController = WeaponAimController;
`
};

for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
}
console.log('Successfully created modular TPS controllers.');
