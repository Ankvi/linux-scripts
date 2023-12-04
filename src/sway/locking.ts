import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../logging";
import { getOutputs } from "./client";

type Resolution = `${number}x${number}`;
const loadedWallpapers = new Map<Resolution, string[]>();

const wallpaperFolder = join(Bun.env.HOME, "Pictures", "wallpapers");

export async function lock() {
    logger.info("Locking screen");

    const lockCommand = ["swaylock", "-f"];

    const lockScreenImages: { [key: Resolution]: string } = {};

    const outputs = await getOutputs();
    for (const output of outputs) {
        if (!(output.rect.width && output.rect.height)) {
            continue;
        }

        const resolution: Resolution = `${output.rect.width}x${output.rect.height}`;
        if (lockScreenImages[resolution]) {
            logger.debug(
                "Already selected an image for resolution:",
                resolution,
            );
            lockCommand.push("--image", lockScreenImages[resolution]);
        }

        if (!loadedWallpapers.has(resolution)) {
            const folder = join(wallpaperFolder, resolution);
            logger.debug("Checking folder:", folder);

            const folderContent = await readdir(folder, {
                withFileTypes: true,
            });
            const wallpaperNames = folderContent.filter(
                (x) => !x.isDirectory(),
            );
            loadedWallpapers.set(
                resolution,
                wallpaperNames.map((wallpaper) => join(folder, wallpaper.name)),
            );
        }

        const wallpapers = loadedWallpapers.get(resolution) ?? [];
        if (!wallpapers.length) {
            logger.info(
                "Could not find any wallpapers for the given resolution",
            );
            return;
        }

        const randomIndex = Math.floor(Math.random() * wallpapers.length);
        lockScreenImages[resolution] =
            `${output.name}:${wallpapers[randomIndex]}`;
        lockCommand.push("--image", lockScreenImages[resolution]);
    }

    try {
        await Bun.spawn(lockCommand).exited;
    } catch (error) {
        logger.warn("Unable to lock screen", error);
    }
}
