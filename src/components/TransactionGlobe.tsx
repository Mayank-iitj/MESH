'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

// Need to dynamically import Globe because it relies on window
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

export default function TransactionGlobe() {
  const globeRef = useRef<any>(null)
  const [arcsData, setArcsData] = useState<any[]>([])

  useEffect(() => {
    // Generate some random initial transactions between major tech hubs
    const hubs = [
      { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
      { lat: 40.7128, lng: -74.0060, name: 'New York' },
      { lat: 51.5074, lng: -0.1278, name: 'London' },
      { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
      { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
      { lat: 19.0760, lng: 72.8777, name: 'Mumbai' }
    ]

    const initialArcs = []
    for(let i=0; i<8; i++) {
      const start = hubs[Math.floor(Math.random() * hubs.length)]
      let end = hubs[Math.floor(Math.random() * hubs.length)]
      while(end === start) end = hubs[Math.floor(Math.random() * hubs.length)]
      
      initialArcs.push({
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
        color: ['#ff00ff', '#00ffff'][Math.floor(Math.random() * 2)]
      })
    }
    setArcsData(initialArcs)

    // Setup globe auto-rotation
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 1.5
    }

    // Periodically add new transaction arcs
    const interval = setInterval(() => {
      const start = hubs[Math.floor(Math.random() * hubs.length)]
      let end = hubs[Math.floor(Math.random() * hubs.length)]
      while(end === start) end = hubs[Math.floor(Math.random() * hubs.length)]
      
      setArcsData(prev => {
        const newData = [...prev, {
          startLat: start.lat,
          startLng: start.lng,
          endLat: end.lat,
          endLng: end.lng,
          color: ['#ff00ff', '#00ffff'][Math.floor(Math.random() * 2)]
        }]
        // Keep last 15 arcs
        return newData.slice(-15)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-[600px] flex items-center justify-center overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live MESH Network
        </h3>
        <p className="text-xs text-muted-foreground">Autonomous Transactions Routing</p>
      </div>
      
      <div className="w-full h-full flex items-center justify-center">
        {/* @ts-ignore */}
        <Globe
          ref={globeRef}
          width={800}
          height={600}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          arcsData={arcsData}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.1}
          arcDashAnimateTime={1500}
          arcsTransitionDuration={0}
          arcStroke={1.5}
        />
      </div>
    </div>
  )
}
