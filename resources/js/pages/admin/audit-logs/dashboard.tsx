import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from '@inertiajs/react';
import { 
    Activity, 
    TrendingUp, 
    Users, 
    AlertTriangle, 
    Shield, 
    Clock,
    BarChart3,
    Calendar,
    ArrowLeft,
    Download,
    RefreshCw
} from 'lucide-react';

interface DashboardStats {
    total_logs: number;
    logs_today: number;
    logs_this_week: number;
    logs_this_month: number;
    unique_users_today: number;
    critical_actions_today: number;
    failed_logins_today: number;
    success_rate: number;
    most_active_hour: number;
    growth_rate: number;
}

interface ChartData {
    labels: string[];
    values: number[];
    colors: string[];
}

interface TopUser {
    id: number;
    name: string;
    email: string;
    actions_count: number;
    risk_score: number;
    last_action: string;
}

interface TopAction {
    action: string;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
}

interface RecentAlert {
    id: number;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    action: string;
    user_name: string;
}

interface AuditDashboardProps {
    stats: DashboardStats;
    activityChart: ChartData;
    topUsers: TopUser[];
    topActions: TopAction[];
    recentAlerts: RecentAlert[];
    systemHealth: {
        status: 'healthy' | 'warning' | 'critical';
        cpu_usage: number;
        memory_usage: number;
        disk_usage: number;
        response_time: number;
    };
}

export default function AuditDashboard({ 
    stats, 
    activityChart, 
    topUsers, 
    topActions, 
    recentAlerts, 
    systemHealth 
}: AuditDashboardProps) {
    
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSystemStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return '📈';
            case 'down': return '📉';
            default: return '➡️';
        }
    };

    return (
        <>
            <Head title="Dashboard Audit" />
            <AppLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <Link href="/admin/audit-logs">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour aux logs
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold">Dashboard d'Audit</h1>
                                <p className="text-muted-foreground mt-1">
                                    Vue d'ensemble de l'activité système et des métriques de sécurité
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Actualiser
                            </Button>
                            <Button variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Exporter Rapport
                            </Button>
                        </div>
                    </div>

                    {/* Métriques principales */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Logs Aujourd'hui</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.logs_today.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.growth_rate > 0 ? '+' : ''}{stats.growth_rate}% vs hier
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.unique_users_today}</div>
                                <p className="text-xs text-muted-foreground">
                                    Utilisateurs uniques aujourd'hui
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Actions Critiques</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.critical_actions_today}</div>
                                <p className="text-xs text-muted-foreground">
                                    Nécessitent une attention
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.success_rate}%</div>
                                <Progress value={stats.success_rate} className="mt-2" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* État du système */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Shield className="w-5 h-5 mr-2" />
                                État du Système
                                <Badge 
                                    className={`ml-2 ${getSeverityColor(systemHealth.status)}`}
                                    variant="secondary"
                                >
                                    {systemHealth.status === 'healthy' ? 'Sain' :
                                     systemHealth.status === 'warning' ? 'Attention' : 'Critique'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>CPU</span>
                                        <span className={systemHealth.cpu_usage > 80 ? 'text-red-600' : 'text-muted-foreground'}>
                                            {systemHealth.cpu_usage}%
                                        </span>
                                    </div>
                                    <Progress value={systemHealth.cpu_usage} />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Mémoire</span>
                                        <span className={systemHealth.memory_usage > 80 ? 'text-red-600' : 'text-muted-foreground'}>
                                            {systemHealth.memory_usage}%
                                        </span>
                                    </div>
                                    <Progress value={systemHealth.memory_usage} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Disque</span>
                                        <span className={systemHealth.disk_usage > 80 ? 'text-red-600' : 'text-muted-foreground'}>
                                            {systemHealth.disk_usage}%
                                        </span>
                                    </div>
                                    <Progress value={systemHealth.disk_usage} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Temps de Réponse</span>
                                        <span className={systemHealth.response_time > 1000 ? 'text-red-600' : 'text-muted-foreground'}>
                                            {systemHealth.response_time}ms
                                        </span>
                                    </div>
                                    <Progress value={Math.min(100, systemHealth.response_time / 20)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Utilisateurs les plus actifs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    Utilisateurs les Plus Actifs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topUsers.map((user, index) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{user.actions_count}</div>
                                                <div className="text-xs text-muted-foreground">actions</div>
                                                {user.risk_score > 70 && (
                                                    <Badge className="bg-red-100 text-red-800" variant="secondary">
                                                        Risque élevé
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions les plus fréquentes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2" />
                                    Actions les Plus Fréquentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topActions.map((action, index) => (
                                        <div key={action.action} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-sm">{action.action}</span>
                                                    <span className="text-lg">{getTrendIcon(action.trend)}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">{action.count}</div>
                                                    <div className="text-xs text-muted-foreground">{action.percentage}%</div>
                                                </div>
                                            </div>
                                            <Progress value={action.percentage} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alertes récentes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                Alertes Récentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentAlerts.map((alert) => (
                                    <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                                                {alert.severity === 'low' ? 'Faible' :
                                                 alert.severity === 'medium' ? 'Moyen' :
                                                 alert.severity === 'high' ? 'Élevé' : 'Critique'}
                                            </Badge>
                                            <div>
                                                <div className="font-medium text-sm">{alert.message}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {alert.action} par {alert.user_name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDate(alert.timestamp)}
                                        </div>
                                    </div>
                                ))}

                                {recentAlerts.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Shield className="mx-auto h-12 w-12 mb-4" />
                                        <p>Aucune alerte récente</p>
                                        <p className="text-sm">Le système fonctionne normalement</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistiques temporelles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Cette Semaine</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.logs_this_week.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">logs générés</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.logs_this_month.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">logs générés</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Heure de Pointe</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.most_active_hour}h00</div>
                                <p className="text-xs text-muted-foreground">période la plus active</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}