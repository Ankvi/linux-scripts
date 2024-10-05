import { $ } from "bun";
import { Command } from "commander";
import { logger } from "../logging";

export const idle = new Command("idle");

idle.command("start").action(async () => {
    try {
        logger.info("Killing previous swayidle sessions");
        await $`killall swayidle`;
    } catch {
        logger.info("No previous sessions found");
    }

    logger.info("Starting swayidle");
    await $`swayidle -w \
            before-sleep 'lsc sway before-sleep' \
            timeout 340 'timetracking pause' \
            resume 'timetracking resume' \
            after-resume 'timetracking after-awake'
`;
});
