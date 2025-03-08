import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Users} from "lucide-react";

export default function TourCard({
  title = "Без названия",
  imageUrl = null,
  creatorName = "Неизвестный",
  creatorAvatar = null,
  difficulty = "Средняя",
  distance = "0 км",
  participants = 0,
  onSignUp = () => {
  }
}) {
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
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
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
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">Сложность: {difficulty}</Badge>
          <Badge variant="secondary">Дистанция: {distance}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Users className="h-4 w-4"/>
          <span>{participants} участников</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={onSignUp}>
          Записаться
        </Button>
      </CardFooter>
    </Card>
  );
}
