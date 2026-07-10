import { ApiClient } from './api-client';
import { SOCIAL_API_BASE_URL } from './constants';

// Talks to the Unihub-social microservice, a separate deployable service
// from the one apiClient (api-client.ts) talks to.
export const socialApiClient = new ApiClient(SOCIAL_API_BASE_URL);

export default socialApiClient;
