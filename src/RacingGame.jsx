import { useState, useEffect, useRef } from 'react';

const CAR_TYPES = {
  sports: {
    name: 'Sports Car',
    acceleration: 0.2,
    maxSpeed: 6,
    friction: 0.90,
    color: '#FF0000',
    windowColor: '#FF6666',
    emoji: '🏎️'
  },
  truck: {
    name: 'Truck',
    acceleration: 0.12,
    maxSpeed: 4,
    friction: 0.93,
    color: '#FFB300',
    windowColor: '#FFD966',
    emoji: '🚚'
  },
  police: {
    name: 'Police Car',
    acceleration: 0.18,
    maxSpeed: 5.5,
    friction: 0.91,
    color: '#0033FF',
    windowColor: '#6699FF',
    emoji: '🚓'
  },
  taxi: {
    name: 'Taxi',
    acceleration: 0.15,
    maxSpeed: 4.8,
    friction: 0.92,
    color: '#FFFF00',
    windowColor: '#FFFF99',
    emoji: '🚕'
  }
};

const THEMES = {
  day: {
    name: 'Day',
    road: '#333333',
    grass: '#228B22',
    lane: '#FFFF00',
    background: 'linear-gradient(to bottom, #87CEEB, #E0E0E0)',
    skyColor: '#87CEEB'
  },
  night: {
    name: 'Night',
    road: '#1a1a1a',
    grass: '#1a4d1a',
    lane: '#FFFFFF',
    background: 'linear-gradient(to bottom, #001a33, #1a1a2e)',
    skyColor: '#001a33'
  },
  desert: {
    name: 'Desert',
    road: '#8B7355',
    grass: '#DAA520',
    lane: '#FF6347',
    background: 'linear-gradient(to bottom, #FFB347, #F0E68C)',
    skyColor: '#FFB347'
  },
  snow: {
    name: 'Snow',
    road: '#CCCCCC',
    grass: '#FFFFFF',
    lane: '#0000FF',
    background: 'linear-gradient(to bottom, #B0E0E6, #F0FFFF)',
    skyColor: '#B0E0E6'
  }
};

