# Feature Spec: Number Name — Gamifikasi Belajar Angka dalam Bahasa Target

**Platform:** Lango (https://lango-sooty.vercel.app/en)  
**Fitur:** Number Name — Mengenal & Mengucapkan Nama Angka  
**Tipe Fitur:** Gamified Learning Module  
**Status:** Draft  
**Versi:** 1.0  

---

## 1. Ringkasan Fitur

**Number Name** adalah modul pembelajaran gamifikasi di platform Lango yang dirancang untuk mengajarkan pengguna nama-nama angka (0–100 dan seterusnya) dalam bahasa yang sedang dipelajari. Modul ini menggunakan mekanisme game — poin, level, streak, badge, dan tantangan waktu — untuk membuat pembelajaran angka menjadi menyenangkan, adiktif, dan efektif.

**Bahasa yang didukung (sesuai platform Lango):**
- English, Spanish, French, German, Italian, Dutch, Portuguese, Arabic, Hindi, Bengali

---

## 2. Tujuan Pembelajaran (Learning Objectives)

Setelah menyelesaikan modul Number Name, pengguna mampu:

1. Membaca dan menyebut angka 0–10 dalam bahasa target.
2. Membaca dan menyebut angka 11–20 (angka tidak beraturan).
3. Membaca dan menyebut puluhan (20, 30, … 90).
4. Menyusun angka gabungan (21–99).
5. Menyebut angka 100, 1.000, dan 1.000.000.
6. Mendengar angka yang diucapkan native speaker dan mengidentifikasinya dengan benar.
7. Menggunakan angka dalam konteks nyata (harga, tanggal, nomor telepon).

---

## 3. Struktur Modul & Langkah-Langkah Pembelajaran

### FASE 1 — Pengenalan (Introduce)
> *Tujuan: Paparan pertama terhadap angka tanpa tekanan*

#### Langkah 1.1 — Kartu Flash Angka (Number Flashcard)
- **Tampilan:** Kartu besar menampilkan angka (misal: `7`) di sisi depan.
- **Interaksi:** Pengguna mengetuk kartu → kartu berbalik menampilkan nama dalam bahasa target + audio dari native speaker (misal: *"siete"* untuk Spanish).
- **Progres:** 5 kartu per sesi, masing-masing diulang 2×.
- **Gamifikasi:** +5 XP per kartu yang dibuka.

#### Langkah 1.2 — Dengarkan & Pilih (Listen & Pick)
- **Tampilan:** Audio diputar (nama angka dalam bahasa target), pengguna memilih 1 dari 4 pilihan angka (format: 3, 7, 12, 19).
- **Feedback:** Benar → animasi confetti + "+10 XP". Salah → highlight jawaban benar + audio diputar ulang.
- **Gamifikasi:** Jawab 3 berturut-turut benar → bonus "Streak Shield" 🛡️.

---

### FASE 2 — Latihan Terbimbing (Guided Practice)
> *Tujuan: Memperkuat hafalan lewat pengulangan aktif*

#### Langkah 2.1 — Ketuk Angka yang Disebutkan (Tap the Number)
- **Tampilan:** Grid 9 angka acak tampil di layar. Audio membunyikan satu angka.
- **Interaksi:** Pengguna mengetuk angka yang sesuai sebelum waktu habis (timer 5 detik).
- **Tingkat kesulitan:** Meningkat otomatis — awalnya angka 1–10, lalu meluas ke 1–20, dst.
- **Gamifikasi:**
  - Setiap tap benar = +10 XP
  - Jawab dalam 2 detik = bonus "Lightning ⚡ +5 XP"
  - Miss = -1 nyawa ❤️ (max 3 nyawa per sesi)

#### Langkah 2.2 — Susun Huruf Jadi Nama Angka (Spell the Number)
- **Tampilan:** Angka ditampilkan (misal: `15`), huruf-huruf acak disediakan di bawah.
- **Interaksi:** Pengguna menyusun huruf menjadi nama angka yang benar (misal: *"quinze"* untuk French).
- **Bantuan:** Tombol "Hint 💡" menampilkan huruf pertama (biaya: -5 XP).
- **Gamifikasi:** Selesaikan tanpa hint = +20 XP + badge "Speller ✍️".

#### Langkah 2.3 — Ucapkan Angka (Speak the Number)
*(Fitur tersedia pada paket Pro & Team)*
- **Tampilan:** Angka ditampilkan, mikrofon aktif.
- **Interaksi:** Pengguna mengucapkan nama angka → AI speech recognizer menilai pelafalan (0–100%).
- **Feedback:** Skor pelafalan + saran perbaikan dari native speaker model.
- **Gamifikasi:** Skor ≥ 80% = +25 XP + animasi "🎙️ Great Pronunciation!".

---

### FASE 3 — Tantangan (Challenge Mode)
> *Tujuan: Uji kemampuan di bawah tekanan waktu dan kompetisi*

#### Langkah 3.1 — Kuis Kilat (Speed Quiz)
- **Format:** 10 soal acak, masing-masing 4 detik.
- **Tipe soal campur:** Audio → pilih angka | Angka → pilih nama | Nama → ketik angka.
- **Scoring:**
  - Jawaban benar + cepat = XP lebih tinggi
  - Jawaban benar + lambat = XP standar
  - Salah = 0 XP
- **Gamifikasi:** Skor sempurna (10/10) = badge "Number Ninja 🥷".

#### Langkah 3.2 — Mode Bertahan (Survival Mode)
- **Format:** Soal terus muncul sampai pengguna salah 3×.
- **Tujuan:** Capai angka setinggi mungkin (leaderboard komunitas).
- **Leaderboard:** Tampil di halaman komunitas Lango (top 10 per bahasa per minggu).
- **Gamifikasi:** Masuk top 10 = badge "Survivor 🏆" + 100 XP bonus.

#### Langkah 3.3 — Tantangan Teman (Friend Challenge)
- **Format:** Kirim tantangan ke teman sesama pengguna Lango.
- **Aturan:** Duel kuis 10 soal, skor tertinggi menang.
- **Gamifikasi:** Menang = +50 XP + notifikasi ke teman "You've been challenged!".

---

### FASE 4 — Penerapan Kontekstual (Real-World Application)
> *Tujuan: Menggunakan angka dalam situasi nyata*

#### Langkah 4.1 — Simulasi Belanja (Shopping Simulation)
- **Skenario:** Pengguna berperan sebagai pembeli di toko virtual. Native speaker menyebutkan harga, pengguna harus mengetik jumlahnya.
- **Bahasa konteks:** Frasa pendukung seperti *"Ça coûte..."* (French) atau *"El precio es..."* (Spanish) diajarkan bersamaan.
- **Gamifikasi:** Selesaikan semua transaksi tanpa kesalahan = +40 XP + badge "Smart Shopper 🛍️".

#### Langkah 4.2 — Baca Nomor Telepon & Tanggal (Number in Context)
- **Format:** Native speaker mengucapkan nomor telepon atau tanggal, pengguna menuliskan dalam angka.
- **Tujuan:** Melatih kelancaran mendengar angka dalam konteks percakapan sehari-hari.
- **Gamifikasi:** Akurasi 100% dalam satu sesi = +30 XP.

---

### FASE 5 — Review & Sertifikasi (Mastery Check)
> *Tujuan: Konfirmasi penguasaan sebelum naik ke modul berikutnya*

#### Langkah 5.1 — Tes Penguasaan (Mastery Test)
- **Format:** 20 soal campuran dari semua fase.
- **Syarat lulus:** Skor ≥ 75%.
- **Hasil:**
  - Lulus → unlock modul berikutnya + Sertifikat Digital "Number Master — [Bahasa]"
  - Tidak lulus → rekomendasi latihan tambahan spesifik per kelemahan.

#### Langkah 5.2 — Ulasan Spaced Repetition
- **Mekanisme:** Angka yang sering salah dijadwalkan ulang muncul di sesi berikutnya (algoritma SRS — Spaced Repetition System).
- **Tampilan:** Indikator "Due for Review 🔄" muncul di dashboard pengguna.

---

## 4. Sistem Gamifikasi

| Elemen | Deskripsi |
|---|---|
| **XP (Experience Points)** | Diperoleh dari setiap aktivitas, terakumulasi untuk naik level |
| **Level** | Level 1 (Beginner) → Level 10 (Number Master), setiap level butuh XP lebih banyak |
| **Streak** | Hari berturut-turut belajar; streak ≥ 7 hari = bonus XP harian 2× |
| **Nyawa ❤️** | 3 nyawa per sesi; habis = sesi berakhir (isi ulang setelah 30 menit atau beli dengan koin) |
| **Koin 🪙** | Mata uang in-app; dapat dipakai untuk hint, nyawa ekstra, atau kostum avatar |
| **Badge** | Penghargaan khusus per pencapaian (lihat daftar di bawah) |
| **Leaderboard** | Ranking mingguan per bahasa dalam komunitas Lango |

### Daftar Badge Modul Number Name

| Badge | Cara Mendapatkan |
|---|---|
| 🔢 First Count | Menyelesaikan Fase 1 pertama kali |
| ⚡ Lightning Fingers | Menjawab 5 soal berturut-turut dalam < 2 detik |
| ✍️ Speller | Menyelesaikan Langkah 2.2 tanpa hint |
| 🎙️ Pronunciation Pro | Skor pelafalan ≥ 90% tiga kali berturut-turut |
| 🥷 Number Ninja | Skor sempurna di Speed Quiz |
| 🏆 Survivor | Masuk top 10 Survival Mode |
| 🛍️ Smart Shopper | Simulasi belanja tanpa kesalahan |
| 🌟 Number Master | Lulus Mastery Test ≥ 90% |

---

## 5. Struktur Level Konten

```
Level 1: Angka 0–10
Level 2: Angka 11–20
Level 3: Puluhan (20, 30, 40 … 90)
Level 4: Angka 21–99 (gabungan)
Level 5: Angka 100, 200 … 900
Level 6: Ribuan (1.000 – 9.999)
Level 7: Jutaan & Miliaran
Level 8: Angka Ordinal (pertama, kedua, dst.)
Level 9: Angka dalam Konteks (harga, tanggal, waktu)
Level 10: Mastery — Semua Angka
```

---

## 6. Integrasi dengan Fitur Lango yang Ada

| Fitur Lango | Integrasi Number Name |
|---|---|
| **Native Speaker Chat** | Sesi percakapan khusus "number talk" dengan tutor setelah lulus Fase 3 |
| **Progress Analytics** | Dashboard menampilkan persentase penguasaan angka per rentang |
| **Offline Mode** (Pro) | Kartu flash dan kuis kilat tersedia offline |
| **Group Learning** | Mode Tantangan Teman menggunakan sistem grup Lango |
| **Spaced Repetition** | Angka lemah dijadwalkan ulang secara otomatis |

---

## 7. Persyaratan Teknis

### Frontend
- Komponen kartu interaktif dengan animasi flip (CSS 3D transform)
- Timer visual (countdown bar)
- Audio player dengan autoplay dan kontrol kecepatan (0.75× untuk pemula)
- Speech recognition API untuk Langkah 2.3
- Animasi reward (confetti, XP pop-up, badge unlock)

### Backend
- Penyimpanan progres XP & level per pengguna per bahasa
- SRS engine untuk penjadwalan ulang konten
- Leaderboard real-time (update tiap 1 jam)
- Sistem nyawa dengan timer regenerasi

### Konten
- Rekaman audio native speaker untuk semua angka per bahasa
- Variasi aksen (misal: Spanish Latin America vs Spain)
- Teks transliterasi untuk bahasa non-Latin (Arabic, Hindi, Bengali)

---

## 8. Metrik Keberhasilan

| Metrik | Target |
|---|---|
| Completion Rate Fase 1 | ≥ 80% pengguna yang memulai |
| Retention D7 (kembali hari ke-7) | ≥ 50% |
| Rata-rata sesi per pengguna/minggu | ≥ 4 sesi |
| Skor Mastery Test rata-rata | ≥ 78% |
| Pengguna aktif Challenge Mode | ≥ 30% dari total pengguna modul |

---

## 9. User Flow Ringkas

```
Halaman Lango [Languages] 
    → Pilih Bahasa Target 
        → Dashboard Belajar 
            → Modul: Number Name 
                → Fase 1: Flashcard + Listen & Pick
                → Fase 2: Tap + Spell + Speak
                → Fase 3: Speed Quiz + Survival + Friend Challenge
                → Fase 4: Shopping Sim + Context Numbers
                → Fase 5: Mastery Test + SRS Review
                    → Badge + Sertifikat + Unlock Modul Berikutnya
```

---

## 10. Catatan Desain & UX

- **Onboarding singkat:** Tutorial 3 langkah saat pertama membuka modul (skip tersedia).
- **Encouragement micro-copy:** Pesan penyemangat dari "tutor avatar" setelah setiap fase selesai.
- **Aksesibilitas:** Ukuran teks dapat diperbesar, kontras warna memenuhi WCAG AA, semua audio punya transkrip.
- **Monetisasi:** Fase 1–2 tersedia di plan Free; Fase 3–5 dan fitur Speak di plan Pro ($9.99/bulan) sesuai struktur harga Lango.

---

*Dokumen ini merupakan spesifikasi awal. Review bersama tim produk, desain, dan engineering diperlukan sebelum masuk ke tahap development.*
