const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

(async () => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Hello, world!",
      max_tokens: 50,
    });
    console.log(response.data.choices[0].text);
  } catch (error) {
    console.error("OpenAI API error:", error);
  }
})();
