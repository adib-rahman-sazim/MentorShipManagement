import "@/styles/globals.css";

import { appWithTranslation } from "next-i18next";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { Provider as ReduxProvider } from "react-redux";

import { Toaster } from "@/shared/components/shadui/sonner";
import AppInitializer from "@/shared/components/wrappers/AppInitializer";
import RouteChangeIndicator from "@/shared/components/wrappers/RouteChangeIndicator";
import ThemeProvider from "@/shared/components/wrappers/ThemeProvider";
import { NOTIFICATION_AUTO_CLOSE_TIMEOUT_IN_MILLISECONDS } from "@/shared/constants/app.constants";
import { AbilityProvider } from "@/shared/providers/AbilityProvider";
import { AuthProvider } from "@/shared/providers/AuthProvider";
import { FeatureFlagsProvider } from "@/shared/providers/FeatureFlagsProvider";
import { store } from "@/shared/redux/store";
import { TCustomAppProps } from "@/shared/typedefs";

import i18nConfig from "../next-i18next.config.mjs";

function App(props: TCustomAppProps) {
  const { Component, pageProps } = props;

  const component = Component.Layout ? (
    <Component.Layout>
      <Component {...pageProps} />
    </Component.Layout>
  ) : (
    <Component {...pageProps} />
  );

  return (
    <ReduxProvider store={store}>
      <NuqsAdapter>
        <AppInitializer>
          <AuthProvider>
            <FeatureFlagsProvider>
              <AbilityProvider>
                <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
                  <RouteChangeIndicator />
                  <Toaster duration={NOTIFICATION_AUTO_CLOSE_TIMEOUT_IN_MILLISECONDS} />
                  {Component.Guard ? <Component.Guard>{component}</Component.Guard> : component}
                </ThemeProvider>
              </AbilityProvider>
            </FeatureFlagsProvider>
          </AuthProvider>
        </AppInitializer>
      </NuqsAdapter>
    </ReduxProvider>
  );
}

const AppWithTranslation = appWithTranslation(App, i18nConfig);

export default AppWithTranslation;
