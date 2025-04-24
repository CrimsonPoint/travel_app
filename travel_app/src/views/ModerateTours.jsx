import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, CheckCheck } from "lucide-react";
import axiosClient from "../axios-client.js";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,} from "@/components/ui/alert-dialog";
import {toast, Toaster} from "sonner";

export default function ModerateTours() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editTour, setEditTour] = useState(null);
  const [open, setOpen] = useState(false);
  const [tourIdToDelete, setTourIdToDelete] = useState(null);
  const [checklistItem, setChecklistItem] = useState("");

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/user")
      .then(({ data }) => {
        if (data.is_admin) {
          toast.error("Доступ запрещён");
          navigate("/");
        } else {
          setIsAdmin(true);
          axiosClient
            .post("/tours", {getAllStatuses: true})
            .then(({ data }) => {
              setTours(data.data);
              setLoading(false);
            })
            .catch((err) => {
              toast.error("Не удалось загрузить туры");
              setLoading(false);
            });
        }
      })
      .catch((err) => {
        toast.error("Не удалось проверить права доступа");
        setLoading(false);
      });
  }, [navigate]);

  const handleDelete = (id) => {
    setTourIdToDelete(id);
    setOpen(true);
  };

  const handleApprove = (id) => {
    axiosClient
      .patch(`/tour/${id}/status`, {status: 2})
      .then(() => {
        toast.success("Статус обновлен");
      })
      .catch(() => {
        toast.error("Что-то пошло не так");
      });
  }

  const confirmDelete = () => {
    if (!tourIdToDelete) return;
    axiosClient
      .delete(`/tour/${tourIdToDelete}`)
      .then(() => {
        setTours(tours.filter((tour) => tour.id !== tourIdToDelete));
        setOpen(false);
        toast.success("Тур успешно удалён");
      })
      .catch(() => {
        toast.error("Не удалось удалить тур");
      });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTour((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditDifficultyChange = (value) => {
    setEditTour((prev) => ({ ...prev, difficulty: value }));
  };

  const addChecklistItem = () => {
    if (checklistItem.trim()) {
      setEditTour((prev) => ({
        ...prev,
        checklist: [...prev.checklist, checklistItem.trim()],
      }));
      setChecklistItem("");
    }
  };

  const removeChecklistItem = (index) => {
    setEditTour((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index),
    }));
  };

  const handleSaveEdit = () => {
    axiosClient
      .put(`/tour/${editTour.id}`, editTour)
      .then(({ data }) => {
        const updatedTours = tours.map((item) =>
          item.tour.id === data.id ? { ...item, tour: data } : item
        );
        setTours(updatedTours);
        setEditTour(null);
        toast.success("Тур успешно обновлён");
      })
      .catch(() => {
        toast.error("Не удалось сохранить изменения");
      });
  };

  if (loading) return <div className="min-h-screen bg-gray-100 p-6">Загрузка...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Модерирование туров</h1>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Название</TableHead>
                <TableHead className="min-w-[200px]">Описание</TableHead>
                <TableHead className="min-w-[120px]">Создатель</TableHead>
                <TableHead className="min-w-[100px]">Сложность</TableHead>
                <TableHead className="min-w-[100px]">Дистанция</TableHead>
                <TableHead className="min-w-[120px]">Участники</TableHead>
                <TableHead className="min-w-[150px]">Макс. участников</TableHead>
                <TableHead className="min-w-[200px]">Даты</TableHead>
                <TableHead className="min-w-[150px]">Местоположение</TableHead>
                <TableHead className="min-w-[200px]">URL изображения</TableHead>
                <TableHead className="min-w-[200px]">Чеклист</TableHead>
                <TableHead className="min-w-[120px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tours.map((data) => (
                <TableRow key={data.tour.id}>
                  <TableCell>{data?.tour?.title || "Нет названия"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{data.tour.description}</TableCell>
                  <TableCell>{data.tour.creator?.name || "Неизвестно"}</TableCell>
                  <TableCell>{data.tour.difficulty}</TableCell>
                  <TableCell>{data.tour.distance}</TableCell>
                  <TableCell>{data.tour.participants}</TableCell>
                  <TableCell>{data.tour.max_participants || "∞"}</TableCell>
                  <TableCell>
                    {new Date(data.tour.date_start).toLocaleDateString()} -{" "}
                    {new Date(data.tour.date_end).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{data.tour.location}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{data.tour.image_url}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {data.tour.checklist?.join(", ") || "Пусто"}
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
                      <Button
                        {...(data.tour.status > 0 ? {disabled: true} : {})}
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(data.tour.id)}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Вы собираетесь удалить этот тур. Это действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Удалить</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {editTour && (
          <Dialog open={!!editTour} onOpenChange={() => setEditTour(null)}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
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
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={editTour.description || ""}
                    onChange={handleEditChange}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="creator_name">Создатель</Label>
                  <Input
                    id="creator_name"
                    value={editTour.creator?.name || "Неизвестно"}
                    disabled
                    className="bg-gray-200"
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
                      <SelectItem value="1">Легкая</SelectItem>
                      <SelectItem value="2">Средняя</SelectItem>
                      <SelectItem value="3">Сложная</SelectItem>
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
                  <Label htmlFor="participants">Участники</Label>
                  <Input
                    id="participants"
                    name="participants"
                    type="number"
                    value={editTour.participants}
                    onChange={handleEditChange}
                    min="0"
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
                    min="1"
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
                  <Label htmlFor="location">Местоположение</Label>
                  <Input
                    id="location"
                    name="location"
                    value={editTour.location || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">URL изображения</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={editTour.image_url || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <Label>Чеклист</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={checklistItem}
                      onChange={(e) => setChecklistItem(e.target.value)}
                      placeholder="Добавить элемент чеклиста"
                      onKeyPress={(e) => e.key === "Enter" && addChecklistItem()}
                    />
                    <Button type="button" onClick={addChecklistItem}>
                      Добавить
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editTour.checklist?.map((item, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {item}
                        <p
                          className="h-4 w-4 cursor-pointer"
                          onClick={() => removeChecklistItem(index)}
                        >
                          x
                        </p>
                      </Badge>
                    ))}
                  </div>
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
