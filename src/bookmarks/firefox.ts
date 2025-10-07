import { Database } from "bun:sqlite";
import { type Browser, getConfig } from "../browsers/firefox/browsers";

export function getBookmarks(browser: Browser = "firefox") {
    const { bookmarkFile } = getConfig(browser);
    const db = new Database(bookmarkFile, { readonly: true });

    const result = db.query(
        "SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    );
    console.log(result.get());
}

if (import.meta.main) {
    getBookmarks();
}
