import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'content')

export interface ContentItem {
  slug: string
  title: string
  description?: string
  content: string
  order?: number
  category?: string
  [key: string]: any
}

export function getContentByType(type: string): ContentItem[] {
  const typeDirectory = path.join(contentDirectory, type)
  
  if (!fs.existsSync(typeDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(typeDirectory)
  
  return fileNames
    .filter(fileName => fileName.endsWith('.mdx') || fileName.endsWith('.md'))
    .map(fileName => {
      const fullPath = path.join(typeDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      return {
        slug: fileName.replace(/\.mdx?$/, ''),
        content,
        title: data.title || fileName,
        ...data
      }
    })
    .sort((a, b) => ((a as any).order || 999) - ((b as any).order || 999))
}

export function getContentByTypeNested(type: string, subtype?: string): ContentItem[] {
  const typeDirectory = subtype 
    ? path.join(contentDirectory, type, subtype)
    : path.join(contentDirectory, type)
  
  if (!fs.existsSync(typeDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(typeDirectory)
  
  return fileNames
    .filter(fileName => fileName.endsWith('.mdx') || fileName.endsWith('.md'))
    .map(fileName => {
      const fullPath = path.join(typeDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      return {
        slug: fileName.replace(/\.mdx?$/, ''),
        content,
        title: data.title || fileName,
        ...data
      }
    })
    .sort((a, b) => ((a as any).order || 999) - ((b as any).order || 999))
}

export function getContentBySlug(type: string, slug: string): ContentItem | null {
  const fullPath = path.join(contentDirectory, type, `${slug}.mdx`)
  const altPath = path.join(contentDirectory, type, `${slug}.md`)
  
  let filePath = fs.existsSync(fullPath) ? fullPath : 
                 fs.existsSync(altPath) ? altPath : null
                 
  if (!filePath) return null
  
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)
  
  return {
    slug,
    content,
    title: data.title || slug,
    ...data
  }
}

export function getContentBySlugNested(type: string, subtype: string, slug: string): ContentItem | null {
  const fullPath = path.join(contentDirectory, type, subtype, `${slug}.mdx`)
  const altPath = path.join(contentDirectory, type, subtype, `${slug}.md`)
  
  let filePath = fs.existsSync(fullPath) ? fullPath : 
                 fs.existsSync(altPath) ? altPath : null
                 
  if (!filePath) return null
  
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)
  
  return {
    slug,
    content,
    title: data.title || slug,
    ...data
  }
}

export function getAllContentSlugs(type: string): string[] {
  const typeDirectory = path.join(contentDirectory, type)
  
  if (!fs.existsSync(typeDirectory)) {
    return []
  }
  
  return fs.readdirSync(typeDirectory)
    .filter(fileName => fileName.endsWith('.mdx') || fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.mdx?$/, ''))
}

export function getAllContentSlugsNested(type: string, subtype: string): string[] {
  const typeDirectory = path.join(contentDirectory, type, subtype)
  
  if (!fs.existsSync(typeDirectory)) {
    return []
  }
  
  return fs.readdirSync(typeDirectory)
    .filter(fileName => fileName.endsWith('.mdx') || fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.mdx?$/, ''))
}
