<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainingTopic;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrainingController extends Controller
{
    public function index()
    {
        return TrainingTopic::all();
    }

    public function show(TrainingTopic $trainingTopic)
    {
        return response()->json($trainingTopic);
    }

    public function recordUser(Request $request)
    {
        $user = Auth::user();

        $hasRecord = DB::table('training_user')
            ->where('user_id', '=', $user->id)
            ->where('training_id', '=', $request->id)
            ->exists();

        if ($hasRecord) {
            return response()->json(['message' => 'Вы уже отметили эту тему']);
        }

        DB::table('training_user')->insert([
            'training_id' => $request->id,
            'user_id' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Вы проши это обучение']);
    }

    public function getRecords(Request $request)
    {
        $user = Auth::user();
        $records = DB::table('training_user')->where('user_id', '=', $user->id)->get()->toArray();

        $result = array_map(function ($item) {
            return $item->training_id;
        }, $records);

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'duration' => 'required|string|max:50',
            'slides' => 'required|array',
            'slides.*.image' => 'required|string',
            'slides.*.title' => 'required|string',
            'slides.*.description' => 'required|string',
        ]);

        $topic = TrainingTopic::create($validated);
        return response()->json($topic, 201);
    }

    public function update(Request $request, TrainingTopic $trainingTopic)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'duration' => 'required|string|max:50',
            'slides' => 'required|array',
            'slides.*.image' => 'required|string',
            'slides.*.title' => 'required|string',
            'slides.*.description' => 'required|string',
        ]);

        $trainingTopic->update($validated);
        return response()->json($trainingTopic);
    }
}
