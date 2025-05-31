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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    duration: '',
    slides: [{ image: null, title: '', description: '', existingImageUrl: null }],
  });
  const [previews, setPreviews] = useState([]);
  const baseUrl = "http://localhost:8876";

  useEffect(() => {
    axiosClient
      .get("/training-topics")
      .then(({ data }) => {
        setTrainingTopics(data || []);
      })
      .catch(() => {
        toast.error("Ошибка загрузки тем");
      });

    axiosClient
      .get("/training-records")
      .then(({ data }) => {
        setUserRecords(data || []);
      })
      .catch(() => {
        toast.error("Ошибка получения записей о прохождении");
      });
  }, []);

  const markAsCompleted = (topicId) => {
    axiosClient
      .post("/training-user", { id: topicId })
      .then(() => {
        setUserRecords([...userRecords, topicId]);
        toast.success("Тема отмечена как пройденная");
      })
      .catch(() => {
        toast.error("Ошибка прохождения");
      });

    axiosClient
      .get("/training-records")
      .then(({ data }) => {
        setUserRecords(data || []);
      })
      .catch(() => {
        toast.error("Ошибка получения записей о прохождении");
      });
  };

  const openDialog = (topic = null) => {
    if (topic) {
      setFormData({
        id: topic.id,
        title: topic.title || '',
        duration: topic.duration || '',
        slides: topic.slides?.length > 0
          ? topic.slides.map(slide => ({
            image: null,
            title: slide.title || '',
            description: slide.description || '',
            existingImageUrl: slide.image ? `${baseUrl}/${slide.image}` : null
          }))
          : [{ image: null, title: '', description: '', existingImageUrl: null }],
      });
      setPreviews(topic.slides?.length > 0 ? topic.slides.map(slide => slide.image ? `${baseUrl}/${slide.image}` : null) : [null]);
    } else {
      setFormData({
        id: null,
        title: '',
        duration: '',
        slides: [{ image: null, title: '', description: '', existingImageUrl: null }],
      });
      setPreviews([null]);
    }
    setIsDialogOpen(true);
  };

  const handleFormChange = (e, field, slideIndex = null) => {
    if (slideIndex !== null && field !== 'image') {
      setFormData((prev) => {
        const newSlides = [...prev.slides];
        newSlides[slideIndex] = { ...newSlides[slideIndex], [field]: e.target.value };
        return { ...prev, slides: newSlides };
      });
    } else if (field !== 'image') {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleImageChange = (e, slideIndex) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error("Файл слишком большой (макс. 2MB)");
        return;
      }
      setFormData((prev) => {
        const newSlides = [...prev.slides];
        newSlides[slideIndex] = {
          ...newSlides[slideIndex],
          image: file,
          existingImageUrl: null
        };
        return { ...prev, slides: newSlides };
      });
      setPreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews[slideIndex] = URL.createObjectURL(file);
        return newPreviews;
      });
    }
  };

  const addSlide = () => {
    setFormData((prev) => ({
      ...prev,
      slides: [...prev.slides, { image: null, title: '', description: '', existingImageUrl: null }],
    }));
    setPreviews((prev) => [...prev, null]);
  };

  const removeSlide = (index) => {
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const saveTopic = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error("Название темы обязательно");
        return;
      }
      if (!formData.duration.trim()) {
        toast.error("Время прохождения обязательно");
        return;
      }
      if (formData.slides.some(slide => !slide.title.trim())) {
        toast.error("Все заголовки слайдов должны быть заполнены");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('duration', formData.duration);

      formData.slides.forEach((slide, index) => {
        formDataToSend.append(`slides[${index}][title]`, slide.title);
        formDataToSend.append(`slides[${index}][description]`, slide.description || '');

        if (slide.image instanceof File) {
          formDataToSend.append(`slides[${index}][image]`, slide.image);
        }
      });

      if (formData.id) {
        const response = await axiosClient.put(`/training-topics/${formData.id}`, {
          title: formData.title,
          duration: formData.duration,
          slides: formData.slides
        });

        let responseData = response.data.data;
        setTrainingTopics((prev) =>
          prev.map((topic) => (topic.id === formData.id ? responseData : topic))
        );
        toast.success("Тема успешно обновлена");
      } else {
        const response = await axiosClient.post('/training-topics', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        let responseData = response.data.data;
        setTrainingTopics((prev) => [...prev, responseData]);
        toast.success("Тема успешно создана");
      }

      setIsDialogOpen(false);

      previews.forEach((preview) => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
      setPreviews([]);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ошибка сохранения темы";
      const validationErrors = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(", ")
        : "";
      toast.error(`${errorMessage}${validationErrors ? `: ${validationErrors}` : ""}`);
      console.error('Ошибка сохранения темы:', error.response?.data || error);
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Время прохождения</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => handleFormChange(e, 'duration')}
                    placeholder="Например, 10 минут"
                    required
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
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                            className="mt-1 h-15"
                          />
                          {(previews[index] || slide.existingImageUrl) && (
                            <img
                              src={previews[index] || slide.existingImageUrl}
                              alt={`Preview ${index + 1}`}
                              className="mt-2 h-32 w-32 object-cover rounded-md"
                              onError={() => console.log(`Failed to load image for slide ${index + 1}`)}
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600">Заголовок слайда {index + 1}</label>
                          <Input
                            value={slide.title}
                            onChange={(e) => handleFormChange(e, 'title', index)}
                            placeholder="Заголовок слайда"
                            required
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
          {trainingTopics
            .filter(topic => topic && topic.id)
            .map((topic) => (
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
                        disabled={userRecords.includes(topic.id)}
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
