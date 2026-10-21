
const form = document.getElementById("registration-form");
const submitBtn = document.getElementById("submit-btn");
const btnLabel = submitBtn.querySelector(".btn__label");
const messageBox = document.getElementById("form-message");


const fields = {
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  department: document.getElementById("department"),
  phone: document.getElementById("phone"),
  gender: document.getElementById("gender"),
  birthday: document.getElementById("birthday"),
};


const NIGERIAN_PHONE_PATTERN = /^(?:\+234|0)[789][01]\d{8}$/;

// Earliest birth date we accept (stops typing mistakes like year 0020).
const EARLIEST_BIRTH_DATE = "1940-01-01";

// ----------------------------------------------------------
// 3. HELPER FUNCTIONS
// ----------------------------------------------------------

// Today's date as "YYYY-MM-DD" using the user's own time zone.
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Show an error under a field and mark it as invalid.
function showError(input, message) {
  const errorEl = document.getElementById(`${input.id}-error`);
  errorEl.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

// Remove the error from a field.
function clearError(input) {
  const errorEl = document.getElementById(`${input.id}-error`);
  errorEl.textContent = "";
  input.removeAttribute("aria-invalid");
}

// Show the banner at the top of the form ("success" or "error").
function showMessage(type, text) {
  messageBox.textContent = text;
  messageBox.className = `form-message form-message--${type}`;
  messageBox.hidden = false;
  messageBox.focus(); // moves focus so screen readers announce it
}

function hideMessage() {
  messageBox.hidden = true;
  messageBox.textContent = "";
}

// ----------------------------------------------------------
// 4. VALIDATION RULES
// Each function returns an error message, or "" when the value is fine.
// ----------------------------------------------------------
function validateName(value, label) {
  const name = value.trim();
  if (name === "") return `Please enter your ${label}.`;
  if (name.length < 2) return `Your ${label} must have at least 2 letters.`;
  // Letters (including accents), spaces, hyphens and apostrophes only.
  if (!/^[\p{L}][\p{L}\s'-]*$/u.test(name)) {
    return `Your ${label} can only contain letters, spaces, hyphens and apostrophes.`;
  }
  return "";
}

function validateSelect(value, label) {
  return value === "" ? `Please select your ${label}.` : "";
}

function validatePhone(value) {
  // Remove spaces and dashes so "0801 234 5678" still works.
  const cleaned = value.replace(/[\s-]/g, "");
  if (cleaned === "") return "Please enter your phone number.";
  if (!NIGERIAN_PHONE_PATTERN.test(cleaned)) {
    return "Enter a valid Nigerian number, like 08012345678 or +2348012345678.";
  }
  return "";
}

function validateBirthday(value) {
  if (value === "") return "Please select your date of birth.";
  // "YYYY-MM-DD" strings can be compared directly as text.
  if (value > getTodayString()) return "Your birthday cannot be in the future.";
  if (value < EARLIEST_BIRTH_DATE) return "Please enter a valid year of birth.";
  return "";
}

// Check one field by its name and return the error message.
function getErrorFor(fieldName) {
  const value = fields[fieldName].value;
  switch (fieldName) {
    case "firstName":  return validateName(value, "first name");
    case "lastName":   return validateName(value, "last name");
    case "department": return validateSelect(value, "department");
    case "phone":      return validatePhone(value);
    case "gender":     return validateSelect(value, "gender");
    case "birthday":   return validateBirthday(value);
    default:           return "";
  }
}

// Check one field and update the screen. Returns true if the field is valid.
function validateField(fieldName) {
  const input = fields[fieldName];
  const error = getErrorFor(fieldName);
  if (error) {
    showError(input, error);
    return false;
  }
  clearError(input);
  return true;
}

// Check every field. Focus the first invalid one so the user knows where to fix.
function validateForm() {
  let firstInvalid = null;

  for (const fieldName of Object.keys(fields)) {
    const isValid = validateField(fieldName);
    if (!isValid && firstInvalid === null) {
      firstInvalid = fields[fieldName];
    }
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }
  return true;
}

// ----------------------------------------------------------
// 5. LOADING STATE (stops double submissions)
// ----------------------------------------------------------
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("is-loading", isLoading);
  submitBtn.setAttribute("aria-busy", String(isLoading));
  btnLabel.textContent = isLoading ? "Checking your details..." : "Register My Birthday";
}

// ----------------------------------------------------------
// 6. SUBMITTING THE FORM
// ----------------------------------------------------------
form.addEventListener("submit", function (event) {
  // Stop the browser from reloading the page.
  event.preventDefault();

  // Ignore extra clicks while we are already working.
  if (submitBtn.disabled) return;

  hideMessage();

  // Stop here if anything is wrong. Error messages are already on screen.
  if (!validateForm()) {
    showMessage("error", "Please fix the highlighted fields and try again.");
    return;
  }

  setLoading(true);

  // Collect the details. We keep the full date, including the year.
  const registration = {
    firstName: fields.firstName.value.trim(),
    lastName: fields.lastName.value.trim(),
    department: fields.department.value,
    phone: fields.phone.value.replace(/[\s-]/g, ""),
    gender: fields.gender.value,
    birthday: fields.birthday.value, // "YYYY-MM-DD"
  };

  // ------------------------------------------------------
  // WHERE A REAL BACKEND WOULD GO LATER
  // Right now there is NO server or database, so nothing is stored.
  // Later you would replace the setTimeout below with something like:
  //
  //   const response = await fetch("https://your-api.com/registrations", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(registration),
  //   });
  //   if (!response.ok) { /* show an error and stop */ }
  //
  // The short wait below only simulates a request so you can see the loading state.
  // ------------------------------------------------------
  setTimeout(function () {
    console.log("Validated registration (not saved anywhere):", registration);

    showMessage(
      "success",
      `Thank you, ${registration.firstName}! Your details passed all checks. ` +
        "This demo does not store them yet, because no backend or database is connected."
    );

    // Reset the form only after success.
    form.reset();
    for (const input of Object.values(fields)) clearError(input);

    setLoading(false);
  }, 900);
});

// ----------------------------------------------------------
// 7. HELP THE USER WHILE THEY FILL IN THE FORM
// ----------------------------------------------------------

// Block future dates in the calendar picker itself.
fields.birthday.max = getTodayString();
fields.birthday.min = EARLIEST_BIRTH_DATE;

// Check a field when the user leaves it, and re-check as they fix it.
for (const fieldName of Object.keys(fields)) {
  const input = fields[fieldName];

  input.addEventListener("blur", function () {
    validateField(fieldName);
  });

  const fixEvent = input.tagName === "SELECT" ? "change" : "input";
  input.addEventListener(fixEvent, function () {
    // Only re-check fields that already show an error.
    if (input.getAttribute("aria-invalid") === "true") {
      validateField(fieldName);
    }
  });
}

// ----------------------------------------------------------
// 8. PRIVACY NOTE FOR A FUTURE PUBLIC BIRTHDAY LIST
// If you ever show a public list, display only day and month
// (for example "14 March") and never the year of birth.
// ----------------------------------------------------------