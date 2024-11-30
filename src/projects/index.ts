import { readdir } from "node:fs/promises";
import { exit } from "node:process";
import { $ } from "bun";
import { Command } from "commander";
import { hasModifiedFiles } from "../git";
import { getFullPath } from "../helpers";
import { logger } from "../logging";
import { sessions } from "../tmux";
import type { Folder } from "../types";
import { gitFolder } from "./constants";

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

type ProjectsOpts = {
    tmux?: boolean;
};

async function getProjectFolders(opts: ProjectsOpts) {
    if (opts.tmux) {
        return sessions
            .flatMap((session) => session.folders)
            .map((folder) => folder.path);
    }

    const repos = await getGitRepositoriesInFolderRecursively({
        parentPath: gitFolder,
        name: "github.com",
    });
    return repos.map((repo) => getFullPath(repo));
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

async function synchronizeProjects(opts: ProjectsOpts) {
    const paths = await getProjectFolders(opts);

    logger.debug(`Found a total of ${paths.length} projects`);

    const projectsToBeSynchronized = (
        await Promise.all(
            paths.map(async (path) => {
                if (await hasModifiedFiles(path)) {
                    logger.warn(
                        `Repo ${path} has modified files. Skipping sync`,
                    );
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
                    const errorMessage =
                        "stderr" in error ? error.stderr : error.message;
                    logger.error({
                        message: "Unable to synchronize project",
                        path,
                        error: errorMessage,
                    });
                }
            }
        }),
    );
}

projects
    .command("synchronize")
    .option("--tmux", "Use tmux sessions")
    .action(synchronizeProjects);

projects
    .command("list-modified-projects")
    .option("--tmux", "Use tmux sessions")
    .action(async (opts: ProjectsOpts) => {
        const paths = await getProjectFolders(opts);

        await Promise.all(
            paths.map(async (path) => {
                if (await hasModifiedFiles(path)) {
                    console.log(path);
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

projects
    .command("git-prune")
    .option("--tmux", "Use tmux sessions")
    .action(async (opts: ProjectsOpts) => {
        const paths = await getProjectFolders(opts);

        await Promise.all(
            paths.map(async (path) => {
                try {
                    await $.cwd(path)`git fetch --prune`.quiet();
                } catch (error) {
                    logger.warn({
                        error,
                        message: "Unable to prune repo",
                        path,
                    });
                }
            }),
        );
    });

if (import.meta.main) {
    await synchronizeProjects({});
}
