import { logger } from "./logging";

export async function installLinuxScripts() {
    const pkg = await import("../package.json");

    for (const name of Object.keys(pkg.bin)) {
        const path = Bun.which(name);
        if (path) {
            logger.info(`Executable named ${name} already exists`);
            continue;
        }

        const cwd = import.meta.dir;

        const destinationFolder = `${Bun.env.HOME}/.local/bin`;
        const scriptFile = `${cwd}/index.ts`;
        // logger.info(`Creating symlink in ${destinationFolder} to ${scriptFile}`);
        // await Bun.spawn(["ln", "-s", scriptFile, name], {
        //   cwd: destinationFolder,
        // }).exited;

        const destination = `${destinationFolder}/${name}`;

        logger.info(`Creating bash script ${destination}`);
        await Bun.write(destination, [`bun ${scriptFile} "$@"`]);
        await Bun.spawn(["chmod", "+x", destination]).exited;
    }
}
