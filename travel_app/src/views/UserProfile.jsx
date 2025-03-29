import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut } from "lucide-react";
import axiosClient from "../axios-client.js";
import { Toaster, toast } from "sonner";

export default function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser, token, setUser, setToken } = useStateContext();
  const [profileUser, setProfileUser] = useState(null);
  const [tours, setTours] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !userId || userId == currentUser.id;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        let authUser = currentUser;
        if (!Object.keys(currentUser).length) {
          const { data: userData } = await axiosClient.get("/user");
          setUser(userData);
          authUser = userData;
        }

        let targetUser;
        if (userId && userId != authUser.id) {
          const { data } = await axiosClient.get(`/user/${userId}`);
          targetUser = data;
        } else {
          targetUser = authUser;
        }
        setProfileUser(targetUser);

        const { data: toursData } = await axiosClient.get(`/users/${targetUser.id}/tours`);
        const { data: participationsTours } = await axiosClient.get(`/users/${targetUser.id}/tour-participations`);
        setTours(toursData.tours || toursData);
        setParticipations(participationsTours.tours)
        console.log(participationsTours.tours)
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Не удалось загрузить данные");
        setLoading(false);
      }
    };

    loadData();
  }, [token, currentUser, userId, setUser, navigate]);

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
  if (error) {
    toast.error(error);
    return <div className="min-h-screen bg-gray-100 p-6 text-red-500">{error}</div>;
  }
  if (!profileUser) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isOwnProfile ? "Мой профиль" : `Профиль пользователя`}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
              <AvatarFallback>{profileUser.name ? profileUser.name[0] : "U"}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">{profileUser.name}</h2>
              <p className="text-gray-600">{profileUser.email}</p>
              <p className="text-gray-600">
                Роль: {profileUser.is_admin ? "Администратор" : profileUser.is_moderator ? "Модератор" : "Участник"}
              </p>
              {isOwnProfile && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Выйти
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isOwnProfile ? "Мои туры" : "Туры пользователя"}</CardTitle>
          </CardHeader>
          <CardContent>
            {tours.length === 0 ? (
              <p className="text-gray-600">
                {isOwnProfile ? "Вы еще не создали ни один тур" : "Этот пользователь еще не создавал туры."}
              </p>
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

        <Card>
          <CardHeader>
            <CardTitle>Мои участия</CardTitle>
          </CardHeader>
          <CardContent>
            {participations.length === 0 ? (
              <p className="text-gray-600">
                {isOwnProfile ? "Вы ещё не откликнулись ни на один тур." : "Этот пользователь не откликнулся ни на один тур."}
              </p>
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
                    {participations.map((tour) => (
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
