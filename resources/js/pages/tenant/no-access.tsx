import { Button } from '@/components/ui/button';
import { useT } from '@/hooks/use-translations';
import AuthLayout from '@/layouts/auth-layout';
import { Head, router } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

export default function NoAccess() {
    const { t } = useT();

    return (
        <AuthLayout
            title={t('tenant.noAccess') || 'No Access'}
            description={t('tenant.noAccessDesc') || 'You are not associated with any organization'}
        >
            <Head title={t('tenant.noAccess') || 'No Access'} />

            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        {t('tenant.noAccessMessage') || 'Your account is not associated with any organization. Please contact your administrator to request access.'}
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => router.post('/logout')}
                    className="mt-4"
                >
                    {t('auth.signOut') || 'Sign out'}
                </Button>
            </div>
        </AuthLayout>
    );
}
