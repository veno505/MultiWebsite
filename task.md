# TAHAP 1: ARSITEKTUR & UI/UX OVERHAUL

## 1. Modularisasi Kode (Refactoring)
- `[x]` Ekstrak CSS ke file terpisah (`css/theme.css`).
- `[x]` Ubah struktur `WEBSITE GAME` dengan menambahkan stylesheet external dan membersihkan block CSS lama.

## 2. Tema Gen-Z Claymorphism & Micro-Animations
- `[x]` Ubah palet warna (Lilac, Mint Green, Baby Blue, Soft Coral).
- `[x]` Terapkan efek *Claymorphism* (rounded-3xl, shadow 3D).
- `[x]` Tambahkan transisi efek *squishy bounce* pada buttons.

## 3. Peningkatan Game Eksisting
- `[x]` **RPS**: Perbaiki *safe-area-inset-bottom* dan flex container untuk layar Android.
- `[x]` **Mindflip**: Implementasi opsi ukuran grid (4x4, 4x6, 6x6) dari Host Menu.
- `[x]` **Mindflip**: Tambahkan animasi flip 3D yang mulus via CSS transform.
- `[x]` **UNO**: Tambahkan Hitung Mundur Giliran (15 detik) + otomatis *draw* kartu jika habis waktu.
