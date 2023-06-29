const {
  isMainThread,
  Worker,
  workerData,
  parentPort,
} = require("worker_threads");

if (isMainThread) {
  const { cpus } = require("os");
  const threads = isFinite(process.argv[2]) ? process.argv[2] : cpus().length;
  const prefix = process.argv[3];
  const input = process.argv.slice(4).join(" ");

  console.log(`threads: ${threads} / prefix: ${prefix} / input: ${input}`);

  console.log(`prefix: ${prefix} / input: ${input}`);

  const workers = [];
  for (let i = 0; i < threads; i++) {
    const worker = new Worker(__filename, { workerData: { prefix, input } });
    worker.on("message", (message) => {
      workers
        .filter((otherWorker) => otherWorker !== worker)
        .forEach((otherWorker) => otherWorker.terminate());
      console.log(`thread ${i} / ${message}`);
    });
    workers.push(worker);
  }
} else {
  const prefix = workerData.prefix;
  const input = workerData.input;

  const { createHash } = require("crypto");

  let nonce;
  let hash;

  do {
    nonce = `${Math.random().toFixed(17).substring(2)}${Math.random()
      .toFixed(17)
      .substring(2)}`;
    hash = createHash("sha1").update(`${input}${nonce}`).digest("hex");
  } while (!hash.startsWith(prefix));
  parentPort.postMessage(`input ${input} / nonce ${nonce} / hash: ${hash}`);
}
