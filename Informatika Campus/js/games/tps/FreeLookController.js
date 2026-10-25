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