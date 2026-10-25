# INFORMATIKA CAMPUS LIFE: UNIVERSITY SIMULATOR (Roblox)

Game 3D open world kehidupan mahasiswa Informatika. Seluruh kampus dibangun otomatis oleh script (`MapBuilder`), jadi tidak perlu model manual.

> Catatan jujur: kode ini ditulis tanpa Roblox Studio, jadi **belum diuji**. Kemungkinan perlu perbaikan kecil saat pertama dijalankan. Cek panel Output di Studio.

## Cara menjalankan
1. Pasang [Rojo](https://rojo.space) (plugin Studio + `rojo` CLI).
2. Buka Roblox Studio, buat place baru (template Baseplate boleh, hapus Baseplate).
3. Di folder ini jalankan `rojo serve`, lalu klik **Connect** pada plugin Rojo di Studio.
4. Game Settings > Avatar > pilih **R15**. Game Settings > Security > aktifkan **Enable Studio Access to API Services** (untuk DataStore).
5. Tekan Play (atau Start Server + 2 Player untuk menguji multiplayer).

Tanpa Rojo: salin isi tiap file ke Studio sesuai struktur
- `src/shared/Config.luau` -> ReplicatedStorage/Shared/Config (ModuleScript)
- `src/server/Main.server.luau` -> ServerScriptService/Server/Main (Script)
- `src/server/Modules/*.luau` -> ServerScriptService/Server/Modules (ModuleScript, folder bernama Modules)
- `src/client/HUD.client.luau` -> StarterPlayerScripts/Client/HUD (LocalScript)
- Workspace > StreamingEnabled = true.

## Isi game
- **Dunia**: gerbang + pos satpam + parkiran + halte bus, plaza & panggung event, Fakultas Informatika 4 lantai (lobby, ruang dosen, seminar, 3 kelas, Computer Lab 30 PC, AI Lab, Cyber Lab, Game Dev Lab, Innovation Center), perpustakaan, taman + danau + gazebo, kantin, asrama (6 kamar), sport center. Lift dengan panel di setiap lantai.
- **Interaksi** lewat ProximityPrompt (tekan E): komputer, podium kelas, makan, tidur, olahraga, bangku, dll.
- **Kebutuhan**: Energy, Stress, Happiness (+ Uang). Energi habis = jalan lambat.
- **Akademik**: Semester 1-8, 1 semester = 10 hari game (UTS hari 5, UAS hari 10), nilai huruf + IPK, penyimpanan DataStore.
- **Mini game coding**: Debugging, Database, Web Design, Algorithm, AI Training, Cyber Security. Jawaban divalidasi di server.
- **Sosial**: leaderstats (Semester/IPK/Uang), chat bawaan Roblox, Party (bonus XP kelompok), tombol Teman (friend request Roblox).
- **NPC**: dosen, mahasiswa rajin/pemalas/ambisius/senior, satpam, resepsionis, penjual kantin, HR industri.
- **Event**: Orientation Day, Hackathon, Tech Festival, Job Fair, Graduation Day.
- **Karier**: 6 jalur, level Junior/Middle/Senior/Expert, gaji per shift di Terminal Karier (Lantai 4).
- **Visual**: palet natural (hijau, putih, abu beton, kayu, biru langit), siklus siang-malam dengan sunset, Atmosphere/Bloom/SunRays, tanpa neon.

## Yang perlu kamu lengkapi sendiri (butuh asset Roblox)
- **Animasi** (mengetik, membaca, presentasi): isi ID di `Config.ANIMATIONS` (belum dipakai script; hubungkan sesuai ID animasi milikmu). Duduk di kursi komputer sudah jalan via `Seat`.
- **Pakaian**: sekarang berupa warna `BodyColors`. Untuk kemeja/hoodie/jaket asli, buat `HumanoidDescription`/Shirt dan ganti di `applyOutfit` (Main.server.luau).
- **Model kampus detail**: bangunan dibuat dari Part sederhana (low-poly). Ganti dengan model/Mesh dari Toolbox untuk tampilan lebih realistis.
- **Mobile**: UI otomatis diskalakan; ProximityPrompt sudah mendukung tombol sentuh.

## Penyetelan
Semua angka gameplay (hari per semester, mata kuliah, gaji, outfit) ada di `src/shared/Config.luau`.
