const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Root route
app.get('/', (req, res) => {
  res.send('Jeep Name Generator API is running');
});

app.post('/generate-names', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    const { model, color, location, purpose, modifications, feature, personality } = req.body;

    // Create a message for the GPT model
    const message = `Generate 5 creative and unique names for a Jeep with the following characteristics:
    Model: ${model}
    Color: ${color}
    Primarily driven: ${location}
    Main purpose: ${purpose}
    Modifications: ${modifications}
    Favorite feature: ${feature}
    Personality: ${personality}

    Please provide the names in a comma-separated list.`;

    console.log('Sending message to OpenAI:', message);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative assistant specialized in generating unique and fitting names for Jeeps based on their characteristics." },
        { role: "user", content: message }
      ],
      max_tokens: 150
    });

    console.log('Received response from OpenAI:', completion.choices[0].message.content);

    // Extract the generated names from the model's response
    const generatedNames = completion.choices[0].message.content.split(',').map(name => name.trim());

    console.log('Generated names:', generatedNames);
    res.json({ names: generatedNames });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'An error occurred while generating names', details: error.message, stack: error.stack });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});