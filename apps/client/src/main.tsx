import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.js";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider, ColorSchemeScript, createTheme } from "@mantine/core";
import { mantineTheme } from "./themes/theme.js";
import "@mantine/core/styles.css";
import '@mantine/dates/styles.css';
import "./i18n";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

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