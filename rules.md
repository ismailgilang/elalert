# 📖 ElAlert - Maintainer Rules & SOP

Dokumen ini berisi panduan dan hal-hal penting yang harus diingat saat mengembangkan dan merilis versi baru dari `@maellana25/elalert`.

## 🔄 Standar Operasional Prosedur (SOP) Rilis Versi Baru

Setiap kali Anda selesai menambahkan fitur baru atau memperbaiki *bug*, ikuti langkah-langkah berurutan ini agar *library* selalu rapi dan tersinkronisasi antara Git, GitHub, dan NPM.

### 1. Simpan Perubahan (Commit)
Pastikan semua kode sudah di-build (`npm run build`) dan berjalan dengan baik.
```bash
git add .
git commit -m "feat: deskripsi fitur baru atau perbaikan"
```

### 2. Naikkan Versi (Otomatis)
Gunakan perintah bawaan NPM agar versi di `package.json` berubah secara otomatis dan *Git Tag* tercipta. Pilih salah satu:
- **Perbaikan Bug Kecil:** `npm version patch` (contoh: `0.1.1` -> `0.1.2`)
- **Fitur Baru (Aman):** `npm version minor` (contoh: `0.1.1` -> `0.2.0`)
- **Perombakan Total (Breaking Changes):** `npm version major` (contoh: `0.1.1` -> `1.0.0`)

### 3. Publish ke NPM
Kirim paket yang sudah dinaikkan versinya ke NPM. Selalu gunakan flag `--access public`.
```bash
npm publish --access public
```
> **⚠️ PENTING (Terkait 2FA / OTP):**
> Jika Anda mendapatkan error `403 Forbidden` saat mem-publish, itu berarti NPM meminta kode otentikasi. Buka aplikasi Authenticator di HP Anda dan tambahkan flag `--otp`:
> ```bash
> npm publish --access public --otp=123456
> ```

### 4. Kirim ke GitHub (Push beserta Tag)
Kirim kode terbaru beserta "Tag" versi yang baru saja dibuat ke GitHub.
```bash
git push --follow-tags
```

### 5. Buat Catatan Rilis (Release Notes) di GitHub
1. Buka repo GitHub: `https://github.com/ismailgilang/elalert`
2. Masuk ke tab **Releases** (di bagian kanan halaman) dan klik **Draft a new release**.
3. Pilih *tag* terbaru yang baru saja di-push (misal: `v0.1.2`).
4. Klik tombol **"Generate release notes"** agar GitHub otomatis menulis rangkuman perubahan berdasarkan *commit*.
5. Klik **"Publish release"**.

---

## 🛠️ Perintah Berguna Lainnya

- **Mengecek file apa saja yang akan dikirim ke NPM sebelum publish:**
  ```bash
  npm pack --dry-run
  ```
- **Menjalankan Typecheck (memastikan tidak ada error TypeScript secara manual):**
  ```bash
  npm run typecheck
  ```
- **Build Ulang Folder `dist/` (wajib dilakukan jika mengubah file di folder `src/`):**
  ```bash
  npm run build
  ```