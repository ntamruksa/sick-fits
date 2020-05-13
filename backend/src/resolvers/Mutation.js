const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const moment = require('moment')
const Mutations = {
  async createItem(parent, args, ctx, info) {
    //TODO: check if use logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    )
    return item
  },

  async updateItem(parent, args, ctx, info) {
    const updateItem = { ...args }
    delete updateItem.id
    return await ctx.db.mutation.updateItem(
      {
        data: updateItem,
        where: { id: args.id }
      },
      info
    )
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    // 1. find item
    const item = await ctx.db.query.item({ where }, `{id title}`)
    // 2. check permission
    // 3. delete it
    return await ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] }
        }
      },
      info
    )
    // create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // set cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
    // return user to browser
    return user
  },

  async signin(parent, { email, password }, ctx, info) {
    // 1. check if there is user with this email
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }
    // 2. check if password is correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid Password!')
    }
    // 3. generate the JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // 4. set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
    // 5. Return the user
    return user
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye' }
  },

  async requestReset(parent, { email }, ctx, info) {
    // 1. check if user exist
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No user for email ${email}`)
    }
    // 2. set a reset token and expiry on that user
    const randomBytesPromisified = promisify(randomBytes)
    const resetToken = (await randomBytesPromisified(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now
    const res = ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })
    console.log(res)
    return { message: 'Thanks!' }
    // 3. email the reset token to user
  },

  async resetPassword(
    parent,
    { resetToken, password, confirmPassword },
    ctx,
    info
  ) {
    // 1. check if password match
    const passwordMatch = password === confirmPassword
    if (!passwordMatch) {
      throw new Error('Password not match')
    }
    // 2. check if resetToken is legit
    // 3. check if resetToken is expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })
    if (!user) {
      throw new Error('Invalid token or expired')
    }
    // 4. hash the new password
    const bcryptPassword = await bcrypt.hash(password, 10)
    // 5. save new password and remove resetToken and resetTokenExpiry
    const updatedUser = ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: { resetToken: null, resetTokenExpiry: null, password: bcryptPassword }
    })
    // 6. generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    // 7. set JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
    // 8. return new user
    return updatedUser
  }
}

module.exports = Mutations
