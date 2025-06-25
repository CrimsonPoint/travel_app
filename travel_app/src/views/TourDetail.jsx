import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, MapPin, Users, Copy, BookOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import axiosClient from "../axios-client.js";
import { Toaster, toast } from "sonner";
import YandexMap from "../components/YandexMap.jsx";
import '../echo.js'
import TourChat from "@/components/TourChat.jsx";

export default function TourDetail() {
  const { id } = useParams();
  const [tourData, setTourData] = useState(null);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = "http://localhost:8876";
  const difficultyLabels = {
    "1": "Легкая",
    "2": "Средняя",
    "3": "Сложная",
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosClient.get(`/tour/${id}`),
      axiosClient.get('/user')
    ])
      .then(([{ data: tourData }, { data: userData }]) => {
        setTourData(tourData);
        setIsSignedUp(tourData.user_is_participant);
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить данные");
        setLoading(false);
      });
  }, [id]);

  const handleSignUp = () => {
    axiosClient
      .post(`/tours/${id}/signup`)
      .then(() => {
        toast.success("Вы успешно записались на тур");
        setIsSignedUp(true);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message ?? "Что-то пошло не так");
      });
  };

  const copyChecklist = () => {
    if (tourData?.tour?.checklist?.length > 0) {
      const checklistText = tourData.tour.checklist.join("\n");
      navigator.clipboard
        .writeText(checklistText)
        .then(() => toast.success("Список скопирован"))
        .catch(() => toast.error("Ошибка при копировании"));
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-100 p-6">Загрузка...</div>;
  if (error) return <div className="min-h-screen bg-gray-100 p-6 text-red-500">{error}</div>;
  if (!tourData || !tourData.tour) return <div className="min-h-screen bg-gray-100 p-6">Тур не найден</div>;

  const imageUrl = tourData.tour.image_url ? `${baseUrl}${tourData.tour.image_url}` : "/placeholder.svg";
  const isCreator = user?.id === tourData.creator.id;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{tourData.tour.title}</h1>
          <img
            src={imageUrl}
            alt={tourData.tour.title || "Tour image"}
            className="w-full h-96 object-cover rounded-lg shadow-md"
          />
        </div>

        {tourData.tour.route && tourData.tour.route.start && tourData.tour.route.end && (
          <YandexMap start={tourData.tour.route.start} end={tourData.tour.route.end} />
        )}

        { isSignedUp && (
          <TourChat tourId={id} user={user} isSignedUp={isSignedUp} />
        )}

        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            {tourData.creator.avatar ? (
              <AvatarImage src={tourData.creator.avatar} alt={tourData.creator.name} />
            ) : (
              <AvatarFallback className="bg-gray-200">
                {tourData.creator.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <p className="text-gray-600">Создатель: {tourData.creator.name}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Сложность: {difficultyLabels[tourData.tour.difficulty] || tourData.tour.difficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Дистанция: {tourData.tour.distance} км</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <span>
              {tourData.tour.participants} / {tourData.tour.max_participants || "∞"} участников
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span>
              {new Date(tourData.tour.date_start).toLocaleDateString("ru-RU")} -{" "}
              {new Date(tourData.tour.date_end).toLocaleDateString("ru-RU")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <span>{tourData.tour.location || "Местоположение не указано"}</span>
          </div>
          { tourData.tour.topics.length > 0 && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer hover:text-blue-600">
                    <BookOpen className="h-5 w-5" />
                    <span>Требуемое обучение</span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Необходимые темы обучения</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {tourData.tour.topics.map((topic) => (
                        <li key={topic.id}>
                          <a
                            href={`/save_tourism/${topic.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {topic.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description">
            <AccordionTrigger className="text-lg font-semibold cursor-pointer">
              Описание тура
            </AccordionTrigger>
            <AccordionContent>
              {tourData.tour.description || "Описание не указано"}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Что взять с собой</h2>
            {tourData.tour.checklist?.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyChecklist}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Копировать
              </Button>
            )}
          </div>
          {tourData.tour.checklist?.length > 0 ? (
            <ul className="space-y-2">
              {tourData.tour.checklist.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Checkbox id={`checklist-${index}`} />
                  <label
                    htmlFor={`checklist-${index}`}
                    className="text-gray-700 cursor-pointer select-none"
                  >
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Список вещей не указан</p>
          )}
        </div>

        <Button
          className="w-full max-w-xs"
          onClick={handleSignUp}
          disabled={isSignedUp || tourData.user_status === 2}
        >
          {isSignedUp ? "Вы записаны" : tourData.user_status === 2 ? "Запись заблокирована" : "Записаться"}
        </Button>
      </div>
    </div>
  );
}
