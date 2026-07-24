import WebSocket from "ws";

// Polyfill global WebSocket immediately at import time for Node.js < 22 SSR
if (typeof globalThis.WebSocket === "undefined") {
  // @ts-expect-error polyfill
  globalThis.WebSocket = WebSocket;
}

export default defineNuxtPlugin(() => {});
