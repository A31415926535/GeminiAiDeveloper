# GeminiAiDeveloper
![image](https://github.com/user-attachments/assets/c19706e5-3b59-4124-a2d5-cb19e296fc71)

# Prerequisites

1. Node.js >= v20.16.0
2. An editor, such as Visual Studio Code

# Getting Started

1. Initialise node.js

```
npm init - y
```

2. Install the requirements

```
npm install express body-parser
npm install dotenv
npm install @google/generative-ai
npm install cors
npm install ws
npm install http-server
```

3. Retrieve the API key from Google AI Studio and replace it into the *index.js* file

```
const apiKey = process.env.GOOGLE_API_KEY;
```

4. Start the server

```
node index.js
```
