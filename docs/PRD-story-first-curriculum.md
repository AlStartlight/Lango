# PRD — Kurikulum Berbasis Cerita (Story-First): 10.000 Materi per Bahasa

**Status:** Draft untuk persetujuan  
**Versi:** 1.0  
**Tanggal:** 2026-11-25  
**Pemilik:** Product  
**Reviewer:** Content, Design, Engineering, Data, Legal, Finance  
**Spec terkait:** FS-07 (learning UI), FS-08 (locale & katalog), FS-09 (platform kurikulum), `docs/PRD-multilingual-learning.md`


> **Implementation status (2026-11-25):** The generated library is executed and validated. 13 languages × 5 levels × 2 arcs × 20 episodes × 10 scenes = **26.000 scenes**, **104.000 supporting materials**, **130.000 learning objects**, **252.528 lines**, **130.000 exercises**, **5.200 choices**. Every episode/story contains exactly **50 learning objects** (10 scenes × [1 scene + 4 supports]) — within the 20–100 per-story target. `content:stories:validate` and `test:story` report 0 errors / 0 warnings; 100% of ja lines have kana + Hepburn romaji and 100% of zh lines have tone-marked pinyin. Reader, progress, passport, choices, and server-only attempt grading are implemented. Human native/culture/pedagogy review and pre-rendered audio remain the publication gate; do not describe the library as human-reviewed.

**Hubungan dengan PRD Multibahasa v1.0:** PRD ini menggantikan **model pengalaman** berbasis bank soal sebagai tulang punggung kurikulum. Platform konten, registry locale, pipeline QA, penyimpanan, dan aturan multi-bahasa dari FS-08/FS-09 tetap berlaku. Bank soal lama menjadi **lapisan latihan di dalam cerita**, bukan produk terpisah.

---

## 0. Ringkasan Keputusan yang Diminta

| ID | Keputusan | Rekomendasi | Jika ditolak |
|---|---|---|---|
| **D-01** | Arah konten | **Story-first**: cerita menjadi tulang punggung; latihan menempel pada adegan | Tetap bank soal; tidak ada alasan struktural untuk kembali besok |
| **D-02** | Cakupan bahasa | **13 bahasa**: 12 bahasa registry + Mandarin (`zh`) | Permintaan Mandarin tidak terpenuhi; total materi 120.000, bukan 130.000 |
| **D-03** | Definisi "materi" | **1 materi = 1 story learning object**: scene inti 3–6 menit atau 4 pendukungnya (vocab, grammar, budaya, review) | Angka 10.000 menjadi ambigu; jika dipaksa 10.000 scene, beban kosakata/level tidak masuk akal |
| **D-04** | Struktur hitungan | **5 level × 2 arc × 20 episode × 10 scene = 2.000 scene inti**; 1 scene + 4 pendukung = **10.000 materi** per bahasa | Struktur level, progres, dan estimasi biaya tidak konsisten |
| **D-05** | Romanisasi | **Wajib** untuk Jepang (romaji) dan Mandarin (pinyin); tampil default, bisa disembunyikan | Pemula terhambat aksara; permintaan eksplisit tidak terpenuhi |
| **D-06** | Orisinalitas cerita | Cerita **original**, berlatar budaya target, bukan terjemahan cerita generik | Risiko hukum, stereotip, dan konten terasa palsu |
| **D-07** | Bahasa pilot | **Jepang, Mandarin, Inggris, Indonesia** | Pilot terlalu luas; kualitas tidak terkontrol |
| **D-08** | Peran AI | AI hanya untuk **drafting offline**; publikasi wajib review manusia | Kualitas dan klaim budaya tidak dapat dipertanggungjawabkan |
| **D-09** | Audio | **Hybrid**: voice actor untuk pilot & level pemula; TTS untuk skala/level lanjut dengan review | Biaya audio meledak atau kualitas audio rendah |
| **D-10** | Bahasa penjelasan | Rilis awal **`id`, `en`, `ja`**; locale lain fallback `en` + notice | 13 bahasa penjelasan tidak realistis di v1 |
| **D-11** | Etika engagement | **Tidak ada pay-to-continue**, tidak ada cliffhanger palsu, ada jeda dan batas harian | Retensi jangka pendek naik, kepercayaan dan outcome turun |
| **D-12** | Platform | Pakai ulang **PostgreSQL + object storage + pipeline FS-09**, bukan platform baru | Duplikasi data, progres, dan biaya engineering |
| **D-13** | Rating konten | **13+**; tanpa kekerasan grafis, seks eksplisit, atau politisasi | Risiko moderasi dan distribusi app store |
| **D-14** | Framework Mandarin | **HSK 1–6 dipetakan ke 5 tier internal** (T1: HSK 1–2, T2: HSK 3, T3: HSK 4, T4: HSK 5, T5: HSK 6) | Level Mandarin tidak sejajar dengan 12 bahasa lain |
| **D-15** | Gate rilis | **1.000 scene + 4.000 pendukung = 5.000 materi/bahasa** = gate launch; **2.000 scene + 8.000 pendukung = 10.000 materi** = full library | 10.000 materi dijanjikan sebagai syarat rilis pertama → peluncuran tertunda bertahun-tahun |

> **Rekomendasi angka:** 5 level × 2 arc × 20 episode × 10 scene = 2.000 scene inti; setiap scene menghasilkan 4 materi pendukung, sehingga total 10.000 materi. Struktur ini bersih, dapat dipetakan ke `Curriculum → Level → Unit → Lesson → Passage`, dan menjaga beban kosakata per level tetap masuk akal. Angka 10.000 adalah **target library**, bukan janji rilis pertama.

---

## 1. Ringkasan Eksekutif

Lango sudah merencanakan katalog 12 bahasa dengan 10.500 soal per bahasa. Rencana itu menjawab pertanyaan "apakah ada konten?", tetapi belum menjawab pertanyaan yang lebih penting: **mengapa learner harus kembali besok?**

Bank soal membuat belajar terasa seperti ujian yang dipecah menjadi potongan kecil. Satu pelajaran berisi 35 soal, selesai dalam 5–10 menit, lalu learner berhenti. Tidak ada tokoh yang dinanti, tidak ada rahasia yang ingin dibuka, dan tidak ada alasan emosional untuk kembali. Kontennya bisa ditukar dengan konten bahasa lain tanpa terasa berbeda.

PRD ini mengusulkan perubahan arah: **cerita sebagai tulang punggung kurikulum**.

- Setiap bahasa memiliki **dunia cerita original** yang berlatar budaya negara bahasa tersebut: kedai kopi di Sendai, tea house di hutong Beijing, toko buku di pesisir Maine, pasar subuh di Yogyakarta, dan seterusnya.
- Setiap **materi** berakar pada **scene** 3–6 menit: 120–450 kata, 6–12 baris dialog/narasi, audio, dan 3–6 latihan. Setiap scene menghasilkan **4 materi pendukung** (vocabulary set, grammar focus, culture note, review deck) yang memakai konteks cerita yang sama.
- Untuk **Jepang** dan **Mandarin**, setiap baris menampilkan **romaji/pinyin** secara default, di samping aksara asli dan terjemahan. Romanisasi adalah jembatan, bukan pengganti aksara.
- Cerita diserialkan: tokoh berulang, konflik bertingkat, cliffhanger di akhir scene, dan "daily drop" yang membuat learner punya alasan konkret untuk membuka aplikasi besok.
- Target: **10.000 materi per bahasa** (2.000 scene inti + 8.000 pendukung; 13 bahasa = **130.000 materi**), dengan gate rilis bertahap: 1.000 materi → 5.000 materi → 10.000 materi.

**Yang diminta dari pemangku kepentingan:**

1. Menyetujui arah story-first dan definisi materi (D-01, D-03).
2. Menyetujui penambahan Mandarin sebagai bahasa ke-13 (D-02, D-14).
3. Menyetujui pilot 4 bahasa dan anggaran pilot (D-07).
4. Menyetujui standar romanisasi wajib untuk `ja`/`zh` (D-05).
5. Menyetujui gate rilis bertahap, bukan menunggu 130.000 materi selesai (D-15).

**Definisi sukses:** learner membuka cerita berikutnya tanpa diminta, menyelesaikan satu scene dalam 3–6 menit, kembali dalam 7 hari, dan mengingat kosakata cerita 30 hari kemudian — bukan sekadar menyelesaikan 35 soal.

---

## 2. Konteks dan Masalah

### 2.1 Kondisi saat ini

Lango memiliki katalog 12 bahasa, registry locale, jalur auth, dashboard, dan modul Number Name/Grammar. Namun:

- Konten yang benar-benar terlihat utuh baru **Grammar Inggris**; itu pun sebagian besar berisi placeholder.
- Dari 2.232 latihan Grammar Inggris, **2.112 (94,6%)** memakai kalimat contoh generik dan tidak layak dipublikasikan (temuan audit PRD Multibahasa).
- Pilot kurikulum baru mencakup **350 soal** (Jepang N5 + Inggris A1), jauh dari ambang 10.500/bahasa.
- Belum ada lapisan cerita, tokoh, konflik, atau progres naratif.
- Belum ada progres per bahasa yang terpisah; learner yang belajar bahasa kedua berisiko menimpa konteks bahasa pertama.
- Sebagian besar interaksi belajar berbentuk **soal → jawab → skor → lanjut**. Tidak ada rasa penasaran yang dibawa keluar dari sesi.

### 2.2 Mengapa bank soal saja tidak cukup

Bank soal adalah alat **asesmen**, bukan pengalaman. Ia berguna untuk mengukur dan mengulang, tetapi buruk untuk:

- **Membangun konteks.** Kata dan grammar yang dipelajari terisolasi; learner tahu artinya, tetapi tidak tahu kapan memakainya.
- **Membuat input bermakna.** Kalimat contoh pendek tidak memberi cerita, emosi, atau stakes.
- **Menciptakan kebiasaan.** Tidak ada alasan naratif untuk kembali; streak bergantung pada disiplin, bukan rasa ingin tahu.
- **Membedakan produk.** Aplikasi lain juga punya bank soal. Cerita yang khas dan culturally grounded sulit ditiru.
- **Mengajarkan budaya.** Catatan budaya yang ditempel di akhir pelajaran terasa seperti trivia, bukan sesuatu yang dialami tokoh.

### 2.3 Mengapa cerita

Literatur pembelajaran bahasa memberi beberapa alasan yang saling menguatkan:

1. **Graded reading / extensive reading.** Learner memahami teks yang 95–98% kosakatanya sudah dikenal, sehingga bisa menikmati cerita sambil menyerap kosakata baru dari konteks. Ini jauh lebih menyenangkan daripada menghafal daftar kata.
2. **Narrow reading.** Membaca banyak teks dengan tokoh, latar, dan topik yang sama menurunkan beban kognitif dan mengulang kosakata secara alami. Serial adalah bentuk narrow reading yang paling natural.
3. **Narrative transportation.** Cerita menciptakan keterlibatan emosional; informasi yang terikat pada tokoh dan konflik lebih mudah diingat daripada kalimat contoh.
4. **Curiosity gap & serialization.** Akhir scene yang menggantung memberi alasan konkret untuk kembali — bukan karena notifikasi, tetapi karena ingin tahu.
5. **Cultural schema.** Budaya tidak diajarkan sebagai daftar fakta, tetapi sebagai latar keputusan tokoh: cara memesan, cara meminta maaf, cara menghormati orang tua, cara merayakan festival.

Klaim di atas adalah **hipotesis produk** yang harus diuji, bukan jaminan. Karena itu PRD ini memasukkan baseline, eksperimen, dan guardrail, bukan hanya target retensi.

### 2.4 Mengapa sekarang

- **Platform konten sudah ada.** FS-09 menyediakan `Curriculum → Level → Unit → Lesson → Passage → Question`, pipeline authoring, dan aturan publikasi. Cerita bisa menumpang di sana tanpa membangun ulang.
- **Registry 12 bahasa sudah ada.** Menambah Mandarin adalah keputusan produk, bukan proyek arsitektur dari nol.
- **Biaya drafting turun.** AI dapat membantu draft awal, glosarium, dan variasi latihan, tetapi review manusia tetap menjadi bottleneck yang harus direncanakan.
- **Diferensiasi makin sulit.** Bank soal mudah ditiru; dunia cerita, karakter, dan akurasi budaya adalah aset jangka panjang.
- **Semakin lama menunda, semakin mahal.** Konten yang terlanjur dibuat sebagai soal lepas harus ditulis ulang agar bisa masuk cerita.

### 2.5 Pernyataan masalah

> **Lango punya katalog bahasa, tetapi belum punya alasan untuk kembali besok.** Learner tidak terhubung pada tokoh, cerita, atau dunia yang membuat belajar terasa seperti mengalami, bukan mengerjakan.

### 2.6 Peluang

Jika satu scene bisa membuat learner bertahan 4 menit dan satu episode (10 scene) membuatnya kembali tiga kali dalam seminggu, maka:

- Waktu belajar per minggu naik tanpa menambah beban "belajar".
- Kosakata dan grammar terulang secara alami di konteks berbeda.
- Konten budaya menjadi alasan memilih Lango, bukan sekadar pelengkap.
- Library 10.000 materi per bahasa (2.000 scene + 8.000 pendukung) menjadi **moat** yang mahal ditiru, bukan commodity.

---

## 3. Visi, Prinsip, dan Non-Goals

### 3.1 Visi

> **Belajar bahasa seperti menonton serial yang kamu tunggu-tunggu.**

### 3.2 Prinsip produk

1. **Cerita dulu, latihan menyusul.** Latihan harus terasa seperti bagian dari cerita ("apa yang harus Aoi lakukan?"), bukan interrupt.
2. **Budaya adalah latar, bukan dekorasi.** Tempat, makanan, festival, sopan santun, dan sejarah harus spesifik dan diverifikasi; bukan tempelan "fun fact".
3. **Romanisasi adalah jembatan.** Untuk `ja`/`zh`, romaji/pinyin tampil default di samping aksara asli. Learner boleh mematikannya, tetapi tidak boleh dipaksa buta aksara di awal.
4. **Volume tanpa kualitas adalah utang.** 10.000 materi yang belum direview tidak dihitung. Lebih baik 1.000 scene yang dipercaya daripada 10.000 yang harus ditarik.
5. **Panjang sesi bukan tujuan; waktu yang berharga yang menjadi tujuan.** Retensi diukur bersama kepuasan, hasil belajar, dan guardrail kesehatan.
6. **Satu cerita, banyak tingkat dukungan.** Alih-alih menulis tiga versi cerita, tulis satu cerita yang baik lalu sesuaikan dukungan (furigana, romanisasi, terjemahan, kecepatan audio).
7. **Original, bukan terjemahan mesin.** Cerita ditulis untuk bahasa dan budayanya, bukan diterjemahkan dari bahasa Inggris.
8. **Aksesibel sejak desain.** RTL, font CJK, keterbacaan, transkrip, dan screen reader bukan tambahan akhir.

### 3.3 Non-goals

- Sertifikasi resmi JLPT/HSK/CEFR atau klaim kelulusan ujian.
- Menggantikan tutor manusia, speaking assessment, atau pronunciation scoring di v1.
- Menyalin novel, film, atau cerita rakyat berhak cipta; folklore hanya jika public domain dan diverifikasi.
- Produksi serial video/animasi penuh.
- Voice acting untuk 26.000 scene di semua bahasa pada rilis pertama.
- Social network, feed publik, atau leaderboard global.
- Gamifikasi yang menekan learner (pay-to-continue, streak shaming, FOMO).
- Terjemahan penuh ke 13 bahasa penjelasan di v1.

---

## 4. Target Pengguna dan Jobs to Be Done

### 4.1 Persona utama

| Persona | Profil | Kebutuhan | Pemicu | Risiko churn |
|---|---|---|---|---|
| **Rani, 24** | Karyawan di Jakarta, target JLPT N4 | Cerita Jepang yang bisa dinikmati, kanji + furigana + romaji, audio, pembahasan bahasa Indonesia | Ujian 9 bulan lagi | Teks terlalu sulit; bosan dengan drill |
| **Wei, 27** | Karyawan keturunan Tionghoa, ingin Mandarin untuk kerja | Pinyin sampai aksara mandiri, cerita Beijing yang terasa nyata, HSK 1–4 | Relokasi ke Shanghai | Pinyin terus-menerus; tidak pernah pindah ke hanzi |
| **Bagas, 31** | Profesional B1, ingin B2 | Cerita Inggris yang tidak kekanak-kanakan, konteks kerja, audio | Promosi | Cerita terlalu sederhana; tidak relevan |
| **Sari, 22** | Mahasiswa Yogyakarta, ingin memperbaiki bahasa Indonesia formal | Cerita lokal, budaya, kosakata kerja | Magang | Terasa seperti buku pelajaran |
| **Dimas, 29** | Polyglot, sudah belajar Jepang & Spanyol | Satu akun banyak bahasa, progres terpisah, cerita berbeda per bahasa | Bahasa ketiga | Harus mulai dari nol; progres tercampur |
| **Nadia, 35** | Commuter, 40 menit per jalan | Audio drama, resume, cerita pendek | Perjalanan harian | Tidak bisa hands-free; audio jelek |

### 4.2 Jobs to be done

| Job | Konteks | Keberhasilan |
|---|---|---|
| "Saya ingin lulus JLPT N4 tahun depan." | Belajar 20 menit/hari | Tahu posisi level, menyelesaikan jalur N5→N4, listening terlatih, percaya pada pembahasan |
| "Saya ingin bisa Mandarin untuk kerja." | HSK 1–4, waktu terbatas | Bisa membaca hanzi tanpa pinyin pada level target, memahami situasi kerja |
| "Saya ingin belajar bahasa tanpa merasa sedang ujian." | 10 menit sebelum tidur | Menikmati cerita, ingin tahu kelanjutannya, tetap belajar |
| "Saya ingin belajar bahasa kedua tanpa akun baru." | Polyglot | Satu akun, progres per bahasa, cerita berbeda |
| "Saya ingin memahami budaya, bukan hanya kata." | Traveler/relokasi | Tahu apa yang sopan, kapan festival, bagaimana orang berbicara |

---

## 5. Definisi Materi dan Arsitektur Angka

### 5.1 Definisi "materi"

**1 materi = 1 story learning object (SLO)** — unit yang bisa dibuka, diselesaikan, diukur, dan di-resume. Setiap **scene inti** menghasilkan **5 materi**: 1 scene + 4 pendukung yang memakai konteks cerita yang sama.

| Jenis materi | Isi | Durasi | Jumlah per scene |
|---|---|---|---|
| **Scene inti** | 120–450 kata, 6–12 baris, audio, 3–6 latihan, cliffhanger | 3–6 menit | 1 |
| **Vocabulary set** | 8–12 kata/frasa dari scene + contoh + audio | 5–10 menit | 1 |
| **Grammar focus** | 1–2 pola dari scene + 5–8 latihan konteks | 10–15 menit | 1 |
| **Culture note** | 1 catatan budaya + sumber + pertanyaan refleksi | 5 menit | 1 |
| **Review/listening deck** | Kartu SRS + klip audio dari scene | 5–10 menit | 1 |

