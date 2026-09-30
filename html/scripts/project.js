_.load.project = (projectId, name) => {
  _.current.onLoad = () => {
    console.log('project onLoad', _.current.data.projectId)
  }
  _.current.dom = {}
  _.current.data = {
    projectId,
    name,
  }
  _.current.fn = {}
  _.current.css = () => {
    const style = document.createElement('style')
    style.setAttribute('id', 'core')
    style.innerText = `
    html {
      background-color: #222529;
      color: #e1e4e8;
      font-size: 12px;
    }
    .container {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
    }
    `
    document.head.append(style)
  }
  _.current.html = () => {
    const title = document.createElement('title')
    title.innerText = `nabnak | ${_.current.data.name}`
    document.head.append(title)

    const charset = document.createElement('meta')
    charset.setAttribute('charset', 'utf-8')
    document.head.append(charset)

    const html = document.createElement('div')
    html.setAttribute('id', 'content')
    html.innerHTML = `
    <div class="container">
      <div class="item">
        <h1>same list of projects here for nav</h1>  
      </div>
      <div class="item">
        <h1>uhhhhh wtf goes here?</h1>
      </div>
      <div class="item">
        <h1>the project board and lanes in one of these two por favor</h1>
      </div>
    </div>
    `
    document.body.append(html)
  }
  _.mode = 'project'
}