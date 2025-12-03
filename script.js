
const BASE_URL = "https://api.themoviedb.org/3";
let genreMap = {};

async function fetchGenres() {
    const data = await tmdb("/genre/movie/list");
    if (data && data.genres) {
        data.genres.forEach(g => {
            genreMap[g.id] = g.name;
        });
    }
}

async function tmdb(endpoint, params = {}) {
    // Add the api key
    params.api_key = API_KEY;

    // Turn parameters into query string
    const query = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}?${query}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`TMDB Error: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error("TMDB Fetch Error:", err);
        return null;
    }
}


// // Example 1: Search movie
// tmdb("/search/movie", { query: "Matrix" }).then(data => console.log(data));

// // Example 2: Popular movies
// tmdb("/movie/popular").then(data => console.log(data));

// // Example 3: Get a movie by ID
// tmdb("/movie/550").then(data => console.log(data));

async function loadMoviesIntoMain(query) {
    const main = document.querySelector("main");
    main.innerHTML = "";

    if (Object.keys(genreMap).length === 0) {
        await fetchGenres();
    }

    const data = await tmdb("/movie/popular", { query });

    if (!data || !data.results) return;

    data.results.forEach(movie => {
        const card = document.createElement("div");
        card.className = "card";

        const image = movie.backdrop_path || movie.poster_path;
        const rating = movie.vote_average?.toFixed(1) || "N/A";

        const genres = movie.genre_ids
            .map(id => genreMap[id])
            .slice(0, 1)
            .join(", ") || "Unknown";

        card.style.backgroundImage =
            image ? `url(https://image.tmdb.org/t/p/original${image})` : "none";

        card.innerHTML = `
            <div class="info">
                <span class="genre">${genres}</span>
                <span class="rating">${rating}</span>
            </div>
            <div class="title-foreground">
                <h3>${movie.title}</h3>
            </div>
        `;

        main.appendChild(card);
    });
}

loadMoviesIntoMain()