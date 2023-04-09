import axios from "axios";
import { Tool } from "langchain/tools";

const conversion_url =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies";

class CurrencyConversionTool extends Tool {
  name: string;
  description: string;

  constructor() {
    super();

    this.name = "currency-convert";
    this.description =
      'a currency exchange tool. useful for when you need to convert currency values. input should comma seperated text containin the 2 ISO codes for the currencies. Example Input:"usd,cad"';
  }

  protected async _call(input: string): Promise<string> {
    const { from, to } = this.extractParams(input);

    try {
      const response = await this.getConversion(from, to);

      return `1 ${from.toUpperCase()} = ${response} ${to.toUpperCase()}`;
    } catch (e) {}

    return "Could not find a conversion rate for that currency pair.";
  }

  private extractParams(input: string): { from: string; to: string } {
    const [from, to] = input.toLowerCase().split(",");

    return { from, to };
  }

  private async getConversion(from: string, to: string): Promise<number> {
    const response = await axios.get(`${conversion_url}/${from}/${to}.json`);
    const data = response.data;

    return data[to];
  }
}

export default CurrencyConversionTool;
