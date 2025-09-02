# SagaBorn D100 Next.js Project

## Project Overview
Building a modern web application for the SagaBorn D100 tabletop RPG system. Starting with a content-driven SRD site that will evolve into a full character management platform similar to D&D Beyond.

**Repository**: https://github.com/daneclarkcollins/d100srd-next.git  
**Local Path**: ~/Sites/SagaBorn/d100srd  
**Tech Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, MDX, Supabase  
**Deployment**: Vercel (automatic deploys from main branch)  
**Database**: Supabase (PostgreSQL with Auth)

## Project Goals

### Phase 1: SRD Site ✅
- Markdown-based content management for rules
- Hot-reload development environment
- Admin UI for Mike to edit content
- SEO-optimized static pages
- Mobile-responsive design

### Phase 2: Interactive Tools (Current)
- Character creation tool (porting from WordPress prototype)
- User authentication with Supabase ✅
- Save/load characters to database
- Dice roller
- Spell reference

### Phase 3: Character Management
- Character sheets with live editing
- Export to PDF
- Share character links
- Party management

### Phase 4: Full Platform
- Real-time character HP/status tracking
- Campaign management
- DM tools
- Mobile apps (React Native)

## Directory Structure

```
d100srd/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Homepage
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   ├── signup/
│   │   │   └── page.tsx     # Signup page
│   │   └── callback/
│   │       └── route.ts     # Auth callback handler
│   ├── account/             # User account pages
│   │   ├── page.tsx         # Account dashboard
│   │   └── characters/      # Character management
│   ├── rules/               # Rules section
│   │   ├── [slug]/
│   │   │   └── page.tsx     # Dynamic rule pages
│   │   └── page.tsx         # Rules index
│   ├── tools/               # Interactive tools
│   │   ├── character-builder/
│   │   │   └── page.tsx     # Character builder
│   │   └── dice-roller/
│   │       └── page.tsx
│   ├── admin/               # Admin interface
│   │   ├── layout.tsx       # Admin layout
│   │   ├── page.tsx         # Admin dashboard
│   │   └── edit/
│   │       └── [...path]/
│   │           └── page.tsx # Dynamic editor
│   └── api/                 # API routes
│       ├── auth/            # Auth endpoints
│       ├── content/         # Content management
│       └── characters/      # Character API
├── content/                 # Markdown content (Mike edits here)
│   ├── rules/              # Game rules
│   ├── classes/            # Character classes
│   ├── races/              # Character races/species
│   ├── spells/             # Spell descriptions
│   └── equipment/          # Items and gear
├── components/             # React components
│   ├── CharacterBuilder/   # Character creation tool
│   ├── DiceRoller/        # Dice rolling component
│   ├── Navigation/        # Site navigation
│   ├── MarkdownEditor/    # Admin editor
│   ├── auth/              # Auth components
│   │   ├── AuthProvider.tsx
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   └── ui/                # Shared UI components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase client & utils
│   │   ├── client.ts     # Browser client
│   │   ├── server.ts     # Server client
│   │   └── middleware.ts # Auth middleware
│   ├── markdown.ts       # Markdown processing
│   ├── game-mechanics.ts # Game calculations
│   └── types.ts          # TypeScript types
├── public/               # Static assets
│   ├── images/
│   └── fonts/
├── reference/            # Original files for reference
│   ├── Char_Gen_skills.html
│   ├── Char_Gen_vr1.tsx
│   └── game-rules/
├── types/                # TypeScript definitions
│   ├── database.types.ts # Supabase generated types
│   └── game.types.ts    # Game-specific types
└── styles/
    └── globals.css       # Global styles
```

## Database Schema

### Authentication Tables (Supabase Auth)
```sql
auth.users                    # Managed by Supabase
├── id (UUID)
├── email (TEXT)
├── created_at (TIMESTAMP)
└── [other auth fields]
```

### Application Tables

#### User Profiles
```sql
public.profiles               # User profile data
├── id (UUID, references auth.users)
├── email (TEXT)
├── username (TEXT, UNIQUE)
├── display_name (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Policies:
- Users can view own profile
- Users can update own profile
- Service role for trigger access
```

