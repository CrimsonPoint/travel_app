import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Users} from "lucide-react";
import {useState} from "react";
import { Link } from "react-router-dom";

export default function TourCard({
  id,
  title = "Без названия",
  imageUrl = null,
  creatorName = "Неизвестный",
  creatorAvatar = null,
  difficulty = "Средняя",
  distance = "0",
  participants = 0,
  maxParticipants = 0,
  onSignUp = () => {
  },
  isParticipants = false,
}) {
  const [isSignedUp, setIsSignedUp] = useState(isParticipants);
  const [tourParticipants, setTourParticipants] = useState(participants);

  const handleSignUp = function () {
    onSignUp()
      .then(() => {
        setIsSignedUp(true);
        setTourParticipants(tourParticipants + 1);
      })
      .catch(() => {

      });
  };

  let difficulties = [
    {
      id: 1,
      name: "Легкая",
      colorClass: 'bg-green-200',
    },
    {
      id: 2,
      name: "Средняя",
      colorClass: 'bg-yellow-200',
    },
    {
      id: 3,
      name: "Высокая",
      colorClass: 'bg-red-200',
    },
  ]
  const getDifficulty = (lvl) => {
    const difficulty = difficulties.find((d) => d.id === Number(lvl));
    return difficulty ? difficulty : { name: 'Неизвестно' };
  }

  const tourDifficulty = getDifficulty(difficulty);

  return (
    <Card className="w-full max-w-sm overflow-hidden">
      {imageUrl ? (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Фото отсутствует</span>
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            <Link to={`/tour/${id}`}>{title}</Link>
          </CardTitle>
          <Avatar className="h-8 w-8">
            {creatorAvatar ? (
              <AvatarImage src={creatorAvatar} alt={creatorName}/>
            ) : (
              <AvatarFallback>
                {creatorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <p className="text-sm text-gray-600">Создатель: {creatorName}</p>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex gap-3 flex-wrap">
          <Badge className={`w-[140px] ${tourDifficulty.colorClass}`} variant="secondary">Сложность: {tourDifficulty.name}</Badge>
          <Badge variant="secondary">Дистанция: {distance} км</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Users className="h-4 w-4"/>
          <span>{tourParticipants} / {maxParticipants}  участников</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full cursor-pointer"
          onClick={handleSignUp}
          disabled={isSignedUp}
        >
          {isSignedUp ? "Вы записаны" : "Записаться"}
        </Button>
      </CardFooter>
    </Card>
  );
}
