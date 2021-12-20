import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/globalStyle";
import { theme } from "./styles/theme";
import { RecoilRoot } from "recoil";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { QueryClientProvider, QueryClient } from "react-query";

Sentry.init({
  dsn: "https://1b1631b2e8bb41879fc5fbc0453091c8@o1095030.ingest.sentry.io/6113737",
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <GlobalStyle />
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
