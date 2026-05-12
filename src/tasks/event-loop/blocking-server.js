import fastify from "fastify";

fastify({ logger: true })
  .get("/fast", async () => {
    return { message: "i am fast" };
  })
  .get("/slow", async () => {
    const CHUNK_SIZE = 100000000; // чанк
    const TOTAL = 5000000000; // общее количество сколько надо выполнить раз
    let sum = 0; // сумма которую в конце отправим пользователю
    let current = 1; // текущая позиция на которой остановились

    return new Promise((resolve) => {
      function processChunk() { // функция которая обрабатывает один чанк
        const end = Math.min(current + CHUNK_SIZE, TOTAL + 1); // считаем сколько до конца

        for (let i = current; i < end; i++) { // просто проходимся по участку
          sum += i;
        }

        current = end; // ставим новое текущее состояние 

        if (current <= TOTAL) {
          setImmediate(processChunk); // отправляем нашу фукнцию в очередь МАКРОзадач
        } else {
          resolve({ result: sum }); // отправляем пользователю
        }
      }
      processChunk();
    });
  })
  .listen({ port: 3000 });


// Комментарий к коду:
// setImmediate() отправляет коллбек в очередь МАКРОзадач тем самым освобождая event loop