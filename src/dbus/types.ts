import type { ClientInterface, Variant } from "dbus-next";

export type PlayerVariantInfo = {
    "xesam:album": Variant<string>;
    "xesam:artist": Variant<string>;
    "xesam:title": Variant<string>;
};

export interface Player extends ClientInterface {
    Next(): Promise<void>;
    Previous(): Promise<void>;
    Play(): Promise<void>;
    Pause(): Promise<void>;
    PlayPause(): Promise<void>;
}
