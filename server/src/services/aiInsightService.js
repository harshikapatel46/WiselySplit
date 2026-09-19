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

  let response;

  for (let attempt = 0; attempt < 3; attempt++) {
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
      if (error.status !== 503 || attempt === 2) {
        throw error;
      }

      await sleep(1000 * 2 ** attempt);
    }
  }

  return JSON.parse(response.text);

};

module.exports = {
  generateExpenseInsights,
};
