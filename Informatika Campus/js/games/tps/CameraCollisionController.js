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