import TourCard from "./TourCard";
import {useState, useEffect} from "react";
import axiosClient from "../axios-client.js";

export default function TourFeed() {

  const [tours, setTours] = useState([]);

  useEffect(() => {
    axiosClient
      .post("/tours")
      .then(({data}) => {
        setTours(data);
      })
      .catch((err) => {
      });
  }, []);

  const handleSignUp = (tourId) => {
    axiosClient
      .post(`/tours/${tourId}/signup`)
      .catch((err) => {
        // Временное решение
        console.log(err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tours.map((data) => (
          <TourCard
            key={data.tour.id}
            title={data.tour.title}
            imageUrl={data.tour.imageUrl}
            creatorName={data.tour.creatorName}
            creatorAvatar={data.tour.creatorAvatar}
            difficulty={data.tour.difficulty}
            distance={data.tour.distance}
            participants={data.tour.participants}
            onSignUp={() => handleSignUp(data.tour.id)}
            isParticipants = {data.user_is_participant}
            maxParticipants={data.tour.max_participants}
          />
        ))}
      </div>
    </div>
  );
}
