import { Command } from "commander";
import { ProgramInterface, ProgramInput } from "../program-interface";
import EnvironmentService from "../../services/environment-service";
import ConfigureOpenAiProgram from "./configure-key-program";
import ClearConfigurationProgram from "./clear-configuration-program";

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
      env: EnvironmentService.names.OPEN_AI_API_KEY,
    }).configure(this.command);

    return this.command!;
  }

  public async run(input: ProgramInput): Promise<void> {
    // Runs the help command
    input.command.help();
  }
}

export default ConfigureProgram;
