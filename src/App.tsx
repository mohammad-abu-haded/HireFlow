import "./App.css";
import LoginScreen from "./screens/Auth/login/login.screen";
import { Route, Routes } from "react-router-dom";
// import SignupScreen from "./screens/Auth/signup/signup.screen";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </div>
  );
}

export default App;
