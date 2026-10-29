<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'     => fake()->words(3, true),
            'sku'      => strtoupper(fake()->unique()->bothify('SKU-####??')),
            'category' => fake()->randomElement(['Computer', 'Phone', 'Accessory', 'Audio']),
            'price'    => fake()->numberBetween(10, 3000),
            'stock'    => fake()->numberBetween(0, 200),
            'image'    => 'products/placeholder.png',
        ];
    }
}
