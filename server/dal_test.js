const util = require('./util')
const Dal = require('./dal')
const dal = new Dal({testing:true})

;(async () => {
  await util.delay(100)
  console.log('dal data', dal.data)

  console.log('save project')
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
  dal.saveProject(project0)
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
  dal.saveProject(project1)
  const project1_fetched = dal.getProject(project1.id)
  if (project0_fetched.id === project1_fetched.id) { throw `somehow both projects have the same id` }
  const projects = dal.projects
  if (projects.length !== 2) { throw `should have 2 projects, found ${projects.length}` }

  console.log('dal tests executed successfully')

})()