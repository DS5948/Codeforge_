import { Code, Code2, GalleryVerticalEnd } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaHome, FaLink, FaCode } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL
  // Fetch authenticated user
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  // Logout mutation
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Logout failed");
    },
  });
  // Automatically collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true); // Collapse for mobile screens
      } else {
        setIsCollapsed(false);
      }
    };

    // Check on load and on resize
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const navItems = [
    { label: "Dashboard", icon: <FaHome />, path: "/home" },
    { label: "Rooms", icon: <FaLink />, path: "/list-rooms" },
    { label: "Code battle" , icon: <FaCode />, path: "/code-battle" },
  ];

  return (
    <div className="flex z-20">
      {/* Sidebar */}
      <div
        className={`${
          isCollapsed ? "w-16" : "w-64"
        } bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white h-screen transition-all duration-300 ${
          window.innerWidth < 768 ? "absolute z-10" : "relative"
        } border-r-2 `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && (
            <div onClick={() => {navigate('/')}} className="flex items-center gap-2 cursor-pointer">
      {/* Using the Code icon from Lucide React, styled with a vibrant purple color */}
      <Code className="h-6 w-6 text-[#8B5CF6]" />
      {/* The text "Codeforge" with a bold white font and tight tracking for a modern look */}
      <span className="text-white text-xl font-bold tracking-tight">Codeforge</span>
    </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center">
              <Code className="h-6 w-6 text-[#8B5CF6]" />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="absolute top-4 -right-4 w-8 h-8 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center"
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Navigation Items */}
        <ul className=" mt-4">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <Link to={item.path} key={index}>
                <li className="group px-2">
                  <div
                    className={`flex items-center gap-4 px-2 py-2 rounded-lg cursor-pointer  mb-2 ${
                      isActive ? "bg-gray-800 text-white" : "hover:bg-gray-800"
                    }`}
                  >
                    {/* Icon */}
                    <span className="text-lg">{item.icon}</span>
                    {/* Label */}
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                  </div>
                </li>
              </Link>
            );
          })}
        </ul>

        {/* Profile Section */}
        <div className="absolute bottom-4 w-full px-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center p-2 gap-6 rounded-lg cursor-pointer hover:bg-gray-800">
              <img
                src="https://github.com/shadcn.png"
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              {!isCollapsed && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{authUser?.username}</span>
                  <span className="text-xs text-gray-400">{authUser?.email}</span>
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-950 text-white border border-gray-800 rounded-md mt-2">
              <DropdownMenuItem onClick={() => logout()}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
