const { Pool } = require("pg");
module.exports = new Pool({
    host: "localhost",
    user: "penguin",
    database: "webapp",
    password: "penguin",
    port: 5432
})