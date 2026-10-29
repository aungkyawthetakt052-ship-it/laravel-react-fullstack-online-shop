<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * app/Notifications/NewProductNotification.php
 * Product အသစ်ထည့်ရင် admin တွေဆီ ပို့မယ်
 */
class NewProductNotification extends Notification
{
    use Queueable;

    public function __construct(public Product $product) {}

    /**
     * ⚠ အရင်က ['mail'] ဖြစ်နေတာ၊ 'mail' ဆိုရင် email ပို့ဖို့ ကြိုးစားတာ
     * notifications table ထဲ မရောက်လို့ bell မှာ ဘာမှမပေါ်ဘူး
     * 'database' ဖြစ်မှ table ထဲသိမ်းမယ်
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    // toMail() ကို ဖယ်လိုက်ပြီ (email မပို့တော့လို့ မလိုတော့ဘူး)

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Product Added',
            'message' => "Product \"{$this->product->name}\" has been added",
            'url' => '/product/detail/'.$this->product->id,
        ];
    }
}