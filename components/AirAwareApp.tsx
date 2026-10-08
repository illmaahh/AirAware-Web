"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CarFront,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Cloud,
  CloudSun,
  Compass,
  Gauge,
  Leaf,
  LocateFixed,
  MapPin,
  Menu,
  Navigation,
  RefreshCw,
  Route,
  Sparkles,
  TrainFront,
  Trees,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { aqBand, signedTrend } from "@/lib/aq";
import { calculateCommute, MODES, type TransportMode } from "@/lib/transport";
import SceneLoader from "@/components/SceneLoader";

type AirResult = {
  source: string;
  sourceType: string;
  location: { name: string; country: string; latitude: number; longitude: number; timezone: string };
  retrievedAt: string;
  current: {
    time?: string;
    us_aqi?: number;
    pm2_5?: number;
    pm10?: number;
    nitrogen_dioxide?: number;
    ozone?: number;
  };
  hourly: {
    time?: string[];
    us_aqi?: (number | null)[];
    pm2_5?: (number | null)[];
    pm10?: (number | null)[];
    nitrogen_dioxide?: (number | null)[];
    ozone?: (number | null)[];
  };
};

const demo = {
  city: "Delhi",
  mode: "Petrol car" as TransportMode,
  distance: 8,
  trips: 10,
  occupants: 1,
  efficiency: 15,
  evEfficiency: 16,
};

function number(v: unknown, digits = 1) {
  return typeof v === "number" && Number.isFinite(v) ? v.toFixed(digits) : "—";
}

function modeIcon(mode: string) {
  if (mode.includes("car") || mode.includes("motorcycle")) return <CarFront size={17} />;
  if (mode.includes("Metro")) return <TrainFront size={17} />;
  if (mode.includes("walk") || mode.includes("Bicycle")) return <Trees size={17} />;
  if (mode.includes("Electric")) return <Zap size={17} />;
  return <Route size={17} />;
}

