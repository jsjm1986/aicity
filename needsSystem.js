class NeedsSystem {
    constructor(agent) {
        this.agent = agent;
        this.buildingManager = new BuildingManager();
        
        // 需求处理冷却时间
        this.needsCooldown = new Map();
        this.cooldownDuration = 30000; // 30秒
    }

    // 处理需求
    handleNeed(need) {
        // 检查冷却时间
        if (this.isNeedOnCooldown(need)) {
            return false;
        }

        // 按优先级尝试寻找建筑物
        const buildingTypes = ['primary', 'secondary', 'emergency'];
        for (const priority of buildingTypes) {
            const targetBuildings = this.buildingManager.getBuildingsForNeed(need, priority);
            if (!targetBuildings || targetBuildings.length === 0) {
                console.log(`${this.agent.role} 在${priority}级别找不到满足${need}需求的建筑物类型`);
                continue;
            }

            // 在附近搜索合适的建筑物
            const nearbyBuildings = this.agent.getNearbyBuildings(300)
                .filter(building => 
                    targetBuildings.includes(building.type) && 
                    building.isAvailable(this.agent, this.agent.city.timeSystem).available
                );

            if (nearbyBuildings.length > 0) {
                const targetBuilding = this.chooseBestBuilding(nearbyBuildings);
                if (this.moveToBuilding(targetBuilding)) {
                    this.setNeedCooldown(need);
                    console.log(`${this.agent.role} 找到建筑: ${targetBuilding.type} 满足需求: ${need}`);
                    return true;
                }
            }
        }

        // 如果找不到建筑物，执行应急方案
        console.log(`${this.agent.role} 找不到满足需求的建筑: ${need}`);
        return this.executeEmergencyPlan(need);
    }

    chooseBestBuilding(buildings) {
        return buildings.sort((a, b) => {
            // 计算距离分数（越近越好）
            const distA = Math.hypot(this.agent.x - a.x, this.agent.y - a.y);
            const distB = Math.hypot(this.agent.x - b.x, this.agent.y - b.y);
            const distScore = (distB - distA) / 100;
            
            // 计算拥挤度分数（越空越好）
            const crowdA = a.currentOccupants.size / a.details.capacity;
            const crowdB = b.currentOccupants.size / b.details.capacity;
            const crowdScore = (crowdB - crowdA) * 5;
            
            // 计算建筑物类型匹配度
            const typeMatchA = this.buildingManager.canSatisfyNeed(a.type, this.agent.currentNeed);
            const typeMatchB = this.buildingManager.canSatisfyNeed(b.type, this.agent.currentNeed);
            const typeScore = (typeMatchA - typeMatchB) * 3;
            
            return distScore + crowdScore + typeScore;
        })[0];
    }

    moveToBuilding(building) {
        if (!building) return false;
        
        this.agent.targetBuilding = building;
        this.agent.state = `前往${building.type}`;
        return true;
    }

    executeEmergencyPlan(need) {
        const emergencyActions = {
            hunger: () => {
                this.agent.state = '寻找食物';
                this.agent.needs[need] += 10; // 应急补充一点
                return true;
            },
            energy: () => {
                this.agent.state = '原地休息';
                this.agent.needs[need] += 5;
                return true;
            },
            // ... 其他需求的应急方案
        };

        return emergencyActions[need]?.() || false;
    }

    isNeedOnCooldown(need) {
        const lastTime = this.needsCooldown.get(need);
        return lastTime && Date.now() - lastTime < this.cooldownDuration;
    }

    setNeedCooldown(need) {
        this.needsCooldown.set(need, Date.now());
    }
} 