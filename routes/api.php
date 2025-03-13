<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TourController;
use App\Http\Controllers\Api\AuthController;


Route::middleware('auth:sanctum')->group(function (){
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/tours', [TourController::class, 'store'])->name('api.tours.store');
    Route::post('/tours/{id}/signup', [TourController::class, 'signUp'])->name('api.tours.signup');
    Route::get('/users/{userId}/tours', [TourController::class, 'getUserTours'])->name('api.users.tours');
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
