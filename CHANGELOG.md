## [0.1.4] v0.1.4

* Updated `chat` program to include stock price checking tool leveraging `finnhub` api.
* Added `gptcli config finnhub` program.

## [0.1.3] v0.1.3

* Created `chat` program.
* Added `gptcli config serpapi` program.
* Added `gptcli config valueserp` program.
* Added `-c` flag to `gptcli config <key>` subcommands to clear the current key
* Factored common chat logic between `understand` and `chat` program
* Added search functionality to `chat` program through `serpapi` and `valueserp`

## [0.1.2] v0.1.2

* Created `understand` program.
* Added local caching to `understand` program.
* Created `EmbeddingService` for parsing and storing vector stores locally.

## [0.1.1] v0.1.1

* Created `translate` program
* Updated `summary` program with `--mode` and `--split` flags.
* Factored out open ai functionality.
* Updated to top-level await with module exports

## [0.1.0] v0.1.0

* Added `langchain` package for llm functionality
* Created `summary` program: summarizes text or urls with no limit

## [0.0.3] v0.0.3

* Added error checking and `debug` flag for more verbose error outputs
* Added `axios` and `cheerio` packages for web page extraction
* Updated `summary` program with ability to parse web urls

## [0.0.2] v0.0.2

* Environement variable reader
* Created `gptcli config` command for environment variable configuration

## [0.0.1] v0.0.1

* Project set up
* Added `gptcli summary` command