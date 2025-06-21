import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, setHours, setMinutes } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import axiosClient from "../axios-client.js";
import { toast } from "sonner";

export default function CreateTour() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "2",
    distance: "",
    description: "",
    date_start: null,
    date_end: null,
    location: "",
    max_participants: "",
    checklist: [],
    route: { start: [0, 0], end: [0, 0] },
    extra_fields: { topics: [] },
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [checklistItem, setChecklistItem] = useState("");
  const [trainingTopics, setTrainingTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    axiosClient
      .get('/training-topics')
      .then(({ data }) => {
        setTrainingTopics(data || []);
      })
      .catch(() => {
        toast.error("Не удалось загрузить темы обучения");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    let time = name === "date_start" ? startTime : endTime;
    let [hours, minutes] = time ? time.split(":") : [0, 0];
    date = setHours(setMinutes(date, parseInt(minutes)), parseInt(hours));
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleTimeChange = (name, value) => {
    const [hours, minutes] = value.split(":");
    setFormData((prev) => {
      const dateField = name === "startTime" ? "date_start" : "date_end";
      let date = prev[dateField] || new Date();
      date = setHours(setMinutes(date, parseInt(minutes)), parseInt(hours));
      return { ...prev, [dateField]: date };
    });
    if (name === "startTime") setStartTime(value);
    else setEndTime(value);
  };

  const handleRouteChange = (e, point, coord) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;
    setFormData((prev) => ({
      ...prev,
      route: {
        ...prev.route,
        [point]: prev.route[point].map((val, index) =>
          index === (coord === "lat" ? 0 : 1) ? value : val
        ),
      },
    }));
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

  const handleTopicChange = (topicId) => {
    setFormData((prev) => {
      const topics = prev.extra_fields.topics.includes(topicId)
        ? prev.extra_fields.topics.filter((id) => id !== topicId)
        : [...prev.extra_fields.topics, topicId];
      return {
        ...prev,
        extra_fields: { ...prev.extra_fields, topics }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { start, end } = formData.route;
    if (
      start[0] < -90 || start[0] > 90 || start[1] < -180 || start[1] > 180 ||
      end[0] < -90 || end[0] > 90 || end[1] < -180 || end[1] > 180
    ) {
      toast.error("Некорректные координаты. Широта: [-90, 90], долгота: [-180, 180]");
      return;
    }
    if (start[0] === 0 && start[1] === 0 || end[0] === 0 && end[1] === 0) {
      toast.error("Пожалуйста, введите начальную и конечную точки маршрута");
      return;
    }
    if (!formData.date_start || !formData.date_end) {
      toast.error("Пожалуйста, выберите даты и время начала и окончания");
      return;
    }
    if (formData.date_end < formData.date_start) {
      toast.error("Дата и время окончания не могут быть раньше даты и времени начала");
      return;
    }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("difficulty", formData.difficulty);
    data.append("distance", Number(formData.distance));
    data.append("description", formData.description);
    data.append("date_start", format(formData.date_start, "yyyy-MM-dd'T'HH:mm:ss"));
    data.append("date_end", format(formData.date_end, "yyyy-MM-dd'T'HH:mm:ss"));
    data.append("location", formData.location);
    data.append("max_participants", Number(formData.max_participants));
    data.append("participants", 1);
    data.append("checklist", JSON.stringify(formData.checklist));
    data.append("route", JSON.stringify(formData.route));
    data.append("extra_fields", JSON.stringify(formData.extra_fields));
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
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Создать новый тур</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-10">
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
              className="mt-1 h-15"
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
            <Label className="mb-2">Дата и время начала</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !formData.date_start && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date_start
                    ? format(formData.date_start, "PPP", { locale: ru })
                    : <span>Выберите дату и время</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date_start}
                  onSelect={(date) => handleDateChange("date_start", date)}
                  initialFocus
                  locale={ru}
                />
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleTimeChange("startTime", e.target.value)}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="mb-2">Дата и время окончания</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !formData.date_end && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date_end
                    ? format(formData.date_end, "PPP", { locale: ru })
                    : <span>Выберите дату и время</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date_end}
                  onSelect={(date) => handleDateChange("date_end", date)}
                  initialFocus
                  locale={ru}
                />
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleTimeChange("endTime", e.target.value)}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>
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
            <Label className="mb-2">Начальная точка маршрута</Label>
            <div className="flex gap-4">
              <div>
                <Label htmlFor="start_lat">Широта</Label>
                <Input
                  id="start_lat"
                  type="number"
                  step="any"
                  value={formData.route.start[0]}
                  onChange={(e) => handleRouteChange(e, "start", "lat")}
                  placeholder="Широта (например, 55.7539)"
                />
              </div>
              <div>
                <Label htmlFor="start_lng">Долгота</Label>
                <Input
                  id="start_lng"
                  type="number"
                  step="any"
                  value={formData.route.start[1]}
                  onChange={(e) => handleRouteChange(e, "start", "lng")}
                  placeholder="Долгота (например, 37.6208)"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2">Конечная точка маршрута</Label>
            <div className="flex gap-4">
              <div>
                <Label htmlFor="end_lat">Широта</Label>
                <Input
                  id="end_lat"
                  type="number"
                  step="any"
                  value={formData.route.end[0]}
                  onChange={(e) => handleRouteChange(e, "end", "lat")}
                  placeholder="Широта (например, 55.7512)"
                />
              </div>
              <div>
                <Label htmlFor="end_lng">Долгота</Label>
                <Input
                  id="end_lng"
                  type="number"
                  step="any"
                  value={formData.route.end[1]}
                  onChange={(e) => handleRouteChange(e, "end", "lng")}
                  placeholder="Долгота (например, 37.6177)"
                />
              </div>
            </div>
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
            <Label className="mb-2">Темы обучения</Label>
            <div className="mt-2 space-y-2">
              {trainingTopics.length > 0 ? (
                trainingTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`topic-${topic.id}`}
                      checked={formData.extra_fields.topics.includes(topic.id)}
                      onCheckedChange={() => handleTopicChange(topic.id)}
                    />
                    <Label htmlFor={`topic-${topic.id}`} className="cursor-pointer">
                      {topic.title}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Темы обучения не найдены</p>
              )}
            </div>
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
