import App from "../src/components/app/app.html";

const functions = require("firebase-functions");

export const test = functions.https.onRequest((req, res) => {
  const render = App.render({ name: "SSR" });
  res.send(`
    <!doctype html>
    <head>
      ${render.head}
      <style>
        ${render.css.code}
      </style>
    </head>
    <body>
      ${render.html}
      <script src="bootstrap.js"></script>
    </body>
  `);
});
