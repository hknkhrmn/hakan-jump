🚀 Hakan Jump
Hakan Jump, klasik Doodle Jump mekaniklerinden esinlenerek, modern web teknolojileriyle geliştirilmiş Full-Stack bir zıplama oyunudur. El çizimi (doodle) estetiği ile profesyonel yazılım mimarisini birleştirir.

🎨 Özellikler
Dinamik Oyun Motoru: Canvas API kullanılarak geliştirilmiş, akıcı karakter fiziği ve sonsuz platform üretimi.

Canlı Lider Tablosu: Skorlar anlık olarak MongoDB Atlas üzerinde tutulur ve ilk 3 oyuncu madalyalarla (🥇, 🥈, 🥉) ödüllendirilir.

Tam Responsive Tasarım: CSS Grid ve Medya Sorguları sayesinde telefon, tablet ve masaüstü cihazlarda kusursuz çalışır.

Güvenli Mimari: .env yapılandırması ve gelişmiş .gitignore kuralları ile hassas veriler (API anahtarları) koruma altındadır.

🛠️ Kullanılan Teknolojiler
Frontend
React.js: Bileşen tabanlı arayüz yönetimi.

Canvas API: 2D oyun render işlemleri.

CSS3: "Doodle" defter teması ve mobil uyum.

Backend
Node.js & Express: RESTful API mimarisi.

Mongoose: MongoDB için veri modelleme.

CORS & Dotenv: Güvenlik ve ortam değişkenleri yönetimi.

💻 Kurulum Rehberi
Projeyi kendi yerel ortamınızda çalıştırmak için:

Depoyu Klonlayın:

Bash
git clone https://github.com/KULLANICI_ADIN/hakan-jump.git
cd hakan-jump
Backend Hazırlığı:

Bash
cd backend
npm install
backend klasörü içinde bir .env dosyası oluşturun:

Kod snippet'i
PORT=5000
MONGO_URI=mongodb+srv://Kullanici:Sifre@cluster.xxxx.mongodb.net/hakanjump
Frontend Hazırlığı:

Bash
cd ../frontend
npm install
npm run dev
🛡️ Güvenlik ve Kriz Yönetimi
Bu projenin geliştirme aşamasında, yanlışlıkla sızdırılan veritabanı kimlik bilgileri GitHub Security Alert mekanizmaları kullanılarak başarıyla temizlenmiş; veritabanı şifreleri "Rotate" (Yenileme) işlemine tabi tutulmuş ve git rm --cached komutları ile repo geçmişinden arındırılmıştır. Bu süreç, projenin Siber Güvenlik farkındalığıyla geliştirildiğinin bir kanıtıdır.

👨‍💻 Geliştirici
Hakan
Full Stack Developer Adayı

"Kod yazarken yapılan her hata, aslında daha sağlam bir sistem kurmak için bir ipucudur." 🚀

🎮 Nasıl Oynanır?
Masaüstü: Klavyedeki Sağ/Sol Ok tuşlarını kullanın.

Mobil: Karakteri yönlendirmek için ekranın sağ veya sol tarafına dokunun.

Hedef: Platformlardan düşmeden en yükseğe zıpla ve adını altın harflerle lider tablosuna yazdır!

Bu proje eğitim amaçlı geliştirilmiştir.