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
import { AppHomePage } from "./pages/app/AppHome";
import { GroupPage } from "./pages/app/GroupPage/GroupPage";
import { ErrorPage } from "./pages/ErrorPage";

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
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<LoginSignup isLogin />} />
            <Route path="/signup" element={<LoginSignup isLogin={false} />} />

            <Route path="/app" element={<AppHomePage />} />
            <Route path="/app/group/:groupId" element={<GroupPage />} />

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
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default App;
