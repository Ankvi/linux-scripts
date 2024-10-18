import type { ClientInterface, ProxyObject, Variant } from "dbus-next";
import { getSessionBus } from "./sessionBus";
import type { Player, PlayerVariantInfo } from "./types";

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

    private readonly _player: Player;
    private readonly _properties: ClientInterface;

    private constructor(obj: ProxyObject) {
        this._player = obj.getInterface<Player>(DBUS_PLAYER_INTERFACE);
        this._properties = obj.getInterface(DBUS_PROPERTIES_INTERFACE);
    }

    async printActions() {
        console.log(this._player);
    }

    async getCurrentTrack() {
        const result: Variant<PlayerVariantInfo> = await this._properties.Get(
            DBUS_PLAYER_INTERFACE,
            "Metadata",
        );

        console.log(
            `Currently playing: ${result.value["xesam:artist"].value} - ${result.value["xesam:title"].value}`,
        );
    }

    async play() {
        this._player.Play();
    }

    async playPause() {
        this._player.PlayPause();
    }

    async pause() {
        this._player.Pause();
    }

    async next() {
        this._player.Next();
    }

    async previous() {
        this._player.Previous();
    }
}

if (import.meta.main) {
    const player = await MediaPlayer.getSpotify();
    await player.getCurrentTrack();
    // await player.printActions();
    getSessionBus().disconnect();
}
