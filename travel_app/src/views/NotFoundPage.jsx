import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center text-gray-900">
            404
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Упси, страница не найдена(
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-700">
            Кажется, вы заблудились! Страница, которую вы искали, не существует или была перемещена.
          </p>
          <div className="flex justify-center mt-10">
            <Button asChild>
              <Link to="/" className="font-medium">
                Вернуться на главную
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
