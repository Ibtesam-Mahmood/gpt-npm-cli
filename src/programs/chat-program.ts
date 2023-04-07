import { ProgramInput, ProgramInterface } from "./program-interface.js";
import EnvironmentService from "../services/environment-service.js";
import OpenAiChatHelper from "../langchain/open-ai-chat-helper.js";
import { SerpAPI, Tool } from "langchain/tools";

class ChatProgram extends ProgramInterface {
  protected get name(): string {
    return "chat";
  }
  protected get description(): string {
    return `Runs a chat interface with ChatGPT. various api keys can be set in the environment variables to enable additional features.`;
  }
  protected get requiredEnvironmentVariables(): string[] {
    return [EnvironmentService.names.OPENAI_API_KEY];
  }

  protected formatDescription(): string {
    let description = super.formatDescription();

    // Add optional params
    description += "\n<Optional>:";
    description += `\n[${EnvironmentService.names.SERPAPI_API_KEY}]: Enables the use of the SerpAPI to enable search functionality.`;

    return description;
  }

  public async run(input: ProgramInput): Promise<void> {
    // Create model
    const model = new OpenAiChatHelper({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      verbose: input.globals.debug,
    });

    const tools: Tool[] = [];

    if (process.env[EnvironmentService.names.SERPAPI_API_KEY]) {
      console.log("SerpAPI enabled");
      tools.push(new SerpAPI());
    }

    // Start chat
    return model.chat({ tools });
  }
}

export default ChatProgram;
