import { Command, OptionValues } from "commander";

interface ProgramInput {
  args: any[]; // A list of the input arguments
  input: {}; // A dictionary of the input options
}

abstract class ProgramInterface {
  protected abstract name: string;
  protected abstract description: string;

  protected obj: ProgramInterface = this;

  // Configure the program with the commander instance
  public configure(cliApp: Command): Command {
    let command = cliApp.command(this.name).description(this.description);

    // Add the run function to the command
    command = command.action((...args: any[]) =>
      this.runWrapper(this.run, ...args)
    );

    return command;
  }

  protected abstract run(input: ProgramInput): Promise<void>;

  // formats the input for the runner
  private runWrapper(
    run: (input: ProgramInput) => Promise<void>,
    ...args: any[]
  ): Promise<void> {
    // Format the input
    const finalArgs = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] instanceof Command) {
        break;
      } else {
        finalArgs.push(args[i]);
      }
    }

    let finalInput = {};
    if (typeof finalArgs[finalArgs.length - 1] === "object") {
      finalInput = finalArgs.pop();
    }

    let input: ProgramInput = {
      args: finalArgs,
      input: finalInput,
    };

    return run(input);
  }
}

export { ProgramInterface, ProgramInput };
