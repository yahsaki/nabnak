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
    },
    task: {
      id: null,
      date_create: null,
      date_update: null,
      // /UPDATE-able fields
      name: null,
      description: null,
      acceptanceCriteria: null,
      status: null,
      tags: [],
      // end 
      date_started: null,
      date_completed: null,
      // comments have own path
      comments: [],
      // date required to be completed(Due Date)? I dont need such thing but yeah
      // history is a great one(someday)
      // priority
    }
  },
  status: {
    todo: 'todo',
    inprogress: 'inprogress',
    complete: 'complete'
  },
  priority: {
    low: 'low',
    medium: 'medium',
    high: 'high',
  }
}