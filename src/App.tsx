import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
/**
 * Interfaces, types, class
 */
interface IWarning {
  tag?: 'warn';
  message: string;
}
interface IError {
  tag?: 'error';
  code: string;
  message: string;
}

type Alert = IError | IWarning | null;

interface User {
  name: string;
  email: string;
}

class Warn implements IWarning {
  constructor(public message = '') {}
}

/**
 *
 * The APP
 */
function App() {
  const { data: users, loading, error } = useFetchUsers();
  if (loading) return <span>loading data...</span>;
  if (error) return <span>{error.message}</span>;

  return (
    <>
      {users.map((user) => (
        <div key={user.email}>{user.name}</div>
      ))}
    </>
  );
}

/**
 * It will show the list of users
 */
const USER_REPOSITORY = 'https://jsonplaceholder.typicode.com/users';

/**
 * It will reach the warn - means the code reaches the URL but is not an array of users
 */
//const USER_REPOSITORY = 'https://jsonplaceholder.typicode.com/users/1';

/**
 * It will reach the error - means there's an error to reach the URL
 */
//const USER_REPOSITORY = 'asdasdasdsd';

type FetchData<T> = {
  data: T;
  loading: boolean;
  error: Alert;
};
/**
 * A simple hook that returns data (if available), loading state or error
 */
const useFetchUsers = (): FetchData<User[]> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<Alert>(null);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchUsers(USER_REPOSITORY);

        /**
         * if you try to access
         */
        if (!('length' in res.data)) {
          throw new Warn('No users found');
        }

        setUsers(res.data);
      } catch (e: any) {
        // AxiosError
        // enforcing any type Alert to do some examples using type narrowing
        const alert = e as Alert;
        /**
         * Narrowing e
         * First: forcing null if e haven't all available properties in Alert
         * Check if e has property 'code'
         * Since the tag property is nullable, the code will reach the last set error;
         * There is possible to check if the 'e' is Alert using a type guard function, something like:
         * isAlert(e: unknown): e is Alert { ... } ...
         */
        if (alert) {
          if ('code' in alert) {
            setError({ code: e.code, message: 'This is an error' });
          }

          /**
           * Should not reach this code since Axios error does not have
           * the property tag.
           */
          if (e instanceof Warn) {
            setError(alert);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data: users, loading, error };
};

/**
 * Simple service
 * @param url
 * @returns
 */
const fetchUsers = async (url: string): Promise<AxiosResponse> =>
  axios.get(USER_REPOSITORY);

export default App;
