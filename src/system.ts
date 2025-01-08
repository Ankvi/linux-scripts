import { $ } from "bun";
import { logger } from "./logging";
import { sendNotification } from "./notifications";

export async function shutdown() {
    try {
        logger.info("Stopping timetracking");
        await $`timetracking stop`.quiet();

        logger.info("Shutting down system");
        await $`systemctl poweroff`;
    } catch (error) {
        logger.error("Unable to run complete shutdown script", error);
        await sendNotification({
            summary: "linux-scripts",
            body: "Unable to shutdown. Check logs",
        });
    }
}
