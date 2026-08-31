<div align="center">
  <img src="public/logo.png" alt="MESH Logo" width="120" height="120" style="filter: invert(1);" />
  
  # MESH
  
  **The Financial Control Plane for Autonomous AI Agents**

  [![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Prisma Composer](https://img.shields.io/badge/Prisma-Composer-5A67D8?style=for-the-badge&logo=prisma)](https://prisma.io/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](#license)

  <p align="center">
    Millisecond routing. Zero compliance breaches. Programmable control at routing speed.
  </p>
</div>

---

## 🌌 Overview

Human oversight is the bottleneck for autonomous commerce. MESH is the infrastructure required to deliver programmatic financial control at routing speed for AI agents. 

With MESH, your agents can transact autonomously, evaluate risk instantly, and settle securely before wait times become friction. At 5,000 transactions per second, each policy evaluation cycle drops from hours of human review to less than 50 milliseconds.

## ✨ Features

- 🛡️ **Policy Engine:** Define organizational risk thresholds, budget limits, and compliance checks in natural language. MESH converts policies into high-speed executable binaries that process rules directly in memory.
- ⚡ **Payment Router:** Automatically routes approved transactions through the optimal payment rails (Stripe, Lightning, USDC) based on cost, speed, and geographic requirements.
- 🔒 **Zero Friction & Human-in-the-Loop:** No manual reviews for 99% of transactions. Exceptions are automatically flagged and routed to human financial controllers with full context and audit trails.
- 🔑 **Developer API Keys:** Connect and authenticate your external local agents into the MESH platform securely with our high-end Developer Settings panel.
- 🌐 **Provider Marketplace:** Real-time evaluation of provider risk scores and autonomous routing to compliant vendors.

## 🚀 Tech Stack

- **Framework:** Next.js 16.3 (Turbopack)
- **Architecture:** Prisma Composer (`@prisma/composer`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom React Bits Animated Components
- **Payments:** Stripe (Fiat), Lightning Network (Crypto)
- **Database:** Prisma ORM with PostgreSQL

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm or yarn
- PostgreSQL Database (if not using Prisma Composer's cloud instances)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mayank-iitj/MESH.git
   cd MESH
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_...

   # Database URL
   DATABASE_URL=postgresql://user:password@localhost:5432/mesh
   ```

4. **Run Database Migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   *For Prisma Composer local dev, you can also run:*
   ```bash
   npx prisma-composer dev module.ts
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture Design

MESH relies on **Prisma Composer** to construct an app graph containing modules, services, and event streams. 
- **`module.ts`**: The root of the app that provisions databases, stream systems, and services.
- **`src/app/actions/engine.ts`**: The heart of the platform. Evaluates policy (Check 1), assesses risk via an AI pipeline (Check 2), routes the payment (Check 3), and orchestrates sandbox settlement.
- **`src/app/api/webhooks/stripe/route.ts`**: Manages real-time physical and virtual card swipes, rejecting them synchronously if they breach policy limits.
- 
- **The Financial Control Plane**: Stunning dark mode aesthetics powered by `SpotlightCard`, `PixelBlast`, and `Strands` components.
- **Real-Time Dashboards**: Visualize agent behavior, monitor transaction streams, and authorize edge-case transactions with 1-click approvals.

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<div align="center">
  Built with ❤️ by Mayank and the MESH Team.
</div>
2026-08-31 14:13:38.681 [error] Error [PrismaClientInitializationError]: 
Invalid `prisma.agent.findFirst()` invocation:


error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
  -->  schema.prisma:10
   | 
 9 |   provider = "postgresql"
10 |   url      = env("DATABASE_URL")
   | 

Validation Error Count: 1
    at <unknown> (-->  schema.prisma:10)
    at async y (.next/server/chunks/ssr/src_1ee1csj._.js:1:2365) {
  clientVersion: '5.22.0',
  errorCode: undefined,
  digest: '2766634785'
}