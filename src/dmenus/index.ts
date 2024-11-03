import { Command } from "commander";
import { powermenu } from "./powermenu";

export const dmenu = new Command("dmenu");
dmenu.command("powermenu").action(powermenu);
