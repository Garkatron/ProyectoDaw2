import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { initLangManager } from "./utils/LangManager.js";
import { MantineProvider, ColorSchemeScript, createTheme } from "@mantine/core";
import { mantineTheme } from "./themes/theme.js";
import "@mantine/core/styles.css";
import '@mantine/dates/styles.css';

initLangManager().then(() => {
  createRoot(document.getElementById("root")).render(
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