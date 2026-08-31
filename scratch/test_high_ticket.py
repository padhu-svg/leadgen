import urllib.request
import urllib.parse
import json

bbox = "12.88,77.50,13.10,77.72" # Bangalore BBOX

high_ticket_query = f"""[out:json][timeout:25];
(
  node["amenity"~"clinic|dentist|doctors|veterinary|events_venue"]({bbox});
  node["office"~"accountant|lawyer|architect|consulting|estate_agent|financial"]({bbox});
  node["tourism"~"hotel|guest_house"]({bbox});
  node["leisure"~"resort|fitness_centre"]({bbox});
  node["shop"~"car_repair|motorcycle_repair|optician|interior_decorator"]({bbox});
);
out body 350;"""

req = urllib.request.Request(
    'https://overpass-api.de/api/interpreter',
    data=urllib.parse.urlencode({'data': high_ticket_query}).encode('utf-8'),
    headers={'User-Agent': 'DevifyHighTicketLeadEngine/2.0 (devifylabs.com)'}
)

with urllib.request.urlopen(req) as response:
    res = json.loads(response.read().decode('utf-8'))
    elements = res.get('elements', [])
    print(f"RAW OVERPASS HIGH-TICKET NODES RETURNED: {len(elements)}")

    no_web_high_ticket = []
    for e in elements:
        tags = e.get('tags', {})
        name = tags.get('name', '').strip()
        has_website = Boolean = ('website' in tags) or ('contact:website' in tags) or ('url' in tags)
        
        if name and not has_website:
            cat = tags.get('office') or tags.get('amenity') or tags.get('tourism') or tags.get('leisure') or tags.get('shop') or 'local_service'
            phone = tags.get('phone') or tags.get('contact:phone') or tags.get('contact:mobile') or 'N/A'
            street = tags.get('addr:street') or tags.get('addr:full') or ''
            suburb = tags.get('addr:suburb') or tags.get('addr:district') or ''
            
            no_web_high_ticket.append({
                'name': name,
                'category': cat.replace('_', ' ').title(),
                'location': f"{street} {suburb}".strip() or 'Bengaluru',
                'phone': phone,
                'lat': e.get('lat'),
                'lon': e.get('lon')
            })

    print(f"QUALIFIED HIGH-TICKET NO-WEBSITE LEADS: {len(no_web_high_ticket)}")
    print("\nTOP 10 HIGH-TICKET NO-WEBSITE LOCAL LEADS:")
    for i, l in enumerate(no_web_high_ticket[:10]):
        print(f"{i+1}. {l['name']} | Cat: {l['category']} | Loc: {l['location']} | Phone: {l['phone']}")
