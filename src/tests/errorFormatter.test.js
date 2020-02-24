import { ErrorFormatter } from '../errors'

const getError = message => ({
  status: undefined,
  code: undefined,
  title: undefined,
  detail: undefined,
  message: message,
})

describe('formatErrors', () => {
  test.only('formats errors', () => {
    const formatter = new ErrorFormatter()

    const result = formatter.formatErrors([
      {
        source: {
          pointer: '/data/attributes/name'
        },
        meta: {
          attribute: 'name',
          message: 'is required',
        }
      },
      {
        source: {
          pointer: '/data/relationships/profile'
        },
        meta: {
          attribute: 'profile',
          message: 'is required',
        }
      },
      {
        source: {
          pointer: '/data/relationships/photo'
        },
        meta: {
          attribute: 'photo',
          message: 'is required',
        }
      },
      {
        source: {
          pointer: '/data/attributes/url'
        },
        meta: {
          relationship: {
            type: 'photos',
            attribute: 'url',
            message: 'is required',
            'temp-id': 'photo-1'
          }
        }
      },
      {
        source: {
          pointer: '/data/attributes/title'
        },
        meta: {
          relationship: {
            type: 'todos',
            attribute: 'title',
            message: 'is required',
            'temp-id': 'todo-1'
          }
        }
      },
      {
        source: {
          pointer: '/data/attributes/text'
        },
        meta: {
          relationship: {
            type: 'comments',
            attribute: 'text',
            message: 'is required',
            'temp-id': 'comment-1'
          }
        }
      },
    ], {
      payload: {
        data: {
          type: 'users',
          attributes: {},
          relationships: {
            photo: {
              data: {
                type: 'photos',
                method: 'create',
                'temp-id': 'photo-1',
              }
            },
            todos: {
              data: [
                {
                  type: 'todos',
                  method: 'create',
                  'temp-id': 'todo-1',
                }
              ],
            }
          }
        },
        included: [
          {
            type: 'photos',
            'temp-id': 'photo-1',
            attributes: {}
          },
          {
            type: 'todos',
            'temp-id': 'todo-1',
            attributes: {},
            relationships: {
              comment: {
                data: {
                  type: 'comments',
                  method: 'create',
                  'temp-id': 'comment-1',
                }
              }
            }
          },
          {
            type: 'comments',
            'temp-id': 'comment-1',
            attributes: {},
          }
        ]
      },
    })

    const err = getError('is required')

    expect(result).toEqual({
      name: [err],
      profile: [err],
      photo: {
        url: [err],
      },
      todos: [
        {
          title: [err],
          comment: {
            text: [err]
          }
        }
      ],
    })
  })
})
