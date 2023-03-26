import { ProgramInterface, ProgramInput } from "./program-interface.js";
import EnvironmentService from "../services/environment-service.js";
import { Argument } from "commander";
import WebExtractionService from "../services/web-extraction-service.js";
const { loadSummarizationChain } = await import("langchain/chains");
const { OpenAIChat } = await import("langchain/llms");
const { CallbackManager } = await import("langchain/callbacks");
const { RecursiveCharacterTextSplitter } = await import(
  "langchain/text_splitter"
);

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

// Lets say i wanted to make a role playing game within my gptcli as a new command. The game would have a clear objective that the user would have to complete. The program would ensure that the context of the game is well organized and fault tolerant. The program can be configured with additional parameters for the setting of the game before starting. The chatbot will continue to act as a narrator prompting the user with descriptions of the result of their actions and the setting, continuously asking the user what they want to next until he objective of the game is met.

// With what you know now, how would you design this system within nodejs typescript and integrate it within the gpt cli.
