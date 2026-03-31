# 🕹️ Hakan Jump

> Doodle Jump'tan ilham alınan, gerçek zamanlı skor tablosu ve 3 farklı Hakan karakteriyle dolu full-stack web oyunu.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

---

## 🎮 Oyun Hakkında

Mouse ile sağa sola hareket et, platformlara zıpla, ne kadar yüksek çıkabilirsin?  
Skorum arttıkça **Güvenlik Hakanı → Mühendis Hakanı → Frontend Hakanı** olarak değişen 3 farklı karakter seni bekliyor.

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
│   ├── routes/
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DoodleCanvas.jsx
│   │   │   ├── StartScreen.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── services/
│   │   │   └── scoreService.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── .gitignore
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

- **Mouse** ile karakteri sağa sola hareket ettir
- Platformlara çarpınca otomatik zıpla
- **🟩 Yeşil platform** → normal zıplama
- **🟧 Turuncu platform** → süper zıplama (yay)
- **⬜ Gri platform** → bir kez kullanılabilir, sonra kırılır
- Düşersen oyun biter, skorunu kaydet ve leaderboard'a gir

---

## 🛠️ Kullanılan Teknolojiler

**Frontend**
- React + Vite
- HTML5 Canvas (oyun motoru)
- CSS (el çizimi / sketchbook estetik)

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

---

## 📜 Lisans

MIT