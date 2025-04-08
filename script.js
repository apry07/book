const form = document.getElementById('search-form');
const input = document.getElementById('query');
const bookList = document.getElementById('book-list');

const KAKAO_API_KEY = '0c2ce1b4aac851ebcca58d74a5ecd2d0'; // 네 키로 바꿔줘
const blacklistKeywords = ['수능특강', '마더텅', '기출', '완자', '자이스토리', '수능', '내신'];

let page = 1;
let isLoading = false;
let currentQuery = '';

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (query !== '') {
    currentQuery = query;
    page = 1;
    bookList.innerHTML = '';
    searchBooks(query, page);
  }
});

function searchBooks(query, pageNum) {
  if (isLoading) return;
  isLoading = true;

  const url = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&page=${pageNum}&size=10`;

  fetch(url, {
    headers: {
      Authorization: `KakaoAK ${KAKAO_API_KEY}`
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.documents.length === 0 && pageNum === 1) {
        bookList.innerHTML = '<p>검색 결과가 없습니다.</p>';
        return;
      }

      const filteredBooks = data.documents.filter(book => {
        const title = book.title || '';
        const contents = book.contents || '';
        return !blacklistKeywords.some(keyword =>
          title.includes(keyword) || contents.includes(keyword)
        );
      });

      if (filteredBooks.length === 0 && pageNum === 1) {
        bookList.innerHTML = '<p>관련 도서가 모두 필터링되어 표시할 수 없습니다.</p>';
        return;
      }

      filteredBooks.forEach(book => {
        const item = document.createElement('div');
        item.className = 'book-item';
        item.innerHTML = `
          <h3>${book.title}</h3>
          <p><strong>저자:</strong> ${book.authors.join(', ') || '없음'}</p>
          <p><strong>출판사:</strong> ${book.publisher || '없음'}</p>
        `;
        bookList.appendChild(item);
      });
    })
    .catch(error => {
      console.error('책 검색 오류:', error);
    })
    .finally(() => {
      isLoading = false;
    });
}

// 무한 스크롤 감지
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 100) {
    page++;
    searchBooks(currentQuery, page);
  }
});