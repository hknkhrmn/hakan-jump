// frontend/src/utils/audio.js

// Müzik ve ses 
const bgMusic = new Audio('/assets/bg-music.mp3');  
bgMusic.loop = true;

const bounceSound = new Audio('/assets/bounce.mp3');
const fallSound = new Audio('/assets/fall.mp3');

// Hata yakalama 
bgMusic.addEventListener('error', () => console.error('bg-music yüklenemedi'));
bounceSound.addEventListener('error', () => console.error('bounce sesi yüklenemedi'));
fallSound.addEventListener('error', () => console.error('fall sesi yüklenemedi'));

export { bgMusic, bounceSound, fallSound };