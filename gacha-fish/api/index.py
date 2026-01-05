from http.server import BaseHTTPRequestHandler
import json
import random

# Definisi Database Ikan & Probabilitas
# Chance dalam bentuk persentase (0.0 - 1.0)
FISH_DB = [
    { name: "Aduh Kamu Dapat Sampah", rarity: "Common", chance: 0.40, color: "text-gray-400", price: 5 },
  { name: "Iziin belum Hoki", rarity: "Uncommon", chance: 0.30, color: "text-green-400", price: 15 },
  { name: "Sinar Manta", rarity: "Rare", chance: 0.15, color: "text-blue-400", price: 50 },
  { name: "Kepiting Ruin", rarity: "Epic", chance: 0.10, color: "text-purple-400", price: 200 },
  { name: "Kepiting Laut Runic", rarity: "Mitos", chance: 0.04, color: "text-yellow-400", price: 1000 },
  { name: "Hiu Petarung Glaidasi", rarity: "Secret", chance: 0.01, color: "text-green-500", price: 10000 },
   { name: "Orca", rarity: "Secret", chance: 0.01, color: "text-green-500", price: 10000 },
]

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Logika RNG
        # Kita menggunakan bobot (weights) berdasarkan chance
        fish_choices = FISH_DB
        weights = [f["chance"] for f in fish_choices]
        
        # Gacha!
        caught_fish = random.choices(fish_choices, weights=weights, k=1)[0]
        
        # Kirim response JSON
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(caught_fish).encode('utf-8'))
        return