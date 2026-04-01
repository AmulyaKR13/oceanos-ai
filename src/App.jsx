import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const mapRef = useRef(null)
  const tooltipRef = useRef(null)
  const geojsonRef = useRef(null)
  const [activeCategories, setActiveCategories] = useState({
    pollution: true,
    biodiversity: true,
    resources: true
  })

  useEffect(() => {
    const d3 = window.d3
    if (!d3) {
      return
    }

    const svg = d3.select(mapRef.current)
    const tooltip = d3.select(tooltipRef.current)
    const geoUrl =
      'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'

    const coastalCountries = [
      'Albania',
      'Algeria',
      'Angola',
      'Antigua and Barbuda',
      'Argentina',
      'Australia',
      'Bahamas',
      'Bahrain',
      'Bangladesh',
      'Barbados',
      'Belgium',
      'Belize',
      'Benin',
      'Bosnia and Herzegovina',
      'Brazil',
      'Brunei',
      'Bulgaria',
      'Cambodia',
      'Cameroon',
      'Canada',
      'Cape Verde',
      'Chile',
      'China',
      'Colombia',
      'Comoros',
      'Costa Rica',
      'Cote d\'Ivoire',
      'Croatia',
      'Cuba',
      'Cyprus',
      'Denmark',
      'Djibouti',
      'Dominica',
      'Dominican Republic',
      'Ecuador',
      'Egypt',
      'El Salvador',
      'Equatorial Guinea',
      'Eritrea',
      'Estonia',
      'Fiji',
      'Finland',
      'France',
      'Gabon',
      'Gambia',
      'Georgia',
      'Germany',
      'Ghana',
      'Greece',
      'Grenada',
      'Guatemala',
      'Guinea',
      'Guinea-Bissau',
      'Guyana',
      'Haiti',
      'Honduras',
      'Iceland',
      'India',
      'Indonesia',
      'Iran',
      'Iraq',
      'Ireland',
      'Israel',
      'Italy',
      'Jamaica',
      'Japan',
      'Jordan',
      'Kenya',
      'Kiribati',
      'Kuwait',
      'Latvia',
      'Lebanon',
      'Liberia',
      'Libya',
      'Lithuania',
      'Madagascar',
      'Malaysia',
      'Maldives',
      'Malta',
      'Marshall Islands',
      'Mauritania',
      'Mauritius',
      'Mexico',
      'Micronesia',
      'Monaco',
      'Montenegro',
      'Morocco',
      'Mozambique',
      'Myanmar',
      'Namibia',
      'Nauru',
      'Netherlands',
      'New Zealand',
      'Nicaragua',
      'Nigeria',
      'North Korea',
      'Norway',
      'Oman',
      'Pakistan',
      'Palau',
      'Panama',
      'Papua New Guinea',
      'Peru',
      'Philippines',
      'Poland',
      'Portugal',
      'Qatar',
      'Romania',
      'Russia',
      'Saint Kitts and Nevis',
      'Saint Lucia',
      'Saint Vincent and the Grenadines',
      'Samoa',
      'Sao Tome and Principe',
      'Saudi Arabia',
      'Senegal',
      'Seychelles',
      'Sierra Leone',
      'Singapore',
      'Slovenia',
      'Solomon Islands',
      'Somalia',
      'South Africa',
      'South Korea',
      'Spain',
      'Sri Lanka',
      'Sudan',
      'Suriname',
      'Sweden',
      'Syria',
      'Taiwan',
      'Tanzania',
      'Thailand',
      'Togo',
      'Tonga',
      'Trinidad and Tobago',
      'Tunisia',
      'Turkey',
      'Tuvalu',
      'Ukraine',
      'United Arab Emirates',
      'United Kingdom',
      'United States',
      'Uruguay',
      'Venezuela',
      'Vietnam',
      'Yemen'
    ]

    const baseInsight = {
      pollution: ['Coastal pollution pressure signals (public sources)'],
      biodiversity: ['Coastal biodiversity loss signals (public sources)'],
      resources: [
        'Fish production trend signals (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
        'Rare species signals (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
      ]
    }

    const detailedCountryInsights = {
      Australia: {
        pollution: [
          'Great Barrier Reef runoff hotspots near coastal catchments',
          'Shipping emissions around major ports (Sydney, Brisbane)'
        ],
        biodiversity: [
          'Coral bleaching events affecting reef biodiversity',
          'Declines in dugong seagrass habitats'
        ],
        resources: [
          'Fisheries pressure on reef-adjacent stocks (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Rare coastal species signals (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      Brazil: {
        pollution: [
          'Nutrient and sediment loads from Amazon and coastal rivers',
          'Oil and gas activity along the southeast coast'
        ],
        biodiversity: [
          'Mangrove loss in estuarine zones',
          'Sea turtle nesting pressure on northeast beaches'
        ],
        resources: [
          'Industrial fishing intensity along the continental shelf (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Threatened coastal species signals (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      Canada: {
        pollution: [
          'Microplastic accumulation in Arctic waters',
          'Port emissions near Vancouver and Halifax'
        ],
        biodiversity: [
          'Shifts in cold-water species ranges',
          'Right whale migration stressors in Atlantic waters'
        ],
        resources: [
          'Shellfish aquaculture expansion and harvest pressure (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Cold-water species status (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      China: {
        pollution: [
          'Coastal eutrophication in Bohai and Yellow Seas',
          'Industrial discharge along major river deltas'
        ],
        biodiversity: [
          'Habitat loss in estuaries and tidal flats',
          'Pressure on migratory shorebirds in coastal flyways'
        ],
        resources: [
          'High seafood demand driving fishing effort (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Threatened marine species trends (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      India: {
        pollution: [
          'Urban wastewater discharge into coastal waters',
          'Plastic leakage from major river systems'
        ],
        biodiversity: [
          'Mangrove degradation in the Sundarbans',
          'Coastal wetland conversion'
        ],
        resources: [
          'Intense nearshore fishing for small pelagics (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Coastal species rarity (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      Indonesia: {
        pollution: [
          'Marine plastic hotspots in Java and Bali regions',
          'Sediment plumes from deforestation-linked runoff'
        ],
        biodiversity: [
          'Coral reef stress across the Coral Triangle',
          'Seagrass habitat fragmentation'
        ],
        resources: [
          'Small-scale fisheries pressure in coastal villages (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Reef species vulnerability (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      Japan: {
        pollution: [
          'Urban coastal emissions near Tokyo Bay',
          'Legacy industrial contaminants in sediment'
        ],
        biodiversity: [
          'Kelp forest loss in warming coastal zones',
          'Bycatch concerns for migratory species'
        ],
        resources: [
          'High seafood consumption and import dependence (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Species decline signals (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      Mexico: {
        pollution: [
          'Tourism wastewater pressure in Caribbean coast',
          'Agricultural runoff into Gulf of Mexico'
        ],
        biodiversity: [
          'Coral reef stress in Mesoamerican Barrier Reef',
          'Mangrove conversion in coastal lagoons'
        ],
        resources: [
          'Overfishing signals in reef-adjacent fisheries (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Threatened reef species (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      Norway: {
        pollution: [
          'Shipping emissions along fjord corridors',
          'Localized nutrient loads from aquaculture'
        ],
        biodiversity: [
          'Cold-water coral vulnerability to ocean warming',
          'Seabird population shifts'
        ],
        resources: [
          'High aquaculture and capture pressure (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Cold-water species status (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      Philippines: {
        pollution: [
          'Plastic leakage from coastal cities',
          'Storm-driven runoff into reef systems'
        ],
        biodiversity: [
          'Coral reef degradation from warming and tourism',
          'Seagrass meadow fragmentation'
        ],
        resources: [
          'Dense artisanal fishing pressure (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Threatened coastal species (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      'South Africa': {
        pollution: [
          'Port emissions and coastal industrial discharge',
          'Oil spill risk along shipping lanes'
        ],
        biodiversity: [
          'Kelp forest stress on the west coast',
          'Penguin colony declines'
        ],
        resources: [
          'Commercial fishing pressure on key stocks (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Threatened marine species (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      },
      'United States': {
        pollution: [
          'Nutrient runoff driving Gulf of Mexico hypoxia',
          'Coastal air emissions near major ports'
        ],
        biodiversity: [
          'Loss of coastal marshes and wetlands',
          'North Atlantic right whale entanglement risk'
        ],
        resources: [
          'Fishing pressure on groundfish stocks (<a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>)',
          'Rare species signals (<a href="https://www.iucnredlist.org/">IUCN Red List</a>)'
        ]
      }
    }

    const countryInsights = coastalCountries.reduce((acc, country) => {
      acc[country] = baseInsight
      return acc
    }, {})

    Object.entries(detailedCountryInsights).forEach(([country, insight]) => {
      countryInsights[country] = insight
    })

    const buildTooltipMarkup = (
      countryName,
      enabledCategories,
      insightsByCountry
    ) => {
      const insight = insightsByCountry[countryName]
      const safeName = countryName || 'Unknown'

      if (!insight) {
        return `
          <div class="tooltip-title">${safeName}</div>
          <div class="tooltip-empty">No marine sustainability data mapped yet.</div>
        `
      }

      const renderList = (items) => {
        if (!items || items.length === 0) {
          return '<div class="tooltip-empty">No data yet.</div>'
        }
        return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`
      }

      const sections = []

      if (enabledCategories.pollution) {
        sections.push(`
          <div class="tooltip-section">
            <div class="tooltip-label">Pollution</div>
            ${renderList(insight.pollution)}
          </div>
        `)
      }

      if (enabledCategories.biodiversity) {
        sections.push(`
          <div class="tooltip-section">
            <div class="tooltip-label">Biodiversity loss</div>
            ${renderList(insight.biodiversity)}
          </div>
        `)
      }

      if (enabledCategories.resources) {
        sections.push(`
          <div class="tooltip-section">
            <div class="tooltip-label">
              Resources overuse in marine ecosystems
            </div>
            ${renderList(insight.resources)}
          </div>
        `)
      }

      if (sections.length === 0) {
        sections.push('<div class="tooltip-empty">No categories selected.</div>')
      }

      return `
        <div class="tooltip-title">${safeName}</div>
        ${sections.join('')}
      `
    }

    const scoreCountry = (countryName, enabledCategories, insightsByCountry) => {
      const insight = insightsByCountry[countryName]
      if (!insight) return 0

      const values = []
      if (enabledCategories.pollution) {
        values.push(insight.pollution?.length || 0)
      }
      if (enabledCategories.biodiversity) {
        values.push(insight.biodiversity?.length || 0)
      }
      if (enabledCategories.resources) {
        values.push(insight.resources?.length || 0)
      }

      return values.reduce((sum, value) => sum + value, 0)
    }

    const renderMap = (geojson) => {
      if (!mapRef.current) return

      const width = mapRef.current.clientWidth
      const height = mapRef.current.clientHeight
      const insightsByCountry = countryInsights

      svg.selectAll('*').remove()

      const projection = d3.geoNaturalEarth1().fitSize([width, height], geojson)
      const path = d3.geoPath(projection)

      svg
        .append('path')
        .datum(d3.geoGraticule10())
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', 'var(--map-grid)')
        .attr('stroke-width', 0.6)

      const maxScore = d3.max(geojson.features, (feature) =>
        scoreCountry(
          feature?.properties?.name,
          activeCategories,
          insightsByCountry
        )
      )

      const safeMax = maxScore || 1
      const colorScale = d3
        .scaleLinear()
        .domain([0, safeMax / 2, safeMax])
        .range(['#d64545', '#f1c84b', '#2fbf71'])

      svg
        .append('g')
        .selectAll('path')
        .data(geojson.features)
        .join('path')
        .attr('d', path)
        .attr('class', 'worldmap-country')
        .attr('fill', (feature) =>
          colorScale(
            scoreCountry(
              feature?.properties?.name,
              activeCategories,
              insightsByCountry
            )
          )
        )
        .attr('stroke', 'var(--map-land-stroke)')
        .attr('stroke-width', 0.6)
        .on('mouseenter', function (event, feature) {
          d3.select(this)
            .attr('fill', 'var(--map-land-hover)')
            .attr('stroke-width', 0.9)
          tooltip
            .style('opacity', 1)
            .html(
              buildTooltipMarkup(
                feature?.properties?.name || 'Unknown',
                activeCategories,
                insightsByCountry
              )
            )
        })
        .on('mousemove', function (event) {
          tooltip
            .style('left', `${event.pageX + 16}px`)
            .style('top', `${event.pageY - 16}px`)
        })
        .on('mouseleave', function (event, feature) {
          d3.select(this)
            .attr(
              'fill',
              colorScale(
                scoreCountry(
                  feature?.properties?.name,
                  activeCategories,
                  insightsByCountry
                )
              )
            )
            .attr('stroke-width', 0.6)
          tooltip.style('opacity', 0)
        })
    }

    const loadMap = async () => {
      try {
        if (!geojsonRef.current) {
          geojsonRef.current = await d3.json(geoUrl)
        }
        if (geojsonRef.current) {
          renderMap(geojsonRef.current)
        }
      } catch (error) {
        svg
          .append('text')
          .attr('x', 20)
          .attr('y', 40)
          .attr('fill', '#111')
          .style('font-size', '16px')
          .text('Failed to load GeoJSON. Check your internet connection.')
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }

    const handleResize = () => {
      if (geojsonRef.current) {
        renderMap(geojsonRef.current)
      }
    }

    loadMap()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [activeCategories])

  const toggleCategory = (categoryKey) => {
    setActiveCategories((current) => ({
      ...current,
      [categoryKey]: !current[categoryKey]
    }))
  }

  return (
    <section id="worldmap">
      <div className="worldmap-header">
        <h2>Marine sustainability signals</h2>
        <p>
          Hover any country to see pollution, biodiversity loss, and resources
          overuse in marine ecosystems signals from coastal and marine systems.
        </p>
      </div>
      <div className="worldmap-controls">
        <button
          type="button"
          className={`map-toggle ${
            activeCategories.pollution ? 'is-active' : ''
          }`}
          onClick={() => toggleCategory('pollution')}
        >
          Pollution
        </button>
        <button
          type="button"
          className={`map-toggle ${
            activeCategories.biodiversity ? 'is-active' : ''
          }`}
          onClick={() => toggleCategory('biodiversity')}
        >
          Biodiversity loss
        </button>
        <button
          type="button"
          className={`map-toggle ${
            activeCategories.resources ? 'is-active' : ''
          }`}
          onClick={() => toggleCategory('resources')}
        >
          Resources overuse in marine ecosystems
        </button>
      </div>
      <div className="worldmap-legend">
        <span>Data density</span>
        <div className="legend-bar" aria-hidden="true"></div>
        <span>Low</span>
        <span>High</span>
      </div>
      <div className="worldmap-frame">
        <svg
          id="map"
          ref={mapRef}
          className="worldmap-svg"
          role="img"
          aria-label="World map"
        ></svg>
        <div
          ref={tooltipRef}
          className="worldmap-tooltip"
          aria-hidden="true"
        ></div>
      </div>
      <div className="worldmap-note">
        Tracking fish production change and rare species signals via public
        sources: <a href="https://www.fao.org/fishery/statistics/software/fishstat/en">FAO FishStat</a>{' '}
        and <a href="https://www.iucnredlist.org/">IUCN Red List</a>.
      </div>
    </section>
  )
}

export default App
