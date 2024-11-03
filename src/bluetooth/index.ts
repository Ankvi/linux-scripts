import { $ } from "bun";
import { Command } from "commander";

type Opts = {
    gui?: boolean;
};

export async function connectToDevice(opts: Opts) {
    let selected: string | undefined;

    if (opts.gui) {
        selected = await $`bluetoothctl devices | wofi --dmenu`.text();
    } else {
        selected = await $`bluetoothctl devices | fzf`.text();
    }

    if (!selected) {
        console.log("Nothing selected. Exiting");
        return;
    }
    const [_, address, name] = selected.trimEnd().split(" ", 3);
    console.log(`Connecting to device '${name}' with address '${address}'`);
    await $`bluetoothctl connect ${address}`;
}

export async function disconnectFromDevice(opts: Opts) {
    let selected: string | undefined;

    if (opts.gui) {
        selected =
            await $`bluetoothctl devices Connected | wofi --dmenu`.text();
    } else {
        selected = await $`bluetoothctl devices Connected | fzf`.text();
    }

    if (!selected) {
        console.log("Nothing selected. Exiting");
        return;
    }

    const [_, address, name] = selected.trimEnd().split(" ", 3);
    console.log(
        `Disconnecting from device '${name}' with address '${address}'`,
    );
    await $`bluetoothctl disconnect ${address}`;
}

export const bluetooth = new Command("bluetooth");

bluetooth
    .command("connect")
    .option("--gui", "Select using wofi instead of fzf")
    .action(connectToDevice);
bluetooth
    .command("disconnect")
    .option("--gui", "Select using wofi instead of fzf")
    .action(disconnectFromDevice);
