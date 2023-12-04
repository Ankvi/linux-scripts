import { mkdir, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { getValue } from "../1password";
import type { GlobalOptions } from "../types";

type Options = GlobalOptions & {
    force?: boolean;
    spotify?: boolean;
};

export async function install({ force, spotify }: Options) {
    console.log("Installing config templates");
    await Promise.all([
        installNpmrc(force),
        installYarnrc(force),
        installNugetConfig(force),
        installSpotifydConf(force || spotify),
    ]);
}

async function installNpmrc(force?: boolean) {
    const file = Bun.file(`${Bun.env.HOME}/.npmrc`);
    const exists = await file.exists();
    if (exists && !force) {
        console.log(".npmrc already exists");
        return;
    }

    const githubPackagesReadToken = await getValue(
        "GitHub",
        "packages:read token",
    );
    const npmPublishToken = await getValue("Npmjs", "New publish token");

    let template = await Bun.file(`${import.meta.dir}/node/.npmrc`).text();
    template = template.replace("GITHUB_TOKEN", githubPackagesReadToken);
    template = template.replace("NPM_TOKEN", npmPublishToken);
    await Bun.write(file, template);
}

async function installYarnrc(force?: boolean) {
    const file = Bun.file(`${Bun.env.HOME}/.yarnrc.yml`);
    const exists = await file.exists();
    if (exists && !force) {
        console.log(".yarnrc.yml already exists");
        return;
    }

    const githubPackagesReadToken = await getValue(
        "GitHub",
        "packages:read token",
    );

    let template = await Bun.file(`${import.meta.dir}/node/.yarnrc.yml`).text();
    template = template.replace("GITHUB_TOKEN", githubPackagesReadToken);
    await Bun.write(file, template);
}

async function installNugetConfig(force?: boolean) {
    const folder = `${Bun.env.HOME}/.nuget/NuGet`;
    await mkdir(folder, { recursive: true });
    const file = Bun.file(`${folder}/NuGet.Config`);
    const exists = await file.exists();
    if (exists && !force) {
        console.log("NuGet.Config already exists");
        return;
    }

    const githubPackagesReadToken = await getValue(
        "GitHub",
        "packages:read token",
    );
    const npmPublishToken = await getValue(
        "Azure DevOps",
        "packages:read token",
    );

    let template = await Bun.file(
        `${import.meta.dir}/nuget/NuGet.Config`,
    ).text();
    template = template.replace("GITHUB_TOKEN", githubPackagesReadToken);
    template = template.replace("DEVOPS_TOKEN", npmPublishToken);
    await Bun.write(file, template);
}

async function installSpotifydConf(force?: boolean) {
    const file = Bun.file("/etc/spotifyd.conf");
    const exists = await file.exists();
    if (exists && !force) {
        console.log("spotifyd.conf already exists");
        return;
    }

    const spotifyPassword = await getValue("Spotify", "password");

    let template = await Bun.file(
        `${import.meta.dir}/spotifyd/spotifyd.conf`,
    ).text();
    template = template.replace("SPOTIFY_PASSWORD", spotifyPassword);

    const tempDir = await realpath(tmpdir());
    const tempFile = Bun.file(`${tempDir}/spotifyd.conf`);
    await Bun.write(tempFile, template);

    if (!tempFile.name) {
        throw new Error("Temporary spotifyd.conf file doesn't have a name");
    }

    const proc = Bun.spawn(["sudo", "cp", tempFile.name, "/etc/spotifyd.conf"]);
    await proc.exited;

    const response = await new Response(proc.stdout).text();
    if (response) {
        console.log(response);
    }
}
