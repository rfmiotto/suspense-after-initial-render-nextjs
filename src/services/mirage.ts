import { createServer, Response } from "miragejs";
import Chance from "chance";

const chance = new Chance(123);
const titles = [
  "Four-dollar toast",
  "Brooklyn health umami af",
  "Portland pop-up 3 moon schlitz",
  "Goth air plant prism",
  "Retro mumblecore roof party",
  "Raclette aesthetic",
  "Tofu put a bird on it yuccie polaroid",
  "8-bit XOXO hammock glossier flannel",
  "Subway flannel mustache",
  "Bicycle rights before they sold out raw denim",
];
const messages = [...Array(10).keys()].map((_, i) => ({
  id: i + 1,
  title: titles[i],
  body: [...Array(chance.integer({ min: 1, max: 5 })).keys()]
    .map(() => chance.paragraph())
    .join("\n"),
}));

function makeServer({ environment = "test" } = {}) {
  const server = createServer({
    environment,

    routes() {
      this.get(
        "/api/messages",
        () => {
          return {
            messages,
          };
          // return new Response(500);
        },
        { timing: 650 }
      );

      this.get(
        "/api/messages/:id",
        (schema, request) => {
          return { message: messages.find((m) => m.id === +request.params.id) };
        },
        { timing: 1100 }
      );

      this.namespace = "";
      this.passthrough();
    },
  });

  // Don't log passthrough
  if (server.pretender !== undefined) {
    server.pretender.passthroughRequest = () => {};
    server.logging = false;
  }

  return server;
}

// include server property on Window instance
declare const window: Window &
  typeof globalThis & {
    server: any;
  };

const isClient = typeof window !== "undefined";
if (isClient && process.env.NODE_ENV === "development") {
  if (!window.server) {
    window.server = makeServer({ environment: "development" });
  }
}
