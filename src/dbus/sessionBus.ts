import * as dbus from "dbus-next";
let sessionBus: dbus.MessageBus | undefined;

export const DBUS_INTERFACE = "org.freedesktop.DBus";
export const DBUS_PATH = "/org/freedesktop/DBus";
export const DBUS_PROPERTIES_INTERFACE = `${DBUS_INTERFACE}.Properties`;

export function getSessionBus(): dbus.MessageBus {
    sessionBus ??= dbus.sessionBus();
    return sessionBus;
}

export type ListSessionBusNamesArgs = {
    path?: string;
    interface?: string;
};

// dbus-send --print-reply --dest=org.freedesktop.DBus  /org/freedesktop/DBus org.freedesktop.DBus.ListNames
export function listSessionBusNames(args?: ListSessionBusNamesArgs) {
    const sessionBus = getSessionBus();
    const methodCall = new dbus.Message({
        destination: DBUS_INTERFACE,
        path: args?.path ?? DBUS_PATH,
        interface: args?.interface ?? DBUS_INTERFACE,
        member: "ListNames",
    });

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject("timeout");
        }, 3000);

        sessionBus.once("message", (msg) => {
            resolve(msg);
            clearTimeout(timeout);
        });

        sessionBus.call(methodCall);
    });
}

if (import.meta.main) {
    const result = await listSessionBusNames();
    console.log(result);
}
