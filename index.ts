import { App, LogLevel } from "@slack/bolt";
import dotenv from "dotenv";
import { Command, COMMANDS } from "./src/commands";
dotenv.config();

export const hubot = new App({
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.APP_TOKEN,
  logLevel: LogLevel.DEBUG,
  socketMode: true,
});

(async () => {
  await hubot.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();

const isSlashCommand = (command: Command) => {
  return command.name.startsWith("/");
};

const isAtCommand = (command: Command) => {
  return command.name.startsWith("@");
};

hubot.message("@noen", async (context) => {
  const result = await hubot.client.conversations.members({
    channel: context.message.channel,
  });
  if (!result.members) {
    return;
  }
  const someoneRandom =
    result.members[Math.floor(Math.random() * result.members.length)];
  await context.say({
    text: `<@${someoneRandom}> You've been chosen!😼`,
    thread_ts: context.message.ts,
  });
});

Object.keys(COMMANDS).forEach((key) => {
  const c = COMMANDS[key];
  if (isSlashCommand(c)) {
    hubot.command(`${c.name}`, async (context) => {
      c.fn(context, c, c.allowedOptions);
    });
  }
});
