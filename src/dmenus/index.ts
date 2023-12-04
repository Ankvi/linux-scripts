import { Command } from "commander";
import { connectToDevice, disconnectFromDevice } from "./bluetooth";
import { powermenu } from "./powermenu";

export const dmenu = new Command("dmenu");
dmenu.command("powermenu").action(powermenu);

const bluetooth = dmenu.command("bluetooth");
bluetooth.command("connect").action(connectToDevice);
bluetooth.command("disconnect").action(disconnectFromDevice);
