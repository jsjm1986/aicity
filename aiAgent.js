class AIAgent extends Agent {
    constructor(x, y, role, id, city) {
        super(x, y, role, id, city);
        this.role = 'AI助手';
        this.personality = {
            openness: 0.9,      // 更开放
            conscientiousness: 0.8,  // 更负责
            extraversion: 0.7,   // 适度外向
            agreeableness: 0.9,  // 更友善
            neuroticism: 0.2     // 更稳定
        };
        
        // AI特有属性
        this.memory = {
            shortTerm: [],  // 短期记忆
            longTerm: [],   // 长期记忆
            conversations: [], // 对话历史
            observations: []  // 环境观察
        };
        this.lastThinkTime = 0;
        this.thinkInterval = 5000; // 5秒思考一次
        this.maxMemorySize = 50;   // 最大记忆数量
    }

    async think(currentTime) {
        if (Date.now() - this.lastThinkTime < this.thinkInterval) {
            return;
        }

        // 准备环境信息
        const context = this.gatherContextInfo();
        
        // 构建提示词
        const prompt = this.constructPrompt(context);

        try {
            const response = await this.queryDeepseek(prompt);
            await this.processAIResponse(response);
        } catch (error) {
            console.error('AI思考错误:', error);
            this.fallbackBehavior();
        }

        this.lastThinkTime = Date.now();
    }

    gatherContextInfo() {
        // 收集环境信息
        const nearbyAgents = this.getNearbyAgents()
            .map(agent => ({
                role: agent.role,
                state: agent.state,
                distance: Math.hypot(this.x - agent.x, this.y - agent.y)
            }));

        const nearbyBuildings = this.getNearbyBuildings(this.city.buildings)
            .map(building => ({
                type: building.type,
                occupancy: building.currentOccupants.size,
                capacity: building.details.capacity
            }));

        return {
            currentTime: this.city.timeSystem.getTimeString(),
            weather: this.city.weatherSystem.currentWeather,
            location: { x: this.x, y: this.y },
            needs: this.needs,
            state: this.state,
            nearbyAgents,
            nearbyBuildings,
            recentMemories: this.memory.shortTerm.slice(-5),
            mood: this.mood
        };
    }

    constructPrompt(context) {
        return {
            role: "user",
            content: JSON.stringify({
                instruction: "作为城市中的AI助手，请基于当前情况决定下一步行动。",
                context: context,
                format: `请以JSON格式返回：{
                    "action": "行动类型",
                    "target": "目标对象",
                    "reason": "决策原因",
                    "dialogue": "对话内容（如果需要）"
                }`
            })
        };
    }

    async queryDeepseek(prompt) {
        if (!CONFIG.DEEPSEEK_API_KEY || CONFIG.DEEPSEEK_API_KEY === 'your-api-key-here') {
            return this.offlineDecision();
        }

        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [prompt],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        return await response.json();
    }

    async processAIResponse(response) {
        try {
            const decision = JSON.parse(response.choices[0].message.content);
            
            // 记录决策到记忆中
            this.addToMemory({
                type: 'decision',
                content: decision,
                timestamp: Date.now()
            });

            // 执行决策
            switch(decision.action) {
                case 'move':
                    this.moveToLocation(decision.target);
                    break;
                case 'interact':
                    this.interactWithAgent(decision.target);
                    break;
                case 'enter':
                    this.enterBuilding(decision.target);
                    break;
                case 'help':
                    this.helpOthers(decision.target);
                    break;
                case 'observe':
                    this.observeEnvironment();
                    break;
                default:
                    this.wander();
            }

            // 如果有对话内容，添加到对话历史
            if (decision.dialogue) {
                this.memory.conversations.push({
                    content: decision.dialogue,
                    timestamp: Date.now()
                });
            }

        } catch (error) {
            console.error('处理AI响应错误:', error);
            this.fallbackBehavior();
        }
    }

    addToMemory(memory) {
        // 添加到短期记忆
        this.memory.shortTerm.push(memory);
        if (this.memory.shortTerm.length > this.maxMemorySize) {
            this.memory.shortTerm.shift();
        }

        // 重要记忆转移到长期记忆
        if (this.isImportantMemory(memory)) {
            this.memory.longTerm.push(memory);
            if (this.memory.longTerm.length > this.maxMemorySize) {
                this.memory.longTerm.shift();
            }
        }
    }

    isImportantMemory(memory) {
        // 判断记忆重要性的逻辑
        const importantTypes = ['interaction', 'achievement', 'emergency'];
        return importantTypes.includes(memory.type) || 
               memory.content?.importance === 'high';
    }

    helpOthers(target) {
        const targetAgent = this.findNearbyAgent(target);
        if (targetAgent) {
            this.state = `正在帮助${targetAgent.role}`;
            // 实现帮助行为的具体逻辑
        }
    }

    observeEnvironment() {
        const observation = {
            timestamp: Date.now(),
            nearbyAgents: this.getNearbyAgents(),
            nearbyBuildings: this.getNearbyBuildings(this.city.buildings),
            weather: this.city.weatherSystem.currentWeather,
            time: this.city.timeSystem.getTimeString()
        };

        this.memory.observations.push(observation);
        this.state = '观察环境';
    }

    fallbackBehavior() {
        // 当AI决策失败时的后备行为
        const behaviors = [
            () => this.wander(),
            () => this.findNearestBuilding('休息区'),
            () => this.updateNeeds(),
            () => this.socialize()
        ];

        const randomBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        randomBehavior();
    }

    draw(ctx) {
        super.draw(ctx);
        
        // 添加AI特殊标识
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 15, 5, 0, Math.PI * 2);
        ctx.fill();

        // 显示思考状态
        if (Date.now() - this.lastThinkTime < 1000) {
            ctx.fillStyle = '#FFC107';
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y - 15, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 如果使用模块系统，确保正确导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAgent;
} 