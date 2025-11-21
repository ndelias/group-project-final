/**
 * Submit form JavaScript - Form validation and handling
 */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('submit-form');
  const successMessage = document.getElementById('form-success');
  
  if (!form) return;
  
  // Get all form fields
  const requiredFields = form.querySelectorAll('[required]');
  const emailField = document.getElementById('submitter-email');
  
  // Real-time validation
  requiredFields.forEach(field => {
    field.addEventListener('blur', function() {
      validateField(this);
    });
    
    field.addEventListener('input', function() {
      // Clear error on input if field is now valid
      if (this.checkValidity()) {
        clearFieldError(this);
      }
    });
  });
  
  // Email validation
  if (emailField) {
    emailField.addEventListener('blur', function() {
      if (this.value && !this.checkValidity()) {
        showFieldError(this, 'Please enter a valid email address');
      } else {
        clearFieldError(this);
      }
    });
  }
  
  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate all required fields
    let isValid = true;
    requiredFields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    // Validate email if provided
    if (emailField && emailField.value && !emailField.checkValidity()) {
      showFieldError(emailField, 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!isValid) {
      // Focus first invalid field
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Form is valid - process submission
    handleFormSubmission(form);
  });
  
  // Form reset
  form.addEventListener('reset', function() {
    // Clear all errors
    const errorElements = form.querySelectorAll('.form-error');
    errorElements.forEach(error => {
      error.textContent = '';
      error.classList.remove('form-error--show');
    });
    
    // Hide success message
    if (successMessage) {
      successMessage.classList.add('hidden');
    }
  });
});

function validateField(field) {
  const errorElement = document.getElementById(`${field.id}-error`);
  
  if (!field.checkValidity()) {
    let errorMessage = '';
    
    if (field.validity.valueMissing) {
      errorMessage = 'This field is required';
    } else if (field.validity.typeMismatch) {
      errorMessage = 'Please enter a valid value';
    } else if (field.validity.tooShort) {
      errorMessage = `Please enter at least ${field.minLength} characters`;
    } else if (field.validity.tooLong) {
      errorMessage = `Please enter no more than ${field.maxLength} characters`;
    } else {
      errorMessage = 'Please check this field';
    }
    
    showFieldError(field, errorMessage);
    return false;
  } else {
    clearFieldError(field);
    return true;
  }
}

function showFieldError(field, message) {
  const errorElement = document.getElementById(`${field.id}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('form-error--show');
    field.setAttribute('aria-invalid', 'true');
  }
  
  // Add visual indicator to field
  field.classList.add('form-input--error');
}

function clearFieldError(field) {
  const errorElement = document.getElementById(`${field.id}-error`);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('form-error--show');
    field.removeAttribute('aria-invalid');
  }
  
  // Remove visual indicator
  field.classList.remove('form-input--error');
}

function handleFormSubmission(form) {
  const formData = new FormData(form);
  const data = {};
  
  // Convert FormData to object
  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      // Handle multiple values (like arrays)
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }
  
  // In a real application, you would send this data to a server
  // For now, we'll store it in localStorage and show success message
  console.log('Form submission data:', data);
  
  // Store submission (for demo purposes)
  const submissions = JSON.parse(localStorage.getItem('animal-submissions') || '[]');
  submissions.push({
    ...data,
    submittedAt: new Date().toISOString()
  });
  localStorage.setItem('animal-submissions', JSON.stringify(submissions));
  
  // Show success message
  const successMessage = document.getElementById('form-success');
  if (successMessage) {
    form.classList.add('hidden');
    successMessage.classList.remove('hidden');
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Focus on success message for screen readers
    successMessage.setAttribute('tabindex', '-1');
    successMessage.focus();
  }
  
  // Optional: Reset form after showing success
  // form.reset();
}

