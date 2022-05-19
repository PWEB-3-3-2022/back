import { ObjectId } from 'mongodb';
import { userColl } from '../db/conn.js';
import { idFilter } from '../db/bson.js';
import { deleteUndefinedKeys } from '../utils.js';

const userCache = {};

/**
 * Get a user by its id
 * @param {string} id - ObjectId
 * @returns {Promise<User>}
 */
export async function findById(id) {
  if (id in userCache) {
    return userCache[id];
  }
  const result = await userColl.findOne(
    idFilter(id),
    { projection: { password: 0 } },
  );
  if (result != null) {
    userCache[id] = result;
  }
  return result;
}

const DEFAULT_PROFILE_PICTURE = 'https://occ-0-784-778.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABb_DHMVDo8hDAK3yCzp_kViqNAzRqtn4oFSvy8FppaaBvPEgXCYaVMOX7QyrOZvuznXMuC7CCX4H0-NmnBa5bxs4CCEluvvauk87.png?r=a41';

/**
 * Create a new user profile, email is set to the account email if not set
 * @param {string} userId
 * @param {Profile} profile
 * @returns {Promise<string>} the new profile id
 */
export async function createProfile(userId, profile) {
  let user;
  if (userId in userCache) {
    user = userCache[userId];
  } else {
    user = await findById(userId);
  }
  // A profile id is generated from a new ObjectId, basically random
  const profileId = ObjectId.createFromTime(new Date().getSeconds()).toHexString();
  const newProfile = {
    name: profile.name,
    email: profile.email || user.email,
    picture: profile.picture || DEFAULT_PROFILE_PICTURE,
  };
  const update = {};
  update[`profiles.${profileId}`] = newProfile;
  await userColl.updateOne(idFilter(userId), { $set: update });

  user.profiles[profileId] = newProfile;
  userCache[userId] = user;
  return profileId;
}

/**
 * Update a user profile
 * @param userId
 * @param profileId
 * @param {Profile} profileUpdate - The update document, may have missing keys or undefined keys
 * @returns {Promise<Object>}
 */
export async function updateProfile(userId, profileId, profileUpdate) {
  const update = {};
  update[`profiles.${profileId}`] = deleteUndefinedKeys(profileUpdate);
  const result = await userColl.updateOne(idFilter(userId), { $set: update });
  if (result.modifiedCount !== 1) {
    return { error: 'UnkownIdError' };
  }
  if (userId in userCache) {
    const old = userCache[userId].profiles[profileId];
    userCache[userId].profiles[profileId] = {
      name: profileUpdate.name || old.name,
      email: profileUpdate.email || old.email,
      picture: profileUpdate.picture || old.picture,
    };
  }
  return {};
}

/**
 * Delete a user profile
 * @param userId
 * @param profileId
 * @returns {Promise<Object>}
 */
export async function deleteProfile(userId, profileId) {
  const unsetValue = {};
  unsetValue[`profiles.${profileId}`] = '';
  const result = await userColl.updateOne(idFilter(userId), { $unset: unsetValue });
  if (result.modifiedCount !== 1) {
    return { error: 'UnkownIdError' };
  }
  if (userId in userCache) {
    delete userCache[userId].profiles[profileId];
  }
  return {};
}
