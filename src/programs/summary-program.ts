import { ProgramInterface, ProgramInput } from "./program-interface";
import EnvironmentService from "../services/environment-service";
import { Argument } from "commander";
import WebExtractionService from "../services/web-extraction-service";
// import { LLMChain } from "langchain";
// import {
//   ChatMessage,
//   HumanChatMessage,
//   SystemChatMessage,
// } from "langchain/schema";

class SummaryProgram extends ProgramInterface {
  protected get name(): string {
    return "summary";
  }
  protected get description(): string {
    return `Allows for the sumarization of text and urls.\n<Required: [${EnvironmentService.names.OPENAI_API_KEY}]>`;
  }
  protected get requiredEnvironmentVariables(): string[] {
    return [EnvironmentService.names.OPENAI_API_KEY];
  }
  protected get arguments(): Argument[] {
    return [new Argument("[input...]", "The text or url to summarize.")];
  }

  public async run(input: ProgramInput): Promise<void> {
    if (input.args.length > 0) {
      // Extract the text
      const inputArg = input.args[0].join(" ");
      const debug = input.globals.debug;

      if (inputArg.length > 0) {
        // Summarize
        SummaryProgram.runSummary(inputArg, debug);
        return;
      }
    }

    // Default show help
    input.command.help();
  }

  private static async runSummary(
    input: string,
    debug: boolean = false
  ): Promise<void> {
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
    await SummaryProgram.summarize(text, debug);
  }

  private static async summarize(
    text: string,
    debug: boolean = false
  ): Promise<void> {
    // Imports
    const { OpenAIChat } = await import("langchain/llms");
    const { CallbackManager } = await import("langchain/callbacks");
    const { RecursiveCharacterTextSplitter } = await import(
      "langchain/text_splitter"
    );
    const { loadSummarizationChain } = await import("langchain/chains");

    const callbackManager = CallbackManager.fromHandlers({
      handleLLMStart: async (llm: { name: string }, prompts: string[]) => {
        console.log(JSON.stringify(llm, null, 2));
        console.log(JSON.stringify(prompts, null, 2));
      },
      handleLLMEnd: async (output: any) => {
        console.log(JSON.stringify(output, null, 2));
      },
      handleLLMError: async (err: Error) => {
        console.error(err);
      },
    });

    // Create the model
    const chatOpenAI = new OpenAIChat({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      verbose: debug,
      callbackManager: callbackManager,
    });

    // Create the documents
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
    });
    const docs = await textSplitter.createDocuments([text]);

    // Summarize
    const chain = loadSummarizationChain(chatOpenAI, { type: "map_reduce" });
    const res = await chain.call({
      input_documents: docs,
    });

    // Output the result
    console.log();
    console.log(res.text);
  }
}

export default SummaryProgram;
