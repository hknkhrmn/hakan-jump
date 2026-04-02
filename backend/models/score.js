const mongoose = require('mongoose');

// MongoDb ye kaydedilecek skor belgesinin yapısını tanımladık
const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // Oyuncu adı
  score: { type: Number, required: true }, // Skor değeri
  date: { type: Date, default: Date.now } // Kayıt Tarihi
});

// Score modelini dışa aktar 
// mongoose bunu MongoDB'de scores koleksiyonuna bağlar 
module.exports = mongoose.model('Score', scoreSchema);