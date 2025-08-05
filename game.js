// Game Configuration
const GAME_CONFIG = {
    speeds: {
        slow: 0.8,   // Much slower
        normal: 1.2,
        fast: 1.8
    },
    jumpHeight: 150,
    jumpDuration: 800,  // Longer jump duration
    obstacleMinDistance: 1800,  // Wider minimum space between obstacle groups
    obstacleMaxDistance: 6000,  // Much wider range for more variety
    obstacleGroupSizes: [1, 1, 1, 2, 2, 3, 1, 1, 2], // More varied - extra singles and doubles
    obstacleGapInGroup: 80,     // Much smaller gap - trees close enough for single jump
    hintJumpTime: 1500,    // 1.5 seconds optimal jump time - earlier warning
    hintDisplayTime: 500,  // How long to show jump hint
    playerColors: ['#FF4444', '#4488FF', '#FFD700', '#44AA44'],
    playerEmojis: ['🔴', '🔵', '🟡', '🟢']  // Simple colored circles for identification
};

// Game State
let gameState = {
    isPlaying: false,
    isPaused: false,
    numPlayers: 1,
    currentScreen: 'mainMenu',
    score: 0,
    highScore: 0,
    gameSpeed: 'normal',
    soundEnabled: true,
    jumpHintsEnabled: [true, true, true, true], // Per-player hint settings
    players: [],
    obstacles: [],
    gameStartTime: null,
    lastObstacleTime: 0
};

// Audio Context for sound effects
let audioContext;
let soundEffects = {};

// Initialize the game
function initGame() {
    initAudioContext();
    showMainMenu();
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyUp);
    
    // Initialize settings from localStorage
    loadSettings();
}

// Audio System
function initAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        createSoundEffects();
    } catch (error) {
        console.log('Audio not supported');
        gameState.soundEnabled = false;
    }
}

function createSoundEffects() {
    if (!audioContext) return;
    
    // Create simple beep sounds for kids
    soundEffects = {
        jump: createBeepSound(440, 0.1, 'sine'),
        hint: createBeepSound(660, 0.3, 'square'),
        collision: createBeepSound(220, 0.5, 'sawtooth'),
        score: createBeepSound(880, 0.2, 'sine')
    };
}

function createBeepSound(frequency, duration, type = 'sine') {
    return () => {
        if (!gameState.soundEnabled || !audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    };
}

function playSound(soundName) {
    if (soundEffects[soundName]) {
        soundEffects[soundName]();
    }
}

// Menu Navigation
function showMainMenu() {
    hideAllScreens();
    document.getElementById('mainMenu').classList.remove('hidden');
    gameState.currentScreen = 'mainMenu';
}

function showPlayerSelect() {
    hideAllScreens();
    document.getElementById('playerSelect').classList.remove('hidden');
    gameState.currentScreen = 'playerSelect';
}

function showSettings() {
    hideAllScreens();
    document.getElementById('settings').classList.remove('hidden');
    gameState.currentScreen = 'settings';
    updateSettingsUI();
}

function showInstructions() {
    hideAllScreens();
    document.getElementById('instructions').classList.remove('hidden');
    gameState.currentScreen = 'instructions';
}

function hideAllScreens() {
    const screens = ['mainMenu', 'playerSelect', 'settings', 'instructions', 'gameScreen', 'gameOver'];
    screens.forEach(screen => {
        document.getElementById(screen).classList.add('hidden');
    });
}

// Settings Management
function updateSettingsUI() {
    document.getElementById('soundEffects').checked = gameState.soundEnabled;
    
    // Update per-player hint toggles
    for (let i = 0; i < 4; i++) {
        const toggle = document.getElementById(`jumpHints${i + 1}`);
        if (toggle) {
            toggle.checked = gameState.jumpHintsEnabled[i];
        }
    }
    
    document.getElementById('gameSpeed').value = gameState.gameSpeed;
    
    // Update high score display in score area
    updateScore();
}

function loadSettings() {
    const settings = localStorage.getItem('dinoGameSettings');
    if (settings) {
        try {
            const parsed = JSON.parse(settings);
            gameState.soundEnabled = parsed.soundEnabled !== undefined ? parsed.soundEnabled : true;
            
            // Handle both old boolean format and new array format
            if (Array.isArray(parsed.jumpHintsEnabled)) {
                gameState.jumpHintsEnabled = parsed.jumpHintsEnabled;
            } else if (typeof parsed.jumpHintsEnabled === 'boolean') {
                // Convert old boolean format to array format
                const oldValue = parsed.jumpHintsEnabled;
                gameState.jumpHintsEnabled = [oldValue, oldValue, oldValue, oldValue];
                saveSettings(); // Save the converted format
            } else {
                gameState.jumpHintsEnabled = [true, true, true, true];
            }
            
            gameState.gameSpeed = parsed.gameSpeed || 'normal';
            gameState.highScore = parsed.highScore || 0;
        } catch (e) {
            console.error('Error loading settings:', e);
            // Reset to defaults if corrupt
            gameState.jumpHintsEnabled = [true, true, true, true];
            saveSettings();
        }
    } else {
        gameState.jumpHintsEnabled = [true, true, true, true];
    }
}

function saveSettings() {
    const settings = {
        soundEnabled: gameState.soundEnabled,
        jumpHintsEnabled: gameState.jumpHintsEnabled,
        gameSpeed: gameState.gameSpeed,
        highScore: gameState.highScore
    };
    localStorage.setItem('dinoGameSettings', JSON.stringify(settings));
}

// Event Listeners for Settings
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    document.getElementById('soundEffects').addEventListener('change', (e) => {
        gameState.soundEnabled = e.target.checked;
        saveSettings();
    });
    
    // Per-player hint toggle listeners
    for (let i = 0; i < 4; i++) {
        document.getElementById(`jumpHints${i + 1}`).addEventListener('change', (e) => {
            gameState.jumpHintsEnabled[i] = e.target.checked;
            saveSettings();
        });
    }
    
    document.getElementById('gameSpeed').addEventListener('change', (e) => {
        gameState.gameSpeed = e.target.value;
        saveSettings();
    });
    
    document.getElementById('clearHighScore').addEventListener('click', () => {
        clearHighScore();
    });
});

