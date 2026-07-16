import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Dashboard } from "@/pages/Dashboard";
import { LiveTranslate } from "@/pages/LiveTranslate";
import { TextToSign } from "@/pages/TextToSign";
import { Conversation } from "@/pages/Conversation";
import { Settings } from "@/pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/translate" element={<LiveTranslate />} />
            <Route path="/text-to-sign" element={<TextToSign />} />
            <Route path="/conversation" element={<Conversation />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}