// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-risk-prediction-chronic-patients-dhvn.onrender.com",   // adjust port if your API differs
  timeout: 10000
});

export default api;
