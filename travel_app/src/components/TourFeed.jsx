import TourCard from "./TourCard";
import { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {Filter, MapPin, Search, X} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function TourFeed() {
  const [tours, setTours] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    difficulty: "",
    distance: [0, 100],
    location: "",
    date_start: "",
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const fetchTours = async () => {
    try {
      const { data } = await axiosClient.post("/tours", {
        search,
        page,
        difficulty: filters.difficulty,
        distance_min: filters.distance[0],
        distance_max: filters.distance[1],
        location: filters.location,
        date_start: filters.date_start,
      });
      setTours(data.data);
      setTotalPages(data.last_page);
    } catch (err) {
      toast.error("Не удалось загрузить туры");
    }
  };

  useEffect(() => {
    fetchTours();
  }, [page, filters]);

  useEffect(() => {
    let count = 0;
    if (filters.difficulty) count++;
    if (filters.distance[0] > 0 || filters.distance[1] < 100) count++;
    if (filters.location) count++;
    if (filters.date_start) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleSignUp = (tourId) => {
    return axiosClient
      .post(`/tours/${tourId}/signup`)
      .then((response) => {
        fetchTours();
        return response.data;
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message ?? "Что-то пошло не так");
        throw err;
      });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      difficulty: "",
      distance: [0, 100],
      location: "",
      date_start: "",
    });
  };

  const difficultyLabels = {
    "1": "Легкий",
    "2": "Средний",
    "3": "Сложный",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const FilterContent = () => (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <SheetTitle>Фильтры</SheetTitle>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Сложность</label>
          <Select
            value={filters.difficulty}
            onValueChange={(value) => handleFilterChange("difficulty", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите сложность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="1">Легкий</SelectItem>
              <SelectItem value="2">Средний</SelectItem>
              <SelectItem value="3">Сложный</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Дистанция (км)</label>
          <Slider
            min={0}
            max={100}
            value={filters.distance}
            onValueChange={(value) => handleFilterChange("distance", value)}
            className="mt-2"
          />
          <div className="text-sm mt-1.5 text-gray-500">
            {filters.distance[0]} - {filters.distance[1]} км
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Локация</label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Введите локацию"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Дата начала</label>
          <Input
            type="date"
            value={filters.date_start}
            onChange={(e) => handleFilterChange("date_start", e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="bg-red-50 mt-auto h-8 px-2">
          <X className="h-4 w-4 mr-1" />
          Сбросить
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative gap-4 flex">
                    <div className="flex sm:w-120">
                      <Input
                        placeholder="Поиск по названию тура"
                        value={search}
                        onChange={handleSearchChange}
                        onKeyUp={(e) => {
                          if (e.key === 'Enter') {
                            fetchTours();
                          }
                        }}
                        className="pl-9"
                      />
                      <Button onClick={fetchTours} variant="outline" size="icon" className="shrink-0">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0">
                          <Filter className="h-4 w-4" />
                          {activeFiltersCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                              {activeFiltersCount}
                            </Badge>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right">
                        <FilterContent />
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.difficulty && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Сложность: {difficultyLabels[filters.difficulty]}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => handleFilterChange("difficulty", "")}
                      />
                    </Badge>
                  )}
                  {(filters.distance[0] > 0 || filters.distance[1] < 100) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Дистанция: {filters.distance[0]}-{filters.distance[1]} км
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => handleFilterChange("distance", [0, 100])}
                      />
                    </Badge>
                  )}
                  {filters.location && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Локация: {filters.location}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => handleFilterChange("location", "")}
                      />
                    </Badge>
                  )}
                  {filters.date_start && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Дата: {formatDate(filters.date_start)}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => handleFilterChange("date_start", "")}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {tours.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    isParticipants={data.user_is_participant}
                    maxParticipants={data.tour.max_participants}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Туры не найдены</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Назад
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Страница {page} из {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Вперед
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
