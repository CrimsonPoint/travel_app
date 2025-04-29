<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        if ($request->has('is_blocked')) {
            $query->where('is_blocked', $request->boolean('is_blocked'));
        }

        if ($request->has('is_verified')) {
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
}
