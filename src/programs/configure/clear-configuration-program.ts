import { ProgramInterface, ProgramInput } from "../program-interface";
import EnvironmentHelper from "../../helpers/environment-helper";

class ClearConfigurationProgram extends ProgramInterface {
  protected get name(): string {
    return "clear";
  }
  protected get description(): string {
    return "Clears all environment variables for the application";
  }

  public async run(input: ProgramInput): Promise<void> {
    EnvironmentHelper.setEnvironemntFile("");
    console.log("Cleared environment file");
  }
}

export default ClearConfigurationProgram;
