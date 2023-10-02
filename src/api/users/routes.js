const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUsersHandler,
  },
  //   {
  //     method: 'POST',
  //     path: '/users',
  //     handler: handler.postUsersHandler,
  //   },
  //   {
  //     method: 'POST',
  //     path: '/users',
  //     handler: handler.postUsersHandler,
  //   },
  //   {
  //     method: 'POST',
  //     path: '/users',
  //     handler: handler.postUsersHandler,
  //   },
];

module.exports = routes;
