<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * app/Http/Controllers/NotificationController.php
 */
class NotificationController extends Controller
{
    /**
     * POST /notifications/{id}/read
     * Notification တစ်ခုကို နှိပ်ရင် → "ဖတ်ပြီး" အမှတ်လုပ်ပြီး သူ့ page ကို ပို့မယ်
     */
    public function read(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->find($id);

        if ($notification && is_null($notification->read_at)) {
            $notification->markAsRead();
        }

        return back();
    }

    /**
     * POST /notifications/read-all
     * မဖတ်ရသေးတာအားလုံးကို တစ်ခါတည်း ဖတ်ပြီးလုပ်မယ်
     */
    public function readAll(Request $request)
    {
        // ->update() = query တစ်ခုတည်း (loop နဲ့ တစ်ခုချင်း မလုပ်ဘူး)
        $request->user()
            ->unreadNotifications()
            ->update(['read_at' => now()]);

        return back();
    }

    /**
     * POST /notifications/delete-all
     * Notification အားလုံး ဖျက်မယ်
     */
    public function deleteAll(Request $request)
    {
        $request->user()->notifications()->delete();

        return back();
    }
}
