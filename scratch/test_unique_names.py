import urllib.request
import urllib.parse
import json

bbox = "12.88,77.50,13.10,77.72" # Bangalore Bounding Box

query = f"""[out:json][timeout:25];
(
  node["amenity"~"cafe|restaurant|bar|clinic|dentist|gym"]({bbox});
  node["shop"~"salon|hairdresser|bakery|car_repair|boutique"]({bbox});
  node["office"="estate_agent"]({bbox});
  node["leisure"="fitness_centre"]({bbox});
);
out body 350;"""

req = urllib.request.Request(
    'https://overpass-api.de/api/interpreter',
    data=urllib.parse.urlencode({'data': query}).encode('utf-8'),
    headers={'User-Agent': 'DevifyLabsLeadEngine/1.0 (devifylabs.com)'}
)

GENERIC_NAMES = {"clinic", "dental clinic", "restaurant", "cafe", "salon", "shop", "bakery", "doctor", "auto repair", "gym"}

with urllib.request.urlopen(req) as response:
    res = json.loads(response.read().decode('utf-8'))
    elements = res.get('elements', [])
    
    unique_distinct_leads = []
    for e in elements:
        tags = e.get('tags', {})
        name = tags.get('name', '').strip()
        has_website = Boolean = ('website' in tags) or ('contact:website' in tags)
        
        if name and not has_website:
            clean_name = name.lower()
            # Filter out purely generic names like "Dental Clinic" or "Restaurant"
            if clean_name in GENERIC_NAMES or len(name.split()) < 2:
                continue
            
            street = tags.get('addr:street') or tags.get('addr:full') or ''
            suburb = tags.get('addr:suburb') or tags.get('addr:district') or ''
            city = tags.get('addr:city') or 'Bengaluru'
            
            location_str = f"{street} {suburb} {city}".strip()
            if not location_str or location_str == 'Bengaluru':
                location_str = 'Bengaluru'

            lat = e.get('lat')
            lon = e.get('lon')
            
            # Exact search query with full street detail
            gmaps_query = f"{name} {location_str}".strip()
            gmaps_search_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(gmaps_query)}"
            gmaps_coord_url = f"https://www.google.com/maps?q={lat},{lon}"
            
            unique_distinct_leads.append({
                'name': name,
                'category': tags.get('amenity') or tags.get('shop') or tags.get('office'),
                'location': location_str,
                'gmaps_search_url': gmaps_search_url,
                'gmaps_coord_url': gmaps_coord_url
            })

    print(f"TOTAL DISTINCT UNIQUE BRANDED LEADS: {len(unique_distinct_leads)}")
    print("\nSAMPLE 10 DISTINCT BUSINESSES WITH EXACT GMAPS LINKS:")
    for i, lead in enumerate(unique_distinct_leads[:10]):
        print(f"{i+1}. {lead['name']} | Loc: {lead['location']}")
        print(f"   Search URL: {lead['gmaps_search_url']}")
        print(f"   Pin URL: {lead['gmaps_coord_url']}")
