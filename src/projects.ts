import { readdir } from "node:fs/promises";
import { exit } from "node:process";
import { $ } from "bun";
import { Command } from "commander";
import { hasModifiedFiles } from "./git";
import { getFullPath } from "./helpers";
import { logger } from "./logging";
import { sessions } from "./tmux";
import type { Folder } from "./types";

export const gitFolder = `${Bun.env.HOME}/git`;
export const gitHubFolder = `${gitFolder}/github.com`;
export const elkjopFolder = `${gitHubFolder}/elkjopnordic`;
export const privateFolder = `${gitHubFolder}/Ankvi`;
export const cidFolder = `${elkjopFolder}/CID`;

async function getGitRepositoriesInFolderRecursively(
    folder: Folder,
): Promise<Folder[]> {
    const path = getFullPath(folder);
    const repositories: Folder[] = [];
    try {
        await readdir(`${path}/.git`);
        repositories.push(folder);
    } catch {
        const dirents = await readdir(path, { withFileTypes: true });
        const subFolders = dirents.filter((dirent) => dirent.isDirectory());
        for (const folder of subFolders) {
            const repos = await getGitRepositoriesInFolderRecursively(folder);
            repositories.push(...repos);
        }
    }
    return repositories;
}

export const projects = new Command("projects");

projects.command("list").action(async () => {
    const repos = await getGitRepositoriesInFolderRecursively({
        parentPath: gitFolder,
        name: "github.com",
    });

    for (const repo of repos) {
        console.log(getFullPath(repo));
    }
});

projects.command("synchronize").action(async () => {
    const paths = sessions
        .flatMap((session) => session.folders)
        .map((folder) => (typeof folder === "string" ? folder : folder.path));

    logger.debug(`Found a total of ${paths.length} projects`);

    const projectsToBeSynchronized = (
        await Promise.all(
            paths.map(async (path) => {
                if (await hasModifiedFiles(path)) {
                    return "";
                }

                return path;
            }),
        )
    ).filter((path) => path.length > 0);

    logger.info(`Synchronizing ${projectsToBeSynchronized.length} projects`);

    await Promise.all(
        projectsToBeSynchronized.map(async (path) => {
            try {
                await $.cwd(path)`git pull`.quiet();
            } catch (error) {
                if (error instanceof Error) {
                    logger.error("Unable to synchronize project", error);
                }
            }
        }),
    );
});

projects.command("select").action(async () => {
    const repos = await getGitRepositoriesInFolderRecursively({
        parentPath: gitFolder,
        name: "github.com",
    });

    const repoString = repos.map((repo) => getFullPath(repo)).join("\n");

    const output = new Blob([repoString]);
    const selector = Bun.spawn(["fzf"], {
        stdin: output.stream(),
    });

    await selector.exited;

    const selected = (await new Response(selector.stdout).text()).trim();
    if (!selected) {
        exit(1);
    }
    console.log(`cd ${selected}`);
});