// Game Start
function startGame(numPlayers) {
    gameState.numPlayers = numPlayers;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.gameStartTime = Date.now();
    gameState.lastObstacleTime = 0;
    gameState.players = [];
    gameState.obstacles = [];
    
    // Clear any existing hints from previous game
    clearAllHints();
    
    hideAllScreens();
    document.getElementById('gameScreen').classList.remove('hidden');
    gameState.currentScreen = 'gameScreen';
    
    createPlayers();
    updateScore();
    startGameLoop();
}

function createPlayers() {
    const container = document.getElementById('playersContainer');
    container.innerHTML = '';
    container.className = `players-${gameState.numPlayers}`;
    
    for (let i = 0; i < gameState.numPlayers; i++) {
        // Create player data
        const player = {
            id: i + 1,
            isJumping: false,
            isAlive: true,
            jumpStartTime: 0,
            crashDistance: 0,
            keys: getPlayerKeys(i),
            element: null,
            areaElement: null
        };
        
        // Create player area
        const playerArea = document.createElement('div');
        playerArea.className = 'player-area';
        playerArea.id = `player-area-${i + 1}`;
        
        // Add player info
        const playerInfo = document.createElement('div');
        playerInfo.className = 'player-info';
        playerInfo.innerHTML = `${GAME_CONFIG.playerEmojis[i]} Player ${i + 1}`;
        playerArea.appendChild(playerInfo);
        
        // Add ground
        const ground = document.createElement('div');
        ground.className = 'game-ground';
        playerArea.appendChild(ground);
        
        // Create dino
        const dino = document.createElement('div');
        dino.className = `dino player-${i + 1} running`;
        dino.id = `dino-${i + 1}`;
        playerArea.appendChild(dino);
        
        // Add clouds for decoration
        for (let c = 1; c <= 3; c++) {
            if (Math.random() > 0.3) {
                const cloud = document.createElement('div');
                cloud.className = `cloud cloud-${c}`;
                cloud.style.animationDelay = `${Math.random() * 15}s`;
                playerArea.appendChild(cloud);
            }
        }
        
        // Create hint overlay for this player
        const hintOverlay = document.createElement('div');
        hintOverlay.className = 'player-hint-overlay';  // Remove hidden for testing
        hintOverlay.id = `hint-overlay-${i + 1}`;
        hintOverlay.style.opacity = '0'; // Start invisible but not hidden
        
        const hintJump = document.createElement('div');
        hintJump.className = 'hint-jump';
        hintJump.textContent = '⬆️';
        hintOverlay.appendChild(hintJump);
        
        playerArea.appendChild(hintOverlay);

        container.appendChild(playerArea);
        
        player.element = dino;
        player.areaElement = playerArea;
        player.hintOverlay = hintOverlay;
        gameState.players.push(player);
    }
}

