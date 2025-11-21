# Klinik Terpadu (Vite + Tailwind)

UI interaktif untuk workflow klinik (login multi-role, resepsionis, dokter, apotek, kasir) yang diambil dari requirement Sumber A/B/C. Proyek menggunakan React + Vite + Tailwind serta `db.json` sebagai mock database via `json-server`.

## Fitur Utama

- **Pra-akses aman**: login dengan role (Admin, Dokter, Apoteker, Kasir) untuk mengarahkan langsung ke modul relevan.
- **Resepsionis**: Card Menu (Pasien Baru/Lama/Darurat), pencarian autocomplete, preview data, live queue, emergency fast-track.
- **Dokter**: workspace split screen (input keluhan/tanda vital/diagnosa + e-prescription) & panel riwayat medis accordion.
- **Apotek**: daftar resep dengan status (Baru, Disiapkan, Selesai) + checklist obat & kartu edukasi pasien.
- **Kasir**: rincian tagihan (jasa dokter + obat), simulasi pembayaran tunai + perhitungan kembalian, siap untuk metode masa depan.

## Prasyarat

- Node.js 18+
- npm 10+

## Menjalankan Aplikasi

```bash
cd clinic-app
npm install

# Jalankan mock database (port 4000)
npm run mock

# Di terminal lain, jalankan UI
npm run dev
```

- UI tersedia di `http://localhost:5173`
- Endpoint mock tersedia di `http://localhost:4000/{users|patients|visits|queue|prescriptions|bills}`

> Bila `json-server` tidak dijalankan, aplikasi otomatis jatuh ke mode offline menggunakan data mock lokal.

## Struktur Data (`db.json`)

```text
db.json
├── users           // kredensial & role
├── patients        // biodata pasien
├── visits          // rekam medis historis
├── queue           // antrean aktif + prioritas
├── prescriptions   // resep digital + edukasi
└── bills           // tagihan kasir
```

Silakan kembangkan endpoint tambahan (mis. `/payments`, `/labs`) dengan menambah koleksi baru di `db.json` dan menyesuaikan hook `useClinicData`.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
"# Klinik-Sentosa" 
