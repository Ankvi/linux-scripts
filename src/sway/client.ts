import { $ } from "bun";
import type { Output } from "./types";

export async function getOutputs(): Promise<Output[]> {
    const response = (await $`swaymsg -t get_outputs`.json()) as Output[];
    return response ?? [];
}
