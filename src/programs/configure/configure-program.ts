import { Command } from "commander";
import { ProgramInterface, ProgramInput } from "../program-interface.js";
import EnvironmentService from "../../services/environment-service.js";
import {
  ConfigureKeyProgram,
  ConfigureKeyInput,
} from "./configure-key-program.js";
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
    this.configureKeyPrograms(this.keyPrograms);

    return this.command!;
  }

  private configureKeyPrograms(inputs: ConfigureKeyInput[]): void {
    for (const input of inputs) {
      new ConfigureKeyProgram(input).configure(this.command!);
    }
  }

  public async run(input: ProgramInput): Promise<void> {
    // Runs the help command
    input.command.help();
  }

  private get keyPrograms(): ConfigureKeyInput[] {
    return [
      // open ai key
      {
        command: "openai",
        name: "Open AI API",
        env: EnvironmentService.names.OPENAI_API_KEY,
      },

      // serp api key
      {
        command: "serpapi",
        name: "SERP API Key",
        env: EnvironmentService.names.SERPAPI_API_KEY,
      },

      // value serp api key
      {
        command: "valueserp",
        name: "Value SERP API Key",
        env: EnvironmentService.names.VALUESERP_API_KEY,
      },

      // finnhub api key
      {
        command: "finnhub",
        name: "Finnhub API Key",
        env: EnvironmentService.names.FINNHUB_API_KEY,
      },
    ];
  }
}

export default ConfigureProgram;
