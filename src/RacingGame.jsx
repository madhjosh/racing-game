import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const STYLES = `
  .rg-root * { margin: 0; padding: 0; box-sizing: border-box; }
  .rg-root {
    position: relative; width: 100%; height: 100vh; overflow: hidden;
    background: #0a0a0f; font-family: 'Courier New', monospace;
  }
  .rg-root canvas { display: block; position: absolute; inset: 0; width: 100%; height: 100%; }

  .rg-hud { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
  .rg-hud-top {
    position: absolute; top: 0; left: 0; right: 0;
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(0,0,0,0.88); border-bottom: 1px solid rgba(255,255,255,0.07);
    padding: 10px 24px; gap: 12px; flex-wrap: wrap;
  }
  .rg-stat { display: flex; flex-direction: column; align-items: center; min-width: 72px; }
  .rg-stat-label { font-size: 9px; letter-spacing: 3px; color: #555; text-transform: uppercase; margin-bottom: 2px; }
  .rg-stat-val { font-size: 24px; font-family: 'Arial Black', sans-serif; color: #fff; line-height: 1; }
  .rg-speed-wrap { display: flex; align-items: baseline; gap: 3px; }
  .rg-speed-unit { font-size: 10px; color: #555; }
  .rg-bar-outer { width: 130px; }
  .rg-bar-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 4px; }
  .rg-bar-track { height: 7px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
  .rg-bar-fill  { height: 100%; border-radius: 4px; transition: width 0.1s; }

  .rg-controls-hint {
    position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 6px; align-items: center;
    background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.07);
    padding: 5px 14px; border-radius: 4px; white-space: nowrap;
  }
  .rg-key {
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    color: #ccc; font-size: 11px; padding: 2px 7px; border-radius: 3px; font-family: monospace;
  }
  .rg-key-sep { color: #444; font-size: 11px; margin: 0 2px; }

  .rg-screen {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; z-index: 10;
  }
  .rg-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, #150025 0%, #0a0a0f 70%); }
  .rg-scanlines {
    position: absolute; inset: 0; pointer-events: none;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px);
    z-index: 1;
  }
  .rg-content { position: relative; z-index: 2; text-align: center; padding: 0 20px; }
  .rg-title {
    font-size: clamp(50px, 11vw, 96px); font-family: 'Arial Black', Impact, sans-serif;
    font-weight: 900; color: #fff; line-height: 0.88; text-transform: uppercase;
    text-shadow: 0 0 40px #a855f7, 0 0 80px #7c3aed;
  }
  .rg-sub { font-size: clamp(11px,2vw,15px); letter-spacing: 7px; color: #a855f7; text-transform: uppercase; margin-top: 10px; }
  .rg-divider { width: 180px; height: 1px; background: linear-gradient(90deg,transparent,#a855f7,transparent); margin: 20px auto; }

  .rg-btn {
    display: block; background: transparent; border: 1.5px solid rgba(168,85,247,0.5);
    color: #e2d4ff; padding: 13px 44px; font-size: 13px; letter-spacing: 4px;
    text-transform: uppercase; cursor: pointer; margin: 8px auto; min-width: 220px;
    font-family: 'Courier New', monospace; transition: all 0.18s; position: relative; overflow: hidden;
  }
  .rg-btn::before { content:''; position:absolute; inset:0; background:rgba(168,85,247,0.12); transform:translateX(-100%); transition:transform 0.18s; }
  .rg-btn:hover { border-color: #a855f7; color: #fff; }
  .rg-btn:hover::before { transform: translateX(0); }
  .rg-btn.primary { border-color: #a855f7; background: rgba(168,85,247,0.18); }
  .rg-btn.gold-btn { border-color: #ffd700; color: #ffd700; background: rgba(255,215,0,0.1); }
  .rg-btn.gold-btn:hover { background: rgba(255,215,0,0.22); }

  .rg-diff-row { display: flex; gap: 10px; justify-content: center; margin: 8px 0 20px; }
  .rg-diff {
    border: 1px solid rgba(255,255,255,0.12); background: transparent; color: #666;
    padding: 7px 18px; font-family: 'Courier New', monospace; font-size: 11px;
    letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.18s;
  }
  .rg-diff.easy.on   { border-color:#22c55e; color:#22c55e; background:rgba(34,197,94,0.12); }
  .rg-diff.medium.on { border-color:#f59e0b; color:#f59e0b; background:rgba(245,158,11,0.12); }
  .rg-diff.hard.on   { border-color:#ef4444; color:#ef4444; background:rgba(239,68,68,0.12); }
  .rg-label-sm { font-size: 10px; letter-spacing: 3px; color: #555; text-transform: uppercase; margin-bottom: 6px; }

  .rg-results { display:grid; grid-template-columns:1fr 1fr; gap:2px; margin:20px 0; background:rgba(168,85,247,0.15); border:1px solid rgba(168,85,247,0.25); }
  .rg-result-cell { background:rgba(0,0,0,0.65); padding:12px 18px; }

  .rg-lb { width:100%; max-width:320px; margin:0 auto 16px; }
  .rg-lb-head { font-size:9px; letter-spacing:3px; color:#a855f7; text-transform:uppercase; padding:7px 10px; border-bottom:1px solid rgba(168,85,247,0.25); }
  .rg-lb-row { display:flex; justify-content:space-between; padding:7px 10px; border-bottom:1px solid rgba(255,255,255,0.04); font-size:12px; color:#aaa; }
  .rg-lb-row:first-child{ color:#ffd700; } .rg-lb-row:nth-child(2){ color:#c0c0c0; } .rg-lb-row:nth-child(3){ color:#cd7f32; }

  .rg-pause-overlay {
    position:absolute; inset:0; background:rgba(0,0,0,0.8);
    display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:15;
  }
  .rg-pause-title { font-size:52px; font-family:'Arial Black',sans-serif; color:#fff; letter-spacing:6px; text-transform:uppercase; margin-bottom:24px; }

  .rg-countdown-wrap {
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    z-index:20; pointer-events:none;
  }
  .rg-count-num {
    font-size: clamp(90px,22vw,170px); font-family:'Arial Black',Impact,sans-serif;
    color:#fff; text-shadow:0 0 40px #a855f7;
    animation: rgCountPop 0.85s ease-out forwards;
  }
  @keyframes rgCountPop {
    0%  { transform:scale(2.2); opacity:0; }
    40% { transform:scale(1);   opacity:1; }
    75% { opacity:1; }
    100%{ opacity:0; transform:scale(0.6); }
  }
  .rg-lap-flash {
    position:absolute; top:46%; left:50%; transform:translate(-50%,-50%);
    font-size:30px; font-family:'Arial Black',sans-serif; color:#ffd700;
    text-shadow:0 0 24px #ffd700; pointer-events:none; z-index:20;
    animation: rgLap 1.6s ease-out forwards;
  }
  @keyframes rgLap {
    0%  { opacity:0; transform:translate(-50%,-50%) scale(0.4); }
    18% { opacity:1; transform:translate(-50%,-50%) scale(1.1); }
    70% { opacity:1; }
    100%{ opacity:0; transform:translate(-50%,-70%) scale(1); }
  }
  .rg-nitro-flash {
    position:absolute; inset:0; pointer-events:none;
    background:radial-gradient(ellipse at 50% 100%,rgba(6,182,212,0.28) 0%,transparent 55%);
    opacity:0; z-index:6; transition:opacity 0.08s;
  }
  .rg-nitro-flash.on { opacity:1; }

  .rg-touch {
    position:absolute; bottom:0; left:0; right:0; height:190px;
    display:flex; justify-content:space-between; align-items:flex-end;
    padding:16px 24px; pointer-events:none; z-index:8;
  }
  .rg-tbtn {
    width:68px; height:68px; background:rgba(255,255,255,0.07);
    border:1px solid rgba(255,255,255,0.18); border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; color:rgba(255,255,255,0.55);
    pointer-events:all; cursor:pointer; user-select:none; -webkit-user-select:none;
  }
  .rg-tbtn:active { background:rgba(168,85,247,0.28); }
  .rg-tbtn.boost  { background:rgba(6,182,212,0.12); border-color:rgba(6,182,212,0.35); }
  .rg-trow { display:flex; gap:8px; }
  @media (pointer:fine){ .rg-touch{ display:none; } }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const W = 800, H = 540;
const NUM_LANES   = 4;
const TOTAL_LAPS  = 3;
const TOTAL_DIST  = 3000;
const MAX_SPEED   = 6;
const CAR_W = 36, CAR_H = 54;
const PLAYER_Y = H - 105;
const VP_Y = H * 0.39;   // vanishing point y
const VP_X = W / 2;
const ROAD_BOT_HALF = 188; // half-width of road at bottom of screen

// lane x at bottom of screen
function laneX(lane) {
  const left  = VP_X - ROAD_BOT_HALF;
  const right = VP_X + ROAD_BOT_HALF;
  const lw = (right - left) / NUM_LANES;
  return left + lw * lane + lw / 2;
}

// ─── SOUND ────────────────────────────────────────────────────────────────────
let _actx = null, _engGain = null, _engOsc = null, _sndReady = false;
const snd = {
  init() {
    if (_actx) return;
    try { _actx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
    _engGain = _actx.createGain(); _engGain.gain.value = 0;
    _engOsc  = _actx.createOscillator();
    const dist = _actx.createWaveShaper();
    const c = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = i*2/256-1; c[i] = x*(Math.PI+180)/(Math.PI+180*Math.abs(x)); }
    dist.curve = c;
    _engOsc.connect(dist); dist.connect(_engGain); _engGain.connect(_actx.destination);
    _engOsc.type = "sawtooth"; _engOsc.frequency.value = 80; _engOsc.start();
    _sndReady = true;
  },
  engine(spd, max) {
    if (!_sndReady) return;
    const r = spd / max;
    _engOsc.frequency.setTargetAtTime(80 + r*240, _actx.currentTime, 0.1);
    _engGain.gain.setTargetAtTime(r*0.28, _actx.currentTime, 0.1);
  },
  beep(f, d, v=0.45, t="square") {
    if (!_actx) return;
    const o = _actx.createOscillator(), g = _actx.createGain();
    o.connect(g); g.connect(_actx.destination);
    o.type = t; o.frequency.value = f;
    g.gain.setValueAtTime(v, _actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, _actx.currentTime+d);
    o.start(); o.stop(_actx.currentTime+d);
  },
  boost() { this.beep(600,0.25,0.35,"sawtooth"); },
  crash() { this.beep(90,0.35,0.45,"sawtooth"); },
  lap()   { this.beep(880,0.1,0.4); setTimeout(()=>this.beep(1100,0.1,0.4),110); setTimeout(()=>this.beep(1320,0.15,0.4),230); },
  go()    { this.beep(440,0.12,0.5); setTimeout(()=>this.beep(880,0.18,0.5),190); },
  stop()  { if (_engGain) _engGain.gain.setTargetAtTime(0, _actx.currentTime, 0.15); },
  lane()  { this.beep(380, 0.06, 0.12); },
};

// ─── ROAD DRAW ────────────────────────────────────────────────────────────────
function drawRoad(ctx, scrollDist) {
  ctx.clearRect(0, 0, W, H);

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, VP_Y + 20);
  sky.addColorStop(0, "#08001a");
  sky.addColorStop(1, "#1e0540");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, VP_Y + 20);

  // distant hills
  ctx.fillStyle = "#110228";
  ctx.beginPath(); ctx.moveTo(0, VP_Y + 8);
  for (let x = 0; x <= W; x += 25) {
    ctx.lineTo(x, VP_Y - 14 + Math.sin(x * 0.02 + 0.8) * 14 + Math.sin(x * 0.008) * 8);
  }
  ctx.lineTo(W, VP_Y + 8); ctx.closePath(); ctx.fill();

  // road surface
  ctx.fillStyle = "#1c1028";
  ctx.beginPath();
  ctx.moveTo(VP_X - ROAD_BOT_HALF, H);
  ctx.lineTo(VP_X + ROAD_BOT_HALF, H);
  ctx.lineTo(VP_X + 2, VP_Y);
  ctx.lineTo(VP_X - 2, VP_Y);
  ctx.closePath(); ctx.fill();

  // ground beside road
  const groundL = ctx.createLinearGradient(0, VP_Y, 0, H);
  groundL.addColorStop(0, "#0d1a0d");
  groundL.addColorStop(1, "#0a120a");
  ctx.fillStyle = groundL;
  ctx.fillRect(0, VP_Y, W, H - VP_Y);
  // re-draw road on top of ground
  ctx.fillStyle = "#1c1028";
  ctx.beginPath();
  ctx.moveTo(VP_X - ROAD_BOT_HALF, H);
  ctx.lineTo(VP_X + ROAD_BOT_HALF, H);
  ctx.lineTo(VP_X + 2, VP_Y);
  ctx.lineTo(VP_X - 2, VP_Y);
  ctx.closePath(); ctx.fill();

  // kerb stripes (red/white alternating, scroll with road)
  const kerbW = 20;
  for (let side = -1; side <= 1; side += 2) {
    const bx = side === -1 ? VP_X - ROAD_BOT_HALF - kerbW : VP_X + ROAD_BOT_HALF;
    const tx = side === -1 ? VP_X - 2 : VP_X + 2;
    const SEGS = 22;
    for (let seg = 0; seg < SEGS; seg++) {
      const t0 = seg / SEGS, t1 = (seg + 1) / SEGS;
      const x0l = bx + (tx - bx) * t0;
      const x0r = x0l + side * kerbW * (1 - t0);
      const y0  = H  + (VP_Y - H) * t0;
      const x1l = bx + (tx - bx) * t1;
      const x1r = x1l + side * kerbW * (1 - t1);
      const y1  = H  + (VP_Y - H) * t1;
      const isRed = (seg + Math.floor(scrollDist / 28)) % 2 === 0;
      ctx.fillStyle = isRed ? "#cc1133" : "#eeeeee";
      ctx.beginPath();
      ctx.moveTo(x0l, y0); ctx.lineTo(x0r, y0);
      ctx.lineTo(x1r, y1); ctx.lineTo(x1l, y1);
      ctx.closePath(); ctx.fill();
    }
  }

  // lane dividers
  const SEGS = 26;
  for (let li = 1; li < NUM_LANES; li++) {
    const frac = li / NUM_LANES;
    const botX = VP_X - ROAD_BOT_HALF + (ROAD_BOT_HALF * 2) * frac;
    for (let seg = 0; seg < SEGS; seg++) {
      if ((seg + Math.floor(scrollDist / 20)) % 2 !== 0) continue;
      const t0 = seg / SEGS, t1 = (seg + 0.48) / SEGS;
      const lx0 = botX + (VP_X - botX) * t0;
      const ly0 = H   + (VP_Y - H)  * t0;
      const lx1 = botX + (VP_X - botX) * t1;
      const ly1 = H   + (VP_Y - H)  * t1;
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = Math.max(1, 2.5 * (1 - t0));
      ctx.beginPath(); ctx.moveTo(lx0, ly0); ctx.lineTo(lx1, ly1); ctx.stroke();
    }
  }

  // road edge lines (solid)
  for (let side = -1; side <= 1; side += 2) {
    const bx = VP_X + side * ROAD_BOT_HALF;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx, H); ctx.lineTo(VP_X + side * 2, VP_Y); ctx.stroke();
  }

  // trees on both sides (scroll via scrollDist)
  const TREES = 7;
  for (let i = 0; i < TREES; i++) {
    const phase = ((i / TREES) + (scrollDist * 0.00055)) % 1;
    const t = phase;
    const screenY = H + (VP_Y - H) * t;
    const sc = 1 - t * 0.9;
    if (sc < 0.05) continue;
    // left
    const lx = (VP_X - ROAD_BOT_HALF - kerbW - 16) * (1 - t) + VP_X * t;
    drawTree(ctx, lx, screenY, sc);
    // right
    const rx = W - ((VP_X - ROAD_BOT_HALF - kerbW - 16) * (1 - t) + VP_X * t);
    drawTree(ctx, rx, screenY, sc);
  }

  // finish / lap lines
  const lapLen = TOTAL_DIST / TOTAL_LAPS;
  for (let lap = 0; lap <= TOTAL_LAPS; lap++) {
    const distToLine = lap * lapLen - scrollDist;
    // only show if it would appear on screen (rough range)
    if (distToLine < -50 || distToLine > 900) continue;
    const t = Math.max(0.01, Math.min(0.98, 1 - distToLine / 820));
    const fy  = H + (VP_Y - H) * t;
    const fw  = ROAD_BOT_HALF * 2 * (1 - t);
    const fx  = VP_X - fw / 2;
    const fh  = Math.max(2, 9 * (1 - t));
    for (let ci = 0; ci < 8; ci++) {
      ctx.fillStyle = ci % 2 === 0 ? "#ffffff" : "#111111";
      ctx.fillRect(fx + ci * fw / 8, fy, fw / 8 + 0.5, fh);
    }
    // glow on start/finish
    ctx.fillStyle = "rgba(255,215,0,0.5)";
    ctx.fillRect(fx, fy - fh * 0.5, fw, fh * 0.35);
  }
}

function drawTree(ctx, x, y, scale) {
  ctx.fillStyle = "#2d1f10";
  ctx.fillRect(x - 3*scale, y - 18*scale, 6*scale, 18*scale);
  ctx.fillStyle = "#0b3016";
  ctx.shadowColor = "#0b3016"; ctx.shadowBlur = 5*scale;
  ctx.beginPath(); ctx.moveTo(x, y-52*scale); ctx.lineTo(x-13*scale, y-18*scale); ctx.lineTo(x+13*scale, y-18*scale); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y-66*scale); ctx.lineTo(x-9*scale,  y-38*scale); ctx.lineTo(x+9*scale,  y-38*scale); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
}

// ─── CAR DRAW ─────────────────────────────────────────────────────────────────
function drawCar(ctx, x, y, color, isPlayer, boosting, scaleX=1, scaleY=1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath(); ctx.ellipse(0, CAR_H/2+4, CAR_W/2, 5, 0, 0, Math.PI*2); ctx.fill();

  // body
  ctx.fillStyle = color;
  ctx.shadowColor = boosting ? "#06b6d4" : (isPlayer ? color : "transparent");
  ctx.shadowBlur  = boosting ? 22 : isPlayer ? 10 : 0;
  const cw = CAR_W, ch = CAR_H;
  ctx.beginPath();
  ctx.moveTo(-cw/2+4, -ch/2); ctx.lineTo(cw/2-4, -ch/2);
  ctx.quadraticCurveTo(cw/2,-ch/2, cw/2,-ch/2+4);
  ctx.lineTo(cw/2, ch/2-4); ctx.quadraticCurveTo(cw/2,ch/2, cw/2-4,ch/2);
  ctx.lineTo(-cw/2+4, ch/2); ctx.quadraticCurveTo(-cw/2,ch/2, -cw/2,ch/2-4);
  ctx.lineTo(-cw/2, -ch/2+4); ctx.quadraticCurveTo(-cw/2,-ch/2, -cw/2+4,-ch/2);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;

  // windshield
  ctx.fillStyle = "rgba(160,230,255,0.65)";
  ctx.fillRect(-cw/2+5, -ch/2+8, cw-10, 11);

  // roof stripe
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(-4, -ch/2+3, 8, 5);

  // wheels
  ctx.fillStyle = "#111";
  [[-cw/2-3,-ch/2+6],[cw/2-1,-ch/2+6],[-cw/2-3,ch/2-14],[cw/2-1,ch/2-14]].forEach(([wx,wy]) => {
    ctx.fillRect(wx, wy, 4, 9);
  });

  // lights
  ctx.fillStyle = isPlayer ? "rgba(255,245,160,0.95)" : "rgba(255,80,80,0.85)";
  ctx.fillRect(-cw/2+3, isPlayer ? -ch/2-3 : ch/2+1, 5, 3);
  ctx.fillRect( cw/2-8, isPlayer ? -ch/2-3 : ch/2+1, 5, 3);

  // boost exhaust
  if (boosting) {
    const g = ctx.createLinearGradient(0, ch/2, 0, ch/2+28);
    g.addColorStop(0, "rgba(6,182,212,0.9)");
    g.addColorStop(1, "rgba(6,182,212,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-5,ch/2); ctx.lineTo(5,ch/2); ctx.lineTo(3,ch/2+28); ctx.lineTo(-3,ch/2+28);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RacingGame() {
  const roadRef  = useRef(null);
  const carRef   = useRef(null);
  const gsRef    = useRef(null);
  const keysRef  = useRef({});
  const touchRef = useRef({});
  const rafRef   = useRef(null);
  // track last pressed left/right to prevent repeat-fire on hold
  const laneDebounce = useRef({ left: false, right: false });

  const [screen,      setScreen]      = useState("start");
  const [difficulty,  setDifficulty]  = useState("easy");
  const [hudData,     setHudData]     = useState({ speed:0, lap:1, pos:1, nitro:100, time:0, pct:0 });
  const [countNum,    setCountNum]    = useState(null);
  const [lapMsg,      setLapMsg]      = useState(null);
  const [boostFx,     setBoostFx]     = useState(false);
  const [finalData,   setFinalData]   = useState(null);
  const [leaderboard, setLeaderboard] = useState(() => {
    try { return JSON.parse(localStorage.getItem("apexStraightLB") || "[]"); } catch { return []; }
  });

  const diffMult   = { easy: 0.70, medium: 1.0, hard: 1.28 }[difficulty] ?? 0.7;
  const aiDiffMult = { easy: 0.62, medium: 0.88, hard: 1.15 }[difficulty] ?? 0.62;

  // ── init ──────────────────────────────────────────────────────────────────────
  const initGs = useCallback(() => {
    const colors = ["#ef4444","#22c55e","#f59e0b"];
    gsRef.current = {
      playerLane:     1,
      playerX:        laneX(1),
      playerDist:     0,
      playerSpeed:    0,
      playerNitro:    100,
      playerLap:      1,
      playerBoosting: false,
      scrollDist:     0,
      ais: [0, 2, 3].map((lane, idx) => ({
        id: idx, lane, x: laneX(lane),
        dist: -60 - idx * 55,
        speed: 0,
        targetLane: lane,
        laneTimer: 70 + idx * 35,
        color: colors[idx],
        diffMult: aiDiffMult * (0.88 + idx * 0.06),
        lap: 1,
      })),
      startTime: null,
      elapsed: 0,
      finished: false,
    };
    laneDebounce.current = { left: false, right: false };
  }, [aiDiffMult]);

  // ── start ─────────────────────────────────────────────────────────────────────
  const startRace = useCallback(() => {
    snd.init();
    initGs();
    setScreen("countdown");
    let c = 3; setCountNum(c);
    const iv = setInterval(() => {
      c--;
      if (c > 0) setCountNum(c);
      else if (c === 0) { setCountNum("GO!"); snd.go(); }
      else {
        clearInterval(iv);
        setCountNum(null);
        setScreen("playing");
        if (gsRef.current) gsRef.current.startTime = performance.now();
      }
    }, 900);
  }, [initGs]);

  // ── keyboard ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const dn = (e) => {
      keysRef.current[e.key] = true;
      if ([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      if (e.key === "Escape" || e.key === "p")
        setScreen(s => s === "playing" ? "paused" : s === "paused" ? "playing" : s);
    };
    const up = (e) => {
      keysRef.current[e.key] = false;
      if (e.key === "ArrowLeft")  laneDebounce.current.left  = false;
      if (e.key === "ArrowRight") laneDebounce.current.right = false;
      if (e.key === "a" || e.key === "A") laneDebounce.current.left  = false;
      if (e.key === "d" || e.key === "D") laneDebounce.current.right = false;
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);

  // ── game loop ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "playing") return;
    const roadCanvas = roadRef.current;
    const carCanvas  = carRef.current;
    if (!roadCanvas || !carCanvas) return;
    const rCtx = roadCanvas.getContext("2d");
    const cCtx = carCanvas.getContext("2d");
    let last = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;

      const gs = gsRef.current;
      if (!gs || gs.finished) return;
      const elapsed = (now - gs.startTime) / 1000;
      gs.elapsed = elapsed;

      const keys  = keysRef.current;
      const touch = touchRef.current;
      const db    = laneDebounce.current;

      // ── input ──
      const accel    = keys["ArrowUp"]    || keys["w"] || keys["W"] || touch.up;
      const brake    = keys["ArrowDown"]  || keys["s"] || keys["S"] || touch.down;
      const goLeft   = (keys["ArrowLeft"] || keys["a"] || keys["A"]) && !db.left;
      const goRight  = (keys["ArrowRight"]|| keys["d"] || keys["D"]) && !db.right;
      const nitroKey = keys[" "] || keys["Shift"] || touch.boost;

      // lane change (one step per press)
      if (goLeft  && gs.playerLane > 0)           { gs.playerLane--; db.left  = true; snd.lane(); }
      if (goRight && gs.playerLane < NUM_LANES-1) { gs.playerLane++; db.right = true; snd.lane(); }

      // touch lane — fire each frame but throttle in touch handlers
      if (touch.left  && gs.playerLane > 0           && !touch._lFired) { gs.playerLane--; touch._lFired=true; snd.lane(); setTimeout(()=>touch._lFired=false, 280); }
      if (touch.right && gs.playerLane < NUM_LANES-1 && !touch._rFired) { gs.playerLane++; touch._rFired=true; snd.lane(); setTimeout(()=>touch._rFired=false, 280); }

      // smooth x
      gs.playerX += (laneX(gs.playerLane) - gs.playerX) * 0.16 * dt;

      // nitro
      gs.playerBoosting = nitroKey && gs.playerNitro > 0;
      if (gs.playerBoosting) { gs.playerNitro -= 1.5*dt; if (gs.playerNitro<0) gs.playerNitro=0; }
      else gs.playerNitro = Math.min(100, gs.playerNitro + 0.2*dt);

      // speed
      const topSpd = (MAX_SPEED + (gs.playerBoosting ? 3.5 : 0)) * diffMult;
      if (accel)      gs.playerSpeed = Math.min(topSpd, gs.playerSpeed + 0.22*diffMult*dt);
      else if (brake) gs.playerSpeed = Math.max(0, gs.playerSpeed - 0.4*dt);
      else            gs.playerSpeed = Math.max(0, gs.playerSpeed - 0.06*dt);

      gs.playerDist  += gs.playerSpeed * dt;
      gs.scrollDist   = gs.playerDist;

      // lap logic
      const lapLen = TOTAL_DIST / TOTAL_LAPS;
      const newLap = Math.min(TOTAL_LAPS, Math.floor(gs.playerDist / lapLen) + 1);
      if (newLap > gs.playerLap) {
        gs.playerLap = newLap;
        snd.lap();
        setLapMsg(`LAP ${gs.playerLap - 1} COMPLETE!`);
        setTimeout(() => setLapMsg(null), 1600);
      }

      // finish
      if (gs.playerDist >= TOTAL_DIST && !gs.finished) {
        gs.finished = true;
        const score = Math.max(1000, Math.round(10000 - elapsed * 40));
        setFinalData({ time: elapsed, score });
        const newLB = [...leaderboard, { score, time: elapsed.toFixed(1), diff: difficulty }]
          .sort((a,b)=>b.score-a.score).slice(0,5);
        setLeaderboard(newLB);
        try { localStorage.setItem("apexStraightLB", JSON.stringify(newLB)); } catch {}
        snd.stop();
        setScreen("gameover");
        return;
      }

      // ── AI ──
      gs.ais.forEach(ai => {
        ai.laneTimer -= dt;
        if (ai.laneTimer <= 0) {
          ai.targetLane = Math.floor(Math.random() * NUM_LANES);
          ai.laneTimer  = 80 + Math.random() * 120;
        }
        // avoid player lane when nearby
        const diff = gs.playerDist - ai.dist;
        if (Math.abs(diff) < 90 && ai.targetLane === gs.playerLane)
          ai.targetLane = (gs.playerLane + 1 + Math.round(Math.random())) % NUM_LANES;

        const aiTop = MAX_SPEED * ai.diffMult;
        ai.speed = ai.dist < gs.playerDist + 240
          ? Math.min(aiTop, ai.speed + 0.18*dt)
          : Math.max(0, ai.speed - 0.05*dt);
        ai.dist += ai.speed * dt;
        ai.x += (laneX(ai.targetLane) - ai.x) * 0.09 * dt;

        const aiNewLap = Math.min(TOTAL_LAPS, Math.floor(Math.max(0,ai.dist) / lapLen) + 1);
        if (aiNewLap > ai.lap) ai.lap = aiNewLap;
      });

      // position
      const allDists = [gs.playerDist, ...gs.ais.map(a=>a.dist)];
      allDists.sort((a,b)=>b-a);
      const pos = allDists.indexOf(gs.playerDist) + 1;

      snd.engine(gs.playerSpeed, topSpd);
      setBoostFx(gs.playerBoosting);

      // ── RENDER ROAD ──
      drawRoad(rCtx, gs.scrollDist);

      // ── RENDER CARS ──
      cCtx.clearRect(0, 0, W, H);

      // sort AI by dist (farthest ahead = closest to horizon = drawn first)
      const sortedAIs = [...gs.ais].sort((a,b) => b.dist - a.dist);

      sortedAIs.forEach(ai => {
        const distDiff = gs.playerDist - ai.dist;
        if (distDiff < -120 || distDiff > 700) return;
        // t=0 → same position as player (bottom), t=1 → horizon
        const t = Math.min(0.97, Math.max(0, distDiff / 580));
        const carScreenY = PLAYER_Y - t * (PLAYER_Y - VP_Y - 10);
        const sc = 0.88 - t * 0.73;
        if (sc < 0.06) return;
        // perspective-correct x
        const aiScreenX = VP_X + (ai.x - VP_X) * (1 - t);
        cCtx.save();
        cCtx.translate(aiScreenX, carScreenY);
        cCtx.scale(sc, sc);
        drawCar(cCtx, 0, 0, ai.color, false, false);
        cCtx.restore();
      });

      // player car
      drawCar(cCtx, gs.playerX, PLAYER_Y, "#a855f7", true, gs.playerBoosting);

      // boost particles
      if (gs.playerBoosting) {
        cCtx.fillStyle = "rgba(6,182,212,0.45)";
        for (let i = 0; i < 4; i++) {
          cCtx.beginPath();
          cCtx.arc(gs.playerX+(Math.random()-0.5)*10, PLAYER_Y+(Math.random()-0.5)*8, Math.random()*5+1, 0, Math.PI*2);
          cCtx.fill();
        }
      }

      setHudData({
        speed: Math.round(gs.playerSpeed * 26),
        lap:   Math.min(gs.playerLap, TOTAL_LAPS),
        pos,
        nitro: Math.round(gs.playerNitro),
        time:  Math.round(elapsed),
        pct:   Math.min(100, Math.round(gs.playerDist / TOTAL_DIST * 100)),
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [screen, difficulty, diffMult, leaderboard]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const sfx = n => ["ST","ND","RD","TH"][Math.min(n-1,3)];

  return (
    <>
      <style>{STYLES}</style>
      <div className="rg-root">
        <canvas ref={roadRef} width={W} height={H} style={{ zIndex:1 }} />
        <canvas ref={carRef}  width={W} height={H} style={{ zIndex:2 }} />

        {/* HUD */}
        {(screen === "playing" || screen === "paused") && (
          <div className="rg-hud">
            <div className="rg-hud-top">
              <div className="rg-stat">
                <div className="rg-stat-label">Speed</div>
                <div className="rg-speed-wrap">
                  <div className="rg-stat-val" style={{color:"#a855f7"}}>{hudData.speed}</div>
                  <div className="rg-speed-unit">km/h</div>
                </div>
              </div>
              <div className="rg-stat">
                <div className="rg-stat-label">Lap</div>
                <div className="rg-stat-val">{hudData.lap}<span style={{fontSize:12,color:"#444"}}>/{TOTAL_LAPS}</span></div>
              </div>
              <div className="rg-stat">
                <div className="rg-stat-label">Position</div>
                <div className="rg-stat-val" style={{color:"#ffd700"}}>{hudData.pos}<sup style={{fontSize:11}}>{sfx(hudData.pos)}</sup></div>
              </div>
              <div className="rg-stat">
                <div className="rg-stat-label">Time</div>
                <div className="rg-stat-val" style={{fontSize:18}}>{fmt(hudData.time)}</div>
              </div>
              <div className="rg-bar-outer">
                <div className="rg-bar-label" style={{color:"#06b6d4"}}>⚡ Nitro</div>
                <div className="rg-bar-track">
                  <div className="rg-bar-fill" style={{width:`${hudData.nitro}%`, background:"linear-gradient(90deg,#06b6d4,#0ea5e9)"}} />
                </div>
              </div>
              <div className="rg-bar-outer">
                <div className="rg-bar-label" style={{color:"#a855f7"}}>Progress</div>
                <div className="rg-bar-track">
                  <div className="rg-bar-fill" style={{width:`${hudData.pct}%`, background:"linear-gradient(90deg,#a855f7,#7c3aed)"}} />
                </div>
              </div>
            </div>

            <div className="rg-controls-hint">
              <span className="rg-key">↑</span><span className="rg-key-sep">Speed up</span>
              <span className="rg-key">↓</span><span className="rg-key-sep">Brake</span>
              <span className="rg-key">← →</span><span className="rg-key-sep">Change lane</span>
              <span className="rg-key">Space</span><span className="rg-key-sep">Nitro</span>
              <span className="rg-key">Esc</span><span className="rg-key-sep">Pause</span>
            </div>

            {boostFx && <div className="rg-nitro-flash on" />}
          </div>
        )}

        {lapMsg && <div className="rg-lap-flash">{lapMsg}</div>}

        {countNum !== null && (
          <div className="rg-countdown-wrap">
            <div key={String(countNum)} className="rg-count-num">{countNum}</div>
          </div>
        )}

        {screen === "paused" && (
          <div className="rg-pause-overlay">
            <div className="rg-pause-title">PAUSED</div>
            <button className="rg-btn primary" onClick={() => setScreen("playing")}>Resume</button>
            <button className="rg-btn" onClick={() => { snd.stop(); setScreen("start"); }}>Quit</button>
          </div>
        )}

        {screen === "playing" && (
          <div className="rg-touch">
            <div className="rg-trow">
              <div className="rg-tbtn" onTouchStart={()=>touchRef.current.left=true}  onTouchEnd={()=>touchRef.current.left=false}>◀</div>
              <div className="rg-tbtn" onTouchStart={()=>touchRef.current.right=true} onTouchEnd={()=>touchRef.current.right=false}>▶</div>
            </div>
            <div className="rg-tbtn boost" onTouchStart={()=>touchRef.current.boost=true} onTouchEnd={()=>touchRef.current.boost=false}>⚡</div>
            <div className="rg-trow" style={{flexDirection:"column",gap:8}}>
              <div className="rg-tbtn" onTouchStart={()=>touchRef.current.up=true}   onTouchEnd={()=>touchRef.current.up=false}>▲</div>
              <div className="rg-tbtn" onTouchStart={()=>touchRef.current.down=true} onTouchEnd={()=>touchRef.current.down=false}>▼</div>
            </div>
          </div>
        )}

        {/* START SCREEN */}
        {screen === "start" && (
          <div className="rg-screen">
            <div className="rg-bg" />
            <div className="rg-scanlines" />
            <div className="rg-content">
              <div className="rg-title">APEX<br/>RUSH</div>
              <div className="rg-sub">Straight Track · Arcade Racer</div>
              <div className="rg-divider" />

              <div className="rg-label-sm" style={{marginBottom:12}}>How to play</div>
              <div style={{color:"#777",fontSize:13,lineHeight:2,marginBottom:20}}>
                <span style={{color:"#a855f7"}}>↑</span> Accelerate &nbsp;·&nbsp;
                <span style={{color:"#a855f7"}}>↓</span> Brake &nbsp;·&nbsp;
                <span style={{color:"#a855f7"}}>← →</span> Switch lanes<br/>
                Hold <span style={{color:"#06b6d4"}}>Space</span> for Nitro boost &nbsp;·&nbsp;
                <span style={{color:"#888"}}>Esc</span> to pause<br/>
                <span style={{color:"#555",fontSize:12}}>Complete {TOTAL_LAPS} laps to win — overtake the AI cars!</span>
              </div>

              <div className="rg-label-sm">Difficulty</div>
              <div className="rg-diff-row">
                {["easy","medium","hard"].map(d => (
                  <button key={d} className={`rg-diff ${d}${difficulty===d?" on":""}`} onClick={()=>setDifficulty(d)}>{d}</button>
                ))}
              </div>

              <button className="rg-btn primary" onClick={startRace}>START RACE</button>

              {leaderboard.length > 0 && (
                <div className="rg-lb" style={{marginTop:20}}>
                  <div className="rg-lb-head">Best Times</div>
                  {leaderboard.slice(0,3).map((e,i) => (
                    <div key={i} className="rg-lb-row">
                      <span style={{color:"#555",marginRight:8}}>#{i+1}</span>
                      <span style={{textTransform:"uppercase",fontSize:11,letterSpacing:1,flex:1}}>{e.diff}</span>
                      <span style={{color:"#a855f7",marginRight:12}}>{Number(e.score).toLocaleString()} pts</span>
                      <span style={{color:"#555",fontSize:11}}>{e.time}s</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GAME OVER */}
        {screen === "gameover" && finalData && (
          <div className="rg-screen">
            <div className="rg-bg" style={{background:"radial-gradient(ellipse at 50% 40%,#1a1400 0%,#0a0a0f 70%)"}} />
            <div className="rg-scanlines" />
            <div className="rg-content">
              <div className="rg-title" style={{textShadow:"0 0 40px #ffd700,0 0 80px #b8860b"}}>RACE<br/>COMPLETE</div>
              <div style={{color:"#ffd700",fontSize:14,letterSpacing:4,margin:"8px 0"}}>🏁 FINISHED!</div>
              <div className="rg-divider" style={{background:"linear-gradient(90deg,transparent,#ffd700,transparent)"}} />
              <div className="rg-results">
                <div className="rg-result-cell">
                  <div className="rg-stat-label">Time</div>
                  <div className="rg-stat-val">{finalData.time.toFixed(1)}s</div>
                </div>
                <div className="rg-result-cell">
                  <div className="rg-stat-label">Score</div>
                  <div className="rg-stat-val" style={{color:"#ffd700"}}>{finalData.score.toLocaleString()}</div>
                </div>
                <div className="rg-result-cell">
                  <div className="rg-stat-label">Laps</div>
                  <div className="rg-stat-val">{TOTAL_LAPS}</div>
                </div>
                <div className="rg-result-cell">
                  <div className="rg-stat-label">Difficulty</div>
                  <div className="rg-stat-val" style={{fontSize:15,textTransform:"uppercase"}}>{difficulty}</div>
                </div>
              </div>
              <button className="rg-btn gold-btn" onClick={startRace}>RACE AGAIN</button>
              <button className="rg-btn" onClick={() => setScreen("start")}>Main Menu</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
