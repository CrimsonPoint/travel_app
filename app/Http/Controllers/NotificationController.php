<?php

namespace App\Http\Controllers;

use App\Models\CustomNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = CustomNotification::where('user_id', Auth::id())
            ->latest()
            ->get();
        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $notification = CustomNotification::where('user_id', Auth::id())->findOrFail($id);
        $notification->update(['is_read' => true]);
        return response()->json(['message' => 'Notification marked as read']);
    }

    public function delete($id)
    {
        $notification = CustomNotification::where('user_id', Auth::id())->findOrFail($id);
        $notification->delete();
        return response()->json(['message' => 'Notification deleted']);
    }
}
