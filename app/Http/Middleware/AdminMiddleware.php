<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }
        if ($request->user()->role !== 'admin') {
            return redirect()->route('home');
        } 
        if ($request->user()->role?->name !== 'admin') {
            return redirect()->route('home');
        }

        return $next($request);
    }
}
