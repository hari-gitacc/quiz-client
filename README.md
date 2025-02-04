I'll create comprehensive README files for both the frontend and backend components of your quiz system.

# Frontend README.md

## Quiz System Frontend

This is a React-based frontend application for an interactive quiz system that enables teachers to create and manage quizzes while allowing students to participate in real-time.

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Modern web browser with WebSocket support

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend root directory with the following content:
```
VITE_API_URL=http://localhost:8080/api
```

### Development

To start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:
```bash
npm run build
```

The built files will be available in the `dist` directory.

### Project Structure

- `src/components`: React components organized by feature
- `src/services`: API and WebSocket service implementations
- `src/utils`: Utility functions and helpers
- `src/hooks`: Custom React hooks
- `src/types`: TypeScript type definitions
- `src/store`: Redux store configuration and slices

### Key Features

- User authentication (login/register)
- Quiz creation interface
- Real-time quiz participation
- Live leaderboard
- Participant management
- Timer-based questions
- Automatic scoring

