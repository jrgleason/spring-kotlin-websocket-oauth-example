import { fromPromise } from 'xstate';

// Just an example test token for fake login
const TEST_TOKEN = 'test.token';

/**
 * If we're using a fake login, fetch the user data from /fe/user
 * using a test token.
 */
const doFakeUserCheck = fromPromise(async () => {
    console.log('[FAKE AUTH ACTOR] Starting doFakeUserCheck...');
    const response = await fetch('/fe/user', {
        headers: {
            Authorization: `Bearer ${TEST_TOKEN}`,
        },
    });
    const data = await response.json();

    console.log('[FAKE AUTH ACTOR] Fetched fake user data:', data);

    // Return the user + token + fakeLogin indicator
    return {
        user: { name: data.name },
        token: TEST_TOKEN,
        fakeLogin: true
    };
});

export { doFakeUserCheck };
