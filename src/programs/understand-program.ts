import { HNSWLib, VectorStore } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ProgramInput, ProgramInterface } from "./program-interface.js";
import EnvironmentService from "../services/environment-service.js";
import { Argument } from "commander";
import WebExtractionService from "../services/web-extraction-service.js";
import OpenAiChatHelper from "../helpers/langchain/open-ai-chat-helper.js";

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

  public async run(input: ProgramInput): Promise<void> {
    // Extract the text
    const inputArg = input.args[0].join(" ");

    if (inputArg.length > 0) {
      return UnderstandProgram.understandWebpage(inputArg, input.globals.debug);
    }

    // Default show help
    input.command.help();
  }

  public static async understandWebpage(
    url: string,
    debug: boolean
  ): Promise<void> {
    // Embed the webpage
    const vectorStore = await this.embedWebpage(url, debug);

    // Model
    // Create Model (Randonmess level 0.7)
    const chat = new OpenAiChatHelper({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      verbose: debug,
    });

    await chat.understand(vectorStore);
  }

  // Embedds the contents of a webpage into a vector store
  public static async embedWebpage(
    url: string,
    debug: boolean
  ): Promise<VectorStore> {
    // Error checking
    if (WebExtractionService.isUrl(url) == false) {
      throw new Error("Invalid URL");
    }

    if (debug) {
      console.log("Starting webpage embedding");
    }

    // Extract the text
    const text = await WebExtractionService.extract(url);

    if (debug) {
      console.log("Text abstraction complete");
    }

    /* Split the text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const docs = await textSplitter.createDocuments([text.toString()]);

    if (debug) {
      console.log("Initialized docs");
    }

    /* Create the vectorstore */
    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );

    if (debug) {
      console.log("Created vector store");
    }

    return vectorStore;
  }
}

export default UnderstandProgram;
