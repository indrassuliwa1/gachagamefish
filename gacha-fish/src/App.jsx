import { useState, useEffect } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA IKAN (LOCAL BACKUP) ---
const LOCAL_FISH_DB = [
  { name: "Aduh Kamu Dapat Sampah", rarity: "Common", chance: 0.40, color: "text-gray-400", price: 5 },
  { name: "Iziin belum Hoki", rarity: "Uncommon", chance: 0.30, color: "text-gray-400", price: 15 },
  { name: "Sinar Manta", rarity: "Rare", chance: 0.15, color: "text-blue-400", price: 50 },
  { name: "Kepiting Ruin", rarity: "Epic", chance: 0.10, color: "text-purple-400", price: 200 },
  { name: "Kepiting Laut Runic", rarity: "Mitos", chance: 0.04, color: "text-red-500", price: 1000 },
  { name: "Hiu Petarung Glaidasi", rarity: "Secret", chance: 0.01, color: "text-lime-400", price: 10000 },
  { name: "Orca", rarity: "Secret", chance: 0.01, color: "text-lime-400", price: 10000 },
];

function App() {
  const [fish, setFish] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // -- LOCAL STORAGE --
  const [coins, setCoins] = useState(() => {
    const savedCoins = localStorage.getItem('fish_coins');
    return savedCoins ? parseInt(savedCoins) : 300;
  });

  // -- WELCOME POPUP STATE --
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    localStorage.setItem('fish_coins', coins);
  }, [coins]);

  // Cek apakah user pengguna baru saat website dimuat
  useEffect(() => {
    // SAYA UBAH KEY-NYA JADI 'v2' AGAR MUNCUL LAGI DI BROWSER KAMU
    const hasVisited = localStorage.getItem('visited_supri_v2');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const handleAcceptWelcome = () => {
    localStorage.setItem('visited_supri_v2', 'true');
    setShowWelcome(false);
  };

  // -- ADMIN SYSTEM --
  const [showAdmin, setShowAdmin] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const [cheatRarity, setCheatRarity] = useState(null);
  const GACHA_COST = 100;

  const handleLogoClick = () => {
    setSecretClicks(prev => prev + 1);
    if (secretClicks + 1 >= 5) {
      setShowAdmin(true);
      setSecretClicks(0);
    }
  };

  const getLocalRandomFish = () => {
    if (cheatRarity) return LOCAL_FISH_DB.find(f => f.rarity === cheatRarity) || LOCAL_FISH_DB[0];
    const rand = Math.random();
    let cumulativeChance = 0;
    for (const fish of LOCAL_FISH_DB) {
      cumulativeChance += fish.chance;
      if (rand < cumulativeChance) return fish;
    }
    return LOCAL_FISH_DB[0];
  };

  const pullGacha = async () => {
    if (coins < GACHA_COST) return;
    setLoading(true);
    setFish(null);
    setCoins(prev => prev - GACHA_COST);
    let result = null;

    try {
      if (cheatRarity) throw new Error("Cheat Mode");
      const response = await axios.get('/api/index', { timeout: 2000 });
      if (response.data && response.data.name) result = response.data;
      else throw new Error("Invalid Data");
    } catch (error) {
      result = getLocalRandomFish();
    }

    setTimeout(() => {
      setFish(result);
      setHistory(prev => [result, ...prev]);
      setLoading(false);
      if (['Legendary', 'MYTHICAL', 'Epic', 'Mitos', 'Secret'].includes(result.rarity)) triggerConfetti();
    }, 1500); 
  };

  const triggerConfetti = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#5865F2', '#EB459E', '#FFFFFF'] });
  };

  // --- LOGIKA WARNA KARTU ---
  const getCardStyle = (rarity) => {
    switch(rarity) {
      case 'Secret':
      case 'MYTHICAL': 
        return 'bg-gradient-to-b from-lime-600/80 to-black border-lime-400/50 shadow-[0_0_40px_rgba(132,204,22,0.5)]';
      case 'Mitos':
      case 'Legendary': 
        return 'bg-gradient-to-b from-red-700/80 to-black border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]';
      case 'Epic': 
        return 'bg-gradient-to-b from-purple-800/80 to-slate-900 border-purple-500/50';
      case 'Rare': 
        return 'bg-gradient-to-b from-blue-800/80 to-slate-900 border-blue-500/50';
      default: 
        return 'bg-slate-700/50 border-slate-600';
    }
  };

  // --- LOGIKA EMOJI ---
  const getFishEmoji = (rarity) => {
    if (rarity === 'Common' || rarity === 'Uncommon') return '😢'; 
    if (rarity === 'Secret' || rarity === 'MYTHICAL') return '🦈';
    if (rarity === 'Mitos' || rarity === 'Legendary') return '🐋';
    return '🐟';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#2f3136] text-gray-100 font-sans overflow-x-hidden relative">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#202225]/80 backdrop-blur-md border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform" onClick={handleLogoClick}>
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-lg">🎣</div>
              <h1 className="text-xl font-black italic text-indigo-400 tracking-wider">
                SUPRI <span className="text-white not-italic font-light">IT</span>
              </h1>
            </div>
            <div className="bg-slate-900/50 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-inner">
              <span className="text-yellow-400 text-lg drop-shadow-md">🪙</span>
              <span className="font-mono font-bold text-white text-lg">{coins}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MODAL WELCOME (POP UP ATURAN) --- */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          >
            <div className="bg-[#2f3136] w-full max-w-md p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)] text-center relative">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
                👋
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Selamat Datang!</h2>
              <p className="text-gray-400 text-sm mb-6">Selamat datang di <span className="text-indigo-400 font-bold">Supri IT RNG</span>. Sebelum bermain, mohon perhatikan hal berikut:</p>
              
              <div className="bg-black/30 p-4 rounded-xl text-left space-y-3 mb-8 text-sm text-gray-300 border border-white/5">
                <div className="flex items-start gap-3">
                  <span className="text-indigo-400 mt-0.5">✔</span>
                  <p>Ini adalah <span className="text-white font-bold">Simulator Gacha</span>, tidak menggunakan uang asli.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-indigo-400 mt-0.5">✔</span>
                  <p>Kamu diberi modal awal <span className="text-yellow-400 font-bold">300 Koin</span>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-indigo-400 mt-0.5">✔</span>
                  <p>Rarity <span className="text-lime-400 font-bold">SECRET</span> memiliki peluang 1%, sangat langka!</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-indigo-400 mt-0.5">✔</span>
                  <p>Jika Kamu Dapat <span className="text-blue-400 font-bold">Ikan</span> Kamu Bisa Menghubungi Saya Atau Add Akun Roblox Saya @RyzenASF</p>
                </div>
              </div>

              <button 
                onClick={handleAcceptWelcome}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
              >
                SIAP, AYO GAS! 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL ADMIN --- */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <div className="bg-[#202225] w-full max-w-sm p-6 rounded-2xl border border-red-500/50 shadow-2xl relative">
              <button onClick={() => setShowAdmin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
              <h2 className="text-lg font-bold text-red-500 font-mono mb-4 border-b border-red-500/20 pb-2">ADMIN PANEL 🛠️</h2>
              <div className="space-y-4">
                <div className="bg-[#2f3136] p-3 rounded-lg">
                  <label className="text-xs text-gray-400 uppercase font-bold">Inject Coins</label>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setCoins(prev => prev + 1000)} className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded text-xs font-bold transition-colors">+1000</button>
                    <button onClick={() => setCoins(300)} className="flex-1 bg-yellow-600 hover:bg-yellow-500 py-2 rounded text-xs font-bold transition-colors">Reset</button>
                  </div>
                </div>
                <div className="bg-[#2f3136] p-3 rounded-lg">
                  <label className="text-xs text-gray-400 uppercase font-bold">Set Luck (Next Spin)</label>
                  <select 
                    className="w-full mt-2 bg-black/50 border border-gray-600 rounded p-2 text-sm focus:outline-none focus:border-indigo-500"
                    onChange={(e) => setCheatRarity(e.target.value || null)}
                    value={cheatRarity || ""}
                  >
                    <option value="">Fair (Random)</option>
                    <option value="Secret">Force SECRET (Hijau)</option>
                    <option value="Mitos">Force MITOS (Merah)</option>
                  </select>
                </div>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded text-xs font-bold transition-colors">
                  FACTORY DATA RESET
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow pt-24 pb-12 px-4 z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* KOLOM KIRI: AREA GACHA */}
        <section className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-sm bg-[#36393f]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="relative w-full aspect-[3/4] flex items-center justify-center perspective-1000 mb-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-300 animate-pulse font-medium">Mencari ikan...</p>
                  </motion.div>
                ) : fish ? (
                  <motion.div
                    key="result"
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    className={`w-full h-full rounded-2xl border-4 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group shadow-2xl ${getCardStyle(fish.rarity)}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
                    <span className={`text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm ${fish.color}`}>
                      {fish.rarity}
                    </span>
                    <div className="flex-1 flex items-center justify-center">
                       <div className="text-8xl md:text-9xl filter drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                         {getFishEmoji(fish.rarity)}
                       </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mt-4 drop-shadow-md leading-tight">{fish.name}</h3>
                    <div className="mt-6 pt-4 border-t border-white/10 w-full flex justify-between items-end text-sm text-gray-300 font-mono">
                      <span>Value</span>
                      <span className="text-green-400 text-lg font-bold">${fish.price}</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-full h-full rounded-2xl border-2 border-dashed border-gray-700 bg-black/10 flex flex-col items-center justify-center gap-4 text-gray-500">
                    <div className="text-6xl grayscale opacity-50">🎣</div>
                    <p className="font-medium">Tekan tombol di bawah</p>
                    {cheatRarity && <div className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-bold animate-pulse">CHEAT ACTIVE</div>}
                  </div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={pullGacha}
              disabled={loading || coins < GACHA_COST}
              className={`
                w-full py-5 rounded-2xl font-black text-xl tracking-wide uppercase transition-all duration-200 shadow-lg active:scale-[0.98]
                ${loading 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : coins < GACHA_COST
                    ? 'bg-red-900/80 text-red-300 border border-red-500/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/25'
                }
              `}
            >
              {loading ? 'Menarik Kail...' : coins < GACHA_COST ? 'Koin Habis' : `GACHA (${GACHA_COST} 🪙)`}
            </button>
          </div>
        </section>

        {/* KOLOM KANAN: HISTORY */}
        <section className="w-full lg:w-96 flex flex-col gap-4">
          <div className="bg-[#202225]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><span>📜</span> Riwayat Tangkapan</h4>
              <span className="text-xs bg-black/30 px-2 py-1 rounded text-gray-500">{history.length} Item</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {history.length === 0 ? (
                 <div className="h-40 flex flex-col items-center justify-center text-gray-600 text-sm italic border-2 border-dashed border-gray-700/50 rounded-xl">
                    <p>Belum ada ikan tertangkap.</p>
                    <p className="text-xs mt-1">Ayo mulai memancing!</p>
                 </div>
              ) : (
                history.map((item, idx) => (
                  <motion.div 
                    key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * Math.min(idx, 5) }} 
                    className="group bg-[#2f3136] hover:bg-[#36393f] p-4 rounded-xl border border-white/5 flex justify-between items-center transition-all hover:translate-x-1 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-black/20 ${['Secret', 'Mitos', 'MYTHICAL','Legendary'].includes(item.rarity) ? 'shadow-[0_0_15px_rgba(255,215,0,0.2)]' : ''}`}>
                         {getFishEmoji(item.rarity)}
                       </div>
                       <div className="flex flex-col">
                         <span className="text-gray-200 font-bold text-sm group-hover:text-white transition-colors">{item.name}</span>
                         <span className="text-[10px] text-gray-500 font-mono">Harga Jual: ${item.price}</span>
                       </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded bg-black/30 ${item.rarity === 'Secret' ? 'text-lime-400 border border-lime-500/20' : item.rarity === 'Mitos' ? 'text-red-500 border border-red-500/20' : 'text-gray-500'}`}>{item.rarity}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full bg-[#202225] border-t border-white/5 py-8 mt-auto z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-2">&copy; 2024 <span className="text-indigo-400 font-bold">Supri IT RNG</span>. All rights reserved.</p>
          <div className="flex justify-center gap-4 text-xs text-gray-600">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
            <span>•</span>
            <span className="cursor-help" title="Just a game!">Help</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;