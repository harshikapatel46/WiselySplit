# WiselySplit 💸

A modern, offline-first expense splitting application built with React, Node.js, and Socket.IO.

## Description 📝

WiselySplit is a React-based web application that simplifies the process of splitting expenses among friends or group members. It offers an intuitive interface for creating shared rooms, adding expenses, and tracking who owes whom. A key feature is its offline-first capability, ensuring users can add expenses even without an internet connection, with automatic synchronization once connectivity is restored.

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

**Real-world Use Cases:**

-   **Group Travel:** Track shared costs for accommodation, transport, and activities.
-   **Housemates:** Manage shared bills and expenses for rent, utilities, and groceries.
-   **Friends Dinners/Outings:** Easily split the bill for meals and events.
-   **Shared Subscriptions:** Track contributions towards common subscriptions.

