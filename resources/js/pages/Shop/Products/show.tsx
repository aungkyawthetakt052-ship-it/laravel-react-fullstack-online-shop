import { Link, useForm } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { useState } from 'react';
import { Star, Minus, Plus, ShoppingBag, Heart, Truck, Shield, RotateCcw } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  stock: number;
  description?: string;
  sku: string;
}

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductShow({ product, related }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = product.images?.length ? product.images : [product.image];

  // ✅ quantity ကို form data ထဲ ထည့်ထားပါ
  const { data, setData, post, processing } = useForm({
    product_id: product.id,
    quantity: 1,
  });

  const addToCart = () => {
    post('/cart/add', {
      preserveScroll: true,
    });
  };

  return (
    <ShopLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-rose-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-rose-600">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-rose-50 mb-4">
              <img
                src={`/storage/${images[selectedImage]}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
                      selectedImage === i ? 'border-rose-500' : 'border-transparent'
                    }`}
                  >
                    <img src={`/storage/${img}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-rose-600 text-sm uppercase tracking-wide mb-2">{product.category}</p>
            <h1 className="text-3xl font-serif font-bold mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-500">4.8 (128 reviews)</span>
            </div>

            <p className="text-3xl font-semibold mb-6">${Number(product.price).toFixed(2)}</p>

            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description ||
                'Premium quality cosmetic product formulated with clean ingredients for radiant, healthy-looking skin.'}
            </p>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center border border-rose-200 rounded-full">
                <button
                  type="button"
                  onClick={() => setData('quantity', Math.max(1, data.quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 rounded-full"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{data.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setData('quantity', Math.min(product.stock || 99, data.quantity + 1))
                  }
                  className="w-10 h-10 flex items-center justify-center hover:bg-rose-50 rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={addToCart}
                disabled={processing || product.stock <= 0}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-full font-medium hover:bg-rose-700 transition disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
              </button>

              <button
                type="button"
                className="w-12 h-12 border border-rose-200 rounded-full flex items-center justify-center hover:bg-rose-50"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-rose-100">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-rose-500 mb-2" />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-rose-500 mb-2" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-rose-500 mb-2" />
                <p className="text-xs text-gray-600">30-Day Returns</p>
              </div>
            </div>

            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
        </div>

        {/* Related */}
        {related?.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-serif font-bold mb-8">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/shop/products/${p.id}`} className="group">
                  <div className="aspect-3/4 rounded-2xl overflow-hidden bg-rose-50 mb-3">
                    <img
                      src={`/storage/${p.image}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h3 className="font-medium group-hover:text-rose-600 transition line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="font-semibold mt-1">${Number(p.price).toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </ShopLayout>
  );
}