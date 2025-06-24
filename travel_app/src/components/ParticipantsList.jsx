import { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { Toaster, toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ParticipantsList({ tourId, isCreator }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isCreator) return;

    setLoading(true);
    axiosClient
      .get(`/tours/${tourId}/participants`)
      .then(({ data }) => {
        setParticipants(data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Не удалось загрузить список участников");
        setLoading(false);
      });
  }, [tourId, isCreator]);

  const handleAccept = (participantId) => {
    axiosClient
      .post(`/tours/${tourId}/accept`, { participant_id: participantId })
      .then(() => {
        toast.success("Пользователь принят в тур");
        setParticipants((prev) =>
          prev.map((p) => (p.id === participantId ? { ...p, status: 1 } : p))
        );
      })
      .catch(() => toast.error("Ошибка при принятии пользователя"));
  };

  const handleBlock = (participantId) => {
    axiosClient
      .post(`/tours/${tourId}/block`, { participant_id: participantId })
      .then(() => {
        toast.success("Пользователь заблокирован");
        setParticipants((prev) =>
          prev.map((p) => (p.id === participantId ? { ...p, status: 2 } : p))
        );
      })
      .catch(() => toast.error("Ошибка при блокировке пользователя"));
  };

  if (!isCreator) return null;
  if (loading) return <div>Загрузка участников...</div>;
  if (participants.length === 0) return <div>Нет участников</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Участники тура</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Пользователь</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {participant.avatar ? (
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                  ) : (
                    <AvatarFallback>
                      {participant.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span>{participant.name || `Пользователь ${participant.user_id}`}</span>
              </TableCell>
              <TableCell>
                {participant.status === 0 && "Ожидает"}
                {participant.status === 1 && "Принят"}
                {participant.status === 2 && "Заблокирован"}
              </TableCell>
              <TableCell>
                {participant.status === 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleAccept(participant.id)}
                    >
                      Принять
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBlock(participant.id)}
                    >
                      Заблокировать
                    </Button>
                  </>
                )}
                {participant.status === 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBlock(participant.id)}
                  >
                    Заблокировать
                  </Button>
                )}
                {participant.status === 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAccept(participant.id)}
                  >
                    Разблокировать и принять
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
