export interface CrawfishSpot {
    id: string
    name: string
    address: string
    neighborhood: string
    lat: number
    lng: number
    phone?: string
    priceRange?: string
    notes?: string
    specialty?: string
    website?: string
}

export interface RecipeStep {
    id: number
    instruction: string
    tip?: string
}

export interface BoilRecipe {
    title: string
    servings: string
    prepTime: string
    cookTime: string
    totalTime: string
    equipment: string[]
    ingredients: { item: string; amount: string }[]
    steps: RecipeStep[]
}

export interface CrawfishFaq {
    id: number
    question: string
    answer: string
}

export interface CrawfishTip {
    id: number
    title: string
    description: string
    icon: string
}

// ── Markets: Best Places to Buy Live Crawfish by the Sack ────────────

export const crawfishMarkets: CrawfishSpot[] = [
    {
        id: 'quality-seafood',
        name: 'Quality Seafood Market',
        address: '5621 Airport Blvd',
        neighborhood: 'North Loop',
        lat: 30.3226,
        lng: -97.7109,
        phone: '(512) 454-5827',
        priceRange: '$$',
        notes: 'Austin institution since 1938. Live crawfish by the sack in season. They\'ll also boil them for you on-site.',
        website: 'https://qualityseafoodmarket.com',
    },
    {
        id: '99-ranch',
        name: '99 Ranch Market',
        address: '10901 N Lamar Blvd',
        neighborhood: 'North Austin',
        lat: 30.3938,
        lng: -97.6973,
        phone: '(512) 833-8899',
        priceRange: '$',
        notes: 'Huge Asian supermarket with consistently competitive prices on live crawfish. Often the cheapest option in town.',
    },
    {
        id: 'h-mart',
        name: 'H Mart Austin',
        address: '11301 Lakeline Blvd',
        neighborhood: 'Cedar Park',
        lat: 30.4706,
        lng: -97.7998,
        phone: '(512) 520-6255',
        priceRange: '$',
        notes: 'Korean supermarket with excellent seafood section. Reliably stocked during crawfish season with good prices.',
    },
    {
        id: 'la-crawfish',
        name: 'LA Crawfish',
        address: '10901 N Lamar Blvd Ste A-600',
        neighborhood: 'North Austin',
        lat: 30.3940,
        lng: -97.6980,
        phone: '(512) 339-0000',
        priceRange: '$$',
        notes: 'Both a restaurant and a market. Buy live crawfish by the sack or have them boil it Viet-Cajun style for you.',
        specialty: 'Viet-Cajun',
    },
    {
        id: 'fiesta-mart',
        name: 'Fiesta Mart',
        address: '3909 N IH 35',
        neighborhood: 'East Austin',
        lat: 30.2870,
        lng: -97.7121,
        phone: '(512) 406-3900',
        priceRange: '$',
        notes: 'Budget-friendly option. Look for weekend specials on live crawfish during peak season (March–May).',
    },
    {
        id: 'mt-supermarket',
        name: 'MT Supermarket',
        address: '6929 Airport Blvd Ste 101',
        neighborhood: 'North Austin',
        lat: 30.3405,
        lng: -97.6988,
        phone: '(512) 454-4804',
        priceRange: '$',
        notes: 'Vietnamese supermarket with great prices on live crawfish. Popular with locals who do their own boils.',
    },
]

// ── Restaurants: Best Places to Eat Crawfish in Austin ───────────────

export const crawfishRestaurants: CrawfishSpot[] = [
    {
        id: 'the-boiling-pot',
        name: 'The Boiling Pot',
        address: '12514 Research Blvd',
        neighborhood: 'North Austin',
        lat: 30.4200,
        lng: -97.7547,
        phone: '(512) 614-5900',
        priceRange: '$$',
        specialty: 'Cajun seafood boils',
        notes: 'The quintessential Austin crawfish boil spot. They dump your order straight on the table — no plates needed. Messy, loud, and perfect.',
    },
    {
        id: 'crawfish-shack',
        name: 'Cajun Crawfish Shack',
        address: '515 W Braker Ln Ste B',
        neighborhood: 'North Austin',
        lat: 30.3917,
        lng: -97.7203,
        specialty: 'Cajun boils',
        priceRange: '$$',
        notes: 'No-frills strip mall gem with serious Cajun flavors. Their spice levels range from mild to "call your mama" hot.',
    },
    {
        id: 'la-crawfish-restaurant',
        name: 'LA Crawfish',
        address: '10901 N Lamar Blvd Ste A-600',
        neighborhood: 'North Austin',
        lat: 30.3940,
        lng: -97.6980,
        phone: '(512) 339-0000',
        priceRange: '$$',
        specialty: 'Viet-Cajun garlic butter crawfish',
        notes: 'The Viet-Cajun garlic butter crawfish is legendary. Rich, buttery, garlicky — a fusion that Austin has fully embraced.',
    },
    {
        id: 'evangeline-cafe',
        name: 'Evangeline Café',
        address: '8106 Brodie Ln',
        neighborhood: 'South Austin',
        lat: 30.2049,
        lng: -97.8372,
        phone: '(512) 282-2586',
        priceRange: '$$',
        specialty: 'Traditional Cajun/Creole',
        notes: 'South Austin\'s Cajun institution. Crawfish étouffée is the star, but their boiled crawfish during season is the real move.',
    },
    {
        id: 'shoal-creek-saloon',
        name: 'Shoal Creek Saloon',
        address: '909 N Lamar Blvd',
        neighborhood: 'Downtown / Lamar',
        lat: 30.2756,
        lng: -97.7526,
        phone: '(512) 477-0600',
        priceRange: '$$',
        specialty: 'Cajun bar food & crawfish boils',
        notes: 'Downtown-area spot hosting regular crawfish boil events during season. Also serves great po\'boys and gumbo year-round.',
    },
    {
        id: 'the-parlor',
        name: 'The Parlor',
        address: '601 W 6th St',
        neighborhood: 'West 6th',
        lat: 30.2696,
        lng: -97.7505,
        phone: '(512) 469-7790',
        priceRange: '$$$',
        specialty: 'Upscale crawfish dishes',
        notes: 'For those who want crawfish with a cocktail in a stylish setting. Their crawfish pasta and seasonal specials elevate the mudbugs.',
    },
]

