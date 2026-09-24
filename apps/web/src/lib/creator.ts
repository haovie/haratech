export const CREATOR_HANDLE = '@viehao';
export const CREATOR_GITHUB_URL = 'https://github.com/viehao';
export const CREATOR_LEGAL_NAME = 'viehao';
export const CREATOR_EMAIL = '';

export function buildCreatorPerson() {
    return {
        '@type': 'Person' as const,
        name: CREATOR_LEGAL_NAME,
        alternateName: CREATOR_HANDLE,
        url: CREATOR_GITHUB_URL,
    };
}
