import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axiosClient from "../axios-client.js";
import { Toaster, toast } from "sonner";

export default function TourChat({ tourId, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    axiosClient
      .get(`/tours/${tourId}/chat`)
      .then(({ data }) => {
        setMessages(data.messages || []);
      })
      .catch(() => {
        toast.error("Не удалось загрузить сообщения");
      });

    window.Echo.channel(`tour-chat.${tourId}`)
      .listen('.message.sent', (e) => {
        setMessages((prev) => [...prev, e.data]);
      });

    return () => {
      window.Echo.leave(`tour-chat.${tourId}`);
    };
  }, [tourId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axiosClient.post(`/tours/${tourId}/chat`, {
        message: newMessage,
      });
      setNewMessage("");
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      toast.error("Не удалось отправить сообщение");
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Чат участников</h2>
      <>
        <div
          ref={chatContainerRef}
          className="h-96 overflow-y-auto mb-4 p-4 border rounded-lg"
        >
          {messages.length === 0 ? (
            <p className="text-gray-500">Пока нет сообщений</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  msg.user_id === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[70%] ${
                    msg.user_id === user.id ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.user.avatar} alt={msg.user.name} />
                    <AvatarFallback>{msg.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`p-3 rounded-lg ${
                      msg.user_id === user.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm font-semibold">{msg.user.name}</p>
                    <p>{msg.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString("ru-RU")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1"
          />
          <Button type="submit">Отправить</Button>
        </form>
      </>
    </div>
  );
}
