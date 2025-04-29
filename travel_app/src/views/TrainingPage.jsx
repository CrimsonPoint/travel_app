import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import axiosClient from "../axios-client.js";

const TrainingPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка темы с бэкенда
  useEffect(() => {
    axiosClient
      .get(`/training-topics/${topicId}`)
      .then(({ data }) => {
        setTopic(data);
        setLoading(false);
      })
      .catch((err) => {
        /*toast.error(err)*/
        console.error('Ошибка загрузки темы:', error);
      });
  }, [topicId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (error || !topic) {
    return <div className="min-h-screen flex items-center justify-center">Тема не найдена</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">{topic.title}</h1>
        <Carousel className="w-full">
          <CarouselContent>
            {topic.slides.map((slide, index) => (
              <CarouselItem key={index}>
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-center">{slide.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                    <p className="text-gray-600 text-center">{slide.description}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
        <div className="flex justify-center mt-6">
          <Button onClick={() => navigate('/save_tourism')}>Вернуться к темам</Button>
        </div>
      </div>
    </div>
  );
};

export default TrainingPage;
