import dotenv from "dotenv";
import path from "path";
import fs from "fs";

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

  public static getEnvironmentVariable(key: string): string {
    EnvironmentHelper.initializeEnvironment();
    return process.env[key] || "";
  }

  public static setEnvironemntFile(value: string): void {
    fs.writeFileSync(EnvironmentHelper.ENV_PATH, value);
  }

  public static writeToEnvironmentFile(key: string, value: string): void {
    // Check if the environment file exists
    let contentsList: string[] = [];
    if (fs.existsSync(EnvironmentHelper.ENV_PATH)) {
      // Pull the file contents and set the contents list
      const fileContents = fs
        .readFileSync(EnvironmentHelper.ENV_PATH)
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
    EnvironmentHelper.setEnvironemntFile(newContents);
  }
}

export default EnvironmentHelper;
