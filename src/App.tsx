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
    <ChakraProvider value={system}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginSignup isLogin />} />
          <Route path="/signup" element={<LoginSignup isLogin={false} />} />
          <Route
            path="/app"
            element={<AbsoluteCenter>Hello App</AbsoluteCenter>}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
};

export default App;
