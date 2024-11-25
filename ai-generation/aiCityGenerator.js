class AICityGenerator {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.promptGenerator = new CityPromptGenerator();
        this.cityData = null;
    }

    async generateCity(cityType, population) {
        try {
            const prompt = this.promptGenerator.generatePrompt(cityType, population);
            console.log('生成城市提示词:', prompt);

            const response = await this.callAI(prompt);
            console.log('AI响应:', response);

            const validatedData = this.validateCityData(response);
            this.cityData = this.transformToGameFormat(validatedData);
            return this.cityData;
        } catch (error) {
            console.error('生成城市数据失败:', error);
            throw error;
        }
    }

    async callAI(prompt) {
        try {
            console.log('调用AI API...');
            
            // 计算每个区域的人口
            const totalPopulation = prompt.population || 500;
            
            // 计算区域人口分布
            const districtPopulations = {
                '科技创新核心区': Math.floor(totalPopulation * 0.3),
                '商业生活区': Math.floor(totalPopulation * 0.3),
                '文化教育区': Math.floor(totalPopulation * 0.2),
                '生活服务区': Math.floor(totalPopulation * 0.2)
            };

            // 验证区域人口总和
            const totalDistrictPopulation = Object.values(districtPopulations)
                .reduce((sum, pop) => sum + pop, 0);
            
            if (totalDistrictPopulation !== totalPopulation) {
                // 调整最后一个区域的人口以确保总和正确
                const diff = totalPopulation - totalDistrictPopulation;
                districtPopulations['生活服务区'] += diff;
            }

            // 模拟AI响应数据
            const mockResponse = {
                cityProfile: {
                    type: prompt.cityType || "科技创新型城市",
                    population: totalPopulation,
                    characteristics: ["高科技产业集群", "创新创业活跃", "人才密集"],
                    developmentGoals: ["打造科技创新中心", "培育新兴产业", "吸引高端人才"],
                    keyIndustries: ["人工智能", "生物科技", "新能源"]
                },
                professions: [
                    {
                        category: "IT/互联网",
                        percentage: 0.25,
                        jobs: [
                            {
                                name: "软件工程师",
                                description: "开发和维护软件系统",
                                requirements: ["计算机相关学位", "编程技能"],
                                workplace: ["科技园", "研发中心"],
                                workingHours: {
                                    regular: "09:00-18:00",
                                    shifts: null
                                },
                                interactions: ["产品经理", "设计师"],
                                contribution: "技术创新核心力量"
                            }
                        ]
                    },
                    {
                        category: "医卫生",
                        percentage: 0.20,
                        jobs: [
                            {
                                name: "医生",
                                description: "提供医疗服务",
                                requirements: ["医学学位", "执业资格"],
                                workplace: ["医院", "诊所"],
                                workingHours: {
                                    regular: "08:00-17:00",
                                    shifts: "三班制"
                                },
                                interactions: ["护士", "药剂师"],
                                contribution: "保障市民健康"
                            }
                        ]
                    },
                    {
                        category: "教育",
                        percentage: 0.15,
                        jobs: [
                            {
                                name: "教师",
                                description: "教育和培养学生",
                                requirements: ["教师资格证", "专业知识"],
                                workplace: ["学校", "培训机构"],
                                workingHours: {
                                    regular: "08:00-16:00",
                                    shifts: null
                                },
                                interactions: ["学生", "家长"],
                                contribution: "培养人才"
                            }
                        ]
                    },
                    {
                        category: "商业服务",
                        percentage: 0.20,
                        jobs: [
                            {
                                name: "销售",
                                description: "产品销售和客户服务",
                                requirements: ["销售技能", "沟通能力"],
                                workplace: ["商场", "写字楼"],
                                workingHours: {
                                    regular: "09:00-18:00",
                                    shifts: null
                                },
                                interactions: ["客户", "产品经理"],
                                contribution: "促进商业发展"
                            }
                        ]
                    },
                    {
                        category: "公共服务",
                        percentage: 0.20,
                        jobs: [
                            {
                                name: "公务员",
                                description: "行政管理和公共服务",
                                requirements: ["公务员资格", "行政管理能力"],
                                workplace: ["政府机构", "公共服务中心"],
                                workingHours: {
                                    regular: "09:00-17:00",
                                    shifts: null
                                },
                                interactions: ["市民", "其他部门"],
                                contribution: "维护社会运转"
                            }
                        ]
                    }
                ],
                buildings: [
                    {
                        category: "公共设施",
                        percentage: 0.15,
                        buildings: [
                            {
                                name: "政府机构",
                                purpose: "行政管理",
                                scale: {
                                    size: { width: 100, height: 80 },
                                    floors: 5,
                                    capacity: 100
                                },
                                facilities: ["办公室", "会议室", "档案室"],
                                operatingHours: {
                                    open: "09:00",
                                    close: "17:00",
                                    special: null
                                },
                                staffTypes: ["公务员", "行政人员"],
                                serviceRadius: 2000
                            },
                            {
                                name: "警察局",
                                purpose: "维护治安",
                                scale: {
                                    size: { width: 80, height: 60 },
                                    floors: 3,
                                    capacity: 50
                                },
                                facilities: ["办公室", "监控室", "拘留室"],
                                operatingHours: {
                                    open: "00:00",
                                    close: "24:00",
                                    special: "24小时值班"
                                },
                                staffTypes: ["警察", "行政人员"],
                                serviceRadius: 3000
                            }
                        ]
                    },
                    {
                        category: "休闲设施",
                        percentage: 0.15,
                        buildings: [
                            {
                                name: "公园",
                                purpose: "休闲娱乐",
                                scale: {
                                    size: { width: 200, height: 150 },
                                    floors: 1,
                                    capacity: 500
                                },
                                facilities: ["休息区", "运动场", "儿童乐园"],
                                operatingHours: {
                                    open: "06:00",
                                    close: "22:00",
                                    special: null
                                },
                                staffTypes: ["园丁", "保安"],
                                serviceRadius: 2000
                            },
                            {
                                name: "体育馆",
                                purpose: "体育运动",
                                scale: {
                                    size: { width: 150, height: 100 },
                                    floors: 2,
                                    capacity: 300
                                },
                                facilities: ["运动场", "健身房", "更衣室"],
                                operatingHours: {
                                    open: "08:00",
                                    close: "22:00",
                                    special: null
                                },
                                staffTypes: ["教练", "服务人员"],
                                serviceRadius: 3000
                            }
                        ]
                    }
                ],
                districts: [
                    {
                        name: "科技创新核心区",
                        type: "科技园区",
                        mainFunctions: ["研发", "创新", "孵化"],
                        keyBuildings: ["科技园", "研发中心", "创业园"],
                        population: districtPopulations['科技创新核心区']
                    },
                    {
                        name: "商业生活区",
                        type: "综合区",
                        mainFunctions: ["居住", "商业", "服务"],
                        keyBuildings: ["商场", "住宅", "学校"],
                        population: districtPopulations['商业生活区']
                    },
                    {
                        name: "文化教育区",
                        type: "教育区",
                        mainFunctions: ["教育", "文化", "研究"],
                        keyBuildings: ["大学", "图书馆", "文化中心"],
                        population: districtPopulations['文化教育区']
                    },
                    {
                        name: "生活服务区",
                        type: "服务区",
                        mainFunctions: ["居住", "休闲", "服务"],
                        keyBuildings: ["住宅", "公园", "商业街"],
                        population: districtPopulations['生活服务区']
                    }
                ]
            };

            console.log('解析后的城市规划数据:', mockResponse);
            return mockResponse;

        } catch (error) {
            console.error('AI API调用失败:', error);
            throw error;
        }
    }

    validateCityData(data) {
        console.log('验证城市数据...');
        
        // 验证cityProfile
        if (!data.cityProfile) {
            throw new Error('缺少必要的城市数据部分: cityProfile');
        }
        
        ['type', 'population', 'characteristics'].forEach(field => {
            if (!data.cityProfile[field]) {
                throw new Error(`cityProfile 缺少必要字段: ${field}`);
            }
        });

        // 验证professions数组
        if (!Array.isArray(data.professions)) {
            throw new Error('professions 必须是数组');
        }

        // 验证每个profession对象
        data.professions.forEach((profession, index) => {
            // 验证基本字段
            if (!profession.jobs || !Array.isArray(profession.jobs)) {
                throw new Error(`profession ${index} 缺少jobs数组`);
            }

            // 验证每个job对象
            profession.jobs.forEach((job, jobIndex) => {
                const requiredJobFields = ['name', 'description', 'workplace', 'workingHours'];
                requiredJobFields.forEach(field => {
                    if (!job[field]) {
                        throw new Error(`profession ${index} 的 job ${jobIndex} 缺少必要字段: ${field}`);
                    }
                });
            });
        });

        // 验证buildings数组
        if (!Array.isArray(data.buildings)) {
            throw new Error('buildings 必须是数组');
        }

        // 验证每个building类别
        data.buildings.forEach((buildingCategory, index) => {
            const requiredFields = ['category', 'percentage', 'buildings'];
            requiredFields.forEach(field => {
                if (!buildingCategory[field]) {
                    throw new Error(`building category ${index} 缺少必要字段: ${field}`);
                }
            });

            // 验证buildings数组
            if (!Array.isArray(buildingCategory.buildings)) {
                throw new Error(`building category ${index} 的buildings必须是数组`);
            }

            // 验证每个具体建筑
            buildingCategory.buildings.forEach((building, buildingIndex) => {
                const requiredBuildingFields = [
                    'name', 'purpose', 'scale', 'facilities', 
                    'operatingHours', 'staffTypes', 'serviceRadius'
                ];
                requiredBuildingFields.forEach(field => {
                    if (!building[field]) {
                        throw new Error(`building category ${index} 的建筑 ${buildingIndex} 缺少必要字段: ${field}`);
                    }
                });
            });
        });

        // 验证districts数组
        if (!Array.isArray(data.districts)) {
            throw new Error('districts 必须是数组');
        }

        // 验证每个district
        data.districts.forEach((district, index) => {
            const requiredFields = ['name', 'type', 'mainFunctions', 'keyBuildings', 'population'];
            requiredFields.forEach(field => {
                if (!district[field]) {
                    throw new Error(`district ${index} 缺少必要字段: ${field}`);
                }
            });
        });

        // 验证数值的合理性
        if (data.cityProfile.population <= 0) {
            throw new Error('人口数量必须大于0');
        }

        // 验证职业分布总和是否接近100%
        const professionTotal = data.professions.reduce((sum, prof) => 
            sum + parseFloat(prof.percentage || 0), 0);
        if (Math.abs(professionTotal - 100) > 5) {
            console.warn(`职业分布总和异常: ${professionTotal}%`);
        }

        console.log('数据验证通过');
        return data;
    }

    transformToGameFormat(cityData) {
        console.log('转换数据为游戏格式...');
        
        return {
            // 城市基本配置
            cityConfig: {
                type: cityData.cityProfile.type,
                population: cityData.cityProfile.population,
                characteristics: cityData.cityProfile.characteristics,
                developmentGoals: cityData.cityProfile.developmentGoals,
                keyIndustries: cityData.cityProfile.keyIndustries
            },

            // 职业分布
            professionDistribution: this.transformProfessions(cityData.professions),

            // 建筑配置
            buildingConfigs: this.transformBuildings(cityData.buildings),

            // 区域配置
            districtConfigs: this.transformDistricts(cityData.districts)
        };
    }

    transformProfessions(professions) {
        const distribution = {};
        
        professions.forEach(category => {
            category.jobs.forEach(job => {
                distribution[job.name] = {
                    percentage: parseFloat(category.percentage) / category.jobs.length,
                    workplace: job.workplace,
                    workingHours: this.parseWorkingHours(job.workingHours),
                    requirements: job.requirements,
                    interactions: job.interactions,
                    contribution: job.contribution
                };
            });
        });

        return distribution;
    }

    transformBuildings(buildings) {
        const buildingConfigs = {};

        buildings.forEach(category => {
            category.buildings.forEach(building => {
                buildingConfigs[building.name] = {
                    type: building.name,
                    category: category.category,
                    size: building.scale.size,
                    capacity: parseInt(building.scale.capacity),
                    floors: parseInt(building.scale.floors),
                    operatingHours: this.parseOperatingHours(building.operatingHours),
                    staffTypes: building.staffTypes,
                    facilities: building.facilities,
                    serviceRadius: parseInt(building.serviceRadius),
                    connections: building.connections
                };
            });
        });

        return buildingConfigs;
    }

    transformDistricts(districts) {
        return districts.map(district => ({
            name: district.name,
            type: district.type,
            mainFunctions: district.mainFunctions,
            keyBuildings: district.keyBuildings,
            plannedPopulation: parseInt(district.population)
        }));
    }

    parseWorkingHours(hours) {
        if (hours.regular) {
            const [start, end] = hours.regular.split('-').map(t => this.standardizeTime(t.trim()));
            return { start, end, shifts: hours.shifts };
        }
        return { start: '09:00', end: '18:00' }; // 默认工作时间
    }

    parseOperatingHours(hours) {
        return {
            open: this.standardizeTime(hours.open),
            close: this.standardizeTime(hours.close),
            special: hours.special
        };
    }

    standardizeTime(time) {
        if (!time) return null;
        const [hours, minutes] = time.split(':').map(Number);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    async testGeneration(cityType = '科技创新型城市', population = 100000) {
        try {
            console.log(`开始测试生成${cityType}，人口${population}...`);

            // 生成城市数据
            const cityData = await this.generateCity(cityType, population);
            
            // 验证生成的数据
            this.validateGeneratedData(cityData);

            // 输出测试统计
            this.printTestStatistics(cityData);

            return cityData;
        } catch (error) {
            console.error('测试生成失败:', error);
            throw error;
        }
    }

    validateGeneratedData(cityData) {
        console.log('\n验证生成的数据...');

        // 验证职业分布
        const professionTotal = Object.values(cityData.professionDistribution)
            .reduce((sum, prof) => sum + prof.percentage, 0);
        console.log('职业分布总比例:', professionTotal);

        // 验证建筑配置
        const buildingCategories = new Set(
            Object.values(cityData.buildingConfigs).map(b => b.category)
        );
        console.log('建筑类别:', Array.from(buildingCategories));

        // 验证区域配置
        const totalPlannedPopulation = cityData.districtConfigs
            .reduce((sum, d) => sum + d.plannedPopulation, 0);
        console.log('规划总人口:', totalPlannedPopulation);

        // 检查关键要素
        this.checkEssentialElements(cityData);
    }

    checkEssentialElements(cityData) {
        const essentialElements = {
            '医疗设施': ['综合医院', '社区诊所'],
            '教育设施': ['学校', '大学'],
            '商业设施': ['商场', '超市'],
            '公共设施': ['政府机构', '警察局'],
            '休闲设施': ['公园', '体育馆']
        };

        for (const [category, buildings] of Object.entries(essentialElements)) {
            const hasElements = buildings.some(b => 
                Object.values(cityData.buildingConfigs)
                    .some(config => config.type === b)
            );
            console.log(`${category} 检查:`, hasElements ? '✓' : '×');
        }
    }

    printTestStatistics(cityData) {
        console.log('\n测试统计信息:');
        console.log('城市类型:', cityData.cityConfig.type);
        console.log('规划人口:', cityData.cityConfig.population);
        console.log('职业类型数:', Object.keys(cityData.professionDistribution).length);
        console.log('建筑类型数:', Object.keys(cityData.buildingConfigs).length);
        console.log('区域数量:', cityData.districtConfigs.length);

        // 输出主要职业分布
        console.log('\n主要职业分布:');
        Object.entries(cityData.professionDistribution)
            .sort((a, b) => b[1].percentage - a[1].percentage)
            .slice(0, 5)
            .forEach(([profession, data]) => {
                console.log(`${profession}: ${(data.percentage * 100).toFixed(1)}%`);
            });

        // 输出主要建筑类型
        console.log('\n主要建筑类型:');
        const buildingsByCategory = {};
        Object.values(cityData.buildingConfigs).forEach(building => {
            buildingsByCategory[building.category] = 
                (buildingsByCategory[building.category] || 0) + 1;
        });

        Object.entries(buildingsByCategory)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                console.log(`${category}: ${count}个建筑`);
            });
    }

    async testProfessionDistribution() {
        try {
            console.log('测试职业分布生成...');
            const cityType = '科技创新型城市';
            const population = 100000;

            const cityData = await this.generateCity(cityType, population);
            return cityData.professionDistribution;
        } catch (error) {
            console.error('职业分布测试失败:', error);
            throw error;
        }
    }

    async testBuildingGeneration() {
        try {
            console.log('测试建筑生成...');
            const cityType = '科技创新型城市';
            const population = 100000;

            const cityData = await this.generateCity(cityType, population);
            return cityData.buildingConfigs;
        } catch (error) {
            console.error('建筑生成测试失败:', error);
            throw error;
        }
    }
} 