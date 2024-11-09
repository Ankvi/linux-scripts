import { Command } from "commander";
import { bookmarks } from "./bookmarks";

export const chromium = new Command("chromium");

chromium.addCommand(bookmarks);
