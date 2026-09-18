module.exports = {
  // I really need to learn more built in js fns. I swear map or reduce is a great use case for this
  checkForTagDupes: (tags = []) => {
    const duplicates = []
    const checkedTags = []
    for (let i = 0; i < tags.length; i++) {
      const duplicate = checkedTags.find(x => x.toLowerCase() === tags[i].toLowerCase())
      if (duplicate) { duplicates.push(duplicate)}
      checkedTags.push(tags[i])
    }
    return duplicates
  }
}