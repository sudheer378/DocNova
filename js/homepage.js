/**
 * Homepage JavaScript
 * Handles homepage interactions and animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize upload area on homepage
  const uploadArea = document.getElementById('upload');
  const fileInput = document.getElementById('fileInput');
  
  if (uploadArea && fileInput) {
    UploadHandler.init(uploadArea, fileInput, (files) => {
      // Redirect to appropriate tool based on first file type
      const firstFile = files[0];
      if (firstFile) {
        if (firstFile.type === 'application/pdf') {
          window.location.href = '/tools/pdf/compress-pdf.html';
        } else if (firstFile.type.startsWith('image/')) {
          window.location.href = '/tools/image/compress-image.html';
        }
      }
    });
  }
  
  // Animate stats on scroll
  const statNumbers = document.querySelectorAll('.stat-number');
  const animateStats = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scale-in');
        animateStats.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach(stat => animateStats.observe(stat));
  
  // Tool cards hover effect enhancement
  const toolCards = document.querySelectorAll('.card-feature');
  toolCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
});
