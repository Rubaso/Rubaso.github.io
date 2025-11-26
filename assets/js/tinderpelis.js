// Config de keys
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAVOkqA9tOUa-epUAWyPvUxH2mLKnm_h0M",
  authDomain: "tinderpelis-d288d.firebaseapp.com",
  projectId: "tinderpelis-d288d",
  storageBucket: "tinderpelis-d288d.appspot.com",
  messagingSenderId: "80456361128",
  appId: "1:80456361128:web:b6bcd47403a50102644e9d"
};
const TMDB_API_KEY = "b4930c4d5258657cfddb6a2c5da5308e";

// --- FIREBASE ---
firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

// --- USERNAME ---
let nombreUsuario = localStorage.getItem('nombreUsuario');
if (!nombreUsuario) {
  nombreUsuario = prompt("Nombre de usuario :D");
  if (nombreUsuario && nombreUsuario.trim()) {
    nombreUsuario = nombreUsuario.trim();
    localStorage.setItem('nombreUsuario', nombreUsuario);
  } else {
    nombreUsuario = "Anónimo";
    localStorage.setItem('nombreUsuario', nombreUsuario);
  }
}

// --- IDENTIFICADOR USUARIO/SALA ---
const SESSION_ID = Math.random().toString(36).substring(2,10);
const ROOM = "Sexo";

// --- STATE ---
let genres = [];
let genreId = null;
let yearFrom = null;
let yearTo = null;
let movies = [];
let currentIndex = 0;
let movieChoices = {};
const MIN_YEAR = 1960;
const MAX_YEAR = new Date().getFullYear();

const movieCard = document.getElementById('movie-card');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const matchesBtn = document.getElementById('view-matches');
const historyBtn = document.getElementById('view-history');
const applyFilterBtn = document.getElementById('apply-filter');
const genreSelect = document.getElementById('genre-select');
const yearFromSelect = document.getElementById('year-from');
const yearToSelect = document.getElementById('year-to');
const matchesListDiv = document.getElementById('matches-list');
const historyListDiv = document.getElementById('history-list');
const clearBtn = document.getElementById('clear-btn');
const statsBtn = document.getElementById('view-stats');
const statsPanel = document.getElementById('stats-panel');

function showLoading(msg = "Cargando...") {
  movieCard.innerHTML = `<div id="loading">${msg}</div>`;
}

showLoading();

// --- Cargar Géneros y Años ---
async function getGenres() {
  const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=es-ES`);
  const data = await res.json();
  genres = data.genres;
  renderGenreOptions();
}

function renderGenreOptions() {
  for (const g of genres) {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.innerText = g.name;
    genreSelect.appendChild(opt);
  }
}
function renderYearOptions() {
  for (let y = MAX_YEAR; y >= MIN_YEAR; y--) {
    let optF = document.createElement('option');
    let optT = document.createElement('option');
    optF.value = y;
    optT.value = y;
    optF.innerText = y;
    optT.innerText = y;
    yearFromSelect.appendChild(optF);
    yearToSelect.appendChild(optT);
  }
  yearFromSelect.value = MIN_YEAR;
  yearToSelect.value = MAX_YEAR;
}

// --- Pelis según filtro ---
async function fetchMovies() {
  showLoading();
  let url = '';
  let gParam = (genreId && genreId !== 'all') ? `&with_genres=${genreId}` : '';
  let yFromParam = yearFrom ? `&primary_release_date.gte=${yearFrom}-01-01` : '';
  let yToParam = yearTo ? `&primary_release_date.lte=${yearTo}-12-31` : '';
  url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}${gParam}${yFromParam}${yToParam}&sort_by=popularity.desc&language=es-ES&page=1`;
  const res = await fetch(url);
  const data = await res.json();
  movies = data.results || [];
  currentIndex = 0;
  renderMovie();
}

function renderMovie() {
  matchesListDiv.innerHTML = '';
  historyListDiv.innerHTML = '';
  statsPanel.innerHTML = '';
  if (currentIndex >= movies.length) {
    movieCard.innerHTML = `<div>¡No hay más películas para este filtro!</div>`;
    yesBtn.disabled = true;
    noBtn.disabled = true;
    return;
  }
  yesBtn.disabled = false;
  noBtn.disabled = false;
  const m = movies[currentIndex];
  movieCard.innerHTML = `
    <img id="movie-poster" src="https://image.tmdb.org/t/p/w300${m.poster_path}" alt="Poster">
    <div class="movie-title">${m.title}</div>
    <div class="movie-overview">${m.overview ? m.overview.slice(0,120)+"..." : ""}</div>
  `;
}

// --- Elección (Sí/No) ---
yesBtn.onclick = async () => { await pickMovie("yes"); };
noBtn.onclick = async () => { await pickMovie("no"); };

