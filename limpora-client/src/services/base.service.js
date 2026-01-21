
import axios from "axios";

export const API = axios.create({
  baseURL: "/api/v1",
  withCredentials: true
});