import { $ } from "bun";

export async function connectToDevice() {
    const selected = await $`bluetoothctl devices | fzf`.text();
    if (!selected) {
        console.log("Nothing selected. Exiting");
        return;
    }
    const [_, address, name] = selected.trimEnd().split(" ", 3);
    console.log(`Connecting to device '${name}' with address '${address}'`);
    await $`bluetoothctl connect ${address}`;
}

export async function disconnectFromDevice() {
    const selected = await $`bluetoothctl devices Connected | fzf`.text();
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
