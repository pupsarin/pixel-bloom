import index from './index.html';
import './main.css'
const server = Bun.serve({
    port: 3000,
    routes: {
        "/": index,
    }
});

console.log(`Listening on ${server.url}`);