**Aturan:** materi pendukung tidak boleh berupa konten generik. Semua contoh, kalimat, dan latihan harus mengutip tokoh/adegan dari scene induk.

> **Mengapa tidak 10.000 scene?** 10.000 scene berarti 2.000 scene/level. Dengan 4–6 kata baru/scene saja, satu level akan memperkenalkan 8.000–12.000 kata — jauh di atas N5 (±800) atau A1 (±500–1.000). Itu bukan kurikulum yang level-appropriate. Model **2.000 scene + 8.000 materi pendukung** menjaga angka 10.000 tetap story-based, tetapi beban kosakata per level masuk akal. Jika pemangku kepentingan tetap ingin 10.000 scene, biaya dan waktu produksi ±3× lipat dan pemetaan level harus dirombak (D-03).

**Yang bukan materi:** ringkasan arc, kartu kosakata tanpa konteks, soal tanpa cerita, atau aset audio tanpa teks. Semua itu boleh ada sebagai metadata, tetapi tidak menambah angka 10.000.

### 5.2 Hierarki konten

```text
Bahasa (13)
└── Level (5: N5–N1 / A1–C1 / T1–T5)
    └── Arc / Season (2 per level: 1 flagship + 1 pendamping) ... Unit
        └── Episode (20 per arc) ............................. Lesson
            └── Scene inti (10 per episode) ................. Passage
                ├── Line (6–12) ............................ StoryLine
                ├── Vocabulary set (materi) ................. StoryMaterial
                ├── Grammar focus (materi) .................. StoryMaterial
                ├── Culture note (materi) ................... StoryMaterial
                ├── Review/listening deck (materi) .......... StoryMaterial
                └── Exercise (3–6) .......................... Question
```

### 5.3 Hitungan

| Komponen | Per level | Per bahasa | 13 bahasa |
|---|---:|---:|---:|
| Level | 1 | 5 | 65 |
| Arc/season | 2 | 10 | 130 |
| Episode | 40 | 200 | 2.600 |
| **Scene inti** | **400** | **2.000** | **26.000** |
| **Materi pendukung** | **1.600** | **8.000** | **104.000** |
| **Total materi** | **2.000** | **10.000** | **130.000** |
| Baris (rata-rata 8) | 3.200 | 16.000 | 208.000 |
| Kata (rata-rata 250) | 100.000 | 500.000 | 6.500.000 |
| Audio (4 menit/scene) | 1.600 menit | 8.000 menit | 104.000 menit |
| Jam audio | ±27 jam | ±133 jam | ±1.733 jam |

**Cek:** 5 × 2 × 20 × 10 = **2.000 scene inti** per bahasa; 2.000 × 5 = **10.000 materi**; 13 × 10.000 = **130.000 materi**.

**Waktu belajar:** core path 2.000 scene × 4 menit = 8.000 menit = **±133 jam** per bahasa. Jika learner menyelesaikan seluruh 8.000 materi pendukung (5–15 menit masing-masing), total menjadi **±1.000–1.200 jam** per bahasa. Materi pendukung adalah kedalaman opsional, bukan gerbang; learner bisa memilih jalur cerita saja atau memperdalam grammar/kosakata.

### 5.4 Gate bertahap

| Gate | Scene/bahasa | Materi/bahasa | Ekuivalen | Estimasi waktu |
|---|---:|---:|---|---|
| **Pilot** | 200 | 1.000 | 1 arc | 12 minggu |
| **Launch** | 1.000 | 5.000 | 5 arc (1/level) | 2 kuartal |
| **Growth** | 1.500 | 7.500 | 7–8 arc | Tahun 2 |
| **Full library** | 2.000 | 10.000 | 10 arc (2/level) | Tahun 3–5 |

### 5.5 Aturan penghitungan

1. Hanya materi berstatus `published` yang dihitung.
2. `published` berarti: lolos QA otomatis, review bahasa, review native, review budaya, dan review pedagogi. Audio narasi scene wajib; audio per baris wajib untuk T1–T3.
3. Scene `retired` tidak dihitung, tetapi progres dan attempt learner tetap tersimpan.
4. Satu scene menghasilkan tepat **5 materi** (1 scene + 4 pendukung); tidak boleh dihitung dua kali untuk dua level.
5. Angka dilaporkan terpisah: **scene inti**, **materi pendukung**, dan **total materi**. Tidak ada klaim agregat yang menutupi bahasa yang kosong.
6. Dashboard internal menampilkan **published vs target** dan **review backlog**, bukan hanya total draft.

### 5.6 Asumsi yang perlu dikonfirmasi

- "Materi" berarti **story learning object** (scene + 4 pendukung), bukan 10.000 scene.
- 10.000 adalah target **per bahasa**, bukan total.
- 2.000 scene inti per bahasa (400/level).
- Mandarin masuk sebagai bahasa ke-13.
- 5 level per bahasa; Mandarin memakai pemetaan HSK ke 5 tier (D-14).

Jika salah satu asumsi berubah, angka, timeline, dan biaya di PRD ini harus dihitung ulang.

---

## 6. Desain Pembelajaran (Story-First Pedagogy)

### 6.1 Prinsip input: graded reading

Setiap scene ditulis pada level target dengan **90–98% kosakata yang sudah dikenal** learner pada level itu (target 95% untuk scene >200 kata; 90–95% untuk scene 120–200 kata). Kosakata baru dibatasi **4–20 per scene sesuai level** dan diulang minimal 2× dalam konteks berbeda (scene ini + 1–2 scene berikutnya).

| Level | Panjang kalimat | Kata baru/scene | Kata unik/level | Target grammar/scene | Beban aksara | Kecepatan audio |
|---|---|---|---|---|---|---|
| T1 (N5/A1/HSK 1–2) | 6–12 kata | 4–6 | 1.600–2.400 | 1 | Kanji dasar ±100 / hanzi ±300 | 0,80× |
| T2 (N4/A2/HSK 3) | 10–18 kata | 5–8 | 2.000–3.200 | 1–2 | Kanji ±300 / hanzi ±600 | 0,90× |
| T3 (N3/B1/HSK 4) | 15–25 kata | 7–10 | 2.800–4.000 | 2 | Kanji ±650 / hanzi ±1.200 | 1,00× |
| T4 (N2/B2/HSK 5) | 20–35 kata | 10–14 | 4.000–5.600 | 2–3 | Kanji ±1.000 / hanzi ±2.500 | 1,00× |
| T5 (N1/C1/HSK 6) | 25–45 kata | 14–20 | 5.600–8.000 | 3–4 | Kanji ±2.000 / hanzi ±5.000 | 1,00–1,10× |

Angka di atas adalah **target editorial**, bukan hard gate otomatis. Validasi dilakukan dengan alat coverage kosakata per level dan review pedagogi.

> **Beban kosakata:** 400 scene/level × 4–6 kata baru = 1.600–2.400 kata unik di T1. Ini masuk akal untuk band N5+ (N5 ±800 kata + jembatan N4). Label JLPT/CEFR/HSK adalah **checkpoint**, bukan batas kosakata; drill dan review deck membantu pemerolehan kata di luar daftar ujian.

### 6.2 Narrow reading

- Tokoh, latar, dan konflik yang sama muncul lintas scene → kosakata berulang tanpa terasa drill.
- Setiap arc memiliki "dunia kecil" (kedai, sekolah, pasar) yang istilahnya konsisten.
- Istilah budaya diperkenalkan bertahap: pertama dengan glosarium, lalu tanpa glosarium, lalu learner diminta menggunakannya.
- Tidak ada lompatan genre di tengah arc; variasi genre dilakukan antar-arc.

### 6.3 Narrative encoding

Setiap scene memiliki **beat** yang jelas:

1. **Hook** — pertanyaan/kejadian yang menarik perhatian (1–2 baris).
2. **Context** — siapa, di mana, apa yang sedang terjadi.
3. **Complication** — masalah kecil yang harus diselesaikan tokoh.
4. **Language focus** — struktur/kosakata yang ingin diajarkan muncul secara natural.
5. **Turn** — informasi baru, keputusan, atau reaksi.
6. **Cliffhanger** — pertanyaan yang membuat learner ingin lanjut.

Latihan tidak boleh memutus beat di tengah; latihan ditempatkan di **akhir scene** atau sebagai pilihan "deep dive" setelah membaca.

### 6.4 Tangga dukungan (support ladder)

Alih-alih menulis ulang cerita untuk tiap level, gunakan lapisan dukungan:

| Lapisan | T1 | T2 | T3 | T4–T5 |
|---|---|---|---|---|
| Aksara asli | selalu | selalu | selalu | selalu |
| Furigana (ja) | selalu | selalu | on demand | on demand |
| Romanisasi (ja/zh) | **default on** | **default on** | default on (bisa off) | default on (bisa off) |
| Terjemahan kalimat | default on | on tap | on tap | on tap |
| Glosarium kata | tap + auto | tap | tap | tap |
| Audio per baris | selalu | selalu | selalu | scene only |
| Kecepatan audio | 0,8× default | 0,9× | 1,0× | 1,0–1,1× |

Prinsipnya: **dukungan tidak pernah memaksa, tetapi selalu tersedia.** Learner dapat memilih "Fokus baca" (aksara asli saja) kapan pun, dan pilihan itu tersimpan per bahasa.

### 6.5 Spaced repetition yang terikat cerita

- Setiap kata yang di-tap 2× otomatis masuk **story deck** learner.
- Kartu review memakai kalimat dari cerita, bukan kalimat lepas.
- 7 hari kemudian, kata muncul kembali di scene baru dalam konteks berbeda.
- "Story recall" card: "Siapa yang memesan 'itsumo no'?" — menguji memori naratif, bukan hanya arti kata.
- SRS tidak boleh menjadi gerbang untuk lanjut cerita; ia opsional dan ringan.

### 6.6 Keterampilan yang dilatih

| Keterampilan | Di mana | Catatan |
|---|---|---|
| Reading | Semua scene | Fokus utama; extensive + intensive |
| Listening | Audio scene/baris | Transkrip selalu tersedia |
| Vocabulary | Glosarium, tap, SRS | 4–20 kata/scene sesuai level; daur ulang |
| Grammar | 1–2 target/scene | Dijelaskan setelah konteks, bukan sebelum |
| Culture | Catatan + keputusan tokoh | Diverifikasi; bukan trivia |
| Speaking | P2 (shadowing, role-play) | Tidak masuk acceptance v1 |
| Writing | P2 (story journal) | Draft v1: journal sederhana |

### 6.7 Asesmen

- **Checkpoint** 3–6 item di akhir scene: 1 pemahaman, 1 kosakata, 1 grammar, 1 inferensi, 1 budaya/listening.
- Umpan balik langsung: benar/salah + **mengapa**, dengan kutipan dari cerita.
- Tidak ada timer wajib; tidak ada nyawa/lives yang menghukum.
- Skor checkpoint tidak memblokir scene berikutnya; ia memberi sinyal ke learner dan sistem adaptasi.
- "Level estimate" diperbarui dari akurasi + kosakata yang dikuasai + scene yang diselesaikan, bukan dari satu kuis.

### 6.8 Pemetaan level

| Framework | Level | Tier internal | Catatan |
|---|---|---|---|
| JLPT | N5, N4, N3, N2, N1 | T1–T5 | 1:1; tier = band 400 scene |
| CEFR | A1, A2, B1, B2, C1 | T1–T5 | 1:1; 11 bahasa |
| HSK | HSK 1–6 | T1–T5 | HSK 1–2 → T1; 3 → T2; 4 → T3; 5 → T4; 6 → T5; tier = band |

Tier internal dipakai untuk struktur konten, analytics, dan rekomendasi. Label yang ditampilkan ke learner tetap label framework (JLPT/CEFR/HSK), tetapi berfungsi sebagai **checkpoint**: satu tier berisi 400 scene + 1.600 materi pendukung (±35–45 jam). T1 sengaja mencakup N5 + jembatan N4; T2 N4 + jembatan N3, dan seterusnya. Ini konsekuensi dari 2.000 scene/bahasa dan menjaga agar kosakata per level tetap masuk akal.

### 6.9 Template beat scene

| Beat | Baris | Fungsi | Contoh (Jepang N5) |
|---|---|---|---|
| Hook | 1–2 | Misteri/kejadian | "Itsumo no." — pesanan yang tidak diketahui Aoi |
| Context | 2–3 | Siapa, di mana | Aoi di kedai neneknya, pagi pertama |
| Complication | 2–3 | Masalah kecil | Aoi tidak tahu arti "itsumo no" |
| Language focus | 2–3 | Target grammar/kosakata | 〜が分かりません; 〜ています |
| Turn | 1–2 | Informasi/keputusan | Buku catatan merah ditemukan |
| Cliffhanger | 1 | Pertanyaan | Apa isi buku itu? |

### 6.10 Metrik teks yang divalidasi otomatis

- Jumlah kata dan kalimat per scene.
- Rata-rata panjang kalimat.
- Cakupan kosakata level (90–98% dikenal).
- Daftar kata baru vs daftar level.
- Kanji/hanzi baru vs daftar level.
- Rasio kata ulang dari 3 scene sebelumnya (target 25–40%).
- Jumlah target grammar dan kemunculannya.
- Rasio dialog vs narasi (target 40–60% dialog untuk pemula).
- Keterbacaan audio (durasi, kata/menit).

---

## 7. Story Bible per Bahasa

### 7.1 Prinsip budaya

1. **Spesifik, bukan umum.** "Kedai kopi di Sendai" lebih baik daripada "kafe di Jepang". Sebut nama jalan fiktif, musim, menu, dan kebiasaan setempat.
2. **Kontemporer + tradisional.** Cerita hidup di masa kini, dengan festival dan tradisi sebagai bagian natural, bukan museum.
3. **Keragaman internal.** Satu negara bukan satu budaya. Tunjukkan kelas sosial, usia, kota/desa, dan latar keluarga yang berbeda.
4. **Tokoh punya agensi.** Tokoh lokal bukan sekadar pemandu budaya untuk tokoh asing; mereka punya keinginan, konflik, dan humor sendiri.
5. **Hindari karikatur.** Tidak ada aksen lucu, stereotip makanan/teknologi, atau "orang lokal bijak" yang hanya menjelaskan budaya.
6. **Sumber dan konsultan.** Setiap catatan budaya punya sumber; setiap bahasa punya konsultan budaya yang menyetujui.
7. **Fiksi yang jujur.** Tempat nyata dipakai dengan hormat; detail yang tidak dapat diverifikasi difiksikan dan ditandai.
8. **Aman.** Tidak ada konten seksual eksplisit, kekerasan grafis, ujaran kebencian, atau politisasi; topik sensitif (kematian, penyakit, migrasi) ditangani dengan content warning.

### 7.2 Peta 13 dunia cerita

| Kode | Dunia & latar | Tokoh inti | Jangkar budaya | Kait serial |
|---|---|---|---|---|
| `ja` | **こもれびの夏** (Komorebi no Natsu) — kedai kopi tua di Sendai | Aoi (19), Nenek Fumiko (78), Sato (72), Tanaka (65) | Kissaten, zunda mochi, Tanabata, oshibori, Obon, keigo | Buku catatan merah berisi pesanan untuk orang yang tak pernah datang |
| `zh` | **胡同里的茉莉** (Hútòng lǐ de Mòlì) — tea house di hutong Beijing | Xiaoyu (22), Nenek Lin (76), Kakek Chen (80), Bibi Wang (60) | Hutong, teh melati, gaiwan, tanghulu, Festival Lampion, pasar kuil | Teh dari tahun 1985 dan ingatan nenek yang memudar |
| `en` | **The Lighthouse Postcard** — kota pesisir fiktif Marrow Bay, Maine | Nora (26), Eli (30), Mrs. Hale (68), kucing toko buku | Diner, lobster roll, mercusuar, town meeting, Thanksgiving, county fair | Kartu pos 1994 yang tiba 30 tahun terlambat |
| `id` | **Pasar Subuh** — pasar tradisional di Yogyakarta | Sari (21), Ibu Wati (48), Mbah Putri (72), Dimas (23) | Pasar subuh, gudeg, batik, angkringan, gamelan, mudik | Buku utang 1998 dengan satu janji yang belum ditepati |
| `es` | **El Camino de las Naranjas** — perjalanan Andalusia | Lucía (24), Abuelo Rafael (78), Mateo (27), Carmen (50) | Tapas, flamenco, Semana Santa, kebun jeruk, pueblos blancos | Peta kakek dengan kebun jeruk yang tak pernah dikunjungi |
| `ko` | **서울, 새벽 다섯 시** (Seoul, 5 A.M.) — minimarket 24 jam di Hongdae | Yuna (22), Min (25), pelanggan malam | Pyeonjeom, ramyeon, Chuseok, PC bang, noraebang, subway | Buku lirik hilang milik seorang musisi jalanan |
| `ar` | **حبر وضوء** (Ink and Light) — Khan el-Khalili, Kairo | Nour (19), Paman calligrapher (55), Umm Khalid (65) | Kaligrafi, lentera Ramadan, ahwa, souk, Eid, keramahan | Huruf yang hilang dari gulungan kaligrafi tua |
| `hi` | **मानसून के खत** (Monsoon Letters) — Jaipur | Aarav (23), Nenek (75), pemilik kedai chai (50), Priya (24) | Monsun, chai, Diwali, kereta, block printing, layang-layang | Surat dari ayah yang pergi bertahun-tahun lalu |
| `de` | **Die Bäckerei an der Elbe** — Dresden | Lena (21), Opa baker (77), Jonas (23), Frau Berger (70) | Brötchen, pasar Natal, Elbe, magang, Pfand, hiking | Halaman resep yang hilang dari buku keluarga |
| `fr` | **Lettres de Lyon** — toko buku di Lyon | Camille (24), Bibi (60), Chef (35), teman masa kecil (25) | Bouchon, marché, Fête des Lumières, traboules, sinema | Surat tanpa pengirim yang dialamatkan ke toko buku |
| `pt` | **Saudade na Feira** — Lisbon | Inês (23), Nenek (78), penyanyi fado (45), sepupu dari Brasil (26) | Feira, fado, azulejos, pastel de nata, Santos Populares | Bait tersembunyi dalam lagu fado keluarga |
| `it` | **Il Forno di Nonna** — Bologna | Marco (25), Nonna (80), Chiara (24), pembuat roti rival (50) | Tortellini, sagra, portico, espresso, opera | Tantangan rival di sagra dan resep yang hilang |
| `nl` | **Fietsen door de Polder** — Utrecht | Noor (21), Opa (79), Sem (22), tetangga (65) | Fiets, kanal, King's Day, hagelslag, polder, directness | Sepeda milik sahabat yang menghilang |

