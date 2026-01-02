import { useState } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [fish, setFish] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const pullGacha = async () => {
    setLoading(true);
    setFish(null); // Reset tampilan sementara

    try {
      // Panggil API Python kita
      const response = await axios.get('/api/index');
      const result = response.data;

      // Simulasi delay "Mancing" agar terasa menegangkan
      setTimeout(() => {
        setFish(result);
        setHistory(prev => [result, ...prev]);
        setLoading(false);

        // Efek Confetti jika dapat Legendary/Mythical
        if (['Legendary', 'MYTHICAL'].includes(result.rarity)) {
          triggerConfetti();
        }
      }, 1500); // 1.5 detik delay
      
    } catch (error) {
      console.error("Gagal mancing:", error);
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF0000', '#FFFFFF']
    });
  };

  // Helper function untuk warna background card berdasarkan rarity
  const getCardStyle = (rarity) => {
    switch(rarity) {
      case 'MYTHICAL': return 'bg-gradient-to-br from-red-900 via-black to-red-900 border-red-500 shadow-[0_0_50px_rgba(255,0,0,0.7)]';
      case 'Legendary': return 'bg-gradient-to-br from-yellow-700 via-yellow-900 to-yellow-700 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.5)]';
      case 'Epic': return 'bg-gradient-to-br from-purple-800 to-indigo-900 border-purple-400';
      case 'Rare': return 'bg-gradient-to-br from-blue-800 to-cyan-900 border-blue-400';
      default: return 'bg-slate-800 border-slate-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      {/* Overlay Gelap */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

      <div className="z-10 w-full max-w-md flex flex-col items-center gap-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-lg tracking-wider">
          FISH IT RNG
        </h1>

        {/* AREA GACHA UTAMA */}
        <div className="relative w-full h-80 flex items-center justify-center perspective-1000">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-6xl animate-bounce"
              >
                🎣
              </motion.div>
            ) : fish ? (
              <motion.div
                key="result"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className={`w-64 h-80 rounded-2xl border-4 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden ${getCardStyle(fish.rarity)}`}
              >
                {/* Efek Shine untuk Rare ke atas */}
                {['Epic', 'Legendary', 'MYTHICAL'].includes(fish.rarity) && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent w-full h-full animate-pulse pointer-events-none"></div>
                )}

                <h2 className={`text-xl font-bold uppercase tracking-widest mb-2 ${fish.color}`}>
                  {fish.rarity}
                </h2>
                <div className="text-6xl my-4 drop-shadow-2xl">
                  {fish.rarity === 'MYTHICAL' ? '🦈' : fish.rarity === 'Legendary' ? '🐋' : '🐟'}
                </div>
                <h3 className="text-3xl font-black text-white drop-shadow-md">
                  {fish.name}
                </h3>
                <p className="mt-4 text-sm text-gray-300 bg-black/40 px-3 py-1 rounded-full">
                  Harga: ${fish.price}
                </p>
              </motion.div>
            ) : (
              <div className="text-gray-400 text-lg">Siap memancing?</div>
            )}
          </AnimatePresence>
        </div>

        {/* TOMBOL MANCING */}
        <button
          onClick={pullGacha}
          disabled={loading}
          className={`
            px-12 py-4 rounded-full text-2xl font-bold text-white shadow-xl transition-all transform
            ${loading ? 'bg-gray-600 cursor-not-allowed scale-95' : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 hover:shadow-cyan-500/50 active:scale-95'}
          `}
        >
          {loading ? 'Sedang Menarik...' : 'MANCING! 🎣'}
        </button>

        {/* RIWAYAT TANGKAPAN */}
        <div className="w-full bg-slate-900/80 p-4 rounded-xl border border-slate-700 max-h-40 overflow-y-auto">
          <h4 className="text-sm text-gray-400 mb-2 uppercase font-bold">Riwayat Tangkapan</h4>
          <div className="flex flex-col gap-2">
            {history.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-700 pb-1">
                <span className={item.color}>{item.name}</span>
                <span className="text-gray-500">{item.rarity}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;