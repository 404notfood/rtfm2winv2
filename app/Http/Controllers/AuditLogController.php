<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AuditLogController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!Auth::user()->isAdmin()) {
                abort(403, 'Accès réservé aux administrateurs.');
            }
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'action' => 'nullable|string|max:100',
            'target_type' => 'nullable|string|max:100',
            'target_id' => 'nullable|integer',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'ip_address' => 'nullable|ip',
            'per_page' => 'nullable|integer|min:10|max:100',
        ]);

        $query = AuditLog::with(['user:id,name,email'])
            ->when($validated['user_id'] ?? null, function ($q, $userId) {
                $q->where('user_id', $userId);
            })
            ->when($validated['action'] ?? null, function ($q, $action) {
                $q->where('action', 'LIKE', '%' . $action . '%');
            })
            ->when($validated['target_type'] ?? null, function ($q, $targetType) {
                $q->where('target_type', $targetType);
            })
            ->when($validated['target_id'] ?? null, function ($q, $targetId) {
                $q->where('target_id', $targetId);
            })
            ->when($validated['date_from'] ?? null, function ($q, $dateFrom) {
                $q->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($validated['date_to'] ?? null, function ($q, $dateTo) {
                $q->whereDate('created_at', '<=', $dateTo);
            })
            ->when($validated['ip_address'] ?? null, function ($q, $ipAddress) {
                $q->where('ip_address', $ipAddress);
            })
            ->latest();

        $auditLogs = $query->paginate($validated['per_page'] ?? 25);

        // Statistiques pour la période sélectionnée
        $stats = $this->getStats($validated);

        // Utilisateurs les plus actifs
        $topUsers = $this->getTopUsers($validated);

        // Actions les plus fréquentes
        $topActions = $this->getTopActions($validated);

        return Inertia::render('admin/audit-logs/index', [
            'auditLogs' => $auditLogs,
            'filters' => $validated,
            'stats' => $stats,
            'topUsers' => $topUsers,
            'topActions' => $topActions,
            'users' => User::select('id', 'name', 'email')->get(),
        ]);
    }

    public function show(AuditLog $auditLog)
    {
        $auditLog->load(['user:id,name,email']);

        return Inertia::render('admin/audit-logs/show', [
            'auditLog' => $auditLog,
        ]);
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'format' => 'required|in:csv,json',
            'user_id' => 'nullable|exists:users,id',
            'action' => 'nullable|string|max:100',
            'target_type' => 'nullable|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $query = AuditLog::with(['user:id,name,email'])
            ->when($validated['user_id'] ?? null, function ($q, $userId) {
                $q->where('user_id', $userId);
            })
            ->when($validated['action'] ?? null, function ($q, $action) {
                $q->where('action', 'LIKE', '%' . $action . '%');
            })
            ->when($validated['target_type'] ?? null, function ($q, $targetType) {
                $q->where('target_type', $targetType);
            })
            ->when($validated['date_from'] ?? null, function ($q, $dateFrom) {
                $q->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($validated['date_to'] ?? null, function ($q, $dateTo) {
                $q->whereDate('created_at', '<=', $dateTo);
            })
            ->latest();

        $auditLogs = $query->get();

        if ($validated['format'] === 'csv') {
            return $this->exportCsv($auditLogs);
        } else {
            return $this->exportJson($auditLogs);
        }
    }

    public function dashboard()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $thisWeek = Carbon::now()->startOfWeek();
        $lastWeek = Carbon::now()->subWeek()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $stats = [
            'today' => [
                'total' => AuditLog::whereDate('created_at', $today)->count(),
                'users' => AuditLog::whereDate('created_at', $today)->distinct('user_id')->count(),
            ],
            'yesterday' => [
                'total' => AuditLog::whereDate('created_at', $yesterday)->count(),
                'users' => AuditLog::whereDate('created_at', $yesterday)->distinct('user_id')->count(),
            ],
            'this_week' => [
                'total' => AuditLog::where('created_at', '>=', $thisWeek)->count(),
                'users' => AuditLog::where('created_at', '>=', $thisWeek)->distinct('user_id')->count(),
            ],
            'last_week' => [
                'total' => AuditLog::whereBetween('created_at', [$lastWeek, $thisWeek])->count(),
                'users' => AuditLog::whereBetween('created_at', [$lastWeek, $thisWeek])->distinct('user_id')->count(),
            ],
            'this_month' => [
                'total' => AuditLog::where('created_at', '>=', $thisMonth)->count(),
                'users' => AuditLog::where('created_at', '>=', $thisMonth)->distinct('user_id')->count(),
            ],
            'last_month' => [
                'total' => AuditLog::whereBetween('created_at', [$lastMonth, $thisMonth])->count(),
                'users' => AuditLog::whereBetween('created_at', [$lastMonth, $thisMonth])->distinct('user_id')->count(),
            ],
        ];

        // Activité par heure (dernières 24h)
        $hourlyActivity = AuditLog::where('created_at', '>=', Carbon::now()->subDay())
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->keyBy('hour');

        // Remplir les heures manquantes avec 0
        $hourlyData = [];
        for ($i = 0; $i < 24; $i++) {
            $hourlyData[] = [
                'hour' => $i,
                'count' => $hourlyActivity->get($i)->count ?? 0,
            ];
        }

        // Activité par jour (derniers 30 jours)
        $dailyActivity = AuditLog::where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $dailyData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $dailyData[] = [
                'date' => $date,
                'count' => $dailyActivity->get($date)->count ?? 0,
            ];
        }

        // Actions les plus fréquentes (derniers 7 jours)
        $topActions = AuditLog::where('created_at', '>=', Carbon::now()->subWeek())
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Utilisateurs les plus actifs (derniers 7 jours)
        $topUsers = AuditLog::where('created_at', '>=', Carbon::now()->subWeek())
            ->with('user:id,name,email')
            ->selectRaw('user_id, COUNT(*) as count')
            ->groupBy('user_id')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Types de cibles les plus modifiés
        $topTargets = AuditLog::where('created_at', '>=', Carbon::now()->subWeek())
            ->selectRaw('target_type, COUNT(*) as count')
            ->groupBy('target_type')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('admin/audit-logs/dashboard', [
            'stats' => $stats,
            'hourlyActivity' => $hourlyData,
            'dailyActivity' => $dailyData,
            'topActions' => $topActions,
            'topUsers' => $topUsers,
            'topTargets' => $topTargets,
        ]);
    }

    public function cleanup(Request $request)
    {
        $validated = $request->validate([
            'older_than_days' => 'required|integer|min:30|max:365',
        ]);

        $cutoffDate = Carbon::now()->subDays($validated['older_than_days']);
        $deletedCount = AuditLog::where('created_at', '<', $cutoffDate)->delete();

        return back()->with('success', "{$deletedCount} logs supprimés avec succès.");
    }

    private function getStats(array $filters): array
    {
        $query = AuditLog::query();

        // Appliquer les mêmes filtres que pour la liste principale
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }
        if (!empty($filters['action'])) {
            $query->where('action', 'LIKE', '%' . $filters['action'] . '%');
        }
        if (!empty($filters['target_type'])) {
            $query->where('target_type', $filters['target_type']);
        }
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return [
            'total_logs' => $query->count(),
            'unique_users' => $query->distinct('user_id')->count('user_id'),
            'unique_ips' => $query->distinct('ip_address')->count('ip_address'),
            'date_range' => [
                'from' => $query->min('created_at'),
                'to' => $query->max('created_at'),
            ],
        ];
    }

    private function getTopUsers(array $filters): array
    {
        $query = AuditLog::with('user:id,name,email');

        // Appliquer les filtres
        if (!empty($filters['action'])) {
            $query->where('action', 'LIKE', '%' . $filters['action'] . '%');
        }
        if (!empty($filters['target_type'])) {
            $query->where('target_type', $filters['target_type']);
        }
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->selectRaw('user_id, COUNT(*) as count')
            ->groupBy('user_id')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->toArray();
    }

    private function getTopActions(array $filters): array
    {
        $query = AuditLog::query();

        // Appliquer les filtres
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }
        if (!empty($filters['target_type'])) {
            $query->where('target_type', $filters['target_type']);
        }
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->toArray();
    }

    private function exportCsv($auditLogs)
    {
        $filename = 'audit_logs_' . Carbon::now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($auditLogs) {
            $file = fopen('php://output', 'w');
            
            // En-têtes CSV
            fputcsv($file, [
                'ID',
                'Utilisateur',
                'Email',
                'Action',
                'Type de cible',
                'ID de cible',
                'Adresse IP',
                'Date',
                'Anciennes valeurs',
                'Nouvelles valeurs',
            ]);

            // Données
            foreach ($auditLogs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->user->name ?? 'N/A',
                    $log->user->email ?? 'N/A',
                    $log->action,
                    $log->target_type ?? 'N/A',
                    $log->target_id ?? 'N/A',
                    $log->ip_address,
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->old_values ? json_encode($log->old_values) : '',
                    $log->new_values ? json_encode($log->new_values) : '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportJson($auditLogs)
    {
        $filename = 'audit_logs_' . Carbon::now()->format('Y_m_d_H_i_s') . '.json';

        return response()->json([
            'export_date' => Carbon::now()->toISOString(),
            'total_records' => $auditLogs->count(),
            'audit_logs' => $auditLogs->toArray(),
        ])
        ->header('Content-Disposition', "attachment; filename=\"$filename\"");
    }
}