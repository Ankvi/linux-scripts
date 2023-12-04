class Vault {
    static _instance?: Vault;
    static async get(): Promise<Vault> {
        if (!Vault._instance) {
            Vault._instance = new Vault();
        }
        return Vault._instance;
    }

    private _unlocked: Promise<void>;

    constructor() {
        this._unlocked = this._unlock();
    }

    private async _unlock(): Promise<void> {
        await Bun.spawn(["op", "vault", "list"]).exited;
    }

    async getValue(key: string, label: string) {
        await this._unlocked;
        const command: string[] = [
            "op",
            "item",
            "get",
            key,
            "--fields",
            `label=${label}`,
        ];
        const proc = Bun.spawn(command);
        await proc.exited;

        const response = await new Response(proc.stdout).text();
        return response.trim();
    }
}

export async function getValue(key: string, label: string): Promise<string> {
    const vault = await Vault.get();
    return await vault.getValue(key, label);
}
