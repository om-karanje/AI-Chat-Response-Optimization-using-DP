#  AI Chat Response Optimization using Dynamic Programming

An intelligent chatbot system that improves response quality by selecting the most relevant context using **multiple Dynamic Programming techniques**:
-  Longest Common Subsequence (LCS) → Similarity
-  0/1 Knapsack → Optimal Context Selection

---
##  Project Overview
Modern AI chatbots rely on previous conversation history (context) to generate accurate responses. However, sending the entire chat history leads to:
-  Token limit issues  
-  Increased computation cost  
-  Irrelevant responses
  T is project solves the problem using **Dynamic Programming-based optimization**.

---
##  Core Idea
We combine **two DP algorithms**:
###  1. LCS (Longest Common Subsequence)
- Measures similarity between:
  - User query  
  - Previous messages  
- Helps identify relevant context  

---
###  2. 0/1 Knapsack
- Selects optimal subset of messages  
- Maximizes importance under token constraint  

---
##  How It Works
1. User enters a query  
2. Chat history is stored  
3. For each message:
   - Token size is calculated  
   - Similarity is computed using **LCS**  
   - Importance score is assigned  
4. Messages are treated as items in **Knapsack**:
   - Weight → Token count  
   - Value → Importance  
5. C++ DP selects optimal messages  
6. Selected context is sent to AI  
7. AI generates response  
8. System visualizes:
   - Selected messages  
   - Knapsack DP table  
   - LCS matrix  

---
##  Tech Stack
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js (Express)  
- **Algorithms:** C++ (Knapsack), JS (LCS)  
- **AI API:** OpenRouter  

---
##  Project Structure
project/
│
├── backend/
│ ├── server.js # Backend logic + LCS
│ ├── dp.cpp # Knapsack DP
│ ├── dp.exe # Compiled executable
│ └── .env # API key
│
├── public/
│ ├── index.html # UI
│ ├── style.css # Styling
│ └── script.js # Frontend logic
│
└── README.md

---
##  Features
-  ChatGPT-like UI
-  LCS-based similarity scoring
-  Knapsack-based optimization
-  DP table visualization
-  LCS matrix visualization

##  DAA Concepts Used
- Dynamic Programming
- 0/1 Knapsack Problem
- Longest Common Subsequence (LCS)
- Time & Space Complexity Analysis

## Complexity
- Knapsack:
Time: O(n × W)
Space: O(n × W)
- LCS:
Time: O(n × m)
Space: O(n × m)

##  Applications
- AI Chatbots
- Recommendation Systems
- Context-aware Assistants
- NLP Optimization

##  Future Improvements
- Highlight DP path
- Token usage visualization
- Voice input
- Chat history storage
