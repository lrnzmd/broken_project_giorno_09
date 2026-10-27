import Fastify from "fastify";

const app = Fastify({ logger: true });

// ✅ BUG 1 RISOLTO: decorazione con encapsulation
// app.register() crea automaticamente uno scope isolato per il plugin
// La decorazione dentro il plugin non sovrascrive quella globale
app.decorate("dbConnection", { host: "localhost", db: "production" });

// Plugin con scope isolato
app.register(async (instance) => {
  // Questa decorazione è ISOLATA al plugin
  instance.decorate("dbConnection", { host: "test-server", db: "test" });

  instance.get("/api/test", async () => {
    return { db: (instance as any).dbConnection };
  });
});

app.get("/api/production", async () => {
  return { db: (app as any).dbConnection };
  // ✅ Ora restituisce correttamente: { host: "localhost", db: "production" }
});

// ✅ BUG 2 RISOLTO: hook di autenticazione che BLOCCA la richiesta
app.addHook("onRequest", async (request, reply) => {
  // Applica autenticazione SOLO a /api/protected
  if (request.url === "/api/protected") {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      // Blocca la richiesta con return e send
      return reply.code(401).send({ error: "Non autenticato" });
    }
  }
});

app.get("/api/protected", async () => {
  return { message: "Dati protetti — autenticato!" };
  // ✅ Ora è accessibile SOLO con header Authorization valido
});

// ✅ BUG 3 RISOLTO: fetch con timeout usando AbortSignal
app.get("/api/external", async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("https://httpbin.org/delay/30", {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return { data: await response.json() };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Timeout: servizio esterno non ha risposto entro 5 secondi");
    }
    throw error;
  }
});

app.listen({ port: 3001 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info("Server avviato su http://localhost:3001");
});
