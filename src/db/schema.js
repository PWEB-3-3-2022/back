/**
 * A media, either a Movie or a TvShow
 * @typedef {Movie|TvShow} Media
 */

/**
 * A movie
 * @typedef {Object} Movie
 * @property {ObjectId} _id - Document id
 * @property {string} type - Media type = movie
 * @property {string} title - Title
 * @property {string} description - Description
 * @property {number} year - Year
 * @property {string} duration - Duration
 * @property {Array<string>} genres -Genres
 * @property {Array<string>} cast - Cast
 * @property {string} poster_small - Poster URL
 */

// TODO(guillaume) TvShow doc
/**
 * A TVShow
 * @typedef {Object} TvShow
 * @property {ObjectId} _id - Document id
 * @property {string} type - Media type = movie
 * @property {string} title - Title
 * @property {string} description - Description
 * @property {number} year - Year
 * @property {string} duration - Duration
 * @property {Array<string>} genres -Genres
 * @property {Array<string>} cast - Cast
 * @property {string} poster_small - Poster URL
 */

/**
 * A User
 * @typedef {Object} User
 * @property {ObjectId} _id - Document id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {Date} created
 * @property {Object<string,Profile>} profiles
 */

/**
 * A user profile
 * @typedef {Object} Profile
 * @property {string} name
 * @property {string} email
 * @property {string} picture - Profile picture URL
 */
