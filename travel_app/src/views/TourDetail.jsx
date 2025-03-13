import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Calendar, MapPin, Users} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {Copy} from 'lucide-react'

export default function TourDetail({
    title = "Без названия",
    imageUrl = null,
    creatorName = "Неизвестный",
    creatorAvatar = null,
    difficulty = "Средняя",
    distance = "0 км",
    participants = 0,
    description = "Описание тура отсутствует",
    dates = "Даты не указаны",
    location = "Местоположение не указано",
    maxParticipants = 0,
    checklist = [],
    onSignUp = () => {
    },
}) {
  const [isSignedUp, setIsSignedUp] = useState(false);

  const handleSignUp = () => {
    setIsSignedUp(true);
    onSignUp();
  };

  const copyChecklist = () => {

  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
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
            {creatorAvatar ? (
              <AvatarImage src={creatorAvatar} alt={creatorName} />
            ) : (
              <AvatarFallback>
                {creatorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <p className="text-gray-600">Создатель: {creatorName}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Сложность: {difficulty}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Дистанция: {distance}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <span>{participants} / {maxParticipants}  участников</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span>{dates}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <span>{location}</span>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description">
            <AccordionTrigger className="text-lg font-semibold cursor-pointer">
              Описание тура
            </AccordionTrigger>
            <AccordionContent>{description}</AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Что взять с собой
            <Button
              className="mr-10 bg-gray h-5 w-5 cursor-pointer"
              onClick={copyChecklist}
            >
              <Copy />
            </Button>
          </h2>
          {checklist.length > 0 ? (
            <ul className="space-y-2">
              {checklist.map((item, index) => (
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
          disabled={isSignedUp}
        >
          {isSignedUp ? "Вы записаны" : "Записаться"}
        </Button>
      </div>
    </div>
  );
}
