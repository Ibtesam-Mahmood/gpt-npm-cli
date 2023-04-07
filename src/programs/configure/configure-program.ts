import { Command } from "commander";
import { ProgramInterface, ProgramInput } from "../program-interface.js";
import EnvironmentService from "../../services/environment-service.js";
import ConfigureOpenAiProgram from "./configure-key-program.js";
import ClearConfigurationProgram from "./clear-configuration-program.js";

class ConfigureProgram extends ProgramInterface {
  protected get name(): string {
    return "config";
  }
  protected get description(): string {
    return "Configures environment variables for the application. An alternative to setting environment variables manually.";
  }

  // Configure the program with the commander instance
  public configure(root: Command): Command {
    this.command = super.configure(root);

    // clear sub command
    new ClearConfigurationProgram().configure(this.command);

    // key sub commands
    // openai subcommand
    new ConfigureOpenAiProgram({
      command: "openai",
      name: "Open AI API",
      env: EnvironmentService.names.OPENAI_API_KEY,
    }).configure(this.command);

    // serpapi subcommand
    new ConfigureOpenAiProgram({
      command: "serpapi",
      name: "SERP API Key",
      env: EnvironmentService.names.SERPAPI_API_KEY,
    }).configure(this.command);

    return this.command!;
  }

  public async run(input: ProgramInput): Promise<void> {
    // Runs the help command
    input.command.help();
  }
}

export default ConfigureProgram;
