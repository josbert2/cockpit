import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"reverb">;
  }
}

let echoInstance: Echo<"reverb"> | null = null;

export function getEcho(): Echo<"reverb"> {
  if (echoInstance) return echoInstance;
  if (typeof window === "undefined") {
    throw new Error("Echo only available in browser");
  }

  window.Pusher = Pusher;

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_KEY ?? "",
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "127.0.0.1",
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8085),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8085),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
  });

  window.Echo = echoInstance;
  return echoInstance;
}
