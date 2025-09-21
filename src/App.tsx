import Hero from "./pages/Hero";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}

export default App;
