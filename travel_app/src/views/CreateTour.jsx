import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import axiosClient from "../axios-client.js";
import { toast } from "sonner";

export default function CreateTour() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "2",
    distance: "",
    description: "",
    date_start: "",
    date_end: "",
    location: "",
    max_participants: "",
    checklist: [],
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [checklistItem, setChecklistItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDifficultyChange = (value) => {
    setFormData((prev) => ({ ...prev, difficulty: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Файл слишком большой (макс. 2MB)");
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const addChecklistItem = () => {
    if (checklistItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        checklist: [...prev.checklist, checklistItem.trim()],
      }));
      setChecklistItem("");
    }
  };

  const removeChecklistItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("difficulty", formData.difficulty);
    data.append("distance", Number(formData.distance));
    data.append("description", formData.description);
    data.append("date_start", formData.date_start);
    data.append("date_end", formData.date_end);
    data.append("location", formData.location);
    data.append("max_participants", Number(formData.max_participants));
    data.append("participants", 1);
    data.append("checklist", JSON.stringify(formData.checklist));
    if (image) {
      data.append("image", image);
    }

    axiosClient
      .post("/tour/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(({ data }) => {
        setLoading(false);
        toast.success("Тур успешно создан");
        navigate(`/tour/${data.tour.id}`);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.response?.data?.message || "Ошибка при создании тура");
        console.log(err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Создать новый тур</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="mb-2" htmlFor="title">
              Название тура
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Введите название тура"
              required
            />
          </div>

          <div>
            <Label className="mb-2" htmlFor="image">
              Изображение
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 h-32 w-32 object-cover rounded-md"
              />
            )}
          </div>

          <div>
            <Label className="mb-2" htmlFor="difficulty">
              Сложность
            </Label>
            <Select value={formData.difficulty} onValueChange={handleDifficultyChange}>
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
            <Label className="mb-2" htmlFor="distance">
              Дистанция (км)
            </Label>
            <Input
              id="distance"
              name="distance"
              type="number"
              value={formData.distance}
              onChange={handleChange}
              placeholder="Введите дистанцию в километрах"
              min="0"
            />
          </div>

          <div>
            <Label className="mb-2" htmlFor="description">
              Описание
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Опишите тур..."
              rows={4}
            />
          </div>

          <div>
            <Label className="mb-2" htmlFor="date_start">
              Дата начала
            </Label>
            <Input
              id="date_start"
              name="date_start"
              type="datetime-local"
              value={formData.date_start}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label className="mb-2" htmlFor="date_end">
              Дата окончания
            </Label>
            <Input
              id="date_end"
              name="date_end"
              type="datetime-local"
              value={formData.date_end}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label className="mb-2" htmlFor="location">
              Местоположение
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Введите местоположение"
            />
          </div>

          <div>
            <Label className="mb-2" htmlFor="max_participants">
              Максимальное количество участников
            </Label>
            <Input
              id="max_participants"
              name="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={handleChange}
              placeholder="Введите максимальное число участников"
              min="2"
            />
          </div>

          <div>
            <Label className="mb-2">Чеклист</Label>
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
              {formData.checklist.map((item, index) => (
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Создание..." : "Создать тур"}
          </Button>
        </form>
      </div>
    </div>
  );
}