#### Characters
```sql
public.characters            # Character data
├── id (UUID, PRIMARY KEY)
├── user_id (UUID, references auth.users)
├── name (TEXT, NOT NULL)
├── species (TEXT)
├── profession (TEXT)
├── archetype (TEXT)
├── characteristics (JSONB)
│   └── {STR, CON, SIZ, INT, ACU, DEX, SOC}
├── derived_stats (JSONB)
│   └── {effort, stamina, intellect, spirit, agility, charm, 
│        hitPoints, spiritPoints, damageModifier, experienceBonus}
├── skills (JSONB)
│   └── {skillName: points, ...}
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Policies:
- Users can CRUD own characters only
```

#### Character Sessions
```sql
public.character_profiles    # Session/play data
├── id (UUID)
├── user_id (UUID, references auth.users)
├── character_id (UUID, references characters)
├── current_hp (INTEGER)
├── current_sp (INTEGER)
├── notes (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Policies:
- Users can manage own character profiles
```

### Database Triggers

#### Auto-create Profile on Signup
```sql
Function: handle_new_user()
Trigger: on_auth_user_created
Action: Creates profile with username from email
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-key]  # Server-only
```

## Development Setup

### Initial Setup
```bash
# Clone the repository
cd ~/Sites/SagaBorn
git clone https://github.com/daneclarkcollins/d100srd-next.git d100srd
cd d100srd

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Generate TypeScript types from Supabase
npm run supabase:types

# Run development server
npm run dev
```

### Daily Development
```bash
cd ~/Sites/SagaBorn/d100srd
npm run dev
# Visit http://localhost:3000
```

### Database Updates
```bash
# Generate new types after schema changes
npm run supabase:types

# Run migrations (if using Supabase CLI)
supabase db push
```

## Content Management

### For Mike - Editing Content

#### Option 1: Direct File Editing
1. Navigate to `/content` folder
2. Edit `.mdx` files with any text editor
3. Save to see changes immediately on local site

#### Option 2: Admin UI
1. Visit http://localhost:3000/admin
2. Browse content structure
3. Click any file to edit
4. Live preview on the right
5. Save to update file

#### Option 3: Obsidian (Recommended)
1. Download Obsidian (free)
2. Open vault → Choose `/content` folder
3. Edit with visual preview
4. Files auto-save

### MDX Format
```mdx
---
title: "Combat Rules"
description: "How combat works in SagaBorn"
order: 2
category: "core-rules"
---

# Combat Rules

Combat in SagaBorn is fast and deadly...

## Initiative

Roll 1d10 + DEX modifier

<DiceRoller dice="1d10" modifier="dex" />
```

## Authentication Flow

### Sign Up Process
1. User submits email/password
2. Supabase creates auth.users entry
3. Trigger creates profiles entry with username
4. User redirected to /account

### Sign In Process
1. User submits credentials
2. Supabase validates
3. Session created
4. User redirected to previous page or /account

### Protected Routes
Routes requiring authentication:
- `/account/*` - User dashboard
- `/tools/character-builder` (save feature)
- `/admin/*` - Admin only

## Game Mechanics Implementation

### Character Creation Flow
1. **Species Selection** → Terian/Fey/Elven
2. **Biology/Culture** → Subspecies options
3. **Heritage** → Bonus traits
4. **Profession** → Starting skills/equipment
5. **Archetype** → Warrior/Expert/Mage
6. **Characteristics** → Point-buy or random
7. **Skills** → Professional (250pts) + Personal (INT×10)

### Core Calculations
```typescript
// Derived Stats
effort = STR × 5
stamina = CON × 5
intellect = INT × 5
spirit = ACU × 5
agility = DEX × 5
charm = SOC × 5
hitPoints = CON + SIZ
spiritPoints = ACU

// Damage Modifier (STR + SIZ)
≤12: -2
13-16: -1
17-24: None
25-32: +1d4
33-40: +1d6
41-56: +2d6
57-72: +3d6
73-88: +4d6
89-104: +5d6
105+: +6d6

// Skill Total
total = baseChance + categoryBonus + allocatedPoints
categoryBonus = Math.ceil(characteristic / 2)
max starting skill = 75%
```

