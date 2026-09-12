# Mornify

> Bukan pelacak tidur. Pencatat jam tidur bareng teman sekelas.

**Tagline:** Yang penting bukan berapa lama kamu tidur. Tapi apakah jamnya sama tiap hari.

**Tagline (EN, untuk Devpost):** Sleep consistency, but with your classmates watching.

---

## 1. Ringkasan

| | |
|---|---|
| Nama | Mornify |
| Platform | Android (utama), iOS (kalau sempat) |
| Event | RevenueCat Shipaton 2026 |
| Deadline Devpost | 30 September 2026, 11:45 PM PT |
| Target submit ke Play | 22 September 2026 |
| Kategori utama | Next Gen Award |
| Kategori sekunder | Best Game Award |
| Kategori upside | #BuildInPublic |

---

## 2. Masalah

Semua aplikasi tidur yang ada itu single-player dan sok medis. Mereka menjual "skor kualitas tidur" dari sensor HP yang akurasinya diperdebatkan, lalu memberi grafik yang tidak mengubah perilaku siapa pun.

Mahasiswa sudah tahu mereka kurang tidur. Yang tidak mereka punya adalah alasan untuk teratur.

## 3. Solusi

Mornify tidak mengukur tidur. Mornify mencatat **jam** tidur yang dilaporkan sendiri, lalu membandingkannya dengan grup kecil — teman sekelas, teman kos, satu angkatan.

Yang dijual bukan malamnya. Yang dijual **paginya**: satu kartu, muncul saat alarm dimatikan, menunjukkan posisimu di grup.

---

## 4. Core loop

```
MALAM                          PAGI
tap "tidur"        →           alarm bunyi
set alarm                      tap "bangun"
                               ↓
                               KARTU PAGI
                               - jam tidur & bangun kamu
                               - rata-rata grup
                               - posisi kamu di grup
                               - streak konsistensi
                               ↓
                               share kartu (opsional)
```

Demo 15 detik = alarm bunyi → tap → kartu muncul → peringkat bergeser. Satu take, tanpa penjelasan.

---

## 5. Ruang lingkup

### Wajib jadi (MVP)

- [ ] Tap "tidur" → timestamp
- [ ] Alarm (notifikasi terjadwal)
- [ ] Tap "bangun" / matikan alarm → timestamp
- [ ] Kartu pagi
- [ ] Streak konsistensi
- [ ] Grup lewat kode undangan
- [ ] Paywall streak freeze
- [ ] **Mode developer: timestamp palsu** (bangun di hari pertama)

### Dibuang, tanpa negosiasi

Fase tidur · akselerometer · mikrofon · sonar · Health Connect · HealthKit · grafik mingguan · skor kualitas tidur · feed publik · komentar · leaderboard global · login email/password

---

## 6. Aturan produk

**1. Nol bahasa medis.** Tidak ada "kualitas tidur", tidak ada klaim kesehatan, tidak ada saran medis. Cuma jam dan konsistensi. Ini memperkecil risiko review Play Store sekaligus risiko orthosomnia.

**2. Streak menghitung konsistensi, bukan durasi.** Tidur jam 1 pagi tiap hari tetap dapat streak. Tidak ada hadiah untuk mengaku tidur 10 jam.

**3. Jangan klaim yang tidak bisa dibuktikan.** Tulis "kamu mulai tidur 23:40", bukan "kamu tidur 6j 35m". Yang pertama fakta, yang kedua asumsi.

**4. Aplikasi jalan tanpa grup.** Grup membuatnya lebih baik, bukan syarat hidup.

**5. Kalau Supabase mati, streak lokal tetap jalan.** Demo tidak boleh tergantung jaringan.

---

## 7. Tim

| Nama | Peran utama | Peran kedua |
|---|---|---|
| Nathan | Developer | Content (tentatif) |
| Rafel | Developer | Content |
| Bryan | Content lead | Desain & aset store |
| Nuha | Content | QA & koordinasi tester kampus |

### Catatan pembagian

