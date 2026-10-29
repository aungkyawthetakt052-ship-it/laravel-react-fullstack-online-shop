<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Storage::disk('public')->makeDirectory('products');

        $categories = ['Skincare', 'Makeup', 'Fragrance', 'Haircare', 'Body Care'];

        $names = [
            'Hydrating Face Serum', 'Vitamin C Brightening Cream', 'Matte Lipstick',
            'Rose Perfume', 'Nourishing Hair Oil', 'SPF 50 Sunscreen',
            'Gentle Cleansing Foam', 'Overnight Repair Mask', 'Eyebrow Pencil',
            'Velvet Foundation', 'Glow Highlighter', 'Lip Balm Duo',
            'Anti-Aging Eye Cream', 'Charcoal Face Wash', 'Floral Body Mist',
            'Silk Hair Conditioner', 'Clay Face Mask', 'Nude Palette',
            'Hydra Toner', 'Sheer Blush',
        ];

        // Cosmetic / beauty related Unsplash photo IDs (stable)
        $photoIds = [
            '1596462502278-27bfdc403348', // makeup brushes
            '1522335789203-aabd1fc54bc9', // lipstick
            '1512496015851-a90fb38ba796', // cosmetics flatlay
            '1571781926291-c77df46e23e8', // skincare bottles
            '1598440947619-2c35fc9aa908', // cream jar
            '1620916569289-f0c0e0c0c0c0', // fallback style
            '1556228720-195a672e8a03', // serum
            '1570194065650-d99fb26b0b4a', // perfume
            '1631214524020-4c0c0c0c0c0c', 
            '1612817288484-6f916006741a', // skincare
            '1586492030873-1c0c0c0c0c0c',
            '1596755389378-c31d21fd1273', // makeup
            '1631730486572-226b1ddfcb6b',
            '1620916297397-a5c0c0c0c0c0',
            '1512203495758-c0c0c0c0c0c0',
        ];

        // အသုံးများတဲ့ beauty unsplash images
        $unsplashImages = [
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1571781926291-c77df46e23e8?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1570194065650-d99fb26b0b4a?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1631730486572-226b1ddfcb6b?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1620916569289-7b0c0c0c0c0c?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1583241800698-9c2e0c0c0c0c?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1596704017254-9b0c0c0c0c0c?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1512203495758-8c0c0c0c0c0c?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1631214524020-4c0c0c0c0c0c?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1571875257727-256c5846036e?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=500&fit=crop',
        ];

        for ($i = 1; $i <= 99; $i++) {
            $name = $names[array_rand($names)] . ' ' . $i;
            $category = $categories[array_rand($categories)];
            $price = round(rand(800, 12000) / 100, 2);
            $stock = rand(0, 100);

            $imageUrl = $unsplashImages[($i - 1) % count($unsplashImages)];
            $imagePath = $this->saveImage($imageUrl, $i);

            $product = Product::create([
                'name'     => $name,
                'sku'      => 'SKU-' . strtoupper(Str::random(5)) . $i,
                'category' => $category,
                'price'    => $price,
                'stock'    => $stock,
                'image'    => $imagePath,
            ]);

            if (method_exists($product, 'images') && $imagePath) {
                $product->images()->create(['path' => $imagePath]);
            }

            $this->command->info("[{$i}/99] {$name} → {$imagePath}");

            // rate limit မထိအောင် နည်းနည်းနား
            usleep(200000); // 0.2 sec
        }

        $this->command->info('Done: 99 cosmetic products.');
    }

    private function saveImage(string $url, int $index): ?string
    {
        $filename = 'products/cosmetic-' . $index . '-' . Str::random(5) . '.jpg';

        try {
            $response = Http::timeout(30)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->get($url);

            if ($response->successful() && strlen($response->body()) > 1000) {
                Storage::disk('public')->put($filename, $response->body());
                return $filename;
            }
        } catch (\Throwable $e) {
            $this->command->warn("Image fail #{$index}: " . $e->getMessage());
        }

        return null;
    }
}