import { Command, OptionValues } from "commander";
import { ProgramInterface, ProgramInput } from "./program-interface";
import EnvironmentHelper from "../helpers/environment-helper";

class SummaryProgram extends ProgramInterface {
  protected name: string = "summary";
  protected description: string =
    "Allows for the sumarization of text and urls";
  protected requiredEnvironmentVariables: string[] = [
    EnvironmentHelper.names.OPEN_AI_API_KEY,
  ]; // Optional

  public async run(input: ProgramInput): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default SummaryProgram;
