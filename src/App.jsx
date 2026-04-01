import { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const mapRef = useRef(null)
  const tooltipRef = useRef(null)

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
  )
}

export default App
