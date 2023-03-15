#! /usr/bin/env node

import { Command } from "commander";
import SummaryProgram from "./programs/summary-program";
import figlet from "figlet";
import ConfigureProgram from "./programs/configure/configure-program";

const version = "0.0.2";
const description =
  "A super charged CLI for interfacing with GPT-3 and other AI services";

async function main(): Promise<void> {
  console.log(figlet.textSync("GPT CLI"));

  // Create a new command instance for the program and configure it with root commands
  const cliApp = new Command()
    .version(version)
    .description(description)
    .option("-d, --debug", "toggles verbose logging");

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

  // Parse the args for the program
  await cliApp.parseAsync(process.argv);
}

main();
