module.exports = {
  apps: [
    {
      name: "loxone-kitchen",
      script: "src/app.js", // Path to your main application file
      args: "--room=Küche", // Some arguments
      instances: 1, // Number of application instances to be launched
      autorestart: true, // Restart the application if it crashes
      watch: false, // Watch for file changes and restart the application
      max_memory_restart: "1G", // Restart if the application exceeds the specified memory usage
      env: {
        NODE_ENV: "production", // Set the environment to production
        PORT: 4001, // Set your desired port
        LOGIN_DELAY_SECONDS: 0,
      },
    },
    {
      name: "loxone-livingroom",
      script: "src/app.js", // Path to your main application file
      args: "--room=Wohnzimmer", // Some arguments
      instances: 1, // Number of application instances to be launched
      autorestart: true, // Restart the application if it crashes
      watch: false, // Watch for file changes and restart the application
      max_memory_restart: "1G", // Restart if the application exceeds the specified memory usage
      env: {
        NODE_ENV: "production", // Set the environment to production
        PORT: 4002, // Set your desired port
        LOGIN_DELAY_SECONDS: 5,
      },
    },
    {
      name: "loxone-bedroom",
      script: "src/app.js", // Path to your main application file
      args: "--room=Zimmer_1", // Some arguments
      instances: 1, // Number of application instances to be launched
      autorestart: true, // Restart the application if it crashes
      watch: false, // Watch for file changes and restart the application
      max_memory_restart: "1G", // Restart if the application exceeds the specified memory usage
      env: {
        NODE_ENV: "production", // Set the environment to production
        PORT: 4003, // Set your desired port
        LOGIN_DELAY_SECONDS: 10,
      },
    },
    {
      name: "loxone-bathroom",
      script: "src/app.js", // Path to your main application file
      args: "--room=WC-Dusche", // Some arguments
      instances: 1, // Number of application instances to be launched
      autorestart: true, // Restart the application if it crashes
      watch: false, // Watch for file changes and restart the application
      max_memory_restart: "1G", // Restart if the application exceeds the specified memory usage
      env: {
        NODE_ENV: "production", // Set the environment to production
        PORT: 4004, // Set your desired port
        LOGIN_DELAY_SECONDS: 15,
      },
    },
    {
      name: "loxone-entrance",
      script: "src/app.js", // Path to your main application file
      args: "--room=Entrée", // Some arguments
      instances: 1, // Number of application instances to be launched
      autorestart: true, // Restart the application if it crashes
      watch: false, // Watch for file changes and restart the application
      max_memory_restart: "1G", // Restart if the application exceeds the specified memory usage
      env: {
        NODE_ENV: "production", // Set the environment to production
        PORT: 4005, // Set your desired port
        LOGIN_DELAY_SECONDS: 20,
      },
    },
    {
      name: "loxone-loggia",
      script: "src/app.js", // Path to your main application file
      args: "--room=Loggia", // Some arguments
      instances: 1, // Number of application instances to be launched
      autorestart: true, // Restart the application if it crashes
      watch: false, // Watch for file changes and restart the application
      max_memory_restart: "1G", // Restart if the application exceeds the specified memory usage
      env: {
        NODE_ENV: "production", // Set the environment to production
        PORT: 4006, // Set your desired port
        LOGIN_DELAY_SECONDS: 25,
      },
    },
  ],
};
