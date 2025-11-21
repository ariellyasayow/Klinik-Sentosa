/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#13a4ec",
        
        // Background tetap terang seperti desain asli
        "bg-primary": "#F0F4F8", 
        "bg-secondary": "#FFFFFF",
        "text-main": "#334155", // Slate 700 (Tulisan agak abu tua agar tidak terlalu hitam pekat)
        "dark-elements": "#0f172a", // Slate 900 (Header gelap)
        
        // WARNA AKSI YANG DIPERKUAT (LEBIH KENTARA)
        // Biru yang lebih "hidup" untuk tombol utama
        "accent-cta": "#2563eb", // Blue 600
        "accent-cta-hover": "#1d4ed8", // Blue 700
        
        // Merah yang benar-benar menyala untuk darurat
        "emergency": "#dc2626", // Red 600
        "emergency-hover": "#b91c1c", // Red 700
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "body": ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}