function getPlayerKeys(playerIndex) {
    const keyMappings = [
        { jump: ['Space'] },        // Player 1: Space
        { jump: ['Enter'] },        // Player 2: Enter  
        { jump: ['ArrowUp'] },      // Player 3: Up Arrow
        { jump: ['KeyW'] }          // Player 4: W key (no numpad needed)
    ];
    return keyMappings[playerIndex] || { jump: ['Space'] };
}

// Game Loop
function startGameLoop() {
    if (!gameState.isPlaying) return;
    
    updateGame();
    requestAnimationFrame(startGameLoop);
}

function updateGame() {
    if (gameState.isPaused || !gameState.isPlaying) return;
    
    const currentTime = Date.now();
    const gameTime = currentTime - gameState.gameStartTime;
    
    // Update score
    gameState.score = Math.floor(gameTime / 100);
    updateScore();
    
    // Update players
    updatePlayers(currentTime);
    
    // Generate obstacles
    generateObstacles(currentTime);
    
    // Update obstacles
    updateObstacles();
    
    // Check collisions
    checkCollisions();
    
    // Check if all players are dead
    if (gameState.players.every(player => !player.isAlive)) {
        endGameRound();
    }
}

function updatePlayers(currentTime) {
    gameState.players.forEach(player => {
        if (!player.isAlive) return;
        
        // Update jumping animation
        if (player.isJumping) {
            const jumpProgress = (currentTime - player.jumpStartTime) / GAME_CONFIG.jumpDuration;
            if (jumpProgress >= 1) {
                player.isJumping = false;
                player.element.classList.remove('jumping');
                player.element.classList.add('running');
            }
        }
    });
}

function generateObstacles(currentTime) {
    const timeSinceLastObstacle = currentTime - gameState.lastObstacleTime;
    const minDistance = GAME_CONFIG.obstacleMinDistance;
    const maxDistance = GAME_CONFIG.obstacleMaxDistance;
    
    // Much more varied spacing patterns
    const randomFactor = Math.random();
    let nextObstacleTime;
    
    if (randomFactor < 0.15) {
        // 15% chance: Rapid fire challenge  
        nextObstacleTime = minDistance * 0.6;
    } else if (randomFactor < 0.3) {
        // 15% chance: Quick succession
        nextObstacleTime = minDistance * 0.8;
    } else if (randomFactor < 0.5) {
        // 20% chance: Normal close spacing
        nextObstacleTime = minDistance + Math.random() * (maxDistance - minDistance) * 0.3;
    } else if (randomFactor < 0.7) {
        // 20% chance: Medium spacing
        nextObstacleTime = minDistance + Math.random() * (maxDistance - minDistance) * 0.6;
    } else if (randomFactor < 0.85) {
        // 15% chance: Long break
        nextObstacleTime = minDistance + Math.random() * (maxDistance - minDistance) * 0.8;
    } else {
        // 15% chance: Epic break (huge recovery time)
        nextObstacleTime = minDistance + Math.random() * (maxDistance - minDistance);
    }
    
    if (timeSinceLastObstacle > nextObstacleTime) {
        createObstacleGroup();
        gameState.lastObstacleTime = currentTime;
    }
}

function createObstacleGroup() {
    // Add variety by sometimes skipping obstacle groups entirely
    if (Math.random() < 0.1) {
        // 10% chance: Complete empty space (no obstacles)
        return;
    }
    
    // Randomly choose group size with more variety
    let groupSize = GAME_CONFIG.obstacleGroupSizes[Math.floor(Math.random() * GAME_CONFIG.obstacleGroupSizes.length)];
    
    // Sometimes create extra large groups for experienced players
    if (Math.random() < 0.05) {
        groupSize = 4; // Rare 4-tree group
    }
    
    // Vary the gap between trees in groups for more challenge variety
    let gapBetweenTrees = GAME_CONFIG.obstacleGapInGroup;
    if (Math.random() < 0.3) {
        // 30% chance: Tighter formation 
        gapBetweenTrees = GAME_CONFIG.obstacleGapInGroup * 0.7;
    } else if (Math.random() < 0.2) {
        // 20% chance: Wider formation
        gapBetweenTrees = GAME_CONFIG.obstacleGapInGroup * 1.4;
    }
    
    // Create obstacles for each tree in the group
    for (let treeIndex = 0; treeIndex < groupSize; treeIndex++) {
        setTimeout(() => {
            createSingleObstacle();
        }, treeIndex * gapBetweenTrees);
    }
}

