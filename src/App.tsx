import {
  defineConfig,
  createSystem,
  defaultConfig,
  ChakraProvider,
  AbsoluteCenter,
} from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router";
import { NotFoundPage } from "./pages/NotFound";
import { Home } from "./pages/Home";
import { LoginSignup } from "./pages/LoginSignup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { AppHome } from "./pages/app/AppHome";

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
            <Route path="/app" element={<AppHome />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default App;
