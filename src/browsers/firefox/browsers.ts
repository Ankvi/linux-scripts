import type { BrowserConfig } from "../common";

export const Browser = {
    Firefox: "firefox",
} as const;
export type Browser = (typeof Browser)[keyof typeof Browser];
const browsers = Object.values(Browser);

const bookmarkFiles: { [key in Browser]: string } = {
    firefox: `${Bun.env.HOME}/.mozilla/firefox/ko0l2ysk.default-release/places.sqlite`,
} as const;

export function getConfig(browser: Browser): BrowserConfig {
    return {
        bookmarkFile: bookmarkFiles[browser],
    };
}

export function isFirefox(browser: string): browser is Browser {
    return browsers.some((b) => b === browser);
}
