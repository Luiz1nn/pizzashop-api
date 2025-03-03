/* eslint-disable drizzle/enforce-delete-with-where */

import chalk from 'chalk'

import { faker } from '@faker-js/faker'

import { db } from './connection'
import { users } from './schema'

/**
 * Reset database
 */
await db.delete(users)

console.log(chalk.yellow('✔ Database reset'))

/**
 * Create customers
 */
await db.insert(users).values([
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
  },
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
  },
])

console.log(chalk.yellow('✔ Created customers'))

/**
 * Create restaurant manager
 */
await db.insert(users).values({
  name: faker.person.fullName(),
  email: 'admin@admin.com',
  role: 'manager',
})

console.log(chalk.yellow('✔ Created manager'))

console.log(chalk.greenBright('Database seeded successfully!'))

process.exit()
