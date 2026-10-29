<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewOrderNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order)
    {
        //
    }

    /**
     * ဒီနေရာမှာ 'database' ထည့်မှ notifications table ထဲကို ရောက်မယ်
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * database ထဲမှာ သိမ်းမယ့် data
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'    => 'New Order Received',
            'message'  => "Order #{$this->order->id} has been placed. Total: " . number_format($this->order->total) . " MMK",
            'order_id' => $this->order->id,
            'url'      => '/order/show/' . $this->order->id,
        ];
    }
}