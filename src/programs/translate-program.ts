import { ProgramInterface, ProgramInput } from "./program-interface.js";
import EnvironmentService from "../services/environment-service.js";
import { Argument, Option } from "commander";
import OpenAiChatHelper from "../langchain/open-ai-chat-helper.js";

interface TranslationInput {
  text: string; //text
  source: string; // source language
  output: string; // output language
  debug: boolean;
}

class TranslateProgram extends ProgramInterface {
  protected get name(): string {
    return "translate";
  }
  protected get description(): string {
    return `Allows for the translatation of text from one langauge to the other. By defualt the program detects the input language and translates to english.`;
  }
  protected get requiredEnvironmentVariables(): string[] {
    return [EnvironmentService.names.OPENAI_API_KEY];
  }
  protected get arguments(): Argument[] {
    return [new Argument("[input...]", "The text tranlsate.")];
  }
  protected get options(): Option[] {
    return [
      new Option(
        "-s, --source <source>",
        "The expected langauge for the input."
      ).default("Auto"),
      new Option(
        "-o, --output <output>",
        "The langauge to translate the input to."
      ).default("English"),
    ];
  }

  public async run(input: ProgramInput): Promise<void> {
    if (input.args.length > 0) {
      // Extract the text
      const inputArg = input.args[0].join(" ");

      if (inputArg.length > 0) {
        // Summarize
        TranslateProgram.translate({
          text: inputArg,
          source: (input.input.source as string).toLowerCase(),
          output: (input.input.output as string).toLowerCase(),
          debug: input.globals.debug,
        });
        return;
      }
    }

    // Default show help
    input.command.help();
  }

  private static async translate(input: TranslationInput): Promise<void> {
    if (input.debug) {
      console.log("Input:");
      console.log(input);
      console.log();
    }

    // Model
    const chat = new OpenAiChatHelper({
      model: "gpt-3.5-turbo",
      temperature: 0, // Enforces deterministic behavior
      verbose: input.debug,
    });

    // Run summary
    const translation = await chat.translate(input.text, {
      source: input.source,
      output: input.output,
    });

    // Output the result
    console.log();
    console.log(translation);
  }
}

export default TranslateProgram;
