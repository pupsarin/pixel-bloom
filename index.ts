import index from "./index.html";
import playground from "./playground.html";

const server = Bun.serve({
    port: 3000,
    routes: {
        "/": index,
        "/playground": playground,
    },
});

console.log(`Listening on ${server.url}`);
