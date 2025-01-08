import { $ } from "bun";

type NotificationArgs = {
    summary: string;
    body: string;
};
export async function sendNotification({ summary, body }: NotificationArgs) {
    await $`notify-send "${summary}" "${body}"`;
}
