const Mutations = {
  createItem(parent, args, ctx, info){
    //TODO: check if use logged in
    const item = ctx.db.mutation.createItem({
      data: {
        ...args
      }
    })
  }
};

module.exports = Mutations;
