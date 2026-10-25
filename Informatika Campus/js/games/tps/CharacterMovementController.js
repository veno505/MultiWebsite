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
        
        if (input.KeyW || input.W) this.moveDir.add(camForward);
        if (input.KeyS || input.S) this.moveDir.sub(camForward);
        if (input.KeyA || input.A) this.moveDir.sub(camRight);
        if (input.KeyD || input.D) this.moveDir.add(camRight);
        
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