import { useState, useEffect, useRef } from 'react';

const CAR_TYPES = {
  sports: {
    name: 'Sports Car',
    acceleration: 0.22,
    maxSpeed: 8,
    friction: 0.94,
    color: '#ff2d2d',
    windowColor: '#ffd4d4',
    emoji: '🏎️'
  },
  truck: {
    name: 'Truck',
    acceleration: 0.14,
    maxSpeed: 5,
    friction: 0.95,
    color: '#ffb300',
    windowColor: '#ffe08a',
    emoji: '🚚'
  },
  police: {
    name: 'Police Car',
    acceleration: 0.2,
    maxSpeed: 7,
    friction: 0.94,
    color: '#2d6cff',
    windowColor: '#c9d8ff',
    emoji: '🚓'
  },
  taxi: {
    name: 'Taxi',
    acceleration: 0.18,
    maxSpeed: 6,
    friction: 0.94,
    color: '#ffd000',
    windowColor: '#fff3a8',
    emoji: '🚕'
  }
};

const THEMES = {
  day: {
    name: 'Day',
    skyTop: '#7fd3ff',
    skyBottom: '#dff5ff',
    mountain: '#6d8ca3',
    grass: '#238b23',
    road: '#3e3e3e',
    lane: '#ffffff'
  },
  night: {
    name: 'Night',
    skyTop: '#06172d',
    skyBottom: '#172338',
    mountain: '#243447',
    grass: '#173617',
    road: '#232323',
    lane: '#e5e7eb'
  },
  desert: {
    name: 'Desert',
    skyTop: '#ffb347',
    skyBottom: '#ffe3a3',
    mountain: '#c98c4d',
    grass: '#d4a53a',
    road: '#7c6853',
    lane: '#ff8a65'
  },
  snow: {
    name: 'Snow',
    skyTop: '#cdefff',
    skyBottom: '#ffffff',
    mountain: '#a8bfd0',
    grass: '#f4f4f4',
    road: '#8e8e8e',
    lane: '#2d6cff'
  }
};

