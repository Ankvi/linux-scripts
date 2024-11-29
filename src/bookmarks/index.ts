import { Command } from "commander";
import * as chromium from "./chromium";
import * as firefox from "./firefox";

type Browsers = firefox.Browsers | chromium.Browsers;

export const bookmarks = new Command("bookmarks");

bookmarks.command("list <browser>").action(async (browser: Browsers) => {
    switch (browser) {
        case "firefox": {
            await firefox.getBookmarks(browser);
            break;
        }
        case "brave": {
            await chromium.listBookmarks(browser);
            break;
        }
    }
});

bookmarks.command("open <browser>").action(async (browser: Browsers) => {
    switch (browser) {
        case "firefox": {
            await firefox.getBookmarks(browser);
            break;
        }
        case "brave": {
            await chromium.openBookmark(browser);
            break;
        }
    }
});
