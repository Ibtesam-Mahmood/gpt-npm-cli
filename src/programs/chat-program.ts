import { ProgramInput, ProgramInterface } from "./program-interface.js";
import EnvironmentService from "../services/environment-service.js";
import OpenAiChatHelper from "../langchain/open-ai-chat-helper.js";
import { SerpAPI, Tool } from "langchain/tools";
import ValueSerpAPI from "../langchain/tools/value-serp-tool.js";
import FinnhubStockPriceTool from "../langchain/tools/finnhub-stock-price-tool.js";

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
    description += `\n[${EnvironmentService.names.VALUESERP_API_KEY}]: Preffered over SerpAPI, enabled search functionality.`;
    description += `\n[${EnvironmentService.names.FINNHUB_API_KEY}]: Enables real-time stock price knowledge for the agent.`;

    return description;
  }

  public async run(input: ProgramInput): Promise<void> {
    // Create model
    const model = new OpenAiChatHelper({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      verbose: input.globals.debug,
    });

    // Start chat
    return model.chat({ tools: this.getChatTools() });
  }

  private getChatTools(): Tool[] {
    const tools: { [name: string]: Tool } = {};

    // search tools
    if (process.env[EnvironmentService.names.VALUESERP_API_KEY]) {
      tools["ValueSerp"] = new ValueSerpAPI(
        process.env[EnvironmentService.names.VALUESERP_API_KEY]
      );
    } else if (process.env[EnvironmentService.names.SERPAPI_API_KEY]) {
      tools["SerpAPI"] = new SerpAPI(
        process.env[EnvironmentService.names.SERPAPI_API_KEY]
      );
    }

    // finnhub tool
    if (process.env[EnvironmentService.names.FINNHUB_API_KEY]) {
      tools["FinnhubStockPrice"] = new FinnhubStockPriceTool(
        process.env[EnvironmentService.names.FINNHUB_API_KEY]
      );
    }

    // Log the tools
    console.log(`Running with Tools: [${Object.keys(tools).join(", ")}]`);

    return Object.values(tools);
  }
}

export default ChatProgram;
