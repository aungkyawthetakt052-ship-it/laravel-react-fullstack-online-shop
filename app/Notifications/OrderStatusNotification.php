<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Notification;

class OrderStatusNotification extends Notification
{
    // Only these statuses send a notification to the customer
    public const NOTIFY_ON = ['processing', 'delivered'];

    public function __construct(
        public Order $order,
        public ?string $oldStatus = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database']; // add 'mail' here if you also want an email
    }

    public function toArray(object $notifiable): array
    {
        $status = strtolower($this->order->status);

        [$title, $message] = match ($status) {
            'processing' => [
                'Order confirmed',
                "Your order #{$this->order->id} is confirmed and being prepared.",
            ],
            'delivered' => [
                'Order delivered',
                "Your order #{$this->order->id} has been delivered. Enjoy!",
            ],
            default => [
                'Order updated',
                "Your order #{$this->order->id} is now {$status}.",
            ],
        };

        return [
            'title'    => $title,
            'message'  => $message,
            'order_id' => $this->order->id,
            // The bell redirects here when the customer clicks the notification.
            // Change this to the page where YOUR customer views orders.
            'url'      => "/order/show/{$this->order->id}",
        ];
    }
}