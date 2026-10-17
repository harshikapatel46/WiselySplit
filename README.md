# WiselySplit 💸
 
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript&style=flat-square)
![React](https://img.shields.io/badge/React-18.x-blue?logo=react&style=flat-square)
![Express](https://img.shields.io/badge/Express-4.x-black?logo=express&style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-green?logo=mongodb&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-teal?logo=tailwindcss&style=flat-square)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-black?logo=socket.io&logoColor=white&style=flat-square)](https://socket.io/)
 
 An offline-first, real-time expense splitting app for friends, trips and flatmates, built with React, Node.js and Socket.IO.
 
<p align="center">
  <img src="https://github.com/user-attachments/assets/42821e7c-19cc-4386-9c1e-2286b478e21e" width="49%" alt="WiselySplit screenshot 1" />
  <img src="https://github.com/user-attachments/assets/caedd610-5fd5-474e-aa12-03ea621dd7cb" width="49%" alt="WiselySplit screenshot 2" />
</p>
## Table of Contents 📜
 
- [About](#about-)
- [Features](#features-)
- [Use Cases](#use-cases-)
- [Tech Stack](#tech-stack-%EF%B8%8F)
- [Getting Started](#getting-started-)
- [Usage](#usage-)
- [Project Structure](#project-structure-)
- [License](#license-)
## About 📝
 
WiselySplit makes splitting expenses with a group painless. Create a shared room, add expenses, and see exactly who owes whom. It works **offline-first**: add expenses with no connection and they sync automatically once you're back online.
 
## Features ✨
 
- **Room creation:** Spin up a shared room for any group or event and invite others with a link.
- **Expense tracking:** Record description, amount, currency, who paid, and how it's split (equally, by exact amounts, etc.).
- **Real-time updates:** Socket.IO keeps expenses and member activity in sync across everyone in the room.
- **Offline support:** Expenses added offline are stored locally (IndexedDB) and synced on reconnect.
- **Balance calculation:** Clear view of who owes whom.
- **Optimized settlements:** Computes the minimum number of payments needed to settle all debts.
- **History & insights:** Browse settlement history and analyze spending in a room.
- **AI-powered insights (in progress):** Spending-pattern insights via `@google/genai`. The backend integration is not fully implemented yet.
- **Modern UI:** Responsive interface built with React and Tailwind CSS.
## Use Cases 🌍
 
- **Group travel:** Shared costs for stays, transport and activities.
- **Housemates:** Rent, utilities and groceries.
- **Friends' outings:** Split dinners and events.
- **Shared subscriptions:** Track contributions to common services.
## Tech Stack 🛠️
 
| Layer | Technologies |
| --- | --- |
| **Frontend** | React, Vite, Tailwind CSS, React Router DOM, `idb` (IndexedDB), Socket.IO Client |
| **Backend** | Node.js, Express, Mongoose (MongoDB), Socket.IO, `cors`, `dotenv`, `@google/genai` |
| **Tooling** | Vite, ESLint, Nodemon |
 
## Getting Started 🚀
 
### Prerequisites
 
- [Node.js](https://nodejs.org/) 18+
- A running MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
### Installation
 
1. **Clone the repository**
```bash
   git clone https://github.com/<your-username>/WiselySplit.git
   cd WiselySplit
```
 
2. **Set up the server**
```bash
   cd server
   npm install
```
 
   Create a `server/.env` file:
 
```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key   # optional, for AI insights
```
 
   Start the server:
 
```bash
   npm run dev
```
 
3. **Set up the client** (in a new terminal)
```bash
   cd client
   npm install
   npm run dev
```
 
4. Open the URL printed by Vite (usually `http://localhost:5173`).
## Usage 💡
 
1. **Create a room:** On the homepage, click **Create room** and name it (e.g. "Trip to Goa", "Flat Rent").
2. **Invite friends:** Share the room link. Anyone with the link can join.
3. **Add expenses:** Enter who paid, what for, the amount, and how it's split.
4. **Track balances:** See live balances showing who owes whom.
5. **Settle up:** Mark settlements as paid to keep balances accurate.
6. **Go offline:** Keep adding expenses without internet; they sync when you reconnect.
7. **Review:** Check history and insights for past transactions and spending patterns.
## Project Structure 📁
 
```text
WiselySplit/
├── .gitignore
├── README.md
├── client/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/    # Reusable React components
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Page-level components
│       ├── services/      # API and utility services
│       └── utils/         # Helper functions
└── server/
    ├── package.json
    └── src/
        ├── app.js
        ├── server.js      # Express server entry point
        ├── config/        # Environment and DB configuration
        ├── controllers/   # REST API controllers
        ├── models/        # Mongoose models
        ├── routes/        # API route definitions
        └── services/      # Business logic and integrations
```
 
## License 📄
 
Add a `LICENSE` file and name it here (e.g. MIT).
 
---
