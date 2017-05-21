module.exports = function dereference (methodsToHandle = ['find', 'findOne', 'findOneAndDelete', 'findOneAndUpdate']) {
  return ({monkInstance}) => (next) => (args, method) => {
    return next(args, method).then((res) => {
      if (methodsToHandle.indexOf(method) === -1) {
        return res
      }
      if (!(args.options || {}).refMapping) {
        return res
      }
      if (!args.options.dereference) {
        return res
      }

      const isArrayResult = Array.isArray(res)

      const queries = Object.keys(args.options.dereference).reduce((prev, ref) => {
        if (!args.options.dereference[ref]) {
          return prev
        }
        const collectionTarget = args.options.refMapping[ref]
        if (!collectionTarget) {
          console.error('Missing mapping for ref ' + ref)
          return prev
        }
        if (!isArrayResult && !res[ref]) {
          return prev
        }
        const ids = isArrayResult ? res.reduce((_ids, o) => {
          if (o[ref]) {
            _ids.push(o[ref])
          }
          return _ids
        }, []) : [res[ref]]
        if (ids.length) {
          prev.push({
            ref,
            collectionTarget,
            query: ids.length > 1 ? {$in: ids} : ids[0],
            fields: args.options.dereference[ref] === true ? undefined : args.options.dereference[ref]
          })
        }
        return prev
      }, [])

      if (!queries.length) {
        return res
      }

      return Promise.all(queries.map(o => {
        return monkInstance.get(o.collectionTarget).find({_id: o.query}, o.fields)
      })).then((dereferences) => {
        if (isArrayResult) {
          res.forEach((o) => {
            dereferences.forEach((deref, i) => {
              const {ref} = queries[i]
              if (!o[ref]) {
                return
              }
              o[ref] = deref.find((d) => monkInstance.id(d._id).toHexString() === monkInstance.id(o[ref]).toHexString()) || o[ref]
            })
          })
        } else {
          dereferences.forEach((deref, i) => {
            const {ref} = queries[i]
            if (!res[ref]) {
              return
            }
            res[ref] = deref.find((d) => monkInstance.id(d._id).toHexString() === monkInstance.id(res[ref]).toHexString()) || res[ref]
          })
        }
        return res
      })
    })
  }
}
