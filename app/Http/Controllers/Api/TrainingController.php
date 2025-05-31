<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainingTopic;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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

        return response()->json(['message' => 'Вы прошли это обучение']);
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
        $slides = is_string($request->slides) ? json_decode($request->slides, true) : $request->slides;
        $request->merge(['slides' => $slides]);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'duration' => 'required|string|max:50',
            'slides' => 'required|array|',
            'slides.*.image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4096',
            'slides.*.title' => 'required|string|max:255',
            'slides.*.description' => 'nullable|string',
        ]);

        $data = $validated;
        $data['slides'] = array_map(function ($slide, $index) use ($request) {
            if ($request->hasFile("slides.$index.image")) {
                $path = $request->file("slides.$index.image")->store('training_slides', 'public');
                $slide['image'] = Storage::url($path);
            } else {
                $slide['image'] = null;
            }
            return $slide;
        }, $validated['slides'], array_keys($validated['slides']));

        $topic = TrainingTopic::create($data);

        return response()->json(['data' => $topic], 201);
    }

    public function update(Request $request, TrainingTopic $trainingTopic)
    {
        $data = $request->all();

        if (is_string($request->slides)) {
            $data['slides'] = json_decode($request->slides, true);
        }

        $validated = Validator::make($data, [
            'title' => 'required|string|max:255',
            'duration' => 'required|string|max:50',
            'slides' => 'required|array',
            'slides.*.title' => 'required|string|max:255',
            'slides.*.description' => 'nullable|string',
        ])->validate();


        $slides = [];
        foreach ($validated['slides'] as $index => $slide) {
            $slideData = $slide;

            if ($request->hasFile("slide_images.{$index}")) {
                $path = $request->file("slide_images.{$index}")->store('training_slides', 'public');
                $slideData['image'] = Storage::url($path);
            } elseif (isset($trainingTopic->slides[$index]['image'])) {
                $slideData['image'] = $trainingTopic->slides[$index]['image'];
            }

            $slides[] = $slideData;
        }

        $trainingTopic->update([
            'title' => $validated['title'],
            'duration' => $validated['duration'],
            'slides' => $slides
        ]);

        return response()->json(['data' => $trainingTopic]);
    }
}
