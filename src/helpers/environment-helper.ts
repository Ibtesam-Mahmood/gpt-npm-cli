import dotenv from "dotenv";
import path from "path";

class EnvironmentNames {
  OPEN_AI_API_KEY: string = "OPEN_AI_API_KEY";
}

class EnvironmentHelper {
  public static readonly names: EnvironmentNames = new EnvironmentNames();

  private static readonly ENV_PATH: string = path.resolve(__dirname, ".env");

  public static initializeEnvironment(): void {
    dotenv.config({
      path: EnvironmentHelper.ENV_PATH,
    });
  }

  public static isEnvironmentInitialized(vars: string[]): boolean {
    EnvironmentHelper.initializeEnvironment();
    return vars.every((v) => !!process.env[v]);
  }

  public static writeToEnvironmentFile(key: string, value: string): void {
    // Check if the environment file exists
    // If the file does not exsist, create it
    // Pull the file contents
    // Check for the key in the file contents, and remove it
    // Append the key and value to the file contents
  }
}

export default EnvironmentHelper;