### 7.3 Bible pilot

Setiap level memiliki **2 arc**: satu **flagship** (diuraikan di bawah) dan satu **arc pendamping/anthology** (cerita pendek di dunia yang sama atau dunia baru). Dengan demikian setiap bahasa memiliki 10 arc, 200 episode, 400 scene/level, dan 2.000 scene inti.

#### 7.3.1 Jepang — こもれびの夏 (Komorebi no Natsu)

- **Logline:** Seorang mahasiswa Tokyo kembali ke Sendai untuk menjaga kedai kopi neneknya selama musim panas, lalu menemukan buku catatan merah berisi pesanan untuk orang-orang yang tidak pernah datang lagi.
- **Latar:** Sendai, Miyagi. Kedai kopi "Komorebi" di jalan fiktif Suzukake-kōji, 15 menit jalan kaki dari Stasiun Sendai. Musim panas → Tanabata (6–8 Agustus) → Obon → musim gugur.
- **Tokoh:**
  - **Sasaki Aoi (19)** — mahasiswa tahun kedua di Tokyo; praktis, sedikit keras kepala, tidak sabar dengan orang yang lambat.
  - **Sasaki Fumiko (78)** — nenek; pendiri kedai; dirawat di rumah sakit; bukunya menjadi misteri.
  - **Satō Ken'ichi (72)** — pensiunan guru; pelanggan tetap 40 tahun; memesan "itsumo no".
  - **Tanaka Sayuri (65)** — tetangga; penghubung komunitas; tahu semua gosip.
  - **Takahashi Haruto (20)** — teman masa kecil; bekerja di pasar ikan; muncul di episode 4.
- **Jangkar budaya:** budaya kissaten (kedai kopi retro, "morning set", pelanggan tetap), zunda mochi khas Sendai, Tanabata Sendai, oshibori, "irasshaimase", sopan santun di kereta, Obon.
- **Arc per level:**
  - **N5 — "Buku Catatan Merah":** kehidupan harian kedai; pesanan, jam buka, pelanggan; Aoi belajar mendengar.
  - **N4 — "Cangkir Kedua":** Aoi merekrut pekerja paruh waktu; keigo, instruksi kerja, konflik kecil dengan kafe baru.
  - **N3 — "Pelanggan yang Tidak Datang":** misteri pelanggan yang berhenti datang; surat, kenangan, kesalahpahaman.
  - **N2 — "Toko di Seberang Stasiun":** rencana redevelopment; keluarga vs komunitas; negosiasi.
  - **N1 — "Komorebi":** masa lalu nenek, warisan, rekonsiliasi; bahasa formal dan emosional.
- **Episode 1 — "はじめての朝" (Hajimete no Asa / Pagi Pertama):**
  1. Aoi tiba di Stasiun Sendai; panas musim panas; jalan ke kedai.
  2. Di depan kedai, Tanaka memberi tahu bahwa nenek dirawat di rumah sakit.
  3. Pagi berikutnya, Aoi membuka kedai; aroma kopi; oshibori.
  4. Sato datang dan memesan "itsumo no"; Aoi panik.
  5. Aoi menemukan buku catatan merah di bawah meja kasir.
  6. Di buku itu, tulisan nenek mencatat pesanan Sato.
  7. Aoi membuat iced coffee dan zunda mochi; kenangan tentang nenek.
  8. Sato mengatakan rasanya sama seperti buatan nenek; Aoi lega.
  9. Ada halaman bertanggal "8 Agustus" dengan nama yang tidak dikenal; telepon berdering.
  10. Dekorasi Tanabata tiba; seorang perempuan berbaju biru bertanya tentang "buku catatan yang lain".
- **Mengapa bertahan:** kehangatan komunitas, misteri ringan, makanan, kalender musiman, dan tokoh yang ingin dilindungi.

#### 7.3.2 Mandarin — 胡同里的茉莉 (Hútòng lǐ de Mòlì)

- **Logline:** Seorang gadis kembali ke hutong neneknya untuk Tahun Baru Imlek dan menemukan resep teh yang menghubungkan neneknya dengan seorang pelanggan lama — sebelum ingatan nenek hilang.
- **Latar:** Beijing, hutong fiktif dekat Shichahai. Musim dingin → Tahun Baru Imlek → Festival Lampion (bulan ke-1, hari ke-15) → musim semi.
- **Tokoh:**
  - **Lin Xiaoyu (22)** — bekerja di Shanghai; pulang kampung; ingin cepat kembali, tetapi tersangkut.
  - **Nenek Lin (76)** — pemilik tea house "Mòlì"; ingatannya mulai mundur.
  - **Kakek Chen (80)** — pelanggan setia; datang setiap Festival Lampion; membawa kotak besi tua.
  - **Bibi Wang (60)** — tetangga; juru masak; sumber gosip dan resep.
  - **Zhao Lei (23)** — teman masa kecil; sekarang bekerja di biro arsitektur yang merenovasi hutong.
- **Jangkar budaya:** kehidupan hutong, teh melati, gaiwan, tanghulu, Festival Lampion, pasar kuil,兔儿爷 (rabbit god), kereta cepat, pangsit, renovasi kota.
- **Arc per level (HSK → tier):**
  - **T1 (HSK 1–2) — "茉莉茶馆":** rutinitas tea house; pesanan, cuaca, keluarga; kalimat pendek.
  - **T2 (HSK 3) — "一九八五":** Festival Lampion; resep; kenangan; dialog lebih panjang.
  - **T3 (HSK 4) — "胡同改造":** renovasi; konflik tanah; wawancara; opini.
  - **T4 (HSK 5) — "老照片":** sejarah keluarga; foto; surat; wawancara tokoh.
  - **T5 (HSK 6) — "新城":** masa depan hutong; debat publik; bahasa formal.
- **Episode 1 — "元宵节" (Yuánxiāojié / Festival Lampion):**
  1. Xiaoyu tiba di Beijing dengan kereta cepat; hutong ramai.
  2. Tea house "Mòlì"; lampion merah; aroma teh melati.
  3. Nenek menyambut; Xiaoyu melihat tangan nenek gemetar.
  4. Kakek Chen datang dengan kotak besi; memesan "teh yang itu".
  5. Nenek tidak menjawab; Xiaoyu bingung.
  6. Xiaoyu menemukan kotak kayu di bawah meja kasir.
  7. Foto 1985 dan buku resep: "lima longan, melati, gula batu".
  8. Xiaoyu menyeduh teh; Kakek Chen menangis.
  9. Nenek menoleh dan menyapa Kakek Chen; kembang api.
  10. Nenek berkata, "Kamu harus belajar resep ini." — cliffhanger.
- **Mengapa bertahan:** misteri keluarga, festival, makanan, dan pertanyaan "apakah nenek akan mengingat?".

#### 7.3.3 Inggris — The Lighthouse Postcard

- **Logline:** Nora kembali ke kota pesisir masa kecilnya untuk menjual toko buku mendiang bibinya, lalu sebuah kartu pos dari 1994 tiba dan mengubah rencananya.
- **Latar:** Marrow Bay, Maine (fiksi). Pelabuhan, diner, mercusuar, toko buku di ujung dermaga. Musim gugur → Thanksgiving → musim dingin.
- **Tokoh:** Nora (26), Eli (30, nelayan lobster), Mrs. Hale (68, pustakawan), Bibi June (almarhumah), kucing toko buku "Page".
- **Jangkar budaya:** diner, lobster roll, town meeting, county fair, Thanksgiving, perpustakaan kecil, humor kering New England.
- **Arc per level:** A1 "The Key" (toko buku, tetangga); A2 "The Postcard" (misteri); B1 "The Storm" (badai, komunitas); B2 "The Town Meeting" (pembangunan dermaga); C1 "The Light" (sejarah keluarga, keputusan).
- **Episode 1:** Nora tiba dengan feri terakhir → toko buku tertutup → kucing → kartu pos tanpa perangko → "Meet me at the light when the fog lifts." → Eli muncul → cliffhanger: kartu pos itu ditulis dengan tulisan tangan bibinya sendiri.
- **Mengapa bertahan:** suasana pesisir, misteri ringan, komunitas, dan humor.

#### 7.3.4 Indonesia — Pasar Subuh

- **Logline:** Sari membantu ibunya berjualan di pasar subuh Yogyakarta dan menemukan buku utang lama yang menyimpan janji dari tahun 1998.
- **Latar:** Yogyakarta. Pasar tradisional fiktif "Pasar Sari"; gang sempit, angkringan, warung gudeg. Musim kemarau → Ramadan → Lebaran → mudik.
- **Tokoh:** Sari (21, mahasiswi), Ibu Wati (48), Mbah Putri (72), Dimas (23, teman), Pak Slamet (55, pedagang).
- **Jangkar budaya:** pasar subuh, gudeg, batik, angkringan, gamelan, Ramadan, mudik, becak, gotong royong.
- **Arc per level:** A1 "Pagi Pertama" (rutinitas pasar); A2 "Buku Utang" (misteri); B1 "Pasar Baru" (renovasi); B2 "Mudik" (keluarga); C1 "Warisan" (masa depan pasar).
- **Episode 1:** Sari ikut ibu ke pasar pukul 4 → pelanggan pertama → buku catatan lama di bawah meja → utang 1998 → nama yang tidak dikenal → ibu menangis → cliffhanger: "Kalau anakku besar, ajari dia memasak."
- **Mengapa bertahan:** sensorik (bau, suara, makanan), nostalgia, keluarga, dan kota yang berubah.

#### 7.3.5 Snapshot sembilan dunia lain

- **Spanyol — El Camino de las Naranjas.** Lucía menemukan peta kakeknya dengan satu kebun jeruk yang tidak pernah dikunjungi. Ia meminjam van tua dan melintasi Andalusia bersama Mateo dan guru flamenco Carmen. Tapas, Semana Santa, pueblos blancos; kait: peta itu ditandai dengan nama ibu Lucía, yang tidak pernah dibicarakan.
- **Korea — 서울, 새벽 다섯 시 (Seoul, 5 A.M.).** Yuna bekerja shift malam di minimarket Hongdae; pelanggan tetap, musisi jalanan Min, dan buku lirik yang hilang. Chuseok, ramyeon, noraebang; kait: lirik itu berisi nama Yuna.
- **Arab — حبر وضوء (Ink and Light).** Nour magang pada pamannya, seorang calligrapher di Khan el-Khalili; sebuah huruf hilang dari gulungan tua. Ramadan, souk, ahwa; kait: huruf itu bagian dari nama keluarganya.
- **Hindi — मानसून के खत (Monsoon Letters).** Aarav menemukan surat-surat ayahnya yang pergi bertahun-tahun lalu. Monsun, chai, kereta, Diwali; kait: surat terakhir ditujukan kepada Aarav, bertanggal besok.
- **Jerman — Die Bäckerei an der Elbe.** Lena kembali ke toko roti Opa di Dresden; satu halaman resep hilang. Pasar Natal, Elbe, magang; kait: halaman itu berisi resep yang tidak pernah dijual.
- **Prancis — Lettres de Lyon.** Camille mewarisi toko buku bibinya dan menerima surat tanpa pengirim. Bouchon, Fête des Lumières, traboules; kait: surat itu tentang dirinya.
- **Portugis — Saudade na Feira.** Inês menjaga stan nenek di Lisbon; sepupunya datang dari Brasil; sebuah lagu fado menyimpan bait tersembunyi. Azulejos, pastel de nata, Santos Populares; kait: bait itu menyebut nama nenek.
- **Italia — Il Forno di Nonna.** Marco menyelamatkan toko roti Nonna di Bologna; seorang rival menantang di sagra. Tortellini, portico, espresso; kait: resep yang hilang ada di tangan rival.
- **Belanda — Fietsen door de Polder.** Noor kembali ke toko sepeda Opa di Utrecht dan menemukan sepeda sahabatnya yang hilang. Kanal, King's Day, hagelslag; kait: sepeda itu masih terkunci di depan rumah Noor.

### 7.4 Variasi bahasa dan register

| Bahasa | Varietas standar | Dialek/register | Kebijakan |
|---|---|---|---|
| `ja` | Hyōjungo (Tokyo) | Tohoku-ben sebagai warna, bukan target produksi | Dialek diglosarium; learner tidak diuji memproduksi dialek |
| `zh` | Putonghua, aksara sederhana | Dialek Beijing (儿化) sebagai warna | Pinyin standar; aksara tradisional P2 |
| `en` | American English (Maine) | Aksen regional ringan | Ejaan US; varian UK P2 |
| `id` | Bahasa Indonesia baku | Jawa/DIY sebagai warna | Istilah daerah diglosarium |
| `es` | Español peninsular (Andalucía) | Vosotros, seseo | Varian Latin America P2 |
| `ko` | Seoul standard | Satuan formal/informal | Romanisasi opsional |
| `ar` | MSA untuk narasi | Dialek Mesir untuk dialog | Dialog dialek ditandai; ujian MSA |
| `hi` | Hindi standar | Rajasthani ringan | IAST opsional |
| `de` | Hochdeutsch | Saxon ringan | Dialek diglosarium |
| `fr` | Français standard | Lyon references | Verlan P2 |
| `pt` | Português europeu (Lisbon) | Sepupu Brasil | Perbandingan BR/PT diglosarium |
| `it` | Italiano standard | Bologna references | Dialek P2 |
| `nl` | Standaardnederlands | Utrecht | — |

#### 7.4.1 Dampak penambahan Mandarin

- **Registry:** `zh` ditambahkan sebagai content language; UI locale `zh` menyusul (fallback `id`/`en` sampai terjemahan UI siap).
- **Font:** Noto Sans SC/Noto Serif SC; uji rendering hanzi dan pinyin di semua ukuran.
- **TTS/audio:** voice `zh-CN`; review pelafalan nada oleh native.
- **Framework:** HSK 2.0 1–6 dipetakan ke 5 tier; label HSK 3.0 ditinjau ulang jika diperlukan.
- **Review:** minimal 2 reviewer native Mandarin + 1 konsultan budaya Beijing.
- **QA:** pinyin, hanzi sederhana vs tradisional, dan istilah budaya masuk checklist khusus.
- **Dampak angka:** 13 bahasa = 130.000 materi (26.000 scene + 104.000 pendukung); jika Mandarin ditolak, 12 bahasa = 120.000 materi.

### 7.5 Template story bible

Setiap dunia wajib mengisi template berikut sebelum menulis scene:

| Field | Isi |
|---|---|
| Judul & logline | 1 kalimat yang menjelaskan konflik dan taruhan |
| Latar | Kota/daerah, tempat spesifik, musim, tahun |
| Tokoh | Nama, usia, peran, keinginan, rahasia, cara bicara |
| Jangkar budaya | 5–7 elemen yang akan muncul berulang |
| Peta arc | 5 level × konflik utama per level |
| Genre & tone | Mis. slice-of-life + misteri ringan, hangat, humor kering |
| Register bahasa | Formal/informal, dialek, keigo, honorifik |
| Motif visual | Warna, objek, makanan, cuaca yang berulang |
| Sensitivitas | Topik yang dihindari, content warning, catatan konsultan |
| Sumber | Buku, wawancara, situs resmi, tanggal akses |
| Canon | Nama tempat fiktif vs nyata; tanggal penting; aturan dunia |

### 7.6 Review budaya

Setiap scene wajib melewati **cultural review** dengan rubrik:

- Apakah detail budaya akurat dan dapat diverifikasi?
- Apakah tokoh lokal digambarkan dengan agensi, bukan sebagai alat penjelas?
- Apakah ada stereotip, eksotisasi, atau generalisasi ("orang X selalu ...")?
- Apakah perbedaan kelas, usia, gender, dan wilayah tercermin?
- Apakah topik sensitif (agama, politik, sejarah) ditangani dengan hati-hati?
- Apakah sumber dicantumkan dan dapat diaudit?

Reviewer budaya berhak **memblokir publikasi**, bukan hanya memberi komentar. Keputusan dan alasannya dicatat di `StoryReview`.

---

## 8. Romanisasi dan Tampilan Aksara

### 8.1 Istilah

| Istilah | Bahasa | Arti |
|---|---|---|
| **Romanisasi** | Umum | Representasi bahasa non-Latin dengan huruf Latin |
| **Romaji** | Jepang (`ja`) | Romanisasi Jepang; standar **Modified Hepburn** |
| **Pinyin** | Mandarin (`zh`) | Romanisasi Mandarin; standar **Hanyu Pinyin** dengan tanda nada |
| **Furigana** | Jepang | Bacaan kana di atas kanji; bukan romanisasi |
| **Romanisasi opsional** | Korea, Arab, Hindi | Bukan syarat rilis; dapat ditambahkan |

> Catatan: pengguna sering menyebut "romaji" untuk semua bahasa. Di PRD ini, "romaji" khusus Jepang; untuk Mandarin istilah yang benar adalah **pinyin**. Keduanya adalah lapisan romanisasi.

### 8.2 Aturan tampilan

**Susunan tiga lapis (default `ja`/`zh`):**

```text
[Native]        仙台駅に着きました。夏の風が暑いです。
[Romanisasi]    Sendai-eki ni tsukimashita. Natsu no kaze ga atsui desu.
[Terjemahan]    Aku sudah sampai di Stasiun Sendai. Angin musim panasnya panas.
```

| Aturan | Detail |
|---|---|
| Urutan | Aksara asli selalu di atas; romanisasi di bawahnya; terjemahan paling bawah dan dapat dilipat |
| Default | Romanisasi **aktif** untuk `ja`/`zh` di semua level; learner dapat mematikan |
| Furigana | Aktif untuk T1–T2, on-demand untuk T3+; tidak menggantikan romaji |
| Terjemahan | Aktif untuk T1; on-tap untuk T2+; dapat dimatikan |
| Segmentasi | Romanisasi per **kalimat**, bukan per karakter; detail per kata muncul saat tap |
| Tipografi | Romanisasi 0,85× ukuran native, warna `--learn-muted`, bukan italic (agar diakritik pinyin tidak rusak) |
| Panjang baris | CJK maksimum 32em; Latin 68ch; line-height 1,9 untuk CJK |
| Persistensi | Pilihan per bahasa, disimpan di akun + perangkat |
| Mode fokus | Menyembunyikan romanisasi + terjemahan; aksara asli tetap; dapat dikembalikan satu tap |

**Yang tidak boleh dilakukan:**

- Menampilkan romanisasi sebagai satu-satunya teks (menggantikan aksara).
- Menaruh romanisasi per karakter di bawah setiap huruf (clutter, terutama pinyin).
- Menyembunyikan romanisasi sepenuhnya tanpa opsi (melanggar kebutuhan pemula).
- Menerjemahkan per kata tanpa konteks kalimat.

### 8.3 Aturan romaji Jepang (Modified Hepburn)

