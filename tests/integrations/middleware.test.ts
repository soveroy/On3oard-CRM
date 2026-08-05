import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('integration route middleware', () => {
  it('leaves bearer-token integration routes outside browser session middleware', () => {
    const middleware = readFileSync(resolve(process.cwd(), 'middleware.ts'), 'utf-8')
    expect(middleware).toContain('api/integrations')
  })
})
