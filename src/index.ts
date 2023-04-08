#! /usr/bin/env node

import { Command } from "commander";
import SummaryProgram from "./programs/summary-program.js";
import figlet from "figlet";
import ConfigureProgram from "./programs/configure/configure-program.js";
import TranslateProgram from "./programs/translate-program.js";
import UnderstandProgram from "./programs/understand-program.js";
import ChatProgram from "./programs/chat-program.js";

const version = "0.1.3";
const description =
  "A super charged CLI for interfacing with GPT-3 and other AI services";

async function main(): Promise<void> {
  console.log(figlet.textSync("GPT CLI"));

  // Create a new command instance for the program and configure it with root commands
  const cliApp = new Command()
    .version(version)
    .description(description)
    .option("-d, --debug", "toggles verbose logging", false);

  // Configure the help command
  cliApp.configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    showGlobalOptions: true,
    subcommandTerm: (cmd: Command) => cmd.name(),
  });

  // Confifgure the programs
  new SummaryProgram().configure(cliApp);
  new ConfigureProgram().configure(cliApp);
  new TranslateProgram().configure(cliApp);
  new UnderstandProgram().configure(cliApp);
  new ChatProgram().configure(cliApp);

  // Parse the args for the program
  await cliApp.parseAsync(process.argv);
}

main();
