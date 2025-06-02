<?php

namespace App\Http\Controllers\Api;

use App\Events\DirectMessageSent;
use App\Http\Controllers\Controller;
use App\Models\DirectMessage;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function getUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user) {
            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Искомый пользователь не найден',
            ], 404);
        }
    }

    public function getAll() {
        $users = User::all()->toArray();

        $users = array_map(function ($user) {
            return [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
            ];
        }, $users);

        return response()->json($users);
    }

    public function getRoles(Request $request)
    {
        $roles = DB::table('roles')->get()->map(function ($item) {
            return (array)$item;
        })->toArray();

        return $roles;
    }

    public function index(Request $request)
    {
        $query = User::query()->with('roles:name,id');

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        if ($request->has('role') && $request->role) {
            if ($request->role != 'all') {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }
        }

        if ($request->has('is_blocked') && $request->is_blocked != 'all') {
            $query->where('is_blocked', $request->boolean('is_blocked'));
        }

        if ($request->has('is_verified') && $request->is_verified && $request->is_verified != 'all') {
            $query->where('is_verified', $request->boolean('is_verified'));
        }

        $perPage = $request->input('per_page', 10);
        $users = $query->paginate($perPage);
        $transformedUsers = $users->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_blocked' => $user->is_blocked,
                'is_verified' => $user->is_verified,
                'role' => $user->getRole()->name
            ];
        });

        return response()->json([
            'users' => $transformedUsers,
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'message' => 'Пользователи успешно получены',
        ]);
    }

    public function store(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Доступ запрещен'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'roles' => 'array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_verified' => false,
            'is_blocked' => false,
        ]);


        $roleId = DB::table('roles')
            ->where('name', $validated['roles'])
            ->first()->id;

        if ($roleId) {
            $user->setUserRole($roleId);
        }

        return response()->json([
            'message' => 'Пользователь успешно создан',
        ], 201);
    }

    public function updateRoles(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $roleId = DB::table('roles')
            ->where('name', $validated['roles'])
            ->first()->id;

        $user->setUserRole($roleId);

        return response()->json([
            'message' => 'Роли пользователя обновлены',
        ]);
    }

    public function toggleBlock(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->is_blocked = !$user->is_blocked;
        $user->tokens()->delete();
        $user->save();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_blocked' => $user->is_blocked,
                'token' => $user->token,
                'role' => $user->getRole()->name
            ],
            'message' => $user->is_blocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
        ]);
    }

    public function verify(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->is_verified = true;
        $user->email_verified_at = now();
        $user->save();

        return response()->json([
            'user' => $user,
            'message' => 'Пользователь подтвержден',
        ]);
    }

    public function getChatMessages($userId)
    {
        $currentUser = Auth::user();
        if ($currentUser->id == $userId) {
            return response()->json(['messages' => []]);
        }

        $messages = DirectMessage::where(function ($query) use ($currentUser, $userId) {
            $query->where('sender_id', $currentUser->id)
                ->where('receiver_id', $userId);
        })->orWhere(function ($query) use ($currentUser, $userId) {
            $query->where('sender_id', $userId)
                ->where('receiver_id', $currentUser->id);
        })->orderBy('created_at')->get();

        $formattedMessages = $messages->map(function ($message) use ($currentUser) {
            return [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'user' => [
                    'id' => $message->sender->id,
                    'name' => $message->sender->name,
                    'avatar' => $message->sender->avatar,
                ],
                'message' => $message->message,
                'created_at' => $message->created_at->toISOString(),
            ];
        });

        return response()->json(['messages' => $formattedMessages]);
    }

    public function sendChatMessage(Request $request, $userId)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $currentUser = Auth::user();
        if ($currentUser->id == $userId) {
            return response()->json(['error' => 'Нельзя отправлять сообщения себе'], 403);
        }

        $message = DirectMessage::create([
            'sender_id' => $currentUser->id,
            'receiver_id' => $userId,
            'message' => $request->message,
        ]);

        $channelId = implode('-', [min($currentUser->id, $userId), max($currentUser->id, $userId)]);

        $messageData = [
            'id' => $message->id,
            'sender_id' => $currentUser->id,
            'receiver_id' => $userId,
            'channel_id' => $channelId,
            'user' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'avatar' => $currentUser->avatar,
            ],
            'message' => $message->message,
            'created_at' => $message->created_at->toISOString(),
        ];

        broadcast(new DirectMessageSent($messageData));

        return response()->json(['message' => 'Сообщение отправлено']);
    }
}
