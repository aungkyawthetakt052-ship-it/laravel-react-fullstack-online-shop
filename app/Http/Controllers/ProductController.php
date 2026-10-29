<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use App\Notifications\NewProductNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductController extends Controller
{
    // ProductController.php ရဲ့ အပေါ်မှာ ဒီ use တွေ ရှိရမယ်
    // use App\Models\Product;
    // use Illuminate\Http\Request;

    // ProductController ထဲက index() ကို အောက်က နှစ်ခုနဲ့ အစားထိုးပါ

    private const PER_PAGE = 20;

    private const LOW_STOCK_LIMIT = 5; // frontend ရဲ့ LOW_STOCK_LIMIT နဲ့ တူရမယ်

    /* =====================================================================
     *  INDEX  →  GET /products
     *  Product စာရင်း (search + field filter + pagination)
     * ===================================================================== */
    public function index(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:100',
            'field' => 'nullable|string|max:20',
        ]);

        $search = trim((string) $request->input('search', ''));
        $field = $request->input('field', 'all');

        // dropdown ကလာနိုင်တဲ့ column တွေ (ဒီထဲမပါတာ လက်မခံဘူး → SQL injection မဖြစ်)
        // ⚠ သင့် CustomDropDownMenu ရဲ့ value တွေနဲ့ ကိုက်အောင် လိုရင် ပြင်ပါ
        $allowed = ['name', 'sku', 'category'];

        // % နဲ့ _ ကို ပုံမှန်စာလုံးအဖြစ် ယူဖို့ escape လုပ်တယ်
        // နောက်က '%' = prefix search (index သုံးနိုင်တယ်)
        $like = addcslashes($search, '%_\\').'%';

        $products = Product::query()
            ->when($search !== '', function ($query) use ($field, $allowed, $like) {
                if (in_array($field, $allowed, true)) {
                    // dropdown က column တစ်ခုရွေးထားရင် အဲဒီ column ထဲပဲ ရှာ
                    $query->where($field, 'like', $like);
                } else {
                    // "all" ဆိုရင် column အားလုံးထဲ ရှာ
                    // where(function) = ( ... OR ... OR ... ) ကွင်းခတ်ပေးတာ
                    $query->where(function ($q) use ($allowed, $like) {
                        foreach ($allowed as $col) {
                            $q->orWhere($col, 'like', $like);
                        }
                    });
                }
            })
            ->latest('id')
            // get() အစား paginate(20): ၂၀ ခုပဲ ယူတယ်
            // withQueryString(): page link တွေမှာ ?search=...&field=... ပါအောင် ထိန်းထားတယ်
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return inertia('admin/Product/product', [ // ← သင့်လက်ရှိ page နာမည်အတိုင်း ထားပါ
            'products' => $products,
            'search' => $search,
            'field' => $field,

            // closure = full page load မှာပဲ run တယ်၊ search/page ကူးတဲ့ partial reload မှာ မ run ဘူး
            'stats' => fn () => $this->stats(),
        ]);
    }

    /* =====================================================================
     *  STATS → summary card ၃ ခုအတွက် ဂဏန်းတွေ (query တစ်ခုတည်း)
     *  အရင်က frontend မှာ products array နဲ့ တွက်တာ၊ pagination လုပ်ရင်
     *  လက်ရှိ page ၂၀ ခုကိုပဲ တွက်မိမယ်၊ ဒါကြောင့် server မှာ တွက်ရတယ်
     * ===================================================================== */
    private function stats(): array
    {
        $r = Product::toBase()->selectRaw(
            'COUNT(*) as total,
         SUM(COALESCE(stock, 0) <= 0) as out_of_stock,
         SUM(COALESCE(stock, 0) > 0 AND COALESCE(stock, 0) <= ?) as low_stock,
         COALESCE(SUM(price * COALESCE(stock, 0)), 0) as inventory_value',
            [self::LOW_STOCK_LIMIT]
        )->first();

        return [
            'total' => (int) $r->total,
            'outOfStock' => (int) $r->out_of_stock,
            'lowStock' => (int) $r->low_stock,
            'inventoryValue' => (float) $r->inventory_value,
        ];
    }

    public function create()
    {
        return Inertia::render('admin/Product/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer',
            'images' => 'required|array|min:1|max:3',
            'images.*' => 'image|mimes:jpg,jpeg,png,gif,webp',
        ]);

        $product = new Product;
        $product->name = $validated['name'];
        $product->sku = $validated['sku'];
        $product->category = $validated['category'];
        $product->stock = $validated['stock'] ?? $product->stock;
        $product->price = $validated['price'];

        // ပုံတွေကို အရင် storage ထဲသိမ်းမယ် (image column က NOT NULL ဖြစ်နေလို့)
        $paths = [];
        foreach (array_slice($request->file('images'), 0, 3) as $file) {
            $paths[] = $file->store('products', 'public');
        }

        // ပထမပုံကို products.image ထဲထည့်ပြီးမှ product ကို save လုပ်မယ်
        $product->image = $paths[0];
        $product->save();

        // product id ရပြီဆိုမှ product_images table ထဲ record တွေထည့်မယ်
        foreach ($paths as $path) {
            $product->images()->create(['path' => $path]);
        }
        // Admin တွေကို notification ပို့မယ်
        $admins = User::where('role', 'admin')->get();
        Notification::send($admins, new NewProductNotification($product));

        return redirect()->route('products.index')->with('success', 'Product was created successfully');
    }

    public function Edit(Product $product)
    {
        return Inertia::render('admin/Product/edit', [
            'product' => $this->withImages($product),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer',
            'images' => 'nullable|array|max:3',
            'images.*' => 'image|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'string',
        ]);

        $remove = $validated['remove_images'] ?? [];
        $newFiles = $request->file('images', []);

        // လက်ရှိ ပုံဟောင်းတွေ
        $existing = $product->images()->pluck('path')->all();
        if (empty($existing) && $product->image) {
            $existing = [$product->image];
        }

        // ဖျက်ပြီးနောက် ကျန်မယ့်ပုံ
        $remaining = array_values(array_diff($existing, $remove));
        $total = count($remaining) + count($newFiles);

        if ($total > 3) {
            throw ValidationException::withMessages([
                'images' => 'You can have up to 3 images in total.',
            ]);
        }
        if ($total === 0) {
            throw ValidationException::withMessages([
                'images' => 'At least one image is required.',
            ]);
        }

        // ရွေးထားတဲ့ ပုံဟောင်းတွေကိုပဲ ဖျက်မယ် (record + file)
        foreach ($remove as $path) {
            $product->images()->where('path', $path)->delete();
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        // ပုံအသစ်တွေ ထည့်မယ်
        foreach ($newFiles as $file) {
            $path = $file->store('products', 'public');
            $product->images()->create(['path' => $path]);
            $remaining[] = $path;
        }

        $product->name = $validated['name'];
        $product->sku = $validated['sku'];
        $product->category = $validated['category'];
        $product->stock = $validated['stock'] ?? $product->stock;
        $product->price = $validated['price'];
        $product->image = $remaining[0]; // index page အတွက် ပထမပုံ
        $product->save();
       

        return redirect()->route('products.index')->with('success', 'Product was updated successfully');
    }

    public function destroy(Product $product)
    {
        $this->deleteImages($product);
        $product->delete();

        return redirect()->route('products.index')->with('delete', "Product #{$product->id} was deleted successfully");
    }

    public function detail(Product $product)
    {
        return Inertia::render('admin/Product/detail', [
            'product' => $this->withImages($product),
        ]);
    }

    /* ---------- Helper functions ---------- */

    // ပုံတွေကို storage ထဲသိမ်း + product_images table ထဲ record ထည့်မယ်
    private function storeImages(Product $product, array $files): void
    {
        $first = null;

        foreach (array_slice($files, 0, 3) as $file) {
            $path = $file->store('products', 'public');
            $product->images()->create(['path' => $path]);
            $first ??= $path;
        }

        // ပထမပုံကို product.image ထဲမှာလည်း သိမ်းမယ် (index စာမျက်နှာအတွက်)
        $product->image = $first;
        $product->save();
    }

    // ပုံဟောင်းတွေကို file + record နှစ်မျိုးလုံး ဖျက်မယ်
    private function deleteImages(Product $product): void
    {
        foreach ($product->images as $img) {
            if (Storage::disk('public')->exists($img->path)) {
                Storage::disk('public')->delete($img->path);
            }
        }
        $product->images()->delete();

        // table အသစ်မသုံးခင် တင်ထားတဲ့ ပုံဟောင်း (image column) အတွက်
        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }
    }

    // React ဆီပို့ဖို့ images ကို path array အဖြစ်ပြောင်းမယ်
    private function withImages(Product $product): array
    {
        $data = $product->toArray();
        $paths = $product->images()->pluck('path')->values()->all();

        // ပုံအသစ် table မှာ မရှိသေးရင် မူလ image တစ်ပုံကို သုံးမယ်
        if (empty($paths) && $product->image) {
            $paths = [$product->image];
        }

        $data['images'] = $paths;

        return $data;
    }
}
