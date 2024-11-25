class UISystem {
    constructor(city) {
        this.city = city;
        this.updateInterval = 1000; // 每秒更新一次
        this.lastUpdate = 0;
        
        // 日志和对话记录
        this.actionLogs = [];
        this.dialogues = [];
        this.maxLogs = 20;
        this.maxDialogues = 10;
    }

    initialize() {
        try {
            console.log('初始化UI系统...');
            
            // 创建主UI容器
            this.createMainContainer();
            
            // 清除现有显示
            this.clearExistingDisplays();
            
            // 创建各个显示区域
            this.timeDisplay = this.createDisplaySection('时间');
            this.weatherDisplay = this.createDisplaySection('天气');
            this.performanceDisplay = this.createDisplaySection('性能');
            this.agentStatsDisplay = this.createDisplaySection('Agent统计');
            this.buildingDisplay = this.createDisplaySection('建筑信息');
            this.logsDisplay = this.createDisplaySection('实时动态');
            this.dialogueDisplay = this.createDisplaySection('对话记录');
            
            // 添加样式
            this.addStyles();
            
            // 启动UI更新循环
            this.startUIUpdates();
            
            // 确保UI可见
            this.mainUI.style.display = 'block';
            this.mainUI.style.opacity = '1';
            
            console.log('UI系统初始化完成');
            return true;
        } catch (error) {
            console.error('UI系统初始化失败:', error);
            throw error;
        }
    }

    createMainContainer() {
        // 移除可能存在的旧UI
        const existingUI = document.getElementById('mainUI');
        if (existingUI) {
            existingUI.remove();
        }

        // 创建主UI容器
        this.mainUI = document.createElement('div');
        this.mainUI.id = 'mainUI';
        this.mainUI.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            z-index: 1000;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(this.mainUI);
    }

    clearExistingDisplays() {
        // 清除主UI容器中的所有内容
        while (this.mainUI.firstChild) {
            this.mainUI.removeChild(this.mainUI.firstChild);
        }
    }

    createDisplaySection(title) {
        const section = document.createElement('div');
        section.className = 'display-section';
        
        const header = document.createElement('h3');
        header.style.cssText = `
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #4CAF50;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;
        header.textContent = title;
        
        const content = document.createElement('div');
        content.className = 'section-content';
        content.style.cssText = `
            font-size: 13px;
            line-height: 1.4;
            color: #fff;
        `;
        
        section.appendChild(header);
        section.appendChild(content);
        this.mainUI.appendChild(section);
        
        return content;
    }

    startUIUpdates() {
        // 清除可能存在的旧定时器
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // 设置新的更新定���器
        this.updateTimer = setInterval(() => {
            this.update();
        }, this.updateInterval);
    }

    update(deltaTime) {
        try {
            // 确保city和必要的系统存在
            if (!this.city || !this.mainUI) {
                console.warn('UI更新失败: city或mainUI未就绪');
                return;
            }

            // 更新时间显示
            if (this.timeDisplay && this.city.timeSystem) {
                const timeString = this.city.timeSystem.getFullTimeString();
                this.timeDisplay.textContent = `时间: ${timeString}`;
            }

            // 更新天气显示
            if (this.weatherDisplay && this.city.weatherSystem) {
                const weather = this.city.weatherSystem.getCurrentWeather();
                this.weatherDisplay.textContent = `天气: ${weather.type} ${weather.temperature}°C 湿度: ${weather.humidity}%`;
            }

            // 更新性能统计
            if (this.performanceDisplay) {
                const stats = this.city.getPerformanceStats();
                this.performanceDisplay.innerHTML = `
                    FPS: ${stats.fps}<br>
                    内存: ${stats.memoryUsage.used}MB / ${stats.memoryUsage.total}MB<br>
                    代理数量: ${stats.agentCount}<br>
                    建筑数量: ${stats.buildingCount}<br>
                    寻路请求: ${stats.pathfindingRequests}
                `;
            }

            // 更新代理统计
            if (this.agentStatsDisplay) {
                const distribution = this.city.getAgentDistribution();
                let statsHtml = '<div class="stats-grid">';
                
                // 显示职业分布
                Object.entries(distribution).forEach(([role, data]) => {
                    statsHtml += `
                        <div class="stat-item">
                            ${role}: ${data.count} (${data.percentage})
                        </div>
                    `;
                });
                statsHtml += '</div>';

                // 显示平均统计
                const averageStats = this.calculateAverageStats();
                statsHtml += `
                    <div class="average-stats">
                        平均工资: ${averageStats.avgSalary}元<br>
                        平均心情: ${averageStats.avgMood}%<br>
                        平均能量: ${averageStats.avgEnergy}%
                    </div>
                `;

                this.agentStatsDisplay.innerHTML = statsHtml;
            }

            // 更新建筑信息
            if (this.buildingDisplay) {
                const buildingStats = this.getBuildingStats();
                this.buildingDisplay.innerHTML = `
                    <div class="building-stats">
                        总建筑数: ${buildingStats.total}<br>
                        住宅区占用率: ${buildingStats.residentialOccupancy}%<br>
                        商业区占用率: ${buildingStats.commercialOccupancy}%<br>
                        工作区占用率: ${buildingStats.workplaceOccupancy}%
                    </div>
                `;
            }

            // 更新实时动态
            if (this.logsDisplay) {
                let logsHtml = '';
                this.actionLogs.slice(-5).forEach(log => {
                    logsHtml += `
                        <div class="action-log">
                            <span class="time">${log.time}</span>
                            <span class="content">${log.content}</span>
                        </div>
                    `;
                });
                this.logsDisplay.innerHTML = logsHtml;
            }

            // 更新对话记录
            if (this.dialogueDisplay) {
                let dialoguesHtml = '';
                this.dialogues.slice(-3).forEach(dialogue => {
                    dialoguesHtml += `
                        <div class="dialogue">
                            <span class="time">${dialogue.time}</span>
                            <span class="speaker">${dialogue.speaker}</span>
                            <span class="content">${dialogue.content}</span>
                        </div>
                    `;
                });
                this.dialogueDisplay.innerHTML = dialoguesHtml;
            }

        } catch (error) {
            console.error('UI更新失败:', error);
        }
    }

    calculateAverageStats() {
        const agents = this.city.agents;
        if (!agents || agents.length === 0) return { avgSalary: 0, avgMood: 0, avgEnergy: 0 };

        let totalSalary = 0;
        let totalMood = 0;
        let totalEnergy = 0;

        agents.forEach(agent => {
            totalSalary += agent.salary || 0;
            totalMood += agent.mood || 0;
            totalEnergy += agent.energy || 0;
        });

        return {
            avgSalary: Math.round(totalSalary / agents.length),
            avgMood: Math.round(totalMood / agents.length),
            avgEnergy: Math.round(totalEnergy / agents.length)
        };
    }

    getBuildingStats() {
        const buildings = this.city.buildings;
        if (!buildings || buildings.length === 0) return {
            total: 0,
            residentialOccupancy: 0,
            commercialOccupancy: 0,
            workplaceOccupancy: 0
        };

        let stats = {
            total: buildings.length,
            residential: { capacity: 0, occupied: 0 },
            commercial: { capacity: 0, occupied: 0 },
            workplace: { capacity: 0, occupied: 0 }
        };

        buildings.forEach(building => {
            if (!building) return;

            const occupants = building.currentOccupants?.size || 0;
            const capacity = building.capacity || 0;

            if (building.type.includes('住宅') || building.type.includes('公寓')) {
                stats.residential.capacity += capacity;
                stats.residential.occupied += occupants;
            } else if (building.type.includes('商场') || building.type.includes('店')) {
                stats.commercial.capacity += capacity;
                stats.commercial.occupied += occupants;
            } else {
                stats.workplace.capacity += capacity;
                stats.workplace.occupied += occupants;
            }
        });

        return {
            total: stats.total,
            residentialOccupancy: Math.round((stats.residential.occupied / stats.residential.capacity) * 100),
            commercialOccupancy: Math.round((stats.commercial.occupied / stats.commercial.capacity) * 100),
            workplaceOccupancy: Math.round((stats.workplace.occupied / stats.workplace.capacity) * 100)
        };
    }

    addActionLog(content) {
        this.actionLogs.push({
            time: this.city.timeSystem.getTimeString(),
            content: content
        });

        if (this.actionLogs.length > this.maxLogs) {
            this.actionLogs.shift();
        }
    }

    addDialogue(speaker, content) {
        this.dialogues.push({
            time: this.city.timeSystem.getTimeString(),
            speaker: speaker,
            content: content
        });

        if (this.dialogues.length > this.maxDialogues) {
            this.dialogues.shift();
        }
    }

    getMemoryUsage() {
        if (window.performance && performance.memory) {
            return {
                heapTotal: performance.memory.totalJSHeapSize,
                heapUsed: performance.memory.usedJSHeapSize
            };
        }
        return { heapTotal: 0, heapUsed: 0 };
    }

    addStyles() {
        const styleId = 'ui-system-styles';
        let styleElement = document.getElementById(styleId);
        
        // 如果样式已存在，先移除
        if (styleElement) {
            styleElement.remove();
        }

        // 创建新的样式元素
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        
        styleElement.textContent = `
            .display-section {
                background: rgba(0, 0, 0, 0.5);
                padding: 12px;
                margin-bottom: 12px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .section-content {
                margin-top: 8px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                margin: 8px 0;
            }
            
            .stats-grid div {
                background: rgba(255, 255, 255, 0.1);
                padding: 6px;
                border-radius: 4px;
                font-size: 12px;
                text-align: center;
            }
            
            .average-stats {
                background: rgba(255, 255, 255, 0.05);
                padding: 10px;
                margin: 8px 0;
                border-radius: 6px;
                font-size: 12px;
            }
            
            .dialogue {
                margin: 6px 0;
                padding: 6px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
                font-size: 12px;
            }
            
            .dialogue .time {
                color: #4CAF50;
                margin-right: 6px;
            }
            
            .dialogue .speaker {
                color: #64B5F6;
                margin-right: 6px;
                font-weight: bold;
            }
            
            .action-log {
                padding: 4px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 12px;
            }
            
            .action-log:last-child {
                border-bottom: none;
            }
            
            .action-log .time {
                color: #4CAF50;
                margin-right: 6px;
            }
            
            .warning {
                color: #FFA726;
            }
            
            .error {
                color: #EF5350;
            }
            
            .success {
                color: #66BB6A;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .display-section {
                animation: fadeIn 0.3s ease-out forwards;
            }
            
            /* 滚动条样式 */
            .section-content::-webkit-scrollbar {
                width: 4px;
            }
            
            .section-content::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 2px;
            }
            
            .section-content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
            }
            
            /* 悬停效果 */
            .stats-grid div:hover {
                background: rgba(255, 255, 255, 0.15);
                transition: background 0.2s ease;
            }
            
            .dialogue:hover {
                background: rgba(255, 255, 255, 0.1);
                transition: background 0.2s ease;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
} 