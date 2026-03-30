import axios from 'axios';

// Backend yerel adresi
const API_URL = 'http://localhost:5000/api';

// Tüm skorları getiren fonksiyon
export const getScores = async () => {
  try {
    const response = await axios.get(`${API_URL}/scores`);
    return response.data; // Backend'deki diziyi döner
  } catch (error) {
    console.error("Skorlar alınırken hata oluştu:", error);
    return [];
  }
};

// Yeni skor kaydeden fonksiyon
export const saveScore = async (name, score) => {
  try {
    const response = await axios.post(`${API_URL}/scores`, { name, score });
    return response.data;
  } catch (error) {
    console.error("Skor kaydedilemedi:", error);
  }
};