| Kategori | Aturan | Contoh |
|---|---|---|
| し/ち/つ/ふ/じ | `shi`, `chi`, `tsu`, `fu`, `ji` | しごと → shigoto |
| を (partikel) | `o` | 水を飲む → mizu o nomu |
| は (partikel) | `wa` | 私は → watashi wa |
| へ (partikel) | `e` | 東京へ → Tōkyō e |
| ん | `n`; apostrof sebelum vokal/y | しんぶん → shinbun; しんよう → shin'yō |
| っ | gandakan konsonan berikut | きって → kitte; まっちゃ → matcha |
| Vokal panjang おう/おお | `ō` | 東京 → Tōkyō; 高校 → kōkō |
| Vokal panjang えい | `ei` (bukan `ē`) | 先生 → sensei |
| Vokal panjang ええ | `ē` | おねえさん → onēsan |
| Vokal panjang うう | `ū` | くうき → kūki |
| Vokal panjang ああ | `ā` | おばあちゃん → obāchan |
| Vokal panjang いい | `ī` | おじいさん → ojīsan |
| ー (loanword) | vokal panjang | コーヒー → kōhī |
| Nama | Kapital + makron | Satō, Ōsaka, Tōkyō |
| Kalimat | Kapital di awal; tanda baca Latin | おはよう。 → Ohayō. |
| Angka | Dibaca sesuai konteks | 十五分 → jūgo-fun; 一つ → hitotsu |
| Pencarian | Terima versi tanpa makron | Sato, Tokyo, Osaka |

**Furigana:** ditempel per kata/kanji compound, bukan per karakter; contoh 仙台駅 → せんだいえき di atas seluruh kata. Untuk nama diri, furigana mengikuti bacaan resmi yang dicatat di glosarium.

### 8.4 Aturan pinyin Mandarin (Hanyu Pinyin)

| Kategori | Aturan | Contoh |
|---|---|---|
| Nada | Tanda nada di atas vokal utama: a/o/e > i/u/ü; `iu` → tanda di `u`; `ui` → tanda di `i` | mā, má, mǎ, mà; liù, guì |
| Nada netral | Tanpa tanda | 朋友 péngyou; 明白 míngbai; 灯笼 dēnglong |
| `ü` | Tetap `ü` (bukan `u`) setelah `n`/`l` | 女 nǚ; 绿 lǜ |
| Segmentasi kata | Per kata, bukan per karakter | 茉莉花茶 → mòlì huāchá |
| Kapitalisasi | Awal kalimat; nama diri; nama tempat | Lín Xiǎoyǔ; Běijīng |
| Nama orang | Nama keluarga dulu, spasi | Lín Xiǎoyǔ, Chén yéye |
| Sandhi 一 | `yī` → `yí` sebelum nada 4; `yì` sebelum 1/2/3 | 一个 yí gè; 一杯 yì bēi |
| Sandhi 不 | `bù` → `bú` sebelum nada 4 | 不是 bú shì |
| Sandhi nada 3 | Tidak ditulis; dijelaskan di audio | 你好 nǐ hǎo (dibaca ní hǎo) |
| Erhua | `r` menempel | 哪儿 nǎr; 一点儿 yìdiǎnr |
| Polifon | Diselesaikan per kata, bukan per karakter | 行 xíng/háng; 长 cháng/zhǎng; 了 le/liǎo |
| Tanda baca | Gunakan tanda baca Mandarin untuk teks asli; pinyin pakai tanda Latin | 你好！ → Nǐ hǎo! |
| Angka/tanggal | Dibaca sesuai konteks | 1985 → yī jiǔ bā wǔ; 腊月二十八 → làyuè èrshíbā |

**Catatan HSK:** PRD ini memakai **HSK 2.0 (6 level)** karena pemetaan 5 tier lebih bersih. Jika produk beralih ke HSK 3.0 (9 level), pemetaan D-14 harus ditinjau ulang; konten tidak perlu ditulis ulang, hanya label dan ambang level.

### 8.5 Model data romanisasi

Romanisasi disimpan di level **baris** dan **token**:

```json
{
  "id": "ja-jlpt-n5-u01-p0001-s01",
  "text": "仙台駅に着きました。",
  "script": "jpan",
  "reading": "せんだいえきについてきました。",
  "romanization": {
    "scheme": "hepburn",
    "value": "Sendai-eki ni tsukimashita."
  },
  "translation": {
    "id": "Aku sudah sampai di Stasiun Sendai.",
    "en": "I arrived at Sendai Station."
  },
  "tokens": [
    {
      "surface": "仙台駅",
      "start": 0,
      "end": 3,
      "reading": "せんだいえき",
      "romanization": "Sendai-eki",
      "gloss": { "id": "Stasiun Sendai", "en": "Sendai Station" },
      "pos": "noun"
    },
    {
      "surface": "に",
      "start": 3,
      "end": 4,
      "romanization": "ni",
      "gloss": { "id": "partikel tujuan", "en": "target particle" },
      "pos": "particle"
    }
  ]
}
```

Aturan:

1. `text` wajib; `romanization` wajib untuk `ja`/`zh`.
2. `tokens` opsional untuk bahasa Latin, wajib untuk `ja`/`zh` (minimal per kata).
3. `translation` menyimpan locale penjelasan yang tersedia; tidak boleh kosong untuk `id`/`en`.
4. `reading` menyimpan kana (ja) atau pinyin tanpa nada? **Tidak** — pinyin dengan nada disimpan di `romanization.value`; `reading` untuk ja adalah kana, untuk zh adalah hanzi? Untuk zh, `reading` tidak dipakai; pinyin ada di romanization.
5. Offset `start`/`end` dihitung dalam karakter Unicode, bukan byte.
6. Semua ID stabil; perubahan teks membuat versi baru.

### 8.6 QA romanisasi

**Otomatis (CI):**

- Setiap baris `ja`/`zh` memiliki `romanization.value` tidak kosong.
- Jumlah token > 0; offset tidak tumpang tindih; tidak ada karakter hilang.
- Pinyin: validasi syllable inventory + tanda nada; deteksi `ü` yang salah; deteksi nada pada suku kata tanpa vokal.
- Romaji: validasi pola Hepburn; deteksi `ha`/`wa`, `wo`/`o`, `e`/`he` pada partikel; deteksi vokal panjang.
- Kamus: bandingkan reading dengan JMdict (ja) / CC-CEDICT (zh); flag ketidakcocokan.
- Nama diri dan istilah budaya masuk **whitelist manual**; tidak boleh diubah otomatis.
- Deteksi baris yang sama tetapi romanisasi berbeda (inkonsistensi).
- Deteksi romanisasi yang identik dengan teks (tidak ada konversi).

**Manusia:**

- 100% baris untuk level T1–T2 dibaca reviewer native.
- 10% sampling untuk T3–T5, plus 100% nama diri, menu, dan istilah budaya.
- Reviewer menandai `approved` / `needs_fix` / `blocked`.
- Error budget: **<0,5% baris** mengandung cacat romanisasi; **0** kesalahan pada nama diri/istilah budaya dalam audit bulanan.

### 8.7 Bahasa lain

| Bahasa | Romanisasi | Status |
|---|---|---|
| `ko` | Revised Romanization | Opsional; direkomendasikan untuk pemula |
| `ar` | Transliterasi sederhana (ALA-LC yang disederhanakan) | Opsional; teks Arab tetap utama; RTL |
| `hi` | IAST | Opsional |
| `es, en, id, de, fr, pt, it, nl` | Tidak perlu | — |

### 8.8 Edge case tampilan

- **Ruby overflow:** furigana panjang di atas kanji sempit; gunakan `ruby-align` dan line-height tambahan.
- **Pinyin di layar kecil:** jangan pecah suku kata; izinkan wrap per kata.
- **Copy:** default menyalin aksara asli; opsi "salin semua" menyertakan romanisasi + terjemahan.
- **Screen reader:** native `lang="ja"`/`zh`; romanisasi `lang="ja-Latn"`/`zh-Latn`; terjemahan `lang` sesuai locale; furigana `aria-hidden` agar tidak dibaca ganda.
- **Font fallback:** Noto Serif JP / Noto Serif SC; jangan biarkan browser memilih font Latin untuk CJK.
- **RTL:** untuk `ar`, arah teks dan tata letak mirror; romanisasi (jika ada) LTR.
- **Pencarian:** indeks teks asli + romanisasi tanpa diakritik + terjemahan; hasil menampilkan asal bahasa.

---

## 9. Engagement: "Berlama-lama" yang Sehat

### 9.1 Loop utama

```text
Daily drop / kartu "Lanjutkan"
        ↓
Scene hook → baca/dengar → tap glosarium → checkpoint → cliffhanger
        ↑                                                  ↓
   kembali besok ← streak/passport/recap ← scene berikutnya ← pilihan
```

Loop ini dirancang agar learner punya **alasan naratif** untuk kembali, bukan hanya notifikasi atau takut kehilangan streak.

### 9.2 Mekanik

| Mekanik | Apa | Mengapa | Guardrail | Metrik |
|---|---|---|---|---|
| **Daily drop** | Paket 2–3 scene baru per hari pada jam pilihan learner | Menciptakan ritual kecil dan sesi 10–15 menit | Tidak ada hukuman jika terlewat; catch-up | Drop open rate, scene completion |
| **Cliffhanger** | Akhir scene dengan pertanyaan/reveal/pilihan | Rasa ingin tahu | Tidak menahan konten yang sudah selesai; tidak palsu | Next-scene rate |
| **Pilihan** | 2–3 opsi tindakan/dialog setiap 3–5 scene | Agensi + latihan bahasa | Plot utama tetap konvergen; tidak ada "bad ending" | Choice engagement, replay |
| **Afinitas tokoh** | Hubungan naik lewat pilihan dan kehadiran | Ikatan emosional | Bukan dating-sim; tidak ada fanservice | Character card unlock |
| **Passport budaya** | Stempel untuk festival/tempat/makanan | Rasa pencapaian + belajar budaya | Fakta terverifikasi; bukan checklist kosong | Stamps per learner |
| **Recap** | "Previously on..." 3 baris + preview | Mengingatkan konteks | Bisa dilewati; tidak menggantikan cerita | Recap open rate |
| **Audio drama** | Pemutaran berurutan dengan highlight | Belajar hands-free | Tidak autoplay scene berikutnya tanpa opt-in | Audio minutes |
| **Jurnal cerita** | Ringkasan otomatis + 1 baris tulisan learner | Refleksi + output | Privat secara default | Journal entries |
| **Streak** | Hari berturut-turut menyelesaikan scene | Kebiasaan | 2 freeze/bulan; bisa diperbaiki dengan review; tanpa leaderboard publik | Streak 7/30 |

### 9.3 Tipe cliffhanger

| Tipe | Contoh | Risiko | Kapan dipakai |
|---|---|---|---|
| **Pertanyaan** | "Siapa yang menulis halaman 8 Agustus itu?" | Bisa terasa murah jika tidak dijawab | Akhir scene biasa |
| **Reveal** | Buku catatan berisi pesanan untuk orang yang sudah meninggal | Spoiler jika terlalu cepat | Akhir episode |
| **Pilihan** | "Aoi harus bilang apa?" | Menggantung tanpa konsekuensi | Setiap 3–5 scene |
| **Hitung mundur** | Festival Tanabata tinggal 3 hari | Manipulatif jika palsu | Akhir arc |

Aturan: cliffhanger harus **dijawab dalam 1–3 scene berikutnya**. Jangan menumpuk pertanyaan tanpa jawaban.

### 9.4 Pilihan yang mendidik

- Pilihan berupa **tindakan bahasa**: memilih sapaan, cara meminta maaf, cara menolak, cara menawarkan bantuan.
- Setiap opsi punya konsekuensi sosial kecil (tokoh merespons berbeda), bukan "game over".
- Plot utama konvergen; yang bercabang adalah **side scene** (1 per arc) dan dialog.
- Pilihan dicatat untuk personalisasi (mis. learner yang sering memilih formal mendapat lebih banyak latihan keigo).
- Biaya konten dikendalikan: 2–3 opsi, 1 side scene per arc, bukan branching penuh.

### 9.5 Tokoh, passport, dan jurnal

- **Kartu tokoh:** nama, peran, usia, bio 3 kalimat, kutipan suara, "hubungan" dengan learner. Terbuka saat afinitas naik.
- **Passport:** satu stempel per arc/festival; berisi 60 detik catatan budaya + 1 pertanyaan refleksi. Bukan "collect semua" yang memaksa binge.
- **Jurnal:** ringkasan 3 baris dalam bahasa target + terjemahan; learner dapat menambah 1 kalimat; share card tanpa spoiler.
- **Recap audio:** 30 detik "sebelumnya" untuk commuter.

### 9.6 Sesi dan batas sehat

| Aturan | Detail |
|---|---|
| Durasi default | 10–15 menit (2–3 scene) |
| Episode | 10 scene ≈ 30–50 menit; dipecah menjadi 3 sesi |
| Jeda | Prompt istirahat setelah 25 menit; simpan posisi |
| Autoplay | Tidak ada autoplay ke scene berikutnya tanpa tap |
| Batas harian | Opsional; learner dapat menetapkan 1/2/3 scene per hari |
| Malam | Setelah 23.00 lokal, tawarkan "lanjut besok" (bukan memblokir) |
| Streak | Freeze 2×/bulan; repair dengan 1 review; tanpa shaming |
| Notifikasi | Maksimal 1/hari; jam dipilih learner; mudah dimatikan |

### 9.7 Etika dan anti-pattern

**Prinsip:** waktu yang dihabiskan harus **disetujui learner** dan **terasa berharga setelahnya**, bukan hanya selama sesi.

**Dilarang:**

- Pay-to-continue atau mengunci cliffhanger di balik pembayaran.
- Cliffhanger palsu yang tidak pernah dijawab.
- Infinite autoplay atau "episode berikutnya" yang otomatis.
- Variable reward ala mesin slot (loot box, hadiah acak yang menuntut pengulangan).
- Streak shaming, notifikasi bersalah, atau FOMO.
- Leaderboard publik yang membandingkan learner.
- Konten yang sengaja dibuat adiktif untuk anak di bawah 13 tahun.

**Diwajibkan:**

- Content warning untuk topik sensitif (kematian, penyakit, migrasi, perang).
- Transparansi progres: "kamu sudah 40% di arc ini".
- Tombol "istirahat" dan "lanjut besok" yang setara secara visual.
- Audit bulanan terhadap session length, late-night usage, dan self-reported regret.

### 9.8 Pemetaan mekanik ke metrik

| Mekanik | Metrik utama | Guardrail |
|---|---|---|
| Daily drop | Drop → scene start | Unsubscribe rate |
| Cliffhanger | Scene → next scene | Drop-off setelah 1 scene |
| Pilihan | Choice completion | Choice skip rate |
| Passport | Stamps/arc | Collection pressure |
| Audio | Audio minutes | Audio abandonment |
| Streak | 7/30-day streak | Late-night sessions |
| Jurnal | Entries/learner | Privacy complaints |

---

## 10. Pengalaman Pengguna

### 10.1 Rute

| Rute | Fungsi |
|---|---|
| `/[lang]/stories` | Story home: lanjutkan, daily drop, arc map, cerita lain |
| `/[lang]/stories/[worldId]` | Dunia: sinopsis, tokoh, arc/season, progres |
| `/[lang]/stories/[worldId]/[episodeId]` | Episode: daftar scene, recap, preview |
| `/[lang]/reader/[sceneId]` | Reader (layar utama) |
| `/[lang]/stories/[worldId]/characters` | Galeri tokoh |
| `/[lang]/stories/[worldId]/recap` | Recap arc/episode |
| `/[lang]/passport` | Passport budaya |
| `/[lang]/settings/reading` | Pengaturan romanisasi, furigana, font, audio |

Rute tetap mengikuti UI locale `[lang]`, bukan bahasa cerita. Bahasa cerita berasal dari `targetLanguage`/`activeLanguageCode`.

### 10.2 Layar utama

| Layar | Tujuan | Elemen kunci | Empty state |
|---|---|---|---|
| **Story Home** | Memberi alasan untuk mulai | Kartu "Lanjutkan", daily drop, arc map, rekomendasi | "Pilih bahasa untuk memulai cerita" |
| **World** | Menjelaskan dunia & tokoh | Cover, logline, tokoh, season, progres | "Cerita belum tersedia untuk level ini" |
| **Arc Map** | Menunjukkan posisi | Node episode, status, cliffhanger | "Mulai episode pertama" |
| **Reader** | Membaca/mendengar | Baris, romanisasi, glosarium, audio, progres | Error + retry |
| **Checkpoint** | Menguji pemahaman | 3–6 soal, feedback, penjelasan | — |
| **Scene End** | Menutup dengan hook | Catatan budaya, next preview, pilihan | — |
| **Episode End** | Merayakan & recap | Recap, XP, passport, next episode | — |
| **Passport** | Koleksi budaya | Stempel, detail, sumber | "Belum ada stempel" |
| **Characters** | Ikatan tokoh | Kartu, bio, kutipan | "Tokoh belum terbuka" |

### 10.3 Interaksi reader

| Interaksi | Perilaku |
|---|---|
| Tap baris | Tampilkan terjemahan + audio + tombol "tandai" |
| Tap kata | Popover: surface, reading, romaji/pinyin, arti, POS, contoh, "tambah ke review" |
| Tombol audio | Putar baris; highlight kata; kecepatan 0,75/1,0/1,25 |
| Toggle romanisasi | On/off; tersimpan per bahasa |
| Toggle furigana | On/off/on-demand |
| Toggle terjemahan | On/off |
| Font size | 3 tingkat; tersimpan |
| Mode fokus | Sembunyikan romanisasi + terjemahan; aksara asli saja |
| Bookmark | Tandai scene untuk kembali |
| Flag | Laporkan kesalahan (romanisasi, terjemahan, budaya, audio) |
| Swipe/next | Baris berikutnya; "tampilkan semua" |
| Progress | Bar scene + episode + arc |
| Resume | Kembali ke baris terakhir |

### 10.4 Onboarding dan placement

1. Pilih bahasa (13; tampilkan ketersediaan jujur).
2. Pilih tujuan: ujian, travel, kerja, budaya, keluarga.
3. Pilih waktu harian: 5/10/15/20 menit.
4. Pilih bahasa penjelasan: `id`, `en`, `ja` (fallback `en`).
5. **Placement story (opsional):** 5–7 pertanyaan dalam konteks cerita pendek, bukan tes grammar. Hasil: rekomendasi level + scene pertama.
6. Langsung masuk ke scene 1; tidak ada tembok setup.

Placement story adalah peluang diferensiasi: learner "membaca cerita" dan sistem mengukur level dari pemahaman, bukan dari self-report.

### 10.5 State

