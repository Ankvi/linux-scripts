import * as dbus from "dbus-next";
let sessionBus: dbus.MessageBus | undefined;

export function getSessionBus(): dbus.MessageBus {
    sessionBus ??= dbus.sessionBus();
    return sessionBus;
}