### Skill Categories
```typescript
communication: ['Bargain', 'Command', 'Disguise', 'Etiquette', 
                'Fast Talk', 'Perform', 'Persuade', 'Teach']
perception: ['Insight', 'Listen', 'Navigate', 'Research', 
             'Sense', 'Spot', 'Track']
dexterous: ['Acrobatics', 'Art', 'Craft', 'Fine Manipulation', 
            'Hide', 'Repair', 'Sleight of Hand', 'Stealth']
mental: ['Appraise', 'First Aid', 'Gaming', 'Knowledge', 
         'Language', 'Medicine', 'Strategy', 'Spellcraft', 'Survival']
physical: ['Athletics', 'Climb', 'Drive', 'Jump', 'Pilot (Land)', 
           'Pilot (Sea)', 'Pilot (Air)', 'Ride', 'Swim', 'Throw']
combat: ['Brawl', 'Bludgeon Weapons', 'Dodge', 'Grapple', 
         'Martial Arts', 'Piercing Weapons', 'Ranged Weapons', 
         'Shield', 'Siege Weapons', 'Slashing Weapons']
```

## API Structure

### Content API
```
GET  /api/content/[type]/[slug]  # Get single content
GET  /api/content/[type]         # List all of type
POST /api/content/[type]         # Create (admin)
PUT  /api/content/[type]/[slug]  # Update (admin)
```

### Character API
```
POST   /api/characters           # Save character
GET    /api/characters           # List user's characters
GET    /api/characters/[id]      # Get character
PUT    /api/characters/[id]      # Update character
DELETE /api/characters/[id]      # Delete character
```

## Deployment

### Vercel Configuration
- **Connected to**: GitHub main branch
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment Variables**: 
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY

### Auto-Deploy Process
1. Push to GitHub: `git push origin main`
2. Vercel automatically builds
3. Live at: [your-domain].vercel.app
4. Custom domain: d100srd.com (when ready)

## Key Features Status

### Complete ✅
- Basic Next.js setup with MDX
- User authentication (Supabase)
- Database schema for users/characters
- Protected routes

### In Progress 🚧
- Port character builder from HTML prototype
- Character save/load functionality
- Admin editor UI for Mike

### Planned 📋
- Dice roller component
- Search functionality
- Spell reference tool
- Equipment browser
- Export to PDF
- Share character links
- Campaign management
- DM tools
- Combat tracker
- Mobile app

## Common Tasks

### Add New Rule Page
1. Create `/content/rules/new-rule.mdx`
2. Add frontmatter and content
3. Automatically appears in navigation

### Add Interactive Component
1. Create component in `/components`
2. Import in `/components/MDXComponents.tsx`
3. Use in any MDX file: `<ComponentName />`

### Update Navigation
Edit `/components/Navigation/Navigation.tsx`

### Change Styles
- Global: `/styles/globals.css`
- Component: Use Tailwind classes
- Theme: Update `tailwind.config.js`

### Test Authentication
```bash
# Run diagnostic
npm run dev
# Visit http://localhost:3000/test/auth-diagnostic
```

## Troubleshooting

### Hot Reload Not Working
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Build Errors
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting errors  
npm run lint
```

### MDX Not Rendering
- Check frontmatter format (needs `---`)
- Verify file extension is `.mdx`
- Check for JSX syntax errors

### Auth Issues
- Verify environment variables are set
- Check Supabase dashboard for auth settings
- Ensure email confirmations are disabled for testing
- Check database triggers and RLS policies

### Database Issues
- Regenerate types: `npm run supabase:types`
- Check RLS policies in Supabase dashboard
- Verify foreign key relationships
- Check trigger functions are active

## Reference Files

### From WordPress Project
- `Char_Gen_skills.html` - Complete character generator logic with skills system
- `Char_Gen_vr1.tsx` - React component structure for character builder
- Game rules documents - Content to migrate

### Key Patterns from Reference
- Dice rolling: `rollDice(sides, count)`
- Character state management with React hooks
- Skill calculations and point allocation
- Point-buy system for characteristics
- Professional vs Personal skill points
- Printable character sheet generation

## Contact & Support

- **Developer**: Dane (GitHub: daneclarkcollins)
- **Content**: Mike (admin UI access)
- **Repository**: https://github.com/daneclarkcollins/d100srd-next.git
- **Supabase Project**: Check dashboard for logs and monitoring

## Version History

- v0.1.0 - Initial Next.js setup with MDX
- v0.2.0 - Added Supabase authentication
- v0.3.0 - Database schema for characters (Current)

---

*Last Updated: November 2024*
*Next Priority: Complete character builder port with save functionality*