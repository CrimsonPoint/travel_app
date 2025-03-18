import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Calendar } from "lucide-react";
import axiosClient from "../axios-client.js";

export default function ModerateTours() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editTour, setEditTour] = useState(null);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/user")
      .then(({ data }) => {
        if (data.is_admin) {
          setError("Доступ запрещён");
          navigate("/");
        } else {
          setIsAdmin(true);
          axiosClient
            .post("/tours")
            .then(({ data }) => {
              setTours(data);
              setLoading(false);
            })
            .catch((err) => {
              setError("Не удалось загрузить туры");
              setLoading(false);
            });
        }
      })
      .catch((err) => {
        setError("Не удалось проверить права доступа");
        setLoading(false);
      });
  }, [navigate]);

  const handleDelete = (id) => {
    if (window.confirm("Вы уверены, что хотите удалить этот тур?")) {
      axiosClient
        .delete(`/tour/${id}`)
        .then(() => {
          setTours(tours.filter((data) => data.tour.id !== id));
        })
        .catch((err) => {
          setError("Не удалось удалить тур");
        });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTour((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditDifficultyChange = (value) => {
    setEditTour((prev) => ({ ...prev, difficulty: value }));
  };

  const handleSaveEdit = () => {
    axiosClient
      .put(`/tours/${editTour.id}`, editTour)
      .then(({ data }) => {
        setTours(tours.map((tour) => (tour.id === data.id ? data : tour)));
        setEditTour(null);
      })
      .catch((err) => {
        setError("Не удалось сохранить изменения");
        console.log(err);
      });
  };

  if (loading) return <div className="min-h-screen bg-gray-100 p-6">Загрузка...</div>;
  if (error) return <div className="min-h-screen bg-gray-100 p-6 text-red-500">{error}</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Модерирование туров</h1>

        <Table className="overflow-x-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Создатель</TableHead>
              <TableHead>Сложность</TableHead>
              <TableHead>Дистанция</TableHead>
              <TableHead>Участники</TableHead>
              <TableHead>Даты</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.map((data) => (
              <TableRow key={data.tour.id}>
                <TableCell>{data.tour.title}</TableCell>
                <TableCell className="max-w-100 truncate">{data.tour.description}</TableCell>
                <TableCell>{data.creator.name}</TableCell>
                <TableCell>{data.tour.difficulty}</TableCell>
                <TableCell>{data.tour.distance}</TableCell>
                <TableCell>{data.tour.participants} / {data.tour.max_participants || "∞"}</TableCell>
                <TableCell>
                  {new Date(data.tour.date_start).toLocaleDateString()} -{" "}
                  {new Date(data.tour.date_end).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditTour(data.tour)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(data.tour.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {editTour && (
          <Dialog open={!!editTour} onOpenChange={() => setEditTour(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактировать тур: {editTour.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    name="title"
                    value={editTour.title}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Сложность</Label>
                  <Select
                    value={editTour.difficulty}
                    onValueChange={handleEditDifficultyChange}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Легкая">Легкая</SelectItem>
                      <SelectItem value="Средняя">Средняя</SelectItem>
                      <SelectItem value="Сложная">Сложная</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="distance">Дистанция</Label>
                  <Input
                    id="distance"
                    name="distance"
                    value={editTour.distance}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <Label htmlFor="date_start">Дата начала</Label>
                  <Input
                    id="date_start"
                    name="date_start"
                    type="datetime-local"
                    value={editTour.date_start.slice(0, 16)}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <Label htmlFor="date_end">Дата окончания</Label>
                  <Input
                    id="date_end"
                    name="date_end"
                    type="datetime-local"
                    value={editTour.date_end.slice(0, 16)}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <Label htmlFor="max_participants">Макс. участников</Label>
                  <Input
                    id="max_participants"
                    name="max_participants"
                    type="number"
                    value={editTour.max_participants || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditTour(null)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveEdit}>Сохранить</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
