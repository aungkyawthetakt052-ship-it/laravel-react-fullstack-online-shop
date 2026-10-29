import { useForm, usePage } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { User, Save } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  age?: number;
  image?: string;
}

interface Props {
  user: UserData;
}

export default function Profile({ user }: Props) {
  const { flash } = usePage().props as any;

  const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
    name: user.name || '',
    email: user.email || '',
    age: user.age || '',
    phone: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put('/account/profile', {
      preserveScroll: true,
    });
  };

  return (
    <ShopLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">My Profile</h1>

        {/* Success message */}
        {(recentlySuccessful || flash?.success) && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            {flash?.success || 'Profile updated successfully.'}
          </div>
        )}

        <div className="dark:bg-gray-900 bg-gray-100 rounded-2xl border border-rose-100 p-6 sm:p-8">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <img
                  src={`/storage/${user.image}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-rose-500" />
              )}
            </div>
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Age</label>
              <input
                type="number"
                value={data.age}
                onChange={(e) => setData('age', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                min={1}
                max={120}
              />
              {errors.age && (
                <p className="text-red-500 text-xs mt-1">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="09xxxxxxxxx"
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-full font-medium hover:bg-rose-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link
            href="/account/orders"
            className="text-rose-600 hover:underline"
          >
            View My Orders →
          </Link>
        </div>
      </div>
    </ShopLayout>
  );
}

// Link import လိုအပ်
import { Link } from '@inertiajs/react';