function createSingleObstacle() {
    gameState.players.forEach((player, index) => {
        if (!player.isAlive) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        // Vary tree types for visual interest with more options
        const treeTypes = ['🌳', '🌲', '🎄', '🌴', '🎋'];  // Mix of trees and plants
        const selectedTree = treeTypes[Math.floor(Math.random() * treeTypes.length)];
        
        // Create tree obstacle
        const obstacleDiv = document.createElement('div');
        obstacleDiv.className = 'tree';
        obstacleDiv.setAttribute('data-tree-type', selectedTree);
        obstacle.appendChild(obstacleDiv);
        
        // Set animation speed based on game speed
        const speed = GAME_CONFIG.speeds[gameState.gameSpeed];
        obstacle.style.animationDuration = `${4 / speed}s`;
        
        player.areaElement.appendChild(obstacle);
        
        // Store obstacle data
        gameState.obstacles.push({
            element: obstacle,
            playerIndex: index,
            createdTime: Date.now(),
            hintShown: false  // Track if hint was shown for this obstacle
        });
        
        // Remove obstacle after animation
        setTimeout(() => {
            if (obstacle.parentNode) {
                obstacle.parentNode.removeChild(obstacle);
            }
            gameState.obstacles = gameState.obstacles.filter(obs => obs.element !== obstacle);
        }, (4 / speed) * 1000 + 1000);
    });
}

function updateObstacles() {
    // Check distance-based hints for each obstacle
    gameState.obstacles.forEach(obstacle => {
        checkDistanceBasedHints(obstacle);
    });
}

function checkDistanceBasedHints(obstacle) {
    // Only check if game is playing
    if (!gameState.isPlaying || obstacle.hintShown) {
        return;
    }
    
    const player = gameState.players[obstacle.playerIndex];
    if (!player || !player.isAlive || player.isJumping) {
        return; // Don't show hint if player is mid-jump
    }
    
    // Check if hints are enabled for this specific player
    if (!gameState.jumpHintsEnabled[obstacle.playerIndex]) {
        return;
    }
    
    // Get positions
    const obstacleRect = obstacle.element.getBoundingClientRect();
    const dinoRect = player.element.getBoundingClientRect();
    
    // Calculate distance between obstacle and player
    const distance = obstacleRect.left - dinoRect.right;
    
    // Show hint when obstacle is at optimal distance (about 200-300px away)
    if (distance > 180 && distance < 250) {
        obstacle.hintShown = true; // Mark hint as shown for this obstacle
        showHintForPlayer(obstacle.playerIndex);
        playSound('hint');
        
        // Auto-hide jump hint after short time
        setTimeout(() => {
            if (gameState.isPlaying) {
                hideHintForPlayer(obstacle.playerIndex);
            }
        }, GAME_CONFIG.hintDisplayTime);
    }
}

function showHintForPlayer(playerIndex) {
    const player = gameState.players[playerIndex];
    if (player && player.hintOverlay) {
        player.hintOverlay.style.opacity = '1';
    }
}

function hideHintForPlayer(playerIndex) {
    const player = gameState.players[playerIndex];
    if (player && player.hintOverlay) {
        player.hintOverlay.style.opacity = '0';
    }
}

function clearAllHints() {
    // Hide all player hints
    gameState.players.forEach((player, index) => {
        hideHintForPlayer(index);
    });
    
    // Reset all obstacle hint flags when game ends
    gameState.obstacles.forEach(obstacle => {
        obstacle.hintShown = false;
    });
}

function checkCollisions() {
    gameState.obstacles.forEach(obstacle => {
        const player = gameState.players[obstacle.playerIndex];
        if (!player || !player.isAlive || player.isJumping) return;
        
        const obstacleRect = obstacle.element.getBoundingClientRect();
        const dinoRect = player.element.getBoundingClientRect();
        
        // Simple collision detection
        if (obstacleRect.left < dinoRect.right - 10 && 
            obstacleRect.right > dinoRect.left + 10 &&
            obstacleRect.bottom > dinoRect.top + 10) {
            
            // Player hit obstacle
            player.isAlive = false;
            player.crashDistance = gameState.score; // Store distance when crashed
            player.element.classList.add('collision');
            player.element.classList.remove('running');
            playSound('collision');
            
            // Add visual effect
            player.element.style.opacity = '0.5';
            player.element.style.transform = 'rotate(90deg)';
        }
    });
}

function updateScore() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (!scoreDisplay) return; // Safety check - element might not exist on main menu
    
    const aliveCount = gameState.players.filter(p => p.isAlive).length;
    scoreDisplay.textContent = `Score: ${gameState.score}m | High: ${gameState.highScore}m | Alive: ${aliveCount}/${gameState.numPlayers}`;
}

