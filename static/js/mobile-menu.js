// Mobile Menu Functionality

document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const closeMenu = document.getElementById('closeMenu');
  const navMenu = document.getElementById('navMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  
  // Toggle menu when hamburger icon is clicked
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      navMenu.classList.add('active');
      menuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    });
  }
  
  // Close menu when X button is clicked
  if (closeMenu) {
    closeMenu.addEventListener('click', closeNavMenu);
  }
  
  // Close menu when overlay is clicked
  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeNavMenu);
  }
  
  // Close menu when escape key is pressed
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeNavMenu();
    }
  });
  
  // Close menu when a nav link is clicked
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Only close the menu on mobile
      if (window.innerWidth <= 768) {
        closeNavMenu();
      }
    });
  });
  
  // Function to close the navigation menu
  function closeNavMenu() {
    navMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
      closeNavMenu();
    }
  });
});