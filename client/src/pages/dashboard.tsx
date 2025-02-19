import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChartView } from "@/components/ChartView";
import { WalletList } from "@/components/WalletList";
import { Filters } from "@/components/Filters";
import { useToast } from "@/hooks/use-toast";
import { isValidSolanaAddress } from "@/lib/web3";
import { Maximize2 } from "lucide-react";

export default function Dashboard() {
  const [contractAddress, setContractAddress] = useState<string>(() => {
    return localStorage.getItem("lastContractAddress") || "";
  });
  const [activeSearch, setActiveSearch] = useState(false);
  const [isWalletListExpanded, setIsWalletListExpanded] = useState(false);
  const { toast } = useToast();
  const [selectedTimeRange, setSelectedTimeRange] = useState<[Date, Date]>([
    new Date(Date.now() - 24 * 60 * 60 * 1000),
    new Date()
  ]);

  const handleAddressSubmit = () => {
    if (!isValidSolanaAddress(contractAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Solana contract address",
        variant: "destructive"
      });
      return;
    }
    setActiveSearch(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setContractAddress(newValue);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-[1800px] mx-auto px-4 py-2">
          <div className="flex gap-4 items-center">
            {activeSearch && <h2 className="text-sm font-mono text-muted-foreground">{contractAddress}</h2>}
            <div className={`flex gap-4 ${activeSearch ? 'w-64 ml-auto' : 'w-full'}`}>
              <Input
                placeholder="Enter contract address"
                value={contractAddress}
                onChange={handleInputChange}
                className="font-mono"
              />
              <Button 
                onClick={handleAddressSubmit}
                disabled={!contractAddress}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {contractAddress && (
          <div className="grid gap-6" style={{ 
            gridTemplateColumns: isWalletListExpanded ? '1fr' : '2fr 1fr',
            transition: 'grid-template-columns 0.3s ease-in-out'
          }}>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <ChartView
                    contractAddress={contractAddress}
                    timeRange={selectedTimeRange}
                    onTimeRangeChange={setSelectedTimeRange}
                  />
                </CardContent>
              </Card>

              <Card className="lg:hidden">
                <CardContent className="pt-6">
                  <Filters
                    onFiltersChange={(filters) => {
                      console.log("Filters changed:", filters);
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Transaction List</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsWalletListExpanded(!isWalletListExpanded)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <WalletList
                    contractAddress={contractAddress}
                    timeRange={selectedTimeRange}
                  />
                </CardContent>
              </Card>

              <Card className="hidden lg:block">
                <CardContent className="pt-6">
                  <Filters
                    onFiltersChange={(filters) => {
                      console.log("Filters changed:", filters);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}