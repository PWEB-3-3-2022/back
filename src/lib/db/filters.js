import { ObjectId } from 'mongodb';

export function idFilter(id) {
  return { _id: new ObjectId(id) };
}

export function textSearch(text, language) {
  return {
    $text: {
      $search: text,
      $language: language,
      $caseSensitive: false,
      $diacriticSensitive: false,
    },
  };
}

export const textScoreProj = {
  score: {
    $meta: 'textScore',
  },
};

export const textScoreSort = {
  score: {
    $meta: 'textScore',
  },
};
