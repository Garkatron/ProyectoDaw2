import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { initLangManager } from "./utils/LangManager.js";
import { mockUser } from "./mocks/base.mocks.js";
import { useAuthStore } from "./stores/auth.store.js";

async function prepare() {
  if (import.meta.env.DEV) {
  const { mocksWorker } = await import('./mocks/browser.js');
  await mocksWorker.start({
    onUnhandledRequest(request, print) {
       if (!request.url.includes('/api/')) return;
      print.warning();
    },
  });

    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      error: null,
    });
}
}

prepare().then(() => {
  initLangManager().then(() => {
    createRoot(document.getElementById("root")).render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });
});