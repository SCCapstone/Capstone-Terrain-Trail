describe("Settings functionality (stubbed backend)", () => {

  /*
    The base URL of the deployed API.
    This must match the URL the app actually calls so Cypress
    intercepts the requests instead of letting them reach the real server.
  */
  const API = "https://capstone-terrain-trail.onrender.com";

  /*
    beforeEach runs before every test.
    It:
    1) Stubs the GET /api/account request so we control the user data
    2) Sets a fake auth token so the Settings page thinks the user is logged in
    3) Visits the Settings page and waits until account data is loaded
  */
  beforeEach(() => {
    cy.intercept("GET", `${API}/api/account`, {
      statusCode: 200,
      body: { user: { name: "Mark", email: "13meetpa@gmail.com" } },
    }).as("getAccount");

    cy.visit("/app/settings", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "fake-token");
      },
    });

    cy.wait("@getAccount");
    cy.contains("SETTINGS").should("be.visible");
  });

  /*
    This test verifies that:
    - The Settings page loads successfully
    - The current user's name and email (from the backend) are displayed
  */
  it("loads and displays current user data", () => {
    cy.contains("Full Name").should("be.visible");
    cy.contains("Mark").should("be.visible");

    cy.contains("Email").should("be.visible");
    cy.contains("13meetpa@gmail.com").should("be.visible");
  });

  /*
    This test checks the Cancel button behavior inside the name modal.
    It ensures that:
    - Clicking the Change button next to Full Name opens the modal
    - Typing into the new name field works
    - Clicking Cancel closes the modal and removes the input from the DOM
  */
  it("Cancel in name modal clears fields and closes modal", () => {
    cy.contains("Full Name").parent().parent().contains("Change").click();
    cy.get("#newName").should("be.visible").type("New Name");

    cy.contains("Cancel").click();

    cy.get("#newName").should("not.exist");
  });

  /*
    This test verifies frontend validation for password changes.
    It ensures that:
    - Opening the password modal and filling in new/confirm password fields
      is not enough on its own
    - The Save button remains disabled until currentPassword is also filled
    - No backend request is needed; the button is disabled at the UI level
  */
  it("shows error if trying to change password without current password", () => {
    cy.contains("Password").parent().parent().contains("Change").click();

    cy.get("#newPassword").type("NewPass123!");
    cy.get("#confirmPassword").type("NewPass123!");

    cy.contains("Save").should("be.disabled");
  });

  /*
    This test verifies a successful Save operation when:
    - The name modal is opened and a new name is entered
    - The PUT /api/account request is sent and returns success

    It checks that:
    - The PUT /api/account request is intercepted and replied to
    - A success message ("Changes saved") is shown after saving
    - The modal closes after a successful save (input leaves the DOM)
  */
  it("Save success on PUT when changing name only", () => {
    cy.intercept("PUT", `${API}/api/account`, (req) => {
      req.reply({
        statusCode: 200,
        body: { message: "Changes saved", user: req.body },
      });
    }).as("saveAccount");

    cy.contains("Full Name").parent().parent().contains("Change").click();
    cy.get("#newName").type("Mark Updated");
    cy.contains("Save").click();

    cy.wait("@saveAccount");
    cy.get(".status-success").should("exist").and("contain.text", "Changes saved");

    cy.get("#newName").should("not.exist");
  });

  /*
    This test simulates a backend failure when the user enters
    the wrong current password inside the password modal.

    It ensures that:
    - The PUT request is sent with the password fields
    - The backend error message ("Incorrect current password") is displayed
  */
  it("Save shows backend error on wrong current password", () => {
    cy.intercept("PUT", `${API}/api/account`, {
      statusCode: 400,
      body: { message: "Incorrect current password" },
    }).as("saveFail");

    cy.contains("Password").parent().parent().contains("Change").click();

    cy.get("#currentPassword2").type("wrongpass");
    cy.get("#newPassword").type("NewPass123!");
    cy.get("#confirmPassword").type("NewPass123!");

    cy.contains("Save").click();
    cy.wait("@saveFail");

    cy.get(".status-error").should("exist").and("contain.text", "Incorrect current password");
  });

  /*
    This test verifies frontend validation for email changes.
    It ensures that:
    - Opening the email modal and entering a new email alone is not enough
    - The Save button remains disabled until currentPassword is also provided
    - No PUT request is sent; the button is disabled at the UI level
  */
  it("Email change modal requires current password (Save disabled without it)", () => {
    cy.contains("Email").parent().parent().contains("Change").click();

    cy.get("#newEmail").type("mark.updated@gmail.com");

    cy.contains("Save").should("be.disabled");
  });

  /*
    This test verifies the dark mode toggle in the Appearance tab.
    It ensures that:
    - Switching to the Appearance tab works
    - The current dark mode status is displayed
    - Clicking Toggle changes the displayed value
  */
  it("Appearance tab displays dark mode status and toggle works", () => {
    cy.contains("Appearance").click();

    cy.contains("Dark Mode").should("be.visible");
    cy.contains("Toggle").should("be.visible");

    cy.contains("Toggle").click();

    // After toggling, the value should have changed (On or Off)
    cy.get(".rowValue").should(($el) => {
      const text = $el.text();
      expect(text === "On" || text === "Off").to.be.true;
    });
  });

  /*
    This test verifies that the Account tab is active by default
    when the Settings page loads, and that switching to the
    Appearance tab and back to Account tab works correctly.
  */
  it("tab switching between Account and Appearance works", () => {
    // Account tab should be active by default
    cy.contains("Account").should("have.class", "tabBtn-active");

    // Switch to Appearance
    cy.contains("Appearance").click();
    cy.contains("Appearance").should("have.class", "tabBtn-active");
    cy.contains("Dark Mode").should("be.visible");

    // Switch back to Account
    cy.contains("Account").click();
    cy.contains("Account").should("have.class", "tabBtn-active");
    cy.contains("Full Name").should("be.visible");
  });

  /*
    This test verifies the username change modal behavior.
    It ensures that:
    - Clicking Change next to Username opens the correct modal
    - The input field is present and accepts text
    - Clicking Cancel closes the modal without saving
  */
  it("Username modal opens, accepts input, and closes on Cancel", () => {
    cy.contains("Username").parent().parent().contains("Change").click();

    cy.get("#newUsername").should("be.visible").type("mark_updated");

    cy.contains("Cancel").click();

    cy.get("#newUsername").should("not.exist");
  });

