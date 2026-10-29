import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Heart,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

interface Props {
  children: ReactNode;
}

export default function ShopLayout({ children }: Props) {
  const { auth, cartCount = 0 } = usePage().props as any;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  // Dark mode load
  useEffect(() => {
    const saved = localStorage.getItem('shop-theme');
    const isDark = saved === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('shop-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  // Outside click → close account menu
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  // Esc → close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAccountOpen(false);
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      {/* Top Announcement */}
      <div className="bg-rose-600 text-white text-center text-sm py-2">
        Free shipping on orders over $50 · Use code{' '}
        <span className="font-semibold">GLOW15</span> for 15% off
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="text-2xl font-serif font-bold tracking-tight text-rose-700 dark:text-rose-400"
            >
              Glow<span className="text-rose-400 dark:text-rose-300">Beauty</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-rose-600 transition">
                Home
              </Link>
              <Link href="/shop" className="hover:text-rose-600 transition">
                Shop
              </Link>
              <Link
                href="/shop?category=Skincare"
                className="hover:text-rose-600 transition"
              >
                Skincare
              </Link>
              <Link
                href="/shop?category=Makeup"
                className="hover:text-rose-600 transition"
              >
                Makeup
              </Link>
              <Link
                href="/shop?category=Fragrance"
                className="hover:text-rose-600 transition"
              >
                Fragrance
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-full"
                aria-label="Toggle dark mode"
              >
                {dark ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-full"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button
                type="button"
                className="p-2 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-full"
                onClick={() => alert('Wishlist coming soon!')}
              >
                <Heart className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="p-2 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-full relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account — click open / outside close */}
              {auth?.user ? (
                <div className="relative" ref={accountRef}>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-full"
                    aria-expanded={accountOpen}
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-rose-100 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-rose-50 dark:border-gray-700">
                        <p className="text-sm font-medium truncate">
                          {auth.user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {auth.user.email}
                        </p>
                      </div>

                      <Link
                        href="/account/profile"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:bg-rose-50 dark:hover:bg-gray-800"
                      >
                        My Profile
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:bg-rose-50 dark:hover:bg-gray-800"
                      >
                        My Orders
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          router.post('/logout');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-sm font-medium hover:text-rose-600 px-2"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4">
              <form action="/shop" method="get" className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search products..."
                  className="w-full pl-11 pr-4 py-3 rounded-full border border-rose-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50/50 dark:bg-gray-800"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400" />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-gray-900 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <span className="font-serif text-xl font-bold text-rose-700 dark:text-rose-400">
                Menu
              </span>
              <button type="button" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 text-lg">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                Shop All
              </Link>
              <Link
                href="/shop?category=Skincare"
                onClick={() => setMobileMenuOpen(false)}
              >
                Skincare
              </Link>
              <Link
                href="/shop?category=Makeup"
                onClick={() => setMobileMenuOpen(false)}
              >
                Makeup
              </Link>
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                Cart
              </Link>

              <button
                type="button"
                onClick={toggleTheme}
                className="text-left flex items-center gap-2"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {dark ? 'Light mode' : 'Dark mode'}
              </button>

              {auth?.user ? (
                <>
                  <Link
                    href="/account/profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.post('/logout');
                    }}
                    className="text-left text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-rose-100 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold text-rose-700 dark:text-rose-400 mb-4">
              GlowBeauty
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Premium cosmetics for your natural glow. Clean ingredients, beautiful
              results.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/shop" className="hover:text-rose-600">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Skincare" className="hover:text-rose-600">
                  Skincare
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Makeup" className="hover:text-rose-600">
                  Makeup
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Fragrance" className="hover:text-rose-600">
                  Fragrance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-rose-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-rose-600">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-rose-600">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-rose-600">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Get 10% off your first order
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm border border-rose-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-300 bg-white dark:bg-gray-800"
              />
              <button
                type="submit"
                className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-rose-700 transition"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-rose-50 dark:border-gray-800 py-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} GlowBeauty. All rights reserved.
        </div>
      </footer>
    </div>
  );
}