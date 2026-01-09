import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { app } from '../src/app'
import { randomUUID } from 'node:crypto'

import request from 'supertest'
import { execSync } from 'node:child_process'

describe('Users Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    const sessionId = randomUUID()

    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        sessionId,
      })
      .expect(201)
  })
})
