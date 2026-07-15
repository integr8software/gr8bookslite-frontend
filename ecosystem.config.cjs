module.exports = {
  apps: [
    {
      name: "gr8booksneo-frontend-staging",
      cwd: "I:\\Gr8BooksNeo\\apps\\frontend",
      script: "node_modules\\next\\dist\\bin\\next",
      args: "start -p 3001",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
