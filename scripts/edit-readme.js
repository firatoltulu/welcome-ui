const path = require('path')
const fs = require('fs')
const util = require('util')

const kebabCase = require('lodash.kebabcase')

fs.readFileAsync = util.promisify(fs.readFile)
fs.readdirAsync = util.promisify(fs.readdir)
fs.writeFileAsync = util.promisify(fs.writeFile)

const ROOT_PATH = path.join(__dirname, '../packages')

const collectFolders = () =>
  fs
    .readdirAsync(ROOT_PATH, { withFileTypes: true })
    .then(files => files.filter(f => f.isDirectory()))

const collectPackages = folder =>
  folder
    .filter(({ name }) => !name.startsWith('_'))
    .map(({ name }) => ({
      pkgName: kebabCase(name),
      componentName: name,
      config: require(`${ROOT_PATH}/${name}/package.json`)
    }))

const handleError = err => {
  // eslint-disable-next-line no-console
  console.error(err)
  throw err
}

collectFolders()
  .then(collectPackages)
  .then(packages => packages.forEach(createReadme))
  .catch(handleError)

const createReadme = pkg => {
  fs.writeFileAsync(`${ROOT_PATH}/${pkg.componentName}/README.md`, getReadmeContent(pkg))
    // eslint-disable-next-line no-console
    .then(() => console.debug('Successfully wrote', pkg.pkgName))
    .catch(handleError)
}

// README.md
const getReadmeContent = pkg => {
  const {
    componentName,
    config: { homepage: documentation, name, version }
  } = pkg

  const content = `# ${name} v${version}
<<<<<<< HEAD
<<<<<<< HEAD

<<<<<<< HEAD
The ${documentation ? `[${componentName}](${documentation})` : componentName} component from [@welcome-ui](http://welcome-ui.com).
=======
  
The **[${componentName}](${documentation})** component from [@welcome-ui](http://welcome-ui.com).
>>>>>>> chore: create script for updating README files
=======

The ${documentation ? `[${componentName}](${documentation})` : componentName} component from [@welcome-ui](http://welcome-ui.com).
>>>>>>> docs: remove doc links from components with no docs
=======
The ${
    documentation ? `[${componentName}](${documentation})` : componentName
  } component from [@welcome-ui](http://welcome-ui.com).
>>>>>>> docs: update package.json to use homepage key

## Installation

    yarn add ${name}

## Import

    import { ${componentName} } from '${name}'

## Documentation

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
See the ${documentation ? `[documentation](${documentation}) or` : ''} [package source](https://github.com/WTTJ/welcome-ui/tree/v${version}/packages/${componentName}) for more details.
=======
See the [documentation](${documentation}) or [package source](https://github.com/WTTJ/welcome-ui/tree/v${version}/packages/${componentName}) for more details.
>>>>>>> chore: create script for updating README files
=======
See the ${documentation ? `[documentation](${documentation}) or` : ''} [package source](https://github.com/WTTJ/welcome-ui/tree/v${version}/packages/${componentName}) for more details.
>>>>>>> docs: remove doc links from components with no docs
=======
See the ${
    documentation ? `[documentation](${documentation}) or` : ''
  } [package source](https://github.com/WTTJ/welcome-ui/tree/v${version}/packages/${componentName}) for more details.
>>>>>>> docs: update package.json to use homepage key
`

  return content
}
