<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\Tour;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function sendMessage(Request $request, $tourId)
    {
        $user = Auth::user();
        $tour = Tour::findOrFail($tourId);

        if (!$tour->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Вы не записаны на этот тур'], 403);
        }

        $message = $request->input('message');
        $savedMessage = Message::create([
            'tour_id' => $tourId,
            'user_id' => $user->id,
            'message' => $message,
        ]);

        event(new MessageSent($message, $user, $tourId));
        return response()->json(['status' => 'Сообщение отправлено']);
    }

    public function getMessages($tourId)
    {
        $user = Auth::user();
        $tour = Tour::findOrFail($tourId);

        if (!$tour->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Вы не записаны на этот тур'], 403);
        }

        // Здесь можно вернуть историю сообщений, если она хранится в базе
        // Например, если у вас есть модель Message
        // $messages = Message::where('tour_id', $tourId)->get();
        // return response()->json($messages);

        return response()->json([]);
    }
}
