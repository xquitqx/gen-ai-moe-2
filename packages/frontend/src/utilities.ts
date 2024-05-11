import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Note: I'm using requets type any, because I couldn't find a way to import
// types from amplify
export const toJSON = async (request: any) => {
  const response = await request.response;
  const json = await response.body.json();
  return json;
};

/**
 * This is the format of the response sent by the `'POST /grade-writing'`.
 */
export interface WritingGrading {
  'Coherence & Cohesion': string;
  'Grammatical Range & Accuracy': string;
  'Lexical Resource': string;
  'Task Responce': string;
  'Grammer Tool Feedback'?: Array<{message: string,
                                   context:{text:string, offset:number, length:number, }
                                   [key: string] : any}>;
  'Combined Feedback': string;
}

/** Get authenticated socket url, returns undefined if not signed in, or there
 * where any other issues
 *
 * This uses the `AuthContext` under the hood to get the JWT token, and injects
 * it in the url for authentication.
 */
export const getSocketUrl = (): string | undefined => {
  const authInfo = useContext(AuthContext);
  if (!authInfo) return;
  // return undefined;

  const token = authInfo.authSession.tokens?.idToken?.toString();
  if (!token) return;

  // console.log(`URL is ${import.meta.env.VITE_WEBSOCKET_URL}?idToken=${token}`);
  return `${import.meta.env.VITE_WEBSOCKET_URL}?idToken=${token}`;
};
