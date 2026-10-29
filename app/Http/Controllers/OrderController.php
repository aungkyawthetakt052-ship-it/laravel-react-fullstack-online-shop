<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Notifications\NewOrderNotification;
use App\Notifications\OrderStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class OrderController extends Controller
{
    // Page တစ်မျက်နှာမှာ ပြမယ့် order အရေအတွက် (ပြောင်းချင်ရင် ဒီနေရာတစ်နေရာတည်းမှာ ပြင်ပါ)
    private const PER_PAGE = 15;

    /* =====================================================================
     *  INDEX  →  GET /orders
     *  Order စာရင်း (search + date filter + pagination)
     * ===================================================================== */
    public function index(Request $request)
    {
        // URL ကလာတဲ့ input တွေကို စစ်ပါတယ် (မှားရင် error နဲ့ ပြန်ပို့မယ်)
        $request->validate([
            'search' => 'nullable|string|max:100',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ]);

        // search စာလုံး (ရှေ့နောက် space ဖယ်မယ်)
        $search = trim((string) $request->input('search', ''));

        // LIKE ထဲမှာ % နဲ့ _ က အထူးအဓိပ္ပာယ်ရှိလို့ ရှေ့က \ ထည့်ပြီး ပုံမှန်စာလုံးအဖြစ် ယူမယ်
        // နောက်ဆုံးက '%' = prefix search ("Aung%" → Aung နဲ့ စတဲ့ အကုန်ရှာ) → index သုံးနိုင်တယ်
        $like = addcslashes($search, '%_\\').'%';

        $orders = Order::query()
            // လိုတဲ့ column တွေပဲ ယူမယ် (data နည်း = မြန်)
            ->select(['id', 'user_id', 'total', 'status', 'payment', 'created_at'])

            // N+1 မဖြစ်အောင် relation တွေကို တစ်ခါတည်း load မယ် (ဒီမှာလည်း လိုတဲ့ column ပဲ)
            ->with([
                'user:id,name,email',
                'items:id,order_id,product_id,quantity',
                'items.product:id,name,image',
            ])

            // ----- SEARCH: search စာလုံးရှိမှ သာ အလုပ်လုပ်မယ် -----
            ->when($search !== '', function ($query) use ($search, $like) {
                // where(function) = SQL မှာ ( ... OR ... OR ... ) လို့ ကွင်းခတ်ပေးတာ
                // ကွင်းမခတ်ရင် အောက်က date filter နဲ့ ရောပြီး ရလဒ်မှားမယ်
                $query->where(function ($q) use ($search, $like) {
                    // 1) customer နာမည် ဒါမှမဟုတ် email နဲ့ ရှာ
                    $q->whereHas('user', fn ($u) => $u
                        ->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like))
                        // 2) order ထဲက product နာမည်နဲ့ ရှာ
                        ->orWhereHas('items.product', fn ($p) => $p->where('name', 'like', $like));

                    // 3) order id နဲ့ ရှာ (ဂဏန်းချည်းပဲ ဆိုမှ)
                    // "Aung" လို စာလုံးကို id နဲ့ နှိုင်းယှဉ်ရင် မှားနိုင်လို့ စစ်ထားတာ
                    if (ctype_digit($search)) {
                        $q->orWhere('id', (int) $search);
                    }
                });
            })

            // ----- DATE FILTER -----
            // whereDate() မသုံးဘူး၊ DATE(created_at) ဖြစ်သွားလို့ index မသုံးနိုင်တော့ဘူး
            // ဒါကြောင့် နေ့အစ (00:00:00) ကနေ နေ့အဆုံး (23:59:59) အထိ range နဲ့ စစ်တယ်
            ->when($request->filled('from'), fn ($q) => $q->where(
                'created_at', '>=', Carbon::parse($request->input('from'))->startOfDay()
            ))
            ->when($request->filled('to'), fn ($q) => $q->where(
                'created_at', '<=', Carbon::parse($request->input('to'))->endOfDay()
            ))

            // အသစ်ဆုံးအရင် (created_at တူရင် id ကြီးတာအရင်၊ page ကူးတဲ့အခါ ဆင်တူတွေ ထပ်မပေါ်အောင်)
            ->orderByDesc('created_at')
            ->orderByDesc('id')

            // get() အစား paginate(20): order အားလုံးမယူဘဲ ၂၀ ခုပဲ ယူတယ်
            // withQueryString(): page link တွေမှာ ?search=...&from=... ပါအောင် ထိန်းထားတယ်
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return inertia('admin/Orders/orders', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'from', 'to']),

            // fn () => ... (closure) ထည့်ထားရင် full page load မှာပဲ run တယ်
            // search / page ပြောင်းတဲ့ partial reload (only: ['orders','filters']) မှာ မ run ဘူး
            'stats' => fn () => $this->stats(),
        ]);
    }

    /* =====================================================================
     *  STATS  →  stat card ငါးခုအတွက် ဂဏန်းတွေ
     *  Query တစ်ခုတည်းနဲ့ အကုန်တွက်တယ် (အရင်က query ၄ ခု)
     * ===================================================================== */
    private function stats(): array
    {
        $now = now();

        // SUM(status = 'pending') → ကိုက်ရင် 1၊ မကိုက်ရင် 0 ဖြစ်လို့ SUM = အရေအတွက်
        // ? နေရာတွေကို အောက်က array ထဲက တန်ဖိုးတွေ အစဉ်လိုက် ဝင်တယ် (SQL injection မဖြစ်)
        // MySQL ရဲ့ default collation က စာလုံးအကြီးအသေး မခွဲလို့ 'Pending' လည်း ကိုက်တယ်
        $r = Order::toBase()->selectRaw(
            "COUNT(*) as total,
             SUM(status = 'pending')    as pending,
             SUM(status = 'processing') as processing,
             SUM(status = 'delivered')  as delivered,
             SUM(status = 'cancelled')  as cancelled,
             SUM(created_at >= ?)       as current_30,
             SUM(created_at >= ? AND created_at < ?) as previous_30",
            [
                $now->copy()->subDays(30), // လွန်ခဲ့တဲ့ ရက် ၃၀ ထဲက order
                $now->copy()->subDays(60), // ရက် ၆၀ ကနေ
                $now->copy()->subDays(30), // ရက် ၃၀ အထိ (ယခင်လ)
            ]
        )->first();

        // order table ထဲမှာ row မရှိရင် first() က null ပြန်တယ်
        // frontend က 0 / null တွေကို ကောင်းကောင်းလက်ခံဖို့ guard လုပ်ပေးရမယ်
        if (! $r) {
            return [
                'total' => 0,
                'growth' => null,
                'pending' => 0,
                'processing' => 0,
                'delivered' => 0,
                'cancelled' => 0,
            ];
        }

        $current = (int) $r->current_30;
        $previous = (int) $r->previous_30;

        return [
            'total' => (int) $r->total,

            // growth % = (အခု - အရင်) ÷ အရင် × 100
            // အရင်လ ၀ ဆိုရင် စားလို့မရလို့ null ပြန်တယ် (frontend မှာ "No previous data" ပြမယ်)
            'growth' => $previous > 0
                ? round((($current - $previous) / $previous) * 100, 1)
                : null,

            // table ထဲမှာ order မရှိရင် SUM က null ပြန်လို့ (int) နဲ့ 0 ပြောင်းထားတယ်
            'pending' => (int) $r->pending,
            'processing' => (int) $r->processing,
            'delivered' => (int) $r->delivered,
            'cancelled' => (int) $r->cancelled,
        ];
    }

    /* =====================================================================
     *  CREATE / STORE  (အလုပ်မစရသေးဘူး)
     * ===================================================================== */
    public function create()
    {
        return Inertia::render('admin/Orders/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'total' => 'required|numeric|min:0',
            'status' => 'required|in:pending,processing,shipped,completed,delivered,cancelled',
            'payment' => 'nullable|in:paid,unpaid,refunded',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $order = DB::transaction(function () use ($validated) {
            // 1. Order သိမ်းမယ်
            $order = Order::create([
                'user_id' => $validated['user_id'],
                'total' => $validated['total'],
                'status' => $validated['status'],
                'payment' => $validated['payment'] ?? 'unpaid',
            ]);

            // 2. Order items သိမ်းမယ်
            foreach ($validated['items'] as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            return $order;
        });

        // 3. Admin တွေကို Notification ပို့မယ်
        $admins = User::where('role', 'admin')->get();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new NewOrderNotification($order));
        }

        return redirect()
            ->route('orders.index')
            ->with('success', "Order #{$order->id} created successfully");
    }

    /* =====================================================================
     *  SHOW  →  GET /order/show/{order}
     *  Order တစ်ခုရဲ့ အသေးစိတ်ကြည့်ရန်
     * ===================================================================== */
    // Order $order လို့ရေးရင် Laravel က URL ထဲက {order} id နဲ့ DB ကနေ ရှာပေးတယ်
    // မတွေ့ရင် 404 ကို အလိုလို ပြန်ပေးတယ်
    public function show(Order $order)
    {
        return inertia('admin/Orders/show', [
            // load() = relation တွေကို အခုမှ ထပ်ယူတယ် (customer + item တွေ + product တွေ)
            // prop နာမည် 'orderDetail' ဟာ show.tsx ထဲက ယူတဲ့ နာမည်နဲ့ တူရမယ်
            'orderDetail' => $order->load(['user', 'items.product']),
        ]);
    }

    /* =====================================================================
     *  EDIT  →  GET /order/edit/{order}
     *  ပြင်ဆင်ရန် form ပြမယ့် page
     * ===================================================================== */
    public function edit(Order $order)
    {
        return inertia('admin/Orders/edit', [   // ← အရင်က 'Orders/show' မှားနေတာ၊ edit page ကို ပြောင်းထားတယ်
            // prop နာမည် 'orderEdit' ကို edit.tsx ထဲမှာ ဒီအတိုင်းယူပါ
            'orderEdit' => $order->load(['user', 'items.product']),
        ]);
    }

    /* =====================================================================
     *  UPDATE  →  PUT /order/edit/{order}
     *  Form ကနေ ပို့လာတဲ့ အပြောင်းအလဲကို သိမ်းမယ်
     * ===================================================================== */
    public function update(Request $request, Order $order)
    {
        // ခွင့်ပြုတဲ့ တန်ဖိုးတွေပဲ လက်ခံမယ်၊ ကျန်တာဆို error ပြန်မယ်
        $data = $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed,delivered,cancelled',
            'payment' => 'nullable|in:paid,unpaid,refunded',
        ]);
        $oldStatus = $order->status;

        // update() အလုပ်လုပ်ဖို့ Order model မှာ
        // protected $fillable = ['status', 'payment', ...]; ရှိရမယ်
        $order->update($data);
        // status တကယ်ပြောင်းမှ ပို့ (payment ပဲပြောင်းရင် မပို့ဘူး)
        if (
            $order->wasChanged('status') &&
            in_array(strtolower($order->status), OrderStatusNotification::NOTIFY_ON)
        ) {
            $order->user?->notify(new OrderStatusNotification($order, $oldStatus));
        }

        // စာရင်း page ကို ပြန်သွားပြီး success message ပို့မယ်
        return redirect('/orders')->with('success', "Order #{$order->id} updated.");
    }

    /* =====================================================================
     *  DESTROY  →  DELETE /order/delete/{order}
     *  Order ကို ဖျက်မယ် (frontend က confirm() မေးပြီးမှ ရောက်လာတယ်)
     * ===================================================================== */
    public function destroy(Order $order)
    {
        // transaction = နှစ်ခုလုံး အောင်မြင်မှ သိမ်းမယ်၊ တစ်ခုမှားရင် အကုန်ပြန်ဖျက်မယ်
        DB::transaction(function () use ($order) {
            // child row (order_items) ကို အရင်ဖျက်မှ parent (order) ဖျက်လို့ရမယ်
            // migration မှာ cascadeOnDelete() ထည့်ထားရင် ဒီစာကြောင်း မလိုဘူး
            $order->items()->delete();
            $order->delete();
        });

        return redirect('/orders')->with('delete', "Order #{$order->id} was deleted.");
    }
}
