import TourCard from "./TourCard";
import {useState, useEffect} from "react";
import axiosClient from "../axios-client.js";
import {toast} from "sonner";

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
    return axiosClient
      .post(`/tours/${tourId}/signup`)
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message ?? "Что-то пошло не так");
        throw err;
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tours.map((data) => (
          <TourCard
            key={data.tour.id}
            id={data.tour.id}
            title={data.tour.title}
            imageUrl={data.tour.imageUrl}
            creatorName={data.creator.name}
            creatorAvatar={data.creator.avatar}
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
