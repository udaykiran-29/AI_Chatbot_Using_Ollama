const { createClient } = require("redis");

const client = createClient({
  url: "redis://localhost:6379"  // change to your Redis endpoint if using cloud
});

client.on("error", (err) => console.error("❌ Redis Client Error", err));

(async () => {
  await client.connect();
  console.log("✅ Connected to Redis");
})();

module.exports = client;