// ── Recipe: How to Boil Crawfish (Cajun-style) ──────────────────────

export const boilRecipe: BoilRecipe = {
    title: 'Classic Cajun Crawfish Boil',
    servings: '8–10 people (one 30 lb sack)',
    prepTime: '30 minutes',
    cookTime: '30 minutes',
    totalTime: '1 hour (plus soaking)',
    equipment: [
        'One large boiling pot (60+ quart)',
        'Wire basket insert for pot',
        'Lid for pot',
        'Outdoor propane cooker',
        'Large tub or two ice chests',
        'Stirring paddle (or big spoon)',
    ],
    ingredients: [
        { item: 'Live crawfish', amount: '30 lbs (1 sack)' },
        { item: 'Seafood boil seasoning (Zatarain\'s or Fruge\'s)', amount: '3 lbs' },
        { item: 'Small red potatoes', amount: '8' },
        { item: 'Ears of corn', amount: '8 (halved)' },
        { item: 'Small onions', amount: '8 (halved)' },
        { item: 'Fresh garlic', amount: '2 whole heads' },
        { item: 'Lemons', amount: '4 (halved)' },
        { item: 'Fresh mushrooms', amount: '1 lb' },
        { item: 'Andouille sausage (optional)', amount: '2 lbs (sliced)' },
        { item: 'Cold beer', amount: 'Two six-packs (minimum)' },
    ],
    steps: [
        {
            id: 1,
            instruction: 'Rinse the crawfish thoroughly with clean water until the draining water runs clear. No need to "purge" with salt — a good rinse is all you need.',
            tip: 'Discard any dead crawfish (straight tails = dead). Live ones will curl their tails.',
        },
        {
            id: 2,
            instruction: 'Fill your large pot about half full with fresh water. Place on the outdoor propane cooker, light the burner, cover with the lid, and bring to a rolling boil.',
        },
        {
            id: 3,
            instruction: 'While waiting for the water to boil, give the crawfish another rinse with cool water. Open a beer. You\'re going to be here a while.',
        },
        {
            id: 4,
            instruction: 'Add about 1 lb of seafood boil seasoning to the boiling water. Let it dissolve and mix well for a minute or two. The kitchen (or backyard) should start smelling incredible.',
        },
        {
            id: 5,
            instruction: 'Drop in all the halved onions, potatoes, whole garlic heads, and sausage (if using). Let cook for about 10–15 minutes, keeping an eye on the potatoes.',
            tip: 'Check potatoes with a knife — slightly underdone is perfect. They\'ll keep cooking in the ice chest later. Nobody wants crawfish boil mashed potatoes.',
        },
        {
            id: 6,
            instruction: 'Add the corn and mushrooms. Cook for another 5 minutes. Then lower the fire, remove the basket, and transfer the vegetables to a clean ice chest to stay warm.',
        },
        {
            id: 7,
            instruction: 'Crank the heat back up. Add another generous helping of seasoning (~25 oz). Squeeze the lemon halves into the water, then toss the squeezed lemons in too.',
        },
        {
            id: 8,
            instruction: 'When the water returns to a boil, carefully lower the basket of crawfish into the pot. Cover with the lid. Drink another beer while you wait.',
        },
        {
            id: 9,
            instruction: 'Once the water comes back to a rolling boil, let it boil for exactly 2 minutes, then KILL THE FIRE. This is the most important step — overcooking makes them tough.',
            tip: 'Add a bag of ice or cold water to stop the boil immediately. This also helps the crawfish absorb more spicy juices.',
        },
        {
            id: 10,
            instruction: 'Let the crawfish soak in the hot, spicy water for 15–20 minutes. Most will sink to the bottom and fill with those delicious juices. Patience pays off here.',
        },
        {
            id: 11,
            instruction: 'Remove the crawfish from the pot and dump into an ice chest. Have a friend sprinkle the remaining seasoning over the top while you mix everything together. Let it steam for 5 minutes.',
        },
        {
            id: 12,
            instruction: 'Dump everything out on newspaper-covered tables, or serve straight from the ice chest (keeps things hot). Grab a cold beer, dig in, and enjoy. The vegetables are for guests who can\'t figure out how to peel crawfish.',
            tip: 'Pro peeling technique: twist the tail from the head, pinch the bottom of the tail, and pull out the meat. Don\'t forget to suck the head — that\'s where the good stuff is.',
        },
    ],
}

