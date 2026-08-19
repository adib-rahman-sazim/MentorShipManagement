const path = require("path");

const { configureRuntimeEnv } = require("next-runtime-env/build/configure");
configureRuntimeEnv();

require(path.join(__dirname, "server.js"));