export default function RacingGame() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [gameRunning, setGameRunning] = useState(true);
  const [finalScore, setFinalScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCar, setSelectedCar] = useState('sports');
  const [selectedTheme, setSelectedTheme] = useState('day');

  const gameStateRef = useRef({
    playerCar: {
      x: 150,
      y: 520,
      width: 30,
      height: 50,
      speed: 0,
      maxSpeed: 6,
      acceleration: 0.2,
      friction: 0.92
    },
    obstacles: [],
    score: 0,
    gameRunning: true,
    gameSpeed: 2,
    spawnCounter: 0,
    keys: {}
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameStateRef.current.keys[e.key] = true;
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
    if (!gameRunning || !gameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    const theme = THEMES[selectedTheme];
    const carType = CAR_TYPES[selectedCar];

    const gameLoop = () => {
      if (!state.gameRunning) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Draw road
      ctx.fillStyle = theme.road;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw lane lines
      ctx.strokeStyle = theme.lane;
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 10]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 3, 0);
      ctx.lineTo(canvas.width / 3, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2 * canvas.width / 3, 0);
      ctx.lineTo(2 * canvas.width / 3, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw grass borders
      ctx.fillStyle = theme.grass;
      ctx.fillRect(0, 0, canvas.width / 6, canvas.height);
      ctx.fillRect(5 * canvas.width / 6, 0, canvas.width / 6, canvas.height);

      // Handle player input
      const keys = state.keys;
      if (keys['ArrowLeft'] && state.playerCar.x > canvas.width / 6) {
        state.playerCar.x -= 4;
      }
      if (keys['ArrowRight'] && state.playerCar.x + state.playerCar.width < 5 * canvas.width / 6) {
        state.playerCar.x += 4;
      }
      if (keys['ArrowUp'] && state.playerCar.speed < state.playerCar.maxSpeed) {
        state.playerCar.speed += state.playerCar.acceleration;
      }
      if (keys['ArrowDown'] && state.playerCar.speed > -2) {
        state.playerCar.speed -= state.playerCar.acceleration;
      }

      // Apply friction
      state.playerCar.speed *= state.playerCar.friction;
      if (Math.abs(state.playerCar.speed) < 0.1) state.playerCar.speed = 0;

      // Update obstacles
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        state.obstacles[i].y += state.obstacles[i].speed;

        if (state.obstacles[i].y > canvas.height) {
          state.obstacles.splice(i, 1);
          state.score += 10;
          if (state.score % 100 === 0) state.gameSpeed += 0.3;
        }
      }

      // Collision detection
      for (let obstacle of state.obstacles) {
        if (
          state.playerCar.x < obstacle.x + obstacle.width &&
          state.playerCar.x + state.playerCar.width > obstacle.x &&
          state.playerCar.y < obstacle.y + obstacle.height &&
          state.playerCar.y + state.playerCar.height > obstacle.y
        ) {
          state.gameRunning = false;
          setGameRunning(false);
          setFinalScore(state.score);
        }
      }

      // Draw player car
      ctx.fillStyle = carType.color;
      ctx.fillRect(state.playerCar.x, state.playerCar.y, state.playerCar.width, state.playerCar.height);
      ctx.fillStyle = carType.windowColor;
      ctx.fillRect(state.playerCar.x + 5, state.playerCar.y + 5, state.playerCar.width - 10, 12);
      ctx.fillRect(state.playerCar.x + 5, state.playerCar.y + 22, state.playerCar.width - 10, 12);

      // Draw obstacles (random obstacles)
      for (let obstacle of state.obstacles) {
        ctx.fillStyle = '#FF3333';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = '#FFAAAA';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, 12);
        ctx.fillRect(obstacle.x + 5, obstacle.y + 22, obstacle.width - 10, 12);
      }

      // Spawn new obstacles
      state.spawnCounter++;
      if (state.spawnCounter > 60 - (state.gameSpeed * 3)) {
        const lanes = [canvas.width / 6 + 10, canvas.width / 2 - 15, 5 * canvas.width / 6 - 40];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        state.obstacles.push({
          x: randomLane,
          y: -50,
          width: 30,
          height: 50,
          speed: state.gameSpeed + 1
        });
        state.spawnCounter = 0;
      }

      // Update UI
      setScore(state.score);
      setSpeed(Math.round(Math.abs(state.playerCar.speed) * 20));

      requestAnimationFrame(gameLoop);
    };

    const frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [gameRunning, gameStarted, selectedCar, selectedTheme]);

  const startGame = () => {
    const carType = CAR_TYPES[selectedCar];
    gameStateRef.current = {
      playerCar: {
        x: 150,
        y: 520,
        width: 30,
        height: 50,
        speed: 0,
        maxSpeed: carType.maxSpeed,
        acceleration: carType.acceleration,
        friction: carType.friction
      },
      obstacles: [],
      score: 0,
      gameRunning: true,
      gameSpeed: 2,
      spawnCounter: 0,
      keys: {}
    };
    setScore(0);
    setSpeed(0);
    setGameRunning(true);
    setFinalScore(0);
    setGameStarted(true);
  };

  const resetGame = () => {
    const carType = CAR_TYPES[selectedCar];
    gameStateRef.current = {
      playerCar: {
        x: 150,
        y: 520,
        width: 30,
        height: 50,
        speed: 0,
        maxSpeed: carType.maxSpeed,
        acceleration: carType.acceleration,
        friction: carType.friction
      },
      obstacles: [],
      score: 0,
      gameRunning: true,
      gameSpeed: 2,
      spawnCounter: 0,
      keys: {}
    };
    setScore(0);
    setSpeed(0);
    setGameRunning(true);
    setFinalScore(0);
  };

  const theme = THEMES[selectedTheme];
  const carType = CAR_TYPES[selectedCar];

  if (!gameStarted) {
    return (
      <div style={{ fontFamily: 'sans-serif', width: '100%', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Racing Game</h1>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Select Your Car</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {Object.entries(CAR_TYPES).map(([key, car]) => (
              <button
                key={key}
                onClick={() => setSelectedCar(key)}
                style={{
                  padding: '16px',
                  border: selectedCar === key ? '3px solid #0066FF' : '1px solid #ddd',
                  borderRadius: '8px',
                  background: selectedCar === key ? '#E6F1FB' : '#f5f5f5',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedCar === key ? '500' : '400',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{car.emoji}</div>
                <div>{car.name}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Max Speed: {(car.maxSpeed * 20).toFixed(0)}
                </div>
              </button>
            ))}
          </div>
          <div style={{
            padding: '12px',
            background: '#E6F1FB',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#0066FF'
          }}>
            {carType.name}: Acceleration {carType.acceleration.toFixed(2)}, Max Speed {(carType.maxSpeed * 20).toFixed(0)}
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Select Theme</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {Object.entries(THEMES).map(([key, themeOption]) => (
              <button
                key={key}
                onClick={() => setSelectedTheme(key)}
                style={{
                  padding: '16px',
                  border: selectedTheme === key ? '3px solid #0066FF' : '1px solid #ddd',
                  borderRadius: '8px',
                  background: selectedTheme === key ? themeOption.background : 'linear-gradient(135deg, ' + themeOption.skyColor + ', ' + themeOption.grass + ')',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedTheme === key ? '500' : '400',
                  color: selectedTheme === key ? '#0066FF' : '#333',
                  transition: 'all 0.2s',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                {themeOption.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startGame}
          style={{
            width: '100%',
            padding: '16px',
            background: '#0066FF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        background: theme.background,
        borderRadius: '12px',
        border: '2px solid #ddd',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          width={320}
          height={600}
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '16px',
          fontWeight: '500',
          color: 'white',
          textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
          zIndex: '10'
        }}>
          <div>{carType.emoji} Speed: {speed}</div>
          <div>Score: {score}</div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          fontSize: '13px',
          color: 'white',
          textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
          textAlign: 'center',
          zIndex: '10'
        }}>
          Use Arrow Keys to move | Avoid red cars
        </div>
      </div>

      {!gameRunning && (
        <div style={{
          marginTop: '16px',
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #ddd'
        }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '500' }}>Game Over!</h2>
          <p style={{ margin: '8px 0', color: '#666' }}>
            Car: {carType.name} | Theme: {theme.name}
          </p>
          <p style={{ margin: '8px 0', color: '#666' }}>Final Score: <strong>{finalScore}</strong></p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={resetGame}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#0066FF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Play Again
            </button>
            <button
              onClick={() => setGameStarted(false)}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Change Car/Theme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
