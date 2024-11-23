// Script to create a send dummy post data to sanity data lake

import {getCliClient} from 'sanity/cli'
import {faker} from '@faker-js/faker'
import pLimit from 'p-limit'
import type {SanityDocumentLike, FieldDefinition} from 'sanity'
import {htmlToBlocks} from '@sanity/block-tools'
import {Schema} from '@sanity/schema'
import {JSDOM} from 'jsdom'
import {schemaTypes} from '../schemaTypes'


const client = getCliClient().withConfig({
  dataset: 'development'
})
// const client = getCliClient()

const POST_COUNT = 10
const CATEGORY_COUNT = 5
const AUTHOR_COUNT = 4
const BATCHES_COUNT = 2
const args = process.argv.slice(2)
const batchesArg = args.find((arg) => arg.startsWith('batches='))?.split('=')[1]
const batches = batchesArg ? parseInt(batchesArg) : BATCHES_COUNT
const limit = pLimit(1)

const defaultSchema = Schema.compile({types: schemaTypes})
const blockContentSchema = defaultSchema
  .get('post')
  .fields.find((field: FieldDefinition) => field.name === 'body').type

// Create 2-5 paragraphs of fake block content
function createFakeBlockContent() {
  const html = Array.from({length: faker.number.int({min: 2, max: 5})})
    .map(() => `<p>${faker.lorem.paragraph({min: 2, max: 5})}</p>`)
    .join(``)
  return htmlToBlocks(html, blockContentSchema, {
    parseHtml: (html) => new JSDOM(html).window.document,
  })
}

async function createData() {
  console.log(`Create new data with:`)
  console.log(`Project ID: ${client.config().projectId}`)
  console.log(`Dataset: ${client.config().dataset}`)
  console.log(`Deleting previously faked posts authors and categories...`)
  await client.delete({query: `*[_type in ["post", "category", "author"] && fake == true]`})

  //   CREATING CATEGORIES
  const categories: SanityDocumentLike[] = []

  for (let categoryI = 0; categoryI < CATEGORY_COUNT; categoryI++) {
    categories.push({
      _type: 'category',
      _id: faker.string.uuid(),
      title: faker.company.catchPhraseAdjective(),
      fake: true,
    })
  }

  const categoriesTransaction = client.transaction()

  for (let categoryI = 0; categoryI < categories.length; categoryI++) {
    categoriesTransaction.create(categories[categoryI])
  }

  const categoriesBatch = limit(async () => {
    return categoriesTransaction
      .commit()
      .then(() => {
        console.log(`Created ${CATEGORY_COUNT} categories`)
      })
      .catch((err) => {
        console.error(err)
      })
  })

    //  CREATING AUTHORS
  const authors: SanityDocumentLike[] = []

  for (let authorI = 0; authorI < AUTHOR_COUNT; authorI++) {
    const imageUrl = faker.image.avatar()
    const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer())
    const imageAsset = await client.assets.upload('image', Buffer.from(imageBuffer))

    authors.push({
      _type: 'author',
      _id: faker.string.uuid(),
      name: faker.person.fullName(),
      image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAsset._id,
            },
          },
      fake: true,
    })
  }

  const authorsTransaction = client.transaction()

  for (let authorI = 0; authorI < authors.length; authorI++) {
    authorsTransaction.create(authors[authorI])
  }

  const authorsBatch = limit(async () => {
    return authorsTransaction
      .commit()
      .then(() => {
        console.log(`Created ${AUTHOR_COUNT} authors`)
      })
      .catch((err) => {
        console.error(err)
      })
  })


  //   CREATING POSTS
  console.log(`Preparing ${batches} batches of ${POST_COUNT} posts...`)

  const postsBatches = Array.from({length: batches}).map((_, batchIndex) => {
    limit(async () => {
      const posts: SanityDocumentLike[] = []

      for (let postI = 0; postI < POST_COUNT; postI++) {
        const imageUrl = faker.image.urlPicsumPhotos({width: 800, height: 600})
        const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer())
        const imageAsset = await client.assets.upload('image', Buffer.from(imageBuffer))
        const randomString = Math.random().toString(36).substring(2, 14);


        posts.push({
          _type: 'post',
          _id: faker.string.uuid(),
          title: faker.company.catchPhrase(),
          excerpt: faker.commerce.productDescription(),
          slug: {
            _type: 'slug',
            current: faker.lorem.slug(5),
          },
          author:{
            _type: 'reference',
            _ref: authors[Math.floor(Math.random() * AUTHOR_COUNT)]._id,
          },
          categories: [{
            _type: 'reference',
            _ref: categories[Math.floor(Math.random() * CATEGORY_COUNT)]._id,
            _key: randomString,
          }],
          mainImage: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAsset._id,
            },
          },
          body: createFakeBlockContent(),
          fake: true,
        })
      }

      const postTransaction = client.transaction()

      for (let postI = 0; postI < posts.length; postI++) {
        postTransaction.create(posts[postI])
      }

      return postTransaction
        .commit()
        .then(() => {
          console.log(`Post batch ${batchIndex + 1} Complete`)

          if (limit.pendingCount === 0) {
            console.log(`All batches complete!`)
          }
        })
        .catch((err) => {
          console.error(err)
        })
    })
  })

  await Promise.all([categoriesBatch, authorsBatch, ...postsBatches])
}

createData()


// script commands to run:
// npx sanity@latest exec scripts/createData.ts
// npx sanity@latest exec scripts/createData.ts --with-user-token
// npx sanity@latest exec scripts/createData.ts --with-user-token -- batches=3

