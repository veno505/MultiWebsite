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