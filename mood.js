require("dotenv").config();
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/completions";

// let mood ="happy"

async function getMoodBasedActivities(mood) {
  const questions = await generateQuestions(mood);
  const responses = await getResponses(questions);

  const activities = await suggestActivities(mood, responses);

  return activities;
}

async function generateQuestions(mood) {
  const prompt = `Create 4 questions to assess someone's feelings and preferences based on their current mood, which is "${mood}". The questions should help in suggesting activities that match or improve the mood.`;
  const response = await callOpenAI(prompt);
  return response.split("\n").filter((q) => q.trim() !== "");
}

async function getResponses(questions) {
  console.log("Please answer the following questions:");
  const responses = [];

  for (const question of questions) {
    console.log(question);
    const simulatedResponse =
      "I'm feeling relaxed and would like something creative.";
    responses.push(simulatedResponse);
  }

  return responses;
}

// Function to suggest activities based on mood and responses
async function suggestActivities(mood, responses) {
  const prompt = `Based on the following mood and responses, suggest 4 personalized activities that align with the mood and responses.\n\nMood: ${mood}\nResponses:\n- ${responses.join(
    "\n- "
  )}\n\nSuggested Activities:`;
  const response = await callOpenAI(prompt);
  return response.split("\n").filter((a) => a.trim() !== "");
}

async function callOpenAI(prompt) {
  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        model: "gpt-3.5-turbo",
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(
      "Error with OpenAI API call:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
}

const mood = "happy";
getMoodBasedActivities(mood).then((activities) => {
  console.log("Recommended Activities:");
  activities.forEach((activity, index) => {
    console.log(`${index + 1}. ${activity}`);
  });
});
