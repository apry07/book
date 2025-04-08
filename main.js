const form = document.getElementById('main-search-form');
const input = document.getElementById('main-query');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (query !== '') {
    window.location.href = `search.html?query=${encodeURIComponent(query)}`;
  }
});