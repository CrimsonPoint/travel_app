import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center text-gray-900">
            403
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Доступ запрещен
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-700">
            К сожалению, у вас нет прав для доступа к этой странице.
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
