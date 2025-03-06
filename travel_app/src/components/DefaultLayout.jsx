import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import axiosClient from "../axios-client.js";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DefaultLayout() {
  const { user, token, setUser, setToken } = useStateContext();

  if (!token) {
    return <Navigate to="/login" />;
  }

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

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <ScrollArea className="h-full">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Навигация
            </h2>
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Dashboard
              </Link>
              <Link
                to="/users"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Users
              </Link>
            </nav>
          </div>
        </ScrollArea>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-800">Панель управления</div>
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
