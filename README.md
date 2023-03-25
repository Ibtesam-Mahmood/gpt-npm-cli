# gpt-npm-cli v0.1.0

A npm package that uses OpenAI + Langchain to perform convenient commands in the terminal.

## Get Started

To get started with the project clone the repository and run `npm i & npm run build && npm install -g .` within the project root.

Calling the `gptcli` command from the command-line will run the CLI.

For updates simply run `git pull & npm i & npm run build` within the project root.

It is important to set your keys to expect full functionality. run the `gptcli config` command for more information.

## Usage

The following is a list of commands currently configured within the `gptcli`:
- `gptcli config`: Configures environment variables required to run programs within the CLI, it is recommended that you set any required variables through this command before using the CLI.
- `gptcli summary`: Summarizes text and webpage contents, uses map reduce to ensure no limits are encountered for the text 

For more information run the `gptcli help` command.
