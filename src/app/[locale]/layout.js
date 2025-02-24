import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import  './../globals.css'
import { Providers } from './providers';
export default async function LocaleLayout({children, params}) {
    const locale = params?.locale;

    if (!routing.locales.includes(locale)) {
        notFound();
    }

    const messages = await getMessages({locale});

    return (
        <html lang={locale}>
        <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
           <Providers>
                        {children}
           </Providers>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
