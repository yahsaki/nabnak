const util = require('./util')
const Dal = require('./dal')
const dal = new Dal({testing:true})

;(async () => {
  await util.delay(100)
  await project()
  

  process.exit(0)
})()

async function task() {
  throw 'unimplemented'
}
async function project() {
  console.log('dal data', dal.data)

  console.log('create project')
  let date = new Date()
  const project0 = {
    id: util.uuid(),
    date_create: date.toISOString(),
    date_update: date.toISOString(),
    name: `project name 0`,
    description: 'description',
    stories: [],
    tasks: [],
    tags: [],
  }
  dal.createProject(project0)
  const project0_fetched = dal.getProject(project0.id)
  if (!project0_fetched) { throw `failed to fetch project0` }
  if (project0_fetched.name !== project0.name) { throw `saved project's name does not match initial name` }

  await util.delay(100)
  const project1 = {
    id: util.uuid(),
    date_create: date.toISOString(),
    date_update: date.toISOString(),
    name: `project name 1`,
    description: 'description',
    stories: [],
    tasks: [],
    tags: [],
  }
  dal.createProject(project1)
  const project1_fetched = dal.getProject(project1.id)
  if (project0_fetched.id === project1_fetched.id) { throw `somehow both projects have the same id` }

  console.log('get projects aggregated')
  const projects = dal.projects
  if (projects.length !== 2) { throw `should have 2 projects, found ${projects.length}` }
  if (projects[0].storyCount !== 0 || projects[1].taskCount !== 0) { throw `get projects simplified schema broken` }

  console.log('get projects full')
  const projectsFull = dal.projectsFull
  if (projectsFull[0].stories.length !== 0 || projectsFull[1].tasks.length !== 0) { throw `get projects full schema broken` }
  console.log('dal tests executed successfully')

  console.log('delete project fail')
  let deleteRes = dal.deleteProject('ttt')
  if (deleteRes.success) { throw `delete project shouldve failed` }

  console.log('delete project success')
  deleteRes = dal.deleteProject(project1.id)
  if (!deleteRes.success) { throw `failed to delete project` }
  const projectsAfterDelete = dal.projects
  if (projectsAfterDelete.length !== 1) { throw `project count after deletion should be 1` }
  if (projectsAfterDelete[0].id !== project0.id) { throw `surviving project should be zeroeth project created` }

  console.log('update project success')
  const project2 = {
    id: util.uuid(),
    date_create: date.toISOString(),
    date_update: date.toISOString(),
    name: `name original`,
    description: 'description original',
    stories: [],
    tasks: [],
    tags: [],
  }
  dal.createProject(project2)
  dal.updateProject(project2.id, {
    name: 'name updated',
    description: 'description updated'
  })
  const project2_fetched = dal.getProject(project2.id)
  if (project2_fetched.name !== 'name updated' && project2_fetched.description !== 'description updated') {
    throw `update project fail`
  }
}