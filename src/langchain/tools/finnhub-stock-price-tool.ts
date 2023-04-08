import { Quote } from "@stoqey/finnhub";
import { SymbolData } from "@stoqey/finnhub/dist/api/fundamentals/interface.js";
import { Tool } from "langchain/tools";
const { FinnhubAPI } = await import("@stoqey/finnhub");

interface RawQuoteData extends SymbolData {
  quote: Quote | null;
}

interface QuoteData extends SymbolData {
  quote: Quote;
}

class FinnhubStockPriceTool extends Tool {
  name: string;
  description: string;
  apiKey: string;

  constructor(apiKey: string | undefined) {
    super();

    if (!apiKey) {
      throw new Error("No apiKey provided");
    }

    this.apiKey = apiKey as string;
    this.name = "stockPrice";
    this.description =
      "a stock value checker. useful for when you need to find the out up to date price of a stock in USD. input should be the stock symbol or stock name.";
  }

  protected async _call(input: string, verbose?: boolean): Promise<string> {
    const api = new FinnhubAPI(this.apiKey);

    try {
      // search for the stock symbol
      const lookup = await api.symbolLookup(input);

      if ((lookup?.count ?? 0) === 0) {
        return `No stocks found for ${input}`;
      }

      // filter the lookup to 10 results
      const symbols = lookup!.result.slice(0, Math.min(10, lookup!.count));
      if (verbose) console.log(symbols.map((s) => s.symbol).join(", "));

      // map the symbols to parallel quote requests
      const requests = symbols.map(
        async (symbol: SymbolData): Promise<RawQuoteData> => {
          const quote = await api.getQuote(symbol.symbol).catch(() => null);
          return {
            ...symbol,
            quote: quote,
          };
        }
      );

      // wait for all the requests to complete
      const quotes: QuoteData[] = (await Promise.all(requests))
        .filter((q) => q.quote)
        .map((q) => {
          return q as QuoteData;
        });
      if (quotes.length === 0) {
        return `No stocks found for ${input}`;
      }
      if (verbose) console.log(quotes);

      // collect the stock prices into a bullet list
      const stockPrices = quotes
        .map((q) => {
          return `- The current price of ${q.description} (${q.displaySymbol}) is $${q.quote.close} USD as of ${q.quote.date}`;
        })
        .join("\n");

      // return the stock prices
      return `Stock Prices: \n${stockPrices}`;
    } catch (e) {
      throw new Error(`Got error from finnhub API: ${e}`);
    }
  }
}

export default FinnhubStockPriceTool;
