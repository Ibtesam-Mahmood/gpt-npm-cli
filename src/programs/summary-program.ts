import { ProgramInterface, ProgramInput } from "./program-interface";
import EnvironmentService from "../services/environment-service";
import { Argument } from "commander";
import WebExtractionService from "../services/web-extraction-service";

class SummaryProgram extends ProgramInterface {
  protected get name(): string {
    return "summary";
  }
  protected get description(): string {
    return `Allows for the sumarization of text and urls.\n<Required: [${EnvironmentService.names.OPEN_AI_API_KEY}]>`;
  }
  protected get requiredEnvironmentVariables(): string[] {
    return [EnvironmentService.names.OPEN_AI_API_KEY];
  }
  protected get arguments(): Argument[] {
    return [new Argument("[input...]", "The text or url to summarize.")];
  }

  public async run(input: ProgramInput): Promise<void> {
    if (input.args.length > 0) {
      // Extract the text
      const inputArg = input.args[0].join(" ");

      if (inputArg.length > 0) {
        // Summarize
        SummaryProgram.runSummary(inputArg);
        return;
      }
    }

    // Default show help
    input.command.help();
  }

  private static async runSummary(input: string): Promise<void> {
    // The text to summarize
    let text = input;

    // Determine if the text is a url
    const isUrl = WebExtractionService.isUrl(input);
    if (isUrl) {
      // Extract the webpage content
      try {
        text = (await WebExtractionService.extract(input)).toString();
      } catch (e) {
        console.error(`Could not extract webpage content from url: ${input}`);
        return;
      }
    }

    // Summarize the text
    console.log(text);
  }
}

export default SummaryProgram;
