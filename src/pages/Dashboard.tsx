import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Scissors, 
  Layers, 
  ArrowRight, 
  Loader2, 
  Scan, 
  Share2,
  ChevronDown,
  Info,
  Palette,
  Maximize2,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Truck,
  Tag,
  Search,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeDressImage, AnalysisResult } from '../services/geminiService';
import { useAuth } from '../components/AuthProvider';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'shop' | 'recreate'>('shop');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'relevance'>('relevance');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      setImage(url);
      handleAnalyze(url);
    } else {
      navigate('/');
    }
  }, [searchParams, navigate]);

  const handleAnalyze = async (imageSource: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeDressImage(imageSource);
      setResult(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
      // In a real app, we'd show a more elegant error state
    } finally {
      setIsAnalyzing(false);
    }
  };

  const brands = useMemo(() => {
    if (!result) return ['all'];
    const uniqueBrands = Array.from(new Set(result.retailMatches.map(m => m.brand).filter(Boolean)));
    return ['all', ...uniqueBrands];
  }, [result]);

  const filteredAndSortedMatches = useMemo(() => {
    if (!result) return [];
    let matches = [...result.retailMatches];
    
    if (brandFilter !== 'all') {
      matches = matches.filter(m => m.brand === brandFilter);
    }

    if (sortBy === 'price-asc') {
      return matches.sort((a, b) => {
        const p1 = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
        const p2 = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
        return p1 - p2;
      });
    }
    if (sortBy === 'price-desc') {
      return matches.sort((a, b) => {
        const p1 = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
        const p2 = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
        return p2 - p1;
      });
    }
    return matches;
  }, [result, sortBy, brandFilter]);

  const handleShare = async () => {
    const shareData = {
      title: 'Lumina Fashion Analysis',
      text: `Check out this ${result?.dressName} I found on Lumina!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error('Share not supported');
      }
    } catch (error) {
      // Fallback to clipboard if share fails or is denied
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipError) {
        console.error('Failed to copy:', clipError);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      {/* Persistent Header */}
      <nav className="fixed z-50 bg-[#FDFCFB]/80 w-full border-stone-200/50 border-b top-0 backdrop-blur-md">
        <div className="flex h-16 max-w-7xl mx-auto px-6 items-center justify-between">
          <Link to="/" className="uppercase text-lg font-medium text-stone-900 tracking-tighter">LUMINA</Link>
          
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-stone-500 hover:text-stone-900 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Search
            </Link>

            <div className="h-4 w-px bg-stone-200" />

            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-stone-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                  <UserIcon className="w-4 h-4 text-stone-400" />
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-stone-900 leading-none">{user?.displayName}</p>
              </div>
            </div>

            <button 
              onClick={logout}
              className="p-2 rounded-xl hover:bg-stone-50 text-stone-400 hover:text-stone-900 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Source Image & Confidence */}
            <div className="lg:col-span-4 space-y-8">
              <div className="sticky top-24">
                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-stone-100 border border-stone-200 shadow-sm relative group">
                  {image && (
                    <img src={image} alt="Source inspiration" className="w-full h-full object-cover" />
                  )}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
                        <p className="text-sm font-medium">Deconstructing Style...</p>
                      </div>
                    </div>
                  )}
                </div>

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-3xl bg-white border border-stone-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif text-stone-900">{result.dressName}</h2>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        {Math.round(result.confidence * 100)}% Match
                      </div>
                    </div>
                    <p className="text-sm text-stone-500 leading-relaxed">
                      Analysis complete. We've identified the core components and located retail availability.
                    </p>
                    <button 
                      onClick={handleShare}
                      className={`mt-6 w-full py-3 rounded-xl border transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                        copied 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Link Copied
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          Share Analysis
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Column: Analysis Results */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[60vh] flex flex-col items-center justify-center text-center"
                  >
                    <div className="relative w-24 h-24 mb-8">
                      <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-stone-900 rounded-full border-t-transparent animate-spin"></div>
                      <Scan className="absolute inset-0 m-auto w-8 h-8 text-stone-900 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-serif text-stone-900">Identifying Elements</h3>
                    <p className="text-stone-500 text-sm mt-2 max-w-xs mx-auto">Scanning global inventories and deconstructing technical specifications...</p>
                  </motion.div>
                ) : result ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-10"
                  >
                    {/* Tabs */}
                    <div className="flex gap-10 border-b border-stone-100">
                      <button 
                        onClick={() => setActiveTab('shop')}
                        className={`pb-5 text-sm font-medium transition-all relative ${activeTab === 'shop' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                        Shop Matches
                        {activeTab === 'shop' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
                      </button>
                      <button 
                        onClick={() => setActiveTab('recreate')}
                        className={`pb-5 text-sm font-medium transition-all relative ${activeTab === 'recreate' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                        Recreate Blueprint
                        {activeTab === 'recreate' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />}
                      </button>
                    </div>

                    {activeTab === 'shop' ? (
                      <div className="space-y-6">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Retail Availability
                          </h3>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Brand:</span>
                              <select 
                                value={brandFilter}
                                onChange={(e) => setBrandFilter(e.target.value)}
                                className="text-xs font-medium text-stone-600 bg-transparent border-none outline-none cursor-pointer hover:text-stone-900"
                              >
                                {brands.map(b => (
                                  <option key={b} value={b}>{b === 'all' ? 'All Brands' : b}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Sort:</span>
                              <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="text-xs font-medium text-stone-600 bg-transparent border-none outline-none cursor-pointer hover:text-stone-900"
                              >
                                <option value="relevance">Relevance</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Product Grid */}
                        {filteredAndSortedMatches.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredAndSortedMatches.map((match, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white rounded-[2rem] border border-stone-100 overflow-hidden hover:shadow-xl hover:border-stone-200 transition-all"
                              >
                                <div className="aspect-[4/5] overflow-hidden relative">
                                  <img 
                                    src={match.imageUrl || image || ''} 
                                    alt={match.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    referrerPolicy="no-referrer" 
                                  />
                                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-stone-900 shadow-sm">
                                    {match.price}
                                  </div>
                                </div>
                                <div className="p-6">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="text-base font-medium text-stone-900 leading-tight">{match.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-stone-500">{match.store}</span>
                                        {match.brand && (
                                          <>
                                            <span className="w-1 h-1 rounded-full bg-stone-200" />
                                            <span className="text-xs text-stone-500">{match.brand}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {match.shipping && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mb-6">
                                      <Truck className="w-3 h-3" />
                                      {match.shipping}
                                    </div>
                                  )}

                                  <a 
                                    href={match.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
                                  >
                                    Buy Now
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mb-6">
                              <Search className="w-8 h-8 text-stone-200" />
                            </div>
                            <h4 className="text-lg font-serif text-stone-900 mb-2">No 100% Exact Match Found</h4>
                            <p className="text-sm text-stone-500 max-w-xs mx-auto mb-8">
                              We couldn't find an exact retail match for this specific design. 
                              Switch to the <span className="font-bold text-stone-900">Recreate Blueprint</span> tab to see how to custom-make this piece.
                            </p>
                            <button 
                              onClick={() => setActiveTab('recreate')}
                              className="px-8 py-3 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                            >
                              View Blueprint
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-12">
                        {/* Technical Specs Header */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <Scissors className="w-4 h-4" />
                            Technical Blueprint
                          </h3>
                          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                            Tailor-Ready Spec Sheet
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          {/* Palette & Materials */}
                          <div className="space-y-10">
                            <section>
                              <div className="flex items-center gap-2 mb-6">
                                <Palette className="w-4 h-4 text-stone-400" />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900">Color Palette</h4>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                {result.blueprint.palette.map((color, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl border border-stone-100 bg-white">
                                    <div 
                                      className="w-10 h-10 rounded-xl shadow-inner border border-stone-200/50 shrink-0" 
                                      style={{ backgroundColor: color.hex }}
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-stone-900 truncate">{color.name}</p>
                                      <p className="text-[10px] text-stone-400 font-mono uppercase">{color.hex}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>

                            <section>
                              <div className="flex items-center gap-2 mb-6">
                                <Layers className="w-4 h-4 text-stone-400" />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900">Materiality</h4>
                              </div>
                              <div className="p-6 rounded-3xl bg-stone-50 border border-stone-100">
                                <div className="text-xs font-bold text-stone-900 mb-2">{result.blueprint.primaryMaterial}</div>
                                <p className="text-xs text-stone-500 leading-relaxed mb-4">Primary fabric recommendation for authentic drape and finish.</p>
                                <div className="flex flex-wrap gap-2">
                                  {result.blueprint.components.map((comp, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[10px] font-medium text-stone-600">
                                      {comp}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </section>
                          </div>

                          {/* Construction Details */}
                          <div className="space-y-10">
                            <section>
                              <div className="flex items-center gap-2 mb-6">
                                <Maximize2 className="w-4 h-4 text-stone-400" />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900">Pattern & Silhouette</h4>
                              </div>
                              <div className="p-6 rounded-3xl bg-white border border-stone-100 shadow-sm">
                                <div className="text-xs text-stone-600 leading-relaxed">
                                  {result.blueprint.patternDiagram}
                                </div>
                              </div>
                            </section>

                            <section>
                              <div className="flex items-center gap-2 mb-6">
                                <Info className="w-4 h-4 text-stone-400" />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900">Artisanal Details</h4>
                              </div>
                              <div className="space-y-4">
                                {result.blueprint.beadDetails && (
                                  <div className="flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                                    <div>
                                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Beading</p>
                                      <p className="text-xs text-stone-600 leading-relaxed">{result.blueprint.beadDetails}</p>
                                    </div>
                                  </div>
                                )}
                                {result.blueprint.laceDescription && (
                                  <div className="flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                                    <div>
                                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Lace Work</p>
                                      <p className="text-xs text-stone-600 leading-relaxed">{result.blueprint.laceDescription}</p>
                                    </div>
                                  </div>
                                )}
                                {result.blueprint.stitchingNotes && (
                                  <div className="flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                                    <div>
                                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Stitching</p>
                                      <p className="text-xs text-stone-600 leading-relaxed">{result.blueprint.stitchingNotes}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </section>
                          </div>
                        </div>

                        {/* Technical Notes Footer */}
                        <div className="p-8 rounded-[2.5rem] bg-stone-900 text-white">
                          <div className="flex items-center gap-3 mb-4">
                            <Tag className="w-4 h-4 text-stone-500" />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Tailor's Directive</h4>
                          </div>
                          <p className="text-sm font-serif italic text-stone-300 leading-relaxed">
                            "{result.blueprint.technicalNotes}"
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-stone-100 rounded-[3rem]">
                    <div className="w-16 h-16 rounded-3xl bg-stone-50 flex items-center justify-center mb-6">
                      <Scan className="w-8 h-8 text-stone-200" />
                    </div>
                    <h3 className="text-xl font-serif text-stone-400">Awaiting Inspiration</h3>
                    <p className="text-stone-300 text-sm mt-2 max-w-xs mx-auto">Upload an image or paste a URL on the landing page to begin the analysis.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
