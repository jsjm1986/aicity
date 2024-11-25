class CacheManager {
    constructor(city) {
        // 验证city对象
        if (!city) {
            throw new Error('CacheManager初始化失败: city参数为空');
        }

        this.city = city;
        
        // 缓存配置 - 调整内存限制
        this.config = {
            maxMemoryUsage: 500 * 1024 * 1024,    // 500MB (从100MB调整)
            warningThreshold: 400 * 1024 * 1024,   // 400MB (从80MB调整)
            criticalThreshold: 450 * 1024 * 1024,  // 450MB (从90MB调整)
            cleanupInterval: 30 * 1000,           // 30秒清理一次 (从60秒调整)
            maxAge: {
                actionLogs: 60 * 60 * 1000,       // 行为日志保留1小时 (从30分钟调整)
                dialogues: 30 * 60 * 1000,        // 对话记录保留30分钟 (从15分钟调整)
                memories: 2 * 60 * 60 * 1000,     // 记忆保留2小时 (从1小时调整)
                pathCache: 10 * 60 * 1000,        // 路径缓存保留10分钟 (从5分钟调整)
                relationships: 48 * 60 * 60 * 1000 // 关系数据保留48小时 (从24小时调整)
            },
            // 添加新的配置项
            maxCacheItems: {
                pathCache: 1000,      // 最大路径缓存数量
                actionLogs: 500,      // 最大行为日志数量
                memories: 200,        // 每个代理的最大记忆数量
                relationships: 100    // 每个代理的最大关系数量
            },
            // 添加批量清理阈值
            batchCleanupSize: {
                pathCache: 100,       // 每次清理100条路径缓存
                actionLogs: 50,       // 每次清理50条行为日志
                memories: 20,         // 每次清理20条记忆
                relationships: 10     // 每次清理10条关系
            }
        };
        
        // 添加内存使用监控
        this.memoryUsageHistory = [];
        this.lastCleanupTime = Date.now();
        this.cleanupStats = {
            totalCleanups: 0,
            itemsRemoved: 0,
            memoryReclaimed: 0
        };
    }

    initialize() {
        try {
            console.log('初始化缓存管理器...');
            
            // 验证关键数组
            this.validateCityArrays();
            
            // 启动定期清理和监控
            this.startCleanupInterval();
            this.startMemoryMonitoring();
            
            // 初始化性能监控
            this.initializePerformanceMonitoring();
            
            // 执行初始清理
            this.cleanup();
            
            console.log('缓存管理器初始化完成');
            return true;
        } catch (error) {
            console.error('缓存管理器初始化失败:', error);
            throw error;
        }
    }

    initializePerformanceMonitoring() {
        this.performanceStats = {
            lastCleanupTime: 0,
            cleanupCount: 0,
            averageCleanupTime: 0,
            peakMemoryUsage: 0,
            cleanupEfficiency: 0
        };
    }

    validateCityArrays() {
        const requiredArrays = ['buildings', 'agents', 'roads', 'districts'];
        const missingArrays = requiredArrays.filter(
            arrayName => !Array.isArray(this.city[arrayName])
        );

        if (missingArrays.length > 0) {
            throw new Error(`缓存管理器初始化失败: 以下数组未正确初始化: ${missingArrays.join(', ')}`);
        }
    }

    startMemoryMonitoring() {
        setInterval(() => {
            const usage = this.getMemoryUsage();
            this.memoryUsageHistory.push({
                time: Date.now(),
                usage: usage.heapUsed
            });

            // 保持历史记录在合理范围内
            if (this.memoryUsageHistory.length > 100) {
                this.memoryUsageHistory.shift();
            }

            // 检测内存泄漏
            this.checkMemoryLeak();
        }, 10000);
    }

    checkMemoryLeak() {
        if (this.memoryUsageHistory.length < 2) return;
        
        const recentUsage = this.memoryUsageHistory.slice(-10);
        const growthRate = (recentUsage[recentUsage.length - 1].usage - recentUsage[0].usage) 
                          / recentUsage[0].usage;

        if (growthRate > 0.2) { // 如果内存增长超过20%
            console.warn('检测到可能的内存泄漏');
            this.cleanup();
        }
    }

    startCleanupInterval() {
        setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }

    cleanup() {
        const now = Date.now();
        const memoryBefore = this.getMemoryUsage().heapUsed;
        
        try {
            // 确保city对象和必要的数组存在
            if (!this.city || !Array.isArray(this.city.buildings)) {
                console.warn('cleanup: city或buildings数组未就绪');
                return;
            }

            // 按批次清理各个系统的数据
            this.cleanupUIData(now);
            this.cleanupAgentData(now);
            this.cleanupSocialData(now);
            this.cleanupBuildingData(now);
            this.cleanupPathCache(now);
            
            // 记录清理结果
            const memoryAfter = this.getMemoryUsage().heapUsed;
            const memoryReclaimed = memoryBefore - memoryAfter;
            
            this.cleanupStats.totalCleanups++;
            this.cleanupStats.memoryReclaimed += memoryReclaimed;
            
            console.log('缓存清理完成:', {
                heapUsedBefore: Math.round(memoryBefore / 1024 / 1024) + 'MB',
                heapUsedAfter: Math.round(memoryAfter / 1024 / 1024) + 'MB',
                memoryReclaimed: Math.round(memoryReclaimed / 1024 / 1024) + 'MB',
                time: new Date(now).toLocaleTimeString(),
                stats: this.cleanupStats
            });

            // 如果内存使用仍然很高，触发紧急清理
            if (memoryAfter > this.config.criticalThreshold) {
                this.emergencyCleanup();
            }
        } catch (error) {
            console.error('缓存清理错误:', error);
        }
    }

    emergencyCleanup() {
        console.warn('执行紧急清理...');
        
        // 清理所有非必要的缓存
        this.city.pathSystem.pathCache.clear();
        this.memoryUsageHistory = [];
        
        // 清理代理的历史记录
        this.city.agents.forEach(agent => {
            if (agent.memory) {
                agent.memory = agent.memory.slice(-10); // 只保留最近10条记忆
            }
        });
        
        // 强制进行垃圾回收（如果环境支持）
        if (window.gc) {
            window.gc();
        }
        
        console.log('紧急清理完成');
    }

    cleanupUIData(now) {
        if (this.city.uiSystem) {
            // 清理旧的动作日志
            this.city.uiSystem.actionLogs = this.city.uiSystem.actionLogs
                .filter(log => now - log.timestamp < this.config.maxAge.actionLogs);
            
            // 清理旧的对话记录
            this.city.uiSystem.dialogues = this.city.uiSystem.dialogues
                .filter(dialogue => now - dialogue.timestamp < this.config.maxAge.dialogues);
        }
    }

    cleanupAgentData(now) {
        if (!Array.isArray(this.city.agents)) {
            console.warn('cleanupAgentData: agents数组未就绪');
            return;
        }

        this.city.agents.forEach(agent => {
            if (!agent) return;

            // 检查并清理记忆
            if (agent.memory) {
                // 确保memory是数组
                if (Array.isArray(agent.memory)) {
                    agent.memory = agent.memory
                        .filter(memory => memory && memory.timestamp && 
                               now - memory.timestamp < this.config.maxAge.memories);
                } else {
                    // 如果memory不是数组，初始化为空数组
                    agent.memory = [];
                }
            } else {
                // 如果memory不存在，初始化为空数组
                agent.memory = [];
            }
            
            // 清理路径缓存
            if (agent.pathCache) {
                agent.pathCache = null;
            }

            // 清理其他临时数据
            if (agent.tempData) {
                delete agent.tempData;
            }

            // 限制记忆数量
            if (Array.isArray(agent.memory) && 
                agent.memory.length > this.config.maxCacheItems.memories) {
                // 保留最新的记忆
                agent.memory = agent.memory
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, this.config.maxCacheItems.memories);
            }
        });

        console.log('代理数据清理完成');
    }

    cleanupSocialData(now) {
        if (this.city.socialSystem) {
            // 清理过期的社交关系数据
            for (const [key, value] of this.city.socialSystem.relationships.entries()) {
                if (now - value.lastUpdate > this.config.maxAge.relationships) {
                    this.city.socialSystem.relationships.delete(key);
                }
            }
        }
    }

    cleanupBuildingData(now) {
        // 确保buildings数组存在且有效
        if (!Array.isArray(this.city.buildings)) {
            console.warn('cleanupBuildingData: buildings数组未就绪');
            return;
        }

        try {
            this.city.buildings.forEach(building => {
                if (!building) return;
                
                // 验证并清理无效的占用者
                if (building.currentOccupants) {
                    this.updateBuildingOccupancy(building);
                } else {
                    building.currentOccupants = new Set();
                }
            });
        } catch (error) {
            console.error('建筑物数据清理错误:', error);
        }
    }

    cleanupPathCache(now) {
        if (this.city.pathSystem) {
            // 清理过期的路径缓存
            for (const [key, value] of this.city.pathSystem.pathCache.entries()) {
                if (now - value.timestamp > this.config.maxAge.pathCache) {
                    this.city.pathSystem.pathCache.delete(key);
                }
            }
        }
    }

    updateBuildingOccupancy(building) {
        try {
            // 确保agents数组存在
            if (!Array.isArray(this.city.agents)) {
                console.warn('updateBuildingOccupancy: agents数组未就绪');
                building.currentOccupants = new Set();
                return;
            }

            // 验证并清理无效的占用者
            building.currentOccupants = new Set(
                Array.from(building.currentOccupants || new Set())
                    .filter(id => this.city.agents.some(agent => agent && agent.id === id))
            );
        } catch (error) {
            console.error('更新建筑物占用者时出错:', error);
            building.currentOccupants = new Set();
        }
    }

    getMemoryUsage() {
        // 使用performance.memory替代process.memoryUsage
        if (window.performance && performance.memory) {
            return {
                heapTotal: performance.memory.totalJSHeapSize,
                heapUsed: performance.memory.usedJSHeapSize,
                heapLimit: performance.memory.jsHeapSizeLimit
            };
        }
        // 如果performance.memory不可用，返回模拟数据
        return {
            heapTotal: 0,
            heapUsed: 0,
            heapLimit: 0
        };
    }

    update(deltaTime) {
        try {
            // 确保deltaTime有效
            if (!deltaTime || deltaTime < 0) {
                deltaTime = 16; // 约60fps
            }

            // 检查是否需要执行清理
            const now = Date.now();
            if (now - this.lastCleanupTime > this.config.cleanupInterval) {
                this.cleanup();
                this.lastCleanupTime = now;
            }

            // 更新内存使用统计
            this.updateMemoryStats();

            // 检查内存使用情况
            this.checkMemoryUsage();

            // 更新性能统计
            this.updatePerformanceStats(deltaTime);

        } catch (error) {
            console.error('缓存管理器更新失败:', error);
        }
    }

    updateMemoryStats() {
        const memoryUsage = this.getMemoryUsage();
        
        // 更新内存使用历史
        this.memoryUsageHistory.push({
            timestamp: Date.now(),
            usage: memoryUsage.heapUsed
        });

        // 保持历史记录在合理范围内
        if (this.memoryUsageHistory.length > 100) {
            this.memoryUsageHistory.shift();
        }

        // 更新峰值内存使用
        if (memoryUsage.heapUsed > this.performanceStats.peakMemoryUsage) {
            this.performanceStats.peakMemoryUsage = memoryUsage.heapUsed;
        }
    }

    checkMemoryUsage() {
        const memoryUsage = this.getMemoryUsage();
        
        // 检查是否超过警告阈值
        if (memoryUsage.heapUsed > this.config.warningThreshold) {
            console.warn('内存使用接近阈值:', {
                current: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
                threshold: Math.round(this.config.warningThreshold / 1024 / 1024) + 'MB'
            });
        }

        // 检查是否需要紧急清理
        if (memoryUsage.heapUsed > this.config.criticalThreshold) {
            console.warn('内存使用超过临界值，执行紧急清理');
            this.emergencyCleanup();
        }

        // 检查内存泄漏
        this.checkMemoryLeak();
    }

    updatePerformanceStats(deltaTime) {
        // 更新清理效率
        if (this.cleanupStats.totalCleanups > 0) {
            this.performanceStats.cleanupEfficiency = 
                this.cleanupStats.memoryReclaimed / this.cleanupStats.totalCleanups;
        }

        // 更新平均清理时间
        if (this.cleanupStats.totalCleanups > 0) {
            this.performanceStats.averageCleanupTime = 
                this.performanceStats.lastCleanupTime / this.cleanupStats.totalCleanups;
        }

        // 记录性能数据
        if (this.city.eventSystem) {
            this.city.eventSystem.emit('CACHE_STATS_UPDATED', {
                memoryUsage: this.getMemoryUsage(),
                cleanupStats: this.cleanupStats,
                performanceStats: this.performanceStats
            });
        }
    }

    checkMemoryLeak() {
        if (this.memoryUsageHistory.length < 10) return;

        // 检查最近10个采样点的内存增长趋势
        const recentUsage = this.memoryUsageHistory.slice(-10);
        const growthRate = (recentUsage[recentUsage.length - 1].usage - recentUsage[0].usage) 
                          / recentUsage[0].usage;

        if (growthRate > 0.2) { // 如果内存在短时间内增长超过20%
            console.warn('检测到可能的内存泄漏:', {
                growthRate: (growthRate * 100).toFixed(1) + '%',
                timeSpan: '最近10次采样'
            });

            // 触发紧急清理
            this.emergencyCleanup();

            // 通知事件系统
            if (this.city.eventSystem) {
                this.city.eventSystem.emit('MEMORY_LEAK_DETECTED', {
                    growthRate,
                    currentUsage: this.getMemoryUsage()
                });
            }
        }
    }
}

