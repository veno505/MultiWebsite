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