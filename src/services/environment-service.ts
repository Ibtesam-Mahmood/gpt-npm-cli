import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnvironmentNames {
  OPENAI_API_KEY: string = "OPENAI_API_KEY";
  SERPAPI_API_KEY: string = "SERPAPI_API_KEY";
}

class EnvironmentService {
  public static readonly names: EnvironmentNames = new EnvironmentNames();

  private static readonly ENV_PATH: string = path.resolve(__dirname, ".env");

  public static initializeEnvironment(): void {
    dotenv.config({
      path: EnvironmentService.ENV_PATH,
    });
  }

  public static isEnvironmentInitialized(vars: string[]): boolean {
    EnvironmentService.initializeEnvironment();
    return vars.every((v) => !!process.env[v]);
  }

  public static getEnvironmentVariable(key: string): string {
    EnvironmentService.initializeEnvironment();
    return process.env[key] || "";
  }

  public static setEnvironemntFile(value: string): void {
    fs.writeFileSync(EnvironmentService.ENV_PATH, value);
  }

  public static writeToEnvironmentFile(key: string, value: string): void {
    // Check if the environment file exists
    let contentsList: string[] = [];
    if (fs.existsSync(EnvironmentService.ENV_PATH)) {
      // Pull the file contents and set the contents list
      const fileContents = fs
        .readFileSync(EnvironmentService.ENV_PATH)
        .toString();
      contentsList = fileContents.split("\n");
    }

    // Split the keys into a map
    let keysMap: { [key: string]: string } = {};
    contentsList.forEach((c) => {
      const [envKey, value] = c.split("=");
      keysMap[envKey] = value;
    });

    // Replace the value at the key
    keysMap[key] = value;

    // Convert the map back into a string
    const newContents = Object.keys(keysMap).reduce((acc, key) => {
      if (!key) return acc;
      return `${acc}${key}=${keysMap[key]}\n`;
    }, "");

    // Write the new contents to the file
    EnvironmentService.setEnvironemntFile(newContents);
  }
}

export default EnvironmentService;
