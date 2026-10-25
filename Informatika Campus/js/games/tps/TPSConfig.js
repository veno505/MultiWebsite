window.TPSConfig = {
    Camera: {
        minPitch: -Math.PI / 2.5,
        maxPitch: Math.PI / 2.5,
        defaultSensitivity: 0.002,
        adsSensitivity: 0.001,
        collisionRadius: 0.3,
        collisionPadding: 0.1,
        smoothing: 15,
        pivotSmoothing: 10
    },
    States: {
        NORMAL: { distance: 3.5, shoulderOffset: 0.8, heightOffset: 1.5, fov: 75, recoilMultiplier: 1 },
        SPRINT: { distance: 4.0, shoulderOffset: 0.8, heightOffset: 1.5, fov: 85, recoilMultiplier: 1.5 },
        SHOULDER_AIM: { distance: 1.5, shoulderOffset: 1.0, heightOffset: 1.6, fov: 60, recoilMultiplier: 0.7 },
        ADS: { distance: 0, shoulderOffset: 0, heightOffset: 0, fov: 45, recoilMultiplier: 0.4 }, // Distance 0 means use ADS Anchor
    },
    Stances: {
        STAND: { height: 4, speed: 30 },
        CROUCH: { height: 2, speed: 15 },
        PRONE: { height: 0.5, speed: 5 }
    },
    Recoil: {
        recoverySpeed: 5,
        maxRecoilPitch: 0.5
    }
};