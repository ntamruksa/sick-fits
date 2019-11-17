const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
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
    const token = jwt.sign({ userId: user.id}, process.env.APP_SECRET)
    // set cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
    // return user to browser
    return user
  }
}

module.exports = Mutations
