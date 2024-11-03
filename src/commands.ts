import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { listMembers, getMemberInfo } from "./commands/members";
import {
  AckFn,
  RespondArguments,
  RespondFn,
  SayFn,
  SlackCommandMiddlewareArgs,
} from "@slack/bolt";
import { respondWithHelp } from "./commands/help";

export interface Command {
  name: string;
  type: "slashCommand" | "subCommand" | "globalShortcut";
  usage?: string;
  options?: string[];
  ackMessage?: string;
  description?: string;
  fn: (
    context: SlackCommandMiddlewareArgs,
    commandObject: Command,
    options?: string[]
  ) => void;
  subcommands?: Command[];
}

export interface CommandList {
  [key: string]: Command;
}

export const getCommand = (commandName: string): Command | undefined => {
  const foundCommand = COMMANDS[commandName.replace("/", "")];
  return foundCommand;
};

export const validateOptions = (options: string[], command: Command) => {
  return options.every((option) => command.options?.includes(option));
};

export const useSubCommandOrRespondWithHelp = async (
  context: SlackCommandMiddlewareArgs
) => {
  const { command, ack, respond, say } = context;
  const mainCommand = getCommand(command.command);
  const subCommand = mainCommand?.subcommands?.find((c) =>
    command.text.startsWith(c.name)
  );

  if (!mainCommand || !subCommand) {
    await ack();
    return respondWithHelp(context);
  }

  const options = command.text.split(" ").filter((t) => t.startsWith("--"));

  if (!validateOptions(options, subCommand)) {
    return respond(
      `Invalid options, valid options are: ${subCommand.options?.join(", ")}`
    );
  }

  return subCommand.fn(context, subCommand, options);
};

export const COMMANDS: CommandList = {
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
        options: [
          "--active",
          "--new",
          "--birthday",
          "--joined",
          "--first-lego-commit",
          "--slack",
          "--phone-number",
          "--github",
          "--duolingo",
          "--brus",
        ],
        fn: listMembers,
      },
      {
        name: "find",
        usage: "/members info name [...options]",
        type: "subCommand",
        options: [
          "--birthday",
          "--joined",
          "--first-lego-commit",
          "--slack",
          "--phone-number",
          "--github",
          "--duolingo",
          "--brus",
        ],
        fn: getMemberInfo,
      },
    ],
  },
};
