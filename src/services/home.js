import { mediaColl } from '../db/conn.js';

/**
 * Get the movie selection to display on the homepage
 * @param {number} [count=4] the number of movies to return
 * @returns {Promise<Movie[]>} array of movies
 */
export function homepageMovies(count = 4) {
  return mediaColl.aggregate([
    { $match: { type: 'movie' } },
    { $sample: { size: count } },
  ]).toArray();
}

/**
 * Get the tvshow selection to display on the homepage
 * @param {number} [count=4] the number of tvshows to return
 * @returns {Promise<TvShow[]>} array of tvshows
 */
export function homepageTvshows(count = 4) {
  return mediaColl.aggregate([
    { $match: { type: 'tvshow' } },
    { $sample: { size: count } },
  ]).toArray();
}
