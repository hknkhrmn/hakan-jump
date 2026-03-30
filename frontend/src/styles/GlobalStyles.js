export const injectGlobalStyles = () => {
  if (document.getElementById('hj-css')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'hj-css';
  s.textContent = `
    /* Buraya App.jsx içindeki tüm CSS içeriğini (s.textContent kısmını) yapıştır */
    .hj-root { ... }
    .hj-photo-frame { ... }
    /* ... vb ... */
  `;
  document.head.appendChild(s);
};