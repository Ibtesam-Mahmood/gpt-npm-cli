import axios from "axios";
import { Tool } from "langchain/tools";

const value_serp_url = "https://api.valueserp.com/search";

class ValueSerpAPI extends Tool {
  name: string;
  description: string;
  apiKey: string;

  constructor(apiKey: string | undefined) {
    super();

    if (!apiKey) {
      throw new Error("No apiKey provided");
    }

    this.apiKey = apiKey as string;
    this.name = "search";
    this.description =
      "a search engine. useful for when you need to answer questions about current events. input should be a search query.";
  }

  protected async _call(input: string): Promise<string> {
    const params = this.getParams(input);

    try {
      const response = await axios.get(value_serp_url, { params });

      const data = response.data;
      return this.extractData(data);
    } catch (e) {
      throw new Error(`Got error from valueSerpAPI: ${e}`);
    }
  }

  private getParams(input: string): any {
    return {
      api_key: this.apiKey,
      q: input,
      hl: "en",
      google_domain: "google.com",
      gl: "us",
    };
  }

  private extractData(data: any): string {
    let response: string = "";

    // answer box
    if (data?.answer_box?.answers) {
      const answers = (data.answer_box.answers as any[])
        .map((e) => `- ${e.answer}`)
        .join("\n");

      response += "Possible Answers: \n" + answers + "\n\n";
    }

    // knowledge graph
    if (data?.knowledge_graph?.description) {
      response +=
        "Additional Information: \n- " +
        data.knowledge_graph.description +
        "\n\n";
    }

    // QA results
    if (data?.related_questions) {
      const questions = data.related_questions.slice(
        0,
        Math.min(3, data.related_questions.length)
      );

      const results = questions
        .map((e: any) => `[Q]: ${e.question}\n[A]: ${e.answer}`)
        .join("\n---\n");

      response += "Related Question Responses: \n" + results + "\n\n";
    }

    // organic web results, only run if there is no response
    if (data?.organic_results) {
      const organgicResults = data.organic_results.slice(
        0,
        Math.min(3, data.organic_results.length)
      );
      const results = organgicResults
        .map((e: any) => `- [${e.title}]: ${e.snippet}`)
        .join("\n");
      response += "Top Web Results: \n" + results + "\n\n";
    }

    // defualt response
    if (response.length === 0) {
      return "No good search result found";
    }

    return response;
  }
}

export default ValueSerpAPI;
