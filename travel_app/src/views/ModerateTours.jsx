import { useState, useEffect } from "react";
import { useStateContext  } from '../contexts/ContextProvider.jsx';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { flexRender, getCoreRowModel, useReactTable, getSortedRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, CheckCheck } from "lucide-react";
import axiosClient from "../axios-client.js";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "@/components/ui/alert-dialog";
import { toast, Toaster } from "sonner";
import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import ForbiddenPage from "./ForbiddenPage.jsx";

export default function ModerateTours() {
  const navigate = useNavigate();
  const { user, canEdit } = useStateContext();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTour, setEditTour] = useState(null);
  const [open, setOpen] = useState(false);
  const [tourIdToDelete, setTourIdToDelete] = useState(null);
  const [checklistItem, setChecklistItem] = useState("");
  const [trainingTopics, setTrainingTopics] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    title: true,
    description: true,
    creator: true,
    difficulty: true,
    distance: true,
    participants: true,
    max_participants: true,
    dates: true,
    location: true,
    image_url: true,
    checklist: true,
    actions: true,
  });

  useEffect(() => {
    setLoading(true);
    axiosClient
      .post("/tours", { getAllStatuses: true })
      .then(({ data }) => {
        setTours(data.data);
        setTrainingTopics(data.data.topics || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Не удалось загрузить туры");
        setLoading(false);
      });
  }, [navigate]);

  const handleDelete = (id) => {
    setTourIdToDelete(id);
    setOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Файл слишком большой (макс. 5 МБ)");
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(file.type)) {
        toast.error("Формат файла должен быть JPEG, PNG, JPG или GIF");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditTour((prev) => ({ ...prev, image_preview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprove = (id) => {
    axiosClient
      .patch(`/tour/${id}/status`, { status: 2 })
      .then(() => {
        toast.success("Статус обновлен");
      })
      .catch(() => {
        toast.error("Что-то пошло не так");
      });
  };

  const confirmDelete = () => {
    if (!tourIdToDelete) return;
    axiosClient
      .delete(`/tour/${tourIdToDelete}`)
      .then(() => {
        setTours(tours.filter((tour) => tour.tour.id !== tourIdToDelete));
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

  const handleTopicChange = (topicId) => {
    setEditTour((prev) => {
      const topics = prev.extra_fields.topics.includes(topicId)
        ? prev.extra_fields.topics.filter((id) => id !== topicId)
        : [...prev.extra_fields.topics, topicId];
      return {
        ...prev,
        extra_fields: { ...prev.extra_fields, topics }
      };
    });
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
    const data = new FormData();

    data.append('_method', 'PUT');
    data.append("title", editTour.title);
    data.append("difficulty", editTour.difficulty);
    data.append("distance", Number(editTour.distance));
    data.append("description", editTour.description);
    data.append("date_start", editTour.date_start);
    data.append("date_end", editTour.date_end);
    data.append("location", editTour.location);
    data.append("max_participants", Number(editTour.max_participants));
    data.append("participants", 1);
    data.append("checklist", JSON.stringify(editTour.checklist));
    data.append("route", JSON.stringify(editTour.route));
    data.append("extra_fields", JSON.stringify(editTour.extra_fields || []));
    if (imageFile) {
      data.append("image", imageFile);
    }

    axiosClient
      .post(`/tour/${editTour.id}`, data)
      .then(({ data }) => {
        setTours(tours.map((item) =>
          item.tour.id === data.id ? { ...item, tour: data } : item
        ));
        setEditTour(null);
        toast.success("Тур успешно обновлён");
      })
      .catch(() => {
        toast.error("Не удалось сохранить изменения");
      });
  };

  const columns = [
    {
      accessorKey: "title",
      header: "Название",
      cell: ({ row }) => row.original.tour?.title || "Нет названия",
    },
    {
      accessorKey: "description",
      header: "Описание",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.original.tour.description}</div>
      ),
    },
    {
      accessorKey: "difficulty",
      header: "Сложность",
      cell: ({ row }) => row.original.tour.difficulty,
    },
    {
      accessorKey: "distance",
      header: "Дистанция",
      cell: ({ row }) => row.original.tour.distance,
    },
    {
      accessorKey: "participants",
      header: "Участники",
      cell: ({ row }) => row.original.tour.participants,
    },
    {
      accessorKey: "max_participants",
      header: "Макс. участников",
      cell: ({ row }) => row.original.tour.max_participants || "∞",
    },
    {
      accessorKey: "dates",
      header: "Даты",
      cell: ({ row }) =>
        `${new Date(row.original.tour.date_start).toLocaleDateString()} - ${new Date(
          row.original.tour.date_end
        ).toLocaleDateString()}`,
    },
    {
      accessorKey: "location",
      header: "Местоположение",
      cell: ({ row }) => row.original.tour.location,
    },
    {
      accessorKey: "checklist",
      header: "Чеклист",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.original.tour.checklist?.join(", ") || "Пусто"}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditTour(row.original.tour)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.tour.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            {...(row.original.tour.status > 0 ? { disabled: true } : {})}
            variant="outline"
            size="sm"
            onClick={() => handleApprove(row.original.tour.id)}
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: tours,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  if (loading) return <div className="min-h-screen bg-gray-100 p-6">Загрузка...</div>;
  if (!canEdit || !user.is_verified) return <ForbiddenPage />;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Модерирование туров</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Выбрать столбцы</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {table.getAllColumns().map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.columnDef.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
          <Dialog
            open={!!editTour}
            onOpenChange={() => {
              setEditTour(null);
              setImageFile(null);
            }}
          >
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Редактировать тур: {editTour.title || "Без названия"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    name="title"
                    value={editTour.title || ""}
                    onChange={handleEditChange}
                    required
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
                    value={editTour.difficulty || ""}
                    onValueChange={handleEditDifficultyChange}
                    required
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Выберите сложность" />
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
                    type="number"
                    value={editTour.distance || ""}
                    onChange={handleEditChange}
                    required
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="participants">Участники</Label>
                  <Input
                    id="participants"
                    name="participants"
                    type="number"
                    value={editTour.participants || ""}
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
                    value={editTour.date_start ? editTour.date_start.slice(0, 16) : ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <Label htmlFor="date_end">Дата окончания</Label>
                  <Input
                    id="date_end"
                    name="date_end"
                    type="datetime-local"
                    value={editTour.date_end ? editTour.date_end.slice(0, 16) : ""}
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
                  <Label htmlFor="image">Изображение</Label>
                  {editTour.image_url && (
                    <img
                      src={editTour.image_url}
                      alt="Preview"
                      className="mt-2 max-w-[200px] h-auto rounded"
                    />
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 h-15"
                  />
                </div>
                <div>
                  <Label>Темы обучения</Label>
                  {editTour.extra_fields.topics}
                  <div className="mt-2 space-y-2">
                    {trainingTopics.length > 0 ? (
                      trainingTopics.map((topic) => (
                        <div key={topic.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`topic-${topic.id}`}
                            checked={editTour.extra_fields?.topics?.includes(topic.id) || false}
                            onCheckedChange={() => handleTopicChange(topic.id)}
                          />
                          <Label htmlFor={`topic-${topic.id}`} className="cursor-pointer">
                            {topic.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">Темы обучения не найдены</p>
                    )}
                  </div>
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
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditTour(null);
                    setImageFile(null);
                  }}
                >
                  Отмена
                </Button>
                <Button onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
