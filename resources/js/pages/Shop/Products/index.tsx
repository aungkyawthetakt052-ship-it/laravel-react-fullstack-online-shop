import { Link, router } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { useState } from 'react';
import { SlidersHorizontal, Grid3X3, LayoutList, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface Props {
  products: {
    data: Product[];
    links: any[];
    meta: any;
  };
  filters: {
    search?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
  };
  categories: string[];
}

export default function ProductsIndex({ products, filters, categories }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const applyFilter = (key: string, value: string) => {
    router.get('/shop', { ...filters, [key]: value || undefined }, { preserveState: true });
  };

  return (
    <ShopLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">
            {filters.category ? filters.category : 'All Products'}
          </h1>
          <p className="text-gray-500">{products.meta?.total || products.data.length} products</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div>
              <h3 className="font-semibold mb-3">Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => applyFilter('category', '')}
                  className={`block text-sm ${!filters.category ? 'text-rose-600 font-medium' : 'text-gray-600 hover:text-rose-600'}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => applyFilter('category', cat)}
                    className={`block text-sm capitalize ${filters.category === cat ? 'text-rose-600 font-medium' : 'text-gray-600 hover:text-rose-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Price</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={filters.min_price}
                  onBlur={(e) => applyFilter('min_price', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-rose-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={filters.max_price}
                  onBlur={(e) => applyFilter('max_price', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-rose-200 rounded-lg"
                />
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 text-sm border border-rose-200 px-4 py-2 rounded-full"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>

              <div className="flex items-center gap-3 ml-auto ">
                <select
                  value={filters.sort || 'newest'}
                  onChange={(e) => applyFilter('sort', e.target.value)}
                  className="text-sm border border-rose-200 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>

                <div className="hidden sm:flex border border-rose-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 ${view === 'grid' ? 'bg-rose-100 text-rose-700 dark:bg-gray-400' : ''}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 ${view === 'list' ? 'bg-rose-100 text-rose-700 dark:bg-gray-400' : ''}`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}>
              {products.data.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/products/${product.id}`}
                  className={`group ${view === 'list' ? 'flex gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-rose-50' : ''}`}
                >
                  <div className={`${view === 'list' ? 'w-28 h-28 shrink-0' : 'aspect-3/4'} rounded-xl overflow-hidden dark:bg-gray-900 bg-rose-50 relative`}>
                    <img
                      src={`/storage/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    {product.stock <= 0 && (
                      <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">Sold out</span>
                    )}
                  </div>
                  <div className={view === 'list' ? 'flex-1' : 'mt-3'}>
                    <p className="text-xs text-rose-500 uppercase">{product.category}</p>
                    <h3 className="font-medium group-hover:text-rose-600 transition line-clamp-1">{product.name}</h3>
                    <p className="font-semibold mt-1">${Number(product.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {products.links && products.links.length > 3 && (
              <div className="mt-10 flex justify-center gap-2">
                {products.links.map((link: any, i: number) => (
                  <Link
                    key={i}
                    href={link.url || '#'}
                    className={`px-4 py-2 text-sm rounded-lg ${
                      link.active ? 'bg-rose-600 text-white' : 'bg-white border border-rose-200 hover:bg-rose-50 dark:bg-gray-400/80 dark:text-black dark:hover:bg-gray-400/60'
                    } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            {/* Same filters as sidebar */}
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Category</h4>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { applyFilter('category', ''); setShowFilters(false); }} className="px-4 py-2 rounded-full border text-sm">All</button>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => { applyFilter('category', cat); setShowFilters(false); }} className="px-4 py-2 rounded-full border text-sm capitalize">{cat}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ShopLayout>
  );
}