<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * app/Notifications/NewUserNotification.php
 * User အသစ်စာရင်းသွင်းရင် admin တွေဆီ ပို့မယ်
 */
class NewUserNotification extends Notification
{
    use Queueable;

    /**
     * ⚠ အရင်က __construct($user = null) နဲ့ property က User type
     * null ပို့မိရင် TypeError ဖြစ်မယ်၊ ဒါကြောင့် User ကို မဖြစ်မနေ လိုအောင် ပြောင်းလိုက်တယ်
     */
    public function __construct(public User $user) {}

    // ⚠ 'mail' → 'database' (bell ထဲပေါ်ဖို့)
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New User Registered',
            'message' => "{$this->user->name} ({$this->user->email}) just registered",
            'url' => '/user/edit/'.$this->user->id,
        ];
    }
}