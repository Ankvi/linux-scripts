import { $ } from "bun";
import { Command } from "commander";
import {
    Browser as ChromiumBrowser,
    executables as chromiumExecutables,
} from "./chromium/browsers";
import {
    Browser as FirefoxBrowser,
    executables as firefoxExecutables,
} from "./firefox/browsers";

export type Browser = ChromiumBrowser | FirefoxBrowser;
const browsers = [
    ...Object.values(ChromiumBrowser),
    ...Object.values(FirefoxBrowser),
];

const executables = {
    ...chromiumExecutables,
    ...firefoxExecutables,
};

function isValidBrowser(browser: string): browser is Browser {
    return browsers.some((b) => b === browser);
}

export async function validateOrGetDefaultBrowser(
    browser?: string,
): Promise<Browser> {
    if (!browser) {
        return await getDefaultBrowser();
    }

    if (!isValidBrowser(browser)) {
        throw new Error(`Browser '${browser}' is not configured`);
    }

    return browser;
}

export async function getDefaultBrowser(): Promise<Browser> {
    const responseText = await $`xdg-settings get default-web-browser`.text();
    const defaultBrowser = responseText.trim().replace(/\.desktop$/, ""); // xdg-settings returns a EXECUTABLE.desktop file
    if (!isValidBrowser(defaultBrowser)) {
        throw new Error(`Browser '${defaultBrowser}' is not configured`);
    }
    return defaultBrowser;
}

export const command = new Command("browsers");

command.command("open").action(async () => {
    const browser = await getDefaultBrowser();
    await $`gtk-launch ${browser}.desktop`;
});
