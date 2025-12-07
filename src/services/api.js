export function fetchJSON(url, options) {
  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        return response
          .json()
          .catch(() => {
            return Promise.reject({ error: 'unknown-error' });
          })
          .then((err) => {
            return Promise.reject(err);
          });
      }
      return response.json();
    })
    .catch((err) => {
      if (!err || !err.error) {
        return Promise.reject({ error: 'network-error' });
      }
      return Promise.reject(err);
    });
}