Nathan dan Rafel dobel di dua peran. Itu risiko nyata — kalau build telat, konten yang pertama dikorbankan, padahal konten itu justru submission Next Gen (videonya). **Bryan dan Nuha harus bisa jalan sendiri tanpa menunggu developer.**

Tugas Bryan & Nuha yang tidak butuh kode:
- Posting harian mulai hari ini
- Logo, ikon, screenshot store
- Deskripsi Play Store, privacy policy
- Naskah + syuting video demo
- Rekrut dan koordinasi tester dari klub kampus
- Draft Devpost writeup

---

## 8. Tech stack

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Framework | React Native + Expo (TypeScript) | Stack terkuat tim |
| Build | EAS Build, development client | Bukan Expo Go |
| Routing | expo-router | |
| Alarm | expo-notifications | **Lihat risiko #1** |
| State lokal | expo-sqlite atau MMKV | Sumber kebenaran utama |
| Backend | Supabase | Hanya: grup, kode undangan, sync log |
| Auth | Supabase anonymous auth | Tanpa email/password |
| Monetisasi | react-native-purchases (RevenueCat) | |
| Kartu share | react-native-view-shot + expo-sharing | |
| Font | expo-google-fonts | |

### Data model (sketsa)

```sql
profiles      id, display_name, created_at
groups        id, name, invite_code, created_by
memberships   user_id, group_id, joined_at
sleep_logs    id, user_id, sleep_at, wake_at,
              source ('tap' | 'alarm' | 'morning_fix'),
              logged_at, created_at
streaks       user_id, current, longest, freezes_left
```

`logged_at` disimpan terpisah dari `sleep_at` — nanti berguna kalau perlu deteksi klaim yang tidak masuk akal. Jangan bangun logikanya sekarang.

---

## 9. Desain

### Konsep

Aplikasi ini dipakai di dua momen yang berlawanan: jam 11 malam di kamar gelap, dan jam 6 pagi saat baru bangun. Temanya ikut berubah.

**Malam** — gelap, hangat, rendah kontras. Tidak boleh menyilaukan.
**Pagi** — terang, hangat, cerah. Kartu paginya harus enak difoto.

### Palet malam

| Token | Hex | Pakai untuk |
|---|---|---|
| `night-bg` | `#0B1120` | Background |
| `night-surface` | `#151E32` | Kartu |
| `night-border` | `#253150` | Garis |
| `night-text` | `#E6E8EF` | Teks utama |
| `night-muted` | `#8B94AD` | Teks sekunder |
| `night-accent` | `#6C7BFF` | Tombol utama |

### Palet pagi

| Token | Hex | Pakai untuk |
|---|---|---|
| `dawn-bg` | `#FFF8F0` | Background |
| `dawn-surface` | `#FFFFFF` | Kartu |
| `dawn-border` | `#F0E4D4` | Garis |
| `dawn-text` | `#1A1614` | Teks utama |
| `dawn-muted` | `#7A6E63` | Teks sekunder |
| `dawn-accent` | `#F59332` | Tombol utama, matahari |
| `streak-flame` | `#E4572E` | Angka streak |

### Tipografi

Satu keluarga font, dua bobot saja (400 dan 500). Angka jam tampil besar — itu elemen visual utama kartu pagi. Jangan pakai lebih dari dua ukuran heading.

### Aturan desain

- Tidak ada grafik garis. Kartu pagi = angka besar + satu baris perbandingan.
- Kartu pagi harus terbaca dalam satu detik, karena orang lihatnya sambil setengah sadar.
- Rasio kartu share: 4:5 (paling bagus di Instagram Story dan WhatsApp).
- Wordmark "Mornify" pakai huruf kecil semua, satu bobot, tanpa efek.

---

## 10. Monetisasi

**Gratis selamanya untuk mencatat dan lihat kartu pagi.**

Yang dijual: **streak freeze.** Satu hari terlewat diselamatkan.

Kenapa ini yang dijual: pembeliannya terjadi di puncak emosi — saat orang sadar streak 23 hari mau putus. Bukan langganan yang harus dijelaskan, tapi penyelamatan yang langsung dimengerti.

