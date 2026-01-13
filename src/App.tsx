import { useState } from "react";
import PCBuilder from "./components/PCBuilder";
import AdminPanel from "./components/AdminPanel";
import MonitorPage from "./components/MonitorPage";
import RacikPC from "./components/RacikPC";
import WishlistPage from "./components/WishlistPage";
import LoginModal from "./components/LoginModal";
import {
  Settings,
  Home,
  Activity,
  Wrench,
  Heart,
  LogIn,
  LogOut,
} from "lucide-react";
import { Monitor } from "./types/monitor";
import { useAuth } from "./context/AuthContext";

function App() {
  const [currentPage, setCurrentPage] = useState<
    "builder" | "admin" | "monitor" | "racik" | "wishlist"
  >("builder");

  const [wishlist, setWishlist] = useState<Monitor[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout } = useAuth();

  const addToWishlist = (monitor: Monitor) => {
    if (!wishlist.find((m) => m.id === monitor.id)) {
      setWishlist([...wishlist, monitor]);
    }
  };

  const removeFromWishlist = (monitor: Monitor) => {
    setWishlist(wishlist.filter((m) => m.id !== monitor.id));
  };

  const handleAdminClick = () => {
    if (!user || user.role !== "admin") {
      setIsLoginOpen(true);
    } else {
      setCurrentPage("admin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div
              className="flex items-center gap-4 group cursor-pointer"
              onClick={() => setCurrentPage("builder")}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <img
                  src="assets/image/npc_logo.png"
                  className="w-14 h-14 relative z-10 drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                  alt="NPC Logo"
                />
              </div>
              <div className="block">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-none tracking-tight">
                  NPC
                </h1>
                <p className="text-[10px] tracking-widest text-blue-400 font-bold uppercase mt-0.5 hidden sm:block">
                  New Personal Computer
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-full border border-white/5 backdrop-blur-sm">
              <NavButton
                active={currentPage === "builder"}
                onClick={() => setCurrentPage("builder")}
                icon={<Home size={18} />}
                label="Rekomendasi"
              />
              <NavButton
                active={currentPage === "racik"}
                onClick={() => setCurrentPage("racik")}
                icon={<Wrench size={18} />}
                label="Racik PC"
              />
              <NavButton
                active={currentPage === "monitor"}
                onClick={() => setCurrentPage("monitor")}
                icon={<Activity size={18} />}
                label="Monitor"
              />
              <NavButton
                active={currentPage === "wishlist"}
                onClick={() => setCurrentPage("wishlist")}
                icon={
                  <Heart
                    size={18}
                    className={
                      wishlist.length > 0
                        ? "fill-red-500 text-red-500 group-hover:scale-110 transition-transform"
                        : ""
                    }
                  />
                }
                label="Wishlist"
                badge={wishlist.length > 0 ? wishlist.length : undefined}
              />

              <div className="w-px h-6 bg-white/10 mx-1"></div>

              {user ? (
                <div className="flex items-center gap-1">
                  {user.role === "admin" && (
                    <NavButton
                      active={currentPage === "admin"}
                      onClick={() => setCurrentPage("admin")}
                      icon={<Settings size={18} />}
                      label="Admin"
                    />
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-red-400 hover:text-white hover:bg-red-500/10 transition-all font-medium text-sm ml-1"
                    title="Logout"
                  >
                    <LogOut size={18} />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-slate-300 hover:text-white hover:bg-blue-600 font-medium text-sm transition-all group"
                >
                  <LogIn
                    size={18}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}
            </div>

            {/* Mobile User Profile/Login (Visible only on mobile top bar) */}
            <div className="md:hidden">
              {user ? (
                <button
                  onClick={logout}
                  className="p-2 text-red-400 hover:text-white hover:bg-red-500/10 rounded-full"
                >
                  <LogOut size={20} />
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="p-2 text-blue-400 hover:text-white hover:bg-blue-500/10 rounded-full"
                >
                  <LogIn size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area with top padding for fixed navbar */}
      <main className="flex-1 pt-24 animate-fade-in pb-24 md:pb-12">
        {currentPage === "builder" ? (
          <PCBuilder />
        ) : currentPage === "racik" ? (
          <RacikPC />
        ) : currentPage === "monitor" ? (
          <MonitorPage
            wishlist={wishlist}
            onAddToWishlist={addToWishlist}
            onRemoveFromWishlist={removeFromWishlist}
          />
        ) : currentPage === "wishlist" ? (
          <WishlistPage
            wishlist={wishlist}
            onRemoveFromWishlist={removeFromWishlist}
          />
        ) : (
          <AdminPanel />
        )}
      </main>

      {/* Mobile Bottom Floating Navbar */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 flex justify-center animate-slide-up">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-full px-6 py-3 shadow-2xl border border-white/10 flex items-center justify-between w-full max-w-sm gap-2">
          <MobileNavButton
            active={currentPage === "builder"}
            onClick={() => setCurrentPage("builder")}
            icon={<Home size={20} />}
          />
          <MobileNavButton
            active={currentPage === "racik"}
            onClick={() => setCurrentPage("racik")}
            icon={<Wrench size={20} />}
          />
          <MobileNavButton
            active={currentPage === "monitor"}
            onClick={() => setCurrentPage("monitor")}
            icon={<Activity size={20} />}
          />
          <div className="relative">
            <MobileNavButton
              active={currentPage === "wishlist"}
              onClick={() => setCurrentPage("wishlist")}
              icon={
                <Heart
                  size={20}
                  className={
                    wishlist.length > 0 ? "fill-red-500 text-red-500" : ""
                  }
                />
              }
            />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>
            )}
          </div>

          {user?.role === "admin" && (
            <MobileNavButton
              active={currentPage === "admin"}
              onClick={() => setCurrentPage("admin")}
              icon={<Settings size={20} />}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-auto hidden md:block">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
            <img
              src="assets/image/npc_logo.png"
              className="w-10 h-10 grayscale hover:grayscale-0 transition-all"
              alt="NPC Logo"
            />
            <h2 className="text-xl font-bold text-white">NPC</h2>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} NPC (New Personal Computer). All
            rights reserved.
          </p>
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}

// Helper Component for Navigation Buttons
function NavButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-full transition-all duration-500 font-medium text-sm group whitespace-nowrap
        ${
          active
            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 px-5"
            : "text-slate-400 hover:text-white hover:bg-white/10"
        }
      `}
    >
      {icon}
      <span
        className={`
          transition-all duration-500 ease-in-out overflow-hidden
          ${
            active
              ? "w-auto opacity-100 max-w-[150px]"
              : "w-0 opacity-0 max-w-0"
          }
        `}
      >
        {label}
      </span>
      {badge !== undefined && (
        <span
          className={`
          absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold border-2 border-slate-900
          ${active ? "bg-white text-blue-600" : "bg-red-500 text-white"}
        `}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// Mobile specific button
function MobileNavButton({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
          p-3 rounded-full transition-all duration-300
          ${
            active
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 transform -translate-y-2 scale-110"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }
        `}
    >
      {icon}
    </button>
  );
}

export default App;
