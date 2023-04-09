import { Command, Option, Argument } from "commander";
import EnvironmentService from "../services/environment-service.js";

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
  protected get aliases(): string[] {
    return [];
  }
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
      .description(this.formatDescription() + "\n\n");

    // Add the aliases if they exists
    if (this.aliases) {
      command = command.aliases(this.aliases);
    }

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

  // Formats the description, adding the required environment variables
  protected formatDescription(): string {
    let description = this.description;
    if (this.requiredEnvironmentVariables.length > 0) {
      const envList = this.requiredEnvironmentVariables.join(", ");
      description += `\n<Required: [${envList}]>`;
    }
    return description;
  }

  // formats the input for the runner
  private async runWrapper(
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

    const isInit = EnvironmentService.isEnvironmentInitialized(
      this.requiredEnvironmentVariables
    );

    // Run the command and validate it
    try {
      if (!isInit) {
        throw new Error(
          `All required environment variables are not set. required: ${this.requiredEnvironmentVariables.join(
            ", "
          )}`
        );
      }

      if (input.globals.debug) {
        console.log("Running with debug mode [enabled]");
      } else {
        process.removeAllListeners("warning");
        console.warn = () => {};
      }

      // Run the program
      await this.run(input);
    } catch (e) {
      // Catch any errors and print them
      if (input.globals.debug) {
        // Check if the verbose flag is set and print the stack trace
        console.error(e);
      } else {
        // Print just the message
        let message = e;
        if (e instanceof Error) {
          message = e.message;
        }
        console.error(message);
      }
    }
  }
}

export { ProgramInterface, ProgramInput };
