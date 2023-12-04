import { $ } from "bun";
import { Command } from "commander";
import { logger } from "../logging";
import { lock } from "./locking";

export const sway = new Command("sway");

sway.command("lock").action(lock);

async function pauseTimetracking() {
    logger.info("Pausing timetracking");
    try {
        await $`timetracking pause`;
    } catch (error) {
        logger.error("Error when pausing timetracking", error);
    }
}

sway.command("before-sleep").action(async () => {
    await Promise.all([pauseTimetracking(), lock()]);
});
