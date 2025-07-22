import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, router, usePage } from '@inertiajs/react';
import { Search, Filter, Download, RefreshCw, Eye, Calendar, User, Activity, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuditLog {
    id: number;
    user_id: number;
    user: User;
    action: string;
    target_type: string;
    target_id: number;
    ip_address: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    created_at: string;
}

interface PaginatedAuditLogs {
    data: AuditLog[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Stats {
    total_logs: number;
    unique_users: number;
    actions_today: number;
    critical_actions: number;
}

interface TopUser {
    user: User;
    actions_count: number;
}

interface TopAction {
    action: string;
    count: number;
}

interface AuditLogsProps {
    auditLogs: PaginatedAuditLogs;
    filters: {
        user_id?: number;
        action?: string;
        target_type?: string;
        target_id?: number;
        date_from?: string;
        date_to?: string;
        ip_address?: string;
    };
    stats: Stats;
    topUsers: TopUser[];
    topActions: TopAction[];
    users: User[];
}

export default function AuditLogsIndex({ 
    auditLogs, 
    filters, 
    stats, 
    topUsers, 
    topActions, 
    users 
}: AuditLogsProps) {
    const { props } = usePage();
    const [searchQuery, setSearchQuery] = useState(filters.action || '');
    const [selectedUser, setSelectedUser] = useState(filters.user_id?.toString() || '');
    const [targetType, setTargetType] = useState(filters.target_type || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const applyFilters = () => {
        const params: Record<string, any> = {};
        
        if (searchQuery) params.action = searchQuery;
        if (selectedUser) params.user_id = selectedUser;
        if (targetType) params.target_type = targetType;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        router.get('/admin/audit-logs', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedUser('');
        setTargetType('');
        setDateFrom('');
        setDateTo('');
        
        router.get('/admin/audit-logs', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportLogs = () => {
        router.get('/admin/audit-logs/export', filters);
    };

    const getActionColor = (action: string) => {
        if (action.includes('create')) return 'bg-green-100 text-green-800';
        if (action.includes('update')) return 'bg-blue-100 text-blue-800';
        if (action.includes('delete')) return 'bg-red-100 text-red-800';
        if (action.includes('login')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getSeverityLevel = (action: string) => {
        const criticalActions = ['delete', 'ban', 'suspend', 'impersonate'];
        const warningActions = ['update_role', 'bulk_action', 'admin_login'];
        
        if (criticalActions.some(critical => action.toLowerCase().includes(critical))) {
            return { level: 'critical', color: 'text-red-600', icon: AlertTriangle };
        }
        if (warningActions.some(warning => action.toLowerCase().includes(warning))) {
            return { level: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
        }
        return { level: 'info', color: 'text-blue-600', icon: Activity };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="Logs d'Audit" />
            <AppLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Logs d'Audit</h1>
                            <p className="text-muted-foreground mt-1">
                                Surveillance des activités administratives et utilisateur
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Link href="/admin/audit-logs/dashboard">
                                <Button variant="outline">
                                    <Activity className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Button onClick={exportLogs} variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Exporter
                            </Button>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_logs.toLocaleString()}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Utilisateurs Uniques</CardTitle>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.unique_users}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Actions Aujourd'hui</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.actions_today}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Actions Critiques</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.critical_actions}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filtres */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="w-5 h-5 mr-2" />
                                Filtres
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Action</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Rechercher une action..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Utilisateur</label>
                                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tous les utilisateurs" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Tous les utilisateurs</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type de Cible</label>
                                    <Select value={targetType} onValueChange={setTargetType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tous les types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Tous les types</SelectItem>
                                            <SelectItem value="User">Utilisateur</SelectItem>
                                            <SelectItem value="Quiz">Quiz</SelectItem>
                                            <SelectItem value="Question">Question</SelectItem>
                                            <SelectItem value="QuizSession">Session</SelectItem>
                                            <SelectItem value="Tournament">Tournoi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date Début</label>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date Fin</label>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-4">
                                <Button variant="outline" onClick={clearFilters}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Réinitialiser
                                </Button>
                                <Button onClick={applyFilters}>
                                    <Search className="w-4 h-4 mr-2" />
                                    Appliquer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logs d'audit */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Journal des Activités</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {auditLogs.data.map((log) => {
                                    const severity = getSeverityLevel(log.action);
                                    const SeverityIcon = severity.icon;
                                    
                                    return (
                                        <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-3">
                                                    <SeverityIcon className={`w-5 h-5 mt-0.5 ${severity.color}`} />
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Badge className={getActionColor(log.action)}>
                                                                {log.action}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                par {log.user.name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({log.ip_address})
                                                            </span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="font-medium">{log.target_type}</span>
                                                            {log.target_id && (
                                                                <span className="text-muted-foreground"> #{log.target_id}</span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {formatDate(log.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Link href={`/admin/audit-logs/${log.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}

                                {auditLogs.data.length === 0 && (
                                    <div className="text-center py-12">
                                        <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            Aucun log d'audit trouvé
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Essayez de modifier vos critères de recherche.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {auditLogs.last_page > 1 && (
                                <div className="flex justify-center mt-6">
                                    <div className="flex space-x-1">
                                        {auditLogs.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    if (link.url) {
                                                        router.get(link.url);
                                                    }
                                                }}
                                                disabled={!link.url}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
}