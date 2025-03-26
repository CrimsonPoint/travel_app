import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut } from "lucide-react";
import axiosClient from "../axios-client.js";
import { Toaster, toast } from 'sonner'


export default function UserProfile() {
  const navigate = useNavigate();
  const { user, token, setUser, setToken } = useStateContext();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        let currentUser = user;
        if (!Object.keys(user).length) {
          const { data: userData } = await axiosClient.get("/user");
          setUser(userData);
          currentUser = userData;
        }

        const { data: toursData } = await axiosClient.get(`/users/${currentUser.id}/tours`);
        setTours(toursData.tours);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Не удалось загрузить данные");
        setLoading(false);
      }
    };

    loadData();
  }, [token, user, setUser, navigate]);


  const handleLogout = () => {
    axiosClient
      .post("/logout")
      .then(() => {
        setUser({});
        setToken(null);
        toast.success("Вы успешно вышли из аккаунта");
        navigate("/login");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Ошибка при выходе");
      });
  };

  if (loading) return <div className="min-h-screen bg-gray-100 p-6">Загрузка...</div>;
  if (error) toast.error(err.response?.data?.message || "Что-то пошло не так");
  if (!Object.keys(user).length) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Профиль</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-600">
                Роль: {user.is_admin ? "Администратор" : user.is_moderator ? "Модератор" : "Участник"}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Выйти
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Мои туры</CardTitle>
          </CardHeader>
          <CardContent>
            {tours.length === 0 ? (
              <p className="text-gray-600">Вы ещё не записаны ни на один тур.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Сложность</TableHead>
                      <TableHead>Дистанция</TableHead>
                      <TableHead>Участники</TableHead>
                      <TableHead>Даты</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.map((tour) => (
                      <TableRow key={tour.id}>
                        <TableCell>
                          <a href={`/tour/${tour.id}`} className="text-blue-600 hover:underline">
                            {tour.title}
                          </a>
                        </TableCell>
                        <TableCell>{tour.difficulty}</TableCell>
                        <TableCell>{tour.distance}</TableCell>
                        <TableCell>
                          {tour.participants} / {tour.max_participants || "∞"}
                        </TableCell>
                        <TableCell>
                          {new Date(tour.date_start).toLocaleDateString()} -{" "}
                          {new Date(tour.date_end).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
