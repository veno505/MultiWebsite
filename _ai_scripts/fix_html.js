const fs = require('fs');
let html = fs.readFileSync('WEBSITE GAME.html', 'utf8');

const correctCode = `
                        setTimeout(() => {
                            window.moveLudoPiece('p2');
                        }, 1000);
                    }, 1000);
                }
            }
            updateGameUI();
        };

        // --- 13. EMOTES & CHAT COMMS ---
        window.showTurnPopup = (isMyTurn) => {
            const popup = document.getElementById('turn-popup');
            const text = document.getElementById('turn-popup-text');
            if (isMyTurn) {
                text.innerText = "GILIRANMU!";
                text.className = "font-heading font-black text-3xl sm:text-5xl text-theme-accent1 drop-shadow-md";
                if (AudioEngine.initialized && !AudioEngine.muted) AudioEngine.synth.triggerAttackRelease("C6", "8n");
            } else {
                text.innerText = "Giliran Lawan...";
                text.className = "font-heading font-bold text-xl sm:text-2xl text-theme-muted";
            }
            popup.classList.add('show');
            setTimeout(() => popup.classList.remove('show'), 1500);
        };

        window.sendEmote = async (emoji) => {
            AudioEngine.playEmote();
            if (!currentRoomId) return;
            const isP1 = currentUser.uid === roomData?.p1?.uid;
            try {
                await updateDoc(doc(db, "rooms", currentRoomId), {
                    action: { type: 'emote', emoji: emoji, sender: isP1 ? 'p1' : 'p2', ts: Date.now() }
                });
            } catch(e) { console.error(e); }
        };

        window.sendBuzz = async () => {
            if (!currentRoomId) return;
            const isP1 = currentUser.uid === roomData?.p1?.uid;
            try {
                await updateDoc(doc(db, "rooms", currentRoomId), {
                    action: { type: 'buzz', sender: isP1 ? 'p1' : 'p2', ts: Date.now() }
                });
                const btn = document.querySelector('button[onclick="sendBuzz()"]');
                if(btn) {
                    btn.classList.add('opacity-50');
                    setTimeout(()=>btn.classList.remove('opacity-50'), 1000);
                }
            } catch(e) { console.error(e); }
        };

        window.toggleChat = () => {
            AudioEngine.playClick();
            const drawer = document.getElementById('chat-drawer');
            const backdrop = document.getElementById('chat-backdrop');
            const badge = document.getElementById('chat-badge');
`;

html = html.replace(/setTimeout\(\(\)\s*=>\s*\{\s*window\.moveLudoPiece\('p2'\);\s*\},\s*1000\);\s*const badge = document\.getElementById\('chat-badge'\);/, correctCode.trim());

fs.writeFileSync('WEBSITE GAME.html', html);
console.log('Fixed');
