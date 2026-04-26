const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: ["src/tests/**/*.cy.js", "tests/**/*.cy.js"],
    supportFile: false
  }
});
