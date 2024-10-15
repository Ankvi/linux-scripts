import path from "node:path";
import { $ } from "bun";
import { Command } from "commander";
import { getCurrentBranch } from "./git";
import { logger } from "./logging";

type Folder =
    | string
    | {
          path: string;
          name: string;
      };

type Session = {
    name: string;
    folders: Folder[];
};

const gitFolder = `${Bun.env.HOME}/git/github.com`;
const elkjopFolder = `${gitFolder}/elkjopnordic`;
const cidFolder = `${elkjopFolder}/CID`;

export const sessions: Session[] = [
    {
        name: "Flash",
        folders: [{ path: `${elkjopFolder}/flash`, name: "flash" }],
    },
    {
        name: "CID",
        folders: [
            { path: `${cidFolder}/IdentityService`, name: "IdentityService" },
            { path: `${cidFolder}/IdentityMasterService`, name: "IMS" },
            { path: `${cidFolder}/customer-identity-admin`, name: "CIA" },
            {
                path: `${cidFolder}/AzureADB2CService`,
                name: "AzureADB2CService",
            },
            {
                path: `${cidFolder}/azure-ad-b2c-policies`,
                name: "ADB2C Policies",
            },
            { path: `${cidFolder}/azure-ad-b2c-ui`, name: "ADB2C UI" },
        ],
    },
    {
        name: "Private",
        folders: [
            { path: `${gitFolder}/Ankvi/dotfiles`, name: "dotfiles" },
            { path: `${gitFolder}/Ankvi/neovim-config`, name: "neovim-config" },
            { path: `${gitFolder}/Ankvi/linux-scripts`, name: "linux-scripts" },
            { path: `${gitFolder}/Ankvi/timetracking`, name: "timetracking" },
            { path: `${Bun.env.HOME}/vaults`, name: "Obsidian Vaults" },
        ],
    },
];

async function startTmuxSessions() {
    try {
        const text = await $`tmux ls -F #{session_name}`.text();
        const activeSessions = text.trim().split("\n");
        logger.info("Found sessions: ", activeSessions);

        for (const session of sessions) {
            if (activeSessions.includes(session.name)) {
                logger.info(`Session ${session.name} already exists, skipping`);
                continue;
            }
            await Bun.spawn(["tmux", "new-session", "-d", "-s", session.name])
                .exited;
            await Promise.all(
                session.folders.map(async (folder, index) =>
                    setupTmuxWindow(session, folder, index),
                ),
            );
        }
    } catch (e) {
        logger.info("Error starting tmux sessions");
        logger.info(e);
    }
}

async function setupTmuxWindow(
    session: Session,
    folder: Folder,
    index: number,
) {
    const sessionName = `${session.name}:${index + 1}`;
    const windowName =
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        typeof folder === "string" ? folder.split("/").pop()! : folder.name;

    if (index) {
        await $`tmux new-window -d -t ${sessionName} -n ${windowName}`;
    } else {
        await $`tmux rename-window -t ${sessionName} ${windowName}`;
    }

    const folderPath = typeof folder === "string" ? folder : folder.path;
    return await $`tmux send-keys -t ${sessionName} "cd ${folderPath}; clear" C-m`;
}

export const tmux = new Command("tmux");

tmux.command("start-sessions").action(startTmuxSessions);
tmux.command("get-title")
    .argument("<directory>")
    .action(async (directory: string) => {
        const titleSections = ["tmux", path.resolve(directory)];
        const branch = await getCurrentBranch(directory);
        if (branch) {
            titleSections.push(branch);
        }

        console.log(titleSections.join(" | "));
    });
