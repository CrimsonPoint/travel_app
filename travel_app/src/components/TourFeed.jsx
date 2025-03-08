import TourCard from "./TourCard";

export default function TourFeed() {

  const tours = [
    {
      id: 1,
      title: "Поход в горы Алтая",
      imageUrl: null,
      creatorName: "Иван Петров",
      creatorAvatar: null,
      difficulty: "Сложная",
      distance: "25 км",
      participants: 12,
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
    },
  ];

  const handleSignUp = (tourId) => {
    console.log(`Запись на тур с ID: ${tourId}`);

    /** TODO Логика записи на тур */
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          />
        ))}
      </div>
    </div>
  );
}
