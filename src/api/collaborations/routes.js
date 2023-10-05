const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.postCollaborationHandler,
    options: {
      auth: 'openmusics_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: 'openmusics_jwt'
    }
  }
]

module.exports = routes
