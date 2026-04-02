import { useState, useEffect, useRef } from 'react';

const CAR_TYPES = {
  sports: {
    name: 'Sports Car',
    acceleration: 0.2,
    maxSpeed: 6,
    friction: 0.90,
    color: '#FF0000',
    emoji: '🏎️'
  },
  truck: {
    name: 'Truck',
    acceleration: 0.12,
    maxSpeed: 4,
    friction: 0.93,
    color: '#FFB300',
    emoji: '🚚'
  },
  police: {
    name: 'Police Car',
    acceleration: 0.18,
    maxSpeed: 5.5,
    friction: 0.91,
    color: '#0033FF',
    emoji: '🚓'
  },
  taxi: {
    name: 'Taxi',
    acceleration: 0.15,
    maxSpeed: 4.8,
    friction: 0.92,
    color: '#FFFF00',
    emoji: '🚕'
  }
};

const THEMES = {
  day: {
    name: 'Day',
    roadColor: '#555555',
    roadEdge: '#888888',
    grassColor: '#228B22',
    skyColor: '#87CEEB',
    background: 'linear-gradient(to bottom, #87CEEB, #E0E0E0)'
  },
  night: {
    name: 'Night',
    roadColor: '#1a1a1a',
    roadEdge: '#333333',
    grassColor: '#0d3d0d',
    skyColor: '#001a33',
    background: 'linear-gradient(to bottom, #001a33, #1a1a2e)'
  },
  desert: {
    name: 'Desert',
    roadColor: '#996633',
    roadEdge: '#CCAA77',
    grassColor: '#DAA520',
    skyColor: '#FFB347',
    background: 'linear-gradient(to bottom, #FFB347, #F0E68C)'
  },
  snow: {
    name: 'Snow',
    roadColor: '#DDDDDD',
    roadEdge: '#FFFFFF',
    grassColor: '#FFFFFF',
    skyColor: '#B0E0E6',
    background: 'linear-gradient(to bottom, #B0E0E6, #F0FFFF)'
  }
};

const DIFFICULTIES = {
  easy: { name: 'Easy', spawnRate: 1.2, multiplier: 0.8, lives: 5 },
  normal: { name: 'Normal', spawnRate: 1, multiplier: 1, lives: 3 },
  hard: { name: 'Hard', spawnRate: 0.8, multiplier: 1.5, lives: 2 },
  insane: { name: 'Insane', spawnRate: 0.6, multiplier: 2, lives: 1 }
};

const POWER_UPS = {
  shield: { name: 'Shield', color: '#FFD700', emoji: '🛡️', duration: 300 },
  speedBoost: { name: 'Speed Boost', color: '#FF6347', emoji: '⚡', duration: 200 },
  slowMo: { name: 'Slow Motion', color: '#87CEEB', emoji: '🐌', duration: 250 },
  magnet: { name: 'Magnet', color: '#FF1493', emoji: '🧲', duration: 200 }
};

const OBSTACLE_TYPES = {
  sedan: { name: 'Sedan', color: '#FF3333' },
  suv: { name: 'SUV', color: '#8B0000' },
  semiTruck: { name: 'Semi Truck', color: '#CC6600' },
  van: { name: 'Van', color: '#990000' },
  sportsCar: { name: 'Sports Car', color: '#FF6600' }
};

// Isometric projection: convert 2D game coords to isometric screen coords
const toIsometric = (x, y, depth = 0) => {
  const isoX = (x - y) * 0.5;
  const isoY = (x + y) * 0.25 - depth;
  return { x: isoX, y: isoY };
};

