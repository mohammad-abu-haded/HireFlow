import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./context/authContext.tsx";
import { BrowserRouter } from "react-router-dom";
import AuthCheck from "./components/AuthCheck/AuthCheck.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <AuthCheck>
        <App />
      </AuthCheck>
    </AuthProvider>
  </BrowserRouter>
);