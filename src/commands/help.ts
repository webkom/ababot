import { SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Command, COMMANDS, getCommandFromListOfCommands } from "../commands";
const getHelpText = async (
  command: Command,
  includeOptions = false,
  includeSubCommands = false
) => {
  let helpText = `Usage: ${command.usage}\n`;
  helpText += `Description: ${command.description}\n`;
  if (includeSubCommands && command.subcommands) {
    helpText += "Subcommands:\n";
    command.subcommands.forEach(async (subCommand) => {
      helpText += `\t${subCommand.usage}: ${subCommand.description}\n`;
      if (includeOptions && subCommand.allowedOptions) {
        helpText += `Options: ${subCommand.allowedOptions.join(", ")}\n`;
      }
    });
  }
  if (command.allowedOptions && includeOptions) {
    helpText += `Options: ${command.allowedOptions.join(", ")}\n`;
  }
  return helpText;
};

export const respondWithHelp = async ({
  command,
  ack,
  respond,
}: SlackCommandMiddlewareArgs) => {
  await ack();

  const foundCommand = getCommandFromListOfCommands(command.command);
  if (!foundCommand) {
    await respond("Command not found, type /help for a list of commands");
    return;
  }
  let helpText = "";

  const isHelpCommand = command.command === COMMANDS["help"].name;

  if (isHelpCommand) {
    const mainCommand = getCommandFromListOfCommands(command.text);
    if (mainCommand) {
      helpText = await getHelpText(mainCommand, true, true);
    } else {
      helpText = await getHelpText(foundCommand);
      Object.keys(COMMANDS).forEach(async (key) => {
        if (key === "help") {
          return;
        }
        const c = COMMANDS[key];
        helpText += await getHelpText(c, true);
      });
    }
  } else {
    helpText = await getHelpText(foundCommand);
  }

  await respond(helpText);
};
