export default function RacingGame() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-900">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Arcade Racing Game</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Professional-style racing layout with pause, resume, player name, scoring, coins, fuel, and power-ups.
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              placeholder="Player Name"
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 text-sm outline-none"
            />
            <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium">
              Start
            </button>
            <button className="px-4 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-sm font-medium">
              Pause
            </button>
            <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-medium">
              Stop
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 min-h-[700px]">
          <div className="col-span-9 relative bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 overflow-hidden">
            <div className="absolute top-4 left-4 right-4 z-20 grid grid-cols-5 gap-3">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xs text-neutral-300">Speed</div>
                <div className="text-xl font-bold">142 km/h</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xs text-neutral-300">Score</div>
                <div className="text-xl font-bold">8,450</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xs text-neutral-300">Coins</div>
                <div className="text-xl font-bold">126</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xs text-neutral-300">Fuel</div>
                <div className="text-xl font-bold">72%</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xs text-neutral-300">Lives</div>
                <div className="text-xl font-bold">3</div>
              </div>
            </div>

            <div className="absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-sky-300 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 h-[75%] flex justify-center">
                <div
                  className="relative h-full"
                  style={{
                    width: '70%',
                    clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
                    background: 'linear-gradient(to bottom, #4b5563, #1f2937)'
                  }}
                >
                  <div className="absolute inset-0 flex justify-center">
                    <div className="w-2 bg-yellow-300/80 h-full" />
                  </div>

                  <div className="absolute inset-0 grid grid-cols-4">
                    <div className="border-r border-dashed border-white/30" />
                    <div className="border-r border-dashed border-white/30" />
                    <div className="border-r border-dashed border-white/30" />
                  </div>
                </div>
              </div>

              <div className="absolute left-[35%] bottom-[28%] w-12 h-24 rounded-xl bg-red-500 shadow-2xl border-4 border-red-300" />
              <div className="absolute left-[48%] bottom-[15%] w-14 h-28 rounded-xl bg-yellow-400 shadow-2xl border-4 border-yellow-200" />
              <div className="absolute left-[60%] bottom-[45%] w-10 h-20 rounded-xl bg-blue-500 shadow-2xl border-4 border-blue-300" />
              <div className="absolute left-[52%] bottom-[65%] w-8 h-16 rounded-xl bg-red-400 opacity-90" />

              <div className="absolute left-[46%] bottom-[6%] w-16 h-32 rounded-2xl bg-cyan-400 border-4 border-cyan-200 shadow-[0_0_40px_rgba(34,211,238,0.8)]" />
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-2xl text-sm text-neutral-200">
              Use Arrow Keys to Move • Space to Boost • P to Pause
            </div>
          </div>

          <div className="col-span-3 bg-neutral-950 border-l border-neutral-800 p-5 flex flex-col gap-5">
            <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
              <h2 className="font-semibold text-lg mb-3">Player</h2>
              <div className="space-y-2 text-sm text-neutral-300">
                <div className="flex justify-between"><span>Name</span><span>Player 1</span></div>
                <div className="flex justify-between"><span>Car</span><span>Sports GT</span></div>
                <div className="flex justify-between"><span>Theme</span><span>Desert Track</span></div>
                <div className="flex justify-between"><span>Level</span><span>7</span></div>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
              <h2 className="font-semibold text-lg mb-3">Controls</h2>
              <div className="space-y-3 text-sm text-neutral-300">
                <div className="flex justify-between"><span>⬅️ ➡️</span><span>Move</span></div>
                <div className="flex justify-between"><span>⬆️</span><span>Accelerate</span></div>
                <div className="flex justify-between"><span>⬇️</span><span>Brake</span></div>
                <div className="flex justify-between"><span>Space</span><span>Boost</span></div>
                <div className="flex justify-between"><span>P</span><span>Pause</span></div>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
              <h2 className="font-semibold text-lg mb-3">Garage</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="rounded-xl p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm">
                  Sports Car
                </button>
                <button className="rounded-xl p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm">
                  Truck
                </button>
                <button className="rounded-xl p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm">
                  Formula
                </button>
                <button className="rounded-xl p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm">
                  SUV
                </button>
              </div>
            </div>

            <div className="mt-auto bg-red-950/40 border border-red-800 rounded-2xl p-4">
              <h2 className="font-semibold text-red-300 mb-2">Game Over</h2>
              <div className="text-sm text-neutral-300 space-y-1">
                <div>Final Score: 12,450</div>
                <div>Coins Collected: 89</div>
                <div>Distance: 12.8 km</div>
              </div>
              <button className="w-full mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-medium">
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}