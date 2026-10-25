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