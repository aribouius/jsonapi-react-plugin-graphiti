import schema from './schema'
import { GraphitiSerializer } from '../serializer'

describe('serialize', () => {
  test.only('serializes nested relationships', () => {
    const serializer = new GraphitiSerializer({ schema })

    const attrs = {
      id: 1,
      name: 'John',
      profile: {
        id: 2,
        photo: 'pic.jpg',
        _method: 'update',
      },
      todos: [
        {
          _method: 'create',
          id: 'xxx-xxx',
          title: 'Clean the kitchen',
          comments: [
            {
              _method: 'create',
              id: 'yyy-yyy',
              comment: 'Counter-top is done!',
            },
            {
              _method: 'destroy',
              id: 3,
            },
            {
              _method: 'disassociate',
              id: 4,
            },
          ],
        }
      ]
    }

    const result = serializer.serialize('users', attrs)

    expect(result).toEqual({
      data: {
        id: '1',
        type: 'users',
        attributes: {
          name: 'John',
        },
        relationships: {
          profile: {
            data: { type: 'profiles', id: '2', method: 'update' }
          },
          todos: {
            data: [
              { type: 'todos', 'temp-id': 'xxx-xxx', method: 'create' }
            ],
          },
        },
      },
      included: [
        {
          type: 'profiles',
          id: '2',
          attributes: {
            photo: 'pic.jpg',
          }
        },
        {
          type: 'comments',
          'temp-id': 'yyy-yyy',
          attributes: {
            comment: 'Counter-top is done!',
          },
        },
        {
          type: 'todos',
          'temp-id': 'xxx-xxx',
          attributes: {
            title: 'Clean the kitchen',
          },
          relationships: {
            comments: {
              data: [
                { type: 'comments', 'temp-id': 'yyy-yyy', method: 'create' },
                { type: 'comments', id: '3', method: 'destroy' },
                { type: 'comments', id: '4', method: 'disassociate' },
              ],
            },
          },
        },
      ]
    })
  })
})
