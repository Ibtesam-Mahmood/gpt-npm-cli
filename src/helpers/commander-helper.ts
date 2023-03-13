import commander from "commander";

function parseIntArgument(value: string, _: any): number {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError("Not a valid number.");
  }
  return parsedValue;
}

export { parseIntArgument };
