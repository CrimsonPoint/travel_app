import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Calendar, MapPin, Users, Copy} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import axiosClient from "../axios-client.js";

export default function TourDetail() {
  const {id} = useParams();
  const [tour, setTour] = useState(null);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(`/tour/${id}`)
      .then(({data}) => {
        console.log(data);
        setTour(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Не удалось загрузить данные тура");
        setLoading(false);
        console.log(id)
        console.log(err);
      });
  }, [id]);

  const handleSignUp = () => {
    setIsSignedUp(true);
    onSignUp();
  };

  const copyChecklist = () => {
    if (tour?.checklist?.length > 0) {
      const checklistText = tour.checklist.join("\n");
      navigator.clipboard.writeText(checklistText)
        .then(() => alert("Вы скопировали список"))
        .catch(() => alert("Ошибка копирования списка"));
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-100 p-6">Загрузка...</div>;
  if (error) return <div className="min-h-screen bg-gray-100 p-6 text-red-500">{error}</div>;
  if (!tour) return <div className="min-h-screen bg-gray-100 p-6">Тур не найден</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{tour.title}</h1>
          {tour.image_url ? (
            <img
              src={tour.image_url}
              alt={tour.title}
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow-md">
              <span className="text-gray-500">Фото отсутствует</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {tour.creator_avatar ? (
              <AvatarImage src={tour.creator_avatar} alt={tour.creator_name}/>
            ) : (
              <AvatarFallback>
                {tour.creator_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <p className="text-gray-600">Создатель: {tour.creator_name}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Сложность: {tour.difficulty}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Дистанция: {tour.distance}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600"/>
            <span>
              {tour.participants} / {tour.max_participants || "∞"} участников
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600"/>
            <span>
              {new Date(tour.date_start).toLocaleDateString()} -{" "}
              {new Date(tour.date_end).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600"/>
            <span>{tour.location}</span>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description">
            <AccordionTrigger className="text-lg font-semibold cursor-pointer">
              Описание тура
            </AccordionTrigger>
            <AccordionContent>{tour.description}</AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Что взять с собой</h2>
            {tour.checklist?.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyChecklist}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4"/>
                Копировать
              </Button>
            )}
          </div>
          {tour.checklist?.length > 0 ? (
            <ul className="space-y-2">
              {tour.checklist.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Checkbox id={`checklist-${index}`}/>
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
          disabled={isSignedUp}
        >
          {isSignedUp ? "Вы записаны" : "Записаться"}
        </Button>
      </div>
    </div>
  );
}
