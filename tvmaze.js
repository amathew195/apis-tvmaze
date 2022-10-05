"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const IMG_PLACEHOLDER = "https://tinyurl.com/tv-missing";
const BASE_URL = "http://api.tvmaze.com/";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {

  const response = await axios.get(`${BASE_URL}search/shows`, { params: { q: term } });
  let image;

  const shows = response.data.map(show => {
    const { summary, id, name } = show.show;
    if (show.show.image) {
      const { medium } = show.show.image;
      image = medium;
    } else {
      image = IMG_PLACEHOLDER;
    }
    return { summary, id, name, image };
  });

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();
  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *  Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();

  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(`${BASE_URL}shows/${id}/episodes`);

  const episodes = response.data.map(episode => {
    const { id, name, season, number } = episode;
    return { id, name, season, number };
  });

  return episodes;
}

/** This function accepts an array of episodes and updates the DOM to
 * display the episodes for the selected show.
 */

function populateEpisodes(episodes) {
  $("#episodesList").empty();
  $episodesArea.show();
  for (const episode of episodes) {
    const $episodeLI = $("<li>").text(
      `${episode.name} (season ${episode.season}, number ${episode.number})`
    );
    $("#episodesList").append($episodeLI);
  }
}

/** This function gets invoked upon clicking the 'episodes' button. It invokes
 * the getEpisodesOfShow and passes in the show ID. It also invokes the
 * populateEpisodes function and passes in the episodes array returned from
 * the getEpisodesOfShow function.
 */

async function getEpisodesAndDisplay(evt) {
  const id = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

$showsList.on('click', ".Show-getEpisodes", getEpisodesAndDisplay);
