
import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "http://localhost:3001/api/v1" 
    : "/api/v1"; 

export const API = axios.create({
  baseURL: API_URL,
  withCredentials: true
});