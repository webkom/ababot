import { App } from "@slack/bolt";
import dotenv from "dotenv";
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

app.message("@noen", async ({ message, say }) => {
  const randomUser = await app.client.users
    .list({
      limit: 1,
      presence: true,
      filter: "is_user",
    })
    .then((res) => {
      if (res.members && res.members.length > 0) {
        return res.members[0].id;
      }
    });

  if (randomUser) {
    await say({
      text: `<@${randomUser}>`,
      thread_ts: message.ts,
    });
  }
});

app.message("members", async ({ message, say }) => {
  const members = await fethchMembers();
  if (!members) {
    await say("No members found");
    return;
  }

  const memberNames = members.map((member) => member.name);
  await say(memberNames.join(", "));
});

interface Member {
  name: string;
  full_name: string;
  birthday: string;
  joined: string;
  first_lego_commit: string;
  avatar: string;
  slack: string;
  phone_number: string;
  github: string;
  duolingo: string;
  brus: string;
  active: boolean;
  new: boolean;
  welcome_messages: string[];
  wireless_devices: {
    wifi: string[];
    bt: string[];
  };
  cards: {
    rfid: {
      mifare: string[];
      em4200: string[];
    };
  };
  authorized_keys: string[];
}

const fethchMembers = async () => {
  const response = await fetch("https://members.webkom.dev", {
    headers: {
      Authorization: `Basic ${btoa(
        process.env.MEMBERS_LOGIN_USERNAME +
          ":" +
          process.env.MEMBERS_LOGIN_PASSWORD
      )}`,
      Accept: "application/json",
    },
  });
  console.log(response);
  const members: Member[] = await response.json();

  if (!members) {
    return [];
  }
  return members;
};
