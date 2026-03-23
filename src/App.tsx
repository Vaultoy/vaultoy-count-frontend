import {
  defineConfig,
  createSystem,
  defaultConfig,
  ChakraProvider,
} from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { ErrorPage } from "./pages/ErrorPage";
import { UserContextProvider } from "./contexts/UserContextProvider";
import { PostLoginRedirectContextProvider } from "./contexts/PostLoginRedirectContextProvider";
import { GroupContextProvider } from "./contexts/GroupContextProvider";
import { lazy, useEffect } from "react";
import { LanguageContextProvider } from "./contexts/LanguageContextProvider";
import { Home } from "./pages/Home/Home";
import { Navbar } from "./pages/Navbar/Navbar";
import { fieldSlotRecipe } from "@chakra-ui/react/theme";

const CountApp = lazy(() => import("./pages/CountApp/CountApp"));
const SettingsPage = lazy(() => import("./pages/Settings/Settings"));
const LoginSignup = lazy(() => import("./pages/LoginSignup"));
const JoinInvitation = lazy(() => import("./pages/CountApp/JoinInvitation"));
const PricingPage = lazy(() => import("./pages/Pricing"));
const ContactPage = lazy(() => import("./pages/ContactPage/ContactPage"));
const WhitepaperPage = lazy(() => import("./pages/Whitepaper"));
const LegalPage = lazy(() => import("./pages/LegalPage/LegalPage"));

const queryClient = new QueryClient();

const customFieldRecipe = {
  ...fieldSlotRecipe,
  base: {
    ...fieldSlotRecipe.base,
    label: {
      fontWeight: "bold",
    },
  },
};

const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
    slotRecipes: {
      field: customFieldRecipe,
    },
  },
});

const system = createSystem(defaultConfig, config);

const RoutesWithNavbar = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/settings" element={<SettingsPage />} />

      <Route path="/app/*" element={<CountApp />} />

      <Route
        path="/join/:groupId/:invitationLinkSecret"
        element={<JoinInvitation />}
      />

      <Route path="/pricing" element={<PricingPage />} />

      <Route path="/contact" element={<ContactPage />} />
      <Route path="/whitepaper" element={<WhitepaperPage />} />
      <Route path="/legal" element={<LegalPage />} />

      <Route
        path="*"
        element={
          <ErrorPage
            title="Page Not Found"
            description="Unfortunately, the page you were looking for was not found."
          />
        }
      />
    </Routes>
  </>
);

const App = () => {
  useEffect(() => {
    console.info(`Welcome to Vaultoy Count | Version: ${COMMIT_HASH}`);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <UserContextProvider>
          <GroupContextProvider>
            <PostLoginRedirectContextProvider>
              <LanguageContextProvider>
                <Toaster />
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<LoginSignup isLogin />} />
                    <Route
                      path="/signup"
                      element={<LoginSignup isLogin={false} />}
                    />
                    <Route path="*" element={<RoutesWithNavbar />} />
                  </Routes>
                </BrowserRouter>
              </LanguageContextProvider>
            </PostLoginRedirectContextProvider>
          </GroupContextProvider>
        </UserContextProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default App;
