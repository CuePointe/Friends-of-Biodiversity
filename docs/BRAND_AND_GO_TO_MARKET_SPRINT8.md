# Friends of Biodiversity — Sprint 8 product architecture

## Product hierarchy

**UBF** — the institution  
↓  
**Friends of Biodiversity** — the membership movement  
↓  
**Green Card** — your membership  
↓  
**FoB App** — your digital relationship with the movement  
↓  
**Citizen Science** — your opportunity to contribute biodiversity intelligence  
↓  
**Conservation Intelligence** — the institutional data product

## Network story

**Become part of Uganda's biodiversity intelligence network.**

You care → You join → You learn → You observe → You contribute evidence → UBF verifies it → Uganda understands its biodiversity better → institutions use better information → better decisions support better conservation → membership helps sustain the system.

## Three markets

### Citizens
Message: **Protect what you love.**  
Green Card, learning, community, events, citizen science and conservation badges.  
Goal: membership + engagement.

### Institutions
Message: **Put biodiversity into practice.**  
Institutional Green Card, ESG engagement, employee conservation programmes, biodiversity reporting, partnership programmes and citizen-science projects.  
Goal: institutional memberships + partnerships.

### Technical buyers
Message: **Better biodiversity evidence for better decisions.**  
Biodiversity data packs, research datasets, monitoring, dashboards and spatial intelligence.  
Goal: data/service revenue.

## Membership progression

- Student — **Participate**
- Silver — **Support**
- Gold — **Engage**
- Platinum — **Partner**
- Diamond — **Lead**

## Conservation identity

- 🔭 Observer
- 🌱 Habitat Protector
- 🦋 Species Guardian
- 🗺️ Field Explorer
- 🔬 Citizen Scientist
- 🤝 Conservation Connector
- 🏆 Conservation Champion

## Recurring storytelling formats

1. Meet the Species
2. Behind the Impact
3. Field Notes
4. One Number
5. Conservation Stories

## Uganda Biodiversity Pulse

The public Pulse presents live evidence-network indicators where data exists: species observed, verified observations, habitats represented, contributing citizen scientists, species requiring attention where conservation-status data is populated, and recent observation activity.

Filters currently supported by populated observation fields are **Year, Ecosystem and Species**. Region and Threat remain visible as planned dimensions but are explicitly marked pending until those fields are captured in the source data.

## Accountability trust engine

The public trust block displays published UBF programme metrics when present, together with a visible update date and **Source: UBF programme records**. Unpopulated metrics remain unreported rather than being replaced by invented figures.

## Visible release

The Sprint 8 branch is now a visible product release, not only a database foundation. It includes the strategic architecture layer, citizen-science workflow, Conservation Intelligence catalogue, Green Card workspace, staff intelligence cockpit and interactive Pulse controls.

The intended release branch is **`fob-8-sprint`**. The PWA service-worker cache is versioned to force the new feature layer after deployment.
