import { openaiApi } from "../config/openaiconfig";

const generateMood = async (mood) => {
  const description = await openaiApi.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Come up with 4 activites for ${mood}`,
      },
    ],
    max_tokens: 100,
  });

  console.log(description.data.choices[0].message);

  const tags = await openaiApi.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `come up with 4 pdocast ideas for ${mood}`,
      },
    ],
    max_tokens: 100,
  });

  console.log(tags.data.choices[0].message);
};

generateMood("Happy");
