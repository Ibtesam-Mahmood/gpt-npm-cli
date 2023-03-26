import { LLM } from "langchain/llms";

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
}

export default OpenAiChatHelper;
