import type { Folder } from "./types";

export const getFullPath = (dirent: Folder): string =>
    `${dirent.parentPath}/${dirent.name}`;
