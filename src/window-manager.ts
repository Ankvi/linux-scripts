import { $ } from "bun";
import { Command } from "commander";
import { logger } from "./logging";

export const windowManager = new Command("window-manager");

windowManager.command("on-idle").action(async () => {
    try {
        await $`timetracking pause`;
    } catch {
        logger.warn("Could not pause timetracking");
    }

    try {
        switch (process.env.XDG_CURRENT_DESKTOP) {
            case "Hyprland": {
                await $`hyprctl dispatch dpms off`;
                break;
            }

            case "sway": {
                await $`i3-sway-ipc-bun lock-screen`;
                break;
            }
        }
    } catch {
        logger.warn("Could not turn off displays");
    }
});

windowManager.command("on-resume").action(async () => {
    try {
        await $`timetracking resume`;
    } catch {
        logger.warn("Could not resume timetracking");
    }

    try {
        switch (process.env.XDG_CURRENT_DESKTOP) {
            case "Hyprland": {
                await $`hyprctl dispatch dpms on`;
            }
        }
    } catch {
        logger.warn("Could not turn on displays");
    }
});
