<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Http\Requests\LoginRequest;

class AuthenticatedSessionController extends Controller
{
    public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();

    $request->session()->regenerate();

    $user = $request->user();

    // Admin → Dashboard
    if ($user->isAdmin()) {
        return redirect()->intended(route('dashboard', absolute: false));
    }

    // User → Shop Home
    return redirect()->intended(route('home', absolute: false));
}
}