export default function AirAwareApp() {
  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [city, setCity] = useState(demo.city);
  const [air, setAir] = useState<AirResult | null>(null);
  const [loadingAir, setLoadingAir] = useState(false);
  const [airError, setAirError] = useState("");

  const [mode, setMode] = useState<TransportMode>(demo.mode);
  const [distance, setDistance] = useState(demo.distance);
  const [trips, setTrips] = useState(demo.trips);
  const [occupants, setOccupants] = useState(demo.occupants);
  const [efficiency, setEfficiency] = useState(demo.efficiency);
  const [evEfficiency, setEvEfficiency] = useState(demo.evEfficiency);

  const [scenarioMode, setScenarioMode] = useState<TransportMode>("Metro / rail");
  const [aiText, setAiText] = useState<{ provider: string; title: string; steps?: string[]; text?: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [goal, setGoal] = useState(15);

  const commute = useMemo(
    () =>
      calculateCommute({
        mode,
        distanceKm: distance,
        tripsPerWeek: trips,
        occupants,
        fuelEfficiency: efficiency,
        evKwhPer100Km: evEfficiency,
      }),
    [mode, distance, trips, occupants, efficiency, evEfficiency],
  );

  const comparison = useMemo(
    () =>
      MODES.map((m) =>
        calculateCommute({
          mode: m,
          distanceKm: distance,
          tripsPerWeek: trips,
          occupants,
          fuelEfficiency: efficiency,
          evKwhPer100Km: evEfficiency,
        }),
      ),
    [distance, trips, occupants, efficiency, evEfficiency],
  );

  const best = [...comparison].sort((a, b) => a.monthlyCo2Kg - b.monthlyCo2Kg)[0];
  const alternative = calculateCommute({
    mode: scenarioMode,
    distanceKm: distance,
    tripsPerWeek: trips,
    occupants,
    fuelEfficiency: efficiency,
    evKwhPer100Km: evEfficiency,
  });
  const scenarioSaving = Math.max(commute.monthlyCo2Kg - alternative.monthlyCo2Kg, 0);

  async function fetchAir(targetCity = city) {
    setLoadingAir(true);
    setAirError("");
    try {
      const response = await fetch(`/api/air-quality?city=${encodeURIComponent(targetCity)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not fetch air quality.");
      setAir(payload);
      setCity(payload.location.name);
    } catch (error) {
      setAirError(error instanceof Error ? error.message : "Could not fetch air quality.");
    } finally {
      setLoadingAir(false);
    }
  }

  function useDemo() {
    setCity(demo.city);
    setMode(demo.mode);
    setDistance(demo.distance);
    setTrips(demo.trips);
    setOccupants(demo.occupants);
    setEfficiency(demo.efficiency);
    setEvEfficiency(demo.evEfficiency);
    fetchAir(demo.city);
    setActive("air");
  }

  async function generateAI() {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: air ? `${air.location.name}, ${air.location.country}` : city,
          airQuality: air?.current || {},
          commute: {
            mode: commute.mode,
            monthlyKm: commute.monthlyKm,
            monthlyCo2Kg: commute.monthlyCo2Kg,
            annualCo2Tonnes: commute.annualCo2Tonnes,
          },
          comparison: comparison.map((x) => ({ mode: x.mode, monthlyCo2Kg: x.monthlyCo2Kg })),
        }),
      });
      const payload = await response.json();
      setAiText(payload);
    } catch {
      setAiText({
        provider: "Local fallback",
        title: "Your personalized commute plan",
        steps: [
          "Re-check the air-quality trend before making a longer trip.",
          "Compare shared/public/active options for suitable routes.",
          `Your current estimate is ${commute.monthlyCo2Kg.toFixed(1)} kg CO₂/month.`,
          "Pick one small change and compare next month's estimate with this baseline.",
        ],
      });
    } finally {
      setAiLoading(false);
    }
  }

  const hourly = air?.hourly?.time?.map((time, i) => ({
    time: new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    aqi: air.hourly.us_aqi?.[i] ?? null,
    pm25: air.hourly.pm2_5?.[i] ?? null,
  })) || [];

  const trend = signedTrend((air?.hourly?.us_aqi || []).filter((x): x is number => typeof x === "number"));
  const aq = aqBand(air?.current?.us_aqi ?? null);
  const scenarioPct = commute.monthlyCo2Kg > 0 ? Math.round((scenarioSaving / commute.monthlyCo2Kg) * 100) : 0;

  function navTo(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  }

  return (
    <div className="site">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brandMark"><span /></div>
          <div>
            <strong>AirAware</strong>
            <small>Climate intelligence</small>
          </div>
        </div>

        <div className="liveBadge"><span className="pulseDot" /> LIVE DATA ENGINE</div>

        <nav>
          {[
            ["overview", "Overview", <Gauge size={17} />],
            ["air", "Air Lens", <Cloud size={17} />],
            ["commute", "Commute Lab", <Route size={17} />],
            ["action", "Action Engine", <Sparkles size={17} />],
            ["method", "Trust & Method", <CircleHelp size={17} />],
          ].map(([id, label, icon]) => (
            <button key={id as string} className={active === id ? "navItem active" : "navItem"} onClick={() => navTo(id as string)}>
              {icon}
              <span>{label}</span>
              {active === id && <ChevronRight size={15} className="navArrow" />}
            </button>
          ))}
        </nav>

        <div className="sidebarBottom">
          <button className="demoButton" onClick={useDemo}><Sparkles size={16} /> Load live demo</button>
          <div className="sidebarTiny">
            <span><CheckCircle2 size={13} /> Vercel-ready</span>
            <span><CheckCircle2 size={13} /> AI fallback</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobileMenu" onClick={() => setMobileOpen((v) => !v)} aria-label="Open navigation">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="breadcrumbs"><span>AirAware</span><i>/</i><strong>{active === "overview" ? "Command Center" : active.replace("-", " ")}</strong></div>
          <div className="topActions">
            <span className="securePill"><span className="pulseDot" /> Modelled + calculated</span>
            <button className="iconButton" onClick={() => fetchAir()} aria-label="Refresh air quality"><RefreshCw size={17} className={loadingAir ? "spin" : ""} /></button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.28 }}
          >
            <section id="overview" className="section heroSection">
              <div className="heroCopy">
                <div className="eyebrow"><span className="spark" /> AI + CLIMATE ACTION</div>
                <h1>See the air.<br /><em>Rethink the route.</em></h1>
                <p className="heroSub">
                  AirAware turns air-quality signals and commute behavior into a visual climate decision layer — built for real-world action, not another generic dashboard.
                </p>

                <div className="heroActions">
                  <button className="primaryButton" onClick={() => navTo("air")}><CloudSun size={18} /> Explore air lens <ArrowDownRight size={17} /></button>
                  <button className="ghostButton" onClick={() => navTo("commute")}><CarFront size={18} /> Build my commute</button>
                </div>

                <div className="heroMeta">
                  <span><span className="metaDot green" /> Modelled air quality</span>
                  <span><span className="metaDot blue" /> Estimated emissions</span>
                  <span><span className="metaDot violet" /> AI-assisted actions</span>
                </div>
              </div>

              <div className="heroVisual">
                <div className="orbLabel top"><span>ATMOSPHERE CORE</span><strong>{air ? aq.label : "READY"}</strong></div>
                <SceneLoader intensity={air?.current?.us_aqi && air.current.us_aqi > 150 ? 2 : 1} />
                <div className="orbLabel bottom">
                  <span>{air ? `${air.location.name}, ${air.location.country}` : "Select a city to begin"}</span>
                  <strong>{air?.current?.us_aqi ? `${Math.round(air.current.us_aqi)} US AQI` : "AIR / TRANSPORT / AI"}</strong>
                </div>
              </div>
            </section>

            <section className="signalStrip">
              <div><span className="stripKicker">PROJECT FOCUS</span><strong>Air Quality + Transport</strong></div>
              <div><span className="stripKicker">LIVE SOURCE</span><strong>Open-Meteo Air Quality</strong></div>
              <div><span className="stripKicker">DECISION LAYER</span><strong>AI-assisted recommendations</strong></div>
              <div><span className="stripKicker">DEPLOYMENT</span><strong>Vercel / Next.js</strong></div>
            </section>

            <section id="air" className="section">
              <div className="sectionHeader">
                <div>
                  <div className="eyebrow">01 / AIR LENS</div>
                  <h2>What is happening <em>right now?</em></h2>
                  <p>Modelled air-quality signals for a selected city, with a short-range outlook.</p>
                </div>
                <div className="searchDock">
                  <MapPin size={17} />
                  <input value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchAir()} placeholder="Search city…" />
                  <button onClick={() => fetchAir()} disabled={loadingAir}>{loadingAir ? "Loading…" : "Check"}</button>
                </div>
              </div>

              {airError && <div className="errorBanner">{airError}</div>}

              {!air && !loadingAir && (
                <div className="emptyAir">
                  <div className="emptyIcon"><LocateFixed size={26} /></div>
                  <div>
                    <strong>Start with a city</strong>
                    <p>Try Delhi, Mumbai, London, Dubai or any city supported by the geocoder.</p>
                  </div>
                  <button className="secondaryButton" onClick={useDemo}>Load Delhi demo</button>
                </div>
              )}

              {air && (
                <>
                  <div className="aqGrid">
                    <div className="aqHeroCard">
                      <div className="miniLabel">MODELLED US AQI</div>
                      <div className="aqValue">{Math.round(air.current.us_aqi ?? 0)}</div>
                      <div className="aqStatus">{aq.label}</div>
                      <p>{aq.description}</p>
                      <div className="trendPill">{trend.label} <span>{trend.delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}</span></div>
                      <div className="cardFoot">Source: {air.source}</div>
                    </div>

                    {[
                      ["PM₂.₅", air.current.pm2_5, "µg/m³", "Fine particulate matter", "pm"],
                      ["PM₁₀", air.current.pm10, "µg/m³", "Particulate matter", "pm"],
                      ["NO₂", air.current.nitrogen_dioxide, "µg/m³", "Nitrogen dioxide", "gas"],
                      ["O₃", air.current.ozone, "µg/m³", "Ozone", "gas"],
                    ].map(([name, value, unit, note]) => (
                      <div className="pollutantCard" key={name as string}>
                        <div className="pollutantTop"><span>{name}</span><Activity size={15} /></div>
                        <strong>{number(value)}</strong>
                        <small>{unit}</small>
                        <p>{note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="chartCard">
                    <div className="chartTitle">
                      <div>
                        <strong>24-hour atmosphere trace</strong>
                        <span>Model forecast / short horizon</span>
                      </div>
                      <span className="livePill"><span className="pulseDot" /> refreshed</span>
                    </div>
                    <div className="chartWrap">
                      <ResponsiveContainer width="100%" height={310}>
                        <AreaChart data={hourly}>
                          <defs>
                            <linearGradient id="aqFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#62d993" stopOpacity={0.34} />
                              <stop offset="100%" stopColor="#62d993" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#dfe9e3" />
                          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#7a877f" }} axisLine={false} tickLine={false} minTickGap={30} />
                          <YAxis tick={{ fontSize: 11, fill: "#7a877f" }} axisLine={false} tickLine={false} width={35} />
                          <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #dfe9e3", boxShadow: "0 12px 30px rgba(24,50,37,.12)" }} />
                          <Area type="monotone" dataKey="aqi" stroke="#43bb75" strokeWidth={3} fill="url(#aqFill)" />
                          <Line type="monotone" dataKey="pm25" stroke="#7f9efc" strokeWidth={2} dot={false} yAxisId={0} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </section>

            <section id="commute" className="section darkSection">
              <div className="sectionHeader light">
                <div>
                  <div className="eyebrow">02 / COMMUTE LAB</div>
                  <h2>Turn your route into a <em>climate signal.</em></h2>
                  <p>Estimate monthly transport CO₂, then compare the same commute across multiple modes.</p>
                </div>
                <div className="darkTag"><Navigation size={15} /> Scenario engine</div>
              </div>

              <div className="labGrid">
                <div className="formCard">
                  <div className="formTitle"><span>YOUR CURRENT ROUTE</span><strong>Commute profile</strong></div>

                  <label>Primary mode</label>
                  <div className="modeGrid">
                    {MODES.map((m) => (
                      <button key={m} className={mode === m ? "modeButton selected" : "modeButton"} onClick={() => setMode(m)}>
                        {modeIcon(m)}
                        <span>{m}</span>
                      </button>
                    ))}
                  </div>

                  <div className="inputGrid">
                    <label>One-way distance (km)
                      <input type="number" min="0" value={distance} onChange={(e) => setDistance(Number(e.target.value))} />
                    </label>
                    <label>Trips / week
                      <input type="number" min="0" value={trips} onChange={(e) => setTrips(Number(e.target.value))} />
                    </label>
                    {(mode.includes("car") || mode === "Petrol motorcycle") && (
                      <>
                        <label>Vehicle efficiency (km/L)
                          <input type="number" min="1" value={efficiency} onChange={(e) => setEfficiency(Number(e.target.value))} />
                        </label>
                        <label>People sharing
                          <input type="number" min="1" value={occupants} onChange={(e) => setOccupants(Number(e.target.value))} />
                        </label>
                      </>
                    )}
                    {mode === "Electric vehicle" && (
                      <label>EV use (kWh/100 km)
                        <input type="number" min="1" value={evEfficiency} onChange={(e) => setEvEfficiency(Number(e.target.value))} />
                      </label>
                    )}
                  </div>

                  <div className="calcNote"><CircleHelp size={14} /> Estimated values depend on assumptions such as route, occupancy, efficiency and methodology.</div>
                </div>

                <div className="impactCard">
                  <div className="impactTop"><span>ESTIMATED MONTHLY CO₂</span><Leaf size={20} /></div>
                  <div className="impactNumber">{commute.monthlyCo2Kg.toFixed(1)}<span>kg</span></div>
                  <div className="impactSub">{commute.monthlyKm.toFixed(0)} km / month · {commute.annualCo2Tonnes.toFixed(2)} t / year</div>
                  <div className="impactBar"><span style={{ width: `${Math.min(Math.max(commute.monthlyCo2Kg / 250 * 100, 6), 100)}%` }} /></div>
                  <div className="impactFoot"><span>{mode}</span><span>baseline</span></div>
                </div>
              </div>

              <div className="compareBlock">
                <div className="compareHeader">
                  <div><strong>Route emissions matrix</strong><span>Same distance + frequency, different mode</span></div>
                  <div className="legend"><span><i className="legendCurrent" /> current</span><span><i className="legendBest" /> lowest estimate</span></div>
                </div>
                <div className="compareList">
                  {comparison.sort((a, b) => a.monthlyCo2Kg - b.monthlyCo2Kg).map((row) => (
                    <div className="compareRow" key={row.mode}>
                      <div className="compareMode">{modeIcon(row.mode)} {row.mode}</div>
                      <div className="compareTrack">
                        <span style={{ width: `${Math.min(Math.max((row.monthlyCo2Kg / Math.max(commute.monthlyCo2Kg, 1)) * 32 + 8, 8), 100)}%` }} />
                      </div>
                      <strong>{row.monthlyCo2Kg.toFixed(1)} kg</strong>
                    </div>
                  ))}
                </div>
                <div className="bestCallout">
                  <CheckCircle2 size={18} />
                  <div><strong>{best.mode}</strong> is the lowest-emission option in this prototype scenario.</div>
                  <span>{Math.max(commute.monthlyCo2Kg - best.monthlyCo2Kg, 0).toFixed(1)} kg/month difference</span>
                </div>
              </div>
            </section>

            <section id="action" className="section">
              <div className="sectionHeader">
                <div>
                  <div className="eyebrow">03 / ACTION ENGINE</div>
                  <h2>Explore a better <em>commute.</em></h2>
                  <p>Turn the baseline into a scenario, then let the AI layer explain what is actually changing.</p>
                </div>
                <button className="primaryButton" onClick={generateAI} disabled={aiLoading}>
                  <Sparkles size={17} /> {aiLoading ? "Thinking…" : "Generate action plan"}
                </button>
              </div>

              <div className="scenarioGrid">
                <div className="scenarioCard">
                  <div className="scenarioLabel">CURRENT → ALTERNATIVE</div>
                  <div className="scenarioSelects">
                    <div><span>Current</span><strong>{mode}</strong></div>
                    <ChevronRight size={18} />
                    <select value={scenarioMode} onChange={(e) => setScenarioMode(e.target.value as TransportMode)}>
                      {MODES.filter((x) => x !== mode).map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </div>

                  <div className="beforeAfter">
                    <div><span>CURRENT</span><strong>{commute.monthlyCo2Kg.toFixed(1)}<small> kg</small></strong></div>
                    <div className="scenarioArrow"><ArrowDownRight size={24} /></div>
                    <div><span>ALTERNATIVE</span><strong>{alternative.monthlyCo2Kg.toFixed(1)}<small> kg</small></strong></div>
                  </div>

                  <div className="savingPanel">
                    <div><span>ESTIMATED MONTHLY DIFFERENCE</span><strong>{scenarioSaving.toFixed(1)} kg CO₂</strong></div>
                    <span className="savingBadge">{scenarioPct}% lower</span>
                  </div>

                  <div className="goalLine">
                    <div><span>Climate action goal</span><strong>{goal}%</strong></div>
                    <input type="range" min="5" max="50" step="5" value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
                    <div className="goalTrack"><span style={{ width: `${Math.min(scenarioPct / goal * 100, 100)}%` }} /></div>
                    <small>{scenarioPct >= goal ? "Goal reached in this scenario." : `${goal - scenarioPct}% more reduction to reach the selected goal.`}</small>
                  </div>
                </div>

                <div className="aiCard">
                  <div className="aiHead">
                    <div className="aiOrb"><Sparkles size={18} /></div>
                    <div><span>AI-ASSISTED RECOMMENDATION</span><strong>{aiText?.provider || "Ready when you are"}</strong></div>
                  </div>
                  {!aiText ? (
                    <div className="aiEmpty">
                      <div className="aiIcon"><Sparkles size={24} /></div>
                      <strong>Build a plan from your data</strong>
                      <p>AirAware combines the air-quality context, your commute profile and the mode comparison before generating recommendations.</p>
                      <button className="secondaryButton" onClick={generateAI}>Generate my plan</button>
                    </div>
                  ) : (
                    <div className="aiResult">
                      <h3>{aiText.title}</h3>
                      {aiText.text ? <p className="aiText">{aiText.text}</p> : (
                        <ol>{aiText.steps?.map((x, i) => <li key={i}><span>{i + 1}</span><p>{x}</p></li>)}</ol>
                      )}
                      <div className="aiTrust"><CircleHelp size={14} /> Air quality is modelled; emissions are estimates. AI is used only for recommendation generation.</div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section id="method" className="section methodSection">
              <div className="sectionHeader">
                <div>
                  <div className="eyebrow">04 / TRUST & METHOD</div>
                  <h2>Credibility is a <em>feature.</em></h2>
                  <p>AirAware makes the difference between data, calculations, assumptions and AI visible.</p>
                </div>
              </div>

              <div className="methodGrid">
                <div className="methodCard">
                  <span className="methodNum">01</span>
                  <h3>Modelled air quality</h3>
                  <p>AirAware uses Open-Meteo's air-quality API for modelled current and hourly values including US AQI, PM₂.₅, PM₁₀, NO₂ and O₃.</p>
                  <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">View source ↗</a>
                </div>
                <div className="methodCard">
                  <span className="methodNum">02</span>
                  <h3>Transport estimates</h3>
                  <p>Fuel-based and passenger-km calculations are transparent and configurable. They are intended for education and scenario comparison, not certified inventories.</p>
                  <a href="https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle" target="_blank" rel="noreferrer">Reference ↗</a>
                </div>
                <div className="methodCard">
                  <span className="methodNum">03</span>
                  <h3>AI with guardrails</h3>
                  <p>Gemini is isolated to the recommendation layer. Deterministic calculations remain outside the model, and a local fallback keeps the app functional without an API key.</p>
                  <a href="https://ai.google.dev/gemini-api/docs/get-started" target="_blank" rel="noreferrer">AI docs ↗</a>
                </div>
                <div className="methodCard caution">
                  <span className="methodNum">04</span>
                  <h3>What AirAware is not</h3>
                  <p>It is not an official CPCB monitoring app, a certified emissions inventory, or a medical-advice system. Users should check official local guidance when appropriate.</p>
                </div>
              </div>

              <div className="projectRibbon">
                <div><span>INTERNSHIP PROJECT</span><strong>1M1B · Green Skills & Applied AI</strong></div>
                <div><span>CLIMATE AREA</span><strong>Air Quality & Transport</strong></div>
                <div><span>PRODUCT TYPE</span><strong>Working web prototype</strong></div>
                <div><span>LIVE DEMO</span><strong>Vercel / Next.js</strong></div>
              </div>
            </section>

            <footer className="footer">
              <div><strong>AirAware</strong><span>Smart Commute & Air Quality Advisor</span></div>
              <div><span>Built as an educational climate-tech prototype.</span><span>Data, estimates and AI are labelled.</span></div>
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
