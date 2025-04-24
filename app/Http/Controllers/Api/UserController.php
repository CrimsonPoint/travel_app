<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
        $roles = DB::table('roles')->get()->toArray();
        $result = [];



        return $roles;
    }

    public function index(Request $request)
    {
        $query = User::query();

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

        return response()->json([
            'users' => $users->items(),
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
        $this->authorize('create', User::class);

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

        if (!empty($validated['roles'])) {
            $user->assignRole($validated['roles']);
        }

        return response()->json([
            'user' => $user->load('roles'),
            'message' => 'Пользователь успешно создан',
        ], 201);
    }

    public function updateRoles(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $this->authorize('update', $user);

        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user->syncRoles($validated['roles']);

        return response()->json([
            'user' => $user->load('roles'),
            'message' => 'Роли пользователя обновлены',
        ]);
    }

    public function toggleBlock(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $this->authorize('update', $user);

        $user->is_blocked = !$user->is_blocked;
        $user->save();

        return response()->json([
            'user' => $user->load('roles'),
            'message' => $user->is_blocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
        ]);
    }

    public function verify(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $this->authorize('update', $user);

        $user->is_verified = true;
        $user->email_verified_at = now();
        $user->save();

        return response()->json([
            'user' => $user->load('roles'),
            'message' => 'Пользователь подтвержден',
        ]);
    }
}
