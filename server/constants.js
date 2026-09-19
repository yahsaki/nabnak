module.exports = {
  schema: {
    project: {
      id: null,
      date_create: null,
      date_update: null,
      name: null,
      description: null,
      stories: [],
      tasks: [],
      tags: [],
    }
  },
  status: {
    todo: 'todo',
    inprogress: 'inprogress',
    complete: 'complete'
  },
}