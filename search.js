const bookList = document.getElementById('book-list');
const KAKAO_API_KEY = '0c2ce1b4aac851ebcca58d74a5ecd2d0';
const blacklistKeywords = ['수능특강', '마더텅', '기출', '완자', '자이스토리', '수능', '내신', '고등', '모의고사', '중등', '중학교'];

let page = 1;
let isLoading = false;
let isEnd = false;
let filterEnabled = true;
let currentQuery = '';

const form = document.getElementById('main-search-form');
const input = document.getElementById('main-query');
const filterButton = document.getElementById('filter-toggle');

form.addEventListener('submit', e => {
  e.preventDefault();
  currentQuery = input.value.trim();
  if (currentQuery) {
    bookList.innerHTML = '';
    page = 1;
    isEnd = false;
    loadMinimumBooks(currentQuery);
  }
});

filterButton.addEventListener('click', () => {
  filterEnabled = !filterEnabled;
  filterButton.textContent = `문제집 필터링 ${filterEnabled ? 'ON' : 'OFF'}`;
  if (currentQuery) {
    bookList.innerHTML = '';
    page = 1;
    isEnd = false;
    loadMinimumBooks(currentQuery);
  }
});

function searchBooks(query, pageNum) {
  return fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&page=${pageNum}&size=10`, {
    headers: {
      Authorization: `KakaoAK ${KAKAO_API_KEY}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const filtered = data.documents.filter(book => {
        const title = book.title || '';
        const contents = book.contents || '';

        // 검색어가 제목에 포함되어 있지 않으면 제외
        if (!title.includes(query)) return false;

        // 필터 꺼져있으면 그대로 통과
        if (!filterEnabled) return true;

        // 필터 켜져있을 때 문제집 키워드 포함되면 제외
        return !blacklistKeywords.some(keyword =>
          title.includes(keyword) || contents.includes(keyword)
        );
      });

      filtered.forEach(book => {
        const item = document.createElement('div');
        item.className = 'book-item';
        item.innerHTML = `
          <img src="${book.thumbnail || 'https://via.placeholder.com/100x140?text=No+Image'}" alt="썸네일">
          <div class="book-info">
            <div class="book-title">${book.title}</div>
            <div class="book-meta"><strong>저자:</strong> ${book.authors.join(', ') || '없음'}</div>
            <div class="book-meta"><strong>출판사:</strong> ${book.publisher || '없음'}</div>
          </div>
        `;
        bookList.appendChild(item);
      });

      return {
        total: data.documents.length,
        added: filtered.length
      };
    });
}

async function loadMinimumBooks(query) {
  let totalAdded = 0;
  while (totalAdded < 10 && !isEnd) {
    if (isLoading) break;
    isLoading = true;
    const { total, added } = await searchBooks(query, page);
    isLoading = false;

    if (total === 0) {
      isEnd = true;
      break;
    }

    totalAdded += added;
    page++;
  }
}

window.addEventListener('scroll', () => {
  if (isLoading || isEnd) return;

  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 100) {
    isLoading = true;
    searchBooks(currentQuery, page).then(({ total, added }) => {
      isLoading = false;
      if (total === 0) {
        isEnd = true;
      } else {
        page++;
      }
    });
  }
});