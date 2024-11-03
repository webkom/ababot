import { SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Command } from "../commands";

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

const fetchMembers = async () => {
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
  const members: Member[] = await response.json();

  if (!members) {
    return [];
  }
  return members;
};

const formatMember = (member: Member, options?: string[]) => {
  let memberString = `
  --------------------------------
  Full name: ${member.full_name}
  Birthday: ${member.birthday}
  Joined: ${member.joined}
  First lego commit: ${member.first_lego_commit}
  Slack: ${member.slack}
  Phone number: ${member.phone_number}
  Github: ${member.github}
  Duolingo: ${member.duolingo}
  Brus: ${member.brus}
  Active: ${member.active}
  --------------------------------`;
  if (options && options.length > 0) {
    if (options.includes("--active") && !member.active) {
      return null;
    }
    memberString = `-------------------------------- 
    Full name: ${member.full_name} ${
      options.includes("--birthday") ? `Birthday: ${member.birthday}` : ""
    } ${options.includes("--joined") ? `Joined: ${member.joined}` : ""} ${
      options.includes("--first-lego-commit")
        ? `First lego commit: ${member.first_lego_commit}`
        : ""
    } ${options.includes("--slack") ? `Slack: ${member.slack}` : ""} ${
      options.includes("--phone-number")
        ? `Phone number: ${member.phone_number}`
        : ""
    } ${options.includes("--github") ? `Github: ${member.github}` : ""} ${
      options.includes("--duolingo") ? `Duolingo: ${member.duolingo}` : ""
    } ${options.includes("--brus") ? `Brus: ${member.brus}` : ""}
    --------------------------------`;
  }
  return memberString.replace(/  +/g, " ");
};

export const listMembers = async (
  context: SlackCommandMiddlewareArgs,
  commandObject: Command,
  options?: string[]
) => {
  const { ack, respond } = context;
  await ack();
  const members = await fetchMembers();
  if (!members) {
    await respond("Something went wrong");
    return;
  }

  await respond(members.map((m) => formatMember(m, options)).join("\n"));
};

export const getMemberInfo = async (
  context: SlackCommandMiddlewareArgs,
  commandObject: Command,
  options?: string[]
) => {
  const { ack, respond } = context;
  const memberName = context.command.text
    .replace(commandObject?.name, "")
    .split(" ")[0];

  const member = await fetchMembers().then((members) => {
    return members.find((m) => m.name.includes(memberName));
  });

  if (!member) {
    await respond("Something went wrong");
    return;
  }

  const formattedMember = formatMember(member, options);
  if (formattedMember) {
    await respond(formattedMember);
  } else {
    await respond("Member not found or inactive.");
  }
};
