import axios from "axios";
import cheerio from "cheerio";

interface ExtractedPageData {
  type: "text" | "header" | "list" | "table";
  content: string;
}

class WebPageData {
  public data: ExtractedPageData[];
  constructor(data: ExtractedPageData[]) {
    this.data = data;
  }

  public toString(): string {
    return this.data.map((data) => data.content).join("\n");
  }
}

class WebExtractionService {
  public static get urlPattern(): RegExp {
    return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  }

  /*
 
     ___       _             __                
    |_ _|_ __ | |_ ___ _ __ / _| __ _  ___ ___ 
     | || '_ \| __/ _ \ '__| |_ / _` |/ __/ _ \
     | || | | | ||  __/ |  |  _| (_| | (_|  __/
    |___|_| |_|\__\___|_|  |_|  \__,_|\___\___|
                                               
 
*/
  public static isUrl(url: string): boolean {
    return WebExtractionService.urlPattern.test(url);
  }

  public static async extract(url: string): Promise<WebPageData> {
    if (!WebExtractionService.isUrl(url))
      throw new Error("Invalid url provided.");
    const html = await WebExtractionService.fetchWebPage(url);
    return WebExtractionService.extractHtmlData(html);
  }

  public static async fetchWebPage(url: string): Promise<string> {
    const response = await axios.get(url);
    return response.data;
  }

  public static extractHtmlData(html: string): WebPageData {
    const $ = cheerio.load(html);
    const data: ExtractedPageData[] = [];

    $("body")
      .find("*")
      .each((_, e: cheerio.Element) => {
        const extractedData = WebExtractionService._dataFromElement($, e);
        if (extractedData) {
          if (Array.isArray(extractedData)) {
            data.push(...extractedData);
          } else {
            data.push(extractedData);
          }
        }
      });

    return new WebPageData(data);
  }

  /*
 
     _   _      _                     
    | | | | ___| |_ __   ___ _ __ ___ 
    | |_| |/ _ \ | '_ \ / _ \ '__/ __|
    |  _  |  __/ | |_) |  __/ |  \__ \
    |_| |_|\___|_| .__/ \___|_|  |___/
                 |_|                  
 
*/

  private static _extractText(
    $: cheerio.Root,
    element: cheerio.Cheerio
  ): ExtractedPageData[] {
    return element
      .map((_, el) => ({
        type: "text",
        content: $(el).text().trim(),
      }))
      .get();
  }

  private static _dataFromElement(
    $: cheerio.Root,
    element: cheerio.Element
  ): ExtractedPageData[] | ExtractedPageData | null {
    if (element.type === "text") {
      // Parse text element
      return {
        type: "text",
        content: element.data ?? "",
      };
    } else if (element.type === "tag") {
      // Parse tagged element
      const tagName = element.tagName.toLowerCase();

      if (
        tagName.startsWith("h") &&
        tagName.length === 2 &&
        !isNaN(Number(tagName[1]))
      ) {
        // H1-H6
        return {
          type: "header",
          content: $(element).text().trim(),
        };
      } else if (tagName === "p") {
        // Paragraph
        return WebExtractionService._extractText($, $(element));
      } else if (tagName === "ul" || tagName === "ol") {
        // List
        const isOrdered = tagName === "ol";
        return {
          type: "list",
          content: $(element)
            .find("li")
            .map(
              (i, li) =>
                `${isOrdered ? `${i + 1}. ` : ""}${$(li).text().trim()}`
            )
            .get()
            .join(", "),
        };
      } else if (tagName === "table") {
        // Table
        return {
          type: "table",
          content: $(element)
            .find("tr")
            .map((_, tr) =>
              $(tr)
                .find("td, th")
                .map((_, cell) => $(cell).text().trim())
                .get()
                .join(" | ")
            )
            .get()
            .join("\n"),
        };
      }
    }

    return null;
  }
}

export default WebExtractionService;
