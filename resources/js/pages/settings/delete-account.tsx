import { Head } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import { useT } from '@/hooks/use-translations';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function DeleteAccount() {
    const { t } = useT();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.deleteAccount') || 'Delete Account',
            href: '/settings/delete-account',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.deleteAccount') || 'Delete Account'} />

            <SettingsLayout>
                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
