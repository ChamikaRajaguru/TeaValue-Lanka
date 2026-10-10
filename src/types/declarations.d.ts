declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(options: { apiKey?: string });
    models: {
      generateContent(params: {
        model: string;
        contents: string | any[];
        config?: any;
      }): Promise<{
        text?: string;
        candidates?: any[];
      }>;
    };
  }
}
