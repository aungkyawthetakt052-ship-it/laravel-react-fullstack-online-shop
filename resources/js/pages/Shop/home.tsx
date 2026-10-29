import ShopLayout from '@/layouts/shop-layout';
import { Link } from '@inertiajs/react';
import { ArrowRight, Star } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface Props {
  featured: Product[];
  newArrivals: Product[];
  bestSellers: Product[];
  categories: { name: string; slug: string; image: string; count: number }[];
}

export default function Home({ featured, newArrivals, bestSellers, categories }: Props) {
  return (
    <ShopLayout>
      {/* Hero */}
      <section className="relative bg-linear-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-rose-600 dark:text-rose-400 font-medium mb-3 tracking-wide uppercase text-sm">
              New Season
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Reveal Your
              <br />
              <span className="text-rose-600 dark:text-rose-400">Natural Glow</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
              Discover clean, effective skincare and makeup crafted for radiant,
              healthy-looking skin.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-rose-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-rose-700 transition shadow-lg shadow-rose-200 dark:shadow-none"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?category=Skincare"
                className="inline-flex items-center gap-2 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 px-8 py-3.5 rounded-full font-medium hover:bg-rose-50 dark:hover:bg-gray-800 transition"
              >
                Skincare
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl bg-linear-to-br from-rose-200 to-pink-100 dark:from-gray-800 dark:to-gray-700 overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800"
                alt="Hero"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white">
            Shop by Category
          </h2>
          <Link
            href="/shop"
            className="text-rose-600 dark:text-rose-400 text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories?.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="group relative aspect-3/4 rounded-2xl overflow-hidden bg-rose-100 dark:bg-gray-800"
            >
              {cat.image ? (
                <img
                  src={`/storage/${cat.image}`}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-rose-200 via-pink-100 to-orange-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold text-lg">{cat.name}</h3>
                <p className="text-sm opacity-80">{cat.count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection title="Featured Products" products={featured} link="/shop" />

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="relative rounded-3xl overflow-hidden bg-rose-900 text-white">
          <div className="absolute inset-0 opacity-30">
            <img
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative px-8 py-16 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              Clean Beauty Promise
            </h2>
            <p className="max-w-xl mx-auto mb-8 text-rose-100">
              All our products are cruelty-free, free from harmful chemicals, and
              made with love for your skin.
            </p>
            <Link
              href="/about"
              className="inline-block bg-white text-rose-900 px-8 py-3 rounded-full font-medium hover:bg-rose-50 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <ProductSection
        title="New Arrivals"
        products={newArrivals}
        link="/shop?sort=newest"
      />
      <ProductSection
        title="Best Sellers"
        products={bestSellers}
        link="/shop?sort=bestselling"
      />
    </ShopLayout>
  );
}

function ProductSection({
  title,
  products,
  link,
}: {
  title: string;
  products: Product[];
  link: string;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <Link
          href={link}
          className="text-rose-600 dark:text-rose-400 text-sm font-medium hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/products/${product.id}`} className="group">
      <div className="aspect-3/4 rounded-2xl overflow-hidden bg-rose-50 dark:bg-gray-800 mb-3 relative">
        <img
          src={`/storage/${product.image}`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>
      <p className="text-xs text-rose-500 dark:text-rose-400 uppercase tracking-wide mb-1">
        {product.category}
      </p>
      <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition line-clamp-1">
        {product.name}
      </h3>
      <div className="flex items-center gap-1 mt-1">
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-current" />
          ))}
        </div>
        <span className="text-xs text-gray-400">(24)</span>
      </div>
      <p className="mt-1 font-semibold text-gray-900 dark:text-white">
        ${Number(product.price).toFixed(2)}
      </p>
    </Link>
  );
}