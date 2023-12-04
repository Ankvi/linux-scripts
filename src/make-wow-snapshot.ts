import { logger } from "./logging";

const directory = `${process.env.HOME}/Games/battlenet/drive_c/Program\ Files\ (x86)/World\ of\ Warcraft`;

const options = {
    cwd: directory,
    stderr: "pipe",
} as const;

export async function makeWowSnapshot() {
    try {
        logger.info("World of Warcraft folder: ", directory);

        const now = new Date();
        const commitMessage = `Backup: ${now.toLocaleDateString("en-GB")}`;

        const statusProcess = Bun.spawn(["git", "status", "--short"], options);
        let exitCode = await statusProcess.exited;
        if (exitCode) {
            const error = await new Response(statusProcess.stderr).text();
            throw new Error(error);
        }

        const filesChanged = (
            await new Response(statusProcess.stdout).text()
        ).split("\n");
        if (!filesChanged.length) {
            logger.info("No files have been changed. Exiting.");
        }

        logger.info(`Staging ${filesChanged.length} files`);
        const stagingProcess = Bun.spawn(["git", "add", "-A"], options);

        exitCode = await stagingProcess.exited;
        if (exitCode) {
            const error = await new Response(stagingProcess.stderr).text();
            throw new Error(error);
        }

        logger.info(`Making WoW backup with message:\n${commitMessage}`);
        const commitProcess = Bun.spawn(
            ["git", "commit", "-m", commitMessage],
            options,
        );

        exitCode = await commitProcess.exited;
        if (exitCode) {
            const error = await new Response(commitProcess.stderr).text();
            throw new Error(error);
        }

        logger.info("Pushing to git");
        await Bun.spawn(["git", "push"], options).exited;

        logger.info("WoW backed up successfully");
    } catch (error) {
        logger.error("WoW WTF backup failed with error:");
        logger.error(error);
    }
}

if (import.meta.main) {
    await makeWowSnapshot();
}
