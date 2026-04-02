const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Klasör ismin 'routes' ise ve dosya 'scoreRoutes.js' ise tam olarak böyle olmalı:
const scoreRoutes = require('./routes/scoreRoutes');

const app = express();

app.use(cors());
app.use(express.json()); // Bu mutlaka rotaların üstünde kalmalı (şu an doğru)

app.use('/api/scores', scoreRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Bağlantısı Başarılı"))
  .catch(err => console.error("❌ Bağlantı Hatası:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Sunucu port ${PORT} üzerinde çalışıyor`));