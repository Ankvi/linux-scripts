import type { BrowserConfig } from "../common";

export const Browser = {
    Brave: "brave",
    Chrome: "google-chrome-stable",
    Vivaldi: "vivaldi-stable",
} as const;
export type Browser = (typeof Browser)[keyof typeof Browser];
export const browsers = Object.values(Browser);

const bookmarkFiles: { [key in Browser]: string } = {
    [Browser.Brave]: `${Bun.env.HOME}/.config/BraveSoftware/Brave-Browser/Default/Bookmarks`,
    [Browser.Chrome]: `${Bun.env.HOME}/.config/google-chrome/Default/Bookmarks`,
    [Browser.Vivaldi]: `${Bun.env.HOME}/.config/vivaldi/Default/Bookmarks`,
} as const;

export function getConfig(browser: Browser): BrowserConfig {
    return {
        bookmarkFile: bookmarkFiles[browser],
    };
}

export function isChromium(browser: string): browser is Browser {
    return browsers.some((b) => b === browser);
}
