import { parentPort, workerData } from "worker_threads";

const { limit } = workerData;
let sum = 0;

for (let i = 1; i < limit; i++) {
  sum += i;
}

parentPort.postMessage(sum);
