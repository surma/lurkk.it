import App from "./components/app/app.html";

new App({
  target: document.body,
  data: {
    name: "world",
    hydrate: true
  }
});
