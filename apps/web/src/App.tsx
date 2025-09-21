import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between p-3">
            <div className="font-bold">POS Invoice</div>
            <div className="flex gap-4 text-sm">
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "font-semibold" : "")}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/create"
                className={({ isActive }) => (isActive ? "font-semibold" : "")}
              >
                Create Invoice
              </NavLink>
            </div>
          </nav>
        </header>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/create" element={<CreateInvoicePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
