// describe("Settings Page Behavior Test", () => {
//   beforeEach(() => {
//     cy.intercept("GET", "/api/account", {
//       statusCode: 200,
//       body: {
//         name: "Mark",
//         email: "13meetpa@gmail.com"
//       }
//     }).as("getAccount");

//     window.localStorage.setItem("token", "test-token");

//     cy.visit("/app/settings");
//   });

//   it("loads the settings page and shows user info", () => {
//     cy.wait("@getAccount");

//     cy.contains("Account Settings").should("be.visible");

//     cy.contains("Full Name").should("be.visible");
//     cy.contains("Email").should("be.visible");

//     cy.contains("Change Password").should("be.visible");
//     cy.contains("Current Password").should("be.visible");
//     cy.contains("New Password").should("be.visible");
//     cy.contains("Confirm New Password").should("be.visible");

//     cy.contains("Save").should("be.enabled");
//     cy.contains("Cancel").should("be.visible");

//   });
// });

describe("Settings functionality (stubbed backend)", () => {

  beforeEach(() => {
    // Set token before app code runs
    cy.window().then((win) => {
      win.localStorage.setItem("token", "fake-token");
    });

    // Intercept GET account (matches http://localhost:4000/api/account OR /api/account)
    cy.intercept("GET", "**/api/account", {
      statusCode: 200,
      body: { user: { name: "Mark", email: "13meetpa@gmail.com" } },
    }).as("getAccount");

    cy.visit("/app/settings");
    cy.wait("@getAccount");
  });

  it("loads and displays current user data", () => {
    cy.contains("Account Settings").should("be.visible");
    cy.get('input[name="name"]').should("have.value", "Mark");
    cy.get('input[name="email"]').should("have.value", "13meetpa@gmail.com");
  });

  it("Cancel reverts changes and shows info message", () => {
    cy.get('input[name="name"]').clear().type("New Name");
    cy.get('input[name="email"]').clear().type("new@email.com");

    cy.contains("Cancel").click();

    cy.contains("Changes discarded.").should("be.visible");
    cy.get('input[name="name"]').should("have.value", "Mark");
    cy.get('input[name="email"]').should("have.value", "13meetpa@gmail.com");
  });

  it("shows error if trying to change password without current password", () => {
    cy.get('input[name="newPassword"]').type("NewPass123!");
    cy.get('input[name="confirmPassword"]').type("NewPass123!");

    cy.contains("Save").click();

    cy.contains("Please enter your current password to change it.").should("be.visible");
  });

  it("Save shows success on a successful PUT and clears password fields", () => {
    // IMPORTANT: match PUT with wildcard, not https://localhost...
    cy.intercept("PUT", "**/api/account", (req) => {
      expect(req.body).to.include.keys("name", "email");

      req.reply({
        statusCode: 200,
        body: {
          message: "Changes saved",
          user: { name: req.body.name, email: req.body.email },
        },
      });
    }).as("saveAccount");

    cy.get('input[name="name"]').clear().type("Mark Updated");
    cy.get('input[name="email"]').clear().type("mark.updated@gmail.com");

    // Your frontend requires currentPassword if any password fields are used.
    // This test is only changing name/email, so it should send PUT without needing it.

    cy.contains("Save").click();
    cy.wait("@saveAccount");

    cy.contains("Changes saved.").should("be.visible");

    // Password fields should be cleared on success
    cy.get('input[name="currentPassword"]').should("have.value", "");
    cy.get('input[name="newPassword"]').should("have.value", "");
    cy.get('input[name="confirmPassword"]').should("have.value", "");
  });

  it("displays backend error message on failed PUT (wrong current password)", () => {
    cy.intercept("PUT", "**/api/account", {
      statusCode: 400,
      body: { message: "Incorrect current password" },
    }).as("saveFail");

    cy.get('input[name="currentPassword"]').type("wrongpass");
    cy.get('input[name="newPassword"]').type("NewPass123!");
    cy.get('input[name="confirmPassword"]').type("NewPass123!");

    cy.contains("Save").click();
    cy.wait("@saveFail");

    cy.contains("Incorrect current password").should("be.visible");
  });
});
