const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateExpenseInsights = async (expenses) => {
  const expenseData = expenses.map((expense) => ({
    description: expense.description,
    amount: expense.amount,
    currency: expense.currency,
    createdAt: expense.createdAt,
  }));

  const prompt = `
You are an expense analysis assistant for an expense-sharing app.

Analyze these group expenses:

${JSON.stringify(expenseData, null, 2)}

Return ONLY valid JSON:

{
  "summary": "Short summary of total spending",
  "topCategory": "Most likely spending category",
  "observation": "One useful observation",
  "suggestion": "One practical suggestion"
}

Do not calculate who owes whom.
Base the insights only on the provided expenses.
Keep each field concise.
`;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const isRetryableError = (error) => {
    const status =
      error.status ||
      error.statusCode ||
      (error.response && error.response.status);

    // Explicit non-retryable client errors (bad request, auth/key failure, not found)
    if (status === 400 || status === 401 || status === 403 || status === 404) {
      return false;
    }

    // Rate limits (429) and transient server errors (500, 502, 503, 504)
    if (
      status === 429 ||
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504
    ) {
      return true;
    }

    // Inspect error message for rate-limit / resource-exhausted keywords
    const msg = String(error.message || "").toLowerCase();
    if (
      msg.includes("resource_exhausted") ||
      msg.includes("rate limit") ||
      msg.includes("too many requests") ||
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("overloaded") ||
      msg.includes("unavailable")
    ) {
      return true;
    }

    return false;
  };

  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 2500;
  let response;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      break;
    } catch (error) {
      const isRetryable = isRetryableError(error);
      const isLastAttempt = attempt === MAX_RETRIES;

      if (!isRetryable || isLastAttempt) {
        throw error;
      }

      // Exponential backoff with jitter: base * 2^attempt + jitter
      const jitter = Math.floor(Math.random() * 500);
      const delay = BASE_DELAY_MS * Math.pow(2, attempt) + jitter;
      console.warn(
        `[Gemini AI] Request rate-limited or transient failure (status: ${error.status || "N/A"}). Retrying attempt ${attempt + 1}/${MAX_RETRIES} after ${delay}ms...`
      );
      await sleep(delay);
    }
  }

  return JSON.parse(response.text);

};

module.exports = {
  generateExpenseInsights,
};
