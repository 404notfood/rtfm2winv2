import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { Archive, Bell, BookOpen, Check, Clock, Filter, Settings, Trash2, Trophy, Users, Zap } from 'lucide-react';
import { useState } from 'react';

interface Notification {
    id: number;
    type: 'quiz' | 'battle' | 'tournament' | 'achievement' | 'social' | 'system';
    title: string;
    message: string;
    data?: any;
    read_at: string | null;
    created_at: string;
}

interface Props {
    notifications: {
        data: Notification[];
        unread_count: number;
        total: number;
    };
    filters: {
        type?: string;
        status?: string;
    };
}

export default function Notifications({ notifications, filters }: Props) {
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const { post, processing } = useForm();

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'quiz':
                return <BookOpen className="h-5 w-5 text-blue-500" />;
            case 'battle':
                return <Zap className="h-5 w-5 text-red-500" />;
            case 'tournament':
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 'achievement':
                return <Trophy className="h-5 w-5 text-purple-500" />;
            case 'social':
                return <Users className="h-5 w-5 text-green-500" />;
            case 'system':
                return <Bell className="h-5 w-5 text-gray-500" />;
            default:
                return <Bell className="h-5 w-5" />;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'quiz':
                return 'Quiz';
            case 'battle':
                return 'Battle Royale';
            case 'tournament':
                return 'Tournoi';
            case 'achievement':
                return 'Succès';
            case 'social':
                return 'Social';
            case 'system':
                return 'Système';
            default:
                return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'quiz':
                return 'bg-blue-100 text-blue-800';
            case 'battle':
                return 'bg-red-100 text-red-800';
            case 'tournament':
                return 'bg-yellow-100 text-yellow-800';
            case 'achievement':
                return 'bg-purple-100 text-purple-800';
            case 'social':
                return 'bg-green-100 text-green-800';
            case 'system':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const markAsRead = (notificationId: number) => {
        post(`/notifications/${notificationId}/read`);
    };

    const markAllAsRead = () => {
        post('/notifications/mark-all-read');
    };

    const deleteNotification = (notificationId: number) => {
        if (confirm('Supprimer cette notification ?')) {
            post(`/notifications/${notificationId}`, { _method:   'delete' });
        }
    };

    const clearAllRead = () => {
        if (confirm('Supprimer toutes les notifications lues ?')) {
            post('/notifications/clear-read');
        }
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "À l'instant";
        if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
        if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

        return date.toLocaleDateString('fr-FR');
    };

    const types = [
        { value: 'all', label: 'Tous', icon: Filter },
        { value: 'quiz', label: 'Quiz', icon: BookOpen },
        { value: 'battle', label: 'Battle Royale', icon: Zap },
        { value: 'tournament', label: 'Tournois', icon: Trophy },
        { value: 'achievement', label: 'Succès', icon: Trophy },
        { value: 'social', label: 'Social', icon: Users },
        { value: 'system', label: 'Système', icon: Settings },
    ];

    const statuses = [
        { value: 'all', label: 'Toutes' },
        { value: 'unread', label: 'Non lues' },
        { value: 'read', label: 'Lues' },
    ];

    const filteredNotifications = notifications.data.filter((notification) => {
        if (selectedType !== 'all' && notification.type !== selectedType) return false;
        if (selectedStatus !== 'all') {
            if (selectedStatus === 'unread' && notification.read_at) return false;
            if (selectedStatus === 'read' && !notification.read_at) return false;
        }
        return true;
    });

    return (
        <AppLayout>
            <Head title="Notifications" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                        <p className="text-muted-foreground">
                            {notifications.unread_count > 0 && (
                                <>
                                    <span className="font-medium text-blue-600">
                                        {notifications.unread_count} non lue{notifications.unread_count > 1 ? 's' : ''}
                                    </span>
                                    {' · '}
                                </>
                            )}
                            {notifications.total} notification{notifications.total > 1 ? 's' : ''} au total
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {notifications.unread_count > 0 && (
                            <Button variant="outline" onClick={markAllAsRead} disabled={processing}>
                                <Check className="mr-2 h-4 w-4" />
                                Marquer tout comme lu
                            </Button>
                        )}
                        <Button variant="outline" onClick={clearAllRead} disabled={processing}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archiver les lues
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/settings/notifications">
                                <Settings className="mr-2 h-4 w-4" />
                                Paramètres
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-4">
                            {/* Type Filter */}
                            <div className="flex gap-2">
                                {types.map((type) => (
                                    <Button
                                        key={type.value}
                                        variant={selectedType === type.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedType(type.value)}
                                        className="h-8"
                                    >
                                        <type.icon className="mr-1 h-3 w-3" />
                                        {type.label}
                                    </Button>
                                ))}
                            </div>

                            <div className="h-8 w-px bg-border" />

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                {statuses.map((status) => (
                                    <Button
                                        key={status.value}
                                        variant={selectedStatus === status.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedStatus(status.value)}
                                        className="h-8"
                                    >
                                        {status.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">Aucune notification</h3>
                            <p className="text-muted-foreground">
                                {selectedType !== 'all' || selectedStatus !== 'all'
                                    ? 'Aucune notification ne correspond à vos filtres.'
                                    : 'Vous êtes à jour ! Aucune notification pour le moment.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {filteredNotifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={cn('transition-all hover:shadow-md', !notification.read_at && 'border-blue-200 bg-blue-50')}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="mt-1 flex-shrink-0">{getTypeIcon(notification.type)}</div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <Badge variant="secondary" className={getTypeColor(notification.type)}>
                                                            {getTypeBadge(notification.type)}
                                                        </Badge>
                                                        {!notification.read_at && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                                    </div>
                                                    <h4 className="mb-1 text-sm font-semibold">{notification.title}</h4>
                                                    <p className="mb-2 text-sm text-muted-foreground">{notification.message}</p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {getRelativeTime(notification.created_at)}
                                                        </div>
                                                        {notification.read_at && (
                                                            <div className="flex items-center gap-1">
                                                                <Check className="h-3 w-3" />
                                                                Lu le {new Date(notification.read_at).toLocaleDateString('fr-FR')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1">
                                                    {!notification.read_at && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => markAsRead(notification.id)}
                                                            disabled={processing}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteNotification(notification.id)}
                                                        disabled={processing}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
