export class ErrorFormatter {
  formatError(err = {}) {
    let meta = err.meta || {}

    if (meta.relationship) {
      meta = meta.relationship
    }

    return {
      status: err.status,
      code: meta && meta.code || err.code,
      title: err.title,
      detail: err.detail,
      message: meta && meta.message || err.message,
    }
  }

  formatErrors(errors, { payload } = {}) {
    const data = {}
    const rels = []

    for (const error of errors) {
      const meta = error.meta

      if (!error.source) {
        continue
      }

      if (meta.relationship) {
        rels.push(error)
        continue
      }

      if (error.source.pointer.indexOf('/relationships/') >= 0) {
        data[meta.attribute] = this.formatError(error)
        continue
      }

      if (!data[meta.attribute]) {
        data[meta.attribute] = []
      }

      data[meta.attribute].push(this.formatError(error))
    }

    if (!rels.length || !payload) {
      return data
    }

    const map = this.getRelationMap(
      payload.data.relationships,
      payload.included,
    ).sort((a,b) =>
      a.paths.length - b.paths.length
    )

    for (const err of rels) {
      const item = map.find(i => this.isItemMatch(i, err.meta.relationship))

      if (!item) {
        continue
      }

      let ref = data
      item.paths.forEach((path, index) => {
        if (!ref[path]) {
          ref[path] = Number.isInteger(item.paths[index + 1]) ? [] : {}
        }
        ref = ref[path]
      })

      const attr = err.meta.relationship.attribute
      const value = this.formatError(err)

      if (err.source.pointer.indexOf('/relationships/') >= 0) {
        ref[attr] = value
      } else if (!ref[attr]) {
        ref[attr] = [value]
      } else {
        ref[attr].push(value)
      }
    }

    return data
  }

  getRelationMap(root = {}, included = [], paths = []) {
    const map = []

    for (const path in root) {
      const data = root[path].data

      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          map.push(this.getMapObject(item, paths.concat([index, path, 'errors'])))
        })
      } else {
        map.push(this.getMapObject(data, paths.concat([path, 'errors'])))
      }
    }

    map.forEach(item => {
      included.forEach(obj => {
        if (this.isItemMatch(item, obj)) {
          map.push(
            ...this.getRelationMap(obj.relationships, included, item.paths)
          )
        }
      })
    })

    return map
  }

  getMapObject(item, paths) {
    return {
      id: item.id || item['temp-id'],
      type: item.type,
      paths,
    }
  }

  isItemMatch(item, obj) {
    return (
      item.type === obj.type &&
      [obj.id, obj['temp-id']].indexOf(item.id) >= 0
    )
  }
}