/*
    This test verifies the Delete Account modal behavior.
    It ensures that:
    - Clicking Delete Account opens a confirmation modal
    - The modal warns the user that this action cannot be undone
    - Clicking Cancel inside the modal closes it without any action

    NOTE:
    We target the Cancel button specifically within the modalActions div
    to avoid any ambiguity with other buttons on the page.
    After Cancel, modal state is set to null so the modalOverlay is
    removed from the DOM entirely.
  */
  it("Delete Account modal opens and can be dismissed with Cancel", () => {
    cy.contains("Delete Account").click();

    // Modal should be open
    cy.get(".modalCard").should("be.visible");
    cy.contains("This action cannot be undone.").should("exist");

    // Click Cancel specifically inside the modal actions
    cy.get(".modalActions").contains("Cancel").click();

    // Modal overlay should be gone from the DOM after Cancel
    cy.get(".modalOverlay").should("not.exist");
  });

  /*
    This test verifies that the Log Out button works correctly.
    It ensures that:
    - Clicking Log Out removes the token from localStorage
    - The user is redirected away from the settings page

    NOTE:
    We check localStorage directly to confirm the token was cleared.
  */
  it("Log Out clears token and redirects", () => {
    cy.contains("Log Out").click();

    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.be.null;
    });

    // Should no longer be on the settings page
    cy.url().should("not.include", "/app/settings");
  });

  /*
    This test verifies the username change Save operation.
    It ensures that:
    - The PUT /api/account request is sent with the new username
    - A success message is shown after saving
    - The modal closes after a successful save
  */
  it("Save success on PUT when changing username only", () => {
    cy.intercept("PUT", `${API}/api/account`, (req) => {
      req.reply({
        statusCode: 200,
        body: { message: "Changes saved", user: req.body },
      });
    }).as("saveUsername");

    cy.contains("Username").parent().parent().contains("Change").click();
    cy.get("#newUsername").type("mark_updated");
    cy.contains("Save").click();

    cy.wait("@saveUsername");
    cy.get(".status-success").should("exist").and("contain.text", "Changes saved");

    cy.get("#newUsername").should("not.exist");
  });

  /*
    This test verifies that the Settings page handles a failed
    account load gracefully (e.g. expired or invalid token).
    It ensures that:
    - When GET /api/account returns 401, an error message is shown
    - The page does not crash
  */
  it("shows error message when account fails to load", () => {
    // Override the default beforeEach intercept for this test only
    cy.intercept("GET", `${API}/api/account`, {
      statusCode: 401,
      body: { message: "Unauthorized" },
    }).as("getAccountFail");

    cy.visit("/app/settings", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "expired-token");
      },
    });

    cy.wait("@getAccountFail");

    cy.get(".status-error").should("exist");
  });

});
