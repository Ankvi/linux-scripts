import { Command } from "commander";
import { chromium } from "./chromium";

export const applications = new Command("applications");

applications.addCommand(chromium);
