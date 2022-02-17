import { ObjectId } from 'mongodb';

export function idFilter(id) {
  return { _id: new ObjectId(id) };
}
