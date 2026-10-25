window.GameEngine.registerGame('tugOfWar', {
    localClicks: 0,
    syncInterval: null,
    isP1: false,
    
    getInitialState: function() {
        return {
            p1Clicks: 0,
            p2Clicks: 0,
            status: 'waiting', // waiting, playing, finished
            winner: null
        };
    },

    getHTML: function() {
        return `
        <div class="w-full flex flex-col items-center max-w-[320px] mx-auto pt-4">
            <div class="clay-panel px-4 py-1 rounded-full border-red-500 mb-6 shrink-0">
                <h3 class="text-xs font-mono tracking-widest text-red-500 uppercase">Tug of War</h3>
            </div>
            
            <p id="tow-status" class="mb-4 font-mono text-sm uppercase tracking-widest text-center px-4 py-2 rounded-xl bg-white/5 border border-gray-200">Menunggu...</p>
            
            <div class="w-full bg-gray-800 rounded-full h-8 mb-8 relative border-2 border-gray-600 overflow-hidden shadow-inner">
                <div id="tow-bar-p1" class="absolute left-0 top-0 h-full bg-clay-tertiary transition-all duration-200 ease-linear" style="width: 50%;"></div>
                <div id="tow-bar-p2" class="absolute right-0 top-0 h-full bg-clay-accent transition-all duration-200 ease-linear" style="width: 50%;"></div>
                <div class="absolute left-1/2 top-0 h-full w-1 bg-white -translate-x-1/2 z-10"></div>
            </div>

            <button id="tow-btn" onclick="window.GameEngine.games.tugOfWar.handleClick()" class="clay-panel border-gray-500 text-gray-500 w-32 h-32 rounded-full font-heading font-black text-2xl uppercase tracking-widest active:scale-90 transition select-none opacity-50 cursor-not-allowed">
                TARIK!
            </button>
        </div>
        `;
    },

    init: function() {
        this.localClicks = 0;
    },

    updateUI: function(state, isP1) {
        this.isP1 = isP1;
        const statusEl = document.getElementById('tow-status');
        const btn = document.getElementById('tow-btn');
        const barP1 = document.getElementById('tow-bar-p1');
        const barP2 = document.getElementById('tow-bar-p2');

        if (!statusEl) return; // not mounted

        let total = state.p1Clicks + state.p2Clicks;
        if (total === 0) total = 1; // prevent div by zero
        let p1Percent = (state.p1Clicks / total) * 100;
        if (state.p1Clicks === 0 && state.p2Clicks === 0) p1Percent = 50;

        barP1.style.width = `${p1Percent}%`;
        barP2.style.width = `${100 - p1Percent}%`;

        if (state.status === 'waiting') {
            statusEl.innerText = "Bersiap...";
            btn.classList.add('opacity-50', 'cursor-not-allowed', 'border-gray-500', 'text-gray-500');
            btn.classList.remove('border-red-500', 'text-red-500', 'shadow-[0_0_20px_rgba(255,0,0,0.5)]');
            
            // Host starts countdown
            if (window.isHost && !this.syncInterval) {
                this.startGameSequence();
            }
        } 
        else if (state.status === 'playing') {
            statusEl.innerText = "TARIK SECEPATNYA!";
            btn.classList.remove('opacity-50', 'cursor-not-allowed', 'border-gray-500', 'text-gray-500');
            btn.classList.add('border-red-500', 'text-red-500', 'shadow-[0_0_20px_rgba(255,0,0,0.5)]');

            if (!this.syncInterval) {
                this.syncInterval = setInterval(() => this.pushClicks(), 300); // Sync every 300ms
            }

            // Host checks win condition (e.g., reaches 100 clicks or time runs out)
            if (window.isHost) {
                if (state.p1Clicks >= 50 || state.p2Clicks >= 50) {
                    this.endGame(state.p1Clicks >= 50 ? 'p1' : 'p2');
                }
            }
        }
        else if (state.status === 'finished') {
            statusEl.innerText = state.winner === 'p1' ? "PLAYER 1 MENANG!" : (state.winner === 'p2' ? "PLAYER 2 MENANG!" : "SERI!");
            btn.classList.add('opacity-50', 'cursor-not-allowed', 'border-gray-500', 'text-gray-500');
            btn.classList.remove('border-red-500', 'text-red-500', 'shadow-[0_0_20px_rgba(255,0,0,0.5)]');
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    },

    handleClick: function() {
        if (!window.roomData || window.roomData.gameState.status !== 'playing') return;
        this.localClicks++;
        window.AudioEngine.playClick();
        
        // Optimistic UI update
        const state = window.roomData.gameState;
        if (this.isP1) state.p1Clicks++; else state.p2Clicks++;
        this.updateUI(state, this.isP1);
    },

    pushClicks: function() {
        if (this.localClicks === 0) return;
        const state = window.roomData.gameState;
        const key = this.isP1 ? 'gameState.p1Clicks' : 'gameState.p2Clicks';
        const current = this.isP1 ? state.p1Clicks : state.p2Clicks;
        
        // Push to Firebase
        if (window.syncRoomState) {
            let update = {};
            update[key] = current; // We already incremented optimistic state, just push current
            window.syncRoomState(update);
        }
        this.localClicks = 0; // Reset local accumulator (not used directly, but ensures we don't double dip if we were accumulating differently)
    },

    startGameSequence: function() {
        this.syncInterval = true; // placeholder to prevent double calling
        setTimeout(() => {
            if (window.syncRoomState) window.syncRoomState({ 'gameState.status': 'playing' });
        }, 3000); // 3 seconds prep
    },

    endGame: function(winner) {
        if (window.syncRoomState) {
            window.syncRoomState({ 
                'gameState.status': 'finished',
                'gameState.winner': winner
            });
            // Give score
            const p1Score = window.roomData.p1.score + (winner === 'p1' ? 1 : 0);
            const p2Score = window.roomData.p2.score + (winner === 'p2' ? 1 : 0);
            window.syncRoomState({ 'p1.score': p1Score, 'p2.score': p2Score });
        }
    }
});
