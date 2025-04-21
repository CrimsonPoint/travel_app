import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

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
        onSignUp = () => {},
        isParticipants = false,
    }) {
  const [isSignedUp, setIsSignedUp] = useState(isParticipants)
  const [tourParticipants, setTourParticipants] = useState(participants)
  const baseUrl = "http://localhost:8876";

  const handleSignUp = () => {
    onSignUp()
      .then(() => {
        setIsSignedUp(true)
        setTourParticipants(tourParticipants + 1)
      })
      .catch(() => {})
  }

  const difficulties = [
    {
      id: 1,
      name: "Легкая",
      colorClass: "text-green-700 bg-green-100",
      borderClass: "border-green-200",
    },
    {
      id: 2,
      name: "Средняя",
      colorClass: "text-amber-700 bg-amber-100",
      borderClass: "border-amber-200",
    },
    {
      id: 3,
      name: "Высокая",
      colorClass: "text-red-700 bg-red-100",
      borderClass: "border-red-200",
    },
  ]

  const getDifficulty = (lvl) => {
    const difficulty = difficulties.find((d) => d.id === Number(lvl))
    return difficulty ? difficulty : { name: "Неизвестно", colorClass: "", borderClass: "" }
  }

  const tourDifficulty = getDifficulty(difficulty)

  const participantsPercentage = maxParticipants > 0 ? (tourParticipants / maxParticipants) * 100 : 0
  const isFull = tourParticipants >= maxParticipants

  return (
    <Card className="w-full overflow-hidden transition-all duration-200 hover:shadow-md group">
      <Link to={`/tour/${id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden">
          {imageUrl ? (
            <img
              src={`${baseUrl}/` + imageUrl || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Фото отсутствует</span>
            </div>
          )}
          <Badge className={`absolute top-3 left-3 ${tourDifficulty.colorClass} border ${tourDifficulty.borderClass}`}>
            {tourDifficulty.name}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 mb-1">
              <Link to={`/tour/${id}`} className="hover:underline">
                {title}
              </Link>
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{distance} км</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
              {creatorAvatar ? (
                <AvatarImage src={creatorAvatar || "/placeholder.svg"} alt={creatorName} />
              ) : (
                <AvatarFallback>{creatorName.charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
            <span className="text-xs text-muted-foreground mt-1">{creatorName}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>Участники</span>
            </div>
            <span className="font-medium">
              {tourParticipants} / {maxParticipants}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isFull ? "bg-red-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min(participantsPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0">
        <Button
          className="w-full"
          onClick={handleSignUp}
          disabled={isSignedUp || isFull}
          variant={isSignedUp ? "outline" : "default"}
        >
          {isSignedUp ? "Вы записаны" : isFull ? "Мест нет" : "Записаться"}
        </Button>
      </CardFooter>
    </Card>
  )
}
