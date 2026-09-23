const http = require('node:http')
const url = require('node:url')
const qs = require('node:querystring')
const Handler = require('./handler')
const handler = new Handler({})

const port = 8000
const host = 'localhost'

const listener = function(req, res) {
  let body = ''
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  req.on('data', chunk => { body += chunk.toString() })
  req.on('end', () => { /*console.log('received body', body)*/ onRequest(req, res, body) })
}

const server = http.createServer(listener)
server.listen(port, host, () => { console.log(`server is running on ${port}`) })

function onRequest(req, res, body) {
  console.log(`${req.method} - ${req.url}`)
  const pu = url.parse(req.url)
  const q = qs.parse(pu.query)

  let pathname = pu.pathname.toLowerCase()
  if (pathname.charAt(pathname.length-1) === '/') { pathname = pathname.substring(pathname.length-1, 0) }

  const switchVar = `${req.method}:${pathname}`
  switch(switchVar) {
    case 'GET:/project':         { handler.project.get({q,req,res,body}) }
    case 'POST:/project':        { handler.project.post({q,req,res,body}) }
    case 'DELETE:/project':      { handler.project.delete({q,req,res,body}) }
    case 'PATCH:/project':       { handler.project.update({q,req,res,body}) }
    case 'GET:/project/story':   { handler.project.story.get({q,req,res,body}) }
    case 'GET:/project/task':    { handler.project.task.get({q,req,res,body}) }

    case 'GET:/story':           { handler.story.get({q,req,res,body}) }
    case 'POST:/story':          { handler.story.post({q,req,res,body}) }
    case 'DELETE:/story':        { handler.story.delete({q,req,res,body}) }
    case 'PATCH:/story':         { handler.story.update({q,req,res,body}) }
    case 'GET:/story/task':      { handler.story.task.get({q,req,res,body}) }
    case 'GET:/story/task':      { handler.story.task.get({q,req,res,body}) }

    case 'GET:/task':            { handler.task.get({q,req,res,body}) }
    case 'POST:/task':           { handler.task.post({q,req,res,body}) }
    case 'DELETE:/task':         { handler.task.delete({q,req,res,body}) }
    case 'PATCH:/task':          { handler.task.update({q,req,res,body}) }
    case 'POST:/task/comment':   { handler.task.comment.post({q,req,res,body}) }
    case 'DELETE:/task/comment': { handler.task.comment.delete({q,req,res,body}) }
    case 'UPDATE:/task/comment': { handler.task.comment.update({q,req,res,body}) }

    default: { res.writeHead(404);res.end();return }
  }
}