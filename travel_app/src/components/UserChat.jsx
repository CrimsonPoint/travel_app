import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosClient from "../axios-client.js";
import { Toaster, toast } from "sonner";

export default function UserChat({ currentUser, profileUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const channelName = `user-chat.${
    [currentUser.id, profileUser.id].sort().join("-")
  }`;

  useEffect(() => {
    if (currentUser.id === profileUser.id) return;

    axiosClient
      .get(`/user/${profileUser.id}/chat`)
      .then(({ data }) => {
        setMessages(data.messages || []);
      })
      .catch(() => {
        toast.error("Не удалось загрузить сообщения");
      });

    window.Echo.channel(channelName)
      .listen(".message.sent", (e) => {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === e.data.id)) {
            return prev;
          }
          return [...prev, e.data];
        });
      });

    return () => {
      window.Echo.leave(channelName);
    };
  }, [channelName, profileUser.id]);

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const chatContainer = chatContainerRef.current;
    const isAtBottom =
      chatContainer.scrollHeight - chatContainer.scrollTop <=
      chatContainer.clientHeight + 50;

    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axiosClient.post(`/user/${profileUser.id}/chat`, {
        message: newMessage,
      });
      setNewMessage("");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      toast.error("Не удалось отправить сообщение");
    }
  };

  if (currentUser.id === profileUser.id) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Чат с {profileUser.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={chatContainerRef}
          className="h-96 overflow-y-auto mb-4 p-4 border rounded-lg"
        >
          {messages.length === 0 ? (
            <p className="text-gray-500">Пока нет сообщений</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${
                  msg.sender_id === currentUser.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[70%] ${
                    msg.sender_id === currentUser.id ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={msg.sender_id === currentUser.id ? currentUser.avatar : profileUser.avatar}
                      alt={msg.sender_id === currentUser.id ? currentUser.name : profileUser.name}
                    />
                    <AvatarFallback>
                      {(msg.sender_id === currentUser.id ? currentUser.name : profileUser.name)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`p-3 rounded-lg ${
                      msg.sender_id === currentUser.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {msg.sender_id === currentUser.id ? currentUser.name : profileUser.name}
                    </p>
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
      </CardContent>
    </Card>
  );
}
