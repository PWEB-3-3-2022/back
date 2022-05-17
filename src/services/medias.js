import { mediaColl } from '../db/conn.js';
import {
  idFilter, textScoreProj, textScoreSort, textSearch,
} from '../db/bson.js';

/**
 * Insert a new media in the database
 * @param {Media} media
 * @returns {Promise} Insert result
 */
export function createMedia(media) {
  return mediaColl.insertOne(media);
}

/**
 * Search for medias in the db based on query
 * @param {string} query - The search query
 * @param {number} [limit=10] - The maximum number of results to return
 * @returns {Promise<Media[]>}
 */
export function searchMedias(query, limit = 10) {
  return mediaColl.find(
    textSearch(query, 'fr'),
    { projection: textScoreProj, sort: textScoreSort, limit },
  ).toArray();
}

/**
 * Get a list of medias of a certain type
 * @param {string} type - The type of medias to find
 * @param limit - The maximum number of results to return
 * @returns {Promise<Media[]>}
 */
export function findAny(type, limit = 10) {
  return mediaColl.find({ type }, { limit }).toArray();
}

/**
 * Get a media by its id
 * @param {string} id - ObjectId
 * @returns {Promise<Media>}
 */
export function findById(id) {
  return mediaColl.findOne(idFilter(id));
}

// TODO(guillaume) update media
// TODO(guillaume) delete media
