import { Command, OptionValues } from "commander";
import { ProgramInterface, ProgramInput } from "./program-interface";
import EnvironmentHelper from "../helpers/environment-helper";

class SummaryProgram extends ProgramInterface {
  protected get name(): string {
    return "summary";
  }
  protected get description(): string {
    return `Allows for the sumarization of text and urls.\n<Required Keys: [${EnvironmentHelper.names.OPEN_AI_API_KEY}]>`;
  }
  protected get requiredEnvironmentVariables(): string[] {
    return [EnvironmentHelper.names.OPEN_AI_API_KEY];
  }

  public async run(input: ProgramInput): Promise<void> {
    input.command.help();
  }
}

export default SummaryProgram;
