import {
  defineConfig,
  createSystem,
  defaultConfig,
  ChakraProvider,
} from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./pages/Home";
import { LoginSignup } from "./pages/LoginSignup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { ErrorPage } from "./pages/ErrorPage";
import { UserContextProvider } from "./contexts/UserContextProvider";
import { JoinInvitation } from "./pages/app/JoinInvitation";
import { SCApp } from "./pages/app/SCApp";
import { PostLoginRedirectContextProvider } from "./contexts/PostLoginRedirectContextProvider";
import { GroupContextProvider } from "./contexts/GroupContextProvider";
import { useEffect } from "react";
import { WhitepaperPage } from "./pages/Whitepaper";
import { Navbar } from "./pages/Navbar";

const queryClient = new QueryClient();

const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
  },
});

const system = createSystem(defaultConfig, config);

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
              <Toaster />
              <BrowserRouter>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />

                  <Route path="/login" element={<LoginSignup isLogin />} />
                  <Route
                    path="/signup"
                    element={<LoginSignup isLogin={false} />}
                  />

                  <Route path="/app/*" element={<SCApp />} />

                  <Route
                    path="/join/:groupId/:invitationLinkSecret"
                    element={<JoinInvitation />}
                  />

                  <Route path="/whitepaper" element={<WhitepaperPage />} />

                  <Route
                    path="*"
                    element={
                      <ErrorPage
                        title="404 - Page Not Found"
                        description="Unfortunately, the page you were looking for was not found."
                      />
                    }
                  />
                </Routes>
              </BrowserRouter>
            </PostLoginRedirectContextProvider>
          </GroupContextProvider>
        </UserContextProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default App;
