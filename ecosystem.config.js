module.exports = {
  apps: [
    {
      name: "loxone-lights",
      script: "src/app.js", // Path to your main application file
      args: "--category=Beleuchtung", // Some arguments
      instances: 1, // Number of application instances to be launched
      autorestart: true, // Restart the application if it crashes
      watch: false, // Watch for file changes and restart the application
      max_memory_restart: "1G", // Restart if the application exceeds the specified memory usage
      env: {
        NODE_ENV: "production", // Set the environment to production
        PORT: 9000, // Set your desired port
        LOGIN_DELAY_SECONDS: 0,
      },
    },
    {
      name: "loxone-shades",
      script: "src/app.js", // Path to your main application file
      args: "--category=Beschattung", // Some arguments
      instances: 1, // Number of application instances to be launched
      autorestart: true, // Restart the application if it crashes
      watch: false, // Watch for file changes and restart the application
      max_memory_restart: "1G", // Restart if the application exceeds the specified memory usage
      env: {
        NODE_ENV: "production", // Set the environment to production
        PORT: 9001, // Set your desired port
        LOGIN_DELAY_SECONDS: 5,
      },
    },
    {
      name: "loxone-ventilation",
      script: "src/app.js", // Path to your main application file
      args: "--category=Lüftung", // Some arguments
      instances: 1, // Number of application instances to be launched
      autorestart: true, // Restart the application if it crashes
      watch: false, // Watch for file changes and restart the application
      max_memory_restart: "1G", // Restart if the application exceeds the specified memory usage
      env: {
        NODE_ENV: "production", // Set the environment to production
        PORT: 9002, // Set your desired port
        LOGIN_DELAY_SECONDS: 10,
      },
    },
  ],
};
