import { GraphitiSerializer } from './serializer'
import { ErrorFormatter } from './errors'

export class GraphitiPlugin {
  constructor(config) {
    this.config = {
      formatErrors: true,
      ...config
    }
  }

  initialize(client) {
    client.config.serialize = (type, data, schema) => {
      return new GraphitiSerializer({ schema }).serialize(type, data)
    }

    if (this.config.formatErrors) {
      client.config.formatErrors = (errors, extra) => {
        return new ErrorFormatter().formatErrors(errors, extra)
      }
    }
  }
}
