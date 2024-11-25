class TestAIGeneration {
    static async runTest() {
        try {
            console.log('开始AI城市生成测试...');
            let testResults = {
                success: true,
                details: [],
                errors: []
            };

            // 初始化生成器
            const generator = new AICityGenerator(CONFIG.DEEPSEEK_API_KEY);
            const cityDataManager = new CityDataManager();

            // 测试不同类型的小规模城市生成
            const cityTypes = [
                {type: '科技创新型城市', population: 500},
                {type: '文化旅游型城市', population: 600},
                {type: '工业制造型城市', population: 800}
            ];

            for (const cityConfig of cityTypes) {
                console.log(`\n测试生成 ${cityConfig.type}...`);
                console.log(`计划人口规模: ${cityConfig.population} 人`);
                
                try {
                    // 生成城市数据
                    const cityData = await generator.testGeneration(
                        cityConfig.type, 
                        cityConfig.population
                    );

                    // 验证生成的数据
                    const validationResult = TestAIGeneration.validateCityData(cityData);
                    testResults.details.push({
                        cityType: cityConfig.type,
                        validation: validationResult
                    });

                    // 保存到数据管理器
                    await cityDataManager.loadCityData(generator, cityConfig.type, cityConfig.population);

                    // 输出统计信息
                    const stats = TestAIGeneration.printStatistics(cityData);
                    testResults.details[testResults.details.length - 1].statistics = stats;

                } catch (error) {
                    testResults.success = false;
                    testResults.errors.push({
                        cityType: cityConfig.type,
                        error: error.message
                    });
                }
            }

            // 输出最终测试结果
            console.log('\n测试结果汇总:');
            console.log('测试状态:', testResults.success ? '通过 ✓' : '失败 ×');
            if (testResults.errors.length > 0) {
                console.log('错误信息:', testResults.errors);
            }
            console.log('详细结果:', testResults.details);

            return testResults;

        } catch (error) {
            console.error('测试失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static validateCityData(cityData) {
        const validationResult = {
            passed: true,
            checks: {},
            warnings: []
        };

        // 1. 验证城市规模
        validationResult.checks.population = {
            passed: true,
            details: []
        };
        if (cityData.cityConfig.population > 1000) {
            validationResult.checks.population.passed = false;
            validationResult.checks.population.details.push('城市人口超过1000人上限');
        } else if (cityData.cityConfig.population < 500) {
            validationResult.checks.population.passed = false;
            validationResult.checks.population.details.push('城市人口低于500人下限');
        }

        // 2. 验证职业分布
        validationResult.checks.professions = {
            passed: true,
            details: []
        };
        const professionTotal = Object.values(cityData.professionDistribution)
            .reduce((sum, prof) => sum + prof.percentage, 0);
        
        if (Math.abs(professionTotal - 1) > 0.05) {
            validationResult.checks.professions.passed = false;
            validationResult.checks.professions.details.push(
                `职业分布总和异常: ${(professionTotal * 100).toFixed(1)}%`
            );
        }

        // 3. 验证建筑物配置
        validationResult.checks.buildings = {
            passed: true,
            details: []
        };
        const buildingCount = Object.keys(cityData.buildingConfigs).length;
        const recommendedBuildingCount = Math.ceil(cityData.cityConfig.population / 20);
        
        if (buildingCount < recommendedBuildingCount * 0.5) {
            validationResult.checks.buildings.passed = false;
            validationResult.checks.buildings.details.push(
                `建筑物数量不足: ${buildingCount}/${recommendedBuildingCount}`
            );
        }

        // 4. 验证必要设施
        validationResult.checks.essentialFacilities = {
            passed: true,
            details: []
        };
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
            if (!hasElements) {
                validationResult.checks.essentialFacilities.passed = false;
                validationResult.checks.essentialFacilities.details.push(
                    `缺少${category}`
                );
            }
        }

        // 5. 验证区域规划
        validationResult.checks.districts = {
            passed: true,
            details: []
        };
        const totalPlannedPopulation = cityData.districtConfigs
            .reduce((sum, d) => sum + d.plannedPopulation, 0);
        
        if (Math.abs(totalPlannedPopulation - cityData.cityConfig.population) > 
            cityData.cityConfig.population * 0.1) {
            validationResult.checks.districts.passed = false;
            validationResult.checks.districts.details.push(
                `区域规划人口(${totalPlannedPopulation})与目标人口(${cityData.cityConfig.population})差异过大`
            );
        }

        // 更新总体通过状态
        validationResult.passed = Object.values(validationResult.checks)
            .every(check => check.passed);

        return validationResult;
    }

    static printStatistics(cityData) {
        const stats = {
            cityProfile: {
                type: cityData.cityConfig.type,
                population: cityData.cityConfig.population,
                professionTypes: Object.keys(cityData.professionDistribution).length,
                buildingTypes: Object.keys(cityData.buildingConfigs).length,
                districts: cityData.districtConfigs.length
            },
            professions: {},
            buildings: {},
            metrics: {}
        };

        // 职业分布统计
        Object.entries(cityData.professionDistribution)
            .sort((a, b) => b[1].percentage - a[1].percentage)
            .forEach(([profession, data]) => {
                const count = Math.round(data.percentage * cityData.cityConfig.population);
                stats.professions[profession] = {
                    count,
                    percentage: (data.percentage * 100).toFixed(1) + '%'
                };
            });

        // 建筑物统计
        const buildingsByCategory = {};
        Object.values(cityData.buildingConfigs).forEach(building => {
            buildingsByCategory[building.category] = 
                (buildingsByCategory[building.category] || 0) + 1;
        });
        stats.buildings = buildingsByCategory;

        // 计算关键指标
        stats.metrics = {
            buildingsPerCapita: (Object.keys(cityData.buildingConfigs).length / 
                cityData.cityConfig.population).toFixed(3),
            averageDistrictPopulation: Math.round(cityData.cityConfig.population / 
                cityData.districtConfigs.length),
            professionDiversity: Object.keys(cityData.professionDistribution).length
        };

        console.log('\n城市统计信息:', stats);
        return stats;
    }
}

// 如果在浏览器环境中，添加到全局对象
if (typeof window !== 'undefined') {
    window.testAIGeneration = TestAIGeneration.runTest;
} 