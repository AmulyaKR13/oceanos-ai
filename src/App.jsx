import { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const mapRef = useRef(null)
  const tooltipRef = useRef(null)
  const topics = [
    {
      id: 'pollution',
      title: 'Pollution',
      description:
        'Keyless public datasets for contaminants, emissions, and pollution sources.',
      sources: [
        {
          name: 'EPA Water Quality Portal (WQP)',
          focus: 'Nutrients, metals, pathogens in water bodies.',
          url: 'https://www.waterqualitydata.us/webservices_documentation/',
        },
        {
          name: 'USGS NWIS',
          focus: 'Surface water quality observations and trends.',
          url: 'https://waterservices.usgs.gov/',
        },
        {
          name: 'EPA Envirofacts (TRI/GHGRP)',
          focus: 'Toxic releases and greenhouse gas emissions.',
          url: 'https://www.epa.gov/enviro/envirofacts-data-service-api',
        },
        {
          name: 'EPA Facility Registry Service (FRS)',
          focus: 'Facility locations and regulatory identifiers.',
          url: 'https://www.epa.gov/frs/frs-api',
        },
      ],
    },
    {
      id: 'biodiversity',
      title: 'Biodiversity loss',
      description:
        'Water quality and facility signals that correlate with habitat stress.',
      sources: [
        {
          name: 'EPA Water Quality Portal (WQP)',
          focus: 'Indicators of ecosystem health and nutrient loading.',
          url: 'https://www.waterqualitydata.us/webservices_documentation/',
        },
        {
          name: 'USGS NWIS',
          focus: 'Long-term monitoring for rivers, estuaries, and coasts.',
          url: 'https://waterservices.usgs.gov/',
        },
        {
          name: 'EPA Facility Registry Service (FRS)',
          focus: 'Nearby industrial and municipal facilities.',
          url: 'https://www.epa.gov/frs/frs-api',
        },
      ],
    },
    {
      id: 'resource',
      title: 'Resource use in marine systems',
      description:
        'Signals for water use pressure and industrial activity near coasts.',
      sources: [
        {
          name: 'USGS NWIS',
          focus: 'Streamflow and water level data.',
          url: 'https://waterservices.usgs.gov/',
        },
        {
          name: 'EPA Facility Registry Service (FRS)',
          focus: 'Facilities that influence resource use and discharge.',
          url: 'https://www.epa.gov/frs/frs-api',
        },
        {
          name: 'EPA Envirofacts (GHGRP)',
          focus: 'Industrial emissions as a proxy for resource intensity.',
          url: 'https://www.epa.gov/enviro/envirofacts-data-service-api',
        },
      ],
    },
  ]

  useEffect(() => {
    const d3 = window.d3
    if (!d3) {
      return
    }

    const svg = d3.select(mapRef.current)
    const tooltip = d3.select(tooltipRef.current)
    const geoUrl =
      'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
    let geojsonCache = null

    const renderMap = (geojson) => {
      if (!mapRef.current) return

      const width = mapRef.current.clientWidth
      const height = mapRef.current.clientHeight

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

      svg
        .append('g')
        .selectAll('path')
        .data(geojson.features)
        .join('path')
        .attr('d', path)
        .attr('class', 'worldmap-country')
        .attr('fill', 'var(--map-land)')
        .attr('stroke', 'var(--map-land-stroke)')
        .attr('stroke-width', 0.6)
        .on('mouseenter', function (event, d) {
          d3.select(this)
            .attr('fill', 'var(--map-land-hover)')
            .attr('stroke-width', 0.9)
          tooltip
            .style('opacity', 1)
            .text(d?.properties?.name || 'Unknown')
        })
        .on('mousemove', function (event) {
          tooltip
            .style('left', `${event.clientX}px`)
            .style('top', `${event.clientY}px`)
        })
        .on('mouseleave', function () {
          d3.select(this)
            .attr('fill', 'var(--map-land)')
            .attr('stroke-width', 0.6)
          tooltip.style('opacity', 0)
        })
    }

    const loadMap = async () => {
      try {
        if (!geojsonCache) {
          geojsonCache = await d3.json(geoUrl)
        }
        if (geojsonCache) {
          renderMap(geojsonCache)
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
      if (geojsonCache) {
        renderMap(geojsonCache)
      }
    }

    loadMap()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <section id="worldmap">
        <div className="worldmap-header">
          <h2>World map</h2>
          <p>Hover a country to see its name.</p>
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
      </section>

      <section id="sources">
        <div className="sources-header">
          <h2>Keyless data sources</h2>
          <p>
            All sources below are free to access with no API key requirements.
          </p>
        </div>
        <div className="topic-grid">
          {topics.map((topic) => (
            <article key={topic.id} className="topic-card">
              <div className="topic-title">
                <h3>{topic.title}</h3>
                <span className="pill">No API key</span>
              </div>
              <p className="topic-description">{topic.description}</p>
              <ul className="topic-list">
                {topic.sources.map((source) => (
                  <li key={source.name} className="topic-item">
                    <div className="topic-item-head">
                      <a
                        className="topic-link"
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.name}
                      </a>
                    </div>
                    <p>{source.focus}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default App
