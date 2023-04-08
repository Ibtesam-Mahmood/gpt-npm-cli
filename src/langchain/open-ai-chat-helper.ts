import { initializeAgentExecutor, Tool } from "langchain/agents";
import { LLMChain, ChatVectorDBQAChain } from "langchain/chains";
import { LLM } from "langchain/llms";
import { BufferMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { Calculator, SerpAPI } from "langchain/tools";
import { VectorStore } from "langchain/vectorstores";
import { cliChatHelper } from "./helpers/cli-chat-helper.js";
const { Document: LangDocument } = await import("langchain/document");
const { loadSummarizationChain } = await import("langchain/chains");
const { OpenAIChat } = await import("langchain/llms");
const { CallbackManager } = await import("langchain/callbacks");

interface OpenAiChatHelperInput {
  model?: string;
  temperature?: number;
  verbose?: boolean;
}

interface SummarizationOptions {
  type: "map_reduce" | "stuff";
  split: number;
}

interface TranslationOptions {
  source: string;
  output: string;
}

class OpenAiChatHelper {
  public model: LLM;

  constructor(input: OpenAiChatHelperInput) {
    let params = {
      temperature: input.temperature ?? 0.7,
      modelName: input.model ?? "gpt-3.5-turbo",
      verbose: input.verbose ?? false,
      callbackManager: null as any,
    };

    if (params.verbose) {
      params.callbackManager = OpenAiChatHelper.defaultCallBackManager;
    }

    this.model = new OpenAIChat(params);
  }

  public static get defaultCallBackManager() {
    return CallbackManager.fromHandlers({
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
  }

  /*
 
     ____                                             
    / ___| _   _ _ __ ___  _ __ ___   __ _ _ __ _   _ 
    \___ \| | | | '_ ` _ \| '_ ` _ \ / _` | '__| | | |
     ___) | |_| | | | | | | | | | | | (_| | |  | |_| |
    |____/ \__,_|_| |_| |_|_| |_| |_|\__,_|_|   \__, |
                                                |___/ 
 
*/

  public async summarize(
    text: string,
    options: SummarizationOptions = {
      type: "map_reduce",
      split: 3000,
    }
  ): Promise<string> {
    // Loads in the chain
    const chain = loadSummarizationChain(this.model, { type: options.type });

    // Create the documents
    let docs = [];
    if (options.type === "map_reduce") {
      const { RecursiveCharacterTextSplitter } = await import(
        "langchain/text_splitter"
      );
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: options.split,
      });
      docs = await textSplitter.createDocuments([text]);
    } else {
      docs = [new LangDocument({ pageContent: text })];
    }

    // Summarize
    const res = await chain.call({
      input_documents: docs,
    });

    // Output the result
    return res.text;
  }

  /*
 
     _____                    _       _       
    |_   _| __ __ _ _ __  ___| | __ _| |_ ___ 
      | || '__/ _` | '_ \/ __| |/ _` | __/ _ \
      | || | | (_| | | | \__ \ | (_| | ||  __/
      |_||_|  \__,_|_| |_|___/_|\__,_|\__\___|
                                              
 
*/

  public async translate(
    text: string,
    options: TranslationOptions = {
      source: "auto",
      output: "english",
    }
  ): Promise<string> {
    const template =
      "You are a helpful assistant that takes text in {input_language} and only responds with its translation in {output_language}.";
    const autoTemplate =
      "You are a helpful assistant that detects the language of the input and only responds with its translation in {output_language}.";

    let promptTemplate = template;
    if (options.source === "auto") {
      promptTemplate = autoTemplate;
    }

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(promptTemplate),
      HumanMessagePromptTemplate.fromTemplate("{text}"),
    ]);

    const chain = new LLMChain({ llm: this.model, prompt: chatPrompt });

    const response = await chain.call({
      input_language: options.source,
      output_language: options.output,
      text: text,
    });

    return response.text;
  }

  /*
 
     _   _           _               _                  _ 
    | | | |_ __   __| | ___ _ __ ___| |_ __ _ _ __   __| |
    | | | | '_ \ / _` |/ _ \ '__/ __| __/ _` | '_ \ / _` |
    | |_| | | | | (_| |  __/ |  \__ \ || (_| | | | | (_| |
     \___/|_| |_|\__,_|\___|_|  |___/\__\__,_|_| |_|\__,_|
                                                          
 
*/

  // Runs a chat on the vector store
  public async understand(info: VectorStore): Promise<void> {
    const qaTemplate = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

    {context}

    Chat History:
    {chat_history}
    Question: {question}
    Helpful Answer:`;

    // define chat vars
    const chain = ChatVectorDBQAChain.fromLLM(this.model, info, {
      k: 2,
      qaTemplate: qaTemplate,
    });

    // Options for the chat
    const runner = async (
      input: string,
      history: string[]
    ): Promise<string> => {
      const result = await chain.call({
        question: input,
        chat_history: history,
      });

      return result.text;
    };

    // Run the chat
    await cliChatHelper({ runner, inputTitle: "Question" });
  }

  /*
 
      ____ _           _   
     / ___| |__   __ _| |_ 
    | |   | '_ \ / _` | __|
    | |___| | | | (_| | |_ 
     \____|_| |_|\__,_|\__|
                           
 
*/

  public async chat(input?: { tools?: Tool[] }): Promise<void> {
    // Create chat tools
    const inputTools: Tool[] = [...(input?.tools ?? []), new Calculator()];

    // Create the chat agent
    const executor = await initializeAgentExecutor(
      inputTools,
      this.model,
      "chat-conversational-react-description",
      this.model.verbose
    );

    // Add memory to the agent
    executor.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
    });

    // Options for the chat helper
    const runner = async (input: string, _: string[]): Promise<string> => {
      const result = await executor.call({ input });

      return result.output;
    };
    const historyUpdate = (
      _: string,
      __: string,
      history: string[]
    ): string[] => history;

    // Run the chat
    await cliChatHelper({ runner, historyUpdate });
  }
}

export default OpenAiChatHelper;
