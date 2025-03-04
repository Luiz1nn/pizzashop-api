import chalk from 'chalk'
import { eq } from 'drizzle-orm'
import Elysia from 'elysia'
import { z } from 'zod'
import { db } from '~/db/connection'
import { restaurants, users } from '~/db/schema'

import { eResponseStatus } from '../enums/response-status.enum'

const registerRestaurantBodySchema = z.object({
  restaurantName: z
    .string()
    .min(3, { message: 'Restaurant name must be at least 3 characters long' }),
  managerName: z
    .string()
    .min(3, { message: 'Manager name must be at least 3 characters long' }),
  email: z.string().email({ message: 'Invalid email format' }),
  phone: z
    .string()
    .min(8, { message: 'Phone number must have at least 8 characters' }),
})

export const registerRestaurant = new Elysia().post(
  '/restaurants',
  async ({ body, set }) => {
    const result = registerRestaurantBodySchema.safeParse(body)

    if (!result.success) {
      set.status = eResponseStatus.BadRequest
      return {
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.length > 0 ? issue.path.join('.') : undefined,
          message: issue.message,
        })),
      }
    }
    const { restaurantName, managerName, email, phone } = result.data

    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

      if (existingUser.length > 0) {
        set.status = eResponseStatus.Conflict
        return {
          message: 'Manager email already exists.',
        }
      }

      const [manager] = await db
        .insert(users)
        .values({
          name: managerName,
          email,
          phone,
          role: 'manager',
        })
        .returning({
          id: users.id,
        })

      await db.insert(restaurants).values({
        name: restaurantName,
        managerId: manager.id,
      })

      set.status = eResponseStatus.Created
      return { message: 'Restaurant registered successfully' }
    } catch (error) {
      console.error(chalk.red('Error registering restaurant:', error))

      if (error instanceof Error) {
        if (
          error.message.includes(
            'duplicate key value violates unique constraint',
          )
        ) {
          set.status = eResponseStatus.Conflict
          return {
            message:
              'A restaurant with this name may already exist or another unique constraint was violated.',
            error: error.message,
          }
        }
      }

      set.status = eResponseStatus.InternalServerError
      return {
        message:
          'An unexpected error occurred while registering the restaurant.',
        error,
      }
    }
  },
)
