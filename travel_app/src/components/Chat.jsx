import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axiosClient from "../axios-client.js";
import echo from "../echo.js";
import { Toaster, toast } from "sonner";

export default function Chat({ tourId, isSignedUp }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!isSignedUp) return;

    axiosClient
      .get(`/tours/${tourId}/chat`)
      .then(({ data }) => {
        setMessages(data);
      })
      .catch(() => {
        toast.error("Не удалось загрузить сообщения");
      });
    
    const channel = echo.channel(`tour.${tourId}`);

    channel.listen(".message.sent", (e) => {
      setMessages((prev) => [
        ...prev,
        { message: e.message, user: e.user },
      ]);
    });

    return () => {
      channel.stopListening(".message.sent");
      echo.leave(`tour.${tourId}`);
    };
  }, [tourId, isSignedUp]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axiosClient.post(`/tours/${tourId}/chat`, {
        message: newMessage,
      });
      setNewMessage("");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Ошибка при отправке сообщения");
    }
  };

  if (!isSignedUp) {
    return (
      <div className="p-4 bg-gray-200 rounded-lg">
        <p className="text-gray-600">Чат доступен только для записанных участников</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold">Чат тура</h2>
      <div className="h-64 overflow-y-auto border rounded-lg p-4">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className="flex items-start gap-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.user.avatar} alt={msg.user.name} />
                <AvatarFallback>{msg.user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{msg.user.name}</p>
                <p>{msg.message}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Сообщений пока нет</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Отправить</Button>
      </div>
    </div>
  );
}
