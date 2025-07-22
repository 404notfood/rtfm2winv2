<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Trait pour ajouter la fonctionnalité UUID aux modèles.
 * Implémente le principe DRY (Don't Repeat Yourself) et la réutilisabilité.
 */
trait HasUuid
{
    /**
     * Boot the trait.
     * Génère automatiquement un UUID lors de la création du modèle.
     */
    protected static function bootHasUuid(): void
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the route key for the model.
     * Utilise l'UUID au lieu de l'ID pour les routes.
     *
     * @return string
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * Scope pour rechercher par UUID.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $uuid
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByUuid($query, string $uuid)
    {
        return $query->where('uuid', $uuid);
    }

    /**
     * Générer un nouvel UUID pour le modèle.
     *
     * @return string
     */
    public function generateUuid(): string
    {
        return (string) Str::uuid();
    }
} 