document.addEventListener('DOMContentLoaded', function () {
  // Toggle selection for pill options (allows single selection per group)
  const serviceOptions = document.querySelectorAll('input[name="service"]');
  const budgetOptions = document.querySelectorAll('input[name="budget"]');

  // Function to handle single selection
  function setupSingleSelectGroup(options) {
    options.forEach((option) => {
      option.addEventListener('change', function () {
        if (this.checked) {
          // Uncheck all other options in the same group
          options.forEach((opt) => {
            if (opt !== this) {
              opt.checked = false;
            }
          });
        }
      });
    });
  }

  setupSingleSelectGroup(serviceOptions);
  setupSingleSelectGroup(budgetOptions);

  // Form submission
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Get form data - keep your existing code here
      const formData = {
        service:
          Array.from(serviceOptions).find((opt) => opt.checked)?.value || '',
        budget:
          Array.from(budgetOptions).find((opt) => opt.checked)?.value || '',
        name: document.querySelector('input[type="text"]').value,
        email: document.querySelector('input[type="email"]').value,
        description: document.querySelector('textarea').value,
      };

      // Log data (replace with actual form submission)
      console.log('Form submitted:', formData);

      // Here you would typically send the data to your server
      // For now, just show success message
      alert('Thank you! Your submission has been received.');
      contactForm.reset();
    });
  }
});