// ── FAQs ─────────────────────────────────────────────────────────────

export const crawfishFaqs: CrawfishFaq[] = [
    {
        id: 1,
        question: 'When is crawfish season in Austin?',
        answer: 'Crawfish season in Texas typically runs from late January through June, with peak season being March through May. That\'s when you\'ll find the biggest, fattest mudbugs at the best prices. Early season crawfish tend to be smaller and pricier.',
    },
    {
        id: 2,
        question: 'How much crawfish do I need per person?',
        answer: 'Plan for about 3–5 lbs of live crawfish per person. A standard sack is 30 lbs, which comfortably feeds 8–10 people when you include corn, potatoes, and sausage. For serious crawfish lovers, budget closer to 5 lbs each.',
    },
    {
        id: 3,
        question: 'How do I tell if crawfish are fresh?',
        answer: 'Live crawfish should be active and feisty. A curled tail means it was alive when it went in the pot — straight tails mean dead before cooking. At the market, look for crawfish that move when you poke them. Avoid sacks that smell overly fishy or have a lot of dead ones on top.',
    },
    {
        id: 4,
        question: 'Do I need to purge crawfish with salt?',
        answer: 'This is a hot debate in Louisiana, but the short answer is no. LSU AgCenter research showed that salt purging doesn\'t effectively clean crawfish and actually kills some of them. A thorough rinse with clean water until the water runs clear is all you need.',
    },
    {
        id: 5,
        question: 'What\'s the best beer to drink with crawfish?',
        answer: 'Cold, light, and cheap is the move. Lone Star, Shiner Bock, Pearl, or Abita are all classic picks. The spice will dominate your palate anyway, so save the craft IPAs for another day. Quantity over quality is the crawfish boil way.',
    },
    {
        id: 6,
        question: 'Are crawfish from Texas or Louisiana better?',
        answer: 'Most crawfish sold in Texas come from Louisiana farms, so you\'re getting Louisiana crawfish either way. Some markets carry Texas pond-raised crawfish which tend to be slightly smaller but perfectly good. The seasoning and technique matter far more than origin.',
    },
    {
        id: 7,
        question: 'Can I eat the crawfish head?',
        answer: 'You should! "Sucking the head" is an essential part of the experience. The head contains rich, flavorful fat (hepatopancreas) seasoned by the boil. Pinch the tail to get the meat, then put the head to your lips and suck out the juices. It\'s the best part.',
    },
    {
        id: 8,
        question: 'How much does a sack of crawfish cost in Austin?',
        answer: 'Prices vary throughout the season. Early season (January–February) can be $5–7 per lb. Peak season (March–May) prices drop to $2.50–4 per lb. A 30 lb sack typically costs $75–150 depending on timing and where you buy. Asian supermarkets like 99 Ranch often have the best prices.',
    },
]

// ── Pro Tips ─────────────────────────────────────────────────────────

export const crawfishTips: CrawfishTip[] = [
    {
        id: 1,
        title: 'Buy in Peak Season',
        description: 'March through May is prime time. Crawfish are biggest, prices are lowest, and availability is best. Don\'t bother with early season — you\'ll pay more for tiny mudbugs.',
        icon: 'i-lucide-calendar-check',
    },
    {
        id: 2,
        title: 'Don\'t Overcook',
        description: 'This is the #1 mistake. Boil for exactly 2 minutes after the water returns to a rolling boil, then kill the heat. The magic happens in the soak, not the boil.',
        icon: 'i-lucide-timer',
    },
    {
        id: 3,
        title: 'The Soak Is Everything',
        description: 'After killing the boil, let crawfish soak 15–20 minutes. This is when they absorb all that spicy, seasoned goodness. Longer soak = more flavor.',
        icon: 'i-lucide-droplets',
    },
    {
        id: 4,
        title: 'Suck the Heads',
        description: 'If you\'re not sucking the heads, you\'re missing the best part. The seasoned fat inside the head is liquid gold. Don\'t be shy — embrace the mess.',
        icon: 'i-lucide-flame',
    },
    {
        id: 5,
        title: 'Newspaper Is Your Tablecloth',
        description: 'No plates, no utensils, no forks. Dump everything on newspaper-covered tables and dig in with your hands. This is how it\'s done in Louisiana and how it should be done in Austin.',
        icon: 'i-lucide-newspaper',
    },
    {
        id: 6,
        title: 'Check Asian Markets First',
        description: '99 Ranch, H Mart, and MT Supermarket consistently have the best prices on live crawfish in Austin. They often beat traditional seafood markets by $1–2 per pound.',
        icon: 'i-lucide-store',
    },
]