- **Loading:** skeleton reader (bukan spinner penuh); baris muncul bertahap.
- **Error:** pesan jelas + tombol "Coba lagi" + "Kembali ke episode".
- **Empty:** jelaskan mengapa kosong (belum ada konten level ini) + tawaran level lain.
- **Offline:** tampilkan scene yang sudah di-cache; tandai progres akan disinkronkan.
- **Audio gagal:** teks tetap bisa dibaca; tombol retry.
- **Content warning:** muncul sebelum scene; learner dapat melewati.

### 10.6 Aksesibilitas

- WCAG 2.2 AA untuk reader: kontras 4,5:1, target 44×44px, fokus terlihat.
- Font scaling 200% tanpa kehilangan konten; line-height mengikuti.
- Screen reader: urutan baca native → romanisasi → terjemahan; furigana tidak dibaca ganda.
- Keyboard: navigasi baris, audio, toggle, checkpoint.
- Caption/transkrip untuk semua audio.
- Reduced motion; tidak ada animasi yang memicu vestibular.
- RTL untuk `ar`; mirror layout, bukan teks.
- CJK: line-height 1,75–1,9; font stack Noto Serif JP/SC.
- Warna bukan satu-satunya penanda (benar/salah, tone).

### 10.7 Performa

| Metrik | Target |
|---|---|
| Payload scene (gzip, tanpa audio) | < 120 KB |
| TTFB p75 | < 500 ms |
| Scene interaktif p75 (4G) | < 1,5 s |
| Audio start | < 1 s |
| Prefetch scene berikutnya | Saat 70% scene terbaca |
| Cache | Published scene immutable; CDN; `ETag` + `contentVersion` |
| Gambar | Lazy load; WebP/AVIF; placeholder blur |
| Offline | Cache 3 scene terakhir (P2) |

### 10.8 Visual

- Gunakan token `--learn-*`; tidak ada hex mentah di komponen.
- Body cerita: Noto Serif JP/SC (CJK) + Lora (terjemahan Latin); UI: Plus Jakarta Sans.
- Cover art: ilustrasi original, bukan foto stok; konsisten per dunia.
- Palet per dunia: aksen hangat, tetapi tetap dalam token.
- XP/streak memakai `--accent-xp`; budaya memakai `--learn-accent`; error `--learn-danger`.

---

## 11. Model Konten dan Data

### 11.1 Pemetaan ke FS-09

Tidak membuat platform konten baru. Lapisan cerita adalah **ekstensi aditif** dari model yang sudah ada:

| Konsep cerita | Model FS-09 | Catatan |
|---|---|---|
| Dunia | `StoryWorld` (baru) | Metadata dunia, tokoh, latar |
| Arc/season | `CurriculumUnit` + `StoryArcMeta` | Unit tetap unit; meta menyimpan season, sinopsis, jangkar budaya |
| Episode | `CurriculumLesson` + `StoryEpisodeMeta` | Lesson tetap lesson; meta menyimpan hook, recap |
| Scene/materi | `Passage` + `StorySceneMeta` | Passage `kind = "story_scene"` |
| Baris | `StoryLine` (baru) | Anak dari Passage; menyimpan teks, reading, romanisasi, terjemahan, token |
| Glosarium | `StoryLine.tokens` + `Vocabulary` | Token menyimpan gloss; vocabulary untuk SRS |
| Materi pendukung | `StoryMaterial` (baru) | Vocabulary set, grammar focus, culture note, review deck |
| Catatan budaya | `StoryCultureNote` (baru) | Terhubung ke scene/arc |
| Latihan | `Question` | `passageId` menunjuk scene; answer key server-only |
| Audio | `AudioAsset` | Scene + per baris; transkrip |
| Progres baca | `StorySceneProgress` (baru) + `LessonProgress` | Resume di `LessonProgress.resumeState`; detail di scene progress |
| State naratif | `StoryProgress` (baru) | Pilihan, afinitas, passport |
| Review | `StoryReview` (baru) | Gate kualitas per scene |

### 11.2 Skema Prisma (usulan)

> Perubahan bersifat aditif. Jangan menghapus `Passage`/`Question` legacy. Wajib memperbarui `context/architecture-context.md` sebelum migration.

```prisma
model StoryWorld {
  id               String   @id
  languageCode     String
  title            String
  nativeTitle      String
  logline          String
  setting          String
  era              String?
  tone             String
  sensitivityNotes Json?
  coverAssetKey    String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  characters StoryCharacter[]
  arcs       StoryArcMeta[]

  @@index([languageCode])
}

model StoryCharacter {
  id             String  @id
  worldId        String
  name           String
  nativeName     String
  role           String
  age            Int?
  bio            String
  avatarAssetKey String?
  speechStyle    String?

  world StoryWorld @relation(fields: [worldId], references: [id], onDelete: Cascade)

  @@index([worldId])
}

model StoryArcMeta {
  id              String  @id
  worldId         String
  unitId          String  @unique
  seasonNo        Int
  title           String
  synopsis        String
  culturalAnchors Json
  cliffhanger     String?

  world StoryWorld      @relation(fields: [worldId], references: [id], onDelete: Cascade)
  unit  CurriculumUnit  @relation(fields: [unitId], references: [id], onDelete: Cascade)

  @@index([worldId, seasonNo])
}

model StoryEpisodeMeta {
  id         String  @id
  lessonId   String  @unique
  arcId      String
  episodeNo  Int
  title      String
  hook       String
  recap      String?

  lesson CurriculumLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@index([arcId, episodeNo])
}

model StorySceneMeta {
  id               String   @id
  passageId        String   @unique
  arcId            String
  episodeId        String
  sceneNo          Int
  title            String
  setting          String
  estimatedMinutes Int
  cliffhanger      String?
  cultureNoteIds   String[]

  passage Passage @relation(fields: [passageId], references: [id], onDelete: Cascade)

  @@unique([episodeId, sceneNo])
  @@index([arcId, sceneNo])
}

model StoryLine {
  id             String  @id
  sceneId        String
  order          Int
  speakerId      String?
  text           String
  script         String  @default("jpan")
  reading        String?
  romanization   Json?
  translation    Json
  tokens         Json?
  audioAssetId   String?

  scene StorySceneMeta @relation(fields: [sceneId], references: [id], onDelete: Cascade)
  audio AudioAsset?    @relation(fields: [audioAssetId], references: [id], onDelete: SetNull)

  @@unique([sceneId, order])
  @@index([sceneId])
}

model StoryMaterial {
  id           String  @id
  sceneId      String
  type         String  // vocabulary | grammar | culture | review
  order        Int
  title        String
  body         Json
  audioAssetId String?

  scene StorySceneMeta @relation(fields: [sceneId], references: [id], onDelete: Cascade)
  audio AudioAsset?    @relation(fields: [audioAssetId], references: [id], onDelete: SetNull)

  @@unique([sceneId, type, order])
  @@index([sceneId, type])
}

model StoryCultureNote {
  id                String @id
  languageCode      String
  title             String
  body              Json
  sources           Json
  sensitivityStatus String @default("pending")

  @@index([languageCode])
}

model StoryChoice {
  id      String  @id
  sceneId String
  prompt  String
  options Json
  effects Json?

  @@index([sceneId])
}

model StorySceneProgress {
  userId       String
  sceneId      String
  languageCode String
  status       String   @default("in_progress") // in_progress | completed | skipped
  lastLineId   String?
  minutes      Int      @default(0)
  completedAt  DateTime?
  updatedAt    DateTime @updatedAt

  @@id([userId, sceneId])
  @@index([userId, languageCode, status])
  @@index([userId, updatedAt])
}

model StoryProgress {
  userId           String
  languageCode     String
  worldId          String
  currentArcId     String?
  currentEpisodeId String?
  currentSceneId   String?
  choices          Json?
  affinity         Json?

  @@id([userId, languageCode, worldId])
}

model StoryPassportStamp {
  userId       String
  stampId      String
  languageCode String
  earnedAt     DateTime @default(now())

  @@id([userId, stampId])
  @@index([userId, languageCode])
}

model StoryReview {
  id         String   @id
  sceneId    String
  reviewerId String
  role       String   // language | native | culture | pedagogy | qa
  status     String   // pending | approved | needs_fix | blocked
  notes      String?
  createdAt  DateTime @default(now())

  @@index([sceneId, role])
  @@index([status, role])
}
```

> Catatan implementasi: Prisma mewajibkan relasi dua arah. Saat migration, tambahkan field balik di model existing: `CurriculumUnit.storyArc`, `CurriculumLesson.storyEpisode`, `Passage.storyScene`, dan `AudioAsset.storyLines`. Skema di atas hanya menampilkan sisi baru agar mudah dibaca.

### 11.3 ID

| Entitas | Pola | Contoh |
|---|---|---|
| Dunia | `{lang}-{slug}` | `ja-komorebi` |
| Arc | `{lang}-{framework}-{level}-u{nn}` | `ja-jlpt-n5-u01` |
| Episode | `{arc}-l{nn}` | `ja-jlpt-n5-u01-l01` |
| Scene | `{arc}-p{nnnn}` | `ja-jlpt-n5-u01-p0001` |
| Baris | `{scene}-s{nn}` | `ja-jlpt-n5-u01-p0001-s01` |
| Pilihan | `{scene}-c{nn}` | `ja-jlpt-n5-u01-p0001-c01` |
| Catatan budaya | `{lang}-culture-{nnnn}` | `ja-culture-0007` |
| Tokoh | `{world}-{slug}` | `ja-komorebi-aoi` |
| Stempel | `{lang}-stamp-{slug}` | `ja-stamp-tanabata` |

Aturan:

1. ID stabil, tidak pernah dipakai ulang.
2. `p{nnnn}` unik dalam satu unit (maks. 200 scene/unit).
3. ID tidak mengandung judul yang bisa berubah; judul disimpan di metadata.
4. ID lama dari FS-09 (`p0007`) tetap valid; scene baru mengikuti pola yang sama.

### 11.4 Progres

- **Resume baca:** `LessonProgress.resumeState = { sceneId, lineId, position, updatedAt }`; ditulis throttle 5 detik dan saat keluar.
- **Detail scene:** `StorySceneProgress` menyimpan status, baris terakhir, menit, dan waktu selesai.
- **State naratif:** `StoryProgress` menyimpan pilihan, afinitas tokoh, dan scene terakhir per dunia.
- **Materi pendukung:** progres vocab/grammar/review memakai `ExerciseAttempt`, `SrsCard`, dan `LessonProgress`; tidak perlu tabel progres baru.
- **XP:** tetap lewat `XpEvent`; satu scene selesai = satu event dengan `clientEventId` idempoten.
- **Streak:** tetap global; scene completion memperbarui `DailyActivity`.
- **Tidak ada double counting:** `LessonProgress` dan `StorySceneProgress` ditulis dalam satu transaksi; jika salah satu gagal, tidak ada XP.

### 11.5 Versi dan immutability

- Setiap scene punya `contentVersion` (mis. `2026.11.1`).
- Published scene immutable; perubahan teks/romanisasi/terjemahan membuat versi baru + `StoryRevision`.
- Progres dan attempt merujuk ID stabil; versi baru tidak menghapus progres.
- Scene `retired` disembunyikan dari katalog baru, tetapi tetap bisa dibaca learner yang sudah memulai (dengan label "versi lama").
- Rollback menunjuk versi sebelumnya; tidak ada edit in-place pada konten published.

### 11.6 Answer key

- `Question.answerKey` dan `explanation` **tidak pernah** dikirim ke client sebelum submit.
- DTO scene hanya memuat `prompt`, `choices`, `type`, `id`, dan metadata.
- Submit melalui `POST /api/v1/attempts` yang sudah ada; server menilai dan mengembalikan explanation.
- Authoring JSON boleh memuat `answerKey`; import memisahkannya ke tabel server-only.

### 11.7 Audio

- Audio scene dan audio per baris disimpan di object storage + CDN; DB hanya metadata.
- `AudioAsset` menyimpan `storageKey`, `url`, `durationMs`, `transcript`, `voice`, `provider`.
- Transkrip wajib; audio tidak pernah menjadi satu-satunya cara menyelesaikan scene.
- Sinkronisasi baris memakai timestamp per baris (`startMs`, `endMs`) di metadata audio.
- Audio di-cache immutable per `contentVersion`.

### 11.8 Pencarian dan indeks

- Full-text: judul, teks baris, terjemahan, nama tokoh, catatan budaya.
- Indeks romanisasi tanpa diakritik untuk pencarian (`Sato`, `Tokyo`, `Beijing`).
- Filter: bahasa, level, dunia, genre, status.
- Vocabulary index untuk SRS dan "kata ini muncul di scene mana".

### 11.9 Privasi

- Progres baca adalah data learner; tidak dibagikan publik tanpa opt-in.
- Analytics tidak memuat teks jawaban bebas atau PII.
- Jurnal cerita privat secara default; share card hanya ringkasan tanpa spoiler.
- Hapus akun = hapus `StoryProgress`, `StorySceneProgress`, `StoryPassportStamp`, dan journal.
- Audio learner (jika ada speaking di P2) tidak disimpan tanpa izin eksplisit.

---

## 12. Kontrak API

### 12.1 Endpoint

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| `GET` | `/api/v1/stories?language=ja` | ya | Katalog dunia + progres + rekomendasi |
| `GET` | `/api/v1/stories/:worldId` | ya | Detail dunia, tokoh, arc, progres |
| `GET` | `/api/v1/stories/:worldId/arcs/:arcId` | ya | Arc + episode + scene |
| `GET` | `/api/v1/episodes/:episodeId` | ya | Episode + daftar scene + recap |
| `GET` | `/api/v1/scenes/:sceneId?locale=id` | ya | Scene lengkap + metadata materi pendukung (tanpa answer key) |
| `GET` | `/api/v1/materials/:materialId?locale=id` | ya | Konten materi pendukung (vocab/grammar/culture/review) |
| `POST` | `/api/v1/story-progress` | ya | Simpan posisi/status scene |
| `POST` | `/api/v1/story-choices` | ya | Simpan pilihan + efek |
| `GET` | `/api/v1/stories/:worldId/recap?episodeId=` | ya | Recap teks/audio |
| `GET` | `/api/v1/passport?language=ja` | ya | Stempel budaya |
| `GET` | `/api/v1/characters?worldId=` | ya | Kartu tokoh |
| `POST` | `/api/v1/scenes/:sceneId/flag` | ya | Laporkan kesalahan |
| `POST` | `/api/v1/attempts` | ya | Submit latihan (existing) |

### 12.2 `GET /api/v1/scenes/:sceneId`

Response (ringkas):

```json
{
  "scene": {
    "id": "ja-jlpt-n5-u01-p0001",
    "contentVersion": "2026.11.1",
    "languageCode": "ja",
    "level": "N5",
    "title": "仙台駅",
    "titleRomanization": "Sendai-eki",
    "titleTranslation": "Stasiun Sendai",
    "estimatedMinutes": 4,
    "lines": [
      {
        "id": "s01",
        "speaker": { "id": "narrator", "name": null },
        "text": "仙台駅に着きました。夏の風が暑いです。",
        "romanization": {
          "scheme": "hepburn",
          "value": "Sendai-eki ni tsukimashita. Natsu no kaze ga atsui desu."
        },
        "translation": "Aku sudah sampai di Stasiun Sendai. Angin musim panasnya panas.",
        "audioUrl": "https://cdn.lango.app/audio/ja/ja-jlpt-n5-u01-p0001-s01.mp3",
        "tokens": [
          {
            "surface": "仙台駅",
            "reading": "せんだいえき",
            "romanization": "Sendai-eki",
            "gloss": "Stasiun Sendai",
            "pos": "noun"
          }
        ]
      }
    ],
    "cultureNotes": [
      {
        "id": "ja-culture-0007",
        "title": "Kissaten: kedai kopi yang menyimpan waktu",
        "body": "Kissaten adalah kedai kopi tradisional dengan interior retro dan pelanggan tetap.",
        "sources": ["Wawancara pemilik kissaten, Sendai, 2026"]
      }
    ],
    "materials": [
      { "id": "ja-jlpt-n5-u01-p0001-m01", "type": "vocabulary", "title": "Kata kunci: 常連, おしぼり" },
      { "id": "ja-jlpt-n5-u01-p0001-m02", "type": "grammar", "title": "〜ています: keadaan vs progres" }
    ],
    "exercises": [
      {
        "id": "q01",
        "type": "multiple_choice",
        "prompt": "葵はなぜ仙台に来ましたか。",
        "choices": [
          { "id": "a", "text": "祖母の店を手伝うため" },
          { "id": "b", "text": "大学の試験のため" }
        ]
      }
    ]
  },
  "progress": {
    "status": "in_progress",
    "lastLineId": "s01"
  }
}
```

**Tidak ada** `answerKey`, `isCorrect`, atau `explanation` di response ini.

### 12.3 `POST /api/v1/story-progress`

Request:

```json
{
  "sceneId": "ja-jlpt-n5-u01-p0001",
  "clientEventId": "0f5c2b1e-5e0b-4f0e-9f1a-2f6a1c9d7b21",
  "status": "completed",
  "lastLineId": "s10",
  "minutes": 4
}
```

Response:

```json
{
  "sceneId": "ja-jlpt-n5-u01-p0001",
  "status": "completed",
  "xpEarned": 20,
  "streakDays": 4,
  "nextSceneId": "ja-jlpt-n5-u01-p0002",
  "passportStamp": { "id": "ja-stamp-kissaten", "earned": true }
}
```

Aturan:

- `clientEventId` idempoten; request ulang mengembalikan hasil yang sama tanpa XP ganda.
- `status=completed` hanya jika seluruh baris terbaca/didengar dan checkpoint selesai.
- `minutes` di-clamp 0–30; tidak dipakai untuk XP (anti-farming).
- Progress disimpan dalam transaksi bersama `LessonProgress`, `XpEvent`, `DailyActivity`.

### 12.4 Error

Semua error mengikuti bentuk:

```json
{ "error": "Scene tidak ditemukan", "code": "SCENE_NOT_FOUND" }
```

Kode minimum: `UNAUTHORIZED`, `FORBIDDEN`, `SCENE_NOT_FOUND`, `SCENE_RETIRED`, `INVALID_PROGRESS`, `DUPLICATE_EVENT`, `AUDIO_UNAVAILABLE`, `RATE_LIMITED`, `INTERNAL_ERROR`.

### 12.5 Cache, auth, dan performa

