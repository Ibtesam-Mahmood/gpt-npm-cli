import { ProgramInterface, ProgramInput } from "./program-interface.js";
import EnvironmentService from "../services/environment-service.js";
import { Argument, Option } from "commander";
import WebExtractionService from "../services/web-extraction-service.js";
import OpenAiChatHelper from "../langchain/open-ai-chat-helper.js";

interface SummarizationInput {
  text: string; //url or text
  mode: "map_reduce" | "stuff";
  split: number;
  debug: boolean;
  url?: string;
}

class SummaryProgram extends ProgramInterface {
  protected get name(): string {
    return "summary";
  }
  protected get description(): string {
    return `Allows for the sumarization of text and urls. By defualt runs the map reduce mode which does not have a limit on its input.`;
  }
  protected get requiredEnvironmentVariables(): string[] {
    return [EnvironmentService.names.OPENAI_API_KEY];
  }
  protected get arguments(): Argument[] {
    return [new Argument("[input...]", "The text or url to summarize.")];
  }
  protected get options(): Option[] {
    return [
      new Option(
        "-m, --mode <mode>",
        "The summarization mode to run on:" +
          "\n\tmap-reduce: Runs the map reduce mode which does not have a limit on its input." +
          "\n\tstuff: Sends the input directly to summarization, you may encounter max rate limits."
      )
        .choices(["map_reduce", "stuff"])
        .default("map_reduce"),
      new Option(
        "--split <split>",
        "Defines the split length for large input texts when running with map reduce mode."
      ).default(3000),
    ];
  }

  public async run(input: ProgramInput): Promise<void> {
    if (input.args.length > 0) {
      // Extract the text
      const inputArg = input.args[0].join(" ");

      if (inputArg.length > 0) {
        // Summarize
        return SummaryProgram.runSummary({
          text: inputArg,
          mode: input.input.mode,
          split: input.input.split,
          debug: input.globals.debug,
        });
      }
    }

    // Default show help
    input.command.help();
  }

  private static async runSummary(input: SummarizationInput): Promise<void> {
    // Determine if the text is a url
    const isUrl = WebExtractionService.isUrl(input.text);
    if (isUrl) {
      // Extract the webpage content
      try {
        input.url = input.text;
        input.text = (
          await WebExtractionService.extract(input.text)
        ).toString();
      } catch (e) {
        console.error(`Could not extract webpage content from url: ${input}`);
        return;
      }
    }

    // Summarize the text
    await SummaryProgram.summarizeText(input);
  }

  private static async summarizeText(input: SummarizationInput): Promise<void> {
    if (input.debug) {
      console.log("Input:");
      console.log(input);
      console.log();
    }

    // Model
    const chat = new OpenAiChatHelper({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      verbose: input.debug,
    });

    // Run summary
    const summary = await chat.summarize(input.text, {
      type: input.mode,
      split: input.split,
    });

    // Output the result
    console.log();
    console.log(summary);
  }
}

export default SummaryProgram;
