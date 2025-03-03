<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        if(!Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
            return response()->json([
                'message' => 'Неверный логин или пароль'
            ]);
        }

        /** @var User $user */

        $user = Auth::user();
        $user_access_token = $user->createToken('token')->plainTextToken;

        return response()->json([
            "user" => $user,
            "token" => $user_access_token,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        return response('', 200);
    }

    public function signup(SignupRequest $request)
    {

        $data = $request->validated();
        $user = User::create([
            "name" => $data["name"],
            "email" => $data["email"],
            "password" => bcrypt($data["password"]),
        ]);

        /** @var User $user */
        $user_access_token = $user->createToken("token")->plainTextToken;

        return response([
            "user" => $user,
            "token" => $user_access_token,
        ]);
    }
}
