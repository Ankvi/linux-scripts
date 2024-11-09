import { $ } from "bun";
import { Command } from "commander";

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

async function getBookmarks() {
    const file = Bun.file(
        `${Bun.env.HOME}/.config/BraveSoftware/Brave-Browser/Default/Bookmarks`,
    );

    const bookmarks = (await file.json()) as BookmarksFile;

    const allBookmarks = [
        ...flattenFolders(bookmarks.roots.bookmark_bar),
        ...flattenFolders(bookmarks.roots.other),
        ...flattenFolders(bookmarks.roots.synced),
    ];

    return allBookmarks;
}

async function listBookmarks() {
    const bookmarks = await getBookmarks();
    bookmarks.sort((a, b) => {
        const aId = Number.parseInt(a.id);
        const bId = Number.parseInt(b.id);

        if (aId < bId) {
            return -1;
        }

        if (aId > bId) {
            return 1;
        }

        return 0;
    });
    for (const bookmark of bookmarks) {
        console.log(`${bookmark.id}: ${bookmark.name}`);
    }
}

export const bookmarks = new Command("bookmarks");

bookmarks.command("list").action(listBookmarks);

bookmarks.command("open").action(async () => {
    const bookmarks = await getBookmarks();

    const map = new Map(bookmarks.map((bookmark) => [bookmark.id, bookmark]));

    const input = new Response(
        bookmarks
            .map((bookmark) => `${bookmark.id}: ${bookmark.name}`)
            .join("\n"),
    );

    const result = (await $`wofi --dmenu < ${input}`.text()).trim();
    const id = result.split(": ")[0];
    const bookmark = map.get(id);
    if (bookmark) {
        await $`xdg-open ${bookmark.url}`;
    }
});

if (import.meta.main) {
    await listBookmarks();
}
