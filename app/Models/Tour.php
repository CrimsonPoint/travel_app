<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    use HasFactory;

    protected $table = 'tours';

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
        'max_participants'
    ];

    protected $casts = [
        'checklist' => 'array',
        'extra_fields' => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'tour_user', 'tour_id', 'user_id')
            ->withTimestamps();
    }
}
