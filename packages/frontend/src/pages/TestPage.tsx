import { Link } from 'react-router-dom';
import { post } from 'aws-amplify/api';
import { getCurrentUser, AuthUser, fetchAuthSession } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';

async function _getCurrentUser() {
  try {
    await fetchAuthSession({ forceRefresh: true }); // try to refresh the session first
    const user = await getCurrentUser();
    return user;
  } catch (error: any) {
    if (error.name == 'UserUnAuthenticatedException') {
      console.log('Not logged in');
    } else {
      throw error;
    }
  }
}

function TestPage() {
  const [user, setUser] = useState<AuthUser | undefined>(undefined);

  const testAPIAccess = async () => {
    const request = post({
      apiName: 'myAPI',
      path: '/',
    });

    const response = await request.response;
    console.log('Response', response);
  };

  // Get current user
  useEffect(() => {
    _getCurrentUser().then(user => {
      setUser(user);
    });
  }, []);

  return (
    <>
      <h2> This is a test page</h2>
      <p>{user ? JSON.stringify(user) : 'No current User'}</p>

      <br />
      <button onClick={testAPIAccess}>POST /</button>
      <br />
      <br />
      <Link to="/"> Back </Link>
    </>
  );
}

export default TestPage;
