import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.js";
import { BrowserRouter } from "react-router-dom";
import { initLangManager } from "./utils/LangManager";
import { MantineProvider, ColorSchemeScript, createTheme } from "@mantine/core";
import { mantineTheme } from "./themes/theme.js";
import "@mantine/core/styles.css";
import '@mantine/dates/styles.css';

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

initLangManager().then(() => {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <MantineProvider
          theme={mantineTheme}
          defaultColorScheme="dark"
          cssVariablesResolver={(theme) => ({
            variables: {},
            light: {},
            dark: {
             
            },
          })}
        >
          <App />
        </MantineProvider>
      </BrowserRouter>
    </StrictMode>
  );
});