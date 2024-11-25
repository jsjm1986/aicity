class PlanningSystem {
    constructor(agent) {
        this.agent = agent;
        this.plans = [];
        this.longTermGoals = [];
        this.dailySchedule = new Map();
        this.memories = {
            shortTerm: [],
            longTerm: [],
            experiences: new Map()
        };
        
        // 计划评估间隔
        this.planningInterval = 5000; // 每5秒评估一次计划
        this.lastPlanningTime = 0;
        
        // 初始化每日计划
        this.initializeDailySchedule();
    }

    initializeDailySchedule() {
        // 根据职业生成基础日程
        const baseSchedule = this.generateBaseSchedule();
        // 根据性格特征调整日程
        this.adjustScheduleByPersonality(baseSchedule);
        this.dailySchedule = baseSchedule;
    }

    generateBaseSchedule() {
        const workSchedules = {
            '学生': new Map([
                ['07:00', '起床'],
                ['07:30', '早餐'],
                ['08:00', '上学'],
                ['12:00', '午餐'],
                ['13:30', '上学'],
                ['17:00', '课外活动'],
                ['18:30', '晚餐'],
                ['19:30', '学习'],
                ['22:00', '休息']
            ]),
            '教师': new Map([
                ['06:30', '起床'],
                ['07:00', '早餐'],
                ['07:30', '去学校'],
                ['12:00', '午餐'],
                ['13:30', '上课'],
                ['17:30', '备课'],
                ['18:30', '晚餐'],
                ['20:00', '休闲'],
                ['22:00', '休息']
            ]),
            '程序员': new Map([
                ['09:00', '起床'],
                ['09:30', '早餐'],
                ['10:00', '工作'],
                ['12:30', '午餐'],
                ['14:00', '工作'],
                ['19:00', '晚餐'],
                ['20:00', '自由时间'],
                ['24:00', '休息']
            ])
        };

        return workSchedules[this.agent.role] || this.generateDefaultSchedule();
    }

    generateDefaultSchedule() {
        return new Map([
            ['08:00', '起床'],
            ['09:00', '工作'],
            ['12:00', '午餐'],
            ['13:00', '工作'],
            ['18:00', '晚餐'],
            ['19:00', '休闲'],
            ['22:00', '休息']
        ]);
    }

    adjustScheduleByPersonality() {
        const personality = this.agent.personality;
        
        // 根据性格特征调整时间
        if (personality.conscientiousness < 0.3) {
            // 不太守时的性格，时间更灵活
            this.addRandomVariation(30);
        }
        
        if (personality.extraversion > 0.7) {
            // 外向的性格，增加社交活动
            this.addSocialActivities();
        }
    }

    addRandomVariation(minutes) {
        for (const [time] of this.dailySchedule) {
            const variation = Math.floor(Math.random() * minutes) - minutes/2;
            // 调整时间
            const [hour, minute] = time.split(':').map(Number);
            const newTime = new Date(2000, 0, 1, hour, minute + variation);
            const newTimeString = `${newTime.getHours().toString().padStart(2, '0')}:${newTime.getMinutes().toString().padStart(2, '0')}`;
            
            const activity = this.dailySchedule.get(time);
            this.dailySchedule.delete(time);
            this.dailySchedule.set(newTimeString, activity);
        }
    }

    addSocialActivities() {
        const socialActivities = [
            '与朋友聚会',
            '参加社交活动',
            '拜访朋友',
            '参加兴趣小组'
        ];

        // 在空闲时段添加社交活动
        const freeTimeSlots = this.findFreeTimeSlots();
        freeTimeSlots.forEach(slot => {
            if (Math.random() < 0.3) { // 30%的概率添加社交活动
                const activity = socialActivities[Math.floor(Math.random() * socialActivities.length)];
                this.dailySchedule.set(slot, activity);
            }
        });
    }

    findFreeTimeSlots() {
        const freeSlots = [];
        let lastTime = '00:00';
        
        for (const time of this.dailySchedule.keys()) {
            if (this.getTimeDifference(lastTime, time) > 2) { // 如果间隔超过2小时
                freeSlots.push(this.getMiddleTime(lastTime, time));
            }
            lastTime = time;
        }
        
        return freeSlots;
    }

    getTimeDifference(time1, time2) {
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);
        return (h2 * 60 + m2) - (h1 * 60 + m1);
    }

    getMiddleTime(time1, time2) {
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);
        const totalMinutes = ((h2 * 60 + m2) + (h1 * 60 + m1)) / 2;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    update() {
        const now = Date.now();
        if (now - this.lastPlanningTime < this.planningInterval) {
            return;
        }

        // 更新计划
        this.updatePlans();
        // 执行当前计划
        this.executePlans();
        
        this.lastPlanningTime = now;
    }

    updatePlans() {
        // 检查并更新需求
        this.checkNeeds();
        // 检查日程
        this.checkSchedule();
        // 检查长期目标
        this.checkLongTermGoals();
        // 生成新计划
        this.generateNewPlans();
    }

    checkNeeds() {
        const urgentNeeds = [];
        for (const [need, value] of Object.entries(this.agent.needs)) {
            if (value < 30) {
                urgentNeeds.push({
                    type: need,
                    value: value,
                    priority: (30 - value) / 30
                });
            }
        }
        
        // 将紧急需求添加到计划中
        urgentNeeds.sort((a, b) => b.priority - a.priority)
            .forEach(need => {
                this.addPlan({
                    type: 'satisfy_need',
                    need: need.type,
                    priority: need.priority,
                    deadline: Date.now() + 1000 * 60 * 30 // 30分钟期限
                });
            });
    }

    checkSchedule() {
        if (!this.agent.city || !this.agent.city.timeSystem) {
            return;
        }

        const currentTime = this.agent.city.timeSystem.getTimeString();
        if (this.dailySchedule instanceof Map) {
            const scheduledActivity = this.dailySchedule.get(currentTime);
            
            if (scheduledActivity) {
                this.addPlan({
                    type: 'scheduled_activity',
                    activity: scheduledActivity,
                    priority: 0.8,
                    deadline: Date.now() + 1000 * 60 * 60 // 1小时期限
                });
            }
        }
    }

    checkLongTermGoals() {
        this.longTermGoals.forEach(goal => {
            if (!this.plans.some(plan => plan.type === goal.type)) {
                this.addPlan({
                    ...goal,
                    priority: 0.3 // 长期目标优先级较低
                });
            }
        });
    }

    generateNewPlans() {
        // 根据性格生成随机计划
        if (this.plans.length < 3 && Math.random() < 0.3) {
            const randomPlan = this.generateRandomPlan();
            if (randomPlan) {
                this.addPlan(randomPlan);
            }
        }
    }

    generateRandomPlan() {
        const personality = this.agent.personality;
        const plans = [];

        if (personality.extraversion > 0.6) {
            plans.push({
                type: 'social_activity',
                priority: 0.4,
                deadline: Date.now() + 1000 * 60 * 120
            });
        }

        if (personality.openness > 0.6) {
            plans.push({
                type: 'explore_new_place',
                priority: 0.3,
                deadline: Date.now() + 1000 * 60 * 180
            });
        }

        if (plans.length > 0) {
            return plans[Math.floor(Math.random() * plans.length)];
        }
        return null;
    }

    addPlan(plan) {
        // 检查是否已有相同类型的计划
        const existingPlan = this.plans.find(p => p.type === plan.type);
        if (existingPlan) {
            // 更新优先级
            existingPlan.priority = Math.max(existingPlan.priority, plan.priority);
            return;
        }

        this.plans.push(plan);
        // 按优先级排序
        this.plans.sort((a, b) => b.priority - a.priority);
    }

    executePlans() {
        if (this.plans.length === 0) return;

        const currentPlan = this.plans[0];
        // 检查计划是否过期
        if (currentPlan.deadline && Date.now() > currentPlan.deadline) {
            this.plans.shift();
            return;
        }

        // 执行计划
        switch (currentPlan.type) {
            case 'satisfy_need':
                this.executeSatisfyNeedPlan(currentPlan);
                break;
            case 'scheduled_activity':
                this.executeScheduledActivity(currentPlan);
                break;
            case 'social_activity':
                this.executeSocialActivity(currentPlan);
                break;
            case 'explore_new_place':
                this.executeExploration(currentPlan);
                break;
        }
    }

    executeSatisfyNeedPlan(plan) {
        const needToBuilding = {
            hunger: ['餐厅', '超市', '便利店'],
            rest: ['住宅区', '公园'],
            social: ['公园', '咖啡厅', '商业广场'],
            entertainment: ['电影院', '游戏厅', '公园']
        };

        const targetTypes = needToBuilding[plan.need];
        if (!targetTypes) return;

        const nearbyBuildings = this.agent.getNearbyBuildings(this.agent.city.buildings)
            .filter(b => targetTypes.includes(b.type));

        if (nearbyBuildings.length > 0) {
            this.agent.targetBuilding = this.agent.chooseBestBuilding(nearbyBuildings);
            this.agent.state = `前往${this.agent.targetBuilding.type}`;
            // 计划完成后移除
            this.plans.shift();
        }
    }

    executeScheduledActivity(plan) {
        // 根据活动类型执行相应行为
        switch (plan.activity) {
            case '工作':
                this.agent.findWorkplace(this.agent.city.buildings);
                break;
            case '休息':
                this.agent.findRestPlace(this.agent.city.buildings);
                break;
            case '用餐':
                this.executeSatisfyNeedPlan({ need: 'hunger' });
                break;
            default:
                // 其他活动
                break;
        }
        this.plans.shift();
    }

    executeSocialActivity(plan) {
        const nearbyAgents = this.agent.getNearbyAgents();
        if (nearbyAgents.length > 0) {
            const target = nearbyAgents[Math.floor(Math.random() * nearbyAgents.length)];
            this.agent.state = `与${target.role}社交`;
            this.plans.shift();
        }
    }

    executeExploration(plan) {
        // 随机选择一个未访问过的建筑物
        const unvisitedBuildings = this.agent.city.buildings.filter(b => 
            !this.memories.experiences.has(b.id)
        );

        if (unvisitedBuildings.length > 0) {
            this.agent.targetBuilding = unvisitedBuildings[Math.floor(Math.random() * unvisitedBuildings.length)];
            this.agent.state = `探索${this.agent.targetBuilding.type}`;
            this.plans.shift();
        }
    }
} 