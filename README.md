# Neon Snake

Game Snake klasik dengan tampilan modern bertema neon. Pemain mengumpulkan gold dari setiap energi yang dimakan, membuka skin ular di shop, dan bertahan dari event acak selama permainan.

## Cara Menjalankan

Tidak memerlukan instalasi atau build tool apa pun. Cukup buka tautan [Neon Snake Live](https://ptadityaudiana.github.io/Modern_Snake/) di Google Chrome, Microsoft Edge, Firefox, atau Safari.

Alternatif lokal: Buka file `index.html` langsung di browser pilihan Anda.

---

## Fitur Utama

- **Gameplay & Ekonomi Gold**:
  - Setiap makanan memberi **1 gold** secara normal.
  - Kumpulkan gold untuk membeli dan memakai skin ular di **Snake Shop**.
  - Data gold, rekor, koleksi skin, dan skin aktif tersimpan otomatis di `localStorage`.
- **Dynamic Difficulty Scaling**: Kecepatan ular bertambah secara bertahap seiring naiknya skor (dari 115ms hingga 50ms per langkah).
- **Prosedural Sound Effects**: 8 efek suara retro sintetis via Web Audio API tanpa perlu aset file eksternal.
- **High Performance Game Loop**: Menggunakan `requestAnimationFrame` dengan sistem *fixed timestep accumulator* untuk gameplay mulus di semua refresh rate monitor (60Hz, 120Hz, 144Hz+).
- **HiDPI / Retina Canvas**: Rendering otomatis menyesuaikan `devicePixelRatio` sehingga grafis tetap tajam di layar resolusi tinggi.
- **Sistem Revive**:
  - Pemain dapat bangkit kembali saat game over dengan membayar gold (mulai dari 5 gold, berlipat 2 tiap revive di ronde yang sama).
  - Opsi **Restart game** untuk memulai ronde baru tanpa biaya.
- **Random Events**:
  - **Feeding Frenzy** (15 detik) — Setiap makanan memberi 3 gold.
  - **Mine Land** (10 detik) — Bom berbahaya muncul dinamis di jalur gerak ular.
  - Banner countdown interaktif yang otomatis membeku saat game di-pause.
- **Responsif & Aksesibel**: Layout adaptif untuk Desktop dan Mobile dengan kontrol tombol sentuh di layar.

---

## Kontrol Permainan

| Tombol | Aksi |
| --- | --- |
| `↑` `↓` `←` `→` | Menggerakkan ular |
| `W` `A` `S` `D` | Kontrol alternatif arah |
| `P` | Pause / Lanjutkan permainan |
| D-Pad di layar | Kontrol sentuh untuk perangkat mobile |

---

## Struktur File

```text
Snake/
├── index.html        # Struktur antarmuka dan container aplikasi
├── style.css         # Styling tema neon, layout grid, dan responsivitas
├── README.md         # Dokumentasi dan changelog project
└── js/
    ├── state.js      # Global GameState dan persistensi localStorage
    ├── audio.js      # Sound engine sintetis via Web Audio API
    ├── ui.js         # Pembaruan HUD, shop list, overlay, dan event banner
    ├── events.js     # Logika event acak (Feeding Frenzy & Mine Land)
    └── game.js       # Core engine, requestAnimationFrame loop, input, & canvas render
```

---

## Changelog / Patch Notes

### v1.1.0 (Pembaruan Performa, Audio, & Bug Fixes)
- 🚀 **requestAnimationFrame**: Migrasi dari `setInterval` ke rAF game loop dengan *fixed timestep time accumulator*.
- 🔊 **Sound Effects Engine**: Integrasi Web Audio API untuk efek suara makan, bonus frenzy, beli/pakai skin, revive, event alert, dan game over.
- 📈 **Difficulty Scaling**: Kecepatan gerak bertambah secara dinamis seiring pertambahan skor.
- 🛠️ **Bug Fixes**:
  - Memperbaiki bug makanan yang berpeluang muncul di koordinat bom (*Mine Land*).
  - Menghilangkan tampilan blur pada layar Retina / HiDPI dengan scaling canvas `devicePixelRatio`.
  - Memperbaiki event timer yang sebelumnya tetap berjalan saat game dijeda (*pause*).
