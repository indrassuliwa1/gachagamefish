import { useState } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [fish, setFish] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // SISTEM KOIN
  const [coins, setCoins] = useState(300); 
  const GACHA_COST = 100;

  const pullGacha = async () => {
    // Cek apakah koin cukup
    if (coins < GACHA_COST) {
      alert("Koin tidak cukup! Silahkan top up (refresh halaman untuk reset).");
      return;
    }

    setLoading(true);
    setFish(null);
    setCoins(prev => prev - GACHA_COST); // Kurangi koin

    try {
      const response = await axios.get('/api/index');
      const result = response.data;

      setTimeout(() => {
        setFish(result);
        setHistory(prev => [result, ...prev]);
        setLoading(false);

        if (['Legendary', 'MYTHICAL'].includes(result.rarity)) {
          triggerConfetti();
        }
      }, 1500); 
      
    } catch (error) {
      console.error("Gagal mancing:", error);
      setLoading(false);
      // Kembalikan koin jika error
      setCoins(prev => prev + GACHA_COST);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#5865F2', '#EB459E', '#FFFFFF'] // Warna Discord-ish
    });
  };

  const getCardStyle = (rarity) => {
    // Style kartu disesuaikan dengan tema gelap
    switch(rarity) {
      case 'MYTHICAL': return 'bg-gradient-to-b from-red-900/80 to-black border-red-500/50 shadow-[0_0_40px_rgba(220,38,38,0.5)]';
      case 'Legendary': return 'bg-gradient-to-b from-yellow-700/80 to-black border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.4)]';
      case 'Epic': return 'bg-gradient-to-b from-purple-800/80 to-slate-900 border-purple-500/50';
      case 'Rare': return 'bg-gradient-to-b from-blue-800/80 to-slate-900 border-blue-500/50';
      default: return 'bg-slate-700/50 border-slate-600';
    }
  };

  // Helper untuk warna text rarity di history
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'MYTHICAL': return 'text-red-500 font-bold';
      case 'Legendary': return 'text-yellow-400 font-bold';
      case 'Epic': return 'text-purple-400';
      case 'Rare': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    // BACKGROUND UTAMA (Warna Discord Dark: #36393f mendekati slate-800/900)
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#2f3136] text-gray-100 font-sans overflow-hidden relative">
      
      {/* Background Decor (Blob Ungu Blur) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>

      {/* CONTAINER UTAMA - GLASSMORPHISM */}
      <div className="z-10 w-full max-w-4xl bg-[#36393f]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* PANEL KIRI: AREA GACHA */}
        <div className="flex-1 p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/5 relative">
          
          {/* Header & Coin Display */}
          <div className="w-full flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black italic text-indigo-400 tracking-wider">
              FISH.IT <span className="text-white not-italic font-light">RNG</span>
            </h1>
            <div className="bg-slate-900/50 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="text-yellow-400">🪙</span>
              <span className="font-mono font-bold text-white">{coins}</span>
            </div>
          </div>

          {/* DISPLAY KARTU */}
          <div className="relative w-full flex-1 flex items-center justify-center perspective-1000 min-h-[300px]">
             <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-300 animate-pulse">Casting line...</p>
                </motion.div>
              ) : fish ? (
                <motion.div
                  key="result"
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  className={`w-64 h-80 rounded-xl border-2 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group shadow-2xl ${getCardStyle(fish.rarity)}`}
                >
                  {/* Efek Shine Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  <span className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 bg-black/30 px-2 py-1 rounded ${fish.color}`}>
                    {fish.rarity}
                  </span>
                  
                  <div className="text-7xl my-2 filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    {fish.rarity === 'MYTHICAL' ? '🦈' : fish.rarity === 'Legendary' ? '🐋' : '🐟'}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mt-4 drop-shadow-md">
                    {fish.name}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-white/10 w-full flex justify-between text-xs text-gray-300">
                    <span>Price</span>
                    <span className="text-green-400 font-mono">${fish.price}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-gray-500 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-slate-700/30 rounded-full flex items-center justify-center text-4xl mb-2">
                    🎣
                  </div>
                  <p>Siap untuk memancing?</p>
                  <p className="text-xs bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded">Cost: {GACHA_COST} Coins</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* ACTION BUTTON */}
          <div className="w-full mt-8">
            <button
              onClick={pullGacha}
              disabled={loading || coins < GACHA_COST}
              className={`
                w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg
                ${loading 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : coins < GACHA_COST
                    ? 'bg-red-900/50 text-red-400 border border-red-500/30 cursor-not-allowed'
                    : 'bg-[#5865F2] hover:bg-[#4752C4] text-white hover:shadow-indigo-500/30 active:scale-[0.98]'
                }
              `}
            >
              {loading ? 'Menunggu Ikan...' : coins < GACHA_COST ? 'Koin Habis' : 'GACHA (100 🪙)'}
            </button>
            
            {coins < GACHA_COST && (
               <p className="text-center text-xs text-gray-500 mt-2 cursor-pointer hover:text-white" onClick={() => setCoins(300)}>
                 (Klik di sini untuk Reset Koin - Dev Mode)
               </p>
            )}
          </div>
        </div>

        {/* PANEL KANAN: INVENTORY / HISTORY */}
        <div className="w-full md:w-80 bg-black/20 p-6 flex flex-col">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📋</span> Riwayat Tangkapan
          </h4>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {history.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                Belum ada tangkapan
              </div>
            ) : (
              history.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#2f3136] p-3 rounded-lg border border-white/5 flex items-center justify-between hover:bg-[#40444b] transition-colors"
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium text-gray-200`}>{item.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">Sell: ${item.price}</span>
                  </div>
                  <span className={`text-xs ${getRarityColor(item.rarity)} bg-black/20 px-2 py-1 rounded`}>
                    {item.rarity}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;