// Forgot Password page functionality
const form = document.getElementById('forgotForm');
const emailInput = document.getElementById('email');
const sendButton = document.getElementById('sendButton');
const statusMessage = document.getElementById('statusMessage');

// Standard email validation pattern
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

form.addEventListener('submit', function (event) {
  event.preventDefault();
  resetStatus();

  const emailValue = emailInput.value.trim();
  const validationError = validateEmail(emailValue);

  if (validationError) {
    showError(validationError);
    return;
  }

  startLoading();

  // Simulate async processing before showing success
  setTimeout(() => {
    stopLoading();
    showSuccess(`Password reset link has been sent to ${emailValue}`);
    form.reset();
  }, 2000);
});

function validateEmail(value) {
  if (!value) {
    return 'Please enter your email address.';
  }

  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address.';
  }

  return '';
}

function startLoading() {
  sendButton.classList.add('loading');
  sendButton.disabled = true;
  statusMessage.textContent = 'Preparing secure reset link...';
  statusMessage.className = 'status-message';
}

function stopLoading() {
  sendButton.classList.remove('loading');
  sendButton.disabled = false;
}

function showError(message) {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message error';
}

function showSuccess(message) {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message success';
}

function resetStatus() {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
}

// Allow quick feedback when user returns to input after error
emailInput.addEventListener('input', () => {
  if (statusMessage.classList.contains('error')) {
    resetStatus();
  }
});
