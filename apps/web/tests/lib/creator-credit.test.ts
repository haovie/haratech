import { describe, expect, it } from 'vitest';

import en from '@/locales/en';
import vi from '@/locales/vi';
import { buildStructuredData } from '@/lib/seo/structured-data';

describe('creator credit copy', () => {
    it('uses Made by in English and Phát triển bởi in Vietnamese', () => {
        expect(en['credit.bylinePrefix']).toBe('Made by');
        expect(vi['credit.bylinePrefix']).toBe('Phát triển bởi');
    });

    it('keeps the Vietnam tagline identical in both locales', () => {
        expect(en['credit.tagline']).toBe('From Vietnam with love ❤️');
        expect(vi['credit.tagline']).toBe(en['credit.tagline']);
    });
});

describe('buildStructuredData', () => {
    it('names viehao as the application creator', () => {
        const schemas = buildStructuredData({
            locale: 'en',
            title: 'vkara',
            description: 'karaoke',
            siteName: 'vkara',
        });

        expect(schemas).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    '@type': 'WebApplication',
                    creator: {
                        '@type': 'Person',
                        name: 'viehao',
                        alternateName: '@viehao',
                        url: 'https://github.com/viehao',
                    },
                }),
            ]),
        );
    });
});
