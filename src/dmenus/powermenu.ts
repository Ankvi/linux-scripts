type Option = {
    name: string;
    text: string;
    command: string[];
};

const appIconsFolder = `${Bun.env.HOME}/.local/share/icons/candy-icons/apps/scalable`;
const icon = (name: string) => `${appIconsFolder}/${name}.svg`;

const commands: Option[] = [
    {
        name: "shutdown",
        text: `img:${icon("preferences-system-power")}:text:Shutdown`,
        command: ["systemctl", "poweroff"],
    },
    {
        name: "restart",
        text: `img:${icon("system-reboot")}:text:Restart`,
        command: ["systemctl", "reboot"],
    },
    {
        name: "lock",
        text: `img:${icon("system-lock-screen")}:text:Lock`,
        command: ["i3-sway-ipc-bun", "lock-screen"],
    },
];

// async function confirm() {
//     await Bun.spawn([
//         "wofi",
//         "--prompt",
//         "Are you sure? (y/N)",
//
//     ])
// }

export async function powermenu() {
    const proc = Bun.spawn(
        [
            "wofi",
            "--insensitive",
            "--dmenu",
            "--allow-images",
            "--width",
            "300px",
            "--height",
            "250px",
            "--prompt",
            "What would you like to do?",
        ],
        {
            stdin: "pipe",
        },
    );

    const names = commands.map((x) => x.text).join("\n");

    proc.stdin.write(names);
    proc.stdin.end();

    await proc.exited;

    const selectedName = (await new Response(proc.stdout).text()).trim();
    console.debug("Selected name:", selectedName);

    const selected = commands.find((x) => x.text === selectedName);
    if (!selected) {
        console.info("Nothing was selected");
        return;
    }

    // const confirmedOutput = await $`
    //     wofi \
    //     --dmenu \
    //     --prompt "Are you sure? (y/N)" \
    //     --lines 0
    // `;
    // const confirmed = await new Response(confirmedOutput.stdout).text();
    // if (!["y", "yes"].includes(confirmed.toLowerCase())) {
    //     console.info("Exiting");
    //     return;
    // }

    await Bun.spawn(selected.command).exited;
}
