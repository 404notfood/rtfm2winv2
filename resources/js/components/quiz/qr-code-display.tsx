import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, QrCode, Share2 } from 'lucide-react';

interface Props {
    url: string;
    code: string;
    title: string;
}

export function QRCodeDisplay({ url, code, title }: Props) {
    const copyUrl = () => {
        navigator.clipboard.writeText(url);
    };

    const shareUrl = () => {
        if (navigator.share) {
            navigator.share({
                title,
                text: `Rejoignez le quiz "${title}"`,
                url,
            });
        } else {
            copyUrl();
        }
    };

    return (
        <div className="flex items-center justify-center">
            <Card className="text-center">
                <CardContent className="p-6">
                    <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-lg bg-muted">
                        <QrCode className="h-32 w-32 text-muted-foreground" />
                        <div className="absolute rounded border bg-background px-2 py-1 font-mono text-xs">QR Code</div>
                    </div>

                    <div className="mb-2 text-2xl font-bold tracking-wider">{code}</div>

                    <p className="mb-4 text-sm text-muted-foreground">Scannez le QR code ou utilisez le code ci-dessus</p>

                    <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={copyUrl}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copier le lien
                        </Button>
                        <Button variant="outline" size="sm" onClick={shareUrl}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Partager
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
