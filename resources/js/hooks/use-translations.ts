import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useT() {
    const { t, i18n } = useTranslation();
    const { auth } = usePage<SharedData>().props;

    // Sync language from user's database preference on mount
    useEffect(() => {
        const userLanguage = auth?.user?.language;
        if (userLanguage && userLanguage !== i18n.language) {
            i18n.changeLanguage(userLanguage);
        }
    }, [auth?.user?.language, i18n]);

    const changeLanguage = async (lang: 'pt' | 'en', reload: boolean = false) => {
        i18n.changeLanguage(lang);

        // Save to backend if user is authenticated
        if (auth?.user) {
            try {
                await axios.patch('/settings/preferences', { language: lang });
                if (reload) {
                    window.location.reload();
                }
            } catch (error) {
                console.error('Failed to save language preference:', error);
            }
        }
    };

    const currentLanguage = i18n.language as 'pt' | 'en';

    return {
        t,
        i18n,
        changeLanguage,
        currentLanguage,
    };
}
