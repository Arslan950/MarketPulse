<div align="center">
  <img src="./Frontend/public/logo.png" alt="MarketPulse Logo" width="120" />
  <h1>
    <span style="color: #10b981;">Market</span>Pul$e
  </h1>
  <p><em>The Ultimate AI-Powered SaaS Platform for Small Business Owners</em></p>
</div>

---

## 🚀 Overview

**MarketPulse** is a SaaS platform built specifically for the average small business owner. The core of our project is **Trend Analysis**. 

To give you an example: if a garment shop owner is still stocking up on skinny jeans in 2026, they are going to take a massive loss because the market has moved on. To solve this, we built a **Trend Suggestion system**. By integrating a Large Language Model (LLM) that acts as a professional market analyst, MarketPulse actively provides shopkeepers with a list of the top trending items in their specific industry. This allows them to adapt instantly, stock the right products, and maximize their profits.

Once the Trend Analysis tells the owner what to sell, the rest of the ecosystem takes over:

- 📦 **Stock Intelligence**: Tracks those items and calculates the capital trapped on the shelves (inventory management).
- 💰 **Price Suggestion Assist**: Uses AI to analyze cost prices and tells owners exactly what to charge customers to stay competitive.
- 🤖 **Business Copilot**: An intelligent chat assistant equipped with the context of your inventory data and business profile to help you make informed decisions.

## 🛠️ Tech Stack

**Frontend:**
- [React](https://reactjs.org/) (built with [Vite](https://vitejs.dev/))
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [Zustand](https://github.com/pmndrs/zustand)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) (Mongoose)
- Google GenAI / Groq SDK (AI Integration)
- JWT Authentication

## 📂 Project Structure

- `/Frontend` - The React frontend application.
- `/Backend` - The Node.js backend API and database models.

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB

### Running the Backend
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure your environment variables (MongoDB URI, AI API Keys, JWT Secret, etc.).
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Running the Frontend
1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

<div align="center">
  <p>Built with <span style="color: #10b981;">♥</span> by Arslan and Manjit</p>
</div>