import { getMemberInfo, listMembers } from "./commands/members";
import { SlackCommandMiddlewareArgs } from "@slack/bolt";
import { respondWithHelp } from "./commands/help";

export interface Command {
  name: string;
  type: "slashCommand" | "subCommand" | "globalShortcut";
  usage?: string;
  allowedOptions?: string[];
  ackMessage?: string;
  description?: string;
  fn: (
    context: SlackCommandMiddlewareArgs,
    commandObject: Command,
    options?: string[],
    extraText?: string
  ) => void;
  subcommands?: Command[];
}

export const getCommandFromListOfCommands = (
  commandName: string
): Command | undefined => {
  const foundCommand = COMMANDS[commandName.replace("/", "")];
  return foundCommand;
};

export const validateOptions = (options: string[], command: Command) => {
  return options.every((option) =>
    command.allowedOptions?.includes("--" + option)
  );
};

export const getOptions = (text: string): string[] => {
  return text
    .split(" ")
    .filter((t) => t.startsWith("--"))
    .map((t) => t.replace("--", ""));
};

// Runs subcommand with options if they are valid, otherwise responds with help
export const useSubCommandOrRespondWithHelp = async (
  context: SlackCommandMiddlewareArgs
) => {
  const { command, ack, respond, say } = context;
  const mainCommand = getCommandFromListOfCommands(command.command);
  const subCommand = mainCommand?.subcommands?.find((c) =>
    command.text.startsWith(c.name)
  );

  if (!mainCommand || !subCommand) {
    await ack();
    return respondWithHelp(context);
  }

  const options = getOptions(command.text);

  //This is the text after the subcommand and options (like the name of a member)
  const extraText = command.text
    .replace(subCommand.name, "")
    .replace(options.join(" "), "")
    .replace("--", "")
    .trim();

  if (!validateOptions(options, subCommand)) {
    return respond(
      `Invalid options, valid options are: ${subCommand.allowedOptions?.join(
        ", "
      )}`
    );
  }

  return subCommand.fn(context, subCommand, options, extraText);
};

export const COMMANDS: { [key: string]: Command } = {
  help: {
    name: "/help",
    type: "slashCommand",
    description: "Get information about commands",
    usage: "/help [command]",
    fn: respondWithHelp,
  },
  members: {
    name: "/members",
    type: "slashCommand",
    description: "Get info about members",
    usage: "/members [command]",
    fn: useSubCommandOrRespondWithHelp,
    subcommands: [
      {
        name: "list",
        type: "subCommand",
        ackMessage: "Fetching members...",
        description: "List all members",
        usage: "/members list [...options]",
        allowedOptions: ["--active", "--new", "--not-active", "--not-new"],
        fn: listMembers,
      },
      {
        name: "info",
        description: "Get info about a specific member by name",
        usage: "/members info <name> [...options]",
        type: "subCommand",
        allowedOptions: ["--active", "--new", "--not-active", "---not-new"],
        fn: getMemberInfo,
      },
    ],
  },
};
