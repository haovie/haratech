import { afterEach, describe, expect, it } from 'vitest';

import { isExperimentsEnabled, isExperimentsEnabledOnWeb } from '../src/experiments';

describe('isExperimentsEnabled', () => {
    it('returns true when VKARA_EXPERIMENTS is true/1/yes/on', () => {
        expect(isExperimentsEnabled({ VKARA_EXPERIMENTS: 'true' })).toBe(true);
        expect(isExperimentsEnabled({ VKARA_EXPERIMENTS: '1' })).toBe(true);
        expect(isExperimentsEnabled({ VKARA_EXPERIMENTS: 'yes' })).toBe(true);
        expect(isExperimentsEnabled({ VKARA_EXPERIMENTS: 'on' })).toBe(true);
    });

    it('returns false when VKARA_EXPERIMENTS is false/0/no/off or undefined', () => {
        expect(isExperimentsEnabled({ VKARA_EXPERIMENTS: 'false' })).toBe(false);
        expect(isExperimentsEnabled({ VKARA_EXPERIMENTS: '0' })).toBe(false);
        expect(isExperimentsEnabled({ VKARA_EXPERIMENTS: 'no' })).toBe(false);
        expect(isExperimentsEnabled({ VKARA_EXPERIMENTS: 'off' })).toBe(false);
        expect(isExperimentsEnabled({ VKARA_EXPERIMENTS: undefined })).toBe(false);
    });
});

describe('isExperimentsEnabledOnWeb', () => {
    const originalWindow = globalThis.window;

    afterEach(() => {
        if (originalWindow === undefined) {
            // @ts-expect-error restore undefined window
            delete globalThis.window;
        } else {
            globalThis.window = originalWindow;
        }
    });

    it('prefers NEXT_PUBLIC_VKARA_EXPERIMENTS when defined', () => {
        expect(
            isExperimentsEnabledOnWeb({
                NEXT_PUBLIC_VKARA_EXPERIMENTS: '1',
                VKARA_EXPERIMENTS: '0',
            }),
        ).toBe(true);

        expect(
            isExperimentsEnabledOnWeb({
                NEXT_PUBLIC_VKARA_EXPERIMENTS: '0',
                VKARA_EXPERIMENTS: '1',
            }),
        ).toBe(false);
    });

    it('falls back to VKARA_EXPERIMENTS in server environment (window undefined)', () => {
        // @ts-expect-error simulate server
        delete globalThis.window;

        expect(
            isExperimentsEnabledOnWeb({
                NEXT_PUBLIC_VKARA_EXPERIMENTS: undefined,
                VKARA_EXPERIMENTS: '1',
            }),
        ).toBe(true);

        expect(
            isExperimentsEnabledOnWeb({
                NEXT_PUBLIC_VKARA_EXPERIMENTS: undefined,
                VKARA_EXPERIMENTS: '0',
            }),
        ).toBe(false);
    });

    it('does NOT access VKARA_EXPERIMENTS on the client (browser context)', () => {
        // @ts-expect-error simulate browser
        globalThis.window = {} as unknown as Window & typeof globalThis;

        const clientEnvMock = new Proxy(
            { NEXT_PUBLIC_VKARA_EXPERIMENTS: undefined },
            {
                get(target, prop) {
                    if (prop === 'VKARA_EXPERIMENTS') {
                        throw new Error(
                            '❌ Attempted to access a server-side environment variable on the client',
                        );
                    }
                    return Reflect.get(target, prop);
                },
            },
        );

        // Must not throw when called on client with proxy that protects server env
        expect(() => isExperimentsEnabledOnWeb(clientEnvMock)).not.toThrow();
        expect(isExperimentsEnabledOnWeb(clientEnvMock)).toBe(false);
    });

    it('catches getter errors when accessing server env and returns false', () => {
        // @ts-expect-error simulate server
        delete globalThis.window;

        const throwingEnv = new Proxy(
            { NEXT_PUBLIC_VKARA_EXPERIMENTS: undefined },
            {
                get(target, prop) {
                    if (prop === 'VKARA_EXPERIMENTS') {
                        throw new Error('Some env error');
                    }
                    return Reflect.get(target, prop);
                },
            },
        );

        expect(() => isExperimentsEnabledOnWeb(throwingEnv)).not.toThrow();
        expect(isExperimentsEnabledOnWeb(throwingEnv)).toBe(false);
    });
});