export default function RacingGame() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameRunning, setGameRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState('Player 1');
  const [selectedCar, setSelectedCar] = useState('sports');
  const [selectedTheme, setSelectedTheme] = useState('day');

  const gameStateRef = useRef({
    keys: {},
    playerLane: 1,
    roadOffset: 0,
    speed: 0,
    obstacles: [],
    collectibles: [],
    frame: 0
  });

  useEffect(() => {
    const down = (e) => {
      gameStateRef.current.keys[e.key] = true;

      if (e.key.toLowerCase() === 'p') {
        setPaused((prev) => !prev);
      }
    };

    const up = (e) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1000;
    canvas.height = 650;

    const ctx = canvas.getContext('2d');

    const loop = () => {
      const state = gameStateRef.current;
      const car = CAR_TYPES[selectedCar];
      const theme = THEMES[selectedTheme];

      if (gameRunning && !paused && !gameOver) {
        state.frame += 1;

        if (state.keys['ArrowLeft']) {
          state.playerLane = Math.max(0, state.playerLane - 0.08);
        }

        if (state.keys['ArrowRight']) {
          state.playerLane = Math.min(3, state.playerLane + 0.08);
        }

        if (state.keys['ArrowUp']) {
          state.speed = Math.min(car.maxSpeed, state.speed + car.acceleration);
        } else {
          state.speed *= car.friction;
        }

        if (state.keys['ArrowDown']) {
          state.speed = Math.max(0, state.speed - 0.2);
        }

        state.roadOffset += state.speed * 12;

        setSpeed(Math.round(state.speed * 20));
        setScore((prev) => prev + Math.round(state.speed));
        setFuel((prev) => Math.max(0, prev - state.speed * 0.02));

        if (score > 1000) setLevel(2);
        if (score > 3000) setLevel(3);

        if (state.frame % 70 === 0) {
          state.obstacles.push({
            lane: Math.floor(Math.random() * 4),
            z: 0,
            color: ['#ff3b30', '#3b82f6', '#22c55e', '#ffb300'][Math.floor(Math.random() * 4)]
          });
        }

        if (state.frame % 120 === 0) {
          state.collectibles.push({
            lane: Math.floor(Math.random() * 4),
            z: 0,
            type: Math.random() > 0.5 ? 'coin' : 'fuel'
          });
        }

        state.obstacles.forEach((o) => {
          o.z += 0.008 + state.speed * 0.003;
        });

        state.collectibles.forEach((c) => {
          c.z += 0.008 + state.speed * 0.003;
        });

        state.obstacles.forEach((obs, i) => {
          if (obs.z > 0.82 && Math.abs(obs.lane - state.playerLane) < 0.45) {
            setLives((prev) => Math.max(0, prev - 1));
            state.obstacles.splice(i, 1);
          }
        });

        state.collectibles.forEach((item, i) => {
          if (item.z > 0.82 && Math.abs(item.lane - state.playerLane) < 0.45) {
            if (item.type === 'coin') {
              setCoins((prev) => prev + 1);
              setScore((prev) => prev + 50);
            } else {
              setFuel((prev) => Math.min(100, prev + 15));
            }
            state.collectibles.splice(i, 1);
          }
        });

        state.obstacles = state.obstacles.filter((o) => o.z < 1.2);
        state.collectibles = state.collectibles.filter((c) => c.z < 1.2);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, theme.skyTop);
      gradient.addColorStop(1, theme.skyBottom);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = theme.mountain;
      ctx.beginPath();
      ctx.moveTo(0, 340);
      ctx.lineTo(100, 200);
      ctx.lineTo(220, 330);
      ctx.lineTo(350, 170);
      ctx.lineTo(500, 300);
      ctx.lineTo(700, 180);
      ctx.lineTo(850, 310);
      ctx.lineTo(1000, 220);
      ctx.lineTo(1000, 420);
      ctx.lineTo(0, 420);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = theme.grass;
      ctx.fillRect(0, 320, canvas.width, canvas.height - 320);

      const horizonY = 90;
      const roadTopWidth = 140;
      const roadBottomWidth = 520;
      const centerX = canvas.width / 2;

      ctx.fillStyle = theme.road;
      ctx.beginPath();
      ctx.moveTo(centerX - roadTopWidth / 2, horizonY);
      ctx.lineTo(centerX + roadTopWidth / 2, horizonY);
      ctx.lineTo(centerX + roadBottomWidth / 2, canvas.height);
      ctx.lineTo(centerX - roadBottomWidth / 2, canvas.height);
      ctx.closePath();
      ctx.fill();

      for (let lane = 1; lane <= 3; lane++) {
        const topX = centerX - roadTopWidth / 2 + (roadTopWidth / 4) * lane;
        const bottomX = centerX - roadBottomWidth / 2 + (roadBottomWidth / 4) * lane;

        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(topX, horizonY);
        ctx.lineTo(bottomX, canvas.height);
        ctx.stroke();
      }

      const dashOffset = state.roadOffset % 80;

      for (let i = 0; i < 12; i++) {
        const y = horizonY + i * 70 + dashOffset;
        const t = (y - horizonY) / (canvas.height - horizonY);
        const width = 4 + t * 6;
        const height = 14 + t * 20;

        ctx.fillStyle = theme.lane;
        ctx.fillRect(centerX - width / 2, y, width, height);
      }

      const getLaneX = (lane, y) => {
        const t = (y - horizonY) / (canvas.height - horizonY);
        const roadWidth = roadTopWidth + (roadBottomWidth - roadTopWidth) * t;
        return centerX - roadWidth / 2 + (roadWidth / 4) * (lane + 0.5);
      };

      state.collectibles.forEach((item) => {
        const y = horizonY + item.z * (canvas.height - horizonY);
        const x = getLaneX(item.lane, y);

        if (item.type === 'coin') {
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(x, y, 12 + item.z * 10, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#ff4d6d';
          ctx.fillRect(x - 10, y - 14, 20, 28);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x - 3, y - 8, 6, 16);
          ctx.fillRect(x - 8, y - 3, 16, 6);
        }
      });

      state.obstacles.forEach((obs) => {
        const y = horizonY + obs.z * (canvas.height - horizonY);
        const x = getLaneX(obs.lane, y);
        const width = 24 + obs.z * 42;
        const height = 40 + obs.z * 65;

        ctx.fillStyle = obs.color;
        ctx.fillRect(x - width / 2, y - height / 2, width, height);

        ctx.fillStyle = '#dbeafe';
        ctx.fillRect(x - width / 4, y - height / 2 + 8, width / 2, 10);
      });

      const playerY = canvas.height - 90;
      const playerX = getLaneX(state.playerLane, playerY);

      ctx.save();
      ctx.translate(playerX, playerY);
      ctx.shadowColor = car.color;
      ctx.shadowBlur = 20;

      ctx.fillStyle = car.color;
      ctx.fillRect(-34, -50, 68, 100);

      ctx.fillStyle = car.windowColor;
      ctx.fillRect(-18, -32, 36, 18);

      ctx.fillStyle = '#111827';
      ctx.fillRect(-28, -42, 10, 18);
      ctx.fillRect(18, -42, 10, 18);
      ctx.fillRect(-28, 24, 10, 18);
      ctx.fillRect(18, 24, 10, 18);
      ctx.restore();

      if (lives <= 0 || fuel <= 0) {
        setGameOver(true);
        setGameRunning(false);
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationRef.current);
  }, [gameRunning, paused, selectedCar, selectedTheme, fuel, lives, score, gameOver]);

  const restartGame = () => {
    gameStateRef.current = {
      keys: {},
      playerLane: 1,
      roadOffset: 0,
      speed: 0,
      obstacles: [],
      collectibles: [],
      frame: 0
    };

    setScore(0);
    setCoins(0);
    setFuel(100);
    setLives(3);
    setLevel(1);
    setSpeed(0);
    setGameOver(false);
    setPaused(false);
    setGameRunning(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#e5e5e5', padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '18px' }}>Racing Game</h1>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Player Name" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />

          <select value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)} style={{ padding: '10px', borderRadius: '8px' }}>
            {Object.entries(CAR_TYPES).map(([key, car]) => (
              <option key={key} value={key}>{car.name}</option>
            ))}
          </select>

          <select value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)} style={{ padding: '10px', borderRadius: '8px' }}>
            {Object.entries(THEMES).map(([key, theme]) => (
              <option key={key} value={key}>{theme.name}</option>
            ))}
          </select>

          <button onClick={() => setGameRunning(true)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px' }}>Start</button>
          <button onClick={() => setPaused((prev) => !prev)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px' }}>{paused ? 'Resume' : 'Pause'}</button>
          <button onClick={() => setGameRunning(false)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px' }}>Stop</button>
          <button onClick={restartGame} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px' }}>Restart</button>
        </div>

        <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '4px solid #333', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />

          <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            <div>❤️ {lives}</div>
            <div>🏁 {score}</div>
            <div>🪙 {coins}</div>
            <div>⛽ {Math.round(fuel)}%</div>
            <div>Lvl {level}</div>
            <div>🔥 {speed} km/h</div>
            <div>{CAR_TYPES[selectedCar].emoji} {CAR_TYPES[selectedCar].name}</div>
            <div>{THEMES[selectedTheme].name}</div>
          </div>

          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', color: 'white', background: 'rgba(0,0,0,0.45)', padding: '10px 16px', borderRadius: '12px' }}>
            Arrow Keys • Up to Accelerate • Down to Brake • P to Pause
          </div>

          {paused && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '48px', fontWeight: 'bold' }}>
              Paused
            </div>
          )}

          {gameOver && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <h2 style={{ fontSize: '42px', marginBottom: '12px' }}>Game Over</h2>
              <div>Player: {playerName}</div>
              <div>Final Score: {score}</div>
              <div>Coins: {coins}</div>
              <button onClick={restartGame} style={{ marginTop: '20px', background: '#2563eb', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px' }}>Play Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}