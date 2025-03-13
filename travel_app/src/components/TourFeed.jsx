import TourCard from "./TourCard";
import {useState} from "react";

export default function TourFeed() {

  const tours = [
    {
      id: 1,
      title: "Поход в горы Алтая",
      imageUrl: null,
      creatorName: "Иван Петров",
      creatorAvatar: null,
      difficulty: "Высокая",
      distance: "25 км",
      participants: 12,
      maxParticipants: 15,
    },
    {
      id: 2,
      title: "Прогулка по лесу",
      imageUrl: null,
      creatorName: "Мария Иванова",
      creatorAvatar: null,
      difficulty: "Легкая",
      distance: "5 км",
      participants: 8,
      maxParticipants: 10,
    },
    {
      id: 3,
      title: "Велотур по побережью",
      imageUrl: null,
      creatorName: "Алексей Сидоров",
      creatorAvatar: null,
      difficulty: "Средняя",
      distance: "40 км",
      participants: 15,
      maxParticipants: 20,
    },
    {
      id: 4,
      title: "Хребет Урала",
      imageUrl: null,
      creatorName: "Ваня Петров",
      creatorAvatar: null,
      difficulty: "Высокая",
      distance: "65 км",
      participants: 1,
      maxParticipants: 5,
    },
    {
      id: 5,
      title: "Змеиные пики",
      imageUrl: null,
      creatorName: "Андрей Воронов",
      creatorAvatar: null,
      difficulty: "Высокая",
      distance: "120 км",
      participants: 1,
      maxParticipants: 3,
    },
  ];

  const handleSignUp = (tourId) => {
    console.log(`Запись на тур с ID: ${tourId}`);

    /** TODO Логика записи на тур */
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tours.map((tour) => (
          <TourCard
            key={tour.id}
            title={tour.title}
            imageUrl={tour.imageUrl}
            creatorName={tour.creatorName}
            creatorAvatar={tour.creatorAvatar}
            difficulty={tour.difficulty}
            distance={tour.distance}
            participants={tour.participants}
            onSignUp={() => handleSignUp(tour.id)}
            maxParticipants={tour.maxParticipants}
          />
        ))}
      </div>
    </div>
  );
}
