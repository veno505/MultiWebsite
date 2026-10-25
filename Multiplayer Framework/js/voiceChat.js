let peer = null;
let localStream = null;
let currentCall = null;
window.isVoiceEnabled = false;

let audioContext = null;
let analyserLocal = null;
let analyserRemote = null;
let dataArrayLocal = null;
let dataArrayRemote = null;
let animationFrameId = null;

window.toggleVoiceChat = async () => {
    window.isVoiceEnabled = !window.isVoiceEnabled;
    const btn = document.getElementById('btn-voice-toggle');
    const icon = document.getElementById('voice-icon');

    if (window.isVoiceEnabled) {
        // TURN ON
        btn.classList.remove('text-gray-500');
        btn.classList.add('text-cyber-green', 'shadow-[0_0_15px_rgba(0,255,100,0.5)]');
        icon.classList.remove('fa-microphone-slash');
        icon.classList.add('fa-microphone');

        await startVoiceChat();
    } else {
        // TURN OFF
        btn.classList.add('text-gray-500');
        btn.classList.remove('text-cyber-green', 'shadow-[0_0_15px_rgba(0,255,100,0.5)]');
        icon.classList.add('fa-microphone-slash');
        icon.classList.remove('fa-microphone');

        stopVoiceChat();
    }
};

const startVoiceChat = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setupAudioAnalyser(localStream, true); // Local mic indicator

        peer = new Peer();

        peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            
            // If I am host, advertise my Peer ID to the room
            if (window.isHost && window.syncRoomState) {
                window.syncRoomState({ hostPeerId: id });
            } 
            // If I am guest, call the host if their Peer ID is available
            else if (!window.isHost && window.roomData && window.roomData.hostPeerId) {
                callHost(window.roomData.hostPeerId);
            }
        });

        // Listen for incoming calls (Host receives this from Guest)
        peer.on('call', (call) => {
            console.log('Receiving call...');
            call.answer(localStream); // Answer with our stream
            currentCall = call;

            call.on('stream', (remoteStream) => {
                playRemoteStream(remoteStream);
            });
        });

    } catch (err) {
        console.error('Failed to get local stream', err);
        // Reset UI if failed
        window.toggleVoiceChat();
        alert('Gagal mengakses mikrofon. Pastikan izin diberikan.');
    }
};

const callHost = (hostPeerId) => {
    if (!peer || !localStream) return;
    console.log('Calling host: ' + hostPeerId);
    const call = peer.call(hostPeerId, localStream);
    currentCall = call;

    call.on('stream', (remoteStream) => {
        playRemoteStream(remoteStream);
    });
};

const playRemoteStream = (remoteStream) => {
    const remoteAudio = document.getElementById('remote-audio');
    if (remoteAudio) {
        remoteAudio.srcObject = remoteStream;
        // Try to play (might be blocked by browser policy until interaction, but they already clicked the mic button)
        remoteAudio.play().catch(e => console.log('Autoplay blocked:', e));
    }
    setupAudioAnalyser(remoteStream, false);
};

const stopVoiceChat = () => {
    if (currentCall) {
        currentCall.close();
        currentCall = null;
    }
    if (peer) {
        peer.destroy();
        peer = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (window.isHost && window.syncRoomState) {
        window.syncRoomState({ hostPeerId: null });
    }
    const remoteAudio = document.getElementById('remote-audio');
    if (remoteAudio) remoteAudio.srcObject = null;

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    // Reset UI indicators
    document.getElementById('p1-avatar').style.boxShadow = '';
    document.getElementById('p2-avatar').style.boxShadow = '';
};

// Listen for updates from Firebase (Guest seeing hostPeerId)
window.handleVoiceChatUpdate = (data) => {
    if (window.isVoiceEnabled && !window.isHost && data.hostPeerId && (!currentCall || !currentCall.open)) {
        // If host restarted their peer or guest just connected
        callHost(data.hostPeerId);
    }
};

// ----- Audio Visualizer for Avatar -----
const setupAudioAnalyser = (stream, isLocal) => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    if (isLocal) {
        analyserLocal = analyser;
        dataArrayLocal = dataArray;
    } else {
        analyserRemote = analyser;
        dataArrayRemote = dataArray;
    }

    if (!animationFrameId) {
        updateMicIndicators();
    }
};

const updateMicIndicators = () => {
    animationFrameId = requestAnimationFrame(updateMicIndicators);

    let localVol = 0;
    if (analyserLocal) {
        analyserLocal.getByteFrequencyData(dataArrayLocal);
        let sum = 0;
        for (let i = 0; i < dataArrayLocal.length; i++) sum += dataArrayLocal[i];
        localVol = sum / dataArrayLocal.length;
    }

    let remoteVol = 0;
    if (analyserRemote) {
        analyserRemote.getByteFrequencyData(dataArrayRemote);
        let sum = 0;
        for (let i = 0; i < dataArrayRemote.length; i++) sum += dataArrayRemote[i];
        remoteVol = sum / dataArrayRemote.length;
    }

    // Determine who is P1 and P2
    const myAvatar = window.isHost ? document.getElementById('p1-avatar') : document.getElementById('p2-avatar');
    const oppAvatar = window.isHost ? document.getElementById('p2-avatar') : document.getElementById('p1-avatar');

    if (myAvatar) applyGlow(myAvatar, localVol);
    if (oppAvatar) applyGlow(oppAvatar, remoteVol);
};

const applyGlow = (el, volume) => {
    if (volume > 15) {
        const intensity = Math.min(volume / 50, 1);
        el.style.boxShadow = \`0 0 \${10 + intensity * 20}px rgba(0, 255, 100, \${0.4 + intensity * 0.6})\`;
        el.style.borderColor = '#00ff64';
    } else {
        el.style.boxShadow = '';
        el.style.borderColor = '';
    }
};

window.stopVoiceChat = stopVoiceChat;
