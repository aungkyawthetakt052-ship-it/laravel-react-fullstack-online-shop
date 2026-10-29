<?php

use App\Http\Controllers\ChartController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Shop\AccountController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CheckoutController;
use App\Http\Controllers\Shop\HomeController;
use App\Http\Controllers\Shop\OrderController as ShopOrderController;
use App\Http\Controllers\Shop\ProductController as ShopProductController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::controller(NotificationController::class)->prefix('notifications')->group(function () {
    // 'read-all' နဲ့ 'delete-all' ကို '{id}' ထက် ရှေ့မှာ ထားပါ
    Route::post('/read-all', 'readAll')->name('notifications.readAll');
    Route::post('/delete-all', 'deleteAll')->name('notifications.delete-all');
    
    Route::post('/{id}/read', 'read')->name('notifications.read');
});
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::prefix('shop')->name('shop.')->group(function () {
    Route::get('/', [ShopProductController::class, 'index'])->name('index');
    Route::get('/products/{product}', [ShopProductController::class, 'show'])->name('products.show');
});

// Cart
Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/add', [CartController::class, 'add'])->name('add');
    Route::patch('/{item}', [CartController::class, 'update'])->name('update');
    Route::delete('/{item}', [CartController::class, 'remove'])->name('remove');
});

// Checkout
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

// Customer Account (login လိုအပ်)
Route::middleware('auth')->prefix('account')->name('account.')->group(function () {
    Route::get('/profile', [AccountController::class, 'profile'])->name('profile');
    Route::put('/profile', [AccountController::class, 'updateProfile'])->name('profile.update');

    Route::get('/orders', [ShopOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [ShopOrderController::class, 'show'])->name('orders.show');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // User
    Route::controller(UserController::class)->group(function () {
        Route::get('/users', 'index')->name('users.index');
        Route::get('/user/create', 'create')->name('user.create');
        Route::post('/user/create', 'store')->name('user.store');
        Route::get('/user/edit/{user}', 'edit')->name('user.edit');
        Route::match(['put', 'post'], '/user/update/{user}', 'update')->name('user.update');
        Route::delete('/user/delete/{user}', 'destroy')->name('user.delete');

    });

    // Order
    Route::controller(OrderController::class)->group(function () {
        Route::get('/orders', 'index')->name('orders.index');
        Route::get('/order/show/{order}', 'show')->name('orders.show');
        Route::get('/order/create', 'create')->name('order.create');
        Route::post('/order/create', 'store')->name('order.store');
        Route::get('/order/edit/{order}', 'edit')->name('order.edit');
        Route::put('/order/edit/{order}', 'update')->name('order.update');
        Route::delete('/order/delete/{order}', 'destroy')->name('order.delete');
    });

    // Product
    Route::controller(ProductController::class)->group(function () {
        Route::get('/products', 'index')->name('products.index');
        Route::get('/product/detail/{product}', 'detail')->name('product.detail');
        Route::get('/product/create', 'create')->name('product.create');
        Route::post('/product/create', 'store')->name('product.store');
        Route::get('/product/edit/{product}', 'edit')->name('product.edit');
        Route::put('/product/update/{product}', 'update')->name('product.update');
        Route::delete('/product/delete/{product}', 'destroy')->name('product.delete');
    });

    // Chart
    Route::controller(ChartController::class)->group(function () {
        Route::get('/chart', 'index')->name('chart.index');
    });

});

require __DIR__.'/settings.php';