// Draw isometric cube/car
const drawIsometricCar = (ctx, worldX, worldY, depth, width, height, color, type) => {
  const iso = toIsometric(worldX, worldY, depth);
  const isoW = width * 0.5;
  const isoH = height * 0.25;

  // Top surface (front facing)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(iso.x, iso.y);
  ctx.lineTo(iso.x + isoW, iso.y + isoW * 0.5);
  ctx.lineTo(iso.x + isoW, iso.y + isoW * 0.5 + isoH);
  ctx.lineTo(iso.x, iso.y + isoH);
  ctx.closePath();
  ctx.fill();

  // Left side
  ctx.fillStyle = adjustBrightness(color, -30);
  ctx.beginPath();
  ctx.moveTo(iso.x, iso.y);
  ctx.lineTo(iso.x - isoW * 0.3, iso.y + isoW * 0.15);
  ctx.lineTo(iso.x - isoW * 0.3, iso.y + isoW * 0.15 + isoH);
  ctx.lineTo(iso.x, iso.y + isoH);
  ctx.closePath();
  ctx.fill();

  // Right side
  ctx.fillStyle = adjustBrightness(color, -50);
  ctx.beginPath();
  ctx.moveTo(iso.x + isoW, iso.y + isoW * 0.5);
  ctx.lineTo(iso.x + isoW + isoW * 0.3, iso.y + isoW * 0.65);
  ctx.lineTo(iso.x + isoW + isoW * 0.3, iso.y + isoW * 0.65 + isoH);
  ctx.lineTo(iso.x + isoW, iso.y + isoW * 0.5 + isoH);
  ctx.closePath();
  ctx.fill();

  // Windows
  ctx.fillStyle = '#AABBDD';
  ctx.fillRect(iso.x + isoW * 0.15, iso.y + isoW * 0.15, isoW * 0.25, isoH * 0.5);
  ctx.fillRect(iso.x + isoW * 0.55, iso.y + isoW * 0.35, isoW * 0.25, isoH * 0.5);

  // Outline
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(iso.x, iso.y);
  ctx.lineTo(iso.x + isoW, iso.y + isoW * 0.5);
  ctx.lineTo(iso.x + isoW + isoW * 0.3, iso.y + isoW * 0.65);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(iso.x, iso.y + isoH);
  ctx.lineTo(iso.x + isoW, iso.y + isoW * 0.5 + isoH);
  ctx.lineTo(iso.x + isoW + isoW * 0.3, iso.y + isoW * 0.65 + isoH);
  ctx.stroke();
};

