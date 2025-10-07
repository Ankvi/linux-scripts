import { Command } from "commander";
import { type Browser, validateOrGetDefaultBrowser } from "../browsers";
import { isChromium } from "../browsers/chromium/browsers";
import { isFirefox } from "../browsers/firefox/browsers";
import * as chromium from "./chromium";
import * as firefox from "./firefox";

export const bookmarks = new Command("bookmarks");

bookmarks.command("list [browser]").action(async (browser?: Browser) => {
    browser = await validateOrGetDefaultBrowser(browser);
    if (isChromium(browser)) {
        return await chromium.listBookmarks(browser);
    }
    if (isFirefox(browser)) {
        return await firefox.getBookmarks(browser);
    }
});

bookmarks.command("open [browser]").action(async (browser?: Browser) => {
    browser = await validateOrGetDefaultBrowser(browser);
    if (isChromium(browser)) {
        return await chromium.openBookmark(browser);
    }
    if (isFirefox(browser)) {
        return await firefox.getBookmarks(browser);
    }
});
