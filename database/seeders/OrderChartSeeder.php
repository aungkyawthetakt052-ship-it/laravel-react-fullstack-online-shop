<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderChartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        // ရှိပြီးသား user နဲ့ product id တွေကို ယူမယ် (foreign key အတွက်)
        $userIds = User::pluck('id')->all();
        $products = Product::select('id', 'price')->get();

        if (empty($userIds) || $products->isEmpty()) {
            $this->command->error('User ဒါမှမဟုတ် Product မရှိသေးပါ။ အရင်ထည့်ပါ။');
            return;
        }

        $statuses = ['pending', 'processing', 'completed', 'cancelled'];

        foreach (range(1, 40) as $i) {
            $product  = $products->random();
            $quantity = rand(1, 5);
            $date     = now()->month(rand(1, 10))->day(rand(1, 28));

            DB::table('orders')->insert([
                'user_id'    => $userIds[array_rand($userIds)],
                'product_id' => $product->id,
                'quantity'   => $quantity,
                'total'      => $product->price * $quantity,
                'status'     => $statuses[array_rand($statuses)],
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
}
//App\Models\Order::where('created_at', '<', now())->delete(); // သတိ: order အစစ်တွေပါ ပါသွားနိုင်လို့ စမ်းသပ် DB မှာပဲ သုံးပါ