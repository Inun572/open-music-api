const CollabHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { playlistsService, service, validator }) => {
    const collabHandler = new CollabHandler(
      playlistsService,
      service,
      validator
    )
    server.route(routes(collabHandler))
  }
}