const adjustBrightness = (color, amount) => {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  const num = parseInt(col, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
};

export default function RacingGameIsometric() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [speed, setSpeed] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [selectedCar, setSelectedCar] = useState('sports');
  const [selectedTheme, setSelectedTheme] = useState('day');
  const [selectedDifficulty, setSelectedDifficulty] = useState('normal');
  const [isPaused, setIsPaused] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [activePowerUp, setActivePowerUp] = useState(null);

  const gameStateRef = useRef({
    playerCar: { lane: 1, depth: 0, speed: 0, maxSpeed: 6, acceleration: 0.2, friction: 0.92 },
    obstacles: [],
    coins: [],
    powerUps: [],
    particles: [],
    score: 0,
    coins: 0,
    combo: 0,
    carsAvoided: 0,
    gameRunning: true,
    gameSpeed: 2,
    spawnCounter: 0,
    keys: {},
    shield: false,
    slowMo: false,
    magnet: false,
    fuel: 100
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameStateRef.current.keys[e.key] = true;
      if (e.key === 'p' || e.key === 'P') setIsPaused((prev) => !prev);
      if (e.key === 'q' || e.key === 'Q') setGameState('menu');
    };
    const handleKeyUp = (e) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    const theme = THEMES[selectedTheme];
    const carType = CAR_TYPES[selectedCar];
    const difficulty = DIFFICULTIES[selectedDifficulty];

    const gameLoop = () => {
      if (!state.gameRunning) return;

      ctx.fillStyle = theme.skyColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road perspective
      const roadWidth = 80;
      const vanishingPoint = { x: canvas.width / 2, y: canvas.height / 2 };

      // Draw road sections going back
      for (let i = 0; i < 20; i++) {
        const depth = (state.playerCar.depth + i) % 400;
        const scale = 1 - depth / 400;
        const width = roadWidth * scale;
        const y = canvas.height * 0.7 - depth * 0.5;

        if (y < 0) continue;

        ctx.fillStyle = i % 2 === 0 ? theme.roadColor : adjustBrightness(theme.roadColor, 20);
        ctx.fillRect(
          vanishingPoint.x - width / 2,
          y,
          width,
          Math.max(1, 20 * scale)
        );

        // Road edges
        ctx.strokeStyle = theme.roadEdge;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vanishingPoint.x - width / 2, y);
        ctx.lineTo(vanishingPoint.x - width / 2, y + Math.max(1, 20 * scale));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(vanishingPoint.x + width / 2, y);
        ctx.lineTo(vanishingPoint.x + width / 2, y + Math.max(1, 20 * scale));
        ctx.stroke();
      }

      // Draw grass
      ctx.fillStyle = theme.grassColor;
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

      // Player car
      const playerLaneX = vanishingPoint.x + (state.playerCar.lane - 1) * 30 - 15;
      const playerY = canvas.height * 0.65;
      drawIsometricCar(ctx, playerLaneX, playerY, 0, 28, 45, carType.color, selectedCar);

      if (state.shield) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(vanishingPoint.x + (state.playerCar.lane - 1) * 30, playerY - 20, 35, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Handle input
      const keys = state.keys;
      if (keys['ArrowLeft'] && state.playerCar.lane > 0) state.playerCar.lane -= 0.05;
      if (keys['ArrowRight'] && state.playerCar.lane < 3) state.playerCar.lane += 0.05;
      if (keys['ArrowUp'] && state.playerCar.speed < state.playerCar.maxSpeed && state.fuel > 0) {
        state.playerCar.speed += state.playerCar.acceleration;
        state.fuel -= 0.1;
      }
      if (keys['ArrowDown'] && state.playerCar.speed > -2) state.playerCar.speed -= state.playerCar.acceleration;

      state.playerCar.speed *= state.playerCar.friction;
      if (Math.abs(state.playerCar.speed) < 0.1) state.playerCar.speed = 0;

      state.playerCar.depth += state.playerCar.speed * 2;

      const slowMoMultiplier = state.slowMo ? 0.5 : 1;

      // Update and draw obstacles
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obstacle = state.obstacles[i];
        obstacle.depth += obstacle.speed * slowMoMultiplier;

        if (obstacle.depth > 400) {
          state.obstacles.splice(i, 1);
          state.score += 10 * difficulty.multiplier;
          state.combo += 1;
          state.carsAvoided += 1;
        } else {
          const obsScale = 1 - obstacle.depth / 400;
          const obsY = canvas.height * 0.7 - obstacle.depth * 0.5;
          const obsLaneX = vanishingPoint.x + (obstacle.lane - 1) * 30 - 15;

          drawIsometricCar(ctx, obsLaneX, obsY, obstacle.depth, 28, 45, OBSTACLE_TYPES[obstacle.type].color, obstacle.type);

          // Collision
          if (
            obstacle.depth > -30 &&
            obstacle.depth < 30 &&
            Math.abs(state.playerCar.lane - obstacle.lane) < 0.8
          ) {
            if (state.shield) {
              state.shield = false;
              state.obstacles.splice(i, 1);
              setActivePowerUp(null);
            } else {
              const newLives = lives - 1;
              setLives(newLives);
              state.combo = 0;
              if (newLives <= 0) {
                state.gameRunning = false;
                setGameState('gameover');
                setFinalScore(state.score);
                saveToLeaderboard(state.score);
              }
            }
          }
        }
      }

      // Spawn obstacles
      state.spawnCounter++;
      const spawnThreshold = (60 - state.gameSpeed * 3) * difficulty.spawnRate;
      if (state.spawnCounter > spawnThreshold) {
        const lanes = [0, 1, 2, 3];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        const obstacleTypes = Object.keys(OBSTACLE_TYPES);
        const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        state.obstacles.push({
          lane: randomLane,
          depth: -200,
          speed: state.gameSpeed + 1,
          type: randomType
        });
        state.spawnCounter = 0;
      }

      // Spawn coins
      if (Math.random() < 0.02) {
        const lanes = [0, 1, 2, 3];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        state.coins.push({
          lane: randomLane,
          depth: -150
        });
      }

      // Spawn power-ups
      if (Math.random() < 0.005) {
        const lanes = [0, 1, 2, 3];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        const puTypes = Object.keys(POWER_UPS);
        const randomPU = puTypes[Math.floor(Math.random() * puTypes.length)];
        state.powerUps.push({
          lane: randomLane,
          depth: -150,
          type: randomPU
        });
      }

      // Update coins
      for (let i = state.coins.length - 1; i >= 0; i--) {
        state.coins[i].depth += 2 * slowMoMultiplier;
        if (state.coins[i].depth > 400) {
          state.coins.splice(i, 1);
        } else if (
          state.coins[i].depth > -30 &&
          state.coins[i].depth < 30 &&
          (state.magnet || Math.abs(state.playerCar.lane - state.coins[i].lane) < 0.8)
        ) {
          state.coins.splice(i, 1);
          state.score += 5;
          state.coins += 1;
        }
      }

      // Draw coins
      for (let coin of state.coins) {
        const coinY = canvas.height * 0.7 - coin.depth * 0.5;
        const coinLaneX = vanishingPoint.x + (coin.lane - 1) * 30;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(coinLaneX, coinY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update power-ups
      for (let i = state.powerUps.length - 1; i >= 0; i--) {
        state.powerUps[i].depth += 2 * slowMoMultiplier;
        if (state.powerUps[i].depth > 400) {
          state.powerUps.splice(i, 1);
        } else if (
          state.powerUps[i].depth > -30 &&
          state.powerUps[i].depth < 30 &&
          Math.abs(state.playerCar.lane - state.powerUps[i].lane) < 0.8
        ) {
          const pu = state.powerUps.splice(i, 1)[0];
          activatePowerUp(pu.type);
        }
      }

      // Draw power-ups
      for (let pu of state.powerUps) {
        const puY = canvas.height * 0.7 - pu.depth * 0.5;
        const puLaneX = vanishingPoint.x + (pu.lane - 1) * 30;
        ctx.fillStyle = POWER_UPS[pu.type].color;
        ctx.fillRect(puLaneX - 8, puY - 8, 16, 16);
        ctx.font = '12px Arial';
        ctx.fillText(POWER_UPS[pu.type].emoji, puLaneX - 6, puY + 4);
      }

      if (state.score % 500 === 0 && state.score > 0) {
        state.gameSpeed += 0.1;
      }

      setScore(Math.round(state.score));
      setCoins(state.coins);
      setSpeed(Math.round(Math.abs(state.playerCar.speed) * 20));
      setCombo(state.combo);
      setLevel(Math.floor(state.gameSpeed) + 1);

      requestAnimationFrame(gameLoop);
    };

    const frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, isPaused, selectedCar, selectedTheme, selectedDifficulty, lives]);

  const activatePowerUp = (type) => {
    const pu = POWER_UPS[type];
    setActivePowerUp(type);

    if (type === 'shield') {
      gameStateRef.current.shield = true;
    } else if (type === 'speedBoost') {
      gameStateRef.current.playerCar.maxSpeed *= 1.5;
    } else if (type === 'slowMo') {
      gameStateRef.current.slowMo = true;
    } else if (type === 'magnet') {
      gameStateRef.current.magnet = true;
    }

    setTimeout(() => {
      if (type === 'shield') gameStateRef.current.shield = false;
      else if (type === 'speedBoost') gameStateRef.current.playerCar.maxSpeed /= 1.5;
      else if (type === 'slowMo') gameStateRef.current.slowMo = false;
      else if (type === 'magnet') gameStateRef.current.magnet = false;
      setActivePowerUp(null);
    }, pu.duration * 1000 / 60);
  };

  const saveToLeaderboard = (finalScore) => {
    const currentBoard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const newEntry = { name: playerName || 'Anonymous', score: finalScore, car: selectedCar, date: new Date().toLocaleDateString() };
    const updatedBoard = [...currentBoard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(updatedBoard));
    setLeaderboard(updatedBoard);
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    setLeaderboard(saved);
  }, []);

  const startGame = () => {
    const carType = CAR_TYPES[selectedCar];
    const difficulty = DIFFICULTIES[selectedDifficulty];
    gameStateRef.current = {
      playerCar: { lane: 1.5, depth: 0, speed: 0, maxSpeed: carType.maxSpeed, acceleration: carType.acceleration, friction: carType.friction },
      obstacles: [],
      coins: [],
      powerUps: [],
      particles: [],
      score: 0,
      coins: 0,
      combo: 0,
      carsAvoided: 0,
      gameRunning: true,
      gameSpeed: 2,
      spawnCounter: 0,
      keys: {},
      shield: false,
      slowMo: false,
      magnet: false,
      fuel: 100
    };
    setScore(0);
    setCoins(0);
    setLives(difficulty.lives);
    setSpeed(0);
    setLevel(1);
    setCombo(0);
    setGameState('playing');
    setIsPaused(false);
    setActivePowerUp(null);
  };

  const theme = THEMES[selectedTheme];
  const carType = CAR_TYPES[selectedCar];
  const difficulty = DIFFICULTIES[selectedDifficulty];

  if (gameState === 'menu') {
    return (
      <div style={{ fontFamily: 'sans-serif', width: '100%', maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '32px' }}>🏁 Racing Game 3D</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Isometric 45° Perspective</p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Player Name:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>Select Your Car</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {Object.entries(CAR_TYPES).map(([key, car]) => (
              <button
                key={key}
                onClick={() => setSelectedCar(key)}
                style={{
                  padding: '12px',
                  border: selectedCar === key ? '3px solid #0066FF' : '1px solid #ddd',
                  borderRadius: '6px',
                  background: selectedCar === key ? '#E6F1FB' : '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: selectedCar === key ? '500' : '400'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{car.emoji}</div>
                <div>{car.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>Select Theme</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {Object.entries(THEMES).map(([key, themeOption]) => (
              <button
                key={key}
                onClick={() => setSelectedTheme(key)}
                style={{
                  padding: '12px',
                  border: selectedTheme === key ? '3px solid #0066FF' : '1px solid #ddd',
                  borderRadius: '6px',
                  background: themeOption.background,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: selectedTheme === key ? '500' : '400',
                  minHeight: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {themeOption.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>Select Difficulty</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {Object.entries(DIFFICULTIES).map(([key, diff]) => (
              <button
                key={key}
                onClick={() => setSelectedDifficulty(key)}
                style={{
                  padding: '12px',
                  border: selectedDifficulty === key ? '3px solid #0066FF' : '1px solid #ddd',
                  borderRadius: '6px',
                  background: selectedDifficulty === key ? '#E6F1FB' : '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedDifficulty === key ? '500' : '400'
                }}
              >
                {diff.name}
              </button>
            ))}
          </div>
        </div>

        {leaderboard.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>🏆 Top Scores</h2>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {leaderboard.map((entry, i) => (
                <div key={i} style={{ padding: '6px 0', fontSize: '12px', borderBottom: '1px solid #ddd' }}>
                  #{i + 1} {entry.name}: {entry.score}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={startGame}
          style={{
            width: '100%',
            padding: '14px',
            background: '#00AA00',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          START GAME
        </button>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div style={{ fontFamily: 'sans-serif', width: '100%', maxWidth: '700px', margin: '0 auto', padding: '10px' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          background: theme.background,
          borderRadius: '8px',
          border: '2px solid #ddd',
          overflow: 'hidden',
          aspectRatio: '16 / 9'
        }}>
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            style={{ display: 'block', width: '100%', height: '100%' }}
          />

          {isPaused && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100
            }}>
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <h2 style={{ marginBottom: '20px' }}>PAUSED</h2>
                <button
                  onClick={() => setIsPaused(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#0066FF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  Resume
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  style={{
                    padding: '10px 20px',
                    background: '#FF3333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Quit
                </button>
              </div>
            </div>
          )}

          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            fontSize: '12px',
            color: 'white',
            textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            zIndex: '10'
          }}>
            <div>❤️ {lives}</div>
            <div>Score: {score}</div>
            <div>🪙 {coins}</div>
            <div>Lvl {level}</div>
            <div>🔥 {combo}</div>
            <div>⛽ 100%</div>
          </div>

          {activePowerUp && (
            <div style={{
              position: 'absolute',
              bottom: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px 16px',
              background: POWER_UPS[activePowerUp].color,
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              zIndex: '10'
            }}>
              {POWER_UPS[activePowerUp].emoji} {POWER_UPS[activePowerUp].name} Active
            </div>
          )}

          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'white',
            textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
            zIndex: '10'
          }}>
            Arrow Keys | P: Pause | Q: Quit
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              flex: 1,
              padding: '10px',
              background: '#0066FF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button
            onClick={() => setGameState('menu')}
            style={{
              flex: 1,
              padding: '10px',
              background: '#FF3333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🛑 Stop
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div style={{ fontFamily: 'sans-serif', width: '100%', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          padding: '30px',
          background: '#f5f5f5',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #ddd'
        }}>
          <h1 style={{ margin: '0 0 20px', fontSize: '28px' }}>💀 Game Over!</h1>
          <div style={{ fontSize: '18px', marginBottom: '20px', color: '#0066FF', fontWeight: 'bold' }}>
            Final Score: {finalScore}
          </div>

          {leaderboard.length > 0 && (
            <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '6px' }}>
              <h3>🏆 Top Scores</h3>
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={i} style={{ fontSize: '12px', padding: '4px 0' }}>
                  #{i + 1} {entry.name}: {entry.score}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => setGameState('menu')}
              style={{
                flex: 1,
                padding: '12px',
                background: '#0066FF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Main Menu
            </button>
            <button
              onClick={startGame}
              style={{
                flex: 1,
                padding: '12px',
                background: '#00AA00',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}
