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