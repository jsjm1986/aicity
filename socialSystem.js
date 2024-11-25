class SocialSystem {
    constructor(city) {
        this.city = city;
        
        // 存储社交互动记录
        this.interactions = new Map();
        
        // 存储关系网络
        this.relationships = new Map();
        
        // 互动类型及其效果
        this.interactionTypes = {
            CHAT: { baseEffect: 10, duration: 5 * 60 * 1000 },      // 聊天
            WORK: { baseEffect: 5, duration: 8 * 60 * 60 * 1000 },  // 工作关系
            FRIEND: { baseEffect: 15, duration: 24 * 60 * 60 * 1000 }, // 朋友关系
            FAMILY: { baseEffect: 20, duration: Infinity },         // 家庭关系
            CONFLICT: { baseEffect: -10, duration: 12 * 60 * 60 * 1000 } // 冲突
        };
        
        // 清理间隔
        this.cleanupInterval = 60 * 60 * 1000; // 1小时清理一次
        this.lastCleanup = Date.now();
    }

    initialize() {
        console.log('初始化社交系统...');
        
        // 清空历史数据
        this.interactions.clear();
        this.relationships.clear();
        
        // 设置定期清理
        setInterval(() => this.cleanup(), this.cleanupInterval);
        
        console.log('社交系统初始化完成');
    }

    getRecentInteractions(agentId, timeWindow = 30 * 60 * 1000) { // 默认30分钟
        try {
            const now = Date.now();
            const agentInteractions = this.interactions.get(agentId) || [];
            
            // 过滤出时间窗口内的互动
            return agentInteractions.filter(interaction => 
                now - interaction.timestamp < timeWindow
            );
        } catch (error) {
            console.error('获取最近互动记录失败:', error);
            return [];
        }
    }

    addInteraction(agent1, agent2, type = 'CHAT', customEffect = null) {
        try {
            const interactionType = this.interactionTypes[type];
            if (!interactionType) {
                console.warn('未知的互动类型:', type);
                return;
            }

            const timestamp = Date.now();
            const effect = customEffect ?? this.calculateInteractionEffect(agent1, agent2, type);
            
            const interaction = {
                timestamp,
                type,
                effect,
                duration: interactionType.duration,
                participants: [agent1.id, agent2.id]
            };

            // 为两个代理都记录互动
            this.recordInteraction(agent1.id, interaction);
            this.recordInteraction(agent2.id, interaction);

            // 更新关系网络
            this.updateRelationship(agent1.id, agent2.id, effect);

            console.log('新的社交互动:', {
                agent1: agent1.id,
                agent2: agent2.id,
                type,
                effect
            });

        } catch (error) {
            console.error('添加互动记录失败:', error);
        }
    }

    recordInteraction(agentId, interaction) {
        if (!this.interactions.has(agentId)) {
            this.interactions.set(agentId, []);
        }
        this.interactions.get(agentId).push(interaction);
    }

    calculateInteractionEffect(agent1, agent2, type) {
        const baseEffect = this.interactionTypes[type].baseEffect;
        let effect = baseEffect;

        // 考虑心情影响
        const moodFactor = (agent1.mood + agent2.mood) / 200; // 0-1
        effect *= moodFactor;

        // 考虑关系历史
        const relationship = this.getRelationship(agent1.id, agent2.id);
        if (relationship) {
            effect *= (1 + relationship.level / 100);
        }

        // 考虑角色兼容性
        if (agent1.role === agent2.role) {
            effect *= 1.2; // 相同角色加成
        }

        // 随机波动
        effect *= 0.8 + Math.random() * 0.4; // ±20%波动

        return Math.round(effect);
    }

    updateRelationship(agent1Id, agent2Id, interactionEffect) {
        const relationshipKey = this.getRelationshipKey(agent1Id, agent2Id);
        let relationship = this.relationships.get(relationshipKey);

        if (!relationship) {
            relationship = {
                level: 0,
                interactions: 0,
                lastInteraction: 0
            };
        }

        // 更新关系数据
        relationship.level = Math.max(-100, Math.min(100, 
            relationship.level + interactionEffect * 0.1
        ));
        relationship.interactions++;
        relationship.lastInteraction = Date.now();

        this.relationships.set(relationshipKey, relationship);
    }

    getRelationship(agent1Id, agent2Id) {
        const key = this.getRelationshipKey(agent1Id, agent2Id);
        return this.relationships.get(key);
    }

    getRelationshipKey(agent1Id, agent2Id) {
        // 确保关系键的一致性（较小ID在前）
        return [agent1Id, agent2Id].sort().join(':');
    }

    cleanup() {
        const now = Date.now();
        
        // 清理过期的互动记录
        for (const [agentId, interactions] of this.interactions.entries()) {
            const validInteractions = interactions.filter(interaction =>
                now - interaction.timestamp < interaction.duration
            );
            
            if (validInteractions.length === 0) {
                this.interactions.delete(agentId);
            } else {
                this.interactions.set(agentId, validInteractions);
            }
        }

        // 清理过期的关系
        for (const [key, relationship] of this.relationships.entries()) {
            if (now - relationship.lastInteraction > 30 * 24 * 60 * 60 * 1000) { // 30天
                this.relationships.delete(key);
            }
        }

        this.lastCleanup = now;
        console.log('社交系统清理完成');
    }

    getRelationshipStats(agentId) {
        const stats = {
            totalRelationships: 0,
            averageLevel: 0,
            positiveRelationships: 0,
            negativeRelationships: 0
        };

        for (const [key, relationship] of this.relationships.entries()) {
            if (key.includes(agentId)) {
                stats.totalRelationships++;
                stats.averageLevel += relationship.level;
                
                if (relationship.level > 0) {
                    stats.positiveRelationships++;
                } else if (relationship.level < 0) {
                    stats.negativeRelationships++;
                }
            }
        }

        if (stats.totalRelationships > 0) {
            stats.averageLevel /= stats.totalRelationships;
        }

        return stats;
    }

    update(deltaTime) {
        try {
            // 确保deltaTime有效
            if (!deltaTime || deltaTime < 0) {
                deltaTime = 16; // 约60fps
            }

            // 更新社交互动
            this.updateInteractions();

            // 清理过期数据
            this.cleanupExpiredData();

            // 更新关系强度
            this.updateRelationships();

            // 生成随机社交事件
            this.generateRandomSocialEvents();

        } catch (error) {
            console.error('社交系统更新失败:', error);
        }
    }

    updateInteractions() {
        // 获取所有代理
        const agents = this.city.agents;
        if (!Array.isArray(agents)) return;

        // 检查近距离的代理之间的互动
        for (let i = 0; i < agents.length; i++) {
            const agent1 = agents[i];
            if (!agent1) continue;

            for (let j = i + 1; j < agents.length; j++) {
                const agent2 = agents[j];
                if (!agent2) continue;

                // 检查两个代理是否足够近
                const distance = Math.hypot(agent2.x - agent1.x, agent2.y - agent1.y);
                if (distance < 50) { // 50像素的互动范围
                    this.handleProximityInteraction(agent1, agent2);
                }
            }
        }
    }

    handleProximityInteraction(agent1, agent2) {
        // 检查是否应该产生互动
        if (Math.random() < 0.1) { // 10%的互动概率
            // 确定互动类型
            const interactionType = this.determineInteractionType(agent1, agent2);
            
            // 添加互动记录
            this.addInteraction(agent1, agent2, interactionType);
        }
    }

    determineInteractionType(agent1, agent2) {
        // 根据代理的角色和关系确定互动类型
        if (agent1.role === agent2.role) {
            return 'CHAT'; // 相同角色更可能聊天
        }

        const relationship = this.getRelationship(agent1.id, agent2.id);
        if (relationship && relationship.level > 50) {
            return 'FRIEND'; // 关系好的变成朋友
        }

        if (agent1.role === '工人' && agent2.role === '工人') {
            return 'WORK'; // 工作关系
        }

        return 'CHAT'; // 默认互动类型
    }

    cleanupExpiredData() {
        const now = Date.now();
        
        // 清理过期的互动记录
        for (const [agentId, interactions] of this.interactions.entries()) {
            const validInteractions = interactions.filter(interaction =>
                now - interaction.timestamp < interaction.duration
            );
            
            if (validInteractions.length === 0) {
                this.interactions.delete(agentId);
            } else {
                this.interactions.set(agentId, validInteractions);
            }
        }

        // 清理过期的关系
        for (const [key, relationship] of this.relationships.entries()) {
            if (now - relationship.lastInteraction > 30 * 24 * 60 * 60 * 1000) { // 30天
                this.relationships.delete(key);
            }
        }
    }

    updateRelationships() {
        // 随时间衰减关系强度
        for (const [key, relationship] of this.relationships.entries()) {
            const timeSinceLastInteraction = Date.now() - relationship.lastInteraction;
            const decayRate = 0.1; // 每天衰减10%
            const daysElapsed = timeSinceLastInteraction / (24 * 60 * 60 * 1000);
            
            relationship.level *= Math.pow(1 - decayRate, daysElapsed);
            
            // 如果关系太弱，直接删除
            if (Math.abs(relationship.level) < 1) {
                this.relationships.delete(key);
            }
        }
    }

    generateRandomSocialEvents() {
        // 随机生成社交事件
        if (Math.random() < 0.01) { // 1%的概率
            const agents = this.city.agents;
            if (!Array.isArray(agents) || agents.length < 2) return;

            // 随机选择两个代理
            const agent1 = agents[Math.floor(Math.random() * agents.length)];
            const agent2 = agents[Math.floor(Math.random() * agents.length)];

            if (agent1 && agent2 && agent1 !== agent2) {
                // 生成随机事件
                const eventType = Math.random() < 0.8 ? 'CHAT' : 'CONFLICT';
                this.addInteraction(agent1, agent2, eventType);

                // 通知事件系统
                if (this.city.eventSystem) {
                    this.city.eventSystem.emit('AGENT_INTERACTED', {
                        agent1: agent1.id,
                        agent2: agent2.id,
                        type: eventType
                    });
                }
            }
        }
    }
} 