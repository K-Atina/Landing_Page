// Google Books API handling

const BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

let currentPage = 0;
let isLoading = false;
let hasMore = true;

// Function to fetch books from Google Books API
async function fetchBooks(query = '', startIndex = 0) {
    try {
        const params = new URLSearchParams({
            q: query || 'subject:contemporary fiction',
            key: API_KEY,
            maxResults: 40,
            startIndex: startIndex,
            orderBy: 'relevance'
        });

        const response = await fetch(`${BOOKS_API_URL}?${params}`);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

// Function to display books in the grid
async function displayBooks(query = '', append = false) {
    if (isLoading || (!append && !hasMore)) return;
    
    isLoading = true;
    const bookGrid = document.querySelector('.Book-Grid');
    
    if (!append) {
        bookGrid.innerHTML = '';
        currentPage = 0;
        hasMore = true;
    }

    const books = await fetchBooks(query, currentPage * 20);
    if (books.length === 0) {
        hasMore = false;
        if (!append) {
            bookGrid.innerHTML = '<div class="no-results">No books found. Try a different search.</div>';
        }
        isLoading = false;
        return;
    }

    books.forEach((book) => {
        const volumeInfo = book.volumeInfo;
        const bookElement = document.createElement('div');
        
        const thumbnail = volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'placeholder-image.svg';
        const title = volumeInfo.title || 'Unknown Title';
        const authors = volumeInfo.authors?.join(', ') || 'Unknown Author';

        bookElement.innerHTML = `
            <img src="${thumbnail}" alt="${title} Cover" onerror="this.src='placeholder-image.svg'">
            <h3>${title}</h3>
            <p>${authors}</p>
        `;

        bookGrid.appendChild(bookElement);
    });

    currentPage++;
    isLoading = false;
}

// Handle scroll for infinite loading
function handleScroll() {
    const bookGrid = document.querySelector('.Book-Grid');
    if (bookGrid.scrollLeft + bookGrid.clientWidth >= bookGrid.scrollWidth - 300) {
        displayBooks(document.getElementById('query').value, true);
    }
}

// Handle search form submission
document.getElementById('Search').addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.getElementById('query').value;
    displayBooks(query);
});

// Add scroll event listener for infinite scrolling
document.querySelector('.Book-Grid').addEventListener('scroll', handleScroll);

// Load initial contemporary books when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayBooks();
});
