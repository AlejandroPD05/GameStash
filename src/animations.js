export function animateLootDrop(selector = '.game-card') {
  if (!window.gsap) return;

  window.gsap.from(selector, {
    opacity: 0,
    y: 70,
    scale: 0.8,
    rotationX: -20,
    duration: 0.55,
    stagger: 0.07,
    ease: 'back.out(1.5)',
    clearProps: 'transform'
  });
}

export function init3DTilt(selector = '.game-card') {
  const cards = document.querySelectorAll(selector);

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

      if (window.gsap) {
        window.gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.03,
          transformPerspective: 1000,
          duration: 0.25,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', `50%`);
      card.style.setProperty('--mouse-y', `50%`);

      if (window.gsap) {
        window.gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });
  });
}