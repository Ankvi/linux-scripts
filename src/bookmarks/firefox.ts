import { Database } from "bun:sqlite";

export const bookmarkFiles = {
    firefox: `${Bun.env.HOME}/.mozilla/firefox/ko0l2ysk.default-release/places.sqlite`,
} as const;

export type Browsers = keyof typeof bookmarkFiles;

export function getBookmarks(browser: Browsers = "firefox") {
    const db = new Database(bookmarkFiles[browser], { readonly: true });

    const result = db.query(
        "SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    );
    console.log(result.get());
}

if (import.meta.main) {
    getBookmarks();
}
