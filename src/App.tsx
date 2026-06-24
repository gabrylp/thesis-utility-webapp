import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import Dashboard from "@/pages/Dashboard";
import Runs from "@/pages/Runs";
import RunDetail from "@/pages/RunDetail";
import Analysis from "@/pages/Analysis";
import Code from "@/pages/Code";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col ml-56">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/runs" element={<Runs />} />
              <Route path="/runs/:id" element={<RunDetail />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/code" element={<Code />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
