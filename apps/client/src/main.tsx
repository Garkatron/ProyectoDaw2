import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import { BrowserRouter } from "react-router-dom";
import { mantineTheme } from "./themes/theme.js";

import "./i18n";
import { MantineProvider } from '@mantine/core';

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