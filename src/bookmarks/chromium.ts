import { $ } from "bun";
import { type Browser, getConfig } from "../browsers/chromium/browsers";

type BookmarksFile = {
    version: number;
    checksum: string;
    roots: {
        bookmark_bar: BookmarksFolder;
        other: BookmarksFolder;
        synced: BookmarksFolder;
    };
};

type BookmarksEntry = {
    id: string;
    guid: string;
    name: string;
    date_added: string;
    date_last_used: string;
    date_modified: string;
};

type BookmarksFolder = BookmarksEntry & {
    type: "folder";
    children: (BookmarksFolder | Bookmark)[];
};

type Bookmark = BookmarksEntry & {
    type: "url";
    url: string;
};

function flattenFolders(folder: BookmarksFolder): Bookmark[] {
    const output: Bookmark[] = [];
    for (const child of folder.children) {
        switch (child.type) {
            case "url": {
                output.push(child);
                break;
            }

            case "folder": {
                output.push(...flattenFolders(child));
            }
        }
    }

    return output;
}

async function getBookmarks(browser: Browser) {
    const { bookmarkFile } = getConfig(browser);
    const file = Bun.file(bookmarkFile);

    const bookmarks = (await file.json()) as BookmarksFile;

    const allBookmarks = [
        ...flattenFolders(bookmarks.roots.bookmark_bar),
        ...flattenFolders(bookmarks.roots.other),
        ...flattenFolders(bookmarks.roots.synced),
    ];

    return allBookmarks;
}

export async function listBookmarks(browser: Browser = "brave") {
    const bookmarks = await getBookmarks(browser);
    bookmarks.sort((a, b) => {
        const aId = Number.parseInt(a.id, 10);
        const bId = Number.parseInt(b.id, 10);

        if (aId < bId) {
            return -1;
        }

        if (aId > bId) {
            return 1;
        }

        return 0;
    });
    for (const bookmark of bookmarks) {
        console.log(`${bookmark.name}: ${bookmark.url}`);
    }
}

export async function openBookmark(browser: Browser = "brave") {
    const bookmarks = await getBookmarks(browser);

    const map = new Map(bookmarks.map((bookmark) => [bookmark.name, bookmark]));

    const input = new Response(
        bookmarks
            .map((bookmark) => `${bookmark.name}: ${bookmark.url}`)
            .join("\n"),
    );

    const result = (await $`rofi -dmenu < ${input}`.text()).trim();
    const name = result.split(": ")[0];
    const bookmark = map.get(name);
    if (bookmark) {
        await $`xdg-open ${bookmark.url}`;
    }
}

if (import.meta.main) {
    await listBookmarks();
}
