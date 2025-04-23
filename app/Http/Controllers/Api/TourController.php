<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TourController extends Controller
{

    public function store(Request $request)
    {
        $query = Tour::query();

        if ($request->missing('getAllStatuses')) {
            $query->whereIn('status', Tour::getActiveStatuses());
        }

        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->has('difficulty') && $request->difficulty) {
            $query->where('difficulty', $request->difficulty);
        }

        if ($request->has('distance_min') && $request->distance_min !== null) {
            $query->where('distance', '>=', $request->distance_min);
        }

        if ($request->has('distance_max') && $request->distance_max !== null) {
            $query->where('distance', '<=', $request->distance_max);
        }

        if ($request->has('location') && $request->location) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        if ($request->has('date_start') && $request->date_start) {
            $query->whereDate('date_start', '>=', $request->date_start);
        }

        $perPage = 12;
        $tours = $query->with('creator')->paginate($perPage);

        $participatingTourIds = DB::table('tour_user')
            ->where('user_id', Auth::id())
            ->pluck('tour_id')
            ->toArray();

        $result = $tours->map(function ($tour) use ($participatingTourIds) {
            return [
                'tour' => [
                    'id' => $tour->id,
                    'title' => $tour->title,
                    'distance' => $tour->distance,
                    'difficulty' => $tour->difficulty,
                    'description' => $tour->description,
                    'participants' => $tour->participants,
                    'max_participants' => $tour->max_participants,
                    'location' => $tour->location,
                    'date_start' => $tour->date_start,
                    'date_end' => $tour->date_end,
                    'checklist' => $tour->checklist,
                    'imageUrl' => $tour->image_url,
                ],
                'creator' => [
                    'name' => $tour->creator->name,
                    'avatar' => $tour->creator->avatar ?? null,
                ],
                'user_is_participant' => in_array($tour->id, $participatingTourIds),
            ];
        });

        return response()->json([
            'data' => $result,
            'current_page' => $tours->currentPage(),
            'last_page' => $tours->lastPage(),
            'total' => $tours->total(),
        ]);
    }


    public function getTour(Request $request, $id)
    {
        $tour = Tour::findOrFail($id);
        return [
            'tour' => $tour,
            'creator' => [
                'name' => $tour->creator->name,
            ],
            'user_is_participant' => in_array(Auth::user()->id, $tour->participants() ->pluck('user_id')->toArray()),
        ];
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'difficulty' => 'required|in:1,2,3',
            'distance' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'max_participants' => 'required|integer|min:2',
            'date_start' => 'required|date|after:now',
            'date_end' => 'required|date|after:date_start',
            'location' => 'nullable|string|max:255',
            'checklist' => 'nullable|json',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $validated;
        $data['creator_id'] = Auth::id();
        $data['participants'] = 1;
        $data['checklist'] = $request->checklist ? json_decode($request->checklist, true) : [];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('tours', 'public');
            $data['image_url'] = Storage::url($path);
        }

        $tour = Tour::create($data);

        $this->signUp($request, $tour->id);

        return response()->json([
            'message' => 'Тур успешно создан',
            'tour' => [
                'id' => $tour->id,
                'title' => $tour->title,
                'distance' => $tour->distance,
                'difficulty' => $tour->difficulty,
                'description' => $tour->description,
                'participants' => $tour->participants,
                'max_participants' => $tour->max_participants,
                'location' => $tour->location,
                'date_start' => $tour->date_start,
                'date_end' => $tour->date_end,
                'checklist' => $tour->checklist,
                'image_url' => $tour->image_url,
            ],
        ], 201);
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

        if($tour->participants + 1 <= $tour->max_participants){
            $tour->participants()->attach($user->id);
            $tour->participants += 1;
            $tour->save();

            return response()->json([
                'message' => 'Вы успешно записаны на тур',
            ]);
        } else {
            return response()->json([
                'message' => 'Места кончились',
            ], 400);
        }
    }

    public function getUserTours($userId)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Не авторизован'], 401);
        }

        /*if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Доступ запрещен'], 403);
        }*/

        $user = User::findOrFail($userId);
        $tours = Tour::where('creator_id', '=', $user->id)->get();

        return response()->json([
            'user' => $user->name,
            'tours' => $tours,
        ]);
    }

    public function setTourStatus(Request $request, $id)
    {
        $tour = Tour::findOrFail($id);

        if ($tour->creator_id !== Auth::id()) {
            return response()->json([
                'message' => 'У вас нет прав для изменения статуса этого тура',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'int', 'in:' . implode(',', Tour::getAllStatuses())],
        ]);

        $tour->status = $validated['status'];
        $tour->save();

        return response()->json([
            'message' => 'Статус обновлен',
            'tour' => [
                'id' => $tour->id,
                'status' => $tour->status,
            ],
        ]);
    }

    public function getUserParticipatingTours($userId)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Не авторизован'], 401);
        }

        $user = User::findOrFail($userId);
        $tours = $user->participatingTours;

        return response()->json([
            'user' => $user->name,
            'tours' => $tours,
        ]);
    }

    public function put(Request $request, $id)
    {
        if (!Auth::user()->is_admin ?? !Auth::user()->is_moderator) return response()->json(['message' => 'Доступ запрещён'], 403);

        $tour = Tour::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'difficulty' => 'required|string|max:2',
            'distance' => 'required|int',
            'description' => 'nullable|string',
            'max_participants' => 'nullable|int',
            'date_start' => 'nullable|string',
            'date_end' => 'nullable|string',
            'location' => 'nullable|string',
            'checklist' => 'nullable|array',
        ]);

        $tour->update($validated);

        return response()->json([
            'message' => 'Тур успешно обновлён',
            'id' => $tour->id,
            'title' => $tour->title,
            'description' => $tour->description,
            'difficulty' => $tour->difficulty,
            'distance' => $tour->distance,
            'participants' => $tour->participants,
            'max_participants' => $tour->max_participants,
            'date_start' => $tour->date_start,
            'date_end' => $tour->date_end,
            'location' => $tour->location,
            'image_url' => $tour->image_url,
            'checklist' => $tour->checklist,
            'creator' => $tour->creator ? ['name' => $tour->creator->name] : null,
        ], 200);
    }

    public function delete(string $id)
    {
        if (!Auth::user()->is_admin ?? !Auth::user()->is_moderator) return response()->json(['message' => 'Доступ запрещён'], 403);

        $tour = Tour::findOrFail($id);

        if($tour){
            $tour->delete();
        }

        return response()->json(['message' => '<UNK> <UNK> <UNK>']);
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
