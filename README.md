# AltaCoach - AI Training Assistant

AltaCoach is an AI-powered chatbot platform for post-training support, designed to enhance learning impact and employee engagement through continuous reinforcement and assistance.

## Features

- **AI-Powered Conversations**: Natural conversations with an AI that understands training materials and company policies
- **Content Integration**: Seamlessly integrate with existing training content and documentation
- **Analytics & Insights**: Track engagement, identify knowledge gaps, and measure training impact
- **Multilingual Support**: Support for multiple languages to accommodate diverse teams
- **User-Friendly Interface**: Intuitive chat interface for easy interaction with the AI assistant
- **PostgreSQL Database**: Persistent storage for users, content, and conversations

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **AI Integration**: Ready for integration with OpenAI or other LLM providers

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ installed locally

### PostgreSQL Setup

1. Install PostgreSQL if you haven't already:
   - macOS: `brew install postgresql` or download from [PostgreSQL website](https://www.postgresql.org/download/macosx/)
   - Windows: Download from [PostgreSQL website](https://www.postgresql.org/download/windows/)
   - Linux: Use your package manager (e.g., `apt install postgresql` for Ubuntu)

2. Start PostgreSQL service:
   - macOS: `brew services start postgresql`
   - Windows: PostgreSQL is installed as a service and should be running automatically
   - Linux: `sudo service postgresql start` or `sudo systemctl start postgresql`

3. Create a database for the application:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create the database
   CREATE DATABASE altacoach;
   
   # Exit psql
   \q
   ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/altacoach.git
   cd altacoach
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to configure your database connection and other settings.

4. Set up the database:
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed the database with initial data
   npm run prisma:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
altacoach/
├── prisma/              # Prisma schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API routes
│   │   ├── admin/       # Admin interface
│   │   ├── chat/        # Chat interface
│   │   └── ...          # Other app routes
│   ├── components/      # React components
│   ├── lib/             # Utility functions and shared code
│   └── types/           # TypeScript type definitions
├── .env.example         # Example environment variables
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation
```

## Deployment

This project can be deployed on any platform that supports Next.js applications, such as:

- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Docker](https://www.docker.com/) container on any cloud provider

## Contributing

This is a proprietary project and contributions are not accepted. This repository is provided as-is and is intended for authorized use only.

## License

Copyright © 2024 AltaCoach. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited. The receipt or possession of this software does not convey any rights to reproduce, disclose, or distribute its contents, or to manufacture, use, or sell anything that it may describe.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
