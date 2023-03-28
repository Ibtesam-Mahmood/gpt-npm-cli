import { LLMChain } from "langchain/chains";
import { LLM } from "langchain/llms";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

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
    // Load in dependencies
    const { Document: LangDocument } = await import("langchain/document");
    const { loadSummarizationChain } = await import("langchain/chains");

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
}

export default OpenAiChatHelper;