async function pickMovie(status) {
  const movie = movies[currentIndex];
  // Si ya existe, preservar nota
  let nota = (movieChoices[movie.id] && movieChoices[movie.id].nota) ? movieChoices[movie.id].nota : "";
  movieChoices[movie.id] = { status, nota, tmdb: movie };
  await saveChoice(movie.id, status, nota, movie);
  currentIndex++;
  renderMovie();
}

// --- Guardar/Actualizar elección en Firestore ---
async function saveChoice(movieId, status, nota, movieObj) {
  await db.collection('choices').doc(ROOM + "_" + SESSION_ID + "_" + movieId).set({
    user: SESSION_ID,
    nombre: nombreUsuario,
    room: ROOM,
    movieId,
    status,
    nota,
    tmdb: movieObj
  });
}

// --- Ver historial ---
historyBtn.onclick = showHistory;

async function getUserChoices() {
  const snapshot = await db.collection('choices')
    .where("room", "==", ROOM)
    .where("user", "==", SESSION_ID)
    .get();
  let res = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    res[data.movieId] = data;
  });
  return res;
}

async function showHistory() {
  showLoading('Cargando historial...');
  matchesListDiv.innerHTML = '';
  statsPanel.innerHTML = '';
  const choices = await getUserChoices();
  historyListDiv.innerHTML = Object.values(choices).length === 0
    ? "<div>Sin historial aún.</div>"
    : Object.values(choices).map(c => renderHistoryItem(c)).join('');
}

function renderHistoryItem(c) {
  let statusClass = "status-" + c.status;
  let statusText = c.status === "yes" ? "Sí" : "No";
  let notaHtml = `<div class="history-notes"><b>${c.nombre}:</b> ${c.nota ? c.nota : "(Sin nota)"}</div>`;
  return `<div class="history-item">
    <img src="https://image.tmdb.org/t/p/w200${c.tmdb.poster_path}" alt="Poster">
    <span class="history-title">${c.tmdb.title}</span>
    <span class="history-status ${statusClass}">${statusText}</span>
    ${notaHtml}
    <button class="edit-nota-btn" onclick="window._editNota(${c.movieId})">Editar nota</button>
    ${c.status === 'yes' ? `<button class="recommend-btn" onclick="window._recommend(${c.movieId})">Ver recomendaciones</button>` : ""}
    ${getStatusChangeButtons(c)}
  </div>`;
}

function getStatusChangeButtons(c) {
  return `
    <button class="edit-nota-btn" onclick="window._changeStatus(${c.movieId}, 'yes')">Sí</button>
    <button class="edit-nota-btn" onclick="window._changeStatus(${c.movieId}, 'no')">No</button>
  `;
}

// Editar nota
window._editNota = function(movieId) {
  let nuevaNota = prompt("Escribe tu nota para esta película:");
  if (nuevaNota !== null) {
    if (!movieChoices[movieId]) return;
    movieChoices[movieId].nota = nuevaNota;
    saveChoice(movieId, movieChoices[movieId].status, nuevaNota, movieChoices[movieId].tmdb).then(showHistory);
  }
};

// Cambiar Sí/No
window._changeStatus = async function(movieId, newStatus) {
  if (!movieChoices[movieId]) return;
  let c = movieChoices[movieId];
  c.status = newStatus;
  await saveChoice(movieId, newStatus, c.nota, c.tmdb);
  showHistory();
};

// Recomendaciones automáticas (pelis similares) usando TMDB
window._recommend = async function(movieId) {
  const c = movieChoices[movieId];
  const id = c.tmdb.id;
  historyListDiv.innerHTML = `<div>Cargando recomendaciones...</div>`;
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${TMDB_API_KEY}&language=es-ES&page=1`);
  const data = await res.json();
  const simMovies = data.results || [];
  if (!simMovies.length) {
    historyListDiv.innerHTML = "<div>No hay recomendaciones automáticas.</div>";
    return;
  }
  historyListDiv.innerHTML = simMovies.slice(0,3).map(sm => renderSimItem(sm)).join('');
};

function renderSimItem(sm) {
  return `<div class="sim-item">
    <img src="https://image.tmdb.org/t/p/w200${sm.poster_path}" alt="Poster">
    <span class="sim-title">${sm.title}</span>
    <button class="add-sim-btn" onclick="window._addSim(${sm.id})">Añadir a historial</button>
  </div>`;
}

window._addSim = async function(movieId) {
  // Obtener detalles de la peli y añadir a historial con estado “no” y nota vacía por defecto
  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=es-ES`);
  const m = await res.json();
  movieChoices[movieId] = { status: "no", nota: "", tmdb: m };
  await saveChoice(movieId, "no", "", m);
  alert(`"${m.title}" añadida al historial como "No". Puede cambiar a "Sí" y escribir una nota cuando quieras.`);
  showHistory();
};

// --- Coincidencias ---
matchesBtn.onclick = showMatches;