// Input Handling
function handleKeyPress(event) {
    if (gameState.currentScreen !== 'gameScreen' || gameState.isPaused) return;
    
    // Prevent default for game keys
    const gameKeys = ['Space', 'Enter', 'KeyI', 'Numpad8'];
    if (gameKeys.includes(event.code)) {
        event.preventDefault();
    }
    
    // Handle player jumps
    gameState.players.forEach(player => {
        if (!player.isAlive || player.isJumping) return;
        
        if (player.keys.jump.includes(event.code)) {
            playerJump(player);
        }
    });
    
    // Handle pause
    if (event.code === 'Escape') {
        togglePause();
    }
}

function handleKeyUp(event) {
    // Handle key up events if needed
}

function playerJump(player) {
    if (player.isJumping || !player.isAlive) return;
    
    player.isJumping = true;
    player.jumpStartTime = Date.now();
    player.element.classList.remove('running');
    player.element.classList.add('jumping');
    
    playSound('jump');
}

// Game Controls
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = gameState.isPaused ? '▶️' : '⏸️';
    
    if (gameState.isPaused) {
        // Pause all animations
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            obstacle.style.animationPlayState = 'paused';
        });
    } else {
        // Resume animations
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            obstacle.style.animationPlayState = 'running';
        });
    }
}

function endGame() {
    gameState.isPlaying = false;
    clearAllHints();
    showMainMenu();
}

function endGameRound() {
    gameState.isPlaying = false;
    clearAllHints();
    
    // Check for new high score
    let isNewHighScore = false;
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        isNewHighScore = true;
        saveSettings(); // Save the new high score
    }
    
    hideAllScreens();
    document.getElementById('gameOver').classList.remove('hidden');
    gameState.currentScreen = 'gameOver';
    
    displayFinalScores(isNewHighScore);
    playSound('score');
}

function displayFinalScores(isNewHighScore = false) {
    const finalScores = document.getElementById('finalScores');
    let scoresHTML = '';
    
    if (isNewHighScore) {
        scoresHTML += `<h3>🎉 NEW HIGH SCORE! 🎉</h3>`;
        scoresHTML += `<div class="high-score-celebration">
            <div class="score-item new-record">
                <span>🚀 Amazing! New Record:</span>
                <span>${gameState.score} meters!</span>
            </div>
        </div>`;
    } else {
        scoresHTML += `<h3>🏆 Final Results 🏆</h3>`;
    }
    
    // Calculate player distances and determine medals
    const playerDistances = gameState.players.map((player, index) => ({
        playerIndex: index,
        distance: player.isAlive ? gameState.score : (player.crashDistance || 0)
    }));
    
    // Sort by distance to determine rankings (but keep display order by player index)
    const sortedByDistance = [...playerDistances].sort((a, b) => b.distance - a.distance);
    const medals = ['🥇', '🥈', '🥉']; // Only 3 medals
    
    gameState.players.forEach((player, index) => {
        const distance = player.isAlive ? gameState.score : (player.crashDistance || 0);
        
        // Find this player's rank
        const rank = sortedByDistance.findIndex(p => p.playerIndex === index);
        const medal = rank < 3 ? medals[rank] + ' ' : ''; // Only show medal for top 3
        
        scoresHTML += `<div class="score-item">
            <span class="player-name">
                ${GAME_CONFIG.playerEmojis[index]} Player ${index + 1}:
            </span>
            <span>${medal}${distance}m</span>
        </div>`;
    });
    
    // Add high score at the bottom (only if not a new high score)
    if (!isNewHighScore) {
        scoresHTML += `<div class="score-item" style="margin-top: 1rem; border-top: 2px solid #ddd; padding-top: 0.5rem;">
            <span>🏅 High Score:&nbsp;</span>
            <span>${gameState.highScore} meters</span>
        </div>`;
    }
    
    finalScores.innerHTML = scoresHTML;
}

function restartGame() {
    startGame(gameState.numPlayers);
}

function clearHighScore() {
    // Confirm before clearing
    if (confirm(`🏆 Are you sure you want to clear your high score of ${gameState.highScore}m?\n\nThis cannot be undone! 🗑️`)) {
        gameState.highScore = 0;
        saveSettings();
        updateScore(); // Update display if in game
        
        // Show confirmation
        alert('🎯 High score cleared! Time to set a new record! 🚀');
    }
}

// Initialize game when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
