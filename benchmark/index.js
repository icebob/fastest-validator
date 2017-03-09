const Benchmarkify = require("benchmarkify");
Benchmarkify.printHeader("fastest-validator benchmark");

require("./suites/" + (process.argv[2] || "simple"));