class PerformanceMonitor {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.metrics = {
            fps: [],
            memoryUsage: [],
            cleanupTimes: []
        };
        
        this.startMonitoring();
    }

    startMonitoring() {
        setInterval(() => {
            this.collectMetrics();
            this.analyzePerformance();
        }, 5000);
    }

    collectMetrics() {
        // 收集FPS
        this.metrics.fps.push(this.cacheManager.city.fps);

        // 收集内存使用情况（使用performance.memory）
        if (window.performance && performance.memory) {
            this.metrics.memoryUsage.push(performance.memory.usedJSHeapSize);
        } else {
            this.metrics.memoryUsage.push(0); // 如果不支持，使用0作为占位符
        }
        
        // 保持最近100采样
        if (this.metrics.fps.length > 100) {
            this.metrics.fps.shift();
            this.metrics.memoryUsage.shift();
        }
    }

    analyzePerformance() {
        const avgFPS = this.getAverage(this.metrics.fps);
        const memoryTrend = this.calculateTrend(this.metrics.memoryUsage);
        
        // 如果性能下降，触发清理
        if (avgFPS < 30 || memoryTrend > 0.1) {
            console.log('性能警告: 触发额外清理');
            this.cacheManager.cleanup();
        }
    }

    getAverage(array) {
        return array.reduce((a, b) => a + b, 0) / array.length;
    }

    calculateTrend(array) {
        if (array.length < 2) return 0;
        return (array[array.length - 1] - array[0]) / array[0];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheManager;
} 