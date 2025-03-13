<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TourController extends Controller
{

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'difficulty' => 'required|int|max:2',
            'distance' => 'required|int|max:3',
            'description' => 'nullable|string',
            'date_start' => 'nullable|string',
            'date_end' => 'nullable|string',
            'location' => 'nullable|string',
            'checklist' => 'nullable|array',
            'extra_fields' => 'nullable|array',
        ]);

        $validated['creator_id'] = Auth::id();

        $tour = Tour::create($validated);

        return response()->json([
            'message' => 'Тур успешно создан',
            'tour' => $tour,
        ]);
    }

    public function signUp(Request $request, $id)
    {
        $tour = Tour::findOrFail($id);
        $user = Auth::user();

        if ($tour->participants()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'Вы уже записаны на этот тур',
            ], 400);
        }

        $tour->participants()->attach($user->id);

        return response()->json([
            'message' => 'Вы успешно записаны на тур',
        ]);
    }

    public function getUserTours($userId)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Не авторизован'], 401);
        }

        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'Доступ запрещен'], 403);
        }

        $user = User::findOrFail($userId);
        /*$tours =  Tour::where('creator_id', '=', $user->id)->get();*/

        return response()->json([
            'user' => $user->name,
            /*'tours' => $tours,*/
        ]);
    }

    public function show(string $id)
    {

    }

    public function update(Request $request, string $id)
    {

    }

    public function destroy(string $id)
    {

    }
}
