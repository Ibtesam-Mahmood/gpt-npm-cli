import { OpenAI } from "langchain";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import {
  VectorStoreToolkit,
  createVectorStoreAgent,
  VectorStoreInfo,
} from "langchain/agents";
import { ChatPromptTemplate } from "langchain/prompts";
import { SystemMessagePromptTemplate } from "langchain/prompts";
import { MessagesPlaceholder } from "langchain/prompts";
import { HumanMessagePromptTemplate } from "langchain/prompts";
import { ProgramInput, ProgramInterface } from "./program-interface.js";
import EnvironmentService from "../services/environment-service.js";
import { Argument, Option } from "commander";
import * as readline from "readline";
import WebExtractionService from "../services/web-extraction-service.js";

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
          "-s, --source <source>",
          "The expected langauge for the input."
        ).default("Auto"),
        new Option(
          "-o, --output <output>",
          "The langauge to translate the input to."
        ).default("English"),
      ];
    }

    public async run(input: ProgramInput): Promise<void> {
        // Extract the text
        const inputArg = input.args[0].join(" ");

        if (inputArg.length > 0) {

            // Create Model (Randonmess level 0.7)
            const model = new OpenAI({ temperature: 0.7 });

            /* Load in the file we want to do question answering over */
            const text = await WebExtractionService.extract(inputArg);

            console.log("Text abstraction complete");

            /* Split the text into chunks */
            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
            const docs = await textSplitter.createDocuments([text.toString()]);

            console.log("Initialized docs");

            /* Create the vectorstore */
            const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

            console.log("Initialized vector store");

            /* Create the agent */
            const vectorStoreInfo: VectorStoreInfo = {
                name: "website",
                description: "a website",
                vectorStore,
            };

            const toolkit = new VectorStoreToolkit(vectorStoreInfo, model);
            const agent = createVectorStoreAgent(model, toolkit);

            console.log("Inizalized agent");

            /* Create the conversation chain */
            // const chatPrompt = ChatPromptTemplate.fromPromptMessages([
            //     SystemMessagePromptTemplate.fromTemplate(
            //     "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."
            //     ),
            //     new MessagesPlaceholder("history"),
            //     HumanMessagePromptTemplate.fromTemplate("{input}"),
            // ]);
            
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            rl.on("line", async (INPUT) => {
                const result = await agent.call({ input: INPUT });
                console.log(`Got output ${result.output}`);
                console.log(
                    `Got intermediate steps ${JSON.stringify(
                        result.intermediateSteps,
                        null,
                        2
                    )}`
                );
            });
        }
    }
}

export default UnderstandProgram;

