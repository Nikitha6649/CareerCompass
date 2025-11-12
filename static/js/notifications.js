// Notifications Handler

document.addEventListener('DOMContentLoaded', function() {
  // Function to create and show a notification
  window.showNotification = function(options) {
    const defaults = {
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      closable: true
    };
    
    const settings = Object.assign({}, defaults, options);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${settings.type}`;
    
    // Create notification content
    let iconClass = 'fas fa-info-circle';
    if (settings.type === 'success') iconClass = 'fas fa-check-circle';
    if (settings.type === 'error') iconClass = 'fas fa-exclamation-circle';
    if (settings.type === 'warning') iconClass = 'fas fa-exclamation-triangle';
    
    let contentHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="notification-message">
    `;
    
    if (settings.title) {
      contentHTML += `<div class="notification-title">${settings.title}</div>`;
    }
    
    contentHTML += `
          <div class="notification-text">${settings.message}</div>
        </div>
      </div>
    `;
    
    if (settings.closable) {
      contentHTML += `
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      `;
    }
    
    contentHTML += `<div class="notification-progress"></div>`;
    
    notification.innerHTML = contentHTML;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Set up close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        closeNotification(notification);
      });
    }
    
    // Auto close after duration
    if (settings.duration > 0) {
      setTimeout(() => {
        closeNotification(notification);
      }, settings.duration);
    }
    
    return notification;
  };
  
  // Function to close a notification
  function closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
  
  // Process flash messages from Flask
  function processFlashMessages() {
    const flashContainer = document.getElementById('flash-messages');
    if (!flashContainer) return;
    
    const messages = flashContainer.querySelectorAll('.flash-message');
    messages.forEach((message, index) => {
      const type = message.dataset.type || 'info';
      const content = message.textContent.trim();
      
      // Delay each message slightly for a cascade effect
      setTimeout(() => {
        window.showNotification({
          type: type,
          message: content,
          duration: 5000 + (index * 500)
        });
      }, index * 300);
    });
    
    // Clear the container after processing
    flashContainer.innerHTML = '';
  }
  
  // Process flash messages on page load
  processFlashMessages();
});