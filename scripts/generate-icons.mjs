import sharp from 'sharp'
import { readFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const publicDir = join(__dirname, '..', 'public')
const iconsDir = join(publicDir, 'icons')
const splashDir = join(publicDir, 'splash')

// Ensure directories exist
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true })
if (!existsSync(splashDir)) mkdirSync(splashDir, { recursive: true })

// Read the SVG
const svgBuffer = readFileSync(join(iconsDir, 'icon.svg'))

// Icon sizes for PWA
const iconSizes = [32, 72, 96, 128, 144, 152, 180, 192, 384, 512]

// Splash screen sizes (width x height)
const splashSizes = [
  { width: 640, height: 1136, name: 'splash-640x1136' },
  { width: 750, height: 1334, name: 'splash-750x1334' },
  { width: 1242, height: 2208, name: 'splash-1242x2208' },
  { width: 1125, height: 2436, name: 'splash-1125x2436' },
  { width: 1170, height: 2532, name: 'splash-1170x2532' },
]

async function generateIcons() {
  console.log('Generating PWA icons...')

  for (const size of iconSizes) {
    const filename = size === 180 ? 'apple-icon-180x180.png' : `icon-${size}x${size}.png`
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, filename))
    console.log(`  Created ${filename}`)
  }
}

async function generateSplashScreens() {
  console.log('Generating splash screens...')

  for (const { width, height, name } of splashSizes) {
    // Calculate icon size (about 20% of smallest dimension)
    const iconSize = Math.min(width, height) * 0.2

    // Create a dark background with centered icon
    const icon = await sharp(svgBuffer)
      .resize(Math.round(iconSize), Math.round(iconSize))
      .png()
      .toBuffer()

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 10, g: 10, b: 15, alpha: 1 },
      },
    })
      .composite([
        {
          input: icon,
          top: Math.round((height - iconSize) / 2),
          left: Math.round((width - iconSize) / 2),
        },
      ])
      .png()
      .toFile(join(splashDir, `${name}.png`))

    console.log(`  Created ${name}.png`)
  }
}

async function main() {
  try {
    await generateIcons()
    await generateSplashScreens()
    console.log('\nAll icons and splash screens generated successfully!')
  } catch (error) {
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

main()
