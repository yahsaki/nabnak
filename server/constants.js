module.exports = {
  schema: {
    project: {
      id: null,
      date_created: null,
      date_updated: null,
      name: null,
      description: null,
      stories: [],
      tasks: [],
      tags: [],
    },
    task: {
      id: null,
      date_created: null,
      date_updated: null,
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
    done: 'done'
  },
  priority: {
    low: 'low',
    medium: 'medium',
    high: 'high',
  }
}