Struktur RevenueCat:
- Consumable: 1 freeze
- Paket: 5 freeze
- Langganan bulanan: freeze tak terbatas + kartu pagi custom

---

## 11. Timeline

| Tanggal | Target |
|---|---|
| 7 Sept | Cek Play Console (produksi terkunci?). Amankan nama Mornify. Mulai posting. |
| 7–10 Sept | Tap, alarm, timestamp, streak lokal jalan di HP asli. Mode developer. |
| 11–14 Sept | Supabase: grup, kode undangan, kartu pagi. |
| 15–17 Sept | RevenueCat, paywall, onboarding, aset store, privacy policy. |
| 18–21 Sept | Klub kampus pakai tiap hari. Perbaiki dari feedback. |
| **22 Sept** | **Submit ke Play Store. Ini deadline sebenarnya.** |
| 23–28 Sept | Iterasi publik, video demo, README, LICENSE. |
| 29 Sept | Submit Devpost, sehari lebih awal. |

---

## 12. Risiko

**#1 — Alarm di Android.** `expo-notifications` menjadwalkan notifikasi, bukan alarm penuh. Untuk alarm yang benar-benar membangunkan (menembus mode senyap, layar penuh) Android butuh `SCHEDULE_EXACT_ALARM` dan pengecualian battery optimization, dan perilakunya beda-beda per pabrikan — Xiaomi, Oppo, dan Vivo terkenal agresif membunuh background app. **Uji ini di HP asli dalam 48 jam pertama.** Kalau ternyata tidak reliabel, turunkan jadi notifikasi biasa dan ubah framing produk dari "alarm" jadi "pengingat", jangan buang waktu melawan OEM.

**#2 — Iterasi cuma sekali sehari.** Diselesaikan dengan mode developer timestamp palsu. Bangun di hari pertama, bukan nanti.

**#3 — Status akun Play belum diketahui.** Kalau akun baru, ada syarat closed testing sebelum bisa produksi. Harus mulai minggu ini kalau begitu. **Belum terjawab sampai sekarang.**

**#4 — Nathan dan Rafel dobel peran.** Kalau build telat, konten mati. Bryan dan Nuha harus jalan duluan.

**#5 — Kategori tidur sangat padat.** Pembedanya bukan teknologi, tapi sisi sosial dan tone. Jangan tergoda menambah fitur pelacakan.

**#6 — #BuildInPublic sudah ketinggalan.** Periode penilaian 1 Agustus–30 September dan belum ada postingan. Tetap posting harian, tapi anggap ini upside, bukan target.

---

## 13. Checklist submission

**Next Gen Award**
- [ ] Semua anggota punya email akademik terverifikasi di Devpost
- [ ] Video demo (core loop terlihat dalam 15 detik pertama)
- [ ] Repo publik + file LICENSE (MIT)
- [ ] README: apa, kenapa, cara jalanin, screenshot

**Umum**
- [ ] RevenueCat SDK terpasang, minimal satu produk
- [ ] Aplikasi rilis publik antara 1 Agustus–30 September
- [ ] Link postingan #BuildInPublic di form Devpost
- [ ] Privacy policy (wajib Play Store)

---

## 14. Belum terjawab

1. **Play Console: jalur produksi terbuka atau terkunci?** — prioritas tertinggi, hari ini
2. Next Gen: semua anggota harus punya email akademik, atau cukup akun yang submit? — tanya Discord
3. Nama "Mornify" bentrok di Play Store atau Instagram? — cek hari ini
4. Akun sosial untuk build in public: siapa yang pegang?

---

## 15. Catatan

Ide ini bukan yang paling orisinal, dan itu disengaja. Pemenang Shipaton 2025 termasuk aplikasi hapus foto, timer meditasi, dan pengingat suara — tidak ada yang baru. Yang menang adalah yang selesai, rapi, dan ceritanya jelas.

Fokusnya: **selesai tanggal 22, bukan sempurna tanggal 30.**
