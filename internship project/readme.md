# 🚀 Finnhub Stock Tracker

A app fetching stock prices for 60 companies from the Finnhub API, storing data in PostgreSQL (Docker), and showing price differences.

---

## 📚 Table of Contents

- [About](#about)
- [Features](#features)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Tech Stack](#tech-stack)
- [Setup & Run Back-End + Folder Structure](#setup--run-back-end--folder-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🧠 About

Finnhub Stock Tracker fetches real-time stock prices using the [Finnhub API](https://finnhub.io/) for 60 companies, stores prices in a PostgreSQL database with Prisma ORM, and calculates the difference between the latest and previous prices.

The front-end is built with React + Vite, and the back-end is a NestJS API with Prisma ORM, all written in TypeScript.

---

## ✨ Features

- Periodic fetching and storage of stock prices from Finnhub API  
- Calculates price differences for tracked stocks  
- React + Vite front-end UI for displaying stock data  
- NestJS back-end API handling data fetching, persistence, and business logic  
- PostgreSQL database running in Docker for easy setup  

---

## ⚡ Getting Started

### Prerequisites

- Node.js v18+  
- Docker  
- Finnhub API Key ([get one here](https://finnhub.io/))  

---

## Setup & Run Back-End + Folder Structure

### 1. Start PostgreSQL with Docker

docker run --name pg-docker -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres

### 2. Setup Environment Variables
   
Create a .env file inside the back-end folder with:

env

PORT=3002
API_KEY=d0vcpphr01qmg3ulljt0d0vcpphr01qmg3ulljtg
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/mydatabase
MAX_REQUESTS=60

### 3. Run Back-End (NestJS)

cd back-end
npm install
npx prisma migrate dev --name init
npm run start:dev

Back-end API will run at http://localhost:3002

### 4. Run Front-End (React + Vite)

cd front-end
npm install
npm run dev

Front-end UI runs at http://localhost:5173

Folder Structure

root/
├── front-end/          # React + Vite front-end app
│   └── ...
├── back-end/           # NestJS back-end with Prisma & services
│   ├── prisma/         # Prisma schema & migrations
│   └── services/       # Finnhub API integration and price diff logic
├── README.md
└── package.json

📜 Scripts
Front-End (front-end)
Command	Description

npm install	Install dependencies
npm run dev	Start development server
npm run build	Build production bundle

Back-End (back-end)
Command	Description

npm install	Install dependencies
npm run start:dev	Start NestJS server (dev mode)
npx prisma migrate dev	Apply database migrations
npx prisma generate	Generate Prisma client

🧱 Tech Stack
Front-End: React, Vite, TypeScript

Back-End: NestJS, TypeScript, Prisma ORM

Database: PostgreSQL (Dockerized)

API: Finnhub Stock Market API

Tools: Docker, Prisma, ESLint, Prettier

🤝 Contributing
Fork the repo

Create a branch (git checkout -b feat/my-feature)

Commit your changes (git commit -m 'feat: add feature')

Push your branch (git push origin feat/my-feature)

Open a pull request

🪪 License

This project is licensed under the MIT License.