- Scene published: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`; `ETag` = `contentVersion`.
- Progres: `private, no-store`.
- Audio: signed URL (kedaluwarsa 1 jam) atau CDN publik dengan token; jangan bocorkan path storage.
- Auth: session `lango_session`; scene content boleh di-cache CDN, tetapi endpoint tetap memeriksa sesi untuk progres.
- Rate limit: 60 request/menit per user untuk endpoint baca; 10/menit untuk progress.
- Pagination katalog: cursor; maksimum 50 item.
- ETag mismatch → client refetch scene; progres tidak hilang.

---

## 13. Pipeline Produksi dan Quality Gates

### 13.1 Peran

| Peran | Tanggung jawab |
|---|---|
| **Story architect** | Bible dunia, arc, karakter, konsistensi canon |
| **Writer** | Draft scene, dialog, narasi |
| **Language editor** | Grammar, gaya, level, konsistensi istilah |
| **Native reviewer** | Kealamian bahasa, romanisasi, dialog |
| **Cultural consultant** | Akurasi budaya, sensitivitas, sumber |
| **Pedagogy reviewer** | Level, kosakata, grammar target, latihan |
| **Audio producer** | Casting, rekaman, editing, loudness, transkrip |
| **QA** | Validasi otomatis + manual, flag, regression |
| **Content ops** | Jadwal, backlog, review SLA, publish |

### 13.2 Tahapan dan gate

| Gate | Tahap | Output | Owner | Kriteria lolos |
|---|---|---|---|---|
| **G0** | Story bible | Logline, tokoh, latar, jangkar budaya, arc | Story architect + cultural consultant | Konsultan budaya setuju konsep |
| **G1** | Arc outline | 20 episode, beat utama, cliffhanger | Story architect | Tidak ada plot hole; level sesuai |
| **G2** | Episode beat sheet | 10 scene, fungsi tiap scene, target bahasa | Writer + pedagogy | Setiap scene punya beat + target |
| **G3** | Scene script | Teks 120–450 kata, dialog, narasi | Writer | Level check otomatis |
| **G4** | Anotasi | Romanisasi, furigana, glosarium, terjemahan | Writer + native | 100% baris teranotasi |
| **G5** | Latihan | 3–6 soal + explanation | Pedagogy | Selaras dengan scene; tidak ada answer key di DTO |
| **G5b** | Materi pendukung | Vocabulary set, grammar focus, culture note, review deck | Writer + pedagogy | Semua contoh mengutip scene; tidak ada konten generik |
| **G6** | Catatan budaya | 1 catatan + sumber | Cultural consultant | Sumber ≥1; tidak ada klaim tanpa dasar |
| **G7** | QA otomatis | Laporan coverage, romanisasi, duplikat | QA/CI | 0 error blocker |
| **G8** | Language edit | Perbaikan gaya/level | Language editor | Level check lulus |
| **G9** | Native review | Approve/needs_fix | Native reviewer | ≥90% first-pass |
| **G10** | Cultural review | Approve/block | Cultural consultant | 0 isu P0 |
| **G11** | Pedagogy review | Approve | Pedagogy | Latihan selaras |
| **G12** | Audio | Narasi + per baris | Audio producer | Loudness, sync, transkrip |
| **G13** | Publish | Scene published + manifest | Content ops | Semua gate di atas |

### 13.3 Kebijakan AI

**Diizinkan (offline):**

- Brainstorming ide, nama tokoh, konflik.
- Draft awal scene dan dialog.
- Saran glosarium, romanisasi awal, variasi latihan.
- Terjemahan draft untuk `id`/`en`/`ja`.
- Pemeriksaan konsistensi (nama, tanggal, lokasi).

**Tidak diizinkan:**

- Menerbitkan teks AI tanpa edit manusia.
- Membuat klaim budaya tanpa sumber dan review.
- Menghasilkan romanisasi final tanpa review native.
- Meniru gaya penulis hidup atau menyalin teks berhak cipta.
- Menghasilkan konten saat runtime learner.

**Provenance:** setiap scene menyimpan `aiAssisted` (boolean), model, dan tanggal; reviewer dapat melihatnya. Publik dapat menampilkan "dibuat dengan bantuan AI, direview manusia" di halaman about.

### 13.4 Checklist QA

**Konten**
- [ ] Scene punya hook, komplikasi, turn, cliffhanger.
- [ ] Panjang 120–450 kata; 6–12 baris.
- [ ] 4–20 kata baru sesuai level; 25–40% kata ulang dari 3 scene sebelumnya.
- [ ] 1–2 target grammar muncul ≥2×.
- [ ] Tidak ada spoiler arc di recap.

**Bahasa & romanisasi**
- [ ] 100% baris `ja`/`zh` punya romanisasi.
- [ ] Partikel `wa/e/o` benar; pinyin bernada benar.
- [ ] Nama diri, menu, istilah budaya masuk whitelist.
- [ ] Tidak ada kalimat yang secara tata bahasa benar tetapi tidak natural.

**Budaya**
- [ ] Detail dapat diverifikasi; sumber tercatat.
- [ ] Tidak ada stereotip/eksotisasi.
- [ ] Tokoh lokal punya agensi.
- [ ] Topik sensitif ditangani + content warning.

**Pedagogi**
- [ ] Latihan menguji pemahaman, bukan hafalan definisi.
- [ ] Explanation mengutip cerita.
- [ ] Tidak ada answer key di DTO.
- [ ] Audio transkrip tersedia.

**Aksesibilitas**
- [ ] Kontras, font size, keyboard, screen reader.
- [ ] Furigana tidak dibaca ganda.
- [ ] RTL untuk `ar` benar.

### 13.5 Metrik kualitas konten

| Metrik | Target |
|---|---|
| First-pass native approval | ≥ 90% |
| Cacat romanisasi (audit) | < 0,5% baris |
| Cacat terjemahan (audit) | < 1% baris |
| Catatan budaya tanpa sumber | 0 |
| Isu budaya P0 terbuka | 0 |
| Waktu review (median) | < 5 hari kerja |
| Scene direvisi setelah publish | < 2% per kuartal |
| Biaya produksi/scene | < $35 all-in (pilot), turun 30% di skala |

### 13.6 Tooling

- Sumber authoring: `content/stories/{lang}/{world}/...json` (Git LFS).
- Skema Zod: `content/schema/story.ts`; validasi ID, level, romanisasi, token, latihan.
- CLI: `content:validate`, `content:import`, `content:report`, `content:audit`.
- Review dashboard: daftar scene per status, filter bahasa/level, diff versi, tombol approve/block.
- CI: schema, counts, duplicate, romanisasi, coverage, audio existence, forbidden content.
- Import idempoten; publish atomik; rollback per release.
- Manifest per bahasa: jumlah published, per level, backlog review.

### 13.7 Lokalisasi penjelasan

- Rilis awal: `id`, `en`, `ja`.
- Terjemahan meaning-for-meaning; istilah budaya diberi glosarium.
- Translation memory + glossary per bahasa; konsistensi nama tokoh.
- Locale lain fallback `en` dengan notice; tidak ada fallback diam-diam.
- Explanation untuk latihan juga diterjemahkan; answer key tetap server-only.

### 13.8 Audio

- Voice actor native untuk pilot dan T1–T3; TTS untuk T4–T5 dengan review.
- Kecepatan: T1 0,8×; T2 0,9×; T3+ 1,0×; audio per baris + scene.
- Loudness: -16 LUFS stereo; noise floor < -50 dB.
- Pronunciation guide per scene (nama, istilah budaya).
- Timestamp per baris; transkrip wajib.
- Retake jika < 98% akurat atau intonasi menyesatkan.

### 13.9 Legal dan IP

- Cerita original; tidak menyalin novel/film/cerita rakyat berhak cipta.
- Folklore public domain diverifikasi per negara; adaptasi diberi atribusi.
- Musik/ambience berlisensi; hindari musik tradisional yang dianggap sakral tanpa izin.
- Merek JLPT/HSK/CEFR dipakai deskriptif; disclaimer "tidak berafiliasi".
- AI disclosure sesuai kebijakan platform.
- Kontrak writer/konsultan mencakup hak cipta dan moral rights.

### 13.10 Versioning dan retirement

- Setiap publish membuat `ContentRelease` per bahasa.
- Scene berubah → versi baru; versi lama tetap untuk learner yang sudah memulai.
- Scene retired → tidak muncul di katalog, tetapi progres tetap.
- Audit 2% scene per bulan; temuan P0 menarik scene dari katalog sampai diperbaiki.

---

## 14. Metrik, Eksperimen, dan Target

### 14.1 North Star

**Weekly Story Minutes per Weekly Active Learner (WSM/WAU)** — total menit scene yang diselesaikan, dibagi WAU. Metrik ini menggabungkan kedalaman (menit) dan retensi (kembali minggu depan), tanpa memberi insentif pada sesi kosong.

Metrik pendamping:

- **Scenes completed per WAU** (kedalaman).
- **Episode completion rate** (kualitas cerita).
- **Next-scene rate** (kekuatan cliffhanger).
- **30-day vocabulary retention** (hasil belajar).

> Metrik di bawah memakai **scene inti** sebagai unit pengalaman. Materi pendukung diukur terpisah: completion vocabulary set, grammar focus, culture note, dan review deck; volume-nya dilaporkan bersama total materi.

### 14.2 Funnel

| Tahap | Definisi | Target pilot |
|---|---|---|
| Story home view | Membuka `/stories` | — |
| Scene start | Membuka scene pertama | ≥ 60% dari home view |
| Scene complete | Menyelesaikan scene + checkpoint | 65–70% dari scene start |
| Next scene | Membuka scene berikutnya | 50–55% dari scene complete |
| Episode complete | Menyelesaikan 10 scene | ≥ 25% dari scene start |
| Day-7 return | Kembali dalam 7 hari | +5–8 pp vs baseline |
| Day-30 return | Kembali dalam 30 hari | +3–5 pp vs baseline |

### 14.3 Metrik belajar

| Metrik | Definisi | Target |
|---|---|---|
| Checkpoint accuracy | Rata-rata benar | 65–80% (zona challenge) |
| Vocabulary retention 7d | Benar di review 7 hari | ≥ 75% |
| Vocabulary retention 30d | Benar di review 30 hari | +10 pp vs bank soal |
| Level progression | Scene level naik | 1 level / 8–12 minggu |
| Grammar in context | Benar pada item grammar target | ≥ 70% |
| Listening comprehension | Benar pada item audio | ≥ 70% |
| Self-reported confidence | Survei 1–5 | ≥ 4,0 |

### 14.4 Metrik kualitas

| Metrik | Target |
|---|---|
| Scene flag rate | < 2% scene |
| Romanisasi defect | < 0,5% baris |
| Cultural complaint P0 | 0 |
| First-pass native approval | ≥ 90% |
| Audio sync error | < 1% baris |
| Reader crash-free sessions | ≥ 99,5% |

### 14.5 Guardrail

| Guardrail | Ambang | Aksi jika dilanggar |
|---|---|---|
| Sesi > 60 menit | < 5% sesi | Audit engagement; kurangi autoplay |
| Late-night (23.00–05.00) | < 10% sesi | Nudge "lanjut besok" |
| Self-reported regret | < 10% | Tinjau mekanik |
| Streak loss → churn | Tidak naik | Freeze/repair |
| Accessibility complaint | 0 P1 | Perbaiki sebelum rilis |
| Konten sensitif tanpa warning | 0 | Retire scene |

### 14.6 Target pilot (hipotesis)

| Metrik | Baseline | Target pilot | Catatan |
|---|---|---|---|
| Median session length | Ukur di Phase 0 | **12–18 menit** | Naik dari sesi bank soal |
| Scenes/week (median WAU) | — | **4–6** | 2–3 sesi × 2 scene |
| Episode completion | — | **≥ 25%** | Episode 10 scene |
| Next-scene rate | — | **50–55%** | Kekuatan cliffhanger |
| D7 retention | Ukur | **+5–8 pp** | Vs baseline |
| D30 retention | Ukur | **+3–5 pp** | Vs baseline |
| Audio usage | — | **≥ 30% scene** | Bukan hanya teks |
| Romanisasi off di T3 | — | **≥ 50% learner** | Indikasi kemandirian aksara |

Baseline **wajib diukur di Phase 0**; angka di atas adalah hipotesis, bukan janji.

### 14.7 Eksperimen

| # | Eksperimen | Hipotesis | Metrik |
|---|---|---|---|
| E-01 | Romanisasi default on vs on-tap | Default on menaikkan completion pemula | Scene completion |
| E-02 | Cliffhanger pertanyaan vs reveal | Reveal menaikkan next-scene, tetapi bisa spoiler | Next-scene, satisfaction |
| E-03 | Daily drop pagi vs malam vs pilihan learner | Pilihan learner menaikkan open rate | Drop open |
| E-04 | Terjemahan default tampil vs on-tap | On-tap menaikkan reading skill | Checkpoint, toggle |
| E-05 | Audio autoplay vs manual | Manual menurunkan abandonment | Audio minutes |
| E-06 | Scene 3 menit vs 5 menit | 3 menit menaikkan completion | Completion |
| E-07 | Pilihan tiap 3 vs 5 scene | 3 scene menaikkan agensi, tapi biaya | Choice engagement |
| E-08 | Recap teks vs audio | Audio menaikkan return commuter | D7 |
| E-09 | Streak freeze framing | Framing "istirahat" menurunkan churn | Streak churn |
| E-10 | Placement via cerita vs kuis | Cerita menaikkan completion onboarding | Onboarding completion |

### 14.8 Event analytics

`story_home_view`, `story_start`, `scene_start`, `line_reveal`, `gloss_open`, `romanization_toggle`, `audio_play`, `checkpoint_start`, `attempt_submit`, `checkpoint_complete`, `scene_complete`, `choice_select`, `next_scene_click`, `episode_complete`, `drop_open`, `passport_stamp`, `reader_settings_change`, `story_flag`.

Properti: `language`, `level`, `worldId`, `arcId`, `episodeId`, `sceneId`, `lineId`, `position`, `minutes`, `romanizationOn`, `furiganaOn`, `translationOn`, `explanationLocale`, `device`, `appVersion`. Tidak ada PII, tidak ada teks jawaban bebas.

### 14.9 Baseline dan metode

- Phase 0: instrumentasi bank soal yang ada; ukur session length, completion, D7/D30.
- Pilot: cohort 500–1.000 learner per bahasa; A/B untuk 2–3 eksperimen prioritas.
- Analisis: intention-to-treat; segmentasi level; kontrol untuk hari dalam minggu.
- Kualitas: audit 2% scene/bulan; inter-rater reliability reviewer.
- Keputusan go/no-go: metrik utama + guardrail, bukan hanya retensi.

---

## 15. Roadmap, Tim, dan Biaya

### 15.1 Fase

| Fase | Durasi | Fokus | Output | Exit criteria |
|---|---|---|---|---|
| **0 — Discovery** | 6 minggu | Bible 4 bahasa, reader prototype, baseline, QA romanisasi | 40 scene + 160 pendukung = 200 materi | 50 learner uji; romanisasi defect < 2%; keputusan go/no-go |
| **1 — Pilot** | 12 minggu | 1 arc/bahasa pilot; audio; checkpoint; analytics | 800 scene + 3.200 pendukung = 4.000 materi | Scene completion ≥ 65%; next-scene ≥ 50%; D7 +3 pp; 0 isu P0 |
| **2 — Launch** | 2 kuartal | 5 arc/bahasa; passport, pilihan, audio drama; rilis publik | 4.000 scene + 16.000 pendukung = 20.000 materi | Scene completion ≥ 70%; next-scene ≥ 55%; D7 +8 pp; D30 +5 pp |
| **3 — Growth** | 12 bulan | 4 bahasa pilot ke 2.000 scene; 9 bahasa lain mulai 500 scene | 12.500 scene + 50.000 pendukung = 62.500 materi | Throughput ≥ 6 scene/person-week; biaya/scene turun 30% |
| **4 — Full library** | 30 bulan | 9 bahasa lain ke 2.000 scene; audio penuh; sertifikasi internal | 13.500 scene + 54.000 pendukung = 67.500 materi | 10.000 materi/bahasa; 0 P0; audit lulus |

Total: 26.000 scene inti + 104.000 materi pendukung = **130.000 materi**.

### 15.2 Tim

| Fungsi | Pilot | Launch | Full |
|---|---:|---:|---:|
| Product / content PM | 2 | 3 | 4 |
| Story architect | 2 | 3 | 5 |
| Writer | 6 | 12 | 20 |
| Language editor | 3 | 5 | 7 |
| Native reviewer | 4 (kontrak) | 8 | 10 |
| Cultural consultant | 4 (kontrak) | 8 | 13 (paruh waktu) |
| Pedagogy reviewer | 1 | 2 | 3 |
| Audio producer | 1 | 2 | 3 |
| QA | 1 | 3 | 5 |
| Engineering | 4 | 5 | 6 |
| Design | 1 | 2 | 2 |
| Data analyst | 1 | 1 | 2 |
| Legal / IP | 0,5 | 1 | 1 |

**Total headcount:** ±30 di pilot, ±50 saat launch, ±80 di full library (termasuk kontraktor dan konsultan paruh waktu). **FTE efektif:** ±15, ±30, ±50.

### 15.3 Model biaya

Asumsi:

- Scene: 3–4 jam all-in (draft, edit, review, anotasi, QA) × $25–35/jam = **$70–110/scene**.
- Materi pendukung: 0,4–0,6 jam × $20–30/jam = **$8–15/materi**.
- Audio: **$40–80/scene** (voice actor + editing); TTS lebih murah tetapi perlu review.
- Tech/ops: **$0,6–1 juta/tahun**.

| Fase | Scene | Pendukung | Konten | Audio | Tech/ops | Total kisaran |
|---|---:|---:|---:|---:|---:|---:|
| 0 | 40 | 160 | $5–10k | $3–5k | $200–300k | **$210–315k** |
| 1 | 800 | 3.200 | $80–140k | $40–60k | $250–350k | **$370–550k** |
| 2 | 4.000 | 16.000 | $400–700k | $200–300k | $500–700k | **$1,1–1,7M** |
| 3 | 12.500 | 50.000 | $1,25–2,1M | $600–900k | $700k–1,0M | **$2,55–4,0M** |
| 4 | 13.500 | 54.000 | $1,35–2,3M | $650–950k | $700k–1,0M | **$2,7–4,25M** |

**Total program 4–5 tahun: ±$7–11 juta** (konten + audio + tech; belum termasuk tim produk/design/engineering yang sudah ada). Dengan overhead 20–30%, anggaran program **±$8,5–14 juta**. Angka ini adalah **perencanaan**, bukan komitmen; pilot harus memvalidasi biaya/scene sebelum skala.

**Cara menekan biaya tanpa menurunkan kualitas:**

1. AI-assisted drafting (30–40% lebih cepat) + human edit.
2. TTS untuk T4–T5 dengan review, voice actor untuk T1–T3.
3. Template materi pendukung (vocab/grammar/review) yang diisi dari scene, bukan ditulis dari nol.
4. Pipeline review terpusat; reviewer bekerja per bahasa, bukan per scene.
5. "Season order" — produksi 200 scene per season, bukan tersebar.
6. Kontrak jangka panjang dengan writer/konsultan untuk menurunkan biaya per scene.

### 15.4 Throughput

- 1 writer full-time ≈ 400–550 scene/tahun (3–4 jam/scene) atau 700–800 dengan AI assist.
- 2.000 scene/bahasa ≈ 4–5 writer-years; 13 bahasa ≈ 52–65 writer-years.
- 8.000 materi pendukung/bahasa ≈ 2–3 person-years (templated + review); 13 bahasa ≈ 26–39 person-years.
- Total ±78–104 person-years; dalam 4–5 tahun = **±16–22 FTE rata-rata**, dengan puncak **±40–50 FTE**.
- Pilot harus mengukur actual throughput; jika < 8 scene/person-week, target full library tidak realistis tanpa menambah tim.

### 15.5 Dependensi

- FS-09 schema + pipeline siap (saat ini draft).
- Registry `zh` + font + TTS + framework HSK.
- Reader/design system `--learn-*`.
- Audio vendor + voice talent.
- Legal review untuk budaya, folklore, dan klaim ujian.
- Analytics + eksperimen baseline.

### 15.6 Go/no-go

**Lanjut ke Launch jika:**

- Scene completion ≥ 65%, next-scene ≥ 50%.
- Romanisasi defect < 1% dan 0 isu budaya P0.
- Biaya/scene ≤ $90 dan throughput ≥ 8 scene/person-week.
- Session length naik tanpa melanggar guardrail.

**Berhenti atau pivot jika:**

- Setelah 2 iterasi, next-scene < 35% dan D7 tidak bergerak.
- Biaya/scene > $120 tanpa jalur turun.
- Isu budaya P0 berulang atau reviewer tidak tersedia.
- Engagement hanya naik karena mekanik manipulatif.

---

## 16. Risiko dan Mitigasi

| # | Risiko | Likelihood | Dampak | Mitigasi | Owner |
|---|---|---|---|---|---|
| R-01 | Volume menurunkan kualitas | Tinggi | Tinggi | Gate publish, audit 2%, tidak ada placeholder | Content |
| R-02 | Stereotip/kesalahan budaya | Sedang | Tinggi | Konsultan, rubrik, sumber, kill switch | Cultural |
| R-03 | Romanisasi salah | Tinggi | Sedang | QA otomatis, native review, whitelist | Language |
| R-04 | Biaya membengkak | Tinggi | Tinggi | Pilot, unit economics, TTS, season order | Finance/Product |
| R-05 | Penulis langka | Tinggi | Sedang | Pipeline, training, AI assist, kontrak | Content |
| R-06 | Cerita membosankan | Sedang | Tinggi | Story architect, anthology, uji naskah | Story |
| R-07 | IP/lisensi | Rendah | Tinggi | Original, legal review, atribusi | Legal |
| R-08 | Konten sensitif | Sedang | Tinggi | Rating 13+, warning, moderasi | Trust & Safety |
| R-09 | Engagement tidak etis | Sedang | Sedang | Guardrail, audit, no dark patterns | Product |
| R-10 | Performa teknis | Sedang | Sedang | Payload budget, CDN, prefetch | Engineering |
| R-11 | Retensi tidak naik | Sedang | Tinggi | Eksperimen, kill criteria, wawancara | Product/Data |
| R-12 | Reviewer burnout | Sedang | Sedang | SLA, rotasi, tooling, bayar layak | Content Ops |
| R-13 | Klaim ujian | Rendah | Tinggi | Disclaimer, bukan soal resmi | Legal |
| R-14 | Font/RTL rusak | Sedang | Sedang | Font stack, QA per bahasa, a11y | Design/Eng |

---

## 17. Acceptance Criteria

### 17.1 Konten

- [ ] 10.000 materi **published** per bahasa (2.000 scene + 8.000 pendukung; 13 bahasa = 130.000) pada full library.
- [ ] 5.000 materi/bahasa (1.000 scene + 4.000 pendukung) sebagai gate launch.
- [ ] 100% scene punya review bahasa, native, budaya, dan pedagogi.
- [ ] 100% scene punya 4 materi pendukung published (vocabulary, grammar, culture, review).
- [ ] 0 scene placeholder; 0 `answerKey` di DTO learner.
- [ ] 100% scene punya audio narasi; 100% T1–T3 punya audio per baris.
- [ ] 100% catatan budaya punya minimal 1 sumber.
- [ ] Setiap scene punya 3–6 latihan dan 1 cliffhanger.
- [ ] Setiap arc punya 20 episode; setiap episode 10 scene.

### 17.2 Romanisasi

- [ ] 100% baris `ja` punya romaji (Hepburn) dan 100% baris `zh` punya pinyin bernada.
- [ ] Romanisasi tampil default untuk `ja`/`zh`; toggle tersimpan per bahasa.
- [ ] Furigana tersedia untuk `ja`; on-demand di T3+.
- [ ] Partikel `wa/e/o` benar; pinyin `ü`, nada, dan sandhi 一/不 benar.
- [ ] Cacat romanisasi < 0,5% baris dalam audit; 0 pada nama diri/istilah budaya.
- [ ] Screen reader tidak membaca furigana ganda.

### 17.3 Reader dan UX

- [ ] Resume ke baris terakhir setelah refresh/ganti perangkat.
- [ ] Tap kata menampilkan reading, romanisasi, arti, dan tombol review.
- [ ] Audio per baris dan per scene; kecepatan 0,75/1,0/1,25.
- [ ] Mode fokus menyembunyikan romanisasi + terjemahan tanpa menghilangkan aksara.
- [ ] Loading, error, empty, offline, dan audio gagal punya state jelas.
- [ ] Tidak ada autoplay ke scene berikutnya.

### 17.4 Engagement

- [ ] Daily drop, recap, pilihan, passport, dan kartu tokoh berfungsi.
- [ ] Streak freeze 2×/bulan; repair dengan review.
- [ ] Prompt istirahat setelah 25 menit; batas harian opsional.
- [ ] Tidak ada pay-to-continue atau cliffhanger yang dikunci.
- [ ] Content warning untuk topik sensitif.

### 17.5 API dan data

- [ ] `GET /api/v1/scenes/:id` tidak memuat answer key.
- [ ] `POST /api/v1/story-progress` idempoten; XP tidak ganda.
- [ ] Progres per bahasa terpisah; ganti bahasa tidak menimpa.
- [ ] Published scene immutable; versi baru tidak menghapus progres.
- [ ] p95 latency scene < 1,5 s; payload < 120 KB gzip.

### 17.6 Aksesibilitas

- [ ] WCAG 2.2 AA untuk reader.
- [ ] Font scaling 200% tanpa kehilangan konten.
- [ ] Keyboard dan screen reader lulus uji.
- [ ] Kontras 4,5:1; target 44×44 px.
- [ ] RTL `ar` benar; CJK line-height 1,75–1,9.

### 17.7 Metrik

- [ ] Baseline D7/D30/session length tercatat di Phase 0.
- [ ] Pilot mencapai minimal 3 dari 4 target utama.
- [ ] Guardrail tidak dilanggar.
- [ ] Audit kualitas 2% scene/bulan berjalan.

---

## 18. Pertanyaan Terbuka

1. Apakah "materi" yang diminta benar-benar **10.000 story learning object** (2.000 scene + 8.000 pendukung), atau 10.000 scene? Rekomendasi yang pertama; jika 10.000 scene, biaya/waktu ±3× dan beban kosakata per level harus dirombak.
2. Apakah Mandarin masuk sebagai bahasa ke-13 resmi, termasuk UI locale `zh`, atau hanya content language dengan UI `id`/`en`?
3. Apakah target 10.000 materi/bahasa adalah gate rilis atau target library jangka panjang? Rekomendasi: gate launch 5.000 materi (1.000 scene), full 10.000.
4. HSK 2.0 (6 level) atau HSK 3.0 (9 level) untuk Mandarin?
5. Varietas bahasa mana yang menjadi standar untuk `en`, `es`, `pt`, dan `ar`? Apakah varian kedua masuk scope?
6. Apakah audio T4–T5 boleh TTS, atau semua level wajib voice actor?
7. Apakah bank soal lama (10.500/bahasa) dipertahankan sebagai lapisan latihan, atau dimigrasikan ke dalam scene?
8. Apakah penjelasan bahasa Indonesia dan Inggris wajib untuk semua scene, atau hanya level pemula?
9. Bagaimana monetisasi? Apakah season pertama gratis dan sisanya berlangganan, tanpa mengunci cliffhanger?
10. Apakah fitur sosial (book club, diskusi) masuk roadmap, atau tetap privat?
11. Apakah konten cerita rakyat public domain boleh diadaptasi, dan bagaimana atribusinya?
12. Siapa pemilik keputusan akhir untuk isu budaya P0 — konsultan, legal, atau product?

---

## Appendix A — Sample Materi Jepang (JLPT N5)

### A.1 Metadata

| Field | Nilai |
|---|---|
| Bahasa | Jepang (`ja`), JLPT N5 |
| Dunia | こもれび (Komorebi) |
| Arc | N5, "Buku Catatan Merah" |
| Episode | 1 — はじめての朝 (Hajimete no Asa / Pagi Pertama) |
| Scene | 1–3 — 仙台駅 / いつもの / 祖母の字 (sample) |
| Durasi | ±4 menit |
| Kata baru | 12 target + 6 pendukung |
| Grammar | 〜に着く; 〜ています; 〜が分かりません |
| Romanisasi | Modified Hepburn |

### A.2 Scene 1 — 仙台駅

**1.** 仙台駅に着きました。夏の風が暑いです。  
*Sendai-eki ni tsukimashita. Natsu no kaze ga atsui desu.*  
Aku sudah sampai di Stasiun Sendai. Angin musim panasnya panas.

**2.** 葵は大きいかばんを持っています。かばんの中に、東京の大学の本があります。  
*Aoi wa ōkii kaban o motte imasu. Kaban no naka ni, Tōkyō no daigaku no hon ga arimasu.*  
Aoi membawa tas besar. Di dalam tas ada buku dari universitas di Tokyo.

**3.** 祖母の店は、駅から歩いて十五分です。  
*Sobo no mise wa, eki kara aruite jūgo-fun desu.*  
Toko neneknya berjarak lima belas menit jalan kaki dari stasiun.

**4.** 店の名前は「こもれび」です。小さい店ですが、とても古いです。  
*Mise no namae wa "Komorebi" desu. Chiisai mise desu ga, totemo furui desu.*  
Nama tokonya "Komorebi". Tokonya kecil, tetapi sangat tua.

**5.** 店の前に、祖母の友だちがいます。田中さんです。  
*Mise no mae ni, sobo no tomodachi ga imasu. Tanaka-san desu.*  
Di depan toko ada teman nenek. Namanya Tanaka.

**6.** 「あおいちゃん、久しぶり！おばあちゃんは入院していますね。」  
*"Aoi-chan, hisashiburi! Obāchan wa nyūin shite imasu ne."*  
"Aoi, sudah lama tak bertemu! Nenekmu sedang dirawat di rumah sakit, ya."

**7.** 「はい。だから、夏のあいだ、店を手伝います。」  
*"Hai. Dakara, natsu no aida, mise o tetsudaimasu."*  
"Iya. Karena itu, selama musim panas aku akan membantu di toko."

**8.** 田中さんは笑いました。「いいね。じゃあ、明日の朝、常連さんが来るよ。佐藤さんだ。よろしくね。」  
*Tanaka-san wa waraimashita. "Ii ne. Jā, ashita no asa, jōren-san ga kuru yo. Satō-san da. Yoroshiku ne."*  
Tanaka tersenyum. "Bagus. Kalau begitu, besok pagi akan ada pelanggan tetap. Namanya Sato. Tolong ditangani, ya."

### A.3 Scene 2 — いつもの

**1.** 次の朝、葵は六時に店を開けました。  
*Tsugi no asa, Aoi wa roku-ji ni mise o akemashita.*  
Pagi berikutnya, Aoi membuka toko pukul enam.

**2.** 店の中は、コーヒーのいいにおいがします。  
*Mise no naka wa, kōhī no ii nioi ga shimasu.*  
Di dalam toko tercium aroma kopi yang harum.

**3.** 葵はエプロンを着て、おしぼりを出しました。  
*Aoi wa epuron o kite, oshibori o dashimashita.*  
Aoi mengenakan celemek dan mengeluarkan handuk basah.

**4.** 八時ごろ、一人のおじいさんが来ました。白いシャツを着ています。  
*Hachi-ji goro, hitori no ojīsan ga kimashita. Shiroi shatsu o kite imasu.*  
Sekitar pukul delapan, seorang kakek datang. Ia memakai kemeja putih.

**5.** 「いらっしゃいませ。」  
*"Irasshaimase."*  
"Selamat datang."

**6.** 「いつもの。」  
*"Itsumo no."*  
"Yang biasa."

**7.** 葵は困りました。「いつもの」が分かりません。  
*Aoi wa komarimashita. "Itsumo no" ga wakarimasen.*  
Aoi bingung. Ia tidak tahu apa itu "yang biasa".

**8.** 佐藤さんは、にこにこしています。  
*Satō-san wa, nikoniko shite imasu.*  
Sato tersenyum-senyum.

**9.** そのとき、葵はカウンターの下に、赤いノートを見つけました。  
*Sono toki, Aoi wa kauntā no shita ni, akai nōto o mitsukemashita.*  
Saat itu, Aoi menemukan buku catatan merah di bawah meja kasir.

### A.4 Scene 3 — 祖母の字

**1.** ノートには、祖母の字で、お客さんの名前と飲み物が書いてありました。  
*Nōto ni wa, sobo no ji de, okyaku-san no namae to nomimono ga kaite arimashita.*  
Di buku itu, dengan tulisan tangan nenek, tercatat nama pelanggan dan minuman.

**2.** 「佐藤さん：アイスコーヒー、ミルク少し、砂糖なし。ずんだ餅を一つ。」  
*"Satō-san: aisu kōhī, miruku sukoshi, satō nashi. Zunda mochi o hitotsu."*  
"Sato: kopi dingin, sedikit susu, tanpa gula. Satu zunda mochi."

**3.** 葵は冷蔵庫から、祖母の作ったずんだを取り出しました。  
*Aoi wa reizōko kara, sobo no tsukutta zunda o toridashimashita.*  
Aoi mengeluarkan zunda buatan nenek dari kulkas.

**4.** 枝豆の緑が、とてもきれいです。  
*Edamame no midori ga, totemo kirei desu.*  
Hijau edamame-nya sangat indah.

**5.** 葵は一生懸命に、ずんだ餅を作りました。  
*Aoi wa isshōkenmei ni, zunda mochi o tsukurimashita.*  
Aoi membuat zunda mochi dengan sekuat tenaga.

**6.** 「お待たせしました。アイスコーヒーと、ずんだ餅です。」  
*"Omatase shimashita. Aisu kōhī to, zunda mochi desu."*  
"Maaf membuat menunggu. Ini kopi dingin dan zunda mochi."

**7.** 佐藤さんは一口飲んで、にっこりしました。  
*Satō-san wa hitokuchi nonde, nikkori shimashita.*  
Sato meneguk satu teguk dan tersenyum.

**8.** 「うん。おばあちゃんと同じ味だ。」  
*"Un. Obāchan to onaji aji da."*  
"Hmm. Rasanya sama seperti buatan nenek."

**9.** 葵は、ちょっと嬉しくなりました。  
*Aoi wa, chotto ureshiku narimashita.*  
Aoi merasa sedikit senang.

**10.** そのとき、店の電話が鳴りました。  
*Sono toki, mise no denwa ga narimashita.*  
Saat itu, telepon toko berdering.

### A.5 Kosakata

| Kanji | Kana | Romaji | Arti |
|---|---|---|---|
| 駅 | えき | eki | stasiun |
| 着く | つく | tsuku | tiba |
| 暑い | あつい | atsui | panas (cuaca) |
| 祖母 | そぼ | sobo | nenek |
| 店 | みせ | mise | toko |
| 歩く | あるく | aruku | berjalan |
| 入院 | にゅういん | nyūin | dirawat di rumah sakit |
| 手伝う | てつだう | tetsudau | membantu |
| 常連 | じょうれん | jōren | pelanggan tetap |
| 開ける | あける | akeru | membuka |
| 匂い | におい | nioi | aroma |
| 困る | こまる | komaru | bingung, kesulitan |
| 見つける | みつける | mitsukeru | menemukan |
| 砂糖 | さとう | satō | gula |
| 冷蔵庫 | れいぞうこ | reizōko | kulkas |
| 枝豆 | えだまめ | edamame | edamame |
| 一口 | ひとくち | hitokuchi | satu teguk |
| 嬉しい | うれしい | ureshii | senang |

### A.6 Grammar

| Pola | Arti | Contoh | Catatan |
|---|---|---|---|
| 〜に着く | tiba di | 駅に着きました | Partikel に untuk titik tiba |
| 〜ています | sedang / keadaan | 入院しています; 着ています | Bisa progresif atau state |
| 〜が分かりません | tidak mengerti | 「いつもの」が分かりません | Objek 分かる memakai が |
| 〜てあります | sudah dalam keadaan | 書いてありました | N4; hasil tindakan yang tersisa |
| 〜てください | mohon lakukan | ゆっくり話してください | Sopan, dipakai di scene berikutnya |

### A.7 Catatan budaya — Kissaten

Kissaten (喫茶店) adalah kedai kopi tradisional Jepang: interior retro, kursi kayu, cangkir tebal, dan pelanggan tetap yang datang pada jam yang sama. Berbeda dari kafe modern, kissaten sering dikelola satu keluarga, menyajikan "morning set" (roti, telur, kopi) dan "itsumo no" — pesanan yang tidak perlu diucapkan lagi.

Di Sendai, zunda mochi (餅 dengan pasta edamame manis) adalah camilan khas musim panas. Festival Tanabata Sendai (6–8 Agustus) menghiasi jalan dengan dekorasi kertas besar; dalam cerita, festival ini menjadi latar episode 10.

*Sumber: wawancara dengan pemilik kissaten di Sendai; materi pariwisata kota; artikel budaya makanan Miyagi. Semua detail fiksi (nama kedai, jalan) ditandai.*

### A.8 Latihan

1. **Pemahaman:** 葵はなぜ仙台に来ましたか。
   - a. 大学の試験のため
   - b. 祖母の店を手伝うため
   - c. 友だちに会うため
2. **Kosakata:** 「いつもの」は何ですか。
   - a. ホットコーヒーとケーキ
   - b. アイスコーヒー（ミルク少し、砂糖なし）とずんだ餅
   - c. 紅茶とサンドイッチ
3. **Grammar:** 駅（ ）歩いて十五分です。
   - a. から / b. まで / c. を / d. が
4. **Grammar:** おばあちゃんは入院（ ）います。
5. **Romanisasi:** 次の言葉の romaji を書いてください：砂糖、常連、ずんだ餅。
6. **Inferensi:** 佐藤さんはなぜ「同じ味だ」と言いましたか。
7. **Budaya:** 喫茶店とカフェの違いを一つ説明してください。
8. **Urutan:** 出来事を正しい順番に並べてください：佐藤さんが来る / 葵が店を開ける / 葵がノートを見つける / 田中さんに会う。

> **Kunci (server-only):** 1-b, 2-b, 3-a, 4-して, 5-satō / jōren / zunda mochi, 6-karena rasanya mengingatkan pada neneknya / sama seperti buatan nenek, 7-jawaban bebas (retro, pelanggan tetap, morning set), 8-Tanaka → buka toko → Sato datang → temukan notebook.

### A.9 Outline episode 1 (10 scene)

| # | Scene | Fungsi |
|---|---|---|
| 1 | 仙台駅 | Perkenalan Aoi, latar, tiba |
| 2 | こもれびの前 | Konflik: nenek dirawat; tugas Aoi |
| 3 | 開店 | Rutinitas kedai; oshibori, kopi |
| 4 | いつもの | Hook: pesanan tanpa nama |
| 5 | 赤いノート | Petunjuk pertama |
| 6 | 祖母の字 | Konteks: pesanan Sato |
| 7 | ずんだ餅 | Aksi: Aoi membuat |
| 8 | 佐藤さんの話 | Emosi: kenangan, penerimaan |
| 9 | 八日のページ | Misteri baru: nama tak dikenal |
| 10 | 七夕の笹 | Cliffhanger: perempuan berbaju biru |

---

## Appendix B — Sample Materi Mandarin (HSK 1–2)

### B.1 Metadata

| Field | Nilai |
|---|---|
| Bahasa | Mandarin (`zh`), HSK 1–2 |
| Dunia | 茉莉 (Mòlì) |
| Arc | T1, "一九八五年的茶" |
| Episode | 1 — 元宵节 (Yuánxiāojié / Festival Lampion) |
| Scene | 1–3 — 胡同里的茶馆 / 陈爷爷 / 一九八五 (sample) |
| Durasi | ±4 menit |
| Kata baru | 12 target + 7 pendukung |
| Grammar | 了; 着; 还是; 好像 |
| Romanisasi | Hanyu Pinyin dengan tanda nada |

### B.2 Scene 1 — 胡同里的茶馆

**1.** 腊月二十八，林小雨坐高铁到了北京。  
*Làyuè èrshíbā, Lín Xiǎoyǔ zuò gāotiě dào le Běijīng.*  
Pada tanggal 28 bulan ke-12 (Imlek), Lin Xiaoyu tiba di Beijing dengan kereta cepat.

**2.** 天很冷，胡同里却很热闹。  
*Tiān hěn lěng, hútòng lǐ què hěn rènao.*  
Udara sangat dingin, tetapi hutong sangat ramai.

**3.** 奶奶的茶馆叫“茉莉”，在胡同的最里面。  
*Nǎinai de cháguǎn jiào "Mòlì", zài hútòng de zuì lǐmiàn.*  
Tea house nenek bernama "Moli", letaknya paling dalam di hutong.

**4.** 门口挂着两个红灯笼，门上贴着红纸。  
*Ménkǒu guàzhe liǎng gè hóng dēnglong, mén shàng tiēzhe hóng zhǐ.*  
Di depan pintu tergantung dua lampion merah; di pintu ditempel kertas merah.

**5.** 小雨推开门，闻到茉莉花茶的香味。  
*Xiǎoyǔ tuīkāi mén, wéndào mòlì huāchá de xiāngwèi.*  
Xiaoyu mendorong pintu dan mencium aroma teh melati.

**6.** 「奶奶，我回来了！」  
*"Nǎinai, wǒ huílái le!"*  
"Nenek, aku pulang!"

**7.** 奶奶坐在窗边，笑着看她。  
*Nǎinai zuò zài chuāngbiān, xiàozhe kàn tā.*  
Nenek duduk di dekat jendela, tersenyum melihatnya.

**8.** 「小雨，你瘦了。快坐下，喝杯茶。」  
*"Xiǎoyǔ, nǐ shòu le. Kuài zuòxià, hē bēi chá."*  
"Xiaoyu, kamu kurusan. Cepat duduk, minum segelas teh."

### B.3 Scene 2 — 陈爷爷

**1.** 元宵节那天，茶馆里来了一个老人。  
*Yuánxiāojié nà tiān, cháguǎn lǐ lái le yí gè lǎorén.*  
Pada hari Festival Lampion, seorang lelaki tua datang ke tea house.

**2.** 他穿着灰色大衣，手里拿着一个旧铁盒。  
*Tā chuānzhe huīsè dàyī, shǒu lǐ názhe yí gè jiù tiěhé.*  
Ia mengenakan mantel abu-abu; di tangannya ada sebuah kotak besi tua.

**3.** “老陈来了。”奶奶说。她的声音很轻。  
*"Lǎo Chén lái le." Nǎinai shuō. Tā de shēngyīn hěn qīng.*  
"Lao Chen datang," kata nenek. Suaranya pelan.

**4.** 陈爷爷坐下，说：“还是那壶茶。”  
*Chén yéye zuòxià, shuō: "Háishì nà hú chá."*  
Kakek Chen duduk dan berkata, "Masih teh yang itu."

**5.** 小雨不明白。奶奶也不说话。  
*Xiǎoyǔ bù míngbai. Nǎinai yě bù shuōhuà.*  
Xiaoyu tidak mengerti. Nenek juga tidak bicara.

**6.** 奶奶看着窗外，好像在想什么。  
*Nǎinai kànzhe chuāngwài, hǎoxiàng zài xiǎng shénme.*  
Nenek menatap ke luar jendela, seolah memikirkan sesuatu.

**7.** 小雨看见奶奶的手在抖。  
*Xiǎoyǔ kànjiàn nǎinai de shǒu zài dǒu.*  
Xiaoyu melihat tangan nenek gemetar.

**8.** 柜台下面，有一个旧木盒。  
*Guìtái xiàmiàn, yǒu yí gè jiù mùhé.*  
Di bawah meja kasir ada sebuah kotak kayu tua.

### B.4 Scene 3 — 一九八五

**1.** 小雨打开木盒。里面有一张照片，照片后面写着一九八五。  
*Xiǎoyǔ dǎkāi mùhé. Lǐmiàn yǒu yì zhāng zhàopiàn, zhàopiàn hòumiàn xiězhe yī jiǔ bā wǔ.*  
Xiaoyu membuka kotak kayu. Di dalamnya ada sebuah foto; di belakang foto tertulis 1985.

**2.** 还有一本旧本子。本子上写着：“桂圆五颗，茉莉一小把，冰糖一块。”  
*Háiyǒu yì běn jiù běnzi. Běnzi shàng xiězhe: "Guìyuán wǔ kē, mòlì yì xiǎo bǎ, bīngtáng yí kuài."*  
Ada juga buku tua. Di buku itu tertulis: "Lima butir longan, segenggam kecil melati, satu keping gula batu."

**3.** 小雨泡了一壶茶，端到陈爷爷面前。  
*Xiǎoyǔ pào le yì hú chá, duān dào Chén yéye miànqián.*  
Xiaoyu menyeduh sepanci teh dan menyajikannya di depan Kakek Chen.

**4.** 陈爷爷喝了一口，眼睛红了。  
*Chén yéye hē le yì kǒu, yǎnjing hóng le.*  
Kakek Chen meneguk satu teguk; matanya memerah.

**5.** “是这个味道。”他说，“我和她结婚那天，喝的就是这个茶。”  
*"Shì zhège wèidào." Tā shuō, "Wǒ hé tā jiéhūn nà tiān, hē de jiùshì zhège chá."*  
"Ini rasanya," katanya. "Pada hari pernikahanku dengan dia, yang kami minum adalah teh ini."

**6.** 奶奶慢慢转过头。  
*Nǎinai mànman zhuǎnguò tóu.*  
Nenek perlahan menoleh.

**7.** “老陈，你来了。”  
*"Lǎo Chén, nǐ lái le."*  
"Lao Chen, kamu datang."

**8.** 窗外，烟花开了。  
*Chuāngwài, yānhuā kāi le.*  
Di luar jendela, kembang api mekar.

### B.5 Kosakata

| Hanzi | Pinyin | Arti |
|---|---|---|
| 高铁 | gāotiě | kereta cepat |
| 胡同 | hútòng | gang tradisional Beijing |
| 热闹 | rènao | ramai |
| 灯笼 | dēnglong | lampion |
| 茉莉花茶 | mòlì huāchá | teh melati |
| 香味 | xiāngwèi | aroma |
| 瘦 | shòu | kurus |
| 元宵节 | Yuánxiāojié | Festival Lampion |
| 铁盒 | tiěhé | kotak besi |
| 声音 | shēngyīn | suara |
| 明白 | míngbai | mengerti |
| 柜台 | guìtái | meja kasir |
| 照片 | zhàopiàn | foto |
| 桂圆 | guìyuán | longan kering |
| 冰糖 | bīngtáng | gula batu |
| 泡 | pào | menyeduh |
| 味道 | wèidào | rasa |
| 结婚 | jiéhūn | menikah |
| 烟花 | yānhuā | kembang api |

### B.6 Grammar

| Pola | Arti | Contoh | Catatan |
|---|---|---|---|
| 了 | aksi selesai / perubahan | 到了; 来了; 瘦了; 红了 | Bukan penanda lampau mutlak |
| 着 | keadaan berlanjut | 挂着; 贴着; 穿着; 笑着 | Sering dengan verba statif |
| 还是 | masih / atau | 还是那壶茶 | Di sini "masih" |
| 好像 | sepertinya | 好像在想什么 | + klausa |
| 量词 | kata bantu bilangan | 一壶茶; 一张照片; 一本本子; 五颗桂圆 | Sesuai benda |

### B.7 Catatan budaya — Hutong dan teh melati

Hutong (胡同) adalah gang tradisional Beijing dengan rumah beratap abu-abu dan halaman dalam (四合院). Di banyak hutong, tea house kecil menjadi ruang sosial: tetangga berbagi kabar, pemilik mengenal pesanan setiap pelanggan, dan Festival Lampion (元宵节, hari ke-15 bulan pertama Imlek) dirayakan dengan lampion, tangyuan, dan pasar kuil.

Teh melati (茉莉花茶) adalah teh hijau yang diberi aroma bunga melati; di Beijing, teh ini sering disajikan dalam gaiwan (盖碗). Kombinasi dengan longan kering (桂圆) memberi rasa manis alami dan dalam cerita dikaitkan dengan teh pernikahan tahun 1985.

*Sumber: wawancara dengan pemilik tea house di hutong Shichahai; buku budaya teh Beijing; materi Festival Lampion. Nama tokoh dan tea house adalah fiksi.*

### B.8 Latihan

1. **Pemahaman:** 小雨为什么回北京？
   - a. 出差
   - b. 陪奶奶过春节
   - c. 旅游
2. **Pemahaman:** 陈爷爷每年什么时候来？
   - a. 春节
   - b. 元宵节
   - c. 中秋节
3. **Kosakata:** “那壶茶”是什么茶？
   - a. 绿茶
   - b. 桂圆茉莉茶
   - c. 红茶
4. **量词:** 一（ ）茶 / 一（ ）照片 / 一（ ）本子
5. **Grammar:** 门上（ ）着红纸。 (贴 / 挂 / 放)
6. **Pinyin:** 给下列词语写拼音：胡同、桂圆、元宵节。
7. **Budaya:** 元宵节是哪一天？
8. **Inferensi:** 奶奶的手为什么在抖？
9. **Urutan:** 排列：小雨到北京 / 见到奶奶 / 陈爷爷来 / 找到木盒 / 泡茶。

> **Kunci (server-only):** 1-b, 2-b, 3-b, 4-壶/张/本, 5-贴, 6-hútòng / guìyuán / Yuánxiāojié, 7-农历正月十五, 8-karena ingatannya mulai mundur / emosi / usia, 9-小雨到北京 → 见到奶奶 → 陈爷爷来 → 找到木盒 → 泡茶.

### B.9 Outline episode 1 (10 scene)

| # | Scene | Fungsi |
|---|---|---|
| 1 | 胡同里的茶馆 | Perkenalan Xiaoyu, latar, tiba |
| 2 | 陈爷爷 | Hook: pesanan "teh yang itu" |
| 3 | 木盒 | Petunjuk: foto 1985 |
| 4 | 旧本子 | Resep: longan, melati, gula batu |
| 5 | 泡茶 | Aksi: Xiaoyu menyeduh |
| 6 | 一九八五 | Emosi: cerita pernikahan |
| 7 | 奶奶的手 | Konflik: ingatan nenek |
| 8 | 烟花 | Turn: momen hangat |
| 9 | 秘密 | Misteri: siapa yang menulis resep? |
| 10 | 元宵节之后 | Cliffhanger: nenek meminta Xiaoyu tinggal |

---

## Appendix C — Micro-sample Inggris dan Indonesia

### C.1 Inggris (CEFR A2) — The Lighthouse Postcard

Nora arrived in Marrow Bay on the last ferry of the day. The town looked smaller than she remembered: one diner, one church, and a bookstore with a sign that said CLOSED. Her aunt had left her the bookstore, a cat, and a postcard with no stamp.

The postcard was addressed to her aunt, dated 1994, and signed only "E." On the front was a photograph of the lighthouse. Nora turned it over. Someone had written: "Meet me at the light when the fog lifts."

Outside, the fog was already coming in. The cat jumped onto the counter and sat on the postcard, as if it had been waiting for her to read it.

**Catatan budaya:** Marrow Bay adalah kota fiktif di pesisir Maine. Diner, lobster roll, mercusuar, dan town meeting adalah elemen kehidupan pesisir New England; cerita memakai bahasa Inggris Amerika dan humor kering. Sumber: wawancara dengan penduduk pesisir Maine; panduan sejarah mercusuar.

### C.2 Indonesia (CEFR A2) — Pasar Subuh

Pukul empat pagi, Yogyakarta masih gelap. Sari mengikuti ibunya ke pasar, melewati gang sempit yang berbau gudeg dan kayu bakar. Lampu petromaks menyala di atas meja-meja kayu.

"Hari ini kita jual dua ratus bungkus," kata ibunya.

Sari mengangguk. Ia merapikan daun pisang, lalu melihat buku catatan lama di bawah meja. Di halaman terakhir ada sebuah utang dari tahun 1998, nama yang tidak dikenal, dan satu kalimat: "Kalau anakku besar, ajari dia memasak."

**Catatan budaya:** Pasar subuh di Yogyakarta adalah ruang ekonomi dan sosial; gudeg, angkringan, batik, dan gotong royong menjadi latar. Nama pasar dan tokoh adalah fiksi. Sumber: wawancara pedagang pasar di Yogyakarta; catatan sejarah kuliner Jawa.

---

## Appendix D — Contoh JSON Authoring

```json
{
  "id": "ja-jlpt-n5-u01-p0001",
  "contentVersion": "2026.11.1",
  "languageCode": "ja",
  "framework": "JLPT",
  "level": "N5",
  "kind": "story_scene",
  "story": {
    "worldId": "ja-komorebi",
    "arcId": "ja-jlpt-n5-u01",
    "episodeId": "ja-jlpt-n5-u01-l01",
    "sceneNo": 1,
    "title": "仙台駅",
    "titleRomanization": "Sendai-eki",
    "titleTranslation": { "id": "Stasiun Sendai", "en": "Sendai Station" },
    "estimatedMinutes": 4,
    "cliffhanger": "田中さんは、明日の朝、常連さんが来ると言いました。"
  },
  "lines": [
    {
      "id": "s01",
      "speakerId": "narrator",
      "text": "仙台駅に着きました。夏の風が暑いです。",
      "reading": "せんだいえきについてきました。なつのかぜがあついです。",
      "romanization": {
        "scheme": "hepburn",
        "value": "Sendai-eki ni tsukimashita. Natsu no kaze ga atsui desu."
      },
      "translation": {
        "id": "Aku sudah sampai di Stasiun Sendai. Angin musim panasnya panas.",
        "en": "I arrived at Sendai Station. The summer wind is hot."
      },
      "audio": "ja-jlpt-n5-u01-p0001-s01.mp3",
      "tokens": [
        {
          "surface": "仙台駅",
          "reading": "せんだいえき",
          "romanization": "Sendai-eki",
          "gloss": { "id": "Stasiun Sendai", "en": "Sendai Station" },
          "pos": "noun"
        },
        {
          "surface": "に",
          "romanization": "ni",
          "gloss": { "id": "partikel tujuan", "en": "target particle" },
          "pos": "particle"
        }
      ]
    }
  ],
  "cultureNotes": ["ja-culture-0007"],
  "exercises": [
    {
      "id": "q01",
      "type": "multiple_choice",
      "prompt": "葵はなぜ仙台に来ましたか。",
      "choices": [
        { "id": "a", "text": "祖母の店を手伝うため" },
        { "id": "b", "text": "大学の試験のため" },
        { "id": "c", "text": "友だちに会うため" }
      ],
      "answerKey": { "choiceId": "a" },
      "explanation": {
        "id": "祖母が入院しているので、夏のあいだ店を手伝います。",
        "en": "Her grandmother is in the hospital, so she helps at the shop during summer."
      }
    }
  ]
}
```

**Catatan:** `answerKey` dan `explanation` hanya ada di file authoring dan database server; API learner tidak pernah mengirimkannya sebelum submit.

---

## Appendix E — Glosarium

| Istilah | Arti |
|---|---|
| **Arc/season** | Rangkaian 20 episode dengan konflik utama; setara `Unit` |
| **Episode** | Rangkaian 10 scene; setara `Lesson` |
| **Scene/materi** | Unit belajar 3–6 menit; setara `Passage` |
| **Beat** | Perubahan emosi/aksi dalam scene (hook, komplikasi, turn) |
| **Cliffhanger** | Akhir scene yang menggantung untuk memancing kelanjutan |
| **Graded reading** | Membaca teks dengan 95–98% kosakata yang sudah dikenal |
| **Narrow reading** | Membaca banyak teks dengan tokoh/topik yang sama |
| **Romanisasi** | Penulisan bahasa non-Latin dengan huruf Latin |
| **Romaji** | Romanisasi Jepang (Hepburn) |
| **Pinyin** | Romanisasi Mandarin dengan tanda nada |
| **Furigana** | Bacaan kana di atas kanji |
| **Passport** | Koleksi stempel budaya learner |
| **Placement story** | Tes penempatan berbentuk cerita, bukan kuis grammar |
| **Story bible** | Dokumen canon dunia, tokoh, latar, dan jangkar budaya |
| **ContentVersion** | Versi immutable dari scene yang dipublikasikan |

---

*Dokumen ini adalah draft. Keputusan D-01–D-15 perlu persetujuan sebelum implementasi. Perubahan pada `context/architecture-context.md` dan `context/progress-tracker.md` menyusul setelah persetujuan.*



