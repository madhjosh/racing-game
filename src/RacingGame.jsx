import React, { useEffect, useRef, useState } from 'react';

export default function RacingGame() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const keysRef = useRef({});

  const [playerName, setPlayerName] = useState('Player 1');
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [lives, setLives] = useState(3);
  const [level] = useState(1);
  const [speed, setSpeed] = useState(0);

  const gameStateRef = useRef({
    playerLane: 1,
    roadOffset: 0,
    obstacles: [],
    coins: [],
    frame: 0,
    speed: 0,
    boosting: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 1100;
    canvas.height = 650;

    const loop = () => {
      const state = gameStateRef.current;

      if (isRunning && !isPaused) {
        state.frame += 1;

        if (keysRef.current['ArrowLeft']) {
          state.playerLane = Math.max(0, state.playerLane - 0.08);
        }

        if (keysRef.current['ArrowRight']) {
          state.playerLane = Math.min(3, state.playerLane + 0.08);
        }

        if (keysRef.current['ArrowUp']) {
          state.speed = Math.min(12, state.speed + 0.15);
        } else {
          state.speed = Math.max(2, state.speed - 0.05);
        }

        if (keysRef.current['ArrowDown']) {
          state.speed = Math.max(0, state.speed - 0.2);
        }

        if (keysRef.current[' ']) {
          state.speed = Math.min(18, state.speed + 0.2);
          state.boosting = true;
        } else {
          state.boosting = false;
        }

        state.roadOffset += state.speed;
        setSpeed(Math.round(state.speed * 12));
        setScore((prev) => prev + Math.floor(state.speed));
        setFuel((prev) => Math.max(0, prev - 0.01 * state.speed));

        if (state.frame % 90 === 0) {
          state.obstacles.push({
            lane: Math.floor(Math.random() * 4),
            z: 0,
            color: ['#ef4444', '#3b82f6', '#22c55e'][Math.floor(Math.random() * 3)],
          });
        }

        if (state.frame % 140 === 0) {
          state.coins.push({
            lane: Math.floor(Math.random() * 4),
            z: 0,
          });
        }

        state.obstacles.forEach((o) => {
          o.z += state.speed * 0.015;
        });

        state.coins.forEach((c) => {
          c.z += state.speed * 0.015;
        });

        state.coins.forEach((coin, index) => {
          if (coin.z > 0.85 && Math.abs(coin.lane - state.playerLane) < 0.4) {
            setCoins((prev) => prev + 1);
            state.coins.splice(index, 1);
          }
        });

        state.obstacles.forEach((obs, index) => {
          if (obs.z > 0.85 && Math.abs(obs.lane - state.playerLane) < 0.4) {
            setLives((prev) => Math.max(0, prev - 1));
            state.obstacles.splice(index, 1);
          }
        });

        state.obstacles = state.obstacles.filter((o) => o.z < 1.2);
        state.coins = state.coins.filter((c) => c.z < 1.2);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#8fd3ff');
      skyGradient.addColorStop(1, '#dff6ff');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#6a8ca8';
      ctx.beginPath();
      ctx.moveTo(0, 330);
      ctx.lineTo(100, 200);
      ctx.lineTo(220, 320);
      ctx.lineTo(360, 170);
      ctx.lineTo(500, 300);
      ctx.lineTo(720, 160);
      ctx.lineTo(900, 310);
      ctx.lineTo(1100, 180);
      ctx.lineTo(1100, 380);
      ctx.lineTo(0, 380);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1f8f1f';
      ctx.fillRect(0, 320, canvas.width, canvas.height - 320);

      const horizonY = 90;
      const roadBottomWidth = 520;
      const roadTopWidth = 140;
      const roadCenterX = canvas.width / 2;

      ctx.fillStyle = '#4b5563';
      ctx.beginPath();
      ctx.moveTo(roadCenterX - roadTopWidth / 2, horizonY);
      ctx.lineTo(roadCenterX + roadTopWidth / 2, horizonY);
      ctx.lineTo(roadCenterX + roadBottomWidth / 2, canvas.height);
      ctx.lineTo(roadCenterX - roadBottomWidth / 2, canvas.height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 4;
      ctx.stroke();

      for (let lane = 1; lane <= 3; lane++) {
        const topLaneX = roadCenterX - roadTopWidth / 2 + (roadTopWidth / 4) * lane;
        const bottomLaneX = roadCenterX - roadBottomWidth / 2 + (roadBottomWidth / 4) * lane;

        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(topLaneX, horizonY);
        ctx.lineTo(bottomLaneX, canvas.height);
        ctx.stroke();
      }

      const dashOffset = state.roadOffset % 80;

      for (let i = 0; i < 14; i++) {
        const y = horizonY + i * 60 + dashOffset;
        const t = (y - horizonY) / (canvas.height - horizonY);
        const width = 4 + t * 4;
        const height = 12 + t * 24;

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(roadCenterX - width / 2, y, width, height);
      }

      const getLaneX = (lane, y) => {
        const t = (y - horizonY) / (canvas.height - horizonY);
        const roadWidthAtY = roadTopWidth + (roadBottomWidth - roadTopWidth) * t;
        return roadCenterX - roadWidthAtY / 2 + (roadWidthAtY / 4) * (lane + 0.5);
      };

      state.coins.forEach((coin) => {
        const y = horizonY + coin.z * (canvas.height - horizonY);
        const x = getLaneX(coin.lane, y);
        const size = 12 + coin.z * 14;

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      state.obstacles.forEach((obs) => {
        const y = horizonY + obs.z * (canvas.height - horizonY);
        const x = getLaneX(obs.lane, y);
        const width = 20 + obs.z * 40;
        const height = 32 + obs.z * 65;

        ctx.fillStyle = obs.color;
        ctx.fillRect(x - width / 2, y - height / 2, width, height);

        ctx.fillStyle = '#dbeafe';
        ctx.fillRect(x - width / 4, y - height / 2 + 8, width / 2, 10);
      });

      const playerY = canvas.height - 90;
      const playerX = getLaneX(state.playerLane, playerY);
      const shake = state.boosting ? Math.random() * 4 - 2 : 0;

      ctx.save();
      ctx.translate(playerX + shake, playerY + shake);
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = state.boosting ? 30 : 15;

      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-32, -50, 64, 100);

      ctx.fillStyle = '#cffafe';
      ctx.fillRect(-18, -35, 36, 18);

      ctx.fillStyle = '#111827';
      ctx.fillRect(-28, -45, 10, 18);
      ctx.fillRect(18, -45, 10, 18);
      ctx.fillRect(-28, 28, 10, 18);
      ctx.fillRect(18, 28, 10, 18);

      ctx.restore();

      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationRef.current);
  }, [isPaused, isRunning]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#d4d4d4',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Player Name"
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                fontSize: '14px',
              }}
            />

            <div
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              {playerName}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setIsRunning(true);
                setIsPaused(false);
              }}
              style={{
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Start
            </button>

            <button
              onClick={() => setIsPaused((prev) => !prev)}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={() => setIsRunning(false)}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Stop
            </button>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '4px solid #333',
            background: '#000',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              display: 'block',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              textShadow: '0 2px 6px rgba(0,0,0,0.7)',
            }}
          >
            <div>❤️ {lives}</div>
            <div>🏁 {score}</div>
            <div>🪙 {coins}</div>
            <div>⛽ {Math.round(fuel)}%</div>
            <div>Lvl {level}</div>
            <div>🔥 {speed} km/h</div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.45)',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '14px',
            }}
          >
            Arrow Keys • Space Boost • P Pause
          </div>
        </div>
      </div>
    </div>
  );
}