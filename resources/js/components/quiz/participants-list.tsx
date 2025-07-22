import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Crown, Eye, MoreHorizontal, Search, Shield, Users, UserX } from 'lucide-react';
import { useState } from 'react';

interface Participant {
    id: number;
    user_id?: number;
    pseudo: string;
    score?: number;
    is_online: boolean;
    is_guest: boolean;
    joined_at: string;
    avatar_url?: string;
    position?: number;
    is_eliminated?: boolean;
}

interface Props {
    participants: Participant[];
    creatorId?: number;
    canManage?: boolean;
    showScores?: boolean;
    showActions?: boolean;
    title?: string;
    maxHeight?: string;
}

export function ParticipantsList({
    participants,
    creatorId,
    canManage = false,
    showScores = false,
    showActions = false,
    title = 'Participants',
    maxHeight = 'max-h-96',
}: Props) {
    const [search, setSearch] = useState('');

    const filteredParticipants = participants.filter((participant) => participant.pseudo.toLowerCase().includes(search.toLowerCase()));

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const handleParticipantAction = (action: string, participantId: number) => {
        // Actions like kick, promote, etc.
        console.log(`Action ${action} on participant ${participantId}`);
    };

    const getPositionBadge = (position: number) => {
        const colors = {
            1: 'bg-yellow-500 text-white',
            2: 'bg-gray-400 text-white',
            3: 'bg-amber-600 text-white',
        };

        return (
            <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    colors[position as keyof typeof colors] || 'bg-gray-200 text-gray-700'
                }`}
            >
                {position}
            </div>
        );
    };

    if (participants.length === 0) {
        return (
            <div className="py-8 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold">En attente de participants</h3>
                <p className="text-sm text-muted-foreground">Partagez le lien ou le QR code pour inviter des participants</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Header */}
            {participants.length > 5 && (
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold">
                        <Users className="h-5 w-5" />
                        {title} ({filteredParticipants.length})
                    </h3>

                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48 pl-10" />
                    </div>
                </div>
            )}

            {/* Participants List */}
            <div className={`space-y-2 overflow-y-auto ${maxHeight}`}>
                {filteredParticipants.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">{search ? 'Aucun participant trouvé' : 'Aucun participant'}</div>
                ) : (
                    filteredParticipants.map((participant) => (
                        <div
                            key={participant.id}
                            className={`flex items-center gap-3 rounded-lg border p-3 ${
                                participant.is_eliminated ? 'bg-red-50 opacity-60' : 'bg-background'
                            } ${!participant.is_online ? 'opacity-75' : ''}`}
                        >
                            {/* Position/Rank */}
                            {showScores && participant.position && <div className="flex-shrink-0">{getPositionBadge(participant.position)}</div>}

                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={participant.avatar_url} />
                                    <AvatarFallback>{getInitials(participant.pseudo)}</AvatarFallback>
                                </Avatar>

                                {/* Online status indicator */}
                                <div
                                    className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-background ${
                                        participant.is_online ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                                />
                            </div>

                            {/* Participant Info */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="truncate font-medium">{participant.pseudo}</span>

                                    {/* Badges */}
                                    {participant.is_guest && (
                                        <Badge variant="secondary" className="text-xs">
                                            Invité
                                        </Badge>
                                    )}

                                    {participant.user_id === creatorId && (
                                        <Badge variant="outline" className="text-xs">
                                            Créateur
                                        </Badge>
                                    )}

                                    {participant.position === 1 && <Crown className="h-4 w-4 text-yellow-500" />}

                                    {participant.is_eliminated && (
                                        <Badge variant="destructive" className="text-xs">
                                            Éliminé
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {showScores && participant.score !== undefined && (
                                        <span className="font-semibold text-primary">{participant.score} pts</span>
                                    )}

                                    <span>Rejoint {new Date(participant.joined_at).toLocaleTimeString()}</span>

                                    <span className={participant.is_online ? 'text-green-600' : 'text-gray-500'}>
                                        {participant.is_online ? 'En ligne' : 'Hors ligne'}
                                    </span>
                                </div>
                            </div>

                            {/* Score Display */}
                            {showScores && participant.score !== undefined && (
                                <div className="flex-shrink-0 text-right">
                                    <div className="text-lg font-bold">{participant.score}</div>
                                    <div className="text-xs text-muted-foreground">points</div>
                                </div>
                            )}

                            {/* Actions */}
                            {(canManage || showActions) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleParticipantAction('view', participant.id)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Voir le profil
                                        </DropdownMenuItem>

                                        {canManage && (
                                            <>
                                                <DropdownMenuSeparator />

                                                {!participant.is_eliminated && (
                                                    <DropdownMenuItem onClick={() => handleParticipantAction('promote', participant.id)}>
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Promouvoir
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuItem
                                                    onClick={() => handleParticipantAction('kick', participant.id)}
                                                    className="text-destructive"
                                                >
                                                    <UserX className="mr-2 h-4 w-4" />
                                                    Exclure
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Summary */}
            {participants.length > 0 && (
                <div className="border-t pt-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{participants.filter((p) => p.is_online).length} en ligne</span>
                        <span>{participants.filter((p) => p.is_guest).length} invités</span>
                        {showScores && participants.some((p) => p.score !== undefined) && (
                            <span>
                                Score moyen:{' '}
                                {Math.round(
                                    participants.filter((p) => p.score !== undefined).reduce((sum, p) => sum + (p.score || 0), 0) /
                                        participants.filter((p) => p.score !== undefined).length,
                                )}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
