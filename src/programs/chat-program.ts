import { ProgramInput, ProgramInterface } from "./program-interface.js";
import EnvironmentService from "../services/environment-service.js";
import OpenAiChatHelper from "../langchain/open-ai-chat-helper.js";
import * as toolHelper from "../helpers/agent-tool-helper.js";

class ChatProgram extends ProgramInterface {
  protected get name(): string {
    return "chat";
  }
  protected get aliases(): string[] {
    return ["c"];
  }
  protected get description(): string {
    return `Runs a chat interface with ChatGPT. various api keys can be set in the environment variables to enable additional features.`;
  }
  protected get requiredEnvironmentVariables(): string[] {
    return [EnvironmentService.names.OPENAI_API_KEY];
  }

  protected formatDescription(): string {
    let description =
      super.formatDescription() + toolHelper.getToolOptionDescription();

    return description;
  }

  public async run(input: ProgramInput): Promise<void> {
    // Create model
    const model = new OpenAiChatHelper({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      verbose: input.globals.debug,
    });

    // Get the tools
    const tools = toolHelper.getEnabledTools();

    // Log the tools
    console.log(`Running with Tools: [${Object.keys(tools).join(", ")}]`);

    // Start chat with the tools
    return model.chat({ tools });
  }
}

export default ChatProgram;
