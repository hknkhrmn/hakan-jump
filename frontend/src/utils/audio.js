export const bounceSound = new Audio('/assets/bounce.mp3');
export const fallSound = new Audio('/assets/fall.mp3');
export const bgMusic = new Audio('/assets/bg-music.mp3');

// Müzik ayarları
bgMusic.loop = true; // Sürekli çalması için
bgMusic.volume = 0.4; // Sesi %40'a düşürür (oyuncuyu yormasın)