import index from './index.html';
import gallery from './gallery.html';
import './main.css'
const server = Bun.serve({
    port: 3000,
    routes: {
        "/": index,
        "/gallery": gallery,
    }
});

console.log(`Listening on ${server.url}`);