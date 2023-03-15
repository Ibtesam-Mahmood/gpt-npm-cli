import { Command, Option, Argument } from "commander";
import EnvironmentHelper from "../helpers/environment-helper";

interface ProgramInput {
  args: any[]; // A list of the input arguments
  input: { [key: string]: any }; // A dictionary of the input options
  globals: { [key: string]: any }; // A dictionary of the global options
  objects: { [key: string]: any }; // A dictionary of the additional objects
  root: Command; // The root command
  command: Command; // The current command
}

abstract class ProgramInterface {
  public command?: Command;
  protected abstract get name(): string;
  protected abstract get description(): string;

  // Optional
  protected get arguments(): Argument[] {
    return [];
  }
  protected get options(): Option[] {
    return [];
  }
  protected get requiredEnvironmentVariables(): string[] {
    return [];
  }
  protected get inputObjects(): { [key: string]: any } {
    return {};
  }

  // Configure the program with the commander instance
  // Sets the command at each step
  public configure(root: Command): Command {
    let command: Command = root
      .command(this.name)
      .description(this.description);

    // Add any arguments
    this.arguments.forEach((argument) => {
      command = command.addArgument(argument);
    });

    // Add any options
    this.options.forEach((option) => {
      command = command.addOption(option);
    });

    // Add the run function to the command
    command = command.action((...args) =>
      this.runWrapper(this.run, root, ...args)
    );

    this.command = command;

    return command;
  }

  protected abstract run(input: ProgramInput): Promise<void>;

  // formats the input for the runner
  private runWrapper(
    run: (input: ProgramInput) => Promise<void>,
    root: Command,
    ...args: any[]
  ): Promise<void> {
    // Format the input
    const finalArgs = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] instanceof Command) {
        break;
      } else if (args[i] != undefined && args[i] != null) {
        finalArgs.push(args[i]);
      }
    }

    let finalInput = {};
    if (typeof finalArgs[finalArgs.length - 1] === typeof {}) {
      finalInput = finalArgs.pop();
    }

    let input: ProgramInput = {
      args: finalArgs,
      input: finalInput,
      globals: root.optsWithGlobals(),
      objects: this.inputObjects,
      root: root,
      command: this.command!,
    };

    const isInit = EnvironmentHelper.isEnvironmentInitialized(
      this.requiredEnvironmentVariables
    );
    if (!isInit) {
      throw new Error(
        `All required environment variables are not set. required: ${this.requiredEnvironmentVariables}`
      );
    }

    return run(input);
  }
}

export { ProgramInterface, ProgramInput };
