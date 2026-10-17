# WiselySplit 💸

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript&style=flat-square)
![React](https://img.shields.io/badge/React-18.x-blue?logo=react&style=flat-square)
![Express](https://img.shields.io/badge/Express-4.x-black?logo=express&style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-green?logo=mongodb&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-teal?logo=tailwindcss&style=flat-square)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-black?logo=socket.io&logoColor=white&style=flat-square)](https://socket.io/)

A modern, offline-first expense splitting application built with React, Node.js, and Socket.IO.


## Description 📝

WiselySplit is a React-based web application that simplifies the process of splitting expenses among friends or group members. It offers an intuitive interface for creating shared rooms, adding expenses, and tracking who owes whom. A key feature is its offline-first capability, ensuring users can add expenses even without an internet connection, with automatic synchronization once connectivity is restored.

<p align="center">
  <img src="https://github.com/user-attachments/assets/42821e7c-19cc-4386-9c1e-2286b478e21e" width="49%" alt="WiselySplit Screenshot 1" />
  <img src="https://github.com/user-attachments/assets/caedd610-5fd5-474e-aa12-03ea621dd7cb" width="49%" alt="WiselySplit Screenshot 2" />
</p>

## Table of Contents 📜

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Footer](#footer)

## Features ✨

- **Room Creation:** Easily create new shared rooms for different groups or events.
- **Expense Tracking:** Add expenses with details like description, amount, currency, who paid, and how it's split.
- **Real-time Updates:** Utilizes Socket.IO for real-time synchronization of expenses and member activity.
- **Offline Support:** Add expenses even when offline; they sync automatically once you're back online.
- **Balance Calculation:** Clearly displays who owes whom, simplifying debt settlement.
- **Optimized Settlements:** Calculates the minimum number of payments required to settle all debts within a room.
- **User-Friendly Interface:** Built with React and Tailwind CSS for a modern and responsive user experience.
- **AI-Powered Insights:** Provides intelligent insights into spending patterns within a room (Note: This feature's full implementation requires further backend integration for `@google/genai`).
- **History and Insights:** Dedicated sections for viewing settlement history and analyzing room spending.

## Tech Stack 🛠️

- **Frontend:**
  - React
  - Vite
  - Tailwind CSS
  - React Router DOM
  - `idb` (IndexedDB for offline storage)
  - Socket.IO Client

- **Backend:**
  - Node.js
  - Express.js
  - Mongoose
  - Socket.IO
  - `cors`
  - `dotenv`
  - `@google/genai` (for AI insights, potentially)

- **Development & Build:**
  - Vite
  - ESLint
  - Prettier (implied by ESLint config)
  - Nodemon (for backend development)


## Usage 💡

WiselySplit is designed for easy expense sharing among groups:

1.  **Create a Room:** Navigate to the homepage and click on "Create room". Provide a name for your room (e.g., "Trip to Goa", "Flat Rent").
2.  **Join a Room:** Share the unique room link generated after creation with your friends. They can join by simply clicking the link.
3.  **Add Expenses:** Once in a room, anyone can add an expense. Specify who paid, the description (e.g., "Dinner", "Groceries"), the amount, and how the cost should be split (equally, by specific amounts, etc.).
4.  **Track Balances:** The app automatically calculates and displays the balances, showing who owes whom and how much.
5.  **Settle Up:** Mark settlements as paid to keep the room's balance accurate.
6.  **Offline Use:** Add expenses even without an internet connection. The app will sync them when you're back online.
7.  **View History & Insights:** Explore past transactions and gain insights into spending patterns within the room.
## Project Structure

```text
WiselySplit/
├── .gitignore
├── README.md
├── client/
│   ├── README.md
│   ├── dev-dist/
│   │   ├── registerSW.js
│   │   ├── sw.js
│   │   └── workbox-7e5eb42b.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── components/    # Reusable React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── pages/         # Page-level React components
│   │   ├── services/      # API and utility services
│   │   └── utils/         # Utility functions
│   └── vite.config.js
└── server/
    ├── package-lock.json
    ├── package.json
    └── src/
        ├── app.js
        ├── config/        # Environment and DB configuration
        ├── controllers/   # REST API controllers
        ├── models/        # Mongoose models
        ├── routes/        # API route definitions
        ├── server.js      # Express server entry point
        └── services/      # Business logic and integrations
```

**Real-world Use Cases:**

-   **Group Travel:** Track shared costs for accommodation, transport, and activities.
-   **Housemates:** Manage shared bills and expenses for rent, utilities, and groceries.
-   **Friends Dinners/Outings:** Easily split the bill for meals and events.
-   **Shared Subscriptions:** Track contributions towards common subscriptions.

