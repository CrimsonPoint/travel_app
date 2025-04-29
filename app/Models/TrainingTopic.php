<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingTopic extends Model
{
    protected $fillable = ['title', 'duration', 'slides'];

    protected $casts = [
        'slides' => 'array',
    ];
}
