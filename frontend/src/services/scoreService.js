import axios from 'axios';

const API_URL = ' https://hakan-jump.onrender.com/api';

export const scoreService = {
  getScores: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },
  saveScore: async (name, score) => {
    const res = await axios.post(API_URL, { name, score });
    return res.data;
  }
};