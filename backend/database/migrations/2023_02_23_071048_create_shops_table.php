<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shops', function (Blueprint $table) {
            $table->ulid()->primary()->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('ghana_post_gps')->nullable();
            $table->string('domain')->nullable();
            $table->boolean('online')->default(false);
            $table->foreignUlid('user_ulid')->references('ulid')->on('users')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
//            $table->foreignUuid(User::class)->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};
