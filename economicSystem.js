class EconomicSystem {
    constructor() {
        this.prices = {
            '食物': 20,
            '娱乐': 50,
            '医疗': 100,
            '购物': 80,
            '交通': 10
        };
        
        this.inflation = 0;
        this.lastUpdate = Date.now();
        this.updateInterval = 60000; // 每分钟更新一次
        
        // 市场状态
        this.marketState = {
            demand: {},
            supply: {},
            transactions: []
        };
    }

    initialize() {
        // 重置经济系统状态
        this.inflation = 0;
        this.lastUpdate = Date.now();
        
        // 重置价格到初始值
        this.prices = {
            '食物': 20,
            '娱乐': 50,
            '医疗': 100,
            '购物': 80,
            '交通': 10
        };
        
        // 初始化市场状态
        this.marketState = {
            demand: {},
            supply: {},
            transactions: []
        };
        
        // 初始化需求和供给
        for (const item in this.prices) {
            this.marketState.demand[item] = 1.0;  // 基准需求
            this.marketState.supply[item] = 1.0;  // 基准供给
        }

        console.log('经济系统已初始化:', {
            prices: this.prices,
            inflation: this.inflation
        });
    }

    update() {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval) {
            return;
        }

        // 更新市场状态
        this.updateMarketState();
        // 调整价格
        this.adjustPrices();
        // 处理通货膨胀
        this.handleInflation();
        
        this.lastUpdate = now;
    }

    updateMarketState() {
        // 根据交易记录更新供需关系
        for (const item in this.prices) {
            const transactions = this.marketState.transactions.filter(t => t.item === item);
            if (transactions.length > 0) {
                const demandChange = transactions.length / 100; // 简化的需求计算
                this.marketState.demand[item] = Math.max(0.5, Math.min(2.0, 
                    this.marketState.demand[item] + demandChange));
            }
        }

        // 清理旧交易记录
        this.marketState.transactions = this.marketState.transactions
            .filter(t => Date.now() - t.time < 3600000); // 保留1小时内的交易
    }

    adjustPrices() {
        for (const item in this.prices) {
            const demandFactor = this.marketState.demand[item];
            const supplyFactor = this.marketState.supply[item];
            const priceChange = (demandFactor / supplyFactor - 1) * 0.1;
            
            this.prices[item] = Math.max(1, 
                this.prices[item] * (1 + priceChange + this.inflation));
        }
    }

    handleInflation() {
        // 简单的通货膨胀模拟
        this.inflation = Math.min(0.1, this.inflation + 0.0001);
        
        // 周期性通货紧缩
        if (this.inflation > 0.05) {
            this.inflation *= 0.95;
        }
    }

    recordTransaction(item, amount, price) {
        this.marketState.transactions.push({
            item,
            amount,
            price,
            time: Date.now()
        });
    }

    getPrice(item) {
        return Math.round(this.prices[item] || 0);
    }

    getMarketStatus(item) {
        return {
            price: this.getPrice(item),
            demand: this.marketState.demand[item],
            supply: this.marketState.supply[item],
            trend: this.getPriceTrend(item)
        };
    }

    getPriceTrend(item) {
        const recentTransactions = this.marketState.transactions
            .filter(t => t.item === item)
            .slice(-10);
            
        if (recentTransactions.length < 2) return 'stable';
        
        const avgPrice = recentTransactions.reduce((sum, t) => sum + t.price, 0) 
                        / recentTransactions.length;
        const currentPrice = this.prices[item];
        
        if (currentPrice > avgPrice * 1.1) return 'rising';
        if (currentPrice < avgPrice * 0.9) return 'falling';
        return 'stable';
    }
} 