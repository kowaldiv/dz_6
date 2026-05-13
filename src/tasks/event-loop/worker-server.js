import fastify from "fastify";
import { Worker } from "worker_threads";

fastify({ logger: true })
  .get("/fast", async () => {
    return { message: "i am fast" };
  })
  .get("/slow", async () => {
    return new Promise((resolve, reject) => {
      const worker = new Worker("./src/tasks/event-loop/slow-worker.js", {
        workerData: { limit: 5000000000 },
      });

      worker.on("message", resolve);
      worker.on("error", reject)
    });
  })
  .listen({ port: 3000 });

// этот вариант намного лучше потому что у нас не прерывается основной поток.
// и сама функция тоже не прерывается и выполняется быстрее

// но надо с умом принимать такое решение и делать новый поток только 
// если операция реально сложная или долгая