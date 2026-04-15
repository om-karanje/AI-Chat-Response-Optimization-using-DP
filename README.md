# 💬 AI Chat Response Optimization using Dynamic Programming

An intelligent chatbot system that optimizes response quality by selecting the most relevant context using **Dynamic Programming (0/1 Knapsack Algorithm)**.

## 🚀 Project Overview: 
Modern AI chatbots rely on previous conversation history (context) to generate meaningful responses. However, sending the entire chat history is inefficient due to:
-  Token limits  
-  Increased cost  
-  Reduced relevance  
This project solves the problem by applying **Dynamic Programming** to select only the most important messages before sending them to the AI.

## 🧠 Core Idea: 
We model the problem as a **0/1 Knapsack Problem**:

| Concept | Mapping |
|--------|--------|
| Message | Item |
| Token count | Weight |
| Importance score | Value |
| Max tokens | Capacity |

Goal: Maximize importance within token limit.

## ⚙️ How It Works: 
1. User enters a query  
2. Chat history is stored  
3. Each message gets:
   - Token size  
   - Importance score  
4. C++ DP algorithm selects optimal messages  
5. Selected context is sent to AI  
6. Response is displayed  
7. DP table is visualized  

## 🧩 Tech Stack: 
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js (Express)  
- **Algorithm:** C++ (Dynamic Programming)  
- **AI API:** OpenRouter  

## 📁 Project Structure: 
project/
│
├── backend/
│ ├── server.js
│ ├── dp.cpp
│ ├── dp.exe
│ └── .env
│
├── public/
│ ├── index.html
│ ├── style.css
│ └── script.js
│
└── README.md

## ✨ Features: 
1. ChatGPT-like UI
2. Dynamic Programming-based optimization
3. DP table visualization
4. Smart context selection
5. Improved response accuracy
6. Enter-to-send + typing animation

## 🎯 Applications:
1. AI Chatbots
2. Recommendation Systems
3. Context-aware Assistants
4. NLP Optimization

## 🧠 Key Learning:
1. Application of Dynamic Programming in real-world systems
2. Integration of C++ with Node.js
3. Efficient context management in AI systems

## 🚀 Future Improvements:
1. Highlight selected DP path in table
2. Token usage visualization
3. Voice input support
4. Chat history persistence
5. Viva Summary

This project uses Dynamic Programming (0/1 Knapsack) to optimally select relevant chat context under token constraints, improving chatbot efficiency and response quality.

## 📌 License:
This project is for educational purposes.
