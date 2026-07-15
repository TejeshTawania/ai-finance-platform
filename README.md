# 💰 FinanceGuru

> An AI-powered personal finance management platform built with Next.js 16.

FinanceGuru helps you take control of your money through smart account management, AI receipt scanning, recurring transaction automation, budget alerts, and monthly financial reports powered by Google Gemini.

---
## Deployed Link : https://ai-finance-platform2-inky.vercel.app/

## ✨ Features

| Feature                         | Description                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| 🏦 **Multi-Account Management** | Create and manage CURRENT and SAVINGS accounts                                       |
| 💳 **Transaction Tracking**     | Log income and expenses with category, date, and description                         |
| 🤖 **AI Receipt Scanner**       | Scan receipts with your camera and auto-fill transaction details using Google Gemini |
| 🔁 **Recurring Transactions**   | Automate daily, weekly, monthly, or yearly transactions via Inngest cron jobs        |
| 📊 **Dashboard & Charts**       | Visual overview of balances, recent transactions, and monthly expense breakdowns     |
| 💡 **Monthly AI Insights**      | Receive AI-generated spending insights via email on the 1st of each month            |
| 🚨 **Budget Alerts**            | Get email alerts when your default account exceeds 80% of your monthly budget        |
| 🔒 **Authentication**           | Secure sign-in/sign-up powered by Clerk                                              |
| 🛡️ **Rate Limiting**            | API protection via Arcjet token bucket rate limiting                                 |

---

## 🛠️ Tech Stack

### Frontend

- **[Next.js 16](https://nextjs.org/)** — App Router, React Server Components, Server Actions
- **[React 19](https://react.dev/)** with React Compiler
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[shadcn/ui](https://ui.shadcn.com/)** — Component library
- **[Recharts](https://recharts.org/)** — Charts and data visualisation
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** — Form handling and validation
- **[Sonner](https://sonner.emilkowal.ski/)** — Toast notifications

### Backend & Infrastructure

- **[Prisma 7](https://www.prisma.io/)** — ORM with PostgreSQL adapter
- **[Clerk](https://clerk.com/)** — Authentication & user management
- **[Inngest](https://www.inngest.com/)** — Background jobs & cron scheduling
- **[Arcjet](https://arcjet.com/)** — Rate limiting & bot protection
- **[Google Gemini AI](https://ai.google.dev/)** (`gemini-1.5-flash`) — Receipt scanning & financial insights
- **[Resend](https://resend.com/)** — Transactional email delivery

---

## 📁 Project Structure


