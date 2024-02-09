// Importuri
import axios from "axios";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

// Setarea cheii de acces la API
const API_KEY = "42285080-c22d5f6a90f49c0ab863c2d8a"; // Înlocuiți cu cheia dvs. unică de acces

// Funcție pentru căutarea imaginilor pe baza unui cuvânt cheie
async function searchImages(query, page = 1) {
  try {
    const response = await axios.get("https://pixabay.com/api/", {
      params: {
        key: API_KEY,
        q: query,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        page: page,
        per_page: 40, // 40 de imagini pe pagină
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Eroare la căutarea imaginilor.");
  }
}

// Funcție pentru afișarea notificării cu numărul total de imagini găsite
function showTotalImagesFound(totalHits) {
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}

// Funcție pentru afișarea notificării la sfârșitul rezultatelor de căutare
function showEndOfSearchResults() {
  Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
}

// Funcție pentru gestionarea afișării cardurilor de imagini în galerie
function displayImages(images) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; // Șterge conținutul galeriei anterioare

  images.forEach(image => {
    const photoCard = document.createElement("div");
    photoCard.classList.add("photo-card");
    photoCard.innerHTML = `
      <a href="${image.largeImageURL}" data-lightbox="image">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy">
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    `;
    gallery.appendChild(photoCard);
  });

  // Actualizarea galeriei cu ajutorul SimpleLightbox
  const lightbox = new SimpleLightbox(".gallery a", {});
  lightbox.refresh();
}

// Funcție pentru gestionarea căutării și afișării imaginilor
async function handleSearch(event) {
  event.preventDefault();
  const searchQuery = event.target.searchQuery.value.trim();
  if (searchQuery === "") {
    Notiflix.Notify.failure("Please enter a search query.");
    return;
  }

  try {
    Notiflix.Loading.standard("Searching for images...");
    const searchData = await searchImages(searchQuery);
    if (searchData.hits.length === 0) {
      showEndOfSearchResults();
    } else {
      displayImages(searchData.hits);
      showTotalImagesFound(searchData.totalHits);
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  } finally {
    Notiflix.Loading.remove();
  }
}

// Funcție pentru gestionarea încărcării suplimentare a imaginilor
async function handleLoadMore(event) {
  event.preventDefault();
  const searchQuery = document.getElementById("searchQuery").value.trim();
  const currentPage = parseInt(event.target.dataset.page);
  const nextPage = currentPage + 1;

  try {
    Notiflix.Loading.standard("Loading more images...");
    const searchData = await searchImages(searchQuery, nextPage);
    if (searchData.hits.length === 0) {
      showEndOfSearchResults();
    } else {
      displayImages(searchData.hits);
      event.target.dataset.page = nextPage;
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  } finally {
    Notiflix.Loading.remove();
  }
}

// Inițializarea aplicației
function initializeApp() {
  const searchForm = document.getElementById("search-form");
  const loadMoreBtn = document.querySelector(".load-more");

  searchForm.addEventListener("submit", handleSearch);
  loadMoreBtn.addEventListener("click", handleLoadMore);
  loadMoreBtn.style.display = "none"; // Inițial, butonul este ascuns
}

initializeApp(); // Apelarea funcției pentru inițializarea aplicației
