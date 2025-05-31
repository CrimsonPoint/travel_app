<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Tour;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('tour-chat.{tourId}', function ($user, $tourId) {
    return Auth::check() && Tour::findOrFail($tourId)->participants()->where('user_id', $user->id)->exists();
});

Broadcast::channel('user-chat.{channelId}', function ($user, $channelId) {
    $ids = explode('-', $channelId);
    return Auth::check() && in_array($user->id, $ids);
});
