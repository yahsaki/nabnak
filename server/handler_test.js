const Handler = require('./handler')
const handler = new Handler({testing:true})

const argTemplate = {
  req: {
    on: (name, fn) => {},
    url: '/', //localhost:8000/project?id=0
    method: '', //GET,POST,DELETE,PATCH
  },
  res: {
    setHeader: (name, value) => {},
    writeHead: (httpCode) => { console.log('httpCode', httpCode) },
    end: (responseString) => { console.log(`response: ${responseString}`) }
  },
  q: {
    id: null,
    projectId: null,
    storyId: null,
    taskId: null,
  },
  body: {}
}
const getArgBase = () => {
  return {
    req: argTemplate.req,
    res: argTemplate.res,
    q: {},//structuredClone(argTemplate.q),
    body: {}
  }
}
;(() => {
  project()

  process.exit(0)
})()

function project() {
  let args = getArgBase()
  args.body.project = {
    name: `project name 0`,
    description: 'description',
  }
  console.log('project: create project')
  const projectId0 = handler.project.post(args)
  if (!projectId0) { throw `this is more of a debug thing more than anything but yeah` }
  args.q.id = projectId0

  console.log('project: get project by id')
  const project = handler.project.get(args)
  if (!project) { throw `failed to find newly created project by id` }
  if (project.name !== args.body.project.name) { throw `project names dont match` }
  if (!project.tags || !project.stories || !project.tasks || !project.date_create || !project.date_update) {
    throw `project schema missing something or something idk`
  }

  console.log('project: get all projects')
  args = getArgBase()
  args.body.project = {
    name: `project name 1`,
    description: 'description',
  }
  const projectId1 = handler.project.post(args)
  if (projectId0 === projectId1) { throw `pointless id collision check that would be hilarious if it occurred` }
  const agged = handler.project.get(args)
  if (agged[0].storyCount !== 0 || agged[1].taskCount !== 0) { throw `get projects simplified schema broken` }

  console.log('project: delete fail bad input')
  let deleteRes = handler.project.delete(args)
  if (deleteRes) { throw `delete project shoulve failed on bad input but progressed passed the 400 check` }

  console.log('project: delete fail project not found')
  args = getArgBase()
  args.q.id = 'ttt'
  deleteRes = handler.project.delete(args)
  if (deleteRes.success) { throw `delete project succeeded when it shouldve failed` }

  console.log('project delete success')
  args = getArgBase()
  args.q.id = projectId1
  deleteRes = handler.project.delete(args)
  if (!deleteRes.success) { throw `delete project failed when it shouldve succeeded` }
  args = getArgBase()
  let projects = handler.project.get(args)
  if (projects.length !== 1) { throw `project count after deletion should be 1` }
  if (projects[0].id !== projectId0) { throw `zeroeth project created should exist` }

  return
}