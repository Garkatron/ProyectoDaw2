
import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "http://limpora-server:3000/api/v1" 
    : "/api/v1"; 

export const API = axios.create({
  baseURL: "http://limpora-server:3000/api/v1",
  withCredentials: true
});