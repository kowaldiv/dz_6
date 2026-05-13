import fastify from "fastify";
import { Worker } from "worker_threads";

const app = fastify({ logger: true });

app.get("/", async () => {
  return { message: "Server is running" };
});

app.get("/health", async () => {
  const uptime = process.uptime();
  return { status: "ok", uptime: uptime };
});

app.get("/time", async () => {
  const now = new Date();
  return { iso: now.toISOString(), unoix: now.getTime() };
});

const startServer = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log("Сервер запущен на 3000 порту!");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  console.log("Закрываем сервер");
  await app.close();
  console.log("Сервер закрылся");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Закрываем сервер");
  await app.close();
  console.log("Сервер закрылся");
  process.exit(0);
});

startServer();
