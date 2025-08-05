# 🚀 Jump Up

A kid-friendly multiplayer game based on Chrome's Dino game. Designed with support and accessibility features for young children.

## Features

### 🎮 Core Gameplay
- **Chrome Dino Style**: Inspired by the classic Chrome offline game
- **Kid-Friendly Design**: Colorful, rounded graphics with cute dinosaur characters
- **Simple Controls**: Easy-to-understand jump mechanics

### 👥 Multiplayer Support
- **1-4 Players**: Split-screen multiplayer for up to 4 players
- **Individual Areas**: Each player gets their own game area
- **Synchronized Obstacles**: All players face the same challenges

### 🧠 Accessibility for Kids
- **Visual Hints**: Flashing warnings before obstacles appear
- **Audio Cues**: Sound effects to indicate when to jump
- **No Reading Required**: Uses emojis and icons instead of text
- **Configurable Difficulty**: Adjustable game speed for different skill levels

### 🎵 Audio & Visual Features
- **Sound Effects**: Kid-friendly beep sounds for actions
- **Visual Feedback**: Colorful animations and effects
- **Hint System**: Optional visual and audio cues for jump timing

## How to Play

### 🎯 Objective
Help the dino friends run as far as possible by jumping over obstacles!

### 🎮 Controls
- **Player 1**: SPACE key
- **Player 2**: ENTER key
- **Player 3**: Arrow Up
- **Player 4**: W Key

### 🚀 Getting Started
1. Choose the number of players (1-4)
2. Watch for flashing hints when obstacles approach
3. Jump at the right time to avoid tree groups and forests
4. Try to keep all players alive as long as possible!

### ⚙️ Settings
- **Sound Effects**: Toggle game sounds on/off
- **Jump Hints**: Enable/disable jump timing symbol ⬆️ (shows at optimal jump moment)
- **Game Speed**: Choose between Slow 🐌 (extra kid-friendly), Normal 🏃, or Fast 🚀

## Installation & Running

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for local server)

### Quick Start
1. Download all files to a folder
2. Open terminal/command prompt in the folder
3. Run: `python3 -m http.server 8000`
4. Open browser and go to: `http://localhost:8000`

### Alternative
Simply open `index.html` directly in your browser (some features may be limited).

## Technical Features

### 🎨 Design Principles
- **High Contrast**: Clear visibility for young eyes
- **Large Elements**: Easy to see and interact with
- **Smooth Animations**: 60fps animations for responsive feel
- **Responsive Design**: Works on different screen sizes

### 🔧 Game Mechanics
- **Physics**: Realistic jump arcs and collision detection
- **Dynamic Obstacles**: Varied spacing and obstacle groups (1-3 trees) for unpredictable gameplay
- **Smart Pacing**: Mix of quick succession, normal spacing, and recovery breaks
- **Fair Play**: All players face identical obstacles
- **State Management**: Persistent settings using localStorage

### 🎵 Audio System
- **Web Audio API**: Real-time sound generation
- **No External Files**: All sounds generated programmatically
- **Volume Control**: Respects system audio settings

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+

## File Structure

```
dino/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── game.js            # Game logic and functionality
└── README.md          # This file
```

## Contributing

This game is designed specifically for young children. When making modifications, please consider:

- **Simplicity**: Keep controls and UI as simple as possible
- **Accessibility**: Ensure features work for children who can't read
- **Safety**: Use only kid-appropriate content and colors
- **Performance**: Maintain smooth 60fps gameplay

## License

This project is open source and available under the MIT License.

---

Made with ❤️ for kids!
