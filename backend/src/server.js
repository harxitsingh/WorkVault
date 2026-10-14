import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

const startServer = async () => {
  try {
    // 1. Connect to MongoDB before starting the server
    await connectDB();

    const PORT = config.port;

    const server = app.listen(PORT, () => {
      console.log(`\n╔══════════════════════════════════════════════╗`);
      console.log(`║       WorkVault API Server                   ║`);
      console.log(`╠══════════════════════════════════════════════╣`);
      console.log(`║  Status:  Running                            ║`);
      console.log(`║  Port:    ${String(PORT).padEnd(35)}║`);
      console.log(`║  Mode:    ${String(config.nodeEnv).padEnd(35)}║`);
      console.log(`║  API:     http://localhost:${PORT}/api${' '.repeat(12)}║`);
      console.log(`╚══════════════════════════════════════════════╝\n`);
      console.log(`  Seed accounts (password: password123):`);
      console.log(`    Client:     client@example.com`);
      console.log(`    Freelancer: freelancer@example.com`);
      console.log(`    Admin:      admin@example.com\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });

  } catch (error) {
    console.error('Failed to start WorkVault server due to database connection error:', error.message);
    process.exit(1);
  }
};

startServer();
