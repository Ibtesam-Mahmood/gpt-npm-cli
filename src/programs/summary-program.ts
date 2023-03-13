import { OptionValues } from "commander";
import { ProgramInterface, ProgramInput } from "./program-interface";

class SummaryProgram extends ProgramInterface {
  protected name: string = "summary";
  protected description: string =
    "Allows for the sumarization of text and urls";

  public async run(input: ProgramInput): Promise<void> {
    console.log(input);
  }
}

export default SummaryProgram;
