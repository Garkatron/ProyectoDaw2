import { treaty, type Treaty } from "@elysiajs/eden";
import type { App } from "../../../server/src/index.ts";

// In dev, requests go through the Vite proxy (/api → limpora-server:3000)
// to avoid CORS issues. In production, the client calls the API subdomain directly.
const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://api.limpora.xyz"
    : `${window.location.origin}/api`;

export const API: Treaty.Create<App> = treaty<App>(API_BASE_URL, {
  headers: () => ({
    Authorization: `Bearer ${localStorage.getItem("firebase_token") ?? ""}`,
  }),
});
