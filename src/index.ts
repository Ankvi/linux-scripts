import { Command, CommanderError, program } from "commander";
import { bluetooth } from "./bluetooth";
import { bookmarks } from "./bookmarks";
import { dmenu } from "./dmenus";
import { git } from "./git";
import { logger, logging } from "./logging";
import { makeWowSnapshot } from "./make-wow-snapshot";
import { install as installPackages } from "./packages";
import { projects } from "./projects";
import { installLinuxScripts } from "./self-installer";
import { sway } from "./sway";
import { shutdown } from "./system";
import { install as installTemplates } from "./templates";
import { tmux } from "./tmux";
import type { GlobalOptions } from "./types";
import { windowManager } from "./window-manager";
import "./azure";
// const program = new Command("linux-scripts");
program.name("linux-scripts");

program.option("-v, --verbose");

program.command("install-packages").action(installPackages);

program.command("make-wow-snapshot").action(makeWowSnapshot);

program
    .command("install-config-templates")
    .option("-f,--force", "Install templates regardless if they exist or not")
    .option("--spotify", "Force a spotify config install")
    .action(installTemplates);

program.command("install-project").action(installLinuxScripts);

program.command("system-shutdown").action(shutdown);

program.addCommand(dmenu);
program.addCommand(projects);
program.addCommand(tmux);
program.addCommand(git);
program.addCommand(windowManager);
program.addCommand(sway);
program.addCommand(logging);
program.addCommand(bluetooth);
program.addCommand(bookmarks);

program.hook("preAction", (command) => {
    const options = command.optsWithGlobals<GlobalOptions>();
    if (options.verbose) {
        logger.level = "debug";
    }
});

program.exitOverride();

try {
    await program.parseAsync();
    process.exit(0);
} catch (err) {
    if (err instanceof CommanderError) {
        if (err.code === "commander.help") {
            process.exit(0);
        }
    }
    console.error(err);

    process.exit(1);
}
