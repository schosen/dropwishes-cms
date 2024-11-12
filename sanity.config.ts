import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig([{
  name: 'production-workspace',
  title: 'dropwishes-cms',
  subtitle: 'production',
  basePath: '/production',
  projectId: 'xwx8yp3c',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
},  {
  name: 'development-workspace',
  title: 'dropwishes-cms',
  subtitle: 'development',
  basePath: '/development',
  projectId: `xwx8yp3c`,
  dataset: 'development',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
  },])
