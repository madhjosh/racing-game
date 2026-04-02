import { useState, useEffect, useRef } from 'react';

export default function RacingGame() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [gameRunning, setGameRunning] = useState(true);
  const [finalScore, setFinalScore] = useState(0);

  const gameStateRef = useRef({
    playerCar: {
      x: 150,
      y: 520,
      width: 30,
      height: 50,
      speed: 0,
      maxSpeed: 5,
      acceleration: 0.15,
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
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    const gameLoop = () => {
      if (!state.gameRunning) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Draw road
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw lane lines
      ctx.strokeStyle = '#FFFF00';
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
      ctx.fillStyle = '#228B22';
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
      ctx.fillStyle = '#0066FF';
      ctx.fillRect(state.playerCar.x, state.playerCar.y, state.playerCar.width, state.playerCar.height);
      ctx.fillStyle = '#00AAFF';
      ctx.fillRect(state.playerCar.x + 5, state.playerCar.y + 5, state.playerCar.width - 10, 12);
      ctx.fillRect(state.playerCar.x + 5, state.playerCar.y + 22, state.playerCar.width - 10, 12);

      // Draw obstacles
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
  }, [gameRunning]);

  const resetGame = () => {
    gameStateRef.current = {
      playerCar: {
        x: 150,
        y: 520,
        width: 30,
        height: 50,
        speed: 0,
        maxSpeed: 5,
        acceleration: 0.15,
        friction: 0.92
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

  return (
    <div style={{ fontFamily: 'sans-serif', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(to bottom, #87CEEB, #E0E0E0)',
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
          <div>Speed: {speed}</div>
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
          <p style={{ margin: '8px 0', color: '#666' }}>Final Score: <strong>{finalScore}</strong></p>
          <button
            onClick={resetGame}
            style={{
              marginTop: '12px',
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
        </div>
      )}
    </div>
  );
}
