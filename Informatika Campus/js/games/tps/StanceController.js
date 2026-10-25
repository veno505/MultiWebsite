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