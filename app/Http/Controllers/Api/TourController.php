<?php

namespace App\Http\Controllers\Api;

use App\Events\NotificationCreated;
use App\Events\TourMessage;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\CustomNotification;
use App\Models\Tour;
use App\Models\TrainingTopic;
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

        if ($request->missing('getAllStatuses') || !$request->user()->canEdit()) {
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
                    'participants' => $tour->participants()->count(),
                    'max_participants' => $tour->max_participants,
                    'location' => $tour->location,
                    'date_start' => $tour->date_start,
                    'date_end' => $tour->date_end,
                    'checklist' => $tour->checklist,
                    'imageUrl' => $tour->image_url,
                    'status' => $tour->status,
                    'extra_fields' => $tour->extra_fields,
                    'topics' => $tour->extra_fields ? TrainingTopic::findOrFail($tour->extra_fields['topics']) : [],
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
            'tour' =>  [
                'id' => $tour->id,
                'title' => $tour->title,
                'distance' => $tour->distance,
                'difficulty' => $tour->difficulty,
                'description' => $tour->description,
                'participants' => $tour->participants()->count(),
                'max_participants' => $tour->max_participants,
                'location' => $tour->location,
                'date_start' => $tour->date_start,
                'date_end' => $tour->date_end,
                'checklist' => $tour->checklist,
                'image_url' => $tour->image_url,
                "route" =>$tour->route,
                'extra_fields' => $tour->extra_fields,
                'topics' => $tour->extra_fields ? TrainingTopic::findOrFail($tour->extra_fields['topics']) : [],
            ],
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
            'route' => 'nullable|json',
        ]);

        $data = $validated;
        $data['creator_id'] = Auth::id();
        $data['checklist'] = $request->checklist ? json_decode($request->checklist, true) : [];
        $data['route'] = $request->route ? json_decode($request->route, true) : [];

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
                'participants' => $tour->participants()->count(),
                'max_participants' => $tour->max_participants,
                'location' => $tour->location,
                'date_start' => $tour->date_start,
                'date_end' => $tour->date_end,
                'checklist' => $tour->checklist,
                'image_url' => $tour->image_url,
                'route' => $tour->route,
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

        if ($tour->extra_fields['topics']) {
            $requiredTopicIds = $tour->extra_fields['topics'];
            $requiredCount = count($requiredTopicIds);

            $completedTopicIds = DB::table('training_user')
                ->where('user_id', $user->id)
                ->whereIn('training_id', $requiredTopicIds)
                ->pluck('training_id')
                ->toArray();

            $completedCount = count($completedTopicIds);

            $allTopicsCompleted = $requiredCount === $completedCount &&
                count(array_intersect($requiredTopicIds, $completedTopicIds)) === $requiredCount;

            if (!$allTopicsCompleted) {
                return response()->json([
                    'message' => 'Вам нужно пройти обучение',
                ], 400);
            }
        }

        if($tour->participants()->count() + 1 <= $tour->max_participants){
            $tour->participants()->attach($user->id);
            $tour->save();

            $notification = CustomNotification::create([
                'user_id' => $user->id,
                'message' => "Вы записались на тур: " . $tour->title,
                'type' => 'tour_signup',
                'data' => ['tour_id' => $tour->id],
            ]);

            event(new NotificationCreated($notification));

            return response()->json([
                'message' => 'Вы успешно записаны на тур',
            ]);
        } else {
            return response()->json([
                'message' => 'Места кончились',
            ], 400);
        }
    }

    public function getChatMessages($tourId)
    {
        $tour = Tour::findOrFail($tourId);

        if (!$tour->participants()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Вы не записаны на этот тур'], 403);
        }

        $messages = ChatMessage::where('tour_id', $tourId)
            ->with('user')
            ->orderBy('created_at')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'user_id' => $message->user_id,
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                        'avatar' => $message->user->avatar,
                    ],
                    'message' => $message->message,
                    'created_at' => $message->created_at,
                ];
            });

        return response()->json(['messages' => $messages]);
    }

    public function sendChatMessage(Request $request, $tourId)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $tour = Tour::findOrFail($tourId);
        if (!$tour->participants()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Вы не записаны на этот тур'], 403);
        }

        $message = ChatMessage::create([
            'tour_id' => $tourId,
            'user_id' => Auth::id(),
            'message' => $request->message,
        ]);

        event(new TourMessage([
            'id' => $message->id,
            'user_id' => Auth::id(),
            'tour_id' => $tourId,
            'user' => [
                'id' => Auth::user()->id,
                'name' => Auth::user()->name,
                'avatar' => Auth::user()->avatar,
            ],
            'message' => $message->message,
            'created_at' => $message->created_at,
        ]));

        return response()->json(['message' => 'Сообщение отправлено']);
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

        if ($tour->creator_id !== Auth::id() && !Auth::user()->canEdit()) {
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
            'participants' => $tour->participants()->count(),
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
        if (Auth::user()->getPermissionLvl() < 7) return response()->json(['message' => 'Доступ запрещён'], 403);

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
