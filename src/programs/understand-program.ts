import { VectorStore } from "langchain/vectorstores";
import { ProgramInput, ProgramInterface } from "./program-interface.js";
import EnvironmentService from "../services/environment-service.js";
import { Argument, Option } from "commander";
import WebExtractionService from "../services/web-extraction-service.js";
import OpenAiChatHelper from "../helpers/langchain/open-ai-chat-helper.js";
import EmbeddingService from "../services/langchain/embedding-service.js";

interface UnderstandInput {
  url: string; //text
  clear: boolean;
  debug: boolean;
}

class UnderstandProgram extends ProgramInterface {
  protected get name(): string {
    return "understand";
  }
  protected get description(): string {
    return `Allows for the AI Model to understand a Website. Ask it questions about the website.`;
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
        "-c, --clear",
        "Clears any cached vector stores for the input, and creates a new one."
      ).default(false),
    ];
  }

  public async run(input: ProgramInput): Promise<void> {
    // Extract the text
    const inputArg = input.args[0].join(" ");

    if (inputArg.length > 0) {
      return UnderstandProgram.understandWebpage({
        url: inputArg,
        clear: input.input.clear,
        debug: input.globals.debug,
      });
    }

    // Default show help
    input.command.help();
  }

  public static async understandWebpage(input: UnderstandInput): Promise<void> {
    if (input.debug) {
      console.log("Input:");
      console.log(input);
      console.log();
    }

    // Embed the webpage
    const vectorStore = await this.embedWebpage(input);

    // Model
    // Create Model (Randonmess level 0.7)
    const chat = new OpenAiChatHelper({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      verbose: input.debug,
    });

    await chat.understand(vectorStore);
  }

  // Embedds the contents of a webpage into a vector store
  public static async embedWebpage(
    input: UnderstandInput
  ): Promise<VectorStore> {
    const { url, debug, clear } = input;

    // Error checking
    if (WebExtractionService.isUrl(url) == false) {
      throw new Error("Invalid URL");
    }

    let vectorStore: VectorStore | null = null;
    const urlDirectory = EmbeddingService.embeddingDirectory.url(url);

    if (!clear) {
      // Loads the vector store if it exists
      vectorStore = await EmbeddingService.load({
        path: urlDirectory,
        debug: debug,
      });
    }

    if (!vectorStore) {
      // Vector store does not exist, create it
      if (debug) {
        console.log("Starting webpage embedding");
      }

      // Extract the text
      const text = await WebExtractionService.extract(url);

      if (debug) {
        console.log("Text abstraction complete");
      }

      vectorStore = await EmbeddingService.embed({
        documents: [text.toString()],
        path: urlDirectory,
        debug: debug,
      });
    }

    if (debug) {
      console.log("Created vector store");
    }

    return vectorStore;
  }
}

export default UnderstandProgram;