async function showMatches() {
  showLoading('Buscando coincidencias...');
  historyListDiv.innerHTML = '';
  statsPanel.innerHTML = '';
  const snapshot = await db.collection('choices').where("room", "==", ROOM).get();
  let choicesByMovie = {};
  // Agrupar por peli
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!choicesByMovie[data.movieId]) choicesByMovie[data.movieId] = [];
    choicesByMovie[data.movieId].push(data);
  });
  // Coincidencia = pelis marcadas "yes" por al menos dos personas distintas
  let pairs = Object.values(choicesByMovie).filter(arr => {
    let siArr = arr.filter(c => c.status === "yes");
    return siArr.length > 1; // al menos dos han dicho sí
  });
  matchesListDiv.innerHTML = pairs.length === 0
    ? "<div>No hay coincidencias aún.</div>"
    : pairs.map(arr => renderCoincidence(arr)).join('');
}

function renderCoincidence(usersArr) {
  // Extraer datos TMDB (puede venir repetido por user, usar el primero)
  let m = usersArr[0].tmdb;
  // Mapear notas (nombre: nota)
  let notasHtml = usersArr.filter(u => u.status === "yes").map(u => `<div class="match-notes"><b>${u.nombre}:</b> ${u.nota ? u.nota : "(Sin nota)"}</div>`).join('');
  return `<div class="match-item">
    <img src="https://image.tmdb.org/t/p/w200${m.poster_path}" alt="Poster">
    <span class="match-title">${m.title}</span>
    ${notasHtml}
  </div>`;
}

// --- Estadísticas ---
statsBtn.onclick = async () => {
  showLoading('Cargando estadísticas...');
  historyListDiv.innerHTML = '';
  matchesListDiv.innerHTML = '';
  const choices = await getUserChoices();
  statsPanel.innerHTML = renderStats(Object.values(choices));
};

function renderStats(choicesArr) {
  let total = choicesArr.length;
  let yesCount = choicesArr.filter(c => c.status === "yes").length;
  let noCount = choicesArr.filter(c => c.status === "no").length;
  let percentYes = (total === 0) ? 0 : Math.round((yesCount/total)*100);
  let percentNo = (total === 0) ? 0 : Math.round((noCount/total)*100);
  // Por género
  let statsByGenre = {};
  for (let c of choicesArr) {
    if (c.tmdb.genre_ids && c.tmdb.genre_ids.length) {
      c.tmdb.genre_ids.forEach(gid => {
        let g = genres.find(g => g.id === gid);
        if (!g) return;
        if (!statsByGenre[g.name]) statsByGenre[g.name] = { total:0, yes:0 };
        statsByGenre[g.name].total++;
        if (c.status === 'yes') statsByGenre[g.name].yes++;
      });
    }
  }
  let byGenreHtml = `<table class="stats-table">
  <tr><th>Género</th><th>"Sí"</th><th>Total</th><th>% Sí</th></tr>`;
  for (let gn in statsByGenre) {
    let d = statsByGenre[gn];
    let percent = d.total === 0 ? 0 : Math.round((d.yes/d.total)*100);
    byGenreHtml += `<tr>
      <td>${gn}</td>
      <td>${d.yes}</td>
      <td>${d.total}</td>
      <td>${percent}%</td>
    </tr>`;
  }
  byGenreHtml += `</table>`;
  return `<div class="stats-panel">
    <b>Total películas deslizadas:</b> ${total} <br>
    <b>"Sí quiero verla":</b> ${yesCount} <br>
    <b>"No quiero verla":</b> ${noCount} <br>
    <b>% "Sí":</b> ${percentYes}%<br>
    <b>% "No":</b> ${percentNo}%<br><br>
    <b>Porcentaje "Sí" por género:</b>
    ${byGenreHtml}
  </div>`;
}

// --- Borrar todo ---
clearBtn.onclick = async () => {
  if (!confirm("¿Seguro que quieres borrar todo tu historial? Esta acción no se puede deshacer.")) return;
  const snapshot = await db.collection('choices')
    .where("room", "==", ROOM)
    .where("user", "==", SESSION_ID)
    .get();
  let batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  movieChoices = {};
  currentIndex = 0;
  await fetchMovies();
  matchesListDiv.innerHTML = '';
  historyListDiv.innerHTML = '';
  statsPanel.innerHTML = '';
  alert("¡Historial borrado! Puedes volver a empezar.");
};

// --- FILTRO ---
applyFilterBtn.onclick = () => {
  genreId = genreSelect.value;
  yearFrom = yearFromSelect.value;
  yearTo = yearToSelect.value;
  fetchMovies();
}

// --- AL CARGAR ---
(async function initialize() {
  await getGenres();
  renderYearOptions();
  // Recupera elecciones previas propias
  const snapshot = await db.collection('choices').where("room", "==", ROOM).where("user", "==", SESSION_ID).get();
  snapshot.forEach(doc => {
    const d = doc.data();
    movieChoices[d.movieId] = { status: d.status, nota: d.nota, tmdb: d.tmdb };
  });
  await fetchMovies();
  renderMovie();
})();