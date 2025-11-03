import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MultiSourceTable from "@/components/MultiSourceTable";
import LineMovementChart from "@/components/LineMovementChart";
import ValueRadar from "@/components/ValueRadar";
import SourceStatus from "@/components/SourceStatus";

const Index = () => {
  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      {/* Sidebar */}
      <Sidebar activeSection="dashboard" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 overflow-auto">
          <div className="max-w-[2000px] mx-auto space-y-4">
            
            {/* Main Grid Layout */}
            <div className="grid grid-cols-12 gap-4">
              {/* Multi-Source Odds Comparison - Full Width */}
              <div className="col-span-12">
                <MultiSourceTable />
              </div>

              {/* Line Movement Chart - 8 columns */}
              <div className="col-span-8">
                <LineMovementChart />
              </div>

              {/* Value Radar - 4 columns */}
              <div className="col-span-4">
                <ValueRadar />
              </div>

              {/* Source Status - 4 columns */}
              <div className="col-span-4">
                <SourceStatus />
              </div>

              {/* Additional space for future widgets */}
              <div className="col-span-8">
                <div className="terminal-card p-4 h-64 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Additional Analytics Module
                  </span>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
