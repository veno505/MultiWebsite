class WorldManager {
    constructor(scene, colliders, interactables) {
        this.scene = scene;
        this.colliders = colliders;
        this.interactables = interactables;
    }
    
    createBlock(w, h, d, x, y, z, color, isCollider = true) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y + h/2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        if(isCollider) this.colliders.push(mesh);
        return mesh;
    }

    createTree(x, z) {
        this.createBlock(1, 4, 1, x, 0, z, 0x5c4033);
        const leaves = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshStandardMaterial({ color: 0x2e8b57 }));
        leaves.position.set(x, 6, z);
        leaves.castShadow = true;
        this.scene.add(leaves);
    }
    
    buildVerticalSliceWorld() {
        // Grass (Campus Area)
        this.createBlock(200, 1, 200, 0, -1, 0, 0x4CAF50);
        // Road from Kos to Campus
        this.createBlock(10, 1.1, 150, 0, -1, 75, 0x9e9e9e, false);
        
        // 1. KOS AREA (Start Point)
        // Platform Kos
        this.createBlock(30, 1, 30, 0, -0.5, 120, 0x8d6e63); 
        // Dinding Kos
        this.createBlock(11, 10, 2, -9.5, 0, 105, 0xffffff); // Depan kiri
        this.createBlock(11, 10, 2, 9.5, 0, 105, 0xffffff);  // Depan kanan (pintu 8 unit di tengah)
        this.createBlock(30, 10, 2, 0, 0, 135, 0xffffff); // Belakang
        this.createBlock(2, 10, 30, -15, 0, 120, 0xffffff); // Kiri
        this.createBlock(2, 10, 30, 15, 0, 120, 0xffffff); // Kanan
        
        // Bed
        let bed = this.createBlock(5, 2, 8, -10, 0, 128, 0x4fc3f7);
        bed.userData = { action: 'sleep', title: 'Tidur di Kasur [E]' };
        this.interactables.push(bed);
        
        // PC
        let pc = this.createBlock(3, 2, 0.5, 10, 3.5, 128, 0x111111);
        this.createBlock(6, 3, 3, 10, 0.5, 129, 0x5c4033); // Meja
        pc.userData = { action: 'code', title: 'Belajar Coding [E]' };
        this.interactables.push(pc);
        
        // 2. KAMPUS / KELAS AREA
        this.createBlock(60, 1.2, 50, -30, -1, -30, 0x607d8b); // Foundation
        this.createBlock(64, 2, 54, -30, 15, -30, 0x37474f); // Roof
        
        // Dinding Kelas
        this.createBlock(2, 15, 50, -60, 0, -30, 0xeeeeee);
        this.createBlock(2, 15, 50, 0, 0, -30, 0xeeeeee);
        this.createBlock(60, 15, 2, -30, 0, -55, 0xeeeeee);
        this.createBlock(60, 15, 2, -30, 0, -5, 0xeeeeee); // Depan
        
        // Pintu Kelas (Trigger)
        let pintuKelas = this.createBlock(6, 8, 2.5, -30, 0, -5, 0x8d6e63);
        pintuKelas.userData = { action: 'enter_class', title: 'Masuk Kelas Algoritma [E]' };
        this.interactables.push(pintuKelas);
        
        // 3. ORGANISASI AREA (Arena)
        this.createBlock(80, 1, 80, 80, -1, 0, 0x333333); // Aspal
        let regisOrganisasi = this.createBlock(5, 5, 5, 50, 0, 30, 0xff0000); // Meja Pendaftaran
        regisOrganisasi.userData = { action: 'register_org', title: 'Registrasi Latihan Taktis [E]' };
        this.interactables.push(regisOrganisasi);
        
        // Obstacles for arena
        this.createBlock(10, 6, 2, 70, 0, -10, 0x555555);
        this.createBlock(2, 6, 10, 90, 0, 10, 0x555555);
        this.createBlock(5, 4, 5, 100, 0, -20, 0x555555);
        
        // Trees
        for(let i=0; i<30; i++) {
            let px = Math.random() * 200 - 100;
            let pz = Math.random() * 200 - 100;
            if(Math.abs(px) > 20 && pz < 100 && px < 40) this.createTree(px, pz);
        }
    }
}
window.WorldManager = WorldManager;