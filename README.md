# Sanity Blogging Content Studio

Congratulations, you have now installed the Sanity Content Studio, an open-source real-time content editing environment connected to the Sanity backend.

Now you can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- Check out the example frontend: [React/Next.js](https://github.com/sanity-io/tutorial-sanity-blog-react-next)
- [Read the blog post about this template](https://www.sanity.io/blog/build-your-own-blog-with-sanity-and-next-js?utm_source=readme)
- [Join the community Slack](https://slack.sanity.io/?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)


# Dummy blog posts for testing

There is a script `/scripts/createData.ts` that you can run to create fake/ dummy blog posts for testing purposes, this can create the blogpost, author and categories

To create dummy blog posts
```
npx sanity@latest exec scripts/createData.ts --with-user-token --batches=3
```
`--batches=3` represents the amount of batches of posts you want to create, this can be changed to any number so far 1 batch = 10 blog posts, 5 categoris and 3 authors. default batch if flag is not supplied is 2 batches

`--with-user-token` represents the user logged into sanity with, this is the user account.
