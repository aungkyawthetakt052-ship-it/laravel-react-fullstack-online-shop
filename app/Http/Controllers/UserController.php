<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\NewUserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $searchRe = $request->input('search');

        $users = User::query()
            ->when($searchRe, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            // Admin အရင်၊ ပြီးမှ user — ပြီးမှ အသစ်ဆုံး
            ->orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END")
            ->latest()
            ->get();

        return Inertia::render('admin/User/user', [
            'users' => $users,
            'search' => $searchRe,
        ]);
    }

    public function show(User $user)
    {
        return Inertia::render('admin/User/show', [
            'user' => $user,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/User/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|max:12',
            'age' => 'required|integer',
            'role' => 'nullable|string',
            'image' => 'required|image|mimes:jpg,png,gif,jpeg,webp',
        ]);
        $user = new User;
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->password = $validated['password'];
        $user->age = $validated['age'];
        $user->role = $validated['role'] ?? 'user';

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('users', 'public');
            $user->image = $path;
        }
        $user->save();
        // Admin တွေကို notification ပို့မယ်
        $admins = User::where('role', 'admin')->get();
        Notification::send($admins, new NewUserNotification($user));

        return redirect()->route('users.index')->with('success', 'User was created succesfully');

    }

    public function edit(User $user)
    {
        return Inertia::render('admin/User/edit', [
            'user' => $user,
        ]);
    }

    public function update(User $user, Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',

            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8|max:12',
            'age' => 'required|integer',
            'role' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,png,jpeg,gif,webp',
        ]);
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if ($request->filled('password')) {
            $user->password = $validated['password'];

        }
        $user->age = $validated['age'];
        $user->role = $validated['role'] ?? null;

        if ($request->hasFile('image')) {
            if ($user->image && Storage::disk('public')->exists($user->image)) {
                Storage::disk('public')->delete($user->image);
            }
            $path = $request->file('image')->store('users', 'public');
            $user->image = $path;
        }
        $user->save();

        return redirect()->route('users.index')->with('success', 'User was updated succesfully');

    }

    public function destroy(User $user)
    {
        if ($user->image && Storage::disk('public')->exists($user->image)) {
            Storage::disk('public')->delete($user->image);
        }
        $user->delete();

        return redirect()->route('users.index')->with('delete', "User #{$user->id} was deleted succesfully");

    }
}
