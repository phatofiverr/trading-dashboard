import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Target, Users } from 'lucide-react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useAccountsStore } from '@/hooks/useAccountsStore';

const Summary: React.FC = () => {
  const { trades } = useTradeStore();
  const { accounts } = useAccountsStore();

  // Calculate summary statistics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(trade => {
    const profit = trade.profit;
    return profit !== undefined && profit !== null && !isNaN(profit) && isFinite(profit) && profit > 0;
  }).length;
  const losingTrades = trades.filter(trade => {
    const profit = trade.profit;
    return profit !== undefined && profit !== null && !isNaN(profit) && isFinite(profit) && profit < 0;
  }).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : '0';
  
  const totalProfit = trades.reduce((sum, trade) => {
    const profit = trade.profit;
    // Handle undefined, null, or invalid values
    if (profit === undefined || profit === null || isNaN(profit) || !isFinite(profit)) {
      return sum;
    }
    return sum + profit;
  }, 0);
  
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">Trading Summary</h1>
                      <p className="text-muted-foreground mt-1">Your comprehensive trading overview</p>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="glass-effect bg-black/5 border-0">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
                        <BarChart3 className="h-4 w-4 text-blue-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">{totalTrades}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect bg-black/5 border-0">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
                        <Target className="h-4 w-4 text-green-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">{winRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {winningTrades}W / {losingTrades}L
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect bg-black/5 border-0">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
                        {totalProfit >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${totalProfit.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Cumulative</p>
                      </CardContent>
                    </Card>
                  </div>


                    {/* Accounts Overview */}
                  <div className="mt-8">
                  <Card className="glass-effect bg-black/5 border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Accounts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-lg font-bold">{totalAccounts}</div>
                          <div className="text-xs text-muted-foreground">Active</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-lg font-bold">${totalBalance.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Total Balance</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-lg font-bold">
                            ${totalBalance > 0 ? (totalBalance / totalAccounts).toFixed(2) : '0.00'}
                          </div>
                          <div className="text-xs text-muted-foreground">Avg Balance</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="glass-effect bg-black/5 border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {trades.length > 0 ? (
                        <div className="space-y-3">
                          {trades.slice(0, 5).map((trade, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${(trade.profit ?? 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div>
                                  <p className="font-medium text-sm">{trade.instrument || trade.pair}</p>
                                  <p className="text-xs text-muted-foreground">{trade.strategyId || 'Manual'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium text-sm ${(trade.profit ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ${trade.profit?.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {trade.entryDate ? new Date(trade.entryDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground text-sm">No trades recorded</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Summary;
