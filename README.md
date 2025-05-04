# Backend_Kasir_App_ExpressJS

## Deskripsi

**Backend_Kasir_App_ExpressJS** adalah aplikasi backend untuk sistem kasir restoran sederhana. Dibangun dengan **Node.js** menggunakan framework **Express.js**, serta menggunakan **MySQL** sebagai database-nya. Aplikasi ini menyediakan API RESTful untuk mendukung sistem kasir dengan tiga role utama:

- **Admin**:
  - Mengelola pengguna, menu, dan meja.
  - Mengakses dan mengelola riwayat pesanan serta transaksi.

- **Kasir**:
  - Mengelola pesanan.
  - Memproses pembayaran dan mencetak invoice.

- **Pelayan**:
  - Membuat dan mengelola pesanan.

---

## Teknologi yang Digunakan

- Node.js
- Express.js
- MySQL
- JSON Web Token (JWT)
- dotenv

---

## Instalasi

1. Clone repository ini:

   ```bash
   git clone https://github.com/username/Backend_Kasir_App_ExpressJS.git
  

2. Masuk ke folder proyek:

   ```bash
   cd Backend_Kasir_App_ExpressJS

3. Install semua dependensi:

   ```bash
    npm install

4. Aktifkan Apache dan MySQL melalui **XAMPP** atau server lokal lainnya.

5. Buat database baru dengan nama: `kasir-app`.

6. Import file SQL dari folder `database/`:

  - File: `database/kasir-app.sql`

7. Buat file `.env` di root folder proyek dan sesuaikan isinya:
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=kasir-app
   JWT_SECRET=123
   JWT_REFRESH_SECRET=9578
   CORS_ORIGIN=http://localhost:3000

---

## Menjalankan Aplikasi
Jalankan aplikasi dengan perintah berikut:

  ```bash
   node server.js
  ```

Jika ingin menggunakan nodemon (jika tersedia):

  ```bash
  npx nodemon server.js
```

Aplikasi akan berjalan di `http://localhost:5000` (atau sesuai port di `server.js`).

## Struktur Folder

---
<pre>
/backend-kasir-app
│
├── server.js                   # Entry point utama
├── .env                        # Konfigurasi lingkungan
├── .gitignore
│
├── /config/
│   └── db.js                   # Koneksi database
│
├── /controllers/              # Logika bisnis untuk masing-masing fitur
│   ├── adminController.js
│   ├── authController.js
│   ├── MejaController.js
│   ├── menuController.js
│   ├── orderControllers.js
│   └── TransactionController.js
│
├── /middleware/
│   └── verifyToken.js          # Middleware otentikasi
│
├── /models/                   # Model untuk tiap tabel
│   ├── AdminModel.js
│   ├── UserModel.js
│   ├── MejaModel.js
│   ├── MenuModel.js
│   ├── OrderModel.js
│   ├── OrderItemModel.js
│   └── TransactionModel.js
│
├── /routes/                   # Routing endpoint
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── mejaRoutes.js
│   ├── menuRoutes.js
│   ├── orderRoutes.js
│   └── transactionRoute.js
│
├── /public/                   # Aset publik (misal gambar menu)
│   └── /assets/img/
│       ├── ayam bakar.jpg
│       ├── ayam goren.jpg
│       ├── Es Jeruk.jpg
│       ├── Es teh.jpg
│       └── Lele Goreng.jpg
│
├── /database/
│   └── kasir-app.sql          # Struktur dan data awal database
</pre>
---

## Endpoint Utama
Berikut beberapa endpoint penting (penjelasan lengkap bisa ditambahkan di dokumentasi Postman atau Swagger):

- `POST /api/login` – Login dan dapatkan token

- `GET /api/menu` – Lihat daftar menu

- `POST /api/order` – Buat pesanan

- `GET /api/transaction` – Lihat transaksi

- Dan lain-lain... (semua nya ada pada folder `routes`)

---

## Catatan
- Aplikasi ini hanya backend, dan membutuhkan frontend terpisah yang bisa mengakses API ini.

- Semua request ke endpoint yang memerlukan otorisasi harus menyertakan token JWT.

- File gambar disimpan di folder `public/assets/img`.

--- 
## Credential Login
- **Admin**:
  - Username : `admin`
  - Password : `Admin#1234`

- **Kasir**:
  - Username : `kasir`
  - Password : `Kasir#1234`

- **Pelayan**:
  - Username : `pelayan`
  - Password : `Pelayan#1234`







