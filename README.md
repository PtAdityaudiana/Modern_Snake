# Neon Snake

Game Snake klasik dengan tampilan modern bertema neon. Pemain mengumpulkan gold dari setiap energi yang dimakan, membuka skin ular di shop, dan bertahan dari event acak selama permainan.

## Cara menjalankan

Tidak memerlukan instalasi apa pun. Cukup buka tautan https://ptadityaudiana.github.io/Modern_Snake/ di Google Chrome, Microsoft Edge, atau Firefox.

## Fitur

- Gameplay Snake klasik dengan skor dan rekor tertinggi.
- Setiap makanan memberi **1 gold** secara normal.
- Gold dapat digunakan untuk membeli dan memakai skin ular di **Snake Shop**.
- Gold, rekor, koleksi skin, serta skin aktif disimpan secara lokal menggunakan `localStorage`.
- Sistem **revive** saat game over:
  - Harga revive dimulai dari 5 gold.
  - Harga akan berlipat dua setiap revive dalam ronde yang sama.
  - Pemain dapat memilih **Restart game** untuk memulai ronde baru tanpa biaya.
- Event acak yang pertama kali muncul setelah minimal 10 detik permainan dimulai:
  - **Feeding Frenzy** — berlangsung 15 detik; setiap makanan memberi 3 gold.
  - **Mine Land** — berlangsung 10 detik; bom muncul dinamis di depan arah gerak ular dan menyentuh bom langsung mengakhiri permainan.
- Banner event dengan countdown waktu tersisa.
- Tampilan responsif agar nyaman dimainkan pada desktop maupun perangkat kecil.

## Kontrol

| Tombol | Aksi |
| --- | --- |
| `↑` `↓` `←` `→` | Menggerakkan ular |
| `W` `A` `S` `D` | Alternatif kontrol arah |
| `P` | Pause atau lanjutkan permainan |
| Tombol arah di layar | Kontrol untuk perangkat sentuh |

## Struktur file

- `index.html` — struktur antarmuka game.
- `style.css` — desain visual, layout responsif, dan komponen UI.
- `js/state.js` — data game dan penyimpanan lokal.
- `js/ui.js` — pembaruan HUD, shop, banner event, dan overlay.
- `js/events.js` — logika event Feeding Frenzy dan Mine Land.
- `js/game.js` — inti permainan, render canvas, input, dan alur permainan.
