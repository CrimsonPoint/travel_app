<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TourController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TrainingController;


Route::middleware('auth:sanctum')->group(function (){
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/user/{id}', [UserController::class, 'getUser'])->name('api.user.get_user');
    Route::post('/users', [UserController::class, 'index'])->name('api.users.index');
    Route::get('/users', [UserController::class, 'getAll'])->name('api.users.get_all');
    Route::post('/user', [UserController::class, 'store'])->name('api.user.store');
    Route::patch('/users/{id}/roles', [UserController::class, 'updateRoles'])->name('api.users.roles');
    Route::patch('/users/{id}/block', [UserController::class, 'toggleBlock'])->name('api.users.block');
    Route::patch('/users/{id}/verify', [UserController::class, 'verify'])->name('api.users.verify');

    Route::get('/training-topics', [TrainingController::class, 'index'])->name('api.training.index');
    Route::get('/training-topics/{trainingTopic}', [TrainingController::class, 'show'])->name('api.training.show');
    Route::get('/training-records', [TrainingController::class, 'getRecords'])->name('api.training.records');
    Route::post('/training-topics', [TrainingController::class, 'store'])->name('api.training.store');
    Route::post('/training-user', [TrainingController::class, 'recordUser'])->name('api.training.record_user');
    Route::put('/training-topics/{trainingTopic}', [TrainingController::class, 'update'])->name('api.training.update');

    Route::get('/roles', [UserController::class, 'getRoles'])->name('api.roles.index');

    Route::post('/tours', [TourController::class, 'store'])->name('api.tours.store');
    Route::post('/tour/create', [TourController::class, 'create'])->name('api.tours.create');
    Route::get('/tour/{id}', [TourController::class, 'getTour'])->name('api.tours.get_tour');
    Route::delete('/tour/{id}', [TourController::class, 'delete'])->name('api.tours.delete_tour');
    Route::put('/tour/{id}', [TourController::class, 'put'])->name('api.tours.put_tour');
    Route::post('/tours/{id}/signup', [TourController::class, 'signUp'])->name('api.tours.signup');
    Route::get('/users/{userId}/tours', [TourController::class, 'getUserTours'])->name('api.users.tours');
    Route::patch('/tour/{id}/status', [TourController::class, 'setTourStatus'])->name('api.tour.status');
    Route::get('/users/{userId}/tour-participations', [TourController::class, 'getUserParticipatingTours'])
        ->name('api.users.participating_tours');
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
