<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TourController extends Controller
{

    public function store(Request $request)
    {
        /**
         * TODO Написать фильтрацию чтобы отвались только туры которые не были созданы текущим пользователем
         * Также можно прикрутить филльтрацию по примиум роли, но надо будет добавить поле в модель тура
         */

        $tours = Tour::all();
        $participatingTourIds = DB::table('tour_user')
            ->where('user_id', Auth::id())
            ->pluck('tour_id')
            ->toArray();

        foreach ($tours as $tour) {
            $result[] = [
                'tour' => $tour,
                'user_is_participant' => in_array($tour->id, $participatingTourIds),
            ];
        }

        return $result;
    }

    public function getTour(Request $request, $id)
    {
        return Tour::findOrFail($id);
    }

    public function create(request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'difficulty' => 'required|int|max:2',
            'distance' => 'required|int|max:3',
            'description' => 'nullable|string',
            'max_participants' => 'nullable|int',
            'date_start' => 'nullable|string',
            'date_end' => 'nullable|string',
            'location' => 'nullable|string',
            'checklist' => 'nullable|array',
            'extra_fields' => 'nullable|array',
        ]);

        $validated['creator_id'] = Auth::id();
        $tour = Tour::create($validated);

        $this->signUp($request, $tour->id);

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

        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Доступ запрещен'], 403);
        }

        $user = User::findOrFail($userId);
        $tours = Tour::where('creator_id', '=', $user->id)->get();

        return response()->json([
            'user' => $user->name,
            'tours' => $tours,
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
