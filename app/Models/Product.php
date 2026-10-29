<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;
    protected $fillable = ['name','sku','category','image','status','price','stock',];
   public const LOW_STOCK_LIMIT = 5;

    // JSON ထဲကို status အလိုအလျောက် ထည့်ပေးမယ်
   protected $appends = ['status'];

protected function status(): Attribute
    {
        return Attribute::make(
            get: function () {
                $stock = (int) ($this->stock ?? 0);

                if ($stock <= 0) {
                    return 'Out of stock';
                }

                if ($stock <= self::LOW_STOCK_LIMIT) {
                    return 'Low stock';
                }

                return 'Active';
            }
        );
    }

    public function images()
{
    return $this->hasMany(ProductImage::class);
}
  
}