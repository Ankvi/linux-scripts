import { $ } from "bun";
import { Command } from "commander";

export const git = new Command("git");

git.command("clone <account> <repo>")
    .option("-o, --output [path]", "Clone output directory")
    .action(
        async (account: string, repo: string, options: { output?: string }) => {
            const url = `git@github.com:${account}/${repo}`;

            let outputDir = options.output ?? "";

            if (!outputDir) {
                outputDir = `${process.env.HOME}/git/github.com/${account}/${repo.replaceAll(
                    ".",
                    "/",
                )}`;
            }

            await $`git clone ${url} ${outputDir}`;
        },
    );

export async function getCurrentBranch(directory?: string) {
    try {
        const branch = await $.cwd(directory)`git branch --show-current`.text();
        return branch.trim();
    } catch {
        return;
    }
}

git.command("current-branch")
    .argument("[directory]")
    .action(async (directory?: string) => {
        const branch = await getCurrentBranch(directory);
        if (branch) {
            console.log(branch);
        }
    });

export async function getModifiedFiles(directory?: string): Promise<string[]> {
    const changedFiles: string[] = [];

    for await (const file of $.cwd(
        directory,
    )`git ls-files --modified --exclude-standard --others`.lines()) {
        if (file) {
            changedFiles.push(file);
        }
    }

    return changedFiles;
}

export async function hasModifiedFiles(directory?: string): Promise<boolean> {
    const files = await getModifiedFiles(directory);
    return files.length > 0;
}

git.command("is-clean [directory]").action(async (directory?: string) => {
    const hasChanges = await hasModifiedFiles(directory);
    process.exit(hasChanges ? 1 : 0);
});

git.command("list-modified [directory]").action(async (directory?: string) => {
    const files = await getModifiedFiles(directory);
    for (const file of files) {
        console.log(file);
    }
});
