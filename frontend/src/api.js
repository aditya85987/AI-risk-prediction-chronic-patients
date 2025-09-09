// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",   // adjust port if your API differs
  timeout: 10000
});

export default api;
