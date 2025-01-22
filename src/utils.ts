import { RespondArguments } from "@slack/bolt";
import { Member } from "./commands/members";

const ensureMemberProperties = (member: Member): Member => {
  member.joined ? member.joined : (member.joined = "?");
  member.first_lego_commit
    ? member.first_lego_commit
    : (member.first_lego_commit = "?");
  member.avatar ? member.avatar : (member.avatar = "");
  member.slack ? member.slack : (member.slack = "?");
  member.phone_number ? member.phone_number : (member.phone_number = "?");
  member.github ? member.github : (member.github = "?");
  member.duolingo ? member.duolingo : (member.duolingo = "?");
  member.brus ? member.brus : (member.brus = "?");
  member.active ? member.active : (member.active = false);
  member.new ? member.new : (member.new = false);
  member.welcome_messages
    ? member.welcome_messages
    : (member.welcome_messages = []);
  member.wireless_devices
    ? member.wireless_devices
    : (member.wireless_devices = { wifi: [], bt: [] });
  member.cards
    ? member.cards
    : (member.cards = { rfid: { mifare: [], em4200: [] } });
  member.authorized_keys
    ? member.authorized_keys
    : (member.authorized_keys = []);
  return member;
};

const addBlockToMessage = (
  currentBlock: any,
  blockPage: any[],
  allBlocks: RespondArguments[]
) => {
  //Slack has a limit of 50 blocks per message meaning we have to split the message into multiple messages
  // TODO: DO this more effiecient by just adding the blocks to an array and then splitting it into blocks of max 50
  if (blockPage.length == 50) {
    allBlocks.push({ blocks: blockPage });
    blockPage = [];
  }
  blockPage.push(currentBlock);
  return [blockPage, allBlocks];
};

export const formatSeveralMembersAsSlackBlocks = (
  members: Member[]
): RespondArguments[] => {
  let allBlocks: RespondArguments[] = [];
  let currentBlockPage: any[] = [
    {
      type: "header",

      text: {
        type: "plain_text",
        text: "Members",
      },
    },
  ];

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    ensureMemberProperties(member);

    const newBlock = {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `
        *${member.full_name} ${i + 1 + "/" + members.length}*\n:slack: <@${
          member.slack
        }> ${
          member.phone_number && `:phone: ${member.phone_number}`
        } :cat: <https://github.com/${member.github}|${member.github}>`,
      },
    };

    [currentBlockPage, allBlocks] = addBlockToMessage(
      newBlock,
      currentBlockPage,
      allBlocks
    );
  }

  const infoBlock = {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "For more information about a member, use `/members info <name/username>`",
      },
    ],
  };

  [currentBlockPage, allBlocks] = addBlockToMessage(
    infoBlock,
    currentBlockPage,
    allBlocks
  );

  if (currentBlockPage.length > 0) allBlocks.push({ blocks: currentBlockPage });

  return allBlocks;
};

export const formatMemberAsSlackBlocks = (member: Member): any => {
  member = ensureMemberProperties(member);
  try {
    const blockObject = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${member.full_name}`,
            emoji: true,
          },
        },
        {
          type: "section",
          block_id: "profile_section",
          text: {
            type: "mrkdwn",
            text: `
  :slack: *Slack:* <@${member.slack}>
  :cake: *Birthday:* ${member.birthday}
  :rocket: *Joined:* ${member.joined}
  :bricks: *First LEGO Commit:* ${member.first_lego_commit}
  :phone: *Phone:* ${member.phone_number}
  :cat: *GitHub:* <https://github.com/${member.github}|${member.github}>
  :cup_with_straw: *Brus:* ${member.brus}
  `,
          },
          accessory: {
            type: "image",
            image_url: member.avatar ? member.avatar : "",
            alt_text: `${member.full_name}'s Avatar`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: member.active
                ? ":white_check_mark: *Active*"
                : ":x: *Inactive*",
            },
            {
              type: "mrkdwn",
              text: member.new ? ":baby: *New*" : " ",
            },
          ],
        },
      ],
    };
    return blockObject;
  } catch (e) {
    return null;
  }
};

export const fetchMembers = async (): Promise<Member[]> => {
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

  try {
    return members;
  } catch (e) {
    console.error(e);
    return [];
  }
};
