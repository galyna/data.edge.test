import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import OddsChart from "@/components/OddsChart";
import DataTable from "@/components/DataTable";
import { Activity, TrendingUp, Target, Zap, Search, Bell, User } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      {/* Sidebar */}
      <Sidebar activeSection="dashboard" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-signal">Data Edge Platform</h1>
            <span className="text-xs text-muted-foreground">v2.1.0</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search markets..."
                className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors w-64"
              />
            </div>

            {/* Icons */}
            <button className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center">
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1800px] mx-auto space-y-6">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                title="Total Value Found"
                value="$147.3k"
                change="23.5%"
                trend="up"
                icon={TrendingUp}
                highlight
              />
              <MetricCard
                title="Active Markets"
                value="284"
                change="12"
                trend="up"
                icon={Activity}
              />
              <MetricCard
                title="Win Rate"
                value="73.2%"
                change="2.1%"
                trend="up"
                icon={Target}
              />
              <MetricCard
                title="Avg. Edge"
                value="8.5%"
                change="0.3%"
                trend="up"
                icon={Zap}
              />
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-3 gap-6">
              {/* Large Odds Chart */}
              <div className="col-span-2 bg-card border border-border rounded-lg p-6 border-signal glow-primary">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Live Odds Movement</h2>
                    <p className="text-xs text-muted-foreground">Real-time comparison across bookmakers</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs rounded bg-primary/20 text-primary border border-primary/50">
                      1H
                    </button>
                    <button className="px-3 py-1 text-xs rounded bg-muted hover:bg-muted/80">
                      1D
                    </button>
                    <button className="px-3 py-1 text-xs rounded bg-muted hover:bg-muted/80">
                      1W
                    </button>
                  </div>
                </div>
                <div className="h-80">
                  <OddsChart />
                </div>
              </div>

              {/* Side Stats */}
              <div className="space-y-4">
                {/* Market Overview */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">Market Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Matches</span>
                      <span className="font-mono font-bold text-signal">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Leagues Active</span>
                      <span className="font-mono font-bold">68</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Value Bets</span>
                      <span className="font-mono font-bold text-primary">142</span>
                    </div>
                    <div className="h-px bg-border my-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Latency</span>
                      <span className="font-mono text-xs text-primary">~150ms</span>
                    </div>
                  </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">Value Distribution</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>High (10%+)</span>
                        <span className="font-mono text-primary">23</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary glow-primary" style={{ width: "35%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Medium (5-10%)</span>
                        <span className="font-mono">67</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: "55%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Low (2-5%)</span>
                        <span className="font-mono">52</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-muted-foreground" style={{ width: "42%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">High-Value Opportunities</h2>
                  <p className="text-xs text-muted-foreground">Real-time inefficiencies detected</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Updated:</span>
                  <span className="text-xs font-mono text-signal">2.3s ago</span>
                </div>
              </div>
              <DataTable />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
