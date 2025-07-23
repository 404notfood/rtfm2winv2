import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BarChart3, BookOpen, Calendar, Clock, Download, Eye, FileText, Play, Plus, RefreshCw, Send, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Report {
    id: number;
    name: string;
    description?: string;
    type: 'users' | 'content' | 'sessions' | 'analytics' | 'custom';
    format: 'pdf' | 'excel' | 'csv' | 'json';
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
    status: 'pending' | 'generating' | 'completed' | 'failed' | 'scheduled';
    parameters: Record<string, any>;
    created_at: string;
    generated_at?: string;
    file_size?: string;
    download_url?: string;
    auto_send: boolean;
    recipients: string[];
}

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: 'users' | 'content' | 'sessions' | 'analytics' | 'custom';
    icon: any;
    parameters: Array<{
        key: string;
        label: string;
        type: 'text' | 'select' | 'date' | 'checkbox' | 'multiselect';
        options?: string[];
        required?: boolean;
        default?: any;
    }>;
}

interface Props {
    reports: Report[];
    templates: ReportTemplate[];
    stats: {
        total_reports: number;
        completed_reports: number;
        scheduled_reports: number;
        failed_reports: number;
    };
}

export default function AdminReports({ reports, templates, stats }: Props) {
    const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        template_id: '',
        format: 'pdf',
        frequency: 'once',
        auto_send: false,
        recipients: [] as string[],
        parameters: {} as Record<string, any>,
    });

    const handleCreateReport = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/reports', {
            onSuccess: () => {
                reset();
                setShowCreateForm(false);
                setSelectedTemplate(null);
            },
        });
    };

    const handleTemplateSelect = (template: ReportTemplate) => {
        setSelectedTemplate(template);
        setData((prev) => ({
            ...prev,
            template_id: template.id,
            name: `Rapport ${template.name}`,
            parameters: template.parameters.reduce(
                (acc, param) => ({
                    ...acc,
                    [param.key]: param.default || '',
                }),
                {},
            ),
        }));
        setShowCreateForm(true);
    };

    const handleParameterChange = (key: string, value: any) => {
        setData('parameters', {
            ...data.parameters,
            [key]: value,
        });
    };

    const handleDownload = (reportId: number) => {
        window.open(`/admin/reports/${reportId}/download`, '_blank');
    };

    const handleDelete = (reportId: number) => {
        if (confirm('Supprimer ce rapport ? Cette action est irréversible.')) {
            post(`/admin/reports/${reportId}`, { _method:   'delete' } as any);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            generating: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            scheduled: 'bg-purple-100 text-purple-800',
        };
        return <Badge className={statusColors[status as keyof typeof statusColors]}>{status}</Badge>;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'users':
                return <Users className="h-4 w-4" />;
            case 'content':
                return <BookOpen className="h-4 w-4" />;
            case 'sessions':
                return <Play className="h-4 w-4" />;
            case 'analytics':
                return <BarChart3 className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getFrequencyText = (frequency: string) => {
        const frequencies = {
            once: 'Unique',
            daily: 'Quotidien',
            weekly: 'Hebdomadaire',
            monthly: 'Mensuel',
            quarterly: 'Trimestriel',
        };
        return frequencies[frequency as keyof typeof frequencies] || frequency;
    };

    return (
        <AppLayout>
            <Head title="Rapports et Exports" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour au dashboard
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Rapports et Exports</h1>
                            <p className="text-muted-foreground">Générez et planifiez des rapports détaillés</p>
                        </div>
                    </div>

                    <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau rapport
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{stats.total_reports}</div>
                            <div className="text-sm text-muted-foreground">Rapports au total</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.completed_reports}</div>
                            <div className="text-sm text-muted-foreground">Complétés</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.scheduled_reports}</div>
                            <div className="text-sm text-muted-foreground">Planifiés</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{stats.failed_reports}</div>
                            <div className="text-sm text-muted-foreground">Échoués</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Create Report Form */}
                {showCreateForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{selectedTemplate ? `Créer un rapport ${selectedTemplate.name}` : 'Choisir un modèle de rapport'}</CardTitle>
                            <CardDescription>
                                {selectedTemplate ? 'Configurez les paramètres de votre rapport' : 'Sélectionnez un modèle pour commencer'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!selectedTemplate ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {templates.map((template) => (
                                        <Card
                                            key={template.id}
                                            className="cursor-pointer transition-shadow hover:shadow-md"
                                            onClick={() => handleTemplateSelect(template)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded bg-primary/10 p-2">
                                                        <template.icon className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium">{template.name}</h3>
                                                        <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <form onSubmit={handleCreateReport} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nom du rapport *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={errors.name ? 'border-destructive' : ''}
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="format">Format</Label>
                                            <Select value={data.format} onValueChange={(value) => setData('format', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pdf">PDF</SelectItem>
                                                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                                                    <SelectItem value="csv">CSV</SelectItem>
                                                    <SelectItem value="json">JSON</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (optionnel)</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="frequency">Fréquence</Label>
                                            <Select value={data.frequency} onValueChange={(value) => setData('frequency', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="once">Une seule fois</SelectItem>
                                                    <SelectItem value="daily">Quotidien</SelectItem>
                                                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                                    <SelectItem value="monthly">Mensuel</SelectItem>
                                                    <SelectItem value="quarterly">Trimestriel</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="auto_send">Envoi automatique</Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="auto_send"
                                                    checked={data.auto_send}
                                                    onCheckedChange={(checked) => setData('auto_send', !!checked)}
                                                />
                                                <Label htmlFor="auto_send" className="text-sm">
                                                    Envoyer automatiquement par email
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    {data.auto_send && (
                                        <div className="space-y-2">
                                            <Label htmlFor="recipients">Destinataires (emails séparés par des virgules)</Label>
                                            <Input
                                                id="recipients"
                                                value={data.recipients.join(', ')}
                                                onChange={(e) =>
                                                    setData(
                                                        'recipients',
                                                        e.target.value
                                                            .split(',')
                                                            .map((email) => email.trim())
                                                            .filter(Boolean),
                                                    )
                                                }
                                                placeholder="admin@example.com, user@example.com"
                                            />
                                        </div>
                                    )}

                                    {/* Template Parameters */}
                                    {selectedTemplate.parameters.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-medium">Paramètres du rapport</h3>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {selectedTemplate.parameters.map((param) => (
                                                    <div key={param.key} className="space-y-2">
                                                        <Label htmlFor={param.key}>
                                                            {param.label}
                                                            {param.required && ' *'}
                                                        </Label>

                                                        {param.type === 'text' && (
                                                            <Input
                                                                id={param.key}
                                                                value={data.parameters[param.key] || ''}
                                                                onChange={(e) => handleParameterChange(param.key, e.target.value)}
                                                                required={param.required}
                                                            />
                                                        )}

                                                        {param.type === 'select' && (
                                                            <Select
                                                                value={data.parameters[param.key] || ''}
                                                                onValueChange={(value) => handleParameterChange(param.key, value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {param.options?.map((option) => (
                                                                        <SelectItem key={option} value={option}>
                                                                            {option}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}

                                                        {param.type === 'date' && (
                                                            <Input
                                                                id={param.key}
                                                                type="date"
                                                                value={data.parameters[param.key] || ''}
                                                                onChange={(e) => handleParameterChange(param.key, e.target.value)}
                                                                required={param.required}
                                                            />
                                                        )}

                                                        {param.type === 'checkbox' && (
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={param.key}
                                                                    checked={data.parameters[param.key] || false}
                                                                    onCheckedChange={(checked) => handleParameterChange(param.key, !!checked)}
                                                                />
                                                                <Label htmlFor={param.key} className="text-sm">
                                                                    {param.label}
                                                                </Label>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowCreateForm(false);
                                                setSelectedTemplate(null);
                                                reset();
                                            }}
                                        >
                                            Annuler
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? (
                                                <>
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                    Création...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Créer le rapport
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Reports List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mes rapports ({reports.length})</CardTitle>
                        <CardDescription>Gérez vos rapports générés et planifiés</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reports.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <h3 className="mb-2 text-lg font-semibold">Aucun rapport créé</h3>
                                <p className="mb-4">Commencez par créer votre premier rapport !</p>
                                <Button onClick={() => setShowCreateForm(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Créer mon premier rapport
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reports.map((report) => (
                                    <div key={report.id} className="flex items-center gap-4 rounded-lg border p-4">
                                        <div className="rounded bg-muted/30 p-2">{getTypeIcon(report.type)}</div>

                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="font-medium">{report.name}</h3>
                                                {getStatusBadge(report.status)}
                                                <Badge variant="outline" className="text-xs">
                                                    {report.format.toUpperCase()}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {getFrequencyText(report.frequency)}
                                                </Badge>
                                                {report.auto_send && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Send className="mr-1 h-3 w-3" />
                                                        Auto-envoi
                                                    </Badge>
                                                )}
                                            </div>

                                            {report.description && <p className="mb-2 text-sm text-muted-foreground">{report.description}</p>}

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Créé le {new Date(report.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                                {report.generated_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Généré le {new Date(report.generated_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                )}
                                                {report.file_size && <span>{report.file_size}</span>}
                                                {report.recipients.length > 0 && <span>{report.recipients.length} destinataire(s)</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {report.status === 'completed' && report.download_url && (
                                                <Button variant="ghost" size="sm" onClick={() => handleDownload(report.id)}>
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/reports/${report.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(report.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
