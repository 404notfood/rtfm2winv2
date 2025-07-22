import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { 
    Bell, 
    BellOff, 
    Check, 
    CheckCheck, 
    Trash2, 
    Filter,
    Settings,
    Mail,
    MailOpen,
    Calendar,
    Trophy,
    Users,
    BookOpen,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface Notification {
    id: number;
    type: 'quiz_invite' | 'friend_request' | 'achievement' | 'tournament' | 'system' | 'reminder';
    title: string;
    message: string;
    data?: Record<string, any>;
    is_read: boolean;
    read_at?: string;
    created_at: string;
    priority: 'low' | 'medium' | 'high';
    sender?: {
        id: number;
        name: string;
        avatar?: string;
    };
}

interface PaginatedNotifications {
    data: Notification[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    unread_count: number;
}

interface NotificationsProps {
    notifications: PaginatedNotifications;
    filters: {
        type?: string;
        status?: 'all' | 'read' | 'unread';
        priority?: string;
    };
    preferences: {
        email_notifications: boolean;
        push_notifications: boolean;
        quiz_invites: boolean;
        friend_requests: boolean;
        achievements: boolean;
        tournaments: boolean;
        system_updates: boolean;
    };
}

export default function NotificationsIndex({ 
    notifications, 
    filters, 
    preferences 
}: NotificationsProps) {
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
    const [currentFilter, setCurrentFilter] = useState({
        type: filters.type || 'all',
        status: filters.status || 'all',
        priority: filters.priority || 'all',
    });

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'quiz_invite': return <BookOpen className="w-5 h-5 text-blue-500" />;
            case 'friend_request': return <Users className="w-5 h-5 text-green-500" />;
            case 'achievement': return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 'tournament': return <Trophy className="w-5 h-5 text-purple-500" />;
            case 'system': return <AlertCircle className="w-5 h-5 text-gray-500" />;
            case 'reminder': return <Calendar className="w-5 h-5 text-orange-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            quiz_invite: 'Invitation Quiz',
            friend_request: 'Demande d\'Amitié',
            achievement: 'Succès',
            tournament: 'Tournoi',
            system: 'Système',
            reminder: 'Rappel',
        };
        return labels[type] || type;
    };

    const formatDate = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'À l\'instant';
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
        if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
        if (diffInMinutes < 10080) return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
        
        return date.toLocaleDateString('fr-FR');
    };

    const toggleNotificationSelection = (notificationId: number) => {
        setSelectedNotifications(prev => 
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const selectAllNotifications = () => {
        const allIds = notifications.data.map(n => n.id);
        setSelectedNotifications(
            selectedNotifications.length === allIds.length ? [] : allIds
        );
    };

    const markAsRead = (notificationId: number) => {
        router.patch(`/notifications/${notificationId}/read`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const markAllAsRead = () => {
        router.patch('/notifications/mark-all-read', {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setSelectedNotifications([]);
            }
        });
    };

    const bulkAction = (action: 'read' | 'delete') => {
        if (selectedNotifications.length === 0) return;

        router.post('/notifications/bulk-action', {
            notification_ids: selectedNotifications,
            action: action,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setSelectedNotifications([]);
            }
        });
    };

    const applyFilters = () => {
        const params: Record<string, any> = {};
        
        if (currentFilter.type !== 'all') params.type = currentFilter.type;
        if (currentFilter.status !== 'all') params.status = currentFilter.status;
        if (currentFilter.priority !== 'all') params.priority = currentFilter.priority;

        router.get('/notifications', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Notifications" />
            <AppLayout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center">
                                <Bell className="w-8 h-8 mr-3 text-blue-500" />
                                Notifications
                                {notifications.unread_count > 0 && (
                                    <Badge className="ml-2 bg-red-500 text-white">
                                        {notifications.unread_count}
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Gérez vos notifications et préférences
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={markAllAsRead}
                                disabled={notifications.unread_count === 0}
                            >
                                <CheckCheck className="w-4 h-4 mr-2" />
                                Tout marquer comme lu
                            </Button>
                            <Button variant="outline">
                                <Settings className="w-4 h-4 mr-2" />
                                Préférences
                            </Button>
                        </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <Select 
                                        value={currentFilter.type} 
                                        onValueChange={(value) => setCurrentFilter(prev => ({ ...prev, type: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les types</SelectItem>
                                            <SelectItem value="quiz_invite">Invitations Quiz</SelectItem>
                                            <SelectItem value="friend_request">Demandes d'Amitié</SelectItem>
                                            <SelectItem value="achievement">Succès</SelectItem>
                                            <SelectItem value="tournament">Tournois</SelectItem>
                                            <SelectItem value="system">Système</SelectItem>
                                            <SelectItem value="reminder">Rappels</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Statut</label>
                                    <Select 
                                        value={currentFilter.status} 
                                        onValueChange={(value) => setCurrentFilter(prev => ({ ...prev, status: value as any }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Toutes</SelectItem>
                                            <SelectItem value="unread">Non lues</SelectItem>
                                            <SelectItem value="read">Lues</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priorité</label>
                                    <Select 
                                        value={currentFilter.priority} 
                                        onValueChange={(value) => setCurrentFilter(prev => ({ ...prev, priority: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Toutes les priorités</SelectItem>
                                            <SelectItem value="high">Haute</SelectItem>
                                            <SelectItem value="medium">Moyenne</SelectItem>
                                            <SelectItem value="low">Basse</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">&nbsp;</label>
                                    <Button onClick={applyFilters} className="w-full">
                                        Appliquer les filtres
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions en lot */}
                    {selectedNotifications.length > 0 && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium">
                                            {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} sélectionnée{selectedNotifications.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => bulkAction('read')}
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Marquer comme lues
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => bulkAction('delete')}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Liste des notifications */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Notifications ({notifications.total})</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={selectedNotifications.length === notifications.data.length && notifications.data.length > 0}
                                        onCheckedChange={selectAllNotifications}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        Sélectionner tout
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {notifications.data.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                                            notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                                        } hover:bg-gray-100`}
                                    >
                                        <Checkbox
                                            checked={selectedNotifications.includes(notification.id)}
                                            onCheckedChange={() => toggleNotificationSelection(notification.id)}
                                        />
                                        
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h3 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                                                                {notification.title}
                                                            </h3>
                                                            <Badge className={getPriorityColor(notification.priority)} variant="secondary">
                                                                {getTypeLabel(notification.type)}
                                                            </Badge>
                                                            {notification.priority === 'high' && (
                                                                <Badge className="bg-red-100 text-red-800" variant="secondary">
                                                                    Priorité élevée
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className={`text-sm ${!notification.is_read ? 'text-gray-900' : 'text-muted-foreground'}`}>
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                            <span>{formatDate(notification.created_at)}</span>
                                                            {notification.sender && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>de {notification.sender.name}</span>
                                                                </>
                                                            )}
                                                            {!notification.is_read && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="flex items-center text-blue-600">
                                                                        <Mail className="w-3 h-3 mr-1" />
                                                                        Non lu
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        {!notification.is_read && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => markAsRead(notification.id)}
                                                            >
                                                                <MailOpen className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => router.delete(`/notifications/${notification.id}`)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                {notification.data && (
                                                    <div className="bg-white p-3 rounded border text-sm">
                                                        <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                                                            {JSON.stringify(notification.data, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {notifications.data.length === 0 && (
                                    <div className="text-center py-12">
                                        <BellOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            Aucune notification
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {filters.type || filters.status !== 'all' ? 
                                                'Aucune notification ne correspond à vos filtres.' :
                                                'Vous n\'avez aucune notification pour le moment.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {notifications.last_page > 1 && (
                                <div className="flex justify-center mt-6">
                                    <div className="flex space-x-1">
                                        {Array.from({ length: notifications.last_page }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={page === notifications.current_page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    const params = new URLSearchParams(window.location.search);
                                                    params.set('page', page.toString());
                                                    router.get(`/notifications?${params.toString()}`);
                                                }}
                                            >
                                                {page}
                                            </Button>
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