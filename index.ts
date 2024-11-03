import { App } from "@slack/bolt";
import dotenv from "dotenv";
import { Command, COMMANDS } from "./src/commands";
import { listMembers } from "./src/commands/members";
dotenv.config();

const app = new App({
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();

const isSlashCommand = (command: Command) => {
  return command.name.startsWith("/");
};

Object.keys(COMMANDS).forEach((key) => {
  const c = COMMANDS[key];
  if (isSlashCommand(c)) {
    app.command(`${c.name}`, async (context) => {
      c.fn(context, c, c.options);
    });
  }
});
