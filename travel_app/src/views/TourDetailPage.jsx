import TourDetail from "./TourDetail";

export default function TourDetailPage() {
  const tourData = {
    title: "Поход в горы Алтая",
    imageUrl: null,
    creatorName: "Иван Петров",
    creatorAvatar: null,
    difficulty: "Высокая",
    distance: "25 км",
    participants: 12,
    maxParticipants: 15,
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was p",
    dates: "15-20 июля 2025",
    location: "Республика Алтай, Россия",
    checklist: [
      "Рюкзак",
      "Спальный мешок",
      "Палатка",
      "Удобная обувь",
      "Вода и еда",
    ],
  };

  const handleSignUp = () => {
  };

  return (
    <TourDetail
      title={tourData.title}
      imageUrl={tourData.imageUrl}
      creatorName={tourData.creatorName}
      creatorAvatar={tourData.creatorAvatar}
      difficulty={tourData.difficulty}
      distance={tourData.distance}
      participants={tourData.participants}
      description={tourData.description}
      dates={tourData.dates}
      location={tourData.location}
      maxParticipants={tourData.maxParticipants}
      onSignUp={handleSignUp}
      checklist={tourData.checklist}
    />
  );
}
