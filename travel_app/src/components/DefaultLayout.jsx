import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import axiosClient from "../axios-client.js";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Users, LayoutDashboard, House } from "lucide-react";

export default function DefaultLayout() {
  const { user, token, setUser, setToken } = useStateContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const onLogout = (ev) => {
    ev.preventDefault();
    axiosClient.post("/logout").then(() => {
      setUser({});
      setToken(null);
    });
  };

  useEffect(() => {
    axiosClient.get("/user").then(({ data }) => {
      setUser(data);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  if (!token) {
    return <Navigate to="/login" />;
  }

  /**
   * TODO Перенести получение на бек
   * */
  let pages = [
    {
      link : "home",
      title : "Главная",
      icon : <House className="h-5 w-5" />,
      access : true
    },
    {
      link : "dashboard",
      title : "Панель управления",
      icon : <LayoutDashboard className="h-5 w-5" />,
      access : true
    },
    {
      link : "users",
      title : "Пользователи",
      icon : <Users className="h-5 w-5" />,
      access : true
    }
];
  let pageList = pages.map((page) => {
    if (!page.access) return;
    return (
      <Link
        to={`/${page.link}`}
        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {page.icon}
            </TooltipTrigger>
            <TooltipContent className={`${isSidebarOpen ? "hidden" : ""}`} side="right">
              <p>{page.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className={`${isSidebarOpen ? "ml-2" : "hidden"} text-nowrap`}>
        {page.title}
      </span>
      </Link>
    );
  });


  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside
        className={`bg-white shadow-md transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <h2 className="text-lg font-semibold text-gray-800">Навигация</h2>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-64px)] flex">
          <nav className="space-y-2 p-2">
            {pageList}
          </nav>
        </ScrollArea>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-800">
            Панель управления
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <span>{user.name || "Пользователь"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
