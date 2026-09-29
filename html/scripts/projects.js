_.load.projects = () => {
  _.current.onLoad = () => {
    console.log('projects onLoad')
    _.current.script.fn.bind()

    console.log('todo: load projects here')
  }
  _.current.script = {
    fn: {
      bind: () => {
        const btnCreateProject = document.getElementById('btn-create-project')
        if (btnCreateProject) {
          btnCreateProject.addEventListener('click', () => {
            console.log('create project btn clicked')
          })
        }
      }
    }
  }
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
      grid-template-columns: 1fr 1fr;
    }
    .item {
      box-sizing: border-box;
    }
    `
    document.head.append(style)
  }
  _.current.html = () => {
    const title = document.createElement('title')
    title.innerText = 'home'
    document.head.append(title)

    const charset = document.createElement('meta')
    charset.setAttribute('charset', 'utf-8')
    document.head.append(charset)

    const html = document.createElement('div')
    html.setAttribute('id', 'content')
    html.innerHTML = `
    <div class="container">
      <div class="item">
        <h2>Project List</h2>
        <ul id="ul-projects"></ul>
      </div>
      <div class="item">
        <h2>Create Project</h2>
        <p>name</p>
        <input type="text" id="txt-project-name" />
        <p>description</p>
        <input type="text" id="txt-project-description" placeholder="todo: make this a textarea" />
        <button id="btn-create-project">Create Project</button>
      </div>
    </div>
    `
    document.body.append(html)
  }
  _.mode = 'projects'
}