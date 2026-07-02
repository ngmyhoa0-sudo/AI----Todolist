import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import HomePage from "./pages/HomePage";

// App.jsx chỉ làm 1 việc: điều hướng giữa các trang
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home"            element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;