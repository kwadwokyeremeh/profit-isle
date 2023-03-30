<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Shop extends Model
{
    use HasFactory;

    protected $primaryKey = 'ulid';

    protected static function booted()
    {
        static::creating(function (Shop $shop){
            $shop->ulid = Str::ulid()->toBase58();
        });
    }
    public function user():BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): HasOne
    {
        return $this->hasOne(ShopTemplate::class);
    }
}
