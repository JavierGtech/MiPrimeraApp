require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const OpenAIApi = require('openai');
const bodyParser = require('body-parser');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const cors = require('cors');

const openai = new OpenAIApi({
    key: OPENAI_API_KEY
});

app.use(cors());
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/miPrimeraBBDD', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Error connecting to MongoDB', err);
});

const chatSchema = new mongoose.Schema({
    word: String,
    topic: String,
    messages: [{
        type: mongoose.Schema.Types.Mixed
    }],
    buttonResponse: String
});

const Chat = mongoose.model('Chat', chatSchema);
    
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/api/chat', async (req, res) => {
    const { word, topic } = req.body;

    if (!word || !topic) {
        return res.status(400).send({ message: 'Word and topic are required!' });
    }

    // You can modify this prompt as needed
    const prompt = `Demander une question à propos du sujet ${topic} qui utilise le mot ${word}`;

    try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",  
          max_tokens: 150, // Adjusting to around 15 words or a bit more
          temperature: 0.4,
          messages: [{ role: "system", content: prompt }],
        });
        console.log(response.choices[0]);
        
        console.log("OpenAI API Response:", response);

        const generatedQuestion = response.choices[0].message.content;

        if (!generatedQuestion) {
            throw new Error('Failed to generate a question.');
        }

        // Inside the POST /api/chat endpoint after the OpenAI API response:
        const chat = new Chat({
            word,
            topic,
            messages: [{
                role: 'AI',
                content: generatedQuestion
            }]
        });

        await chat.save();

        return res.send({ question: generatedQuestion });

    } catch (error) {
        console.error("Error encountered:", error);
        return res.status(500).send({ message: 'Error  question' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
