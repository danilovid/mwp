// PM2: pm2 start deploy/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "mwp",
      cwd: __dirname + "/..",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      env: { NODE_ENV: "production" },
      max_memory_restart: "600M",
      time: true,
    },
  ],
};
