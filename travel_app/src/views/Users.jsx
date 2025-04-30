import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, User } from 'lucide-react';
import axiosClient from '../axios-client.js';
import { toast } from 'sonner';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get('/users')
      .then(({ data }) => {
        setUsers(data || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Ошибка загрузки пользователей');
        console.error('Ошибка загрузки пользователей:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (users.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Пользователи не найдены</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center">Все пользователи</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  {user.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                <Link to={`/profile/${user.id}`}>
                  <Button variant="outline" className="w-full">
                    Просмотреть профиль
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
