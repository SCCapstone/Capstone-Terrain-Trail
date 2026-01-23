describe("Settings functionality (stubbed backend)", () => {

  /*
    beforeEach runs before every test.
    It:
    1) Stubs the GET /api/account request so we control the user data
    2) Sets a fake auth token so the Settings page thinks the user is logged in
    3) Visits the Settings page and waits until account data is loaded
  */
  beforeEach(() => {
    cy.intercept("GET", "**/api/account", {
      statusCode: 200,
      body: { user: { name: "Mark", email: "13meetpa@gmail.com" } },
    }).as("getAccount");

    cy.visit("/app/settings", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token");
      },
    });

    cy.wait("@getAccount");
    cy.contains("Account Settings").should("be.visible");
  });

  /*
    This test verifies that:
    - The Settings page loads successfully
    - The current user's name and email (from the backend) are displayed
    - The editable "new" fields start empty

    NOTE:
    Current name/email are displayed as text (DIVs), not inputs.
  */
  it("loads and displays current user data", () => {
    cy.contains("Current Full Name").should("be.visible");
    cy.contains("Mark").should("be.visible");

    cy.contains("Current Email").should("be.visible");
    cy.contains("13meetpa@gmail.com").should("be.visible");

    cy.get("#newName").should("have.value", "");
    cy.get("#newEmail").should("have.value", "");
  });

  /*
    This test checks the Cancel button behavior.
    It ensures that:
    - Typing into the new name/email fields works
    - Clicking Cancel clears those fields
    - An informational message ("Changes discarded.") is shown
  */
  it("Cancel clears new fields and shows info message", () => {
    cy.get("#newName").type("New Name");
    cy.get("#newEmail").type("new@email.com");

    cy.contains("Cancel").click();

    cy.contains("Changes discarded.").should("be.visible");
    cy.get("#newName").should("have.value", "");
    cy.get("#newEmail").should("have.value", "");
  });

  /*
    This test verifies frontend validation for password changes.
    It ensures that:
    - A user cannot change their password without entering
      their current password
    - No backend request is needed; the error is shown immediately
  */
  it("shows error if trying to change password without current password", () => {
    cy.get("#newPassword").type("NewPass123!");
    cy.get("#confirmPassword").type("NewPass123!");

    cy.contains("Save").click();

    cy.contains("Please enter your current password to change it.")
      .should("be.visible");
  });

  /*
    This test verifies a successful Save operation when:
    - Only the user's name is changed
    - No password or email change is attempted

    It checks that:
    - The PUT /api/account request is sent
    - A success message is shown
    - All editable fields are cleared after saving
  */
  it("Save success on PUT when changing NAME only", () => {
    cy.intercept("PUT", "**/api/account", (req) => {
      expect(req.body).to.have.property("name");
      expect(req.body).to.have.property("email");

      req.reply({
        statusCode: 200,
        body: { message: "Changes saved", user: req.body },
      });
    }).as("saveAccount");

    cy.get("#newName").type("Mark Updated");
    cy.contains("Save").click();

    cy.wait("@saveAccount");
    cy.contains("Changes saved.").should("be.visible");

    cy.get("#newName").should("have.value", "");
    cy.get("#newEmail").should("have.value", "");
    cy.get("#currentPassword").should("have.value", "");
    cy.get("#newPassword").should("have.value", "");
    cy.get("#confirmPassword").should("have.value", "");
  });

  /*
    This test simulates a backend failure when the user enters
    the wrong current password.

    It ensures that:
    - The PUT request is sent
    - The backend error message is displayed to the user
  */
  it("Save shows backend error message on failed PUT (wrong current password)", () => {
    cy.intercept("PUT", "**/api/account", {
      statusCode: 400,
      body: { message: "Incorrect current password" },
    }).as("saveFail");

    cy.get("#currentPassword").type("wrongpass");
    cy.get("#newPassword").type("NewPass123!");
    cy.get("#confirmPassword").type("NewPass123!");

    cy.contains("Save").click();

    cy.wait("@saveFail");
    cy.contains("Incorrect current password").should("be.visible");
  });

  /*
    This test verifies frontend validation for email changes.
    It ensures that:
    - Changing the email without a current password is blocked
    - No PUT request is sent
    - A clear validation error is shown to the user
  */
  it("Email change requires current password (frontend validation)", () => {
    cy.get("#newEmail").type("mark.updated@gmail.com");
    cy.contains("Save").click();

    cy.contains("Please enter your current password to change your email.")
      .should("be.visible");
  });
});
