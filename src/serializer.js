import { Serializer } from 'jsonapi-react'

export class GraphitiSerializer extends Serializer {
  serialize(type, attrs) {
    this.context = []
    const res = Serializer.prototype.serialize.call(this, type, attrs)

    if (this.context.length) {
      res.included = this.context
    }

    this.context = null

    return res
  }

  parseRelationship(type, attrs) {
    const rsrc = this.parseResource(type, attrs)
    const data = { type: rsrc.type, id: rsrc.id || null }

    const method = rsrc.attributes._method

    if (method) {
      data.method = method
      delete rsrc.attributes._method

      if (method === 'create') {
        data['temp-id'] = rsrc['temp-id'] = data.id || this.uuid()
        delete data.id
        delete rsrc.id
      }

      if (method !== 'destroy' && method !== 'disassociate') {
        this.context.push(rsrc)
      }
    }

    return data
  }

  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
}
