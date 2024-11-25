class Agent {
    constructor(x, y, role, id, city) {
        this.x = x;
        this.y = y;
        this.role = this.initializeRole(role);
        this.id = id;
        this.city = city;
        this.speed = 2;
        this.direction = Math.random() * Math.PI * 2;
        this.state = '闲逛';
        this.currentTask = null;
        this.targetBuilding = null;
        this.currentPath = null;
        this.pathIndex = 0;

        // 基本属性
        this.money = 1000;
        this.energy = 100;
        this.mood = 100;

        // 需求系统
        this.needs = {
            hunger: 100,      // 饥饿度
            energy: 100,      // 精力
            social: 100,      // 社交需求
            entertainment: 100,// 娱乐需求
            health: 100,      // 健康值
            hygiene: 100,     // 卫生需求
            shopping: 100,    // 购物需求
            learning: 100     // 学习需求
        };

        // 需求衰减率
        this.needsDecayRate = {
            hunger: 0.05,
            energy: 0.03,
            social: 0.02,
            entertainment: 0.04,
            health: 0.01,
            hygiene: 0.03,
            shopping: 0.02,
            learning: 0.01
        };

        // 初始化调度系统
        this.schedule = this.createSchedule();

        // 扩展职业系统
        this.career = this.initializeCareer();
        
        // 职业相关属性
        this.skills = this.initializeSkills();
        this.experience = 0;
        this.salary = this.calculateBaseSalary();
        this.workPerformance = 100;

        // 调整社交互动参数
        this.socialInteractionConfig = {
            interactionRadius: 50,        // 降低互动范围（原来是100）
            interactionChance: 0.01,      // 降低互动概率（原来可能是0.1或更高）
            minTimeBetweenInteractions: 60000, // 互动最小间隔时间（1分钟）
            lastInteractionTime: 0,       // 上次互动时间
            maxSimultaneousInteractions: 2 // 最大同时互动数量
        };

        // 当前互动状态
        this.currentInteractions = new Set();
    }

    initializeRole(role) {
        // 扩展职业类型
        const roles = {
            // 医疗卫生类
            '医生': {
                baseSkills: ['医疗诊断', '急救处理', '专业知识'],
                workplaces: ['医院', '诊所'],
                baseSalary: 15000,
                workSchedule: '三班制'
            },
            '护士': {
                baseSkills: ['护理', '急救', '沟通'],
                workplaces: ['医院', '诊所'],
                baseSalary: 8000,
                workSchedule: '三班制'
            },
            '药剂师': {
                baseSkills: ['药物知识', '化学', '配药'],
                workplaces: ['医院', '药店'],
                baseSalary: 10000,
                workSchedule: '标准'
            },
            '牙医': {
                baseSkills: ['口腔医疗', '专业诊断', '医疗操作'],
                workplaces: ['牙科诊所', '医院'],
                baseSalary: 12000,
                workSchedule: '标准'
            },
            '中医师': {
                baseSkills: ['中医诊断', '针灸', '中药知识'],
                workplaces: ['中医院', '诊所'],
                baseSalary: 11000,
                workSchedule: '标准'
            },

            // 教育类 - 补充更细分的教育岗位
            '小学教师': {
                baseSkills: ['基础教学', '儿童心理', '课程设计'],
                workplaces: ['小学'],
                baseSalary: 8000,
                workSchedule: '标准'
            },
            '中学教师': {
                baseSkills: ['学科教学', '青少年心理', '教学管理'],
                workplaces: ['中���'],
                baseSalary: 9000,
                workSchedule: '标准'
            },
            '职业培训师': {
                baseSkills: ['专业培训', '课程开发', '实践指导'],
                workplaces: ['职业学校', '培训中心'],
                baseSalary: 10000,
                workSchedule: '弹性'
            },

            // IT/互联网类
            '前端工程师': {
                baseSkills: ['网页开发', 'JavaScript', 'UI设计'],
                workplaces: ['科技公司', '互联网公司'],
                baseSalary: 13000,
                workSchedule: '弹性'
            },
            '后端工程师': {
                baseSkills: ['服务器开发', '数据库', '系统架构'],
                workplaces: ['科技公司', '互联网公司'],
                baseSalary: 14000,
                workSchedule: '弹性'
            },
            '人工智能工程师': {
                baseSkills: ['机器学习', '算法设计', '数据分析'],
                workplaces: ['研发中心', '科技公司'],
                baseSalary: 16000,
                workSchedule: '弹性'
            },

            // 金融类 - 补充更多金融职业
            '基金经理': {
                baseSkills: ['投资管理', '风险控制', '市场分析'],
                workplaces: ['基金公司', '投资机构'],
                baseSalary: 18000,
                workSchedule: '标准'
            },
            '保险顾问': {
                baseSkills: ['保险产品', '风险评估', '客户服务'],
                workplaces: ['保险公司', '银行'],
                baseSalary: 9000,
                workSchedule: '标准'
            },

            // 创意文化类 - 补充更多创意职业
            '游戏设计师': {
                baseSkills: ['游戏设计', '创意开发', '用户体验'],
                workplaces: ['游戏公司', '科技公司'],
                baseSalary: 12000,
                workSchedule: '弹性'
            },
            '动画师': {
                baseSkills: ['动画制作', '视觉设计', '创意表现'],
                workplaces: ['动画工作室', '广告公司'],
                baseSalary: 10000,
                workSchedule: '弹性'
            },
            '音乐制作人': {
                baseSkills: ['音乐制作', '音效设计', '编曲'],
                workplaces: ['音乐工作室', '娱乐公司'],
                baseSalary: 11000,
                workSchedule: '自由'
            },

            // 服务业 - 补充更多服务类职业
            '导游': {
                baseSkills: ['景点讲解', '行程规划', '语言沟通'],
                workplaces: ['旅行社', '景区'],
                baseSalary: 7000,
                workSchedule: '不规则'
            },
            '酒店经理': {
                baseSkills: ['酒店管理', '客户服务', '团队管理'],
                workplaces: ['酒店', '度假村'],
                baseSalary: 12000,
                workSchedule: '轮班'
            },
            '美容师': {
                baseSkills: ['美容护理', '皮肤管理', '客户沟通'],
                workplaces: ['美容院', '美容医院'],
                baseSalary: 7000,
                workSchedule: '标准'
            },

            // 制造业 - 补充更多制造业职业
            '产品经理': {
                baseSkills: ['产品规划', '市场分析', '团队协作'],
                workplaces: ['制造公司', '科技公司'],
                baseSalary: 13000,
                workSchedule: '标准'
            },
            '生产主管': {
                baseSkills: ['生产管理', '质量控制', '人员调度'],
                workplaces: ['工厂', '制造企业'],
                baseSalary: 10000,
                workSchedule: '轮班'
            },

            // 新增：新兴职业
            '数据科学家': {
                baseSkills: ['数据分析', '机器学习', '统计建模'],
                workplaces: ['科技公司', '研究机构'],
                baseSalary: 15000,
                workSchedule: '弹性'
            },
            '电竞选手': {
                baseSkills: ['游戏技术', '团队配合', '战术分析'],
                workplaces: ['电竞俱乐部', '直播平台'],
                baseSalary: 10000,
                workSchedule: '不规则'
            },
            '自媒体创作者': {
                baseSkills: ['内容创作', '视频制作', '社媒运营'],
                workplaces: ['工作室', '家庭办公'],
                baseSalary: 8000,
                workSchedule: '自由'
            },

            // 保持原有的基础职业
            '学生': {
                baseSkills: ['学习能力', '知识吸收', '社交'],
                workplaces: ['学校', '图书馆'],
                baseSalary: 0,
                workSchedule: '固定'
            },
            '退休人员': {
                baseSkills: ['生活经验', '兴趣爱好'],
                workplaces: ['社区中心', '公园'],
                baseSalary: 3000,
                workSchedule: '自由'
            },

            // 默认市民角色
            '市民': {
                baseSkills: ['基础生活技能', '社交能力', '适应能力'],
                workplaces: ['社区中心', '公园', '商场'],
                baseSalary: 5000,
                workSchedule: '标准'
            }
        };

        return role in roles ? role : '市民';
    }

    initializeCareer() {
        return {
            title: this.role,
            level: 1,
            yearsOfExperience: 0,
            achievements: [],
            specializations: [],
            certifications: []
        };
    }

    initializeSkills() {
        const roleData = this.getRoleData();
        const skills = {};
        
        // 初始化基础技能
        roleData.baseSkills.forEach(skill => {
            skills[skill] = 50 + Math.random() * 20;
        });

        // 添加通用技能
        const commonSkills = {
            '沟通': 40 + Math.random() * 30,
            '计算机': 30 + Math.random() * 40,
            '问题解决': 35 + Math.random() * 35,
            '团队合作': 45 + Math.random() * 25
        };

        return { ...skills, ...commonSkills };
    }

    getRoleData() {
        const roles = {
            // 医疗卫生类
            '医生': {
                baseSkills: ['医疗诊断', '急救处理', '专业知识'],
                workplaces: ['医院', '诊所'],
                baseSalary: 15000,
                workSchedule: '三班制'
            },
            '护士': {
                baseSkills: ['护理', '急救', '沟通'],
                workplaces: ['医院', '诊所'],
                baseSalary: 8000,
                workSchedule: '三班制'
            },
            '药剂师': {
                baseSkills: ['药物知识', '化学', '配药'],
                workplaces: ['医院', '药店'],
                baseSalary: 10000,
                workSchedule: '标准'
            },
            '牙医': {
                baseSkills: ['口腔医疗', '专业诊断', '医疗操作'],
                workplaces: ['牙科诊所', '医院'],
                baseSalary: 12000,
                workSchedule: '标准'
            },
            '中医师': {
                baseSkills: ['中医诊断', '针灸', '中药知识'],
                workplaces: ['中医院', '诊所'],
                baseSalary: 11000,
                workSchedule: '标准'
            },

            // 教育类 - 补充更细分的教育岗位
            '小学教师': {
                baseSkills: ['基础教学', '儿童心理', '课程设计'],
                workplaces: ['小学'],
                baseSalary: 8000,
                workSchedule: '标准'
            },
            '中学教师': {
                baseSkills: ['学科教学', '青少年心理', '教学管理'],
                workplaces: ['中学'],
                baseSalary: 9000,
                workSchedule: '标准'
            },
            '职业培训师': {
                baseSkills: ['专业培训', '课程开发', '实践指导'],
                workplaces: ['职业学校', '培训中心'],
                baseSalary: 10000,
                workSchedule: '弹性'
            },

            // IT/互联网类
            '前端工程师': {
                baseSkills: ['网页开发', 'JavaScript', 'UI设计'],
                workplaces: ['科技公司', '互联网公司'],
                baseSalary: 13000,
                workSchedule: '弹性'
            },
            '后端工程师': {
                baseSkills: ['服务器开发', '数据库', '系统架构'],
                workplaces: ['科技公司', '互联网公司'],
                baseSalary: 14000,
                workSchedule: '弹性'
            },
            '人工智能工程师': {
                baseSkills: ['机器学习', '算法设计', '数据分析'],
                workplaces: ['研发中心', '科技公司'],
                baseSalary: 16000,
                workSchedule: '弹性'
            },

            // 金融类 - 补充更多金融职业
            '基金经理': {
                baseSkills: ['投资管理', '风险控制', '市场分析'],
                workplaces: ['基金公司', '投资机构'],
                baseSalary: 18000,
                workSchedule: '标准'
            },
            '保险顾问': {
                baseSkills: ['保险产品', '风险评估', '客户服务'],
                workplaces: ['保险公司', '银行'],
                baseSalary: 9000,
                workSchedule: '标准'
            },

            // 创意文化类 - 补充更多创意职业
            '游戏设计师': {
                baseSkills: ['游戏设计', '创意开发', '用户体验'],
                workplaces: ['游戏公司', '科技公司'],
                baseSalary: 12000,
                workSchedule: '弹性'
            },
            '动画师': {
                baseSkills: ['动画制作', '视觉设计', '创意表现'],
                workplaces: ['动画工作室', '广告公司'],
                baseSalary: 10000,
                workSchedule: '弹性'
            },
            '音乐制作人': {
                baseSkills: ['音乐制作', '音效设计', '编曲'],
                workplaces: ['音乐工作室', '娱乐公司'],
                baseSalary: 11000,
                workSchedule: '自由'
            },

            // 服务业 - 补充更多服务类职业
            '导游': {
                baseSkills: ['景点讲解', '行程规划', '语言沟通'],
                workplaces: ['旅行社', '景区'],
                baseSalary: 7000,
                workSchedule: '不规则'
            },
            '酒店经理': {
                baseSkills: ['酒店管理', '客户服务', '团队管理'],
                workplaces: ['酒店', '度假村'],
                baseSalary: 12000,
                workSchedule: '轮班'
            },
            '美容师': {
                baseSkills: ['美容护理', '皮肤管理', '客户沟通'],
                workplaces: ['美容院', '美容医院'],
                baseSalary: 7000,
                workSchedule: '标准'
            },

            // 制造业 - 补充更多制造业职业
            '产品经理': {
                baseSkills: ['产品规划', '市场分析', '团队协作'],
                workplaces: ['制造公司', '科技公司'],
                baseSalary: 13000,
                workSchedule: '标准'
            },
            '生产主管': {
                baseSkills: ['生产管理', '质量控制', '人员调度'],
                workplaces: ['工厂', '制造企业'],
                baseSalary: 10000,
                workSchedule: '轮班'
            },

            // 新增：新兴职业
            '数据科学家': {
                baseSkills: ['数据分析', '机器学习', '统计建模'],
                workplaces: ['科技公司', '研究机构'],
                baseSalary: 15000,
                workSchedule: '弹性'
            },
            '电竞选手': {
                baseSkills: ['游戏技术', '团队配合', '战术分析'],
                workplaces: ['电竞俱乐部', '直播平台'],
                baseSalary: 10000,
                workSchedule: '不规则'
            },
            '自媒体创作者': {
                baseSkills: ['内容创作', '视频制作', '社媒运营'],
                workplaces: ['工作室', '家庭办公'],
                baseSalary: 8000,
                workSchedule: '自由'
            },

            // 保持原有的基础职业
            '学生': {
                baseSkills: ['学习能力', '知识吸收', '社交'],
                workplaces: ['学校', '图书馆'],
                baseSalary: 0,
                workSchedule: '固定'
            },
            '退休人员': {
                baseSkills: ['生活经验', '兴趣爱好'],
                workplaces: ['社区中心', '公园'],
                baseSalary: 3000,
                workSchedule: '自由'
            },

            // 默认市民角色
            '市民': {
                baseSkills: ['基础生活技能', '社交能力', '适应能力'],
                workplaces: ['社区中心', '公园', '商场'],
                baseSalary: 5000,
                workSchedule: '标准'
            }
        };

        return roles[this.role] || roles['市民'];
    }

    calculateBaseSalary() {
        const roleData = this.getRoleData();
        const baseSalary = roleData.baseSalary;
        
        // 根据经验和技能调整薪资
        const experienceBonus = this.career.yearsOfExperience * 500;
        const skillBonus = this.calculateSkillBonus();
        
        return baseSalary + experienceBonus + skillBonus;
    }

    calculateSkillBonus() {
        // 计算技能平均���
        const skillValues = Object.values(this.skills);
        const avgSkill = skillValues.reduce((a, b) => a + b, 0) / skillValues.length;
        
        // 技能加成
        return Math.floor((avgSkill - 50) * 100);
    }

    update(deltaTime) {
        // 确保city和timeSystem存在
        if (!this.city || !this.city.timeSystem) {
            console.error('Agent更新失败: city或timeSystem未定义');
            return;
        }

        // 更新需求
        this.updateNeeds(deltaTime);

        // ���查并执行当前任务
        if (this.currentTask) {
            if (this.isTaskComplete(this.currentTask)) {
                this.completeTask(this.currentTask);
                this.currentTask = null;
            } else {
                this.executeTask(this.currentTask);
            }
        } else {
            // 生成新任务
            this.currentTask = this.generateNewTask();
        }

        // 更新移动
        this.updateMovement(deltaTime);
    }

    generateNewTask() {
        // 确保timeSystem存在
        if (!this.city || !this.city.timeSystem) {
            console.error('无法生成任务: timeSystem未定义');
            return null;
        }

        const currentTime = this.city.timeSystem.getTimeString();
        const currentActivity = this.getScheduledActivity(currentTime);

        if (currentActivity) {
            return {
                type: 'scheduled',
                activity: currentActivity,
                target: this.findTargetForActivity(currentActivity)
            };
        }

        // 检查紧急需求
        const urgentNeed = this.getMostUrgentNeed();
        if (urgentNeed) {
            return {
                type: 'need',
                need: urgentNeed,
                target: this.findTargetForNeed(urgentNeed)
            };
        }

        // 默认任务：闲逛
        return {
            type: 'wander',
            duration: 5000 + Math.random() * 5000
        };
    }

    createSchedule() {
        // 根据职业创建不同的日程表
        const schedule = new Map();
        
        switch (this.role) {
            case '医生':
                schedule.set('06:30', '起床');
                schedule.set('07:00', '早餐');
                schedule.set('08:00', '查房');
                schedule.set('09:30', '门诊');
                schedule.set('12:00', '午餐');
                schedule.set('13:30', '手术');
                schedule.set('16:00', '查房');
                schedule.set('17:30', '写病历');
                schedule.set('18:30', '晚餐');
                schedule.set('22:00', '休息');
                break;

            case '护士':
                schedule.set('06:30', '起床');
                schedule.set('07:00', '早餐');
                schedule.set('08:00', '交接班');
                schedule.set('08:30', '查房');
                schedule.set('12:00', '午餐');
                schedule.set('13:00', '护理');
                schedule.set('18:00', '交接班');
                schedule.set('19:00', '晚餐');
                schedule.set('22:00', '休息');
                break;

            case '程序员':
                schedule.set('09:00', '起床');
                schedule.set('09:30', '早餐');
                schedule.set('10:00', '编程');
                schedule.set('13:00', '午餐');
                schedule.set('14:00', '编程');
                schedule.set('19:00', '晚餐');
                schedule.set('20:00', '加班');
                schedule.set('24:00', '休息');
                this.needsDecayRate.social = 0.08;  // 社交需求衰减更快
                this.needsDecayRate.health = 0.05;  // 久坐影响健康
                break;

            case '厨师':
                schedule.set('05:30', '起床');
                schedule.set('06:00', '采购');
                schedule.set('07:00', '准备');
                schedule.set('11:00', '午餐服务');
                schedule.set('15:00', '休息');
                schedule.set('17:00', '晚餐服务');
                schedule.set('21:00', '收尾');
                schedule.set('22:00', '休息');
                this.needsDecayRate.energy = 0.07;  // 体力劳动
                this.needsDecayRate.hygiene = 0.08; // 需要经常清洁
                break;

            case '警察':
                schedule.set('07:00', '起床');
                schedule.set('07:30', '早餐');
                schedule.set('08:00', '巡逻');
                schedule.set('12:00', '午餐');
                schedule.set('13:00', '执勤');
                schedule.set('19:00', '晚餐');
                schedule.set('20:00', '夜巡');
                schedule.set('23:00', '休息');
                this.needsDecayRate.energy = 0.06;  // 需要保持警惕
                this.needsDecayRate.health = 0.04;  // 工作压力大
                break;

            case '商人':
                schedule.set('07:30', '起床');
                schedule.set('08:00', '早餐');
                schedule.set('09:00', '开店');
                schedule.set('12:30', '午餐');
                schedule.set('13:30', '营业');
                schedule.set('19:00', '关店');
                schedule.set('20:00', '晚餐');
                schedule.set('22:30', '休息');
                this.needsDecayRate.social = 0.03;  // 经常与顾客交流
                this.needsDecayRate.energy = 0.05;  // 需要长时间工作
                break;

            case '学生':
                schedule.set('07:00', '起床');
                schedule.set('07:30', '早餐');
                schedule.set('08:00', '上课');
                schedule.set('12:00', '午餐');
                schedule.set('13:30', '上课');
                schedule.set('17:00', '自习');
                schedule.set('18:30', '晚餐');
                schedule.set('19:30', '学习');
                schedule.set('22:00', '休息');
                this.needsDecayRate.learning = 0.02;  // 学习需求变化慢
                this.needsDecayRate.entertainment = 0.07;  // 娱乐需求增长快
                break;

            default:  // 普通市民
                schedule.set('07:00', '起床');
                schedule.set('07:30', '早餐');
                schedule.set('08:30', '工作');
                schedule.set('12:00', '午餐');
                schedule.set('13:00', '工作');
                schedule.set('17:30', '下班');
                schedule.set('18:30', '晚餐');
                schedule.set('22:00', '休息');
        }
        
        return schedule;
    }

    updateNeeds(deltaTime) {
        try {
            // 确保deltaTime有效
            if (!deltaTime || deltaTime < 0) {
                deltaTime = 16;
            }

            // 获取职业特定的需求衰减率修正
            const decayModifiers = this.getProfessionNeedDecayModifiers();

            // 更新所有需求
            for (const need in this.needs) {
                // 计算衰减量（考虑职业特定修正）
                const baseDecay = this.needsDecayRate[need] * (deltaTime / 1000);
                const modifiedDecay = baseDecay * (decayModifiers[need] || 1);
                
                // 应用衰减
                this.needs[need] = Math.max(0, Math.min(100, this.needs[need] - modifiedDecay));

                // 检查是否需要紧急处理
                if (this.needs[need] < this.getProfessionNeedThreshold(need)) {
                    this.handleUrgentNeed(need);
                }
            }

            // 更新职业特定的需求
            this.updateProfessionSpecificNeeds(deltaTime);

            // 更新心情
            this.updateMood();

        } catch (error) {
            console.error('更新需求时出错:', error);
        }
    }

    getProfessionNeedDecayModifiers() {
        // 不同职业的需求衰减率修正
        const modifiers = {
            '医生': {
                energy: 1.2,    // 医生消耗更多精力
                social: 0.8,    // 经常与人交流，社交需求衰减较慢
                hygiene: 1.2    // 需要更频繁的清洁
            },
            '程序员': {
                social: 1.2,    // 社交需求衰减更快
                health: 1.1,    // 久坐影响健康
                learning: 0.8   // 持续学习新技术
            },
            '教师': {
                energy: 1.1,    // 说话多，消耗精力
                social: 0.7,    // 经常与学生交流
                learning: 0.9   // 需要持续学习
            },
            '厨师': {
                energy: 1.2,    // 体力劳动
                hygiene: 1.3,   // 需要频繁清洁
                hunger: 0.8     // 接触食物，不容易饿
            },
            '警察': {
                energy: 1.2,    // 高强度工作
                health: 1.1,    // 压力大
                social: 0.9     // 经常与人交流
            },
            '运动员': {
                energy: 1.3,    // 高强度运动
                health: 0.8,    // 身体素质好
                hunger: 1.2     // 消耗大，容易饿
            },
            '艺术家': {
                social: 1.1,    // 较为独处
                entertainment: 0.8, // 工作即娱乐
                learning: 0.9   // 持续创新学习
            },
            '商人': {
                social: 0.8,    // 擅长社交
                energy: 1.1,    // 工作强度大
                shopping: 0.9   // 了解市场
            }
            // ... 可以继续添加其他职业的修正
        };

        return modifiers[this.role] || {};
    }

    getProfessionNeedThreshold(need) {
        // 不同职业的需求阈值
        const thresholds = {
            '医生': {
                energy: 40,     // 需要保持较高精力
                hygiene: 60     // 需要保持较高卫生水平
            },
            '程序员': {
                learning: 70,   // 需要保持较高学习欲望
                social: 30      // 社交需求阈值较低
            },
            '教师': {
                energy: 50,     // 需要保持中等精力
                learning: 60    // 需要保持学习动力
            },
            '厨师': {
                hygiene: 70,    // 需要保持很高的卫生水平
                energy: 45      // 需要保持体力
            }
            // ... 可以继续添加其他职业的阈值
        };

        return (thresholds[this.role] && thresholds[this.role][need]) || 
               this.getDefaultNeedThreshold(need);
    }

    updateProfessionSpecificNeeds(deltaTime) {
        // 职业特定的需求更新逻辑
        switch (this.role) {
            case '医生':
                this.updateMedicalProfessionNeeds(deltaTime);
                break;
            case '程序员':
                this.updateProgrammerNeeds(deltaTime);
                break;
            case '教师':
                this.updateTeacherNeeds(deltaTime);
                break;
            case '厨师':
                this.updateChefNeeds(deltaTime);
                break;
            // ... 其他职业的特定需求更新
        }
    }

    updateMedicalProfessionNeeds(deltaTime) {
        // 医生特有的需求更新
        if (this.state === '工作') {
            // 工作时压力增加
            this.needs.health -= 0.02 * deltaTime;
            // 但专业满足感增加
            this.needs.learning += 0.01 * deltaTime;
        }
        // 处理紧急情况时的特殊状态
        if (this.state === '急诊') {
            this.needs.energy -= 0.05 * deltaTime;
            this.needs.stress = Math.min(100, (this.needs.stress || 0) + 0.03 * deltaTime);
        }
    }

    updateProgrammerNeeds(deltaTime) {
        // 程序员特有的需求更新
        if (this.state === '编程') {
            // 久坐影响健康
            this.needs.health -= 0.015 * deltaTime;
            // 技能提升带来满足感
            this.needs.learning += 0.02 * deltaTime;
        }
        // 解决问题时的状态
        if (this.state === '调试') {
            this.needs.energy -= 0.03 * deltaTime;
            this.needs.stress = Math.min(100, (this.needs.stress || 0) + 0.02 * deltaTime);
        }
    }

    updateTeacherNeeds(deltaTime) {
        // 教师特有的需求更新
        if (this.state === '授课') {
            // 说话消耗精力
            this.needs.energy -= 0.025 * deltaTime;
            // 但社交需求得到满足
            this.needs.social += 0.015 * deltaTime;
        }
        // 批改作业时的状态
        if (this.state === '批改作业') {
            this.needs.energy -= 0.02 * deltaTime;
            this.needs.entertainment -= 0.02 * deltaTime;
        }
    }

    updateChefNeeds(deltaTime) {
        // 厨师特有的需求更新
        if (this.state === '烹饪') {
            // 高温环境消耗体力
            this.needs.energy -= 0.03 * deltaTime;
            // 但创造美食带来满足感
            this.needs.entertainment += 0.01 * deltaTime;
        }
        // 忙碌时段的特殊状态
        if (this.state === '高峰期') {
            this.needs.energy -= 0.04 * deltaTime;
            this.needs.stress = Math.min(100, (this.needs.stress || 0) + 0.025 * deltaTime);
        }
    }

    handleUrgentNeed(need) {
        // 处理紧急需求
        const urgentActions = {
            hunger: () => this.findNearestBuilding(['餐厅', '商店']),
            energy: () => this.findNearestBuilding(['住宅', '休息区']),
            social: () => this.findNearbyAgents(),
            entertainment: () => this.findNearestBuilding(['公园', '商场']),
            health: () => this.findNearestBuilding(['医院', '诊所']),
            hygiene: () => this.findNearestBuilding(['公共厕所']),
            shopping: () => this.findNearestBuilding(['商店', '商场']),
            learning: () => this.findNearestBuilding(['学校', '图书馆'])
        };

        if (urgentActions[need]) {
            urgentActions[need]();
            this.state = `寻找满足${need}的地方`;
        }
    }

    updateMood() {
        // 基于需求状态计算心情
        const needsAverage = Object.values(this.needs).reduce((a, b) => a + b, 0) / Object.keys(this.needs).length;
        
        // 心情受需求满足度的影响
        const needsEffect = (needsAverage - 50) / 50; // 转换为-1到1的范围
        
        // 考虑天气影响
        const weatherEffect = this.getWeatherEffect();
        
        // 考虑社交影响
        const socialEffect = this.getSocialEffect();
        
        // 综合计算心情
        this.mood = Math.max(0, Math.min(100,
            50 + // 基准心情值
            needsEffect * 30 + // 需求影响
            weatherEffect * 10 + // 天气影响
            socialEffect * 10 // 社交影响
        ));
    }

    getWeatherEffect() {
        const weatherEffects = {
            '晴天': 1,
            '多云': 0.5,
            '雨天': -0.5,
            '雷暴': -1,
            '雾天': -0.3
        };
        return weatherEffects[this.city.weatherSystem.currentWeather] || 0;
    }

    getSocialEffect() {
        // 获取最近的社交互动影响
        const recentInteractions = this.city.socialSystem?.getRecentInteractions(this.id) || [];
        if (recentInteractions.length === 0) return 0;
        
        return recentInteractions.reduce((sum, interaction) => 
            sum + (interaction.effect || 0), 0) / recentInteractions.length;
    }

    getScheduledActivity(currentTime) {
        try {
            if (!this.schedule || !(this.schedule instanceof Map)) {
                console.warn('日程表未正确初始化');
                return null;
            }

            // 解析当前时间
            const [currentHour, currentMinute] = currentTime.split(':').map(Number);
            
            // 找到最接近的计划活动
            let closestTime = null;
            let closestActivity = null;
            let minTimeDiff = Infinity;

            for (const [scheduleTime, activity] of this.schedule.entries()) {
                const [scheduleHour, scheduleMinute] = scheduleTime.split(':').map(Number);
                
                // 计算时间差（以分钟为单位）
                let timeDiff = (scheduleHour - currentHour) * 60 + (scheduleMinute - currentMinute);
                
                // 如果时间差为负，说明是第二天的活动
                if (timeDiff < 0) {
                    timeDiff += 24 * 60;
                }

                // 更新最接近的活动
                if (timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    closestTime = scheduleTime;
                    closestActivity = activity;
                }
            }

            // 如果时间差在30分钟内，返回该活动
            if (minTimeDiff <= 30) {
                return {
                    activity: closestActivity,
                    scheduledTime: closestTime,
                    timeDiff: minTimeDiff
                };
            }

            return null;
        } catch (error) {
            console.error('获取计划活动时出错:', error);
            return null;
        }
    }

    findTargetForActivity(activityInfo) {
        if (!activityInfo || !activityInfo.activity) {
            return null;
        }

        // 获取职业数据
        const roleData = this.getRoleData();
        
        // 基础活动地点映射
        const basicActivityToBuilding = {
            '起床': ['住宅', '公寓', '学生宿舍', '员工宿舍'],
            '早餐': ['餐厅', '咖啡厅', '便利店'],
            '午餐': ['餐厅', '食堂', '咖啡厅'],
            '晚餐': ['餐厅', '食堂', '咖啡厅'],
            '休息': ['住宅', '公寓', '学生宿舍', '员工宿舍'],
            '学习': ['图书馆', '学校'],
            '休闲': ['公园', '商场', '电影院'],
            '购物': ['商场', '超市', '便利店'],
            '运动': ['体育馆', '公园'],
            '社交': ['咖啡厅', '公园', '商场']
        };

        // 职业特定的工作地点映射
        const workplaceMapping = {
            // 医疗卫生类
            '医生': ['综合医院', '专科医院', '社区诊所'],
            '护士': ['综合医院', '专科医院', '社区诊所'],
            '药剂师': ['综合医院', '药店', '社区诊所'],
            '牙医': ['专科医院', '牙科诊所'],
            '中医师': ['中医院', '社区诊所'],

            // 教育类
            '小学教师': ['小学'],
            '中学教师': ['中学'],
            '职业培训师': ['职业学校', '培训中心'],
            '教授': ['大学'],

            // IT/互联网类
            '前端工程师': ['科技园', 'IT企业园', '研发中心'],
            '后端工程师': ['科技园', 'IT企业园', '研发中心'],
            '人工智能工程师': ['科技园', '研发中心'],
            '数据科学家': ['科技园', '研发中心', '数据中心'],
            '网络工程师': ['科技园', 'IT企业园', '数据中心'],

            // 金融类
            '银行职员': ['银行'],
            '会计师': ['会计事务所', '金融中心'],
            '基金经理': ['证券公司', '金融中心'],
            '保险顾问': ['保险公司'],

            // 创意文化类
            '游戏设计师': ['科技园', '文创园'],
            '动画师': ['文创园', '设计工作室'],
            '音乐制作人': ['文创园', '演艺中心'],
            '设计师': ['设计工作室', '文创园'],
            '记者': ['媒体中心'],

            // 服务业
            '店员': ['商场', '超市', '便利店'],
            '服务员': ['餐厅', '咖啡厅'],
            '导游': ['旅行社', '景区'],
            '酒店经理': ['酒店'],
            '美容师': ['美容院'],
            '厨师': ['餐厅', '食堂'],

            // 制造业
            '工厂工人': ['工厂', '生产车间'],
            '技术工人': ['工厂', '生产车间'],
            '产品经理': ['工厂', '研发中心'],
            '生产主管': ['工厂', '生产车间'],

            // 公共服务
            '警察': ['警察局'],
            '消防员': ['消防局'],
            '公务员': ['政府机构', '公共服务中心'],
            '公交车司机': ['交通枢纽']
        };

        // 检查是否是工作活动
        if (activityInfo.activity === '工作' || 
            roleData.workplaces.some(wp => activityInfo.activity.includes(wp))) {
            // 使用职业特定的工作地点
            const workplaces = workplaceMapping[this.role] || ['办公楼'];
            console.log(`${this.role}寻找工作地点:`, workplaces);
            
            const nearbyBuildings = this.getNearbyBuildings(300)
                .filter(building => 
                    workplaces.includes(building.type) && 
                    this.isBuildingAvailable(building)
                );

            if (nearbyBuildings.length > 0) {
                return this.chooseBestBuilding(nearbyBuildings);
            }
            console.warn(`${this.role}找不到合适的工作地点`);
            return null;
        }

        // 处理基础活动
        const buildingTypes = basicActivityToBuilding[activityInfo.activity] || ['公园'];
        const nearbyBuildings = this.getNearbyBuildings(300)
            .filter(building => 
                buildingTypes.includes(building.type) && 
                this.isBuildingAvailable(building)
            );

        if (nearbyBuildings.length > 0) {
            return this.chooseBestBuilding(nearbyBuildings);
        }

        return null;
    }

    isBuildingAvailable(building) {
        if (!building || !this.city || !this.city.timeSystem) return false;

        // 检查建筑物是否开放
        const currentTime = this.city.timeSystem.getTimeString();
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);
        const [openHour, openMinute] = building.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = building.closeTime.split(':').map(Number);

        const currentMinutes = currentHour * 60 + currentMinute;
        const openMinutes = openHour * 60 + openMinute;
        const closeMinutes = closeHour * 60 + closeMinute;

        // 检查是否在营业时间内
        const isOpen = closeMinutes > openMinutes ?
            (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) :
            (currentMinutes >= openMinutes || currentMinutes <= closeMinutes);

        // 检查容量
        const isNotFull = !building.capacity || 
            !building.currentOccupants ||
            building.currentOccupants.size < building.capacity;

        return isOpen && isNotFull;
    }

    chooseBestBuilding(buildings) {
        if (!buildings || buildings.length === 0) {
            return null;
        }

        // 计算每个建筑物的得分
        const buildingScores = buildings.map(building => {
            let score = 0;

            // 距离评��（越近分数��高）
            const distance = Math.hypot(building.x - this.x, building.y - this.y);
            score -= distance / 100;

            // 拥挤度评分（越不拥挤分数越高）
            if (building.currentOccupants) {
                const occupancyRate = building.currentOccupants.size / building.capacity;
                score -= occupancyRate * 10;
            }

            // 建筑物状态评分
            if (building.isOpen && building.isAvailable) {
                score += 5;
            }

            return { building, score };
        });

        // 返回得分最高的建筑物
        buildingScores.sort((a, b) => b.score - a.score);
        return buildingScores[0].building;
    }

    getMostUrgentNeed() {
        try {
            // 如果没有需求系统，返回null
            if (!this.needs) {
                console.warn('Agent��有需求系统');
                return null;
            }

            let mostUrgentNeed = null;
            let lowestValue = Infinity;

            // 遍历所有需求
            for (const [need, value] of Object.entries(this.needs)) {
                // 检查需求值是否有效
                if (typeof value !== 'number') {
                    console.warn(`需求 ${need} 的值无效:`, value);
                    continue;
                }

                // 根据需求的紧急程度设置阈值
                const threshold = this.getNeedThreshold(need);
                
                // 如果需求值低于阈值且是最低的
                if (value < threshold && value < lowestValue) {
                    lowestValue = value;
                    mostUrgentNeed = need;
                }
            }

            if (mostUrgentNeed) {
                console.log(`${this.role}(${this.id}) 最紧急的需求:`, {
                    need: mostUrgentNeed,
                    value: lowestValue
                });
            }

            return mostUrgentNeed;
        } catch (error) {
            console.error('获取最紧急需求时出错:', error);
            return null;
        }
    }

    getNeedThreshold(need) {
        // 为不同需求设置不同的阈值
        const thresholds = {
            hunger: 30,     // 饥饿度低于30%时需要吃东西
            energy: 25,     // 精力低于25%时需要休息
            social: 35,     // 社交需求低于35%时需要社交
            entertainment: 40, // 娱乐需求低于40%时需要娱乐
            health: 50,     // 健康值低于50%时需要就医
            hygiene: 45,    // 卫生需求低于45%时需要清洁
            shopping: 30,   // 购物需求低于30%时需要购物
            learning: 60    // 学习需求低于60%时需要学习
        };

        return thresholds[need] || 50; // 默认阈值为50%
    }

    findTargetForNeed(need) {
        // 根据需求类型找到合适的建筑物
        const needToBuildingTypes = {
            hunger: ['餐厅', '咖啡厅', '便利店', '超市'],
            energy: ['住宅', '公寓', '休息区', '公园'],
            social: ['社区中心', '公园', '咖啡厅', '商场'],
            entertainment: ['电影院', '游戏厅', '公园', '商场'],
            health: ['综合医院', '专科医院', '社区诊所'],
            hygiene: ['住宅', '公寓', '公共厕所'],
            shopping: ['商场', '超市', '便利店'],
            learning: ['图书馆', '培训中心', '学校']
        };

        const buildingTypes = needToBuildingTypes[need];
        if (!buildingTypes) {
            console.warn(`未找到满足需求 ${need} 的建筑物类型`);
            return null;
        }

        // 寻找最近的合适建筑物
        const target = this.findNearestBuilding(buildingTypes);
        if (target) {
            console.log(`${this.role}(${this.id}) 为需求 ${need} 找到目标建筑:`, target.type);
        } else {
            console.warn(`${this.role}(${this.id}) 找不到满足需求 ${need} 的建筑物`);
        }

        return target;
    }

    getNearbyBuildings(radius) {
        if (!this.city || !Array.isArray(this.city.buildings)) {
            return [];
        }

        return this.city.buildings.filter(building => {
            if (!building) return false;

            const distance = Math.hypot(
                building.x + building.width/2 - this.x,
                building.y + building.height/2 - this.y
            );

            return distance <= radius;
        });
    }

    chooseBestBuilding(buildings) {
        if (!buildings || buildings.length === 0) {
            return null;
        }

        // 计算每个建筑物的得分
        const buildingScores = buildings.map(building => {
            let score = 0;

            // 距离评分（越近分数越高）
            const distance = Math.hypot(
                building.x + building.width/2 - this.x,
                building.y + building.height/2 - this.y
            );
            score -= distance / 100;

            // 拥挤度评分（越不拥挤分数越高）
            if (building.currentOccupants) {
                const occupancyRate = building.currentOccupants.size / 
                    (building.details?.capacity || 10);
                score -= occupancyRate * 10;
            }

            // 建筑物状态评分
            if (building.details?.status === '常') {
                score += 5;
            }

            return { building, score };
        });

        // 返回得分最高的建筑物
        buildingScores.sort((a, b) => b.score - a.score);
        return buildingScores[0].building;
    }

    updateMovement(deltaTime) {
        try {
            // 如果deltaTime无效，使用默认值
            if (!deltaTime || deltaTime < 0) {
                deltaTime = 16; // 约60fps
            }

            // 如果有目标建筑物，则向其移动
            if (this.targetBuilding) {
                this.moveTowardsTarget(this.targetBuilding, deltaTime);
                return;
            }

            // 如果有当前路径，则沿路径移动
            if (this.currentPath && this.currentPath.length > 0) {
                this.followPath(deltaTime);
                return;
            }

            // 默认行为：随机漫步
            this.wander(deltaTime);
        } catch (error) {
            console.error('Agent移动更新失败:', error);
        }
    }

    moveTowardsTarget(target, deltaTime) {
        // 计算到目标的距离
        const dx = target.x + target.width/2 - this.x;
        const dy = target.y + target.height/2 - this.y;
        const distance = Math.hypot(dx, dy);

        // 如果已经到达目标
        if (distance < 5) {
            this.onReachTarget(target);
            return;
        }

        // 计算移动方向和速度
        const speed = this.calculateSpeed(deltaTime);
        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;

        // 更新位置
        this.x += moveX;
        this.y += moveY;
        this.direction = Math.atan2(dy, dx);
    }

    followPath(deltaTime) {
        if (!this.currentPath || this.pathIndex >= this.currentPath.length) {
            this.currentPath = null;
            this.pathIndex = 0;
            return;
        }

        const nextPoint = this.currentPath[this.pathIndex];
        const dx = nextPoint.x - this.x;
        const dy = nextPoint.y - this.y;
        const distance = Math.hypot(dx, dy);

        // 如果到达当前路径点
        if (distance < 5) {
            this.pathIndex++;
            if (this.pathIndex >= this.currentPath.length) {
                this.onPathComplete();
            }
            return;
        }

        // 计算移动方向和速度
        const speed = this.calculateSpeed(deltaTime);
        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;

        // 更新位置
        this.x += moveX;
        this.y += moveY;
        this.direction = Math.atan2(dy, dx);
    }

    wander(deltaTime) {
        // 随机改变方向
        if (Math.random() < 0.02) {
            this.direction += (Math.random() - 0.5) * Math.PI / 2;
        }

        // 计算移动速度
        const speed = this.calculateSpeed(deltaTime);
        const moveX = Math.cos(this.direction) * speed;
        const moveY = Math.sin(this.direction) * speed;

        // 检查新位置是否有效
        const newX = this.x + moveX;
        const newY = this.y + moveY;

        if (this.isValidPosition(newX, newY)) {
            this.x = newX;
            this.y = newY;
        } else {
            // 如果位置无效，改变方向
            this.direction += Math.PI;
        }
    }

    calculateSpeed(deltaTime) {
        // 基础速度
        let speed = this.speed * (deltaTime / 1000);

        // 考虑天气影响
        if (this.city.weatherSystem) {
            speed *= this.city.weatherSystem.getWeatherEffect().speedMultiplier;
        }

        // 考虑疲劳影响
        if (this.needs && this.needs.energy < 30) {
            speed *= 0.7;
        }

        return speed;
    }

    isValidPosition(x, y) {
        // 检查是否在城市边界内
        if (x < 0 || x > this.city.width || y < 0 || y > this.city.height) {
            return false;
        }

        // 检查是否与建筑物碰撞
        const collision = this.city.buildings.some(building => {
            if (!building) return false;
            return (
                x > building.x - 10 &&
                x < building.x + building.width + 10 &&
                y > building.y - 10 &&
                y < building.y + building.height + 10
            );
        });

        return !collision;
    }

    onReachTarget(target) {
        // 到达目标建筑物时的处理
        if (target.currentOccupants) {
            target.currentOccupants.add(this.id);
        }
        this.targetBuilding = null;
        this.state = '到达目的地';
    }

    onPathComplete() {
        // 完成路径时的处理
        this.currentPath = null;
        this.pathIndex = 0;
        this.state = '完成路径';
    }

    isTaskComplete(task) {
        if (!task) return true;

        switch (task.type) {
            case 'scheduled':
                return this.isScheduledTaskComplete(task);
            case 'need':
                return this.isNeedTaskComplete(task);
            case 'wander':
                return this.isWanderTaskComplete(task);
            default:
                console.warn('未知的任务类型:', task.type);
                return true;
        }
    }

    isScheduledTaskComplete(task) {
        if (!task.activity) return true;

        // 检查是否到达目标��置
        if (task.target && !this.isAtLocation(task.target)) {
            return false;
        }

        // 检查活动是否完成
        const activityDuration = this.getActivityDuration(task.activity.activity);
        const elapsedTime = Date.now() - (task.startTime || Date.now());
        
        return elapsedTime >= activityDuration;
    }

    isNeedTaskComplete(task) {
        if (!task.need || !this.needs[task.need]) return true;

        // 如果需求已经满足
        if (this.needs[task.need] >= this.getNeedThreshold(task.need)) {
            return true;
        }

        // 如果还没到达目标位置
        if (task.target && !this.isAtLocation(task.target)) {
            return false;
        }

        // 检查是否已经在目标位置��够时间
        const satisfactionTime = this.getNeedSatisfactionTime(task.need);
        const elapsedTime = Date.now() - (task.startTime || Date.now());
        
        return elapsedTime >= satisfactionTime;
    }

    isWanderTaskComplete(task) {
        if (!task.startTime) {
            task.startTime = Date.now();
            return false;
        }
        return Date.now() - task.startTime >= task.duration;
    }

    isAtLocation(target) {
        if (!target) return false;

        const distance = Math.hypot(
            target.x + (target.width || 0)/2 - this.x,
            target.y + (target.height || 0)/2 - this.y
        );

        return distance < 5; // 5像素的误差范围
    }

    getActivityDuration(activity) {
        // 基础活动的持续时间（毫秒）
        const baseActivities = {
            '起床': 10 * 1000,
            '早餐': 20 * 1000,
            '午餐': 30 * 1000,
            '晚餐': 30 * 1000,
            '休息': 6 * 60 * 1000,
            '学习': 2 * 60 * 1000,
            '社交': 30 * 1000,
            '购物': 45 * 1000,
            '运动': 60 * 1000
        };

        // 职业特定的活动持续时间
        const professionActivities = {
            '医生': {
                '查房': 60 * 1000,
                '门诊': 4 * 60 * 1000,
                '手术': 2 * 60 * 1000,
                '写病历': 30 * 1000
            },
            '护士': {
                '查房': 45 * 1000,
                '护理': 30 * 1000,
                '发药': 15 * 1000
            },
            '教师': {
                '上课': 45 * 1000,
                '备课': 60 * 1000,
                '批改作业': 30 * 1000
            },
            '程序员': {
                '编程': 3 * 60 * 1000,
                '开会': 60 * 1000,
                '调试': 45 * 1000
            },
            '厨师': {
                '采购': 60 * 1000,
                '烹饪': 2 * 60 * 1000,
                '备菜': 45 * 1000
            },
            '警察': {
                '巡逻': 2 * 60 * 1000,
                '执勤': 4 * 60 * 1000,
                '处理案件': 60 * 1000
            },
            '店员': {
                '接待顾客': 15 * 1000,
                '整理商品': 30 * 1000,
                '收银': 10 * 1000
            },
            '银行职员': {
                '办理业务': 20 * 1000,
                '清点现金': 30 * 1000,
                '客户咨询': 15 * 1000
            },
            '工厂工人': {
                '生产': 4 * 60 * 1000,
                '设备维护': 30 * 1000,
                '质检': 20 * 1000
            },
            '学生': {
                '上课': 45 * 1000,
                '自习': 60 * 1000,
                '课外活动': 45 * 1000
            }
        };

        // 先检查是否是职业特定活动
        if (professionActivities[this.role] && professionActivities[this.role][activity]) {
            return professionActivities[this.role][activity];
        }

        // 如果不是职业特定活动，返回基础活动时间或默认时间
        return baseActivities[activity] || 30 * 1000; // 默认30秒
    }

    getNeedSatisfactionTime(need) {
        // 不同需求的满足时间（毫秒）
        const times = {
            hunger: 20 * 1000,      // 吃饭20秒
            energy: 6 * 60 * 1000,  // 休息6分钟
            social: 5 * 60 * 1000,  // 社交5分钟
            entertainment: 15 * 60 * 1000, // 娱乐15分钟
            health: 10 * 60 * 1000, // 医疗10分钟
            hygiene: 5 * 60 * 1000, // 卫生5分钟
            shopping: 30 * 60 * 1000,// 购物30分钟
            learning: 60 * 60 * 1000 // 学习60分钟
        };
        return times[need] || 30 * 1000; // 默认30秒
    }

    executeTask(task) {
        if (!task) return;

        // 如果任务刚开始，记录开始时间
        if (!task.startTime) {
            task.startTime = Date.now();
            this.onTaskStart(task);
        }

        switch (task.type) {
            case 'scheduled':
                this.executeScheduledTask(task);
                break;
            case 'need':
                this.executeNeedTask(task);
                break;
            case 'wander':
                this.executeWanderTask(task);
                break;
            default:
                console.warn('未知的任务类型:', task.type);
        }
    }

    executeScheduledTask(task) {
        if (!task.activity) return;

        if (task.target && !this.isAtLocation(task.target)) {
            // 移动到目标位置
            this.moveToTarget(task.target);
            this.state = `前往${task.target.type}`;
        } else {
            // 执行活动
            this.performActivity(task.activity.activity);
        }
    }

    executeNeedTask(task) {
        if (!task.need) return;

        // 如果没有目标，寻找目标
        if (!task.target) {
            task.target = this.findTargetForNeed(task.need);
            if (!task.target) {
                console.warn(`${this.role}(${this.id}) 找不到满足需求的目标`);
                return;
            }
        }

        if (!this.isAtLocation(task.target)) {
            // 移动到目标位置
            this.moveToTarget(task.target);
            this.state = `前往${task.target.type}满足${task.need}需求`;
        } else {
            // 满足需求
            this.satisfyNeed(task.need);
        }
    }

    executeWanderTask(task) {
        // 随机漫步
        this.wander(16); // 使用默认的deltaTime
    }

    onTaskStart(task) {
        // 根据任务类型设置状态
        switch (task.type) {
            case 'scheduled':
                this.state = `执行计划: ${task.activity?.activity || '未知活动'}`;
                break;
            case 'need':
                this.state = `满足需求: ${task.need}`;
                break;
            case 'wander':
                this.state = '闲逛';
                break;
        }

        // 记录任务开始
        console.log(`${this.role}(${this.id}) 开始新任务:`, {
            type: task.type,
            details: task
        });
    }

    completeTask(task) {
        if (!task) return;

        // 根据任务类型处理完成效果
        switch (task.type) {
            case 'scheduled':
                this.onScheduledTaskComplete(task);
                break;
            case 'need':
                this.onNeedTaskComplete(task);
                break;
            case 'wander':
                this.onWanderTaskComplete(task);
                break;
        }

        // 重置状态
        this.state = '空';
        console.log(`${this.role}(${this.id}) 完成任务:`, {
            type: task.type,
            duration: Date.now() - task.startTime
        });
    }

    onScheduledTaskComplete(task) {
        if (task.activity?.activity) {
            // 更新相关需求
            this.updateNeedsForActivity(task.activity.activity);
        }
    }

    onNeedTaskComplete(task) {
        if (task.need) {
            // 完全满足需求
            this.needs[task.need] = 100;
        }
    }

    onWanderTaskComplete(task) {
        // 闲逛可能略微提升心情
        this.mood = Math.min(100, this.mood + 5);
    }

    updateNeedsForActivity(activity) {
        // 不同活动对需求的影响
        const effects = {
            '��床': { energy: -20 },
            '早餐': { hunger: 50, energy: 10 },
            '上学': { energy: -30, learning: 40 },
            '工作': { energy: -40, shopping: 20 },
            '午餐': { hunger: 60, social: 10 },
            '晚餐': { hunger: 70, social: 10 },
            '休息': { energy: 80 },
            '学习': { energy: -20, learning: 50 },
            '社交': { social: 60, energy: -10 },
            '购物': { shopping: 70, energy: -20 },
            '运动': { health: 40, energy: -30 }
        };

        const effect = effects[activity] || {};
        for (const [need, value] of Object.entries(effect)) {
            if (this.needs[need] !== undefined) {
                this.needs[need] = Math.max(0, Math.min(100, this.needs[need] + value));
            }
        }
    }

    moveToTarget(target) {
        if (!target) return;

        // 如果没有当前路径，请求新的路径
        if (!this.currentPath) {
            this.requestPath({x: this.x, y: this.y}, {x: target.x, y: target.y});
            this.state = '寻找路径';
            return;
        }

        // 如果有路径，沿着路径移动
        if (this.pathIndex < this.currentPath.length) {
            const nextPoint = this.currentPath[this.pathIndex];
            const dx = nextPoint.x - this.x;
            const dy = nextPoint.y - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 5) { // 到达路径点
                this.pathIndex++;
                if (this.pathIndex >= this.currentPath.length) {
                    this.onPathComplete();
                    this.onReachTarget(target);
                }
            } else {
                // 移动向下一个路径点
                const speed = this.calculateSpeed(16); // 使用默认deltaTime
                this.direction = Math.atan2(dy, dx);
                this.x += (dx / distance) * speed;
                this.y += (dy / distance) * speed;
                this.state = '移动中';
            }
        }
    }

    requestPath(start, end) {
        if (!this.city || !this.city.pathSystem) {
            console.error('无法请求路径：pathSystem未定义');
            return;
        }

        this.city.pathSystem.findPath(start, end).then(path => {
            if (path && path.length > 0) {
                this.currentPath = path;
                this.pathIndex = 0;
                console.log(`${this.role}(${this.id}) 获得新路径，长度:`, path.length);
            } else {
                console.warn(`${this.role}(${this.id}) 找不到路径`);
                // 如果找不到路径，尝试直接移动
                this.currentPath = [start, end];
                this.pathIndex = 0;
            }
        }).catch(error => {
            console.error('路径请求失败:', error);
            this.currentPath = null;
        });
    }

    findNearestBuilding(buildingTypes) {
        try {
            if (!Array.isArray(buildingTypes) || !this.city || !Array.isArray(this.city.buildings)) {
                console.warn('findNearestBuilding: 无效的参数或城市状态');
                return null;
            }

            let nearestBuilding = null;
            let minDistance = Infinity;

            // 筛选符合类型的建筑物
            const suitableBuildings = this.city.buildings.filter(building => 
                building && buildingTypes.includes(building.type)
            );

            // 找到最近的建筑物
            suitableBuildings.forEach(building => {
                // 计算到建筑物中心点的距离
                const distance = Math.hypot(
                    building.x + building.width/2 - this.x,
                    building.y + building.height/2 - this.y
                );

                // 检查建筑物是否可用
                if (distance < minDistance && this.isBuildingAvailable(building)) {
                    minDistance = distance;
                    nearestBuilding = building;
                }
            });

            if (nearestBuilding) {
                console.log(`${this.role}(${this.id}) 找到最近的建筑物:`, {
                    type: nearestBuilding.type,
                    distance: Math.round(minDistance)
                });
            }

            return nearestBuilding;

        } catch (error) {
            console.error('寻找最近建筑物时出错:', error);
            return null;
        }
    }

    findNearestBuildingOfType(type) {
        return this.findNearestBuilding([type]);
    }

    findBuildingsInRange(range, types = null) {
        try {
            if (!this.city || !Array.isArray(this.city.buildings)) {
                return [];
            }

            return this.city.buildings.filter(building => {
                if (!building) return false;

                // 检查距离
                const distance = Math.hypot(
                    building.x + building.width/2 - this.x,
                    building.y + building.height/2 - this.y
                );

                // 检查类型（��果指定了类型）
                const typeMatch = !types || types.includes(building.type);

                return distance <= range && typeMatch;
            });

        } catch (error) {
            console.error('查找范围内建筑物时出错:', error);
            return [];
        }
    }

    findBuildingsByNeed(need) {
        // 根据需求类型返回合适的建筑物类型列表
        const needToBuildingTypes = {
            hunger: ['餐厅', '咖啡厅', '便利店'],
            energy: ['住宅', '公寓', '休息区'],
            social: ['社区中心', '公园', '咖啡厅'],
            entertainment: ['公园', '商场', '电影院'],
            health: ['医院', '诊所'],
            hygiene: ['公共厕所'],
            shopping: ['商场', '超市', '便利店'],
            learning: ['图书馆', '学校']
        };

        const buildingTypes = needToBuildingTypes[need] || [];
        return this.findNearestBuilding(buildingTypes);
    }

    getRoleActivityEffects() {
        // 不同职业的活动效果调整
        const effects = {
            '医生': {
                energyMultiplier: 1.2,    // 工作消耗更多精力
                incomeMultiplier: 1.5,    // 收入更高
                socialMultiplier: 1.2,    // 社交效果更好
                learningMultiplier: 1.3,  // 学习效果更好
                experienceGain: 1.5       // 获得更多经验
            },
            '教师': {
                energyMultiplier: 1.1,
                learningMultiplier: 1.5,
                socialMultiplier: 1.3,
                experienceGain: 1.3
            },
            '程序员': {
                learningMultiplier: 1.4,
                socialMultiplier: 0.8,
                restEfficiency: 1.2,
                experienceGain: 1.4
            },
            '厨师': {
                energyMultiplier: 1.3,
                hungerMultiplier: 0.8,
                experienceGain: 1.2
            },
            '警察': {
                energyMultiplier: 1.2,
                socialMultiplier: 1.1,
                experienceGain: 1.3
            },
            '商人': {
                incomeMultiplier: 1.3,
                socialMultiplier: 1.4,
                experienceGain: 1.2
            },
            '学生': {
                learningMultiplier: 1.5,
                energyMultiplier: 0.9,
                experienceGain: 1.6
            }
        };

        return effects[this.role] || {
            energyMultiplier: 1,
            socialMultiplier: 1,
            learningMultiplier: 1,
            experienceGain: 1
        };
    }

    getDefaultNeedThreshold(need) {
        // 为不同需求设置默认阈值
        const defaultThresholds = {
            hunger: 30,     // 饥饿度低于30%时需要吃东西
            energy: 25,     // 精力低于25%时需要休息
            social: 35,     // 社交需求低于35%时需要社交
            entertainment: 40, // 娱乐需求低于40%时需要娱乐
            health: 50,     // 健康值低于50%时需要就医
            hygiene: 45,    // 卫生需求低于45%时需要清洁
            shopping: 30,   // 购物需求低于30%时需要购物
            learning: 60    // 学习需求低于60%时需要学习
        };

        // 根据职业调整阈值
        const professionModifiers = {
            '医生': {
                energy: 40,    // 医生需要保持更高的精力
                hygiene: 60    // 医生需要保持更高的卫生水平
            },
            '运动员': {
                energy: 50,    // 运动员需要保持更高的精力
                health: 70     // 运动员需要保持更高的健康水平
            },
            '教师': {
                energy: 35,    // 教师需要保持适度的精力
                learning: 70   // 教师需要保持更高的学习欲望
            },
            '学生': {
                learning: 70,  // 学生需要保持更高的学习欲望
                energy: 30     // 学生可以接受较低的精力水平
            },
            '厨师': {
                hygiene: 70,   // 厨师需要保持更高的卫生水平
                hunger: 40     // 厨师对饥饿更敏感
            },
            '程序员': {
                learning: 65,  // 程序员需要保持较高的学习欲望
                social: 25     // 程序员可以接受较低的社交需求
            }
        };

        // 获取职业特定的修正值
        const professionModifier = professionModifiers[this.role];
        const modifiedThreshold = professionModifier?.[need];

        // 如果有职业特定的修正值，使用修正值，否则使用默认值
        return modifiedThreshold || defaultThresholds[need] || 50;
    }
}

// 如果使用模块系统，确保正确导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Agent;
} 