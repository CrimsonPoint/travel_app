import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Clock, Pencil, Trash2 } from 'lucide-react';
import axiosClient from "../axios-client.js";
import { toast } from "sonner";

const SafeTourismPage = () => {
  const [trainingTopics, setTrainingTopics] = useState([]);
  const [userRecords, setUserRecords] = useState([]);
  const [completedTopics, setCompletedTopics] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    duration: '',
    slides: [{ image: '', title: '', description: '' }],
  });

  useEffect(() => {
    axiosClient
      .get("/training-topics")
      .then(({ data }) => {
        setTrainingTopics(data || []);
      })
      .catch((err) => {
        toast.error("Ошибка загрузки тем");
      });

    axiosClient
      .get("/training-records")
      .then(({ data }) => {
        setUserRecords(data)
      })
      .catch((err) => {
        toast.error("Ошибка получения записей о прохождении");
      });
  }, []);

  const markAsCompleted = (topicId) => {
    axiosClient
      .post("/training-user", {
        id: topicId,
      })
      .then(({ data }) => {
        setUserRecords([...userRecords, topicId])
      })
      .catch((err) => {
        toast.error("Ошибка прохождения");
      });

    axiosClient
      .get("/training-records")
      .then(({ data }) => {
        setUserRecords(data)
      })
      .catch((err) => {
        toast.error("Ошибка получения записей о прохождении");
      });
  };

  const openDialog = (topic = null) => {
    if (topic) {
      setFormData({
        id: topic.id,
        title: topic.title,
        duration: topic.duration,
        slides: topic.slides.length > 0 ? topic.slides : [{ image: '', title: '', description: '' }],
      });
    } else {
      setFormData({
        id: null,
        title: '',
        duration: '',
        slides: [{ image: '', title: '', description: '' }],
      });
    }
    setIsDialogOpen(true);
  };

  const handleFormChange = (e, field, slideIndex = null) => {
    if (slideIndex !== null) {
      setFormData((prev) => {
        const newSlides = [...prev.slides];
        newSlides[slideIndex] = { ...newSlides[slideIndex], [field]: e.target.value };
        return { ...prev, slides: newSlides };
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const addSlide = () => {
    setFormData((prev) => ({
      ...prev,
      slides: [...prev.slides, { image: '', title: '', description: '' }],
    }));
  };

  const removeSlide = (index) => {
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
  };

  const saveTopic = async () => {
    try {
      const payload = {
        title: formData.title,
        duration: formData.duration,
        slides: formData.slides,
      };

      if (formData.id) {
        const { data } = await axiosClient.put(`/training-topics/${formData.id}`, payload);
        setTrainingTopics((prev) =>
          prev.map((topic) => (topic.id === formData.id ? data : topic))
        );
        toast.success("Тема успешно обновлена");
      } else {
        const { data } = await axiosClient.post('/training-topics', payload);
        setTrainingTopics((prev) => [...prev, data]);
        toast.success("Тема успешно создана");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Ошибка сохранения темы");
      console.error('Ошибка сохранения темы:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Обучение безопасному туризму</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>Создать тему</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{formData.id ? 'Редактировать тему' : 'Создать новую тему'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Название</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFormChange(e, 'title')}
                    placeholder="Введите название темы"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Время прохождения</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => handleFormChange(e, 'duration')}
                    placeholder="Например, 10 минут"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Слайды</label>
                  {formData.slides.map((slide, index) => (
                    <div key={index} className="border p-4 rounded-lg mb-4 relative">
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm text-gray-600">Изображение слайда {index + 1}</label>
                          <Input
                            value={slide.image}
                            onChange={(e) => handleFormChange(e, 'image', index)}
                            placeholder="URL изображения"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600">Заголовок слайда {index + 1}</label>
                          <Input
                            value={slide.title}
                            onChange={(e) => handleFormChange(e, 'title', index)}
                            placeholder="Заголовок слайда"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600">Описание слайда {index + 1}</label>
                          <Textarea
                            value={slide.description}
                            onChange={(e) => handleFormChange(e, 'description', index)}
                            placeholder="Описание слайда"
                          />
                        </div>
                      </div>
                      {formData.slides.length > 1 && (
                        <Button
                          variant="ghost"
                          className="absolute top-2 right-2 text-red-500"
                          onClick={() => removeSlide(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addSlide}>
                    Добавить слайд
                  </Button>
                </div>
                <Button onClick={saveTopic}>Сохранить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingTopics.map((topic) => (
            <div key={topic.id} className="relative">
              <Link to={`/save_tourism/${topic.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">{topic.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-600">{topic.duration} мин</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2
                        className={`h-5 w-5 ${userRecords.includes(topic.id) ? 'text-green-500' : 'text-gray-400'}`}
                      />
                      <span className={userRecords.includes(topic.id) ? 'text-green-600' : 'text-gray-600'}>
                        {userRecords.includes(topic.id) ? 'Пройдено' : 'Не пройдено'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        markAsCompleted(topic.id);
                      }}
                    >
                      Отметить как пройдено
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => openDialog(topic)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafeTourismPage;
