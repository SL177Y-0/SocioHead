
# YAPPS Platform

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)

YAPPS is a platform that analyzes users' social and blockchain activities to generate a comprehensive score, which is then visualized on a scorecard.

## Features

- **Social and Blockchain Analysis**: Connect your Twitter, Telegram, and wallet to get a comprehensive analysis of your online presence.
- **Scorecard**: A detailed scorecard visualizes your score, breaking it down into different categories.
- **Leaderboard**: Compare your score with other users on the leaderboard.
- **Referrals**: Refer your friends and earn rewards.
- **Badges**: Earn badges for your achievements.

## Tech Stack

**Frontend:**

- React
- Vite
- TypeScript
- Tailwind CSS
- Shadcn UI
- Recharts
- Framer Motion

**Backend:**

- Node.js
- Express.js
- MongoDB
- Mongoose
- Moralis (for blockchain analysis)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/yapps-platform.git
   ```

2. **Install frontend dependencies:**

   ```bash
   cd yapps-platform
   npm install
   ```

3. **Install backend dependencies:**

   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables:**

   Create a `.env` file in the `backend` directory and add the following:

   ```env
   MONGO_URI=your_mongodb_uri
   MORALIS_API_KEY=your_moralis_api_key
   ```

### Running the application

1. **Start the backend server:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server:**

   ```bash
   cd ..
   npm run dev
   ```
## THINGS HERE

- User authentication with Twitter and Telegram.
- Blockchain analysis with Moralis.
- Score generation and visualization.
- Leaderboard functionality.
- Referral system.
- Badge system.
- Responsive design.
- Use of Verida for Telegram Data
- Use of SpaceID For Wallet Adresses.

