
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StrategyListItem {
  name: string;
  winRate: number;
  profit: number;
  tradesCount: number;
}

interface ProfileStrategiesProps {
  strategies: StrategyListItem[];
  isCurrentUser: boolean;
}

const ProfileStrategies: React.FC<ProfileStrategiesProps> = ({ strategies, isCurrentUser }) => {
  return (
    <Card className="glass-effect border-white/5">
      <CardContent className="pt-6">
        {strategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strategies.map((strategy) => (
              <Link 
                key={strategy.name} 
                to={`/strategies/${encodeURIComponent(strategy.name)}`}
                className="block p-3 rounded-md border border-white/10 bg-black/20 hover:bg-black/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{strategy.name}</h3>
                  <span className={strategy.profit >= 0 ? "text-green-500" : "text-red-500"}>
                    {strategy.profit >= 0 ? "+" : ""}{strategy.profit.toFixed(2)}R
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Win rate: {strategy.winRate.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {strategy.tradesCount} trades
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {isCurrentUser 
              ? "You haven't created any strategies yet." 
              : "This user hasn't shared any strategies."}
          </div>
        )}
        
        {isCurrentUser && strategies.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button variant="glass" size="sm" asChild>
              <Link to="/strategies">Manage Strategies</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileStrategies;
