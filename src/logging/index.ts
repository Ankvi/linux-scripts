import { createLogger, format, transports } from "winston";

import { $ } from "bun";
import { Command } from "commander";
import pkg from "../../package.json";

const { combine, timestamp, json, errors } = format;

const logFile = `${process.env.HOME}/.cache/${pkg.name}/logs.log`;

export const logger = createLogger({
    level: "info",
    format: combine(errors({ stack: true }), timestamp(), json()),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: `${process.env.HOME}/.cache/${pkg.name}/logs.log`,
        }),
    ],
});

export const logging = new Command("logging");

logging.command("view-logs").action(async () => {
    const file = Bun.file(logFile);
    await Bun.write(Bun.stdout, file);
});
