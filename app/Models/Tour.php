<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    use HasFactory;

    protected $table = 'tours';

    const NOT_VERIFIED_STATUS = 0;
    const APPROVED_STATUS = 2;
    const COMPLETED_STATUS = 4;

    protected $fillable = [
        'title',
        'image_url',
        'creator_id',
        'difficulty',
        'distance',
        'participants',
        'description',
        'date_start',
        'date_end',
        'location',
        'checklist',
        'extra_fields',
        'max_participants',
        'route'
    ];

    protected $casts = [
        'checklist' => 'array',
        'extra_fields' => 'array',
        'route' => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public static function getActiveStatuses(): array
    {
        return [
            self::APPROVED_STATUS
        ];
    }

    public static function getAllStatuses(): array
    {
        return [
            self::NOT_VERIFIED_STATUS,
            self::APPROVED_STATUS,
            self::COMPLETED_STATUS
        ];
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'tour_user', 'tour_id', 'user_id')
            ->withTimestamps();
    }
}
