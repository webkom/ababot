import { SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Command, COMMANDS, getCommand } from "../commands";

export const respondWithHelp = async ({
  command,
  ack,
  respond,
}: SlackCommandMiddlewareArgs) => {
  await ack();

  const getHelpText = async (
    command: Command,
    includeOptions = false,
    includeSubCommands = false
  ) => {
    let helpText = `Usage: ${command.usage}\n`;
    helpText += `Description: ${command.description}\n`;
    if (command.subcommands && includeSubCommands) {
      helpText += "Subcommands:\n";
      command.subcommands.forEach(async (subCommand) => {
        helpText += `\t${subCommand.usage}: ${subCommand.description}\n`;
      });
    }
    if (command.options && includeOptions) {
      helpText += `Options: ${command.options.join(", ")}\n`;
    }
    return helpText;
  };

  const foundCommand = getCommand(command.command);
  if (!foundCommand) {
    await respond("Command not found, type /help for a list of commands");
    return;
  }
  let helpText = "";

  console.log("command", command);
  const isHelpCommand = command.command === COMMANDS["help"].name;

  if (isHelpCommand) {
    const mainCommand = getCommand(command.text);
    if (mainCommand) {
      helpText = await getHelpText(mainCommand, true, true);
    } else {
      helpText = await getHelpText(foundCommand);
      Object.keys(COMMANDS).forEach(async (key) => {
        if (key === "help") {
          return;
        }
        const c = COMMANDS[key];
        helpText += getHelpText(c);
      });
    }
  } else {
    helpText = await getHelpText(foundCommand);
  }

  await respond(helpText);
};
