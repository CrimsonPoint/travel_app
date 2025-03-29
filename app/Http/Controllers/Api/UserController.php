<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function getUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user) {
            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Искомый пользователь не найден',
            ], 404);
        }
    }
}
