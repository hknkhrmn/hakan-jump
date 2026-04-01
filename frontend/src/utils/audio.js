// frontend/src/utils/audio.js

// Dosya uzantılarınızı ekleyin (örneğin .mp3)
const bgMusic = new Audio('/assets/bg-music.mp3');  // uzantıyı kendi dosyanıza göre değiştirin
bgMusic.loop = true;

const bounceSound = new Audio('/assets/bounce.mp3');
const fallSound = new Audio('/assets/fall.mp3');

// Hata yakalama (opsiyonel)
bgMusic.addEventListener('error', () => console.error('bg-music yüklenemedi'));
bounceSound.addEventListener('error', () => console.error('bounce sesi yüklenemedi'));
fallSound.addEventListener('error', () => console.error('fall sesi yüklenemedi'));

export { bgMusic, bounceSound, fallSound };