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
  const [purpleAirSensors, setPurpleAirSensors] = useState([])
  const [purpleAirError, setPurpleAirError] = useState(null)
  const [purpleAirUpdatedAt, setPurpleAirUpdatedAt] = useState(null)
  const [purpleAirInsightsByCountry, setPurpleAirInsightsByCountry] =
    useState({})

  useEffect(() => {
    const purpleAirKey = import.meta.env.VITE_PURPLEAIR_KEY
    if (!purpleAirKey) {
      setPurpleAirError('Missing PurpleAir API key.')
      return
    }

    let isMounted = true

    const fetchPurpleAirSensors = async () => {
      try {
        setPurpleAirError(null)
        const response = await fetch(
          'https://api.purpleair.com/v1/sensors?fields=latitude,longitude,pm2.5_atm&location_type=0&max_age=3600&limit=500',
          {
            headers: {
              'X-API-Key': purpleAirKey
            }
          }
        )

        if (!response.ok) {
          throw new Error('PurpleAir request failed.')
        }

        const data = await response.json()
        if (!isMounted) return

        const fields = data?.fields || []
        const latIndex = fields.indexOf('latitude')
        const lonIndex = fields.indexOf('longitude')
        const pmIndex = fields.indexOf('pm2.5_atm')
        const rows = Array.isArray(data?.data) ? data.data : []

        const sensors = rows
          .map((row) => ({
            lat: row?.[latIndex],
            lon: row?.[lonIndex],
            pm25: row?.[pmIndex]
          }))
          .filter(
            (row) =>
              Number.isFinite(row.lat) &&
              Number.isFinite(row.lon) &&
              Number.isFinite(row.pm25)
          )

        setPurpleAirSensors(sensors)
        setPurpleAirUpdatedAt(new Date().toISOString())
      } catch (error) {
        if (!isMounted) return
        setPurpleAirError('Failed to load PurpleAir sensors.')
      }
    }

    fetchPurpleAirSensors()

    return () => {
      isMounted = false
    }
  }, [])

  const buildPurpleAirInsights = (d3, geojson, sensors) => {
    if (!geojson || !Array.isArray(sensors) || sensors.length === 0) {
      return {}
    }

    const stats = {}
    const features = Array.isArray(geojson.features) ? geojson.features : []

    sensors.forEach((sensor) => {
      let matchedCountry = null
      for (const feature of features) {
        if (d3.geoContains(feature, [sensor.lon, sensor.lat])) {
          matchedCountry = feature?.properties?.name || null
          break
        }
      }

      if (!matchedCountry) return

      if (!stats[matchedCountry]) {
        stats[matchedCountry] = { sum: 0, count: 0 }
      }

      stats[matchedCountry].sum += sensor.pm25
      stats[matchedCountry].count += 1
    })

    const insights = {}
    Object.entries(stats).forEach(([country, { sum, count }]) => {
      const avg = count ? sum / count : 0
      if (!Number.isFinite(avg)) return
      const rounded = Math.round(avg * 10) / 10
      insights[country] = {
        pollution: [`PurpleAir PM2.5 avg ${rounded} ug/m3 (${count} sensors)`]
      }
    })

    return insights
  }

  useEffect(() => {
    const d3 = window.d3
    if (!d3 || !geojsonRef.current || purpleAirSensors.length === 0) {
      return
    }

    const nextInsights = buildPurpleAirInsights(
      d3,
      geojsonRef.current,
      purpleAirSensors
    )
    setPurpleAirInsightsByCountry(nextInsights)
  }, [purpleAirSensors])

  useEffect(() => {
    const d3 = window.d3
    if (!d3) {
      return
    }

    const svg = d3.select(mapRef.current)
    const tooltip = d3.select(tooltipRef.current)
    const geoUrl =
      'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'

    const countryInsights = {
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
          'High coastal water demand for agriculture and tourism',
          'Fisheries pressure on reef-adjacent stocks'
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
        resources: ['Industrial fishing intensity along the continental shelf']
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
          'Shellfish aquaculture expansion with local water use impacts'
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
        resources: ['High seafood demand driving fishing effort']
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
        resources: ['Intense nearshore fishing for small pelagics']
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
          'Small-scale fisheries pressure in coastal villages',
          'Tourism-related water demand in reef islands'
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
        resources: ['High seafood consumption and import dependence']
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
        resources: ['Overfishing signals in reef-adjacent fisheries']
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
        resources: ['High aquaculture water use in coastal zones']
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
        resources: ['Dense artisanal fishing pressure']
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
        resources: ['Commercial fishing pressure on key stocks']
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
          'High coastal water demand from industry and cities',
          'Fishing pressure on groundfish stocks'
        ]
      }
    }

    const mergeInsights = (base, updates) => {
      const merged = { ...base }
      Object.entries(updates).forEach(([country, update]) => {
        const existing = merged[country] || {}
        merged[country] = {
          pollution: [
            ...(existing.pollution || []),
            ...(update.pollution || [])
          ],
          biodiversity: [
            ...(existing.biodiversity || []),
            ...(update.biodiversity || [])
          ],
          resources: [
            ...(existing.resources || []),
            ...(update.resources || [])
          ]
        }
      })
      return merged
    }

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
            <div class="tooltip-label">Resource use</div>
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
      const insightsByCountry = mergeInsights(
        countryInsights,
        purpleAirInsightsByCountry
      )

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
          if (purpleAirSensors.length > 0) {
            const nextInsights = buildPurpleAirInsights(
              d3,
              geojsonRef.current,
              purpleAirSensors
            )
            setPurpleAirInsightsByCountry(nextInsights)
          }
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
  }, [activeCategories, purpleAirInsightsByCountry, purpleAirSensors])

  const toggleCategory = (categoryKey) => {
    setActiveCategories((current) => ({
      ...current,
      [categoryKey]: !current[categoryKey]
    }))
  }

  const purpleAirStatus = purpleAirError
    ? `PurpleAir status: ${purpleAirError}`
    : purpleAirUpdatedAt
      ? `PurpleAir status: Updated ${new Date(
          purpleAirUpdatedAt
        ).toLocaleString()}`
      : 'PurpleAir status: Loading sensors...'

  return (
    <section id="worldmap">
      <div className="worldmap-header">
        <h2>Marine sustainability signals</h2>
        <p>
          Hover any country to see pollution, biodiversity loss, and resource use
          signals from coastal and marine systems.
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
          Resource use
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
        Data placeholders reflect the three required categories only. Replace or
        extend with live sources when ready.
        <span className="worldmap-status">{purpleAirStatus}</span>
      </div>
    </section>
  )
}

export default App
