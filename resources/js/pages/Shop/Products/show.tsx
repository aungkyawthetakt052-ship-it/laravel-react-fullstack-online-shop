import { Link, useForm } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { useState } from 'react';
import {
  Star,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  CreditCard,
} from 'lucide-react';

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

  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const {
    data,
    setData,
    post,
    processing,
  } = useForm({
    product_id: product.id,
    quantity: 1,
  });

  // Add to Cart
  const addToCart = () => {
    post('/cart/add', {
      preserveScroll: true,
    });
  };

  // Buy Now -> Laravel -> Stripe Checkout
const buyNow = () => {
    post(`/checkout/${product.id}`, {
        preserveScroll: true,
    });
};

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-rose-600">
            Home
          </Link>

          <span className="mx-2">/</span>

          <Link href="/shop" className="hover:text-rose-600">
            Shop
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-800">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Product Images */}
          <div>
            <div className="mb-4 aspect-square overflow-hidden rounded-2xl bg-rose-50">
              {images.length > 0 ? (
                <img
                  src={`/storage/${images[selectedImage]}`}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                      selectedImage === index
                        ? 'border-rose-500'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={`/storage/${img}`}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div>
            <p className="mb-2 text-sm uppercase tracking-wide text-rose-600">
              {product.category}
            </p>

            <h1 className="mb-3 font-serif text-3xl font-bold">
              {product.name}
            </h1>

            {/* Rating UI */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="h-4 w-4 fill-current"
                  />
                ))}
              </div>

              <span className="text-sm text-gray-500">
                4.8 (128 reviews)
              </span>
            </div>

            {/* Price */}
            <p className="mb-4 text-3xl font-semibold">
              ${Number(product.price).toFixed(2)}
            </p>

            {/* Stock Status */}
            <p
              className={`mb-5 text-sm ${
                product.stock > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {product.stock > 0
                ? `${product.stock} items available`
                : 'Out of stock'}
            </p>

            {/* Description */}
            <p className="mb-8 leading-relaxed text-gray-600">
              {product.description ||
                'Premium quality cosmetic product formulated with clean ingredients for radiant, healthy-looking skin.'}
            </p>

            {/* Quantity */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-rose-200">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={data.quantity <= 1}
                  onClick={() =>
                    setData(
                      'quantity',
                      Math.max(1, data.quantity - 1),
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-rose-50 disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="w-12 text-center font-medium">
                  {data.quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={
                    product.stock <= 0 ||
                    data.quantity >= product.stock
                  }
                  onClick={() =>
                    setData(
                      'quantity',
                      Math.min(
                        product.stock,
                        data.quantity + 1,
                      ),
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-rose-50 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={addToCart}
                disabled={processing || product.stock <= 0}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-3 font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                <ShoppingBag className="h-5 w-5" />

                {product.stock <= 0
                  ? 'Sold Out'
                  : 'Add to Cart'}
              </button>

              {/* Wishlist */}
              <button
                type="button"
                aria-label="Add to wishlist"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 hover:bg-rose-50"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Buy Now / Stripe Checkout */}
            <button
              type="button"
              onClick={buyNow}
              disabled={processing || product.stock <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-8 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard className="h-5 w-5" />

              {processing
                ? 'Please wait...'
                : 'Buy Now — Checkout'}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Secure checkout powered by Stripe
            </p>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-rose-100 py-6">
              <div className="text-center">
                <Truck className="mx-auto mb-2 h-6 w-6 text-rose-500" />

                <p className="text-xs text-gray-600">
                  Free Shipping
                </p>
              </div>

              <div className="text-center">
                <Shield className="mx-auto mb-2 h-6 w-6 text-rose-500" />

                <p className="text-xs text-gray-600">
                  Secure Payment
                </p>
              </div>

              <div className="text-center">
                <RotateCcw className="mx-auto mb-2 h-6 w-6 text-rose-500" />

                <p className="text-xs text-gray-600">
                  30-Day Returns
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              SKU: {product.sku}
            </p>
          </div>
        </div>

        {/* Related Products */}
        {related?.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 font-serif text-2xl font-bold">
              You may also like
            </h2>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/shop/products/${item.id}`}
                  className="group"
                >
                  <div className="mb-3 aspect-3/4 overflow-hidden rounded-2xl bg-rose-50">
                    {item.image ? (
                      <img
                        src={`/storage/${item.image}`}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <h3 className="line-clamp-1 font-medium transition group-hover:text-rose-600">
                    {item.name}
                  </h3>

                  <p className="mt-1 font-semibold">
                    ${Number(item.price).toFixed(2)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </ShopLayout>
  );
}