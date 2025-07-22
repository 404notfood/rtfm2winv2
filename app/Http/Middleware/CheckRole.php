<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware pour vérifier les rôles des utilisateurs.
 * Implémente les principes POO avec encapsulation et responsabilité unique.
 */
class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Vérifier si l'utilisateur est authentifié
        if (!$request->user()) {
            return redirect()->route('login');
        }

        // Vérifier si l'utilisateur a l'un des rôles requis
        if (!$this->userHasRole($request->user(), $roles)) {
            abort(403, 'Accès non autorisé pour ce rôle.');
        }

        return $next($request);
    }

    /**
     * Vérifier si l'utilisateur a l'un des rôles spécifiés.
     * Méthode privée suivant le principe d'encapsulation.
     */
    private function userHasRole($user, array $roles): bool
    {
        // Si aucun rôle spécifié, autoriser l'accès
        if (empty($roles)) {
            return true;
        }

        // Vérifier si l'utilisateur a l'un des rôles requis
        return in_array($user->role, $roles);
    }
} 