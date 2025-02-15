import { AzureCliCredential } from "@azure/identity";
import { program } from "commander";

const azure = program.command("azure");

const accessToken = azure.command("access-token");

const COSMOSDB_POSTGRES_SCOPE =
    "https://token.postgres.cosmos.azure.com/.default";

const credential = new AzureCliCredential();

accessToken.command("postgres").action(async () => {
    const token = await credential.getToken(COSMOSDB_POSTGRES_SCOPE);
    console.log(token.token);
});

accessToken.command("flash [env]").action(async (env = "prod") => {
    const token = await credential.getToken(
        `http://flash.${env}.api.api.elkjop.com/.default`,
    );
    console.log(token.token);
});
