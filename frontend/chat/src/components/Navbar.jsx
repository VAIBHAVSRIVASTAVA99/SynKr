import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessagesSquare, Settings, User } from "lucide-react";
import { TfiLink } from "react-icons/tfi";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="bg-gray-900 border-b fixed w-full top-0 z-40
      backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/home" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <h1 className="text-2xl font-bold mt-2 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Synkr</h1>
            </Link>
          </div>

          {authUser && (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 text-white hover:text-gray-300 transition-all">
                <User className="size-5" />
                <span className="hidden md:inline">Profile</span>
              </Link>
              
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-all"
              >
                <LogOut className="size-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;