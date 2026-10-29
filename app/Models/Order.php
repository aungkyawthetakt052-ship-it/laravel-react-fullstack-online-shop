<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['quantity','total','status','product','image', 
        'shipping_name',
        'shipping_email',
        'shipping_phone',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_postal',
        'shipping_country',
        'shipping_method',
        'payment_method',
        'notes',];
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function product(){
        return $this->belongsTo(Product::class);
    }
     public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
