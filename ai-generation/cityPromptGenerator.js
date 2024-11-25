class CityPromptGenerator {
    constructor() {
        this.basePrompt = {
            professions: {
                instruction: `作为一个小型城市规划AI助手，请基于以下要求生成适合500-1000人口规模的职业分布：
                    1. 职业类别划分（考虑小城镇特点）：
                       - 医疗卫生类（每300人配备1名医生，2-3名护士）
                       - 教育类（每50名学生配备1名教师）
                       - IT/互联网类（保持10-15%的技术人才）
                       - 商业服务类（保持基本生活服务coverage）
                       - 公共服务类（确保基础行政和安全人员配置）
                       - 生活服务类（满足日常生活需求）
                       - 文化娱乐类（保持适度文化氛围）

                    2. 每个职业需要详细说明：
                       - 在小型城市中的具体职责
                       - 必要的资质要求
                       - 工作时间安排（考虑人员精简的特点）
                       - 主要活动场所
                       - 与其他职业的协作关系
                       - 对小型城市功能的重要性

                    3. 职业分布需要特别考虑：
                       - 小规模人口的基本生活需求
                       - 必要的公共服务保障
                       - 紧凑的空间布局
                       - 职业间的互补性
                       - 服务半径的合理性
                       - 人员配置的经济性`,
                format: {
                    category: "职业类别",
                    percentage: "占总人口百分比",
                    jobs: [{
                        name: "职业名称",
                        description: "在小型城市中的具体工作内容",
                        requirements: ["必要技能和资质"],
                        workplace: ["主要工作场所"],
                        workingHours: {
                            regular: "常规工作时间",
                            shifts: "轮班安排（如果需要）"
                        },
                        interactions: ["主要协作的其他职业"],
                        contribution: "对小型城市功能的贡献"
                    }]
                }
            },
            buildings: {
                instruction: `基于小型城市的职业分布，请生成紧凑而完整的建筑设施规划：
                    1. 建筑类型划分（强调空间效率）：
                       - 住宅类（紧凑型住宅、小型公寓）
                       - 医疗类（社区医院、诊所）
                       - 教育类（小型学校、培训中心）
                       - 商业类（便利店、小型超市）
                       - 公共服务类（行政中心、警务室）
                       - 文化娱乐类（小型图书馆、文化站）
                       - 休闲设施（社区公园、运动场）

                    2. 每个建筑需要明确：
                       - 适合小型城市的规模
                       - 必要的功能配置
                       - 合理的容纳人数
                       - 灵活的使用时间
                       - 精简的人员配置
                       - 适当的服务半径
                       - 与周边设施的关联

                    3. 建筑布局需要注重：
                       - 步行可达性
                       - 混合功能设计
                       - 空间利用效率
                       - 设施共享可能
                       - 未来扩展预留
                       - 成本效益平衡`,
                format: {
                    category: "建筑类别",
                    percentage: "占总建筑面积百分比",
                    buildings: [{
                        name: "建筑物名称",
                        purpose: "主要用途",
                        scale: {
                            size: { width: "宽度", height: "高度" },
                            floors: "层数",
                            capacity: "适合的容纳人数"
                        },
                        facilities: ["必要的配套设施"],
                        operatingHours: { 
                            open: "开始时间", 
                            close: "结束时间",
                            special: "特殊安排"
                        },
                        staffTypes: ["必要的工作人员"],
                        serviceRadius: "合理的服务半径",
                        connections: ["相关联的设施"]
                    }]
                }
            }
        };
    }

    generatePrompt(cityType, population) {
        return {
            prompt: `作为小型城市规划AI助手，请设计一个${cityType}类型、人口${population}人的紧凑型现代化城市。
                    
                    城市特点要求：
                    1. 城市定位：
                       - 明确的特色功能
                       - 合理的发展规模
                       - 可持续运营模式
                    
                    2. 人口特征：
                       - 适度的人口密度
                       - 基本的人口结构
                       - 合理的职业分布
                    
                    3. 功能配置：
                       - 基础设施完备
                       - 公共服务到位
                       - 生活便利性高
                    
                    4. 空间布局：
                       - 紧凑型布局
                       - 步行友好
                       - 混合使用
                    
                    5. 生活品质：
                       - 基本教育保障
                       - 医疗服务可及
                       - 文化生活充实
                       - 休闲空间充足
                    
                    请按照以下JSON格式返回详细的小型城市规划方案：`,
            format: {
                cityProfile: {
                    type: cityType,
                    population: population,
                    characteristics: ["城市特色"],
                    developmentGoals: ["发展目标"],
                    keyFeatures: ["主要功能"]
                },
                professions: this.basePrompt.professions.format,
                buildings: this.basePrompt.buildings.format,
                districts: {
                    name: "区域名称",
                    type: "功能类型",
                    mainFunctions: ["主要功能"],
                    keyBuildings: ["重要设施"],
                    population: "规划人数"
                }
            }
        };
    }
} 