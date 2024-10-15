import type { ClientInterface, ProxyObject } from "dbus-next";
import { getSessionBus } from "./sessionBus";

const MPRIS_OBJECT_PATH = "/org/mpris/MediaPlayer2";
const DBUS_PROPERTIES_INTERFACE = "org.freedesktop.DBus.Properties";
const DBUS_PLAYER_INTERFACE = "org.mpris.MediaPlayer2.Player";
const SPOTIFY_PLAYER_INTERFACE = "org.mpris.MediaPlayer2.spotify";

class MediaPlayer {
    private static _spotify: MediaPlayer;

    static async getSpotify() {
        if (!MediaPlayer._spotify) {
            const sessionBus = getSessionBus();
            const spotify = await sessionBus.getProxyObject(
                SPOTIFY_PLAYER_INTERFACE,
                MPRIS_OBJECT_PATH,
            );
            MediaPlayer._spotify = new MediaPlayer(spotify);
        }

        return MediaPlayer._spotify;
    }

    private readonly _player: ClientInterface;
    private readonly _properties: ClientInterface;

    private constructor(obj: ProxyObject) {
        this._player = obj.getInterface(DBUS_PLAYER_INTERFACE);
        this._properties = obj.getInterface(DBUS_PROPERTIES_INTERFACE);
    }

    async play() {
        this._player.play();
    }
}

if (import.meta.main) {
    await MediaPlayer.getSpotify();
    getSessionBus().disconnect();
}
