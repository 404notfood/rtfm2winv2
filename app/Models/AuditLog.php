<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'target_type',
        'target_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the target model (polymorphic).
     */
    public function target()
    {
        if ($this->target_type && $this->target_id) {
            return $this->target_type::find($this->target_id);
        }
        return null;
    }

    /**
     * Log an action.
     */
    public static function log(
        string $action,
        $target = null,
        array $oldValues = null,
        array $newValues = null,
        User $user = null
    ): self {
        return static::create([
            'user_id' => $user?->id ?? Auth::id(),
            'action' => $action,
            'target_type' => $target ? get_class($target) : null,
            'target_id' => $target?->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Log model creation.
     */
    public static function logCreated($model, User $user = null): self
    {
        return static::log(
            'created',
            $model,
            null,
            $model->getAttributes(),
            $user
        );
    }

    /**
     * Log model update.
     */
    public static function logUpdated($model, array $oldValues, User $user = null): self
    {
        return static::log(
            'updated',
            $model,
            $oldValues,
            $model->getChanges(),
            $user
        );
    }

    /**
     * Log model deletion.
     */
    public static function logDeleted($model, User $user = null): self
    {
        return static::log(
            'deleted',
            $model,
            $model->getAttributes(),
            null,
            $user
        );
    }

    /**
     * Log user login.
     */
    public static function logLogin(User $user): self
    {
        return static::log('login', $user, null, [
            'login_at' => now()->toISOString(),
        ], $user);
    }

    /**
     * Log user logout.
     */
    public static function logLogout(User $user): self
    {
        return static::log('logout', $user, null, [
            'logout_at' => now()->toISOString(),
        ], $user);
    }

    /**
     * Log quiz session start.
     */
    public static function logQuizSessionStart(QuizSession $session, User $user = null): self
    {
        return static::log('quiz_session_started', $session, null, [
            'quiz_id' => $session->quiz_id,
            'quiz_title' => $session->quiz->title,
            'started_at' => now()->toISOString(),
        ], $user);
    }

    /**
     * Log quiz session end.
     */
    public static function logQuizSessionEnd(QuizSession $session, User $user = null): self
    {
        return static::log('quiz_session_ended', $session, null, [
            'quiz_id' => $session->quiz_id,
            'quiz_title' => $session->quiz->title,
            'participants_count' => $session->participants()->count(),
            'ended_at' => now()->toISOString(),
        ], $user);
    }

    /**
     * Log role change.
     */
    public static function logRoleChange(User $targetUser, string $oldRole, string $newRole, User $admin): self
    {
        return static::log('role_changed', $targetUser, [
            'role' => $oldRole,
        ], [
            'role' => $newRole,
            'changed_by' => $admin->id,
            'changed_by_name' => $admin->name,
        ], $admin);
    }

    /**
     * Log user suspension.
     */
    public static function logUserSuspension(User $targetUser, string $reason, User $admin): self
    {
        return static::log('user_suspended', $targetUser, [
            'is_suspended' => false,
        ], [
            'is_suspended' => true,
            'suspension_reason' => $reason,
            'suspended_by' => $admin->id,
            'suspended_by_name' => $admin->name,
            'suspended_at' => now()->toISOString(),
        ], $admin);
    }

    /**
     * Log user reactivation.
     */
    public static function logUserReactivation(User $targetUser, User $admin): self
    {
        return static::log('user_reactivated', $targetUser, [
            'is_suspended' => true,
        ], [
            'is_suspended' => false,
            'reactivated_by' => $admin->id,
            'reactivated_by_name' => $admin->name,
            'reactivated_at' => now()->toISOString(),
        ], $admin);
    }

    /**
     * Log theme change.
     */
    public static function logThemeChange(User $user, $oldTheme, $newTheme): self
    {
        return static::log('theme_changed', $user, [
            'theme_id' => $oldTheme?->id,
            'theme_name' => $oldTheme?->name,
        ], [
            'theme_id' => $newTheme->id,
            'theme_name' => $newTheme->name,
        ], $user);
    }

    /**
     * Log export action.
     */
    public static function logExport(string $exportType, $target, string $format, User $user = null): self
    {
        return static::log('export_' . $exportType, $target, null, [
            'export_type' => $exportType,
            'format' => $format,
            'exported_at' => now()->toISOString(),
        ], $user);
    }

    /**
     * Log bulk action.
     */
    public static function logBulkAction(string $action, string $targetType, array $targetIds, User $user = null): self
    {
        return static::log('bulk_' . $action, null, null, [
            'action' => $action,
            'target_type' => $targetType,
            'target_ids' => $targetIds,
            'target_count' => count($targetIds),
        ], $user);
    }

    /**
     * Get formatted action name.
     */
    public function getFormattedActionAttribute(): string
    {
        return match($this->action) {
            'created' => 'Création',
            'updated' => 'Modification',
            'deleted' => 'Suppression',
            'login' => 'Connexion',
            'logout' => 'Déconnexion',
            'quiz_session_started' => 'Session de quiz démarrée',
            'quiz_session_ended' => 'Session de quiz terminée',
            'role_changed' => 'Rôle modifié',
            'user_suspended' => 'Utilisateur suspendu',
            'user_reactivated' => 'Utilisateur réactivé',
            'theme_changed' => 'Thème modifié',
            'export_quiz_results' => 'Export résultats quiz',
            'export_user_statistics' => 'Export statistiques utilisateur',
            'bulk_delete' => 'Suppression en lot',
            'bulk_update' => 'Modification en lot',
            default => ucfirst(str_replace('_', ' ', $this->action))
        };
    }

    /**
     * Get formatted target name.
     */
    public function getFormattedTargetAttribute(): string
    {
        if (!$this->target_type) {
            return 'Système';
        }

        $className = class_basename($this->target_type);
        
        return match($className) {
            'User' => 'Utilisateur',
            'Quiz' => 'Quiz',
            'QuizSession' => 'Session de quiz',
            'Question' => 'Question',
            'Answer' => 'Réponse',
            'Tournament' => 'Tournoi',
            'Theme' => 'Thème',
            'Tag' => 'Tag',
            'Badge' => 'Badge',
            'Notification' => 'Notification',
            default => $className
        };
    }

    /**
     * Get changes summary.
     */
    public function getChangesSummaryAttribute(): string
    {
        if (!$this->old_values && !$this->new_values) {
            return 'Aucun changement';
        }

        if ($this->action === 'created') {
            return 'Élément créé';
        }

        if ($this->action === 'deleted') {
            return 'Élément supprimé';
        }

        if ($this->new_values && is_array($this->new_values)) {
            $changes = [];
            foreach ($this->new_values as $field => $newValue) {
                $oldValue = $this->old_values[$field] ?? null;
                if ($oldValue !== $newValue) {
                    $changes[] = "{$field}: {$oldValue} → {$newValue}";
                }
            }
            return implode(', ', $changes);
        }

        return 'Modifications appliquées';
    }

    /**
     * Scope: Recent logs.
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope: By action.
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: By user.
     */
    public function scopeByUser($query, User $user)
    {
        return $query->where('user_id', $user->id);
    }

    /**
     * Scope: By target type.
     */
    public function scopeByTargetType($query, string $targetType)
    {
        return $query->where('target_type', $targetType);
    }

    /**
     * Scope: By IP address.
     */
    public function scopeByIp($query, string $ip)
    {
        return $query->where('ip_address', $ip);
    }

    /**
     * Clean up old logs.
     */
    public static function cleanup(int $days = 90): int
    {
        return static::where('created_at', '<', now()->subDays($days))->delete();
    }
}