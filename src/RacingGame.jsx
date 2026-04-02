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
  const [level, setLevel] = useState(1);
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

        state.obstacles = state.obstacles.filter((o) => o.z < 1.2);
        state.coins = state.coins.filter((c) => c.z < 1.2);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#8fd3ff');
      skyGradient.addColorStop(1, '#cfefff');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#6ea0c4';
      ctx.beginPath();
      ctx.moveTo(0, 330);
      ctx.lineTo(120, 190);
      ctx.lineTo(240, 300);
      ctx.lineTo(390, 170);
      ctx.lineTo(530, 280);
      ctx.lineTo(760, 140);
      ctx.lineTo(930, 280);
      ctx.lineTo(1100, 180);
      ctx.lineTo(1100, 380);
      ctx.lineTo(0, 380);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#228b22';
      ctx.fillRect(0, 320, canvas.width, canvas.height - 320);

      const horizonY = 80;
      const roadBottomWidth = 520;
      const roadTopWidth = 160;
      const roadCenterX = canvas.width / 2;

      ctx.fillStyle = '#4b5563';
      ctx.beginPath();
      ctx.moveTo(roadCenterX - roadTopWidth / 2, horizonY);
      ctx.lineTo(roadCenterX + roadTopWidth / 2, horizonY);
      ctx.lineTo(roadCenterX + roadBottomWidth / 2, canvas.height);
      ctx.lineTo(roadCenterX - roadBottomWidth / 2, canvas.height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#a3a3a3';
      ctx.lineWidth = 3;
      ctx.stroke();

      for (let lane = 1; lane <= 3; lane++) {
        const topLaneX = roadCenterX - roadTopWidth / 2 + (roadTopWidth / 4) * lane;
        const bottomLaneX = roadCenterX - roadBottomWidth / 2 + (roadBottomWidth / 4) * lane;

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(topLaneX, horizonY);
        ctx.lineTo(bottomLaneX, canvas.height);
        ctx.stroke();
      }

      const dashOffset = gameStateRef.current.roadOffset % 80;

      for (let i = 0; i < 12; i++) {
        const y = horizonY + i * 60 + dashOffset;
        const t = (y - horizonY) / (canvas.height - horizonY);
        const width = 5 + t * 6;
        const height = 12 + t * 24;

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(roadCenterX - width / 2, y, width, height);
      }

      function getLaneX(lane, y) {
        const t = (y - horizonY) / (canvas.height - horizonY);
        const roadWidthAtY = roadTopWidth + (roadBottomWidth - roadTopWidth) * t;
        return roadCenterX - roadWidthAtY / 2 + (roadWidthAtY / 4) * (lane + 0.5);
      }

      state.coins.forEach((coin) => {
        const y = horizonY + coin.z * (canvas.height - horizonY);
        const x = getLaneX(coin.lane, y);
        const size = 10 + coin.z * 16;

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      state.obstacles.forEach((obs) => {
        const y = horizonY + obs.z * (canvas.height - horizonY);
        const x = getLaneX(obs.lane, y);
        const width = 20 + obs.z * 40;
        const height = 30 + obs.z * 60;

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
    <div className="min-h-screen bg-neutral-200 p-6 flex flex-col items-center gap-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-4 border border-neutral-300">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex gap-3 items-center">
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="px-4 py-2 rounded-xl border border-neutral-300"
              placeholder="Player Name"
            />
            <div className="font-semibold text-neutral-700">{playerName}</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsRunning(true);
                setIsPaused(false);
              }}
              className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold"
            >
              Start
            </button>

            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={() => setIsRunning(false)}
              className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold"
            >
              Stop
            </button>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border-[4px] border-neutral-700 shadow-2xl bg-black">
          <canvas ref={canvasRef} className="w-full h-auto block" />

          <div className="absolute top-4 left-4 right-4 text-white z-10 grid grid-cols-4 gap-4 text-lg font-semibold">
            <div>❤️ {lives}</div>
            <div>🏁 {score}</div>
            <div>🪙 {coins}</div>
            <div>⛽ {Math.round(fuel)}%</div>
            <div>Lvl {level}</div>
            <div>🔥 {speed}</div>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white bg-black/40 px-4 py-2 rounded-xl text-sm">
            Arrow Keys | Space Boost | P Pause
          </div>
        </div>
      </div>
    </div>
  );
}