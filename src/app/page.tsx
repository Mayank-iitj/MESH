// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import PixelBlast from '@/components/PixelBlast'
import Strands from '@/components/Strands'
import LogoLoop from '@/components/LogoLoop'
import InfiniteSpiral from '@/components/InfiniteSpiral'
import SpotlightCard from '@/components/SpotlightCard'
import { SiStripe, SiGithub, SiApple, SiVercel, SiCloudflare, SiNvidia } from 'react-icons/si'
import { ArrowRight, Shield, Zap, Activity } from 'lucide-react'

const partnerLogos = [
  { node: <SiStripe />, title: "Stripe" },
  { node: <SiGithub />, title: "GitHub" },
  { node: <SiVercel />, title: "Vercel" },
  { node: <SiCloudflare />, title: "Cloudflare" },
  { node: <SiApple />, title: "Apple" },
  { node: <SiNvidia />, title: "NVIDIA" },
];

const techImages = [
  { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop', alt: 'Circuit Board' },
  { src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop', alt: 'Server Rack' },
  { src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop', alt: 'Matrix Code' },
  { src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop', alt: 'Global Network' },
  { src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop', alt: 'Abstract Data' },
  { src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop', alt: 'Technology Setup' },
  { src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop', alt: 'Data Center' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden relative">
      
      {/* Top Banner - Checkerboard Pattern */}
      <div className="w-full h-8 flex items-center justify-center text-[10px] uppercase font-bold tracking-widest relative overflow-hidden bg-purple-900/30">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #8a2be2 25%, #8a2be2 75%, #000 75%, #000)', backgroundPosition: '0 0, 9px 9px', backgroundSize: '18px 18px' }}></div>
        <span className="z-10 bg-black/50 px-4 py-1 rounded">Securing Autonomous AI Commerce globally</span>
      </div>

      {/* Nav Bar */}
      <nav className="w-full border-b border-white/5 bg-black/90 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full px-6 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <Image src="/logo.png" alt="MESH" width={24} height={24} className="object-contain filter invert" unoptimized={true} />
              mesh
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <Link href="#solution" className="hover:text-white transition-colors">Solution</Link>
              <Link href="#technology" className="hover:text-white transition-colors">Technology</Link>
              <Link href="#proof" className="hover:text-white transition-colors">Proof</Link>
              <Link href="#advantage" className="hover:text-white transition-colors">Unfair Advantage</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-bold">
            <Link href="/signup" className="px-4 py-2 bg-white text-black rounded text-xs tracking-wider uppercase hover:bg-gray-200 transition-colors">
              Request API Access
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Vertical Grid Lines */}
      <main className="relative w-full min-h-screen">
        
        {/* Background Vertical Lines */}
        <div className="absolute inset-0 pointer-events-none flex justify-evenly z-0">
          <div className="w-px h-full bg-white/5"></div>
          <div className="w-px h-full bg-white/5"></div>
          <div className="w-px h-full bg-white/5"></div>
        </div>

        {/* Center Purple Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1000px] bg-purple-600/10 blur-[150px] pointer-events-none z-0"></div>

        {/* Hero Section */}
        <section id="proof" className="relative z-10 flex flex-col lg:flex-row items-center pt-32 pb-24 px-6 md:px-12 min-h-[70vh]">
          <div className="w-full lg:w-1/2 pr-0 lg:pr-12">
            <div className="font-mono text-purple-400 text-sm font-bold tracking-widest uppercase mb-6">
              &gt;The Problem
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-8 leading-[1.1]">
              Autonomous agents.<br/>Programmable control.
            </h1>
            <p className="text-gray-400 text-lg mb-6 max-w-lg leading-relaxed">
              Human oversight is the bottleneck for autonomous commerce. The research confirms it, and the scaling laws back it up.
            </p>
            <p className="text-gray-400 text-lg mb-6 max-w-lg leading-relaxed">
              The infrastructure <span className="text-purple-400 font-medium">to deliver programmatic control at routing speed</span> did not exist. MESH built it.
            </p>
            <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
              Your agents now transact autonomously, evaluate risk instantly, and settle securely before the wait becomes friction.
            </p>
          </div>
          
          <div className="w-full lg:w-1/2 mt-16 lg:mt-0 relative flex justify-center items-center">
            {/* Mock Graphic similar to Kog */}
            <div className="relative w-full max-w-md aspect-video">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent blur-xl"></div>

              {/* Animated Strands Data Flow */}
              <div className="absolute inset-0 -mx-20 flex items-center justify-center opacity-70 pointer-events-none">
                <Strands
                  colors={["#a855f7", "#c084fc", "#e879f9"]}
                  count={4}
                  speed={0.6}
                  amplitude={0.8}
                  waviness={1.2}
                  thickness={0.8}
                  glow={2.5}
                  taper={2}
                  spread={1.5}
                  intensity={0.8}
                  saturation={1.5}
                  opacity={1}
                  scale={1.5}
                  glass={false}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12"></div>

        {/* Partner Logo Loop Section */}
        <section className="relative z-10 w-full py-12 border-y border-white/5 bg-black">
          <div className="font-mono text-gray-500 text-xs font-bold tracking-widest uppercase mb-8 text-center">
            &gt;Trusted By Industry Leaders
          </div>
          <div style={{ height: '50px', position: 'relative', overflow: 'hidden' }}>
            <LogoLoop
              logos={partnerLogos}
              speed={120}
              direction="left"
              logoHeight={40}
              gap={80}
              hoverSpeed={20}
              scaleOnHover
              fadeOut
              fadeOutColor="#000000"
              ariaLabel="Partner logos"
              className="text-gray-400 hover:text-white transition-colors"
            />
          </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="relative z-10 flex flex-col lg:flex-row-reverse items-center pt-24 pb-24 px-6 md:px-12">
          <div className="w-full lg:w-1/2 pl-0 lg:pl-12">
            <div className="font-mono text-purple-400 text-sm font-bold tracking-widest uppercase mb-6">
              &gt;The Solution
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8 leading-[1.1]">
              Millisecond routing.<br/>Zero compliance breaches.
            </h2>
            <div className="font-mono text-white text-sm font-bold tracking-widest uppercase mb-8">
              FROM HOURS OF APPROVALS TO 50 MILLISECONDS
            </div>
            <p className="text-gray-400 text-lg mb-6 max-w-lg leading-relaxed">
              At 5,000 transactions per second, each policy evaluation cycle drops from hours of human review to less than 50 milliseconds.
            </p>
            <p className="text-gray-400 text-lg mb-6 max-w-lg leading-relaxed">
              Your agent negotiates, evaluates, routes, and settles. You monitor. <span className="text-purple-400 font-medium">The engine runs 10,000 checks in the time a standard stack completes one API call.</span>
            </p>
            <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
              This is the threshold where agent tooling becomes agent autonomy. The infrastructure you build on the other side redefines commerce today.
            </p>
          </div>
          
          <div className="w-full lg:w-1/2 mt-16 lg:mt-0 flex flex-col items-center justify-center relative">
             <div style={{ width: '100%', height: '500px', position: 'relative', overflow: 'hidden' }}>
               <InfiniteSpiral
                 items={techImages}
                 animationMode="all"
                 speed={0.55}
                 radius={170}
                 cardWidth={120}
                 cardHeight={120}
                 verticalSpacing={60}
                 perspective={1000}
                 cardRadius={10}
                 centerScale={1.2}
                 edgeBlur={6}
                 cardsPerTurn={7}
                 pauseOnHover
               />
             </div>
          </div>
        </section>

        {/* Grid Features */}
        <section id="technology" className="relative z-10 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.15)" className="p-12 border-b lg:border-b-0 lg:border-r border-white/5">
              <h3 className="text-3xl font-bold tracking-tight mb-4">MESH Policy Engine</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Define organizational risk thresholds, budget limits, and compliance checks in natural language. Our determinisic compiler converts policies into high-speed executable binaries that process rules directly in memory.
              </p>
              
              <div className="mt-8 border border-white/10 rounded-xl overflow-hidden bg-black/50 p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Transaction</span>
                  <span className="text-white">$45,000 AWS Bill</span>
                </div>
                <div className="h-px bg-white/10 w-full"></div>
                <div className="flex gap-2 text-xs">
                  <div className="px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20">KYB Passed</div>
                  <div className="px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20">Budget OK</div>
                  <div className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20 text-center flex-1">Auto-Approved</div>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.15)" className="p-12">
              <h3 className="text-3xl font-bold tracking-tight mb-4">MESH Payment Router</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Automatically routes approved transactions through the optimal payment rails (Stripe, Lightning, USDC) based on cost, speed, and geographic requirements.
              </p>
              
              <div className="mt-8 relative h-32 flex items-center justify-center">
                 <div className="absolute w-64 h-64 border border-white/5 rounded-full"></div>
                 <div className="absolute w-48 h-48 border border-purple-500/20 rounded-full animate-ping"></div>
                 <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center z-10 shadow-[0_0_30px_10px_rgba(168,85,247,0.4)]">
                   <div className="w-6 h-6 bg-white mask-star"></div>
                 </div>
              </div>
            </SpotlightCard>
            
          </div>
          
          {/* Hardware-native & Zero Friction row */}
          <div id="advantage" className="grid grid-cols-1 lg:grid-cols-2 border-t border-white/5">
            <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.15)" className="p-12 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-center">
              <h3 className="text-3xl font-bold tracking-tight mb-4">Rail-native</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                By integrating directly with tier-1 liquidity providers and blockchain RPCs, MESH eliminates intermediate layers. Transactions are pushed to rails within 5 milliseconds of policy approval.
              </p>
            </SpotlightCard>
            
            <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.15)" className="p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold tracking-tight mb-4">Zero Friction</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                No manual reviews for 99% of transactions. Exceptions are automatically flagged and routed to human financial controllers with full context and audit trails.
              </p>
            </SpotlightCard>
          </div>
        </section>
        
      </main>

      {/* Bottom CTA Section */}
      <section className="relative w-full border-t border-white/5 py-32 flex flex-col items-center justify-center overflow-hidden min-h-[600px]">
        {/* PixelBlast Background */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none sm:pointer-events-auto">
          <PixelBlast
            variant="circle"
            pixelSize={6}
            color="#a855f7" 
            patternScale={3}
            patternDensity={1.2}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.6}
            edgeFade={0.25}
            transparent
          />
        </div>

        {/* Background Vertical Light Beam */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-white opacity-20 shadow-[0_0_30px_10px_rgba(168,85,247,0.8)]"></div>
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-32 bg-purple-600/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 text-center flex flex-col items-center px-6">
          <div className="font-mono text-purple-400 text-sm font-bold tracking-widest uppercase mb-6">
            &gt;THE FINANCIAL CONTROL PLANE
          </div>
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-10">
            <span className="text-purple-400">10,000x</span> Faster<br/>Settlement
          </h2>
          
          <Link href="/signup" className="group flex items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-6 pr-2 py-2 transition-all">
            <span className="text-white font-bold tracking-widest uppercase text-sm mr-6">Request API Access</span>
            <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          <p className="mt-12 text-gray-400 text-lg max-w-2xl leading-relaxed">
            Enabling AI agents and autonomous workflows to evaluate policies and route payments in <strong className="text-white">under 50 milliseconds</strong> (vs ≈ 3 days for standard wire transfers)
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-12 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight mb-4 md:mb-0 cursor-pointer">
            <Image src="/logo.png" alt="MESH" width={24} height={24} className="object-contain filter invert opacity-50 hover:opacity-100 transition-opacity" unoptimized={true} />
            mesh
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            {/* Links removed */}
          </div>
        </div>
      </footer>
    </div>
  )
}
