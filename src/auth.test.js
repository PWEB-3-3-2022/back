import { checkAuthToken, createAuthToken } from './auth.js';

console.log(createAuthToken('ae65df465aef', 'user', 10));

console.log(checkAuthToken(createAuthToken('ae65df465aef', 'user', 10)));
