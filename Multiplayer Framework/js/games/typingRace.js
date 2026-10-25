window.GameEngine.registerGame('typingRace', {
    isP1: false,
    textToType: "Aku adalah anak gen-z yang suka main game multiplayer seru bareng teman-teman di web ini.",
    
    getInitialState: function() {
        return {
            p1Progress: 0,
            p2Progress: 0,
            status: 'waiting',
            winner: null
        };
    },

    getHTML: function() {
        return `
        <div class="w-full flex flex-col items-center max-w-[400px] mx-auto pt-4">
            <div class="clay-panel px-4 py-1 rounded-full border-purple-500 mb-4 shrink-0">
                <h3 class="text-xs font-mono tracking-widest text-purple-500 uppercase">Typing Race</h3>
            </div>
            
            <p id="tr-status" class="mb-4 font-mono text-xs uppercase tracking-widest text-center px-4 py-1 rounded-xl bg-white/5 border border-gray-200">Menunggu...</p>
            
            <div class="w-full mb-6">
                <div class="text-xs font-mono font-bold text-clay-tertiary mb-1">Player 1</div>
                <div class="w-full bg-gray-800 rounded-full h-3 mb-3">
                    <div id="tr-bar-p1" class="bg-clay-tertiary h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>

                <div class="text-xs font-mono font-bold text-clay-accent mb-1">Player 2</div>
                <div class="w-full bg-gray-800 rounded-full h-3">
                    <div id="tr-bar-p2" class="bg-clay-accent h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
            </div>

            <div class="clay-card w-full p-6 rounded-3xl mb-4 border border-gray-200">
                <p id="tr-target" class="font-mono text-sm leading-relaxed text-gray-500 select-none"></p>
            </div>

            <input type="text" id="tr-input" oninput="window.GameEngine.games.typingRace.handleInput(this.value)" class="w-full bg-dark-card border-2 border-purple-500 rounded-xl px-4 py-3 font-mono text-clay-text outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition" placeholder="Ketik di sini..." disabled autocomplete="off">
        </div>
        `;
    },

    init: function() {
        // Render target text with spans
        const targetEl = document.getElementById('tr-target');
        if (targetEl) {
            targetEl.innerHTML = this.textToType.split('').map(char => `<span>${char}</span>`).join('');
        }
    },

    updateUI: function(state, isP1) {
        this.isP1 = isP1;
        const statusEl = document.getElementById('tr-status');
        const barP1 = document.getElementById('tr-bar-p1');
        const barP2 = document.getElementById('tr-bar-p2');
        const input = document.getElementById('tr-input');

        if (!statusEl) return;

        barP1.style.width = `${(state.p1Progress / this.textToType.length) * 100}%`;
        barP2.style.width = `${(state.p2Progress / this.textToType.length) * 100}%`;

        if (state.status === 'waiting') {
            statusEl.innerText = "Bersiap...";
            if (window.isHost) {
                setTimeout(() => {
                    if(window.syncRoomState) window.syncRoomState({ 'gameState.status': 'playing' });
                }, 3000);
            }
        } 
        else if (state.status === 'playing') {
            statusEl.innerText = "KETIK SEKARANG!";
            if (input.disabled) {
                input.disabled = false;
                input.focus();
            }
        }
        else if (state.status === 'finished') {
            statusEl.innerText = state.winner === 'p1' ? "PLAYER 1 MENANG!" : (state.winner === 'p2' ? "PLAYER 2 MENANG!" : "SERI!");
            input.disabled = true;
        }
    },

    handleInput: function(val) {
        if (!window.roomData || window.roomData.gameState.status !== 'playing') return;
        
        // Highlight logic
        const targetEl = document.getElementById('tr-target');
        const spans = targetEl.querySelectorAll('span');
        
        let correctCount = 0;
        for (let i = 0; i < spans.length; i++) {
            if (i < val.length) {
                if (val[i] === this.textToType[i]) {
                    spans[i].className = 'text-clay-text font-bold';
                    correctCount++;
                } else {
                    spans[i].className = 'text-red-500 bg-red-500/20';
                }
            } else {
                spans[i].className = '';
            }
        }

        // Sync progress
        const key = this.isP1 ? 'gameState.p1Progress' : 'gameState.p2Progress';
        if (window.syncRoomState) {
            let updates = {};
            updates[key] = correctCount;

            // Check win
            if (correctCount === this.textToType.length) {
                updates['gameState.status'] = 'finished';
                updates['gameState.winner'] = this.isP1 ? 'p1' : 'p2';
                const mainP1 = window.roomData.p1.score + (this.isP1 ? 1 : 0);
                const mainP2 = window.roomData.p2.score + (!this.isP1 ? 1 : 0);
                updates['p1.score'] = mainP1;
                updates['p2.score'] = mainP2;
            }

            window.syncRoomState(updates);
        }
    }
});
