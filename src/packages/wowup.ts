import { cp, exists, unlink } from "node:fs/promises";
import { exit } from "node:process";

const DOWNLOAD_LOCATION = `${Bun.env.HOME}/Downloads/wowup-latest`;
const WOWUP_REPOSITORY = "https://github.com/WowUp/WowUp.CF";
const INSTALL_FOLDER = Bun.env.OPT_FOLDER;

export async function installWowUp() {
    const releasesCommand = Bun.spawn([
        "gh",
        "release",
        "list",
        "-R",
        WOWUP_REPOSITORY,
        "--exclude-pre-releases",
        "--exclude-drafts",
        "--limit",
        "1",
    ]);

    const releasesResponse = await new Response(releasesCommand.stdout).text();
    const split = releasesResponse
        .split("\t")
        .filter((x) => x !== "")
        .map((x) => x.trim());

    const [version, _, tagName, releaseDate] = split;

    console.log(
        `Found WowUp.CF version: ${version}, created at ${releaseDate}`,
    );
    const appImageFileName = `WowUp-CF-${version}.AppImage`;
    const installPath = `${INSTALL_FOLDER}/${appImageFileName}`;
    const downloadPath = `${DOWNLOAD_LOCATION}/${appImageFileName}`;

    if (await exists(installPath)) {
        console.log("WowUp.CF version already exists");
    } else {
        let appImageExists = await exists(downloadPath);
        if (!appImageExists) {
            console.log(
                `Could not find app image at: ${downloadPath}. Downloading from GitHub...`,
            );
            await Bun.spawn([
                "gh",
                "release",
                "download",
                tagName,
                "-R",
                WOWUP_REPOSITORY,
                "-D",
                DOWNLOAD_LOCATION,
                "-p",
                "*.AppImage",
                "--clobber",
            ]).exited;
        }

        appImageExists = await exists(downloadPath);
        if (!appImageExists) {
            console.error(
                "Couldn't find any app images in download folder. Exiting",
            );
            exit(1);
        }

        await cp(downloadPath, installPath);
        const linkExists = await exists(`${INSTALL_FOLDER}/wowup`);
        if (linkExists) {
            console.log("Deleting old app image symbolic link");
            await unlink(`${INSTALL_FOLDER}/wowup`);
        }
        console.log("Creating symbolic link for latest app image");
        await Bun.spawn(["ln", "-s", appImageFileName, "wowup"], {
            cwd: INSTALL_FOLDER,
        }).exited;
    }

    const link = Bun.which("wowup");

    if (link) {
        console.log("Found wowup command:", link);
        return;
    }

    console.log("No wowup command found. Creating");
    await Bun.spawn(["ln", "-s", `${INSTALL_FOLDER}/wowup`, "wowup"], {
        cwd: Bun.env.BIN_FOLDER,
    }).exited;
}
