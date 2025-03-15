<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function participatingTours()
    {
        return $this->belongsToMany(Tour::class, 'tour_user', 'user_id', 'tour_id')
            ->withTimestamps();
    }

    public function isAdmin() {
        $lvl = DB::table('roles')->where('name', '=', 'admin')->first()->lvl;
        return $this->getPermissionLvl() == $lvl;
    }

    public function getPermissionLvl()
    {
        $userId = $this->id;
        $userRoleLvl = DB::table('role_user')
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->where('role_user.user_id', $userId)
            ->select('roles.lvl')
            ->first();

        return $userRoleLvl->lvl;
    }
}
