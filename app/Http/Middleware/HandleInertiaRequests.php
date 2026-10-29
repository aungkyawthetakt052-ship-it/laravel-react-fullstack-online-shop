<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'cartCount' => collect(session('cart', []))->sum('quantity'),

            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'delete' => fn () => $request->session()->get('delete'),
            ],
            'notifications' => fn () => $this->notifications($request),
        ];
    }

    private function notifications(Request $request): ?array
    {
        $user = $request->user();

        if (! $user) {
            return null; // login မဝင်ရသေးရင်
        }

        return [
            // မဖတ်ရသေးတာ ဘယ်နှစ်ခု (bell ပေါ်က အနီရောင်ဂဏန်း)
            'unread_count' => $user->unreadNotifications()->count(),

            // နောက်ဆုံး ၁၀ ခု
            'items' => $user->notifications()
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn ($n) => [
                    'id' => $n->id,
                    'title' => $n->data['title'] ?? 'Notification',
                    'message' => $n->data['message'] ?? '',
                     'url'     => $n->data['url'] ?? '/dashboard',
                    'read' => $n->read_at !== null,
                    // "5 minutes ago" ကို server မှာ ပြီးအောင်လုပ်ပို့တယ်
                    // (browser မှာ တွက်ရင် server နဲ့ မတူလို့ hydration error ဖြစ်နိုင်)
                    'time' => $n->created_at->diffForHumans(),
                ])
                ->values(),
        ];
    }
}
