# 🕹️ Hakan Jump

> Doodle Jump'tan ilham alınan, gerçek zamanlı skor tablosu ve 3 farklı Hakan karakteriyle dolu full-stack web oyunu.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

---

## 🎮 Oyun Hakkında

Platformlara zıpla, ne kadar yüksek çıkabilirsin?  
Skor arttıkça karakter değişir — 3 farklı Hakan seni bekliyor.

| Skor | Karakter |
|------|----------|
| 0 – 999 | 🔒 Güvenlik Hakanı |
| 1000 – 1999 | ⚙️ Mühendis Hakanı |
| 2000+ | 💻 Frontend Hakanı |

---

## 📁 Proje Yapısı

```
hakan-jump/
├── backend/
│   ├── models/
│   │   └── Score.js
│   ├── routes/
│   │   └── scoreRoutes.js
│   ├── controllers/
│   │   └── scoreController.js
│   ├── server.js
│   └── .env
│
└── frontend/
    ├── public/
    │   └── assets/
    │       ├── bg-music.mp3
    │       ├── bounce.mp3
    │       ├── fall.mp3
    │       ├── hakan1.svg
    │       ├── hakan2.svg
    │       ├── hakan3.svg
    │       └── hakanjump9.png
    ├── src/
    │   ├── components/
    │   │   ├── DoodleCanvas.jsx
    │   │   ├── Leaderboard.jsx
    │   │   └── StartScreen.jsx
    │   ├── services/
    │   │   └── scoreService.js
    │   ├── styles/
    │   │   └── global.css
    │   ├── utils/
    │   │   └── audio.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── eslint.config.js
    └── package.json
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js v18+
- MongoDB Atlas hesabı

### 1. Repoyu klonla

```bash
git clone https://github.com/kullanici/hakan-jump.git
cd hakan-jump
```

### 2. Backend

```bash
cd backend
npm install
```

Sunucuyu başlat:

```bash
node server.js
```

### 3. Frontend

Yeni terminal aç:

```bash
cd frontend
npm install
npm run dev
```

Tarayıcıdan aç → [http://localhost:5173](http://localhost:5173)

---

## 🕹️ Nasıl Oynanır?

**Masaüstü**
- `A` / `←` → sola git
- `D` / `→` → sağa git

**Mobil**
- Telefonu sağa / sola eğ (gyroscope)
- Gyroscope yoksa ekranın sol / sağ yarısına dokun

**Platform tipleri**
- 🟩 Yeşil → standart zıplama
- 🟧 Turuncu → süper zıplama (yay)
- ⬜ Gri → bir kez kullanılabilir, sonra kırılır

Düşersen oyun biter — skorunu gir, lider tablosuna kaydol.

---

## 🛠️ Kullanılan Teknolojiler

**Frontend**
- React + Vite
- HTML5 Canvas (oyun motoru)
- CSS (el çizimi / sketchbook estetik, Caveat fontu)

**Backend**
- Node.js + Express
- MongoDB + Mongoose

---

## 📌 Geliştirme Amacı

Bu proje aşağıdaki konularda pratik yapmak için geliştirilmiştir:

- Full-stack uygulama geliştirme
- Canvas API ile oyun programlama
- REST API tasarımı ve MongoDB entegrasyonu
- Responsive CSS layout
- Gyroscope ve klavye kontrol sistemleri

---

## 📜 Lisans

MIT