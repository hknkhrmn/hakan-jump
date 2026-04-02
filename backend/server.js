const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Score routelarını içe al 
const scoreRoutes = require('./routes/scoreRoutes');

const app = express();

app.use(cors());  // farklı originden gelen isteklere izin verir
app.use(express.json()); // gelen request body yi otomatik JSON olarak parse et 

//Tüm skor endpointleri api/scores altında tanımla 
app.use('/api/scores', scoreRoutes);

// Mongo DB ye bağlan 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Bağlantısı Başarılı"))
  .catch(err => console.log("❌ Bağlantı Hatası:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Sunucu port ${PORT} üzerinde çalışıyor`));