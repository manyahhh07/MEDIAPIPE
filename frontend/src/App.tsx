import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Dashboard } from "@/pages/Dashboard";
import { LiveTranslate } from "@/pages/LiveTranslate";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/translate" element={<LiveTranslate />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}