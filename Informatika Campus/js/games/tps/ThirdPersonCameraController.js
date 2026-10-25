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