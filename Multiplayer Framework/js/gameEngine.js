window.GameEngine = {
    games: {}, // Stores loaded game modules
    currentGame: null,

    registerGame: function (gameId, gameModule) {
        this.games[gameId] = gameModule;
        console.log(`Game ${gameId} registered.`);
    },

    loadGameScript: function (gameId) {
        return new Promise((resolve, reject) => {
            if (this.games[gameId]) return resolve(); // Already loaded

            const script = document.createElement('script');
            script.src = `js/games/${gameId}.js`;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${gameId}`));
            document.body.appendChild(script);
        });
    },

    initGame: async function (gameId, isHost, initialGameState = null) {
        // Hide all old games
        const container = document.getElementById('dynamic-game-container');
        if (container) container.innerHTML = ''; // Clear container

        // Ensure script is loaded
        await this.loadGameScript(gameId);

        if (!this.games[gameId]) {
            console.error('Game not found:', gameId);
            return null;
        }

        this.currentGame = gameId;

        // Call the module's HTML injector
        const gameHtml = this.games[gameId].getHTML();
        if (container) {
            container.innerHTML = gameHtml;
        }

        // Run host specific initializations if needed
        let finalInitialState = initialGameState;
        if (isHost && this.games[gameId].getInitialState && !initialGameState) {
            finalInitialState = this.games[gameId].getInitialState();
        }

        return finalInitialState;
    },

    onStateUpdate: function (state, isP1) {
        if (this.currentGame && this.games[this.currentGame] && this.games[this.currentGame].updateUI) {
            this.games[this.currentGame].updateUI(state, isP1);
        }
    }
};
