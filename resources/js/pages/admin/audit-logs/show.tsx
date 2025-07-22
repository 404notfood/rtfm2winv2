import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import { ArrowLeft, User, Calendar, MapPin, Target, History, AlertTriangle, Activity, Eye } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
}

interface AuditLogDetail {
    id: number;
    user_id: number;
    user: User;
    action: string;
    target_type: string;
    target_id: number;
    ip_address: string;
    user_agent: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    metadata: Record<string, any> | null;
    created_at: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface RelatedLog {
    id: number;
    action: string;
    target_type: string;
    target_id: number;
    created_at: string;
    risk_level: string;
}

interface AuditLogShowProps {
    auditLog: AuditLogDetail;
    relatedLogs: RelatedLog[];
    context: {
        target_details?: Record<string, any>;
        user_session_info?: Record<string, any>;
        system_info?: Record<string, any>;
    };
}

export default function AuditLogShow({ auditLog, relatedLogs, context }: AuditLogShowProps) {
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('create')) return 'bg-green-100 text-green-800';
        if (action.includes('update')) return 'bg-blue-100 text-blue-800';
        if (action.includes('delete')) return 'bg-red-100 text-red-800';
        if (action.includes('login')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        return String(value);
    };

    const getChangedFields = () => {
        if (!auditLog.old_values || !auditLog.new_values) return [];
        
        const oldKeys = Object.keys(auditLog.old_values);
        const newKeys = Object.keys(auditLog.new_values);
        const allKeys = [...new Set([...oldKeys, ...newKeys])];
        
        return allKeys.filter(key => 
            auditLog.old_values?.[key] !== auditLog.new_values?.[key]
        );
    };

    const getLocationInfo = (ip: string) => {
        // Dans un vrai projet, vous utiliseriez une API de géolocalisation
        // Ici on simule juste quelques informations
        const mockLocations: Record<string, string> = {
            '127.0.0.1': 'Localhost',
            '192.168.1.1': 'Réseau Local',
        };
        return mockLocations[ip] || 'Localisation inconnue';
    };

    return (
        <>
            <Head title={`Log d'Audit #${auditLog.id}`} />
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
                                <h1 className="text-3xl font-bold">Log d'Audit #{auditLog.id}</h1>
                                <p className="text-muted-foreground mt-1">
                                    Détails de l'activité du {formatDate(auditLog.created_at)}
                                </p>
                            </div>
                        </div>
                        <Badge className={getRiskColor(auditLog.risk_level)}>
                            Risque {auditLog.risk_level === 'low' ? 'Faible' : 
                                   auditLog.risk_level === 'medium' ? 'Moyen' :
                                   auditLog.risk_level === 'high' ? 'Élevé' : 'Critique'}
                        </Badge>
                    </div>

                    {/* Informations principales */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="w-5 h-5 mr-2" />
                                    Détails de l'Action
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Action</span>
                                    <Badge className={getActionColor(auditLog.action)}>
                                        {auditLog.action}
                                    </Badge>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Type de cible</span>
                                    <span className="font-medium">{auditLog.target_type}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">ID de cible</span>
                                    <span className="font-medium">#{auditLog.target_id}</span>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-muted-foreground">Date & Heure</span>
                                    <div className="text-right">
                                        <div className="font-medium">{formatDate(auditLog.created_at)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Il y a {Math.floor((Date.now() - new Date(auditLog.created_at).getTime()) / (1000 * 60 * 60 * 24))} jours
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Informations Utilisateur
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Utilisateur</span>
                                    <div className="text-right">
                                        <div className="font-medium">{auditLog.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{auditLog.user.email}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Rôle</span>
                                    <Badge variant="secondary">{auditLog.user.role}</Badge>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-muted-foreground">Adresse IP</span>
                                    <div className="text-right">
                                        <div className="font-medium font-mono">{auditLog.ip_address}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {getLocationInfo(auditLog.ip_address)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-muted-foreground">Navigateur</span>
                                    <div className="text-xs bg-gray-50 p-2 rounded border font-mono">
                                        {auditLog.user_agent}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Changements détaillés */}
                    {(auditLog.old_values || auditLog.new_values) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <History className="w-5 h-5 mr-2" />
                                    Changements Détaillés
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {getChangedFields().length > 0 ? (
                                    <div className="space-y-4">
                                        {getChangedFields().map((field) => (
                                            <div key={field} className="border rounded-lg p-4">
                                                <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                                                    {field}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-xs font-medium text-muted-foreground mb-1">
                                                            AVANT
                                                        </div>
                                                        <div className="bg-red-50 border border-red-200 rounded p-3">
                                                            <pre className="text-xs text-red-800 whitespace-pre-wrap font-mono">
                                                                {formatValue(auditLog.old_values?.[field])}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-muted-foreground mb-1">
                                                            APRÈS
                                                        </div>
                                                        <div className="bg-green-50 border border-green-200 rounded p-3">
                                                            <pre className="text-xs text-green-800 whitespace-pre-wrap font-mono">
                                                                {formatValue(auditLog.new_values?.[field])}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <History className="mx-auto h-12 w-12 mb-4" />
                                        <p>Aucun changement de données détecté</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Logs associés */}
                    {relatedLogs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Target className="w-5 h-5 mr-2" />
                                    Activités Associées ({relatedLogs.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {relatedLogs.slice(0, 10).map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Badge className={getActionColor(log.action)} variant="secondary">
                                                    {log.action}
                                                </Badge>
                                                <span className="text-sm">
                                                    {log.target_type} #{log.target_id}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(log.created_at)}
                                                </span>
                                            </div>
                                            <Link href={`/admin/audit-logs/${log.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                    {relatedLogs.length > 10 && (
                                        <div className="text-center pt-2">
                                            <Link 
                                                href={`/admin/audit-logs?target_type=${auditLog.target_type}&target_id=${auditLog.target_id}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Voir tous les logs associés ({relatedLogs.length})
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Métadonnées */}
                    {auditLog.metadata && Object.keys(auditLog.metadata).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    Métadonnées Techniques
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto font-mono">
                                    {JSON.stringify(auditLog.metadata, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AppLayout>
        </>
    );
}