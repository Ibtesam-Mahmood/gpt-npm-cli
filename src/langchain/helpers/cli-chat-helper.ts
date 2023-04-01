import * as readline from "readline";

interface ChatOptions {
  runner: (input: string, history: string[]) => Promise<string>;
  historyUpdate?: (
    input: string,
    output: string,
    history: string[]
  ) => string[];
}

function defaultHistoryUpdate(
  input: string,
  output: string,
  history: string[]
): string[] {
  return [...history, `User: ${input}`, `Chat: ${output}`];
}

async function cliChatHelper(options: ChatOptions): Promise<string[]> {
  const userInputString = `----------\nQuestion:\n----------`;
  const chatInputString = `----------\nResponse:\n----------`;
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // State
  let chatHistory: string[] = [];

  // start the chat
  console.log();
  console.log('Type ".." to exit');
  console.log();
  console.log(userInputString);
  rl.on("line", async (input) => {
    // Exit the chat
    if (input === "..") {
      console.log();
      console.log("Exiting chat");
      rl.close();
      return;
    }

    // Run the query
    console.log();
    const result = await options.runner(input, chatHistory);

    // Print resopnse and next question prompt
    console.log();
    console.log(chatInputString);
    console.log(result);
    console.log();
    console.log(userInputString);

    // Update the chat history
    chatHistory =
      options.historyUpdate?.(input, result, chatHistory) ??
      defaultHistoryUpdate(input, result, chatHistory);
  });

  return chatHistory;
}

export { cliChatHelper };
