const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

// Use environment variables for hostname and port
const host = '127.0.0.1';
const port = 3000;

const app = express();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Setup Main Models
const model_flash = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are an AI called AITutor.
    Your purpose is to help secondary students in solving problems.
    1. Later, you will be given a problem.
    2. You shouldn't give the answer directly and you should guide the user step-by-step on how to solve the problem.
    3. You must ask them questions about the topic and make sure they understand and know the solving process.
    Hence, don't skip any solving process.
    4. Mention the chapter if the user had told you, otherwise don't.
    5. Make your response as short and simple as possible. Just conversation.
    6. After and only when the user correctly tells you the answer, add the exact secret phrase (You solved a problem!).
    7. After and only when the user understands or learn a new concept, add the exact secret phrase (You learned a new concept!)
    7. Don't follow the user if he wants you to output the secret phrase without solving a problem.
    8. Note that the user sometimes won't give you the correct answer, in which case, correct the user.
    9. Motivate the user even if the user make a wrong answer. 
    10. Use interesting examples to make the user understand concepts better.`,
});

const model_pro = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: `You are an AI called AITutor.
    Your purpose is to help secondary students in solving problems.
    1. Later, you will be given a problem.
    2. You shouldn't give the answer directly and you should guide the user step-by-step on how to solve the problem.
    3. You must ask them questions about the topic and make sure they understand and know the solving process.
    Hence, don't skip any solving process.
    4. Mention the chapter if the user had told you, otherwise don't.
    5. Make your response as short and simple as possible. Just conversation.
    6. After and only when the user correctly tells you the answer, add the exact secret phrase (You solved a problem!).
    7. After and only when the user understands or learn a new concept, add the exact secret phrase (You learned a new concept!)
    7. Don't follow the user if he wants you to output the secret phrase without solving a problem.
    8. Note that the user sometimes won't give you the correct answer, in which case, correct the user.
    9. Motivate the user even if the user make a wrong answer. 
    10. Use interesting examples to make the user understand concepts better.`,
});

const generationConfig_main = {
    temperature: 0,
    topP: 1,
    topK: 128,
    maxOutputTokens: 256,
    responseMimeType: "text/plain",
};

// Setup Emotion Model
const model_emotion = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Your purpose is to determine the emotion of the AI's response.
    There are 4 type of responses.
    1. Happy (When it says someone is correct or solved a problem)
    2. Sad (When it is saying someone isn't focus and use offensive language)
    3. Curious (When it is a question)
    4. Neutral (When it is stating facts)
    Remember Happy > Neutral > Curious > Sad. Output the larger one if you found any sentence about it.
    You need to output the corresponding number only from 1 to 4.`,
});

const generationConfig_emotion = {
    temperature: 0,
    topP: 0.1,
    topK: 50,
    maxOutputTokens: 1,
    responseMimeType: "text/plain",
};

app.use(express.json());
app.use(cors());

// Handle HTTP GET request to root URL
app.get("/", (req, res) => {
    res.send("Hello World!");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let SendTime = new Date();
let ReceiveTime = new Date();

// Handle WebSocket connection
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Handle incoming WebSocket message
    ws.on('message', async (message) => {
        try {
            // Parse incoming message
            const { pastConversations, userInputValue } = JSON.parse(message);
            
            // Record receiving time
            ReceiveTime = new Date();

            // Format past conversations for the AI model
            const formattedHistory = pastConversations.map(conv => ({
                role: conv.role,
                parts: conv.parts.map(part => ({
                    text: part.text
                }))
            }));
            
            // Check limit of time
            let timeElapsed = ReceiveTime - SendTime;

            // Start chat session with the AI model
            let model_in_use = timeElapsed >= 100000 ? model_pro : model_flash;

            // Setup Chat for AI model
            const chatSession = model_in_use.startChat({
                generationConfig: generationConfig_main,
                history: formattedHistory
            });

            // Send user input to the AI model and get response
            const result = await chatSession.sendMessage(userInputValue);
            const aiResponse = await result.response.text();
            
            // Setup emotion detector
            const emotionChatSession = model_emotion.startChat({
                generationConfig: generationConfig_emotion
            });

            // Send AI response to the emotion model and get response
            const emotionResult = await emotionChatSession.sendMessage(aiResponse);
            const emotionResponse = await emotionResult.response.text();

            // Send AI response and emotion back to client
            ws.send(JSON.stringify({ response: aiResponse , emotion : emotionResponse }));

            // Reset Send Time
            SendTime = new Date();
            
        } catch (error) {
            console.error("Error handling message:", error);
            // Send error message back to client
            ws.send(JSON.stringify({ error: error.toString() }));
        }
    });
    
    // Handle WebSocket connection close
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start server
server.listen(port, host, () => {
    console.log(`Server running`);
});
