import { SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Command } from "../commands";
import {
  fetchMembers,
  formatMemberAsSlackBlocks,
  formatSeveralMembersAsSlackBlocks,
} from "../utils";

export interface Member {
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

const filterMembersWithBooleanProperty = (
  members: Member[],
  property: string
): Member[] => {
  const bool = !property.startsWith("not-");
  property = property.replace("not-", "");
  return members.filter((m) => m[property] == bool);
};

export const listMembers = async (
  context: SlackCommandMiddlewareArgs,
  commandObject: Command,
  options?: string[]
) => {
  const { ack, respond } = context;
  await ack();

  let members = await fetchMembers();

  if (options) {
    for (const option of options) {
      members = filterMembersWithBooleanProperty(members, option);
      context.command.text = context.command.text.replace(option, "");
    }
  }

  const blocks = formatSeveralMembersAsSlackBlocks(members);
  for (const block of blocks) {
    await respond(block);
  }
};

export const getMemberInfo = async (
  context: SlackCommandMiddlewareArgs,
  commandObject: Command,
  options?: string[],
  extraText?: string
) => {
  const { ack, respond } = context;
  await ack();

  const memberName = extraText;
  if (!memberName) {
    await respond("Please provide a member name");
    return;
  }
  let members = await fetchMembers();

  if (options) {
    for (const option of options) {
      members = filterMembersWithBooleanProperty(members, option);
      context.command.text = context.command.text.replace(option, "");
    }
  }

  if (memberName) {
    members = members.filter(
      (m) => matchesAnyProperty(m, memberName) || m.name === memberName
    );
    if (members.length === 0) {
      await respond(
        `Could not find member with name:  + ${memberName} and options ${options}`
      );
      return;
    }
  }

  for (const member of members) {
    await respond(formatMemberAsSlackBlocks(member));
  }
  return;
};

const matchesAnyProperty = (member: Member, name: string) => {
  name = name.toLowerCase();
  return (
    member.name.toLowerCase() === name ||
    member.full_name.toLowerCase() === name ||
    member.slack.toLowerCase() === name.replace("@", "")
  );
};
