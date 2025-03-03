<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->group(function (){
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/signup', [\App\Http\Controllers\Api\AuthController::class, 'signup']);
