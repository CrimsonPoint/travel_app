<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tours', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image_url')->nullable();
            $table->unsignedBigInteger('creator_id');
            $table->string('difficulty')->default(1);
            $table->string('distance')->default('0 км');
            $table->integer('participants')->default(1);
            $table->integer('max_participants')->default(2);
            $table->text('description')->nullable();
            $table->dateTime('date_start')->nullable(false);
            $table->dateTime('date_end')->nullable(false);
            $table->string('location')->nullable();
            $table->json('checklist')->nullable();
            $table->json('extra_fields')->nullable();
            $table->timestamps();


            $table->foreign('creator_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tours');
    }
};
