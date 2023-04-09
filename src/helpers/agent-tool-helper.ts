import { Calculator, SerpAPI, Tool } from "langchain/tools";
import EnvironmentService from "../services/environment-service.js";
import ValueSerpAPI from "../langchain/tools/value-serp-tool.js";
import FinnhubStockPriceTool from "../langchain/tools/finnhub-stock-price-tool.js";
import CurrencyConversionTool from "../langchain/tools/currency-conversion-tool.js";

function getToolOptionDescription(): string {
  let description = "\n<Optional>:";
  description += `\n[${EnvironmentService.names.SERPAPI_API_KEY}]: Enables the use of the SerpAPI to enable search functionality.`;
  description += `\n[${EnvironmentService.names.VALUESERP_API_KEY}]: Preffered over SerpAPI, enabled search functionality.`;
  description += `\n[${EnvironmentService.names.FINNHUB_API_KEY}]: Enables real-time stock price knowledge for the agent.`;
  return description;
}

function getEnabledTools(): { [name: string]: Tool } {
  const tools: { [name: string]: Tool } = {
    // Default tools
    Calulator: new Calculator(),
    CurrencyConvertor: new CurrencyConversionTool(),
  };

  // Environment Tools

  // search tools
  if (process.env[EnvironmentService.names.VALUESERP_API_KEY]) {
    tools["ValueSerp"] = new ValueSerpAPI(
      process.env[EnvironmentService.names.VALUESERP_API_KEY]
    );
  } else if (process.env[EnvironmentService.names.SERPAPI_API_KEY]) {
    tools["SerpAPI"] = new SerpAPI(
      process.env[EnvironmentService.names.SERPAPI_API_KEY]
    );
  }

  // finnhub tool
  if (process.env[EnvironmentService.names.FINNHUB_API_KEY]) {
    tools["FinnhubStockPrice"] = new FinnhubStockPriceTool(
      process.env[EnvironmentService.names.FINNHUB_API_KEY]
    );
  }

  return tools;
}

export { getToolOptionDescription, getEnabledTools };
