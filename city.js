class City {
    constructor(config) {
        console.log('开始创建城市实例，配置:', config);
        
        // 保存配置
        this.config = config || {};
        
        // 设置城市尺寸
        this.setDimensions(config?.citySize);
        
        // 创建画布
        this.initializeCanvas();
        
        // 初始化视口
        this.viewport = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            scale: 1
        };
        this.zoomLevel = 1;
        
        // 初始化鼠标控制状态
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        // 添加鼠标事件监听
        this.setupMouseControls();
        
        // 初始化基础数组
        this.buildings = [];
        this.roads = [];
        this.agents = [];
        this.districts = [];
        
        // 初始化核心系统
        this.initializeCoreSystems();
        
        // 初始化性能监控
        this.initializePerformanceMonitoring();
        
        console.log('城市实例创建完成');
    }

    async initialize() {
        try {
            console.log('开始初始化城市...');

            // 初始化各个系统
            await this.initializeSystems();
            
            // 生成城市基础结构（区域和道路）
            await this.generateDistricts();
            await this.generateRoads();
            
            // 使用职业分布算法生成代理
            await this.generateAgentsWithProfessions();
            
            // 分析实际生成的代理职业分布
            const professionDistribution = this.analyzeActualProfessions();
            
            // 根据实际职业分布生成建筑物
            await this.generateBuildingsBasedOnActualProfessions(professionDistribution);
            
            // 启动更新循环
            this.startUpdateLoop();
            
            console.log('城市初始化完成');
        } catch (error) {
            console.error('城市初始化失败:', error);
            throw error;
        }
    }

    async generateAgentsWithProfessions() {
        console.log('开始生成代理...');
        const agentCount = this.config.agentCount || 200;
        this.agents = [];

        // 定义职业分布，确保总和为1
        this.professionDistribution = {
            // 医疗卫生类 (12%)
            '医生': 0.04,
            '护士': 0.04,
            '药剂师': 0.02,
            '牙医': 0.01,
            '中医师': 0.01,

            // 教育类 (10%)
            '小学教师': 0.03,
            '中学教师': 0.03,
            '职业培训师': 0.02,
            '教授': 0.02,

            // IT/互联网类 (10%)
            '前端工程师': 0.02,
            '后端工程师': 0.02,
            '人工智能工程师': 0.02,
            '数据科学家': 0.02,
            '网络工程师': 0.02,

            // 金融类 (8%)
            '银行职员': 0.02,
            '会计师': 0.02,
            '基金经理': 0.02,
            '保险顾问': 0.02,

            // 创意文化类 (8%)
            '游戏设计师': 0.02,
            '动画师': 0.02,
            '音乐制作人': 0.02,
            '设计师': 0.01,
            '记者': 0.01,

            // 服务业 (15%)
            '店员': 0.03,
            '服务员': 0.03,
            '导游': 0.02,
            '酒店经理': 0.02,
            '美容师': 0.02,
            '厨师': 0.03,

            // 制造业 (12%)
            '工厂工人': 0.04,
            '技术工人': 0.03,
            '产品经理': 0.03,
            '生产主管': 0.02,

            // 公共服务 (10%)
            '警察': 0.02,
            '消防员': 0.02,
            '公务员': 0.03,
            '公交车司机': 0.03,

            // 非就业人口 (15%)
            '学生': 0.07,
            '退休人员': 0.03,
            '市民': 0.10  // 降低到10%
        };

        // 验证职业分布总和
        const totalProbability = Object.values(this.professionDistribution)
            .reduce((sum, prob) => sum + prob, 0);
        console.log('职业分布概率总和:', totalProbability);

        if (Math.abs(totalProbability - 1) > 0.001) {
            console.warn('职业分布概率总和不为1:', totalProbability);
        }

        // 生成代理
        for (let i = 0; i < agentCount; i++) {
            const position = this.getRandomPosition();
            const profession = this.selectProfession(this.professionDistribution);
            
            const agent = new Agent(
                position.x,
                position.y,
                profession,
                `agent_${i}`,
                this
            );
            
            this.agents.push(agent);

            // 每生成10个代理输出一次日志
            if (i % 10 === 0) {
                console.log(`已生成 ${i} 个代理`);
            }
        }

        console.log(`完成代理生成，共 ${this.agents.length} 个代理`);
        console.log('职业分布统计:', this.getAgentDistribution());
    }

    analyzeActualProfessions() {
        const professionCounts = {};
        const professionPercentages = {};
        const total = this.agents.length;

        // 统计实际生成的每种职业的数量
        this.agents.forEach(agent => {
            professionCounts[agent.role] = (professionCounts[agent.role] || 0) + 1;
        });

        // 计算每种职业的实际百分比
        Object.keys(professionCounts).forEach(role => {
            professionPercentages[role] = professionCounts[role] / total;
        });

        console.log('实际职业分布分析:', {
            counts: professionCounts,
            percentages: professionPercentages
        });

        return {
            counts: professionCounts,
            percentages: professionPercentages
        };
    }

    async generateBuildingsBasedOnActualProfessions(professionDistribution) {
        console.log('根据实际职业分布生成建筑物...');

        // 计算每种建筑物的需求量
        const buildingRequirements = this.calculateBuildingRequirements(professionDistribution.counts);

        // 按区域分配建筑物
        for (const district of this.districts) {
            const buildingTypes = this.getBuildingTypesForDistrict(district.type, buildingRequirements);
            await this.generateDistrictBuildings(district, buildingTypes);
        }

        // 为每个代理分配住所和工作场所
        await this.assignBuildingsToAgents();

        console.log(`完成建筑物生成，共 ${this.buildings.length} 个建筑物`);
    }

    async assignBuildingsToAgents() {
        console.log('开始为代理分配建筑物...');

        for (const agent of this.agents) {
            // 分配住所
            const residence = this.findSuitableResidence(agent);
            if (residence) {
                residence.currentOccupants.add(agent.id);
                agent.residence = residence;
            }

            // 分配工作场所
            const workplace = this.findSuitableWorkplace(agent);
            if (workplace) {
                workplace.currentOccupants.add(agent.id);
                agent.workplace = workplace;
            }
        }

        console.log('完成建筑物分配');
    }

    findSuitableResidence(agent) {
        // 根据代理职业和特征找到合适的住所
        const residentialBuildings = this.buildings.filter(b => 
            ['住宅', '公寓', '学生宿舍', '员工宿舍'].includes(b.type) &&
            b.currentOccupants.size < b.capacity
        );

        return this.chooseBestBuilding(residentialBuildings, agent);
    }

    findSuitableWorkplace(agent) {
        // 根据代理职业找到合适的工作场所
        const workplaces = this.buildings.filter(b => 
            this.buildingManager.getBuildingProperties(b.type)?.workplaces?.includes(agent.role) &&
            b.currentOccupants.size < b.capacity
        );

        return this.chooseBestBuilding(workplaces, agent);
    }

    calculateBuildingRequirements(professionCounts) {
        const totalAgents = this.agents.length;
        const requirements = {
            // 住宅建筑（基于总人口，增加容量）
            residential: {
                '住宅': Math.ceil(totalAgents * 0.6),  // 增加从0.4到0.6
                '公寓': Math.ceil(totalAgents * 0.4),  // 增加从0.3到0.4
                '学生宿舍': Math.ceil((professionCounts['学生'] || 0) * 1.2), // 增加从0.8到1.2
                '员工宿舍': Math.ceil(totalAgents * 0.2)  // 增加从0.1到0.2
            },

            // 医疗建筑（降低人口阈值）
            medical: {
                '综合医院': Math.max(
                    Math.ceil(totalAgents / 500),  // 从1000降到500
                    Math.ceil((professionCounts['医生'] || 0) / 3)  // 从5降到3
                ),
                '专科医院': Math.max(
                    Math.ceil(totalAgents / 1000), // 从2000降到1000
                    Math.ceil((professionCounts['专科医生'] || 0) / 2)  // 从3降到2
                ),
                '社区诊所': Math.max(
                    Math.ceil(totalAgents / 200),  // 从500降到200
                    Math.ceil((professionCounts['全科医生'] || 0) / 2)
                )
            },

            // 商业建筑（降低人口阈值）
            commercial: {
                '商场': Math.max(
                    Math.ceil(totalAgents / 400),  // 从1000降到400
                    Math.ceil((professionCounts['店员'] || 0) / 5)  // 从8降到5
                ),
                '超市': Math.max(
                    Math.ceil(totalAgents / 200),  // 从500降到200
                    Math.ceil((professionCounts['收银员'] || 0) / 3)  // 从4降到3
                ),
                '便利店': Math.max(
                    Math.ceil(totalAgents / 100),  // 从200降到100
                    Math.ceil((professionCounts['店员'] || 0) / 2)
                ),
                '餐厅': Math.max(
                    Math.ceil(totalAgents / 150),  // 从300降到150
                    Math.ceil((professionCounts['厨师'] || 0) / 2)
                ),
                '咖啡厅': Math.max(
                    Math.ceil(totalAgents / 200),  // 从400降到200
                    Math.ceil((professionCounts['服务员'] || 0) / 2)  // 从3降到2
                )
            },

            // 娱乐设施（降低人口阈值）
            entertainment: {
                '电影院': Math.ceil(totalAgents / 1000),  // 从2000降到1000
                '体育馆': Math.ceil(totalAgents / 1500),  // 从3000降到1500
                '公园': Math.ceil(totalAgents / 500),     // 从1000降到500
                '游戏厅': Math.ceil(totalAgents / 800),   // 从1500降到800
                '健身房': Math.ceil(totalAgents / 500)    // 新增健身房
            },

            // 公共服务设施（降低人口阈值）
            public: {
                '警察局': Math.max(
                    Math.ceil(totalAgents / 1000),  // 从2000降到1000
                    Math.ceil((professionCounts['警察'] || 0) / 5)  // 从10降到5
                ),
                '消防局': Math.max(
                    Math.ceil(totalAgents / 1500),  // 从3000降到1500
                    Math.ceil((professionCounts['消防员'] || 0) / 4)  // 从8降到4
                ),
                '图书馆': Math.ceil(totalAgents / 1000),  // 从2000降到1000
                '公共厕所': Math.ceil(totalAgents / 200), // 从500降到200
                '政府机构': Math.ceil(totalAgents / 1000) // 新增政府机构
            },

            // 其他生活服务设施（降低人口阈值）
            service: {
                '银行': Math.max(
                    Math.ceil(totalAgents / 500),   // 从1000降到500
                    Math.ceil((professionCounts['银行职员'] || 0) / 3)  // 从5降到3
                ),
                '邮局': Math.ceil(totalAgents / 1000),   // 从2000降到1000
                '美容院': Math.ceil(totalAgents / 400),  // 从800降到400
                '健身房': Math.ceil(totalAgents / 500)   // 从1000降到500
            },

            // 工作场所（新增更多工作场所）
            workplace: {
                '写字楼': Math.max(
                    Math.ceil(totalAgents / 300),
                    Math.ceil((professionCounts['白领'] || 0) / 10)
                ),
                '科技园': Math.max(
                    Math.ceil(totalAgents / 400),
                    Math.ceil((professionCounts['程序员'] || 0) / 8)
                ),
                '工厂': Math.max(
                    Math.ceil(totalAgents / 500),
                    Math.ceil((professionCounts['工厂工人'] || 0) / 10)
                ),
                '研发中心': Math.max(
                    Math.ceil(totalAgents / 600),
                    Math.ceil((professionCounts['研发工程师'] || 0) / 5)
                )
            }
        };

        // 确保每种建筑物至少有2个（如果有对应的职业）
        Object.keys(requirements).forEach(category => {
            Object.keys(requirements[category]).forEach(buildingType => {
                if (this.hasProfessionForBuilding(buildingType, professionCounts)) {
                    requirements[category][buildingType] = Math.max(2, requirements[category][buildingType]);
                }
            });
        });

        console.log('建筑需求计算结果:', requirements);
        return requirements;
    }

    hasProfessionForBuilding(buildingType, professionCounts) {
        // 检查是否有对应职业的人
        const buildingWorkplaces = this.buildingManager.getBuildingProperties(buildingType)?.workplaces || [];
        return buildingWorkplaces.some(profession => (professionCounts[profession] || 0) > 0);
    }

    async initializeSystems() {
        console.log('初始化城市系统...');
        
        try {
            // 初始化基础系统
            await this.timeSystem.initialize();
            await this.weatherSystem.initialize();
            await this.economicSystem.initialize();
            await this.socialSystem.initialize();
            await this.eventSystem.initialize();
            
            // 初始化路径和缓存系统
            await this.pathSystem.initialize();
            await this.cacheManager.initialize();
            
            // 初始化UI系统
            await this.uiSystem.initialize();
            await this.miniMapSystem.initialize();
            
            console.log('系统初始化完成');
        } catch (error) {
            console.error('系统初始化失败:', error);
            throw error;
        }
    }

    initializeCanvas() {
        try {
            console.log('初始化画布...');
            
            // 获取画布元素
            this.canvas = document.getElementById('cityCanvas');
            if (!this.canvas) {
                throw new Error('找不到cityCanvas元素');
            }

            // 获取绘图上下文
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('无法获取2D绘图上下文');
            }

            // 设置画布尺寸为窗口大小
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            // 添加窗口大小改变事件监听
            window.addEventListener('resize', () => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.viewport.width = this.canvas.width;
                this.viewport.height = this.canvas.height;
                this.draw(); // 重新绘
            });

            // 设置画布样式
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.cursor = 'grab';

            console.log('画布初始化完成:', {
                width: this.canvas.width,
                height: this.canvas.height
            });
        } catch (error) {
            console.error('画布初始化失败:', error);
            throw error;
        }
    }

    setDimensions(sizeOption) {
        console.log('设置城市尺寸:', sizeOption);
        
        // 根据选项设置城市尺寸
        switch(sizeOption) {
            case 'small':
                this.width = 3000;
                this.height = 2000;
                break;
            case 'large':
                this.width = 6000;
                this.height = 4000;
                break;
            case 'medium':
            default:
                this.width = 4000;
                this.height = 3000;
        }

        // 设置区块大小
        this.blockSize = 100;
        this.gridCols = Math.floor(this.width / this.blockSize);
        this.gridRows = Math.floor(this.height / this.blockSize);

        // 设置区域大小
        this.districtSize = {
            width: Math.floor(this.width / 4),
            height: Math.floor(this.height / 4)
        };

        console.log('城市尺寸已设置:', {
            width: this.width,
            height: this.height,
            gridSize: `${this.gridCols}x${this.gridRows}`,
            districtSize: this.districtSize
        });
    }

    setupMouseControls() {
        // 鼠标按下事件
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.dragStartX = this.viewport.x;
            this.dragStartY = this.viewport.y;
            this.canvas.style.cursor = 'grabbing';
        });

        // 鼠标移动事件
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const dx = (e.clientX - this.lastMouseX) / this.zoomLevel;
            const dy = (e.clientY - this.lastMouseY) / this.zoomLevel;

            this.viewport.x = this.dragStartX - dx;
            this.viewport.y = this.dragStartY - dy;

            // 限制视口范围
            this.clampViewport();
        });

        // 鼠标松开事件
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });

        // 鼠标离开事件
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });

        // 鼠标滚轮缩放事件
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // 计算鼠标在世界坐标中的位置
            const worldX = this.viewport.x + mouseX / this.zoomLevel;
            const worldY = this.viewport.y + mouseY / this.zoomLevel;

            // 计算新的缩放级别
            const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(0.5, Math.min(4, this.zoomLevel * zoomDelta));

            // 更新缩放级别
            this.zoomLevel = newZoom;

            // 调整视口位置以保持鼠标指向的点不变
            this.viewport.x = worldX - mouseX / this.zoomLevel;
            this.viewport.y = worldY - mouseY / this.zoomLevel;

            // 限制视口范围
            this.clampViewport();
        });

        // 设置初始鼠标样式
        this.canvas.style.cursor = 'grab';
    }

    clampViewport() {
        // 确保视口不会超出城市边界
        const maxX = Math.max(0, this.width - this.viewport.width / this.zoomLevel);
        const maxY = Math.max(0, this.height - this.viewport.height / this.zoomLevel);

        this.viewport.x = Math.max(0, Math.min(this.viewport.x, maxX));
        this.viewport.y = Math.max(0, Math.min(this.viewport.y, maxY));
    }

    draw() {
        try {
            // 清空画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 绘制背景
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 保存当前状态
            this.ctx.save();
            
            // 应用缩放和平移变换
            this.ctx.scale(this.zoomLevel, this.zoomLevel);
            this.ctx.translate(-this.viewport.x, -this.viewport.y);
            
            // 按顺序绘制各个元素
            this.drawRoads();
            this.drawDistricts();
            this.drawBuildings();
            this.drawAgents();
            
            // 恢复状态
            this.ctx.restore();
        } catch (error) {
            console.error('绘制错误:', error);
        }
    }

    initializeCoreSystems() {
        console.log('开始初始化核心系统...');
        
        try {
            // 初始化建筑管理器
            this.buildingManager = new BuildingManager();
            
            // 初始化时间系统
            this.timeSystem = new TimeSystem();
            
            // 初始化天气系统
            if (this.config.weatherEnabled) {
                this.weatherSystem = new WeatherSystem();
            }
            
            // 始化经济系统
            this.economicSystem = new EconomicSystem();
            
            // 初始化社交系统
            this.socialSystem = new SocialSystem(this);
            
            // 初始化事件系统
            this.eventSystem = new EventSystem();
            
            // 初始化路径系统
            this.pathSystem = new PathSystem(this);
            
            // 初始化UI系统
            this.uiSystem = new UISystem(this);
            
            // 初始化小地图系统
            this.miniMapSystem = new MiniMapSystem(this);
            
            // 初始化缓存管理器
            this.cacheManager = new CacheManager(this);

            console.log('核心系统初始化完成');
            return true;
        } catch (error) {
            console.error('核心系统初始化失败:', error);
            throw error;
        }
    }

    initializePerformanceMonitoring() {
        try {
            console.log('初始化性能监控...');
            
            // 性能统计数据
            this.performanceStats = {
                fps: 0,
                frameTime: 0,
                updateTime: 0,
                renderTime: 0,
                agentUpdateTime: 0,
                pathfindingTime: 0,
                lastUpdate: performance.now(),
                frameCount: 0,
                memoryUsage: {
                    total: 0,
                    used: 0
                }
            };

            // 帧率监控
            this.fpsHistory = new Array(60).fill(0);
            this.fpsIndex = 0;

            // 性能监控间隔
            this.performanceMonitoringInterval = 1000; // 1秒更新一次
            this.lastPerformanceUpdate = performance.now();

            // 设置性能监控定时器
            setInterval(() => this.updatePerformanceStats(), this.performanceMonitoringInterval);

            // 添加性能警告阈值
            this.performanceThresholds = {
                minFps: 30,
                maxFrameTime: 33, // 约30fps
                maxMemoryUsage: 0.8 // 80%内存使用率
            };

            console.log('性能监控初始化完成');
            return true;
        } catch (error) {
            console.error('性能监控初始化失败:', error);
            throw error;
        }
    }

    updatePerformanceStats() {
        const now = performance.now();
        const deltaTime = now - this.lastPerformanceUpdate;

        // 更新FPS
        this.fpsHistory[this.fpsIndex] = 1000 / deltaTime;
        this.fpsIndex = (this.fpsIndex + 1) % this.fpsHistory.length;
        this.performanceStats.fps = this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length;

        // 更新内存使用情况
        if (window.performance && performance.memory) {
            this.performanceStats.memoryUsage = {
                total: performance.memory.totalJSHeapSize,
                used: performance.memory.usedJSHeapSize
            };
        }

        // 检查性能问题
        this.checkPerformanceIssues();

        // 更新时间戳
        this.lastPerformanceUpdate = now;

        // 记录性能数据
        if (this.performanceStats.fps < this.performanceThresholds.minFps) {
            console.warn('低帧率警告:', {
                fps: Math.round(this.performanceStats.fps),
                frameTime: Math.round(this.performanceStats.frameTime),
                memoryUsed: Math.round(this.performanceStats.memoryUsage.used / 1024 / 1024) + 'MB'
            });
        }
    }

    checkPerformanceIssues() {
        // 检查帧率
        if (this.performanceStats.fps < this.performanceThresholds.minFps) {
            this.handleLowFps();
        }

        // 检查内存使用
        if (this.performanceStats.memoryUsage.used / this.performanceStats.memoryUsage.total > 
            this.performanceThresholds.maxMemoryUsage) {
            this.handleHighMemoryUsage();
        }

        // 检查帧时间
        if (this.performanceStats.frameTime > this.performanceThresholds.maxFrameTime) {
            this.handleHighFrameTime();
        }
    }

    handleLowFps() {
        // 性能优化措施
        if (this.agents.length > 100) {
            // 降非视口内Agent的更新频率
            this.agents.forEach(agent => {
                if (!this.isInViewport(agent)) {
                    agent.updateInterval = 2; // 降低更新频率
                }
            });
        }
    }

    handleHighMemoryUsage() {
        // 内存优化措施
        this.cacheManager.cleanup();
        this.pathSystem.cleanupCache();
    }

    handleHighFrameTime() {
        // 帧时间优化措施
        this.reduceLOD(); // 降低细节级别
    }

    isInViewport(entity) {
        return entity.x >= this.viewport.x && 
               entity.x <= this.viewport.x + this.viewport.width &&
               entity.y >= this.viewport.y && 
               entity.y <= this.viewport.y + this.viewport.height;
    }

    reduceLOD() {
        // 根据距离降低细节级别
        const viewportCenter = {
            x: this.viewport.x + this.viewport.width/2,
            y: this.viewport.y + this.viewport.height/2
        };

        this.agents.forEach(agent => {
            const distance = Math.hypot(
                agent.x - viewportCenter.x,
                agent.y - viewportCenter.y
            );

            if (distance > this.viewport.width) {
                agent.renderDetail = 'low';
            } else if (distance > this.viewport.width/2) {
                agent.renderDetail = 'medium';
            } else {
                agent.renderDetail = 'high';
            }
        });
    }

    getPerformanceStats() {
        return {
            fps: Math.round(this.performanceStats.fps),
            frameTime: Math.round(this.performanceStats.frameTime),
            memoryUsage: {
                total: Math.round(this.performanceStats.memoryUsage.total / 1024 / 1024),
                used: Math.round(this.performanceStats.memoryUsage.used / 1024 / 1024)
            },
            agentCount: this.agents.length,
            buildingCount: this.buildings.length,
            pathfindingRequests: this.pathSystem?.pathRequests.length || 0
        };
    }

    async generateDistricts() {
        try {
            console.log('开始成城市区块...');
            
            // 定义区块大小和间距
            const districtSize = {
                width: 400,
                height: 300
            };
            
            // 减小区块间距
            const spacing = {
                x: 50,  // 原来可能是100或更大
                y: 30   // 原来可能是80或更大
            };

            // 计算网格布局
            const gridColumns = Math.floor(this.width / (districtSize.width + spacing.x));
            const gridRows = Math.floor(this.height / (districtSize.height + spacing.y));

            // 为了使区更中，计算起始偏移
            const startX = (this.width - (gridColumns * (districtSize.width + spacing.x) - spacing.x)) / 2;
            const startY = (this.height - (gridRows * (districtSize.height + spacing.y) - spacing.y)) / 2;

            // 生成区块
            for (let row = 0; row < gridRows; row++) {
                for (let col = 0; col < gridColumns; col++) {
                    // 计算区块位置（添加少许随机偏移以增加自然感）
                    const x = startX + col * (districtSize.width + spacing.x) + (Math.random() - 0.5) * spacing.x * 0.5;
                    const y = startY + row * (districtSize.height + spacing.y) + (Math.random() - 0.5) * spacing.y * 0.5;

                    // 确定区块类型（使用改进的分布算法）
                    const type = this.determineDistrictType(col, row, gridColumns, gridRows);

                    // 创建区块
                    this.districts.push({
                        x: x,
                        y: y,
                        width: districtSize.width,
                        height: districtSize.height,
                        type: type
                    });
                }
            }

            console.log(`成功生成 ${this.districts.length} 个城市区块`);
            return true;
        } catch (error) {
            console.error('生成城市区块失败:', error);
            return false;
        }
    }

    determineDistrictType(col, row, totalCols, totalRows) {
        // 改进的区块类型分配逻辑
        const position = {
            isCenter: col > totalCols * 0.3 && col < totalCols * 0.7 && 
                     row > totalRows * 0.3 && row < totalRows * 0.7,
            isEdge: col === 0 || col === totalCols - 1 || 
                    row === 0 || row === totalRows - 1,
            quadrant: {
                x: col < totalCols / 2 ? 'west' : 'east',
                y: row < totalRows / 2 ? 'north' : 'south'
            }
        };

        // 根据位置确定区块类型
        if (position.isCenter) {
            return Math.random() < 0.6 ? '商业区' : '办公区';
        } else if (position.isEdge) {
            return Math.random() < 0.7 ? '住宅区' : '公园';
        } else {
            const typeChances = {
                '住宅区': 0.4,
                '商业区': 0.2,
                '工业区': 0.15,
                '教育区': 0.15,
                '公园': 0.1
            };

            // 根据概率分配类型
            const rand = Math.random();
            let accumulator = 0;
            for (const [type, chance] of Object.entries(typeChances)) {
                accumulator += chance;
                if (rand < accumulator) return type;
            }
            return '住宅区'; // 默认类型
        }
    }

    async generateRoads() {
        console.log('生成道路网络...');

        // 生成主干道
        this.generateMainRoads();
        
        // 生成次要道路
        this.generateSecondaryRoads();
        
        // 生成建筑物连接道路
        await this.generateBuildingConnections();

        console.log(`生成了 ${this.roads.length} 条道路`);
    }

    generateMainRoads() {
        // 生成水平主干道
        for (let y = this.height * 0.25; y < this.height; y += this.height * 0.25) {
            this.roads.push(new Road(0, y, this.width, y));
        }

        // 生成垂直主干道
        for (let x = this.width * 0.25; x < this.width; x += this.width * 0.25) {
            this.roads.push(new Road(x, 0, x, this.height));
        }
    }

    generateSecondaryRoads() {
        const spacing = 200; // 次要道路间距

        // 生成水平次要道路
        for (let y = spacing; y < this.height; y += spacing) {
            if (y % (this.height * 0.25) !== 0) { // 避免主干道叠
                this.roads.push(new Road(0, y, this.width, y));
            }
        }

        // 生成垂直次要道路
        for (let x = spacing; x < this.width; x += spacing) {
            if (x % (this.width * 0.25) !== 0) { // 避免与主干道重叠
                this.roads.push(new Road(x, 0, x, this.height));
            }
        }
    }

    async generateBuildingConnections() {
        for (const building of this.buildings) {
            const nearestRoad = this.findNearestRoad(building);
            if (nearestRoad) {
                // 创建连接道路
                const buildingCenter = {
                    x: building.x + building.width / 2,
                    y: building.y + building.height / 2
                };

                const connectionPoint = this.findRoadConnectionPoint(buildingCenter, nearestRoad);
                this.roads.push(new Road(
                    buildingCenter.x,
                    buildingCenter.y,
                    connectionPoint.x,
                    connectionPoint.y
                ));
            }
        }
    }

    findNearestRoad(building) {
        let nearestRoad = null;
        let minDistance = Infinity;
        const buildingCenter = {
            x: building.x + building.width / 2,
            y: building.y + building.height / 2
        };

        for (const road of this.roads) {
            const distance = this.getDistanceToRoad(buildingCenter, road);
            if (distance < minDistance) {
                minDistance = distance;
                nearestRoad = road;
            }
        }

        return nearestRoad;
    }

    getDistanceToRoad(point, road) {
        if (road.startX === road.endX) { // 垂直道路
            const x = road.startX;
            const minY = Math.min(road.startY, road.endY);
            const maxY = Math.max(road.startY, road.endY);
            if (point.y >= minY && point.y <= maxY) {
                return Math.abs(point.x - x);
            }
        } else { // 水平道路
            const y = road.startY;
            const minX = Math.min(road.startX, road.endX);
            const maxX = Math.max(road.startX, road.endX);
            if (point.x >= minX && point.x <= maxX) {
                return Math.abs(point.y - y);
            }
        }
        return Infinity;
    }

    findRoadConnectionPoint(buildingCenter, road) {
        if (road.startX === road.endX) { // 垂直道路
            return {
                x: road.startX,
                y: buildingCenter.y
            };
        } else { // 水平道路
            return {
                x: buildingCenter.x,
                y: road.startY
            };
        }
    }

    isValidBuildingPosition(x, y, width, height) {
        // 检查是否在城市边界内
        if (x < 0 || x + width > this.width || y < 0 || y + height > this.height) {
            return false;
        }

        // 检查是否与其他建筑物重叠
        const margin = 20; // 建筑物之间的最小距离
        for (const building of this.buildings) {
            if (x + width + margin > building.x &&
                x - margin < building.x + building.width &&
                y + height + margin > building.y &&
                y - margin < building.y + building.height) {
                return false;
            }
        }

        // 检查否与道路重叠
        for (const road of this.roads) {
            const roadMargin = 10;
            if (road.startX === road.endX) { // 垂直道路
                if (x - roadMargin < road.startX && x + width + roadMargin > road.startX &&
                    y < Math.max(road.startY, road.endY) && y + height > Math.min(road.startY, road.endY)) {
                    return false;
                }
            } else { // 水平道路
                if (y - roadMargin < road.startY && y + height + roadMargin > road.startY &&
                    x < Math.max(road.startX, road.endX) && x + width > Math.min(road.startX, road.endX)) {
                    return false;
                }
            }
        }

        return true;
    }

    selectProfession(distribution) {
        // 检查布是否有效
        if (!distribution || Object.keys(distribution).length === 0) {
            console.warn('职业分布数据无效');
            return '市民';
        }

        // 验证概率总和是否接近1
        const totalProbability = Object.values(distribution).reduce((sum, prob) => sum + prob, 0);
        if (Math.abs(totalProbability - 1) > 0.1) {
            console.warn('职业分布概率总和不为1:', totalProbability);
        }

        // 使用轮盘赌选择算法
        const random = Math.random();
        let cumulativeProbability = 0;

        // 记录生成过程
        console.log('生成职业，随机值:', random);
        
        for (const [profession, probability] of Object.entries(distribution)) {
            cumulativeProbability += probability;
            console.log(`检查职业: ${profession}, 概率: ${probability}, 累计概率: ${cumulativeProbability}`);
            
            if (random <= cumulativeProbability) {
                console.log(`选择职业: ${profession}`);
                return profession;
            }
        }

        // 如果没有选中任何职业（不应该发生），返回默认职业
        console.warn('未能选择职业，使用默认职业: 市民');
        return '市民';
    }

    findValidAgentPosition(district) {
        const margin = 20;
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const x = district.x + margin + Math.random() * (district.width - margin * 2);
            const y = district.y + margin + Math.random() * (district.height - margin * 2);

            // 检查位置是否有效
            if (this.isValidAgentPosition(x, y)) {
                return { x, y };
            }

            attempts++;
        }

        console.warn(`无法在域 ${district.type} 找到有效的代理位置`);
        return null;
    }

    isValidAgentPosition(x, y) {
        // 检查是否在城市边界内
        if (x < 0 || x > this.width || y < 0 || y > this.height) {
            return false;
        }

        // 检查是否与建筑物重叠
        for (const building of this.buildings) {
            if (!building) continue;

            const margin = 5;
            if (x > building.x - margin && x < building.x + building.width + margin &&
                y > building.y - margin && y < building.y + building.height + margin) {
                return false;
            }
        }

        // 检查是否与道路重叠
        for (const road of this.roads) {
            if (!road) continue;

            const roadMargin = 2;
            if (road.startX === road.endX) { // 垂直道路
                if (Math.abs(x - road.startX) < roadMargin &&
                    y >= Math.min(road.startY, road.endY) &&
                    y <= Math.max(road.startY, road.endY)) {
                    return false;
                }
            } else { // 水平道路
                if (Math.abs(y - road.startY) < roadMargin &&
                    x >= Math.min(road.startX, road.endX) &&
                    x <= Math.max(road.startX, road.endX)) {
                    return false;
                }
            }
        }

        return true;
    }

    getAgentDistribution() {
        // 统计各类代理的数量和比例
        const distribution = {};
        const total = this.agents.length;

        // 计数每种职业
        this.agents.forEach(agent => {
            if (!distribution[agent.role]) {
                distribution[agent.role] = {
                    count: 0,
                    percentage: 0
                };
            }
            distribution[agent.role].count++;
        });

        // 计算百分比
        Object.keys(distribution).forEach(role => {
            distribution[role].percentage = 
                ((distribution[role].count / total) * 100).toFixed(1) + '%';
        });

        // 按数量排序
        const sortedDistribution = Object.fromEntries(
            Object.entries(distribution).sort((a, b) => b[1].count - a[1].count)
        );

        console.log('代理职业分布:', sortedDistribution);
        return sortedDistribution;
    }

    startUpdateLoop() {
        try {
            console.log('启动更新循环');
            
            // 设置更新态
            this.isRunning = true;
            this.lastUpdate = performance.now();
            
            // 定义更新函数
            const update = () => {
                if (!this.isRunning) return;

                try {
                    // 计算时间增量
                    const currentTime = performance.now();
                    const deltaTime = currentTime - this.lastUpdate;
                    this.lastUpdate = currentTime;

                    // 按顺序更新各个系统
                    if (this.timeSystem) {
                        this.timeSystem.update(deltaTime);
                    }

                    if (this.weatherSystem) {
                        this.weatherSystem.update(deltaTime);
                    }

                    if (this.economicSystem) {
                        this.economicSystem.update(deltaTime);
                    }

                    if (this.socialSystem) {
                        this.socialSystem.update(deltaTime);
                    }

                    if (this.eventSystem) {
                        this.eventSystem.update(deltaTime);
                    }

                    // 更新代理
                    if (Array.isArray(this.agents)) {
                        this.updateAgents(deltaTime);
                    }

                    // 更新路径系统
                    if (this.pathSystem) {
                        this.pathSystem.update(deltaTime);
                    }

                    // 更新UI系统
                    if (this.uiSystem) {
                        this.uiSystem.update(deltaTime);
                    }

                    // 更新小地图
                    if (this.miniMapSystem) {
                        this.miniMapSystem.update(deltaTime);
                    }

                    // 更新缓存管理器
                    if (this.cacheManager) {
                        this.cacheManager.update(deltaTime);
                    }

                    // 绘制场景
                    this.draw();

                    // 继续下一帧更新
                    requestAnimationFrame(update);

                } catch (error) {
                    console.error('更新循环错误:', error);
                    // 尝试恢复并继续
                    this.handleUpdateError(error);
                    requestAnimationFrame(update);
                }
            };

            // 启动更新循环
            requestAnimationFrame(update);
            console.log('更新循环已启动');

        } catch (error) {
            console.error('启动更新循环失败:', error);
            throw error;
        }
    }

    handleUpdateError(error) {
        console.error('处理更新错误:', error);
        
        try {
            // 记录错误
            if (this.eventSystem) {
                this.eventSystem.emit('SYSTEM_ERROR', {
                    type: 'UPDATE_ERROR',
                    error: error.message,
                    timestamp: Date.now()
                });
            }

            // 尝试重置关键状态
            this.resetErrorState();

        } catch (recoveryError) {
            console.error('错误恢复失败:', recoveryError);
        }
    }

    resetErrorState() {
        // 重置代理状态
        if (Array.isArray(this.agents)) {
            this.agents.forEach(agent => {
                if (agent) {
                    agent.currentTask = null;
                    agent.currentPath = null;
                    agent.targetBuilding = null;
                }
            });
        }

        // 清理路径缓存
        if (this.pathSystem) {
            this.pathSystem.pathCache.clear();
        }

        // 重置建筑物占用状态
        if (Array.isArray(this.buildings)) {
            this.buildings.forEach(building => {
                if (building) {
                    building.currentOccupants = new Set();
                }
            });
        }
    }

    stopUpdateLoop() {
        console.log('停止更新循环');
        this.isRunning = false;
    }

    updateAgents(deltaTime) {
        try {
            // 确保deltaTime有效
            if (!deltaTime || deltaTime < 0) {
                deltaTime = 16; // 约60fps
            }

            // 确保agents数组存在
            if (!Array.isArray(this.agents)) {
                console.warn('updateAgents: agents数组未就绪');
                return;
            }

            // 性能优化：只更新视口范围内或附近的代理
            const viewportMargin = 200; // 视口外的额外边���
            const visibleArea = {
                x: this.viewport.x - viewportMargin,
                y: this.viewport.y - viewportMargin,
                width: this.viewport.width / this.zoomLevel + viewportMargin * 2,
                height: this.viewport.height / this.zoomLevel + viewportMargin * 2
            };

            // 更新代理
            this.agents.forEach(agent => {
                if (!agent) return;

                try {
                    // 检查代理是否在视口范围或附近
                    const isNearViewport = (
                        agent.x >= visibleArea.x &&
                        agent.x <= visibleArea.x + visibleArea.width &&
                        agent.y >= visibleArea.y &&
                        agent.y <= visibleArea.y + visibleArea.height
                    );

                    // 如果在视口范围内，正常更新
                    if (isNearViewport) {
                        agent.update(deltaTime);
                    } else {
                        // 如果在视口范围外，使用简化更新
                        this.updateAgentSimplified(agent, deltaTime);
                    }

                } catch (error) {
                    console.error(`代理 ${agent.id} 更新失败:`, error);
                }
            });

            // 更新性能统计
            this.performanceStats.agentUpdateTime = performance.now() - this.lastUpdate;

        } catch (error) {
            console.error('代理更新失败:', error);
        }
    }

    updateAgentSimplified(agent, deltaTime) {
        // 简化的代理更新逻辑，用于视口范围外的代理
        try {
            // 只更新基本需求和状态
            if (agent.needs) {
                Object.keys(agent.needs).forEach(need => {
                    const decayRate = agent.needsDecayRate[need] || 0.01;
                    agent.needs[need] = Math.max(0, Math.min(100,
                        agent.needs[need] - decayRate * deltaTime / 1000
                    ));
                });
            }

            // 简化的移动逻辑
            if (agent.targetBuilding) {
                const dx = agent.targetBuilding.x - agent.x;
                const dy = agent.targetBuilding.y - agent.y;
                const distance = Math.hypot(dx, dy);
                
                if (distance > 5) {
                    const speed = agent.speed * deltaTime / 1000;
                    agent.x += (dx / distance) * speed;
                    agent.y += (dy / distance) * speed;
                    agent.direction = Math.atan2(dy, dx);
                }
            } else {
                // 随机漫步
                if (Math.random() < 0.02) {
                    agent.direction += (Math.random() - 0.5) * Math.PI / 2;
                }
                
                const speed = agent.speed * deltaTime / 1000;
                const moveX = Math.cos(agent.direction) * speed;
                const moveY = Math.sin(agent.direction) * speed;
                
                // 简单的边界检查
                const newX = agent.x + moveX;
                const newY = agent.y + moveY;
                
                if (newX > 0 && newX < this.width && newY > 0 && newY < this.height) {
                    agent.x = newX;
                    agent.y = newY;
                } else {
                    agent.direction += Math.PI;
                }
            }

        } catch (error) {
            console.error(`代理 ${agent.id} 简化更新失败:`, error);
        }
    }

    isAgentVisible(agent) {
        return (
            agent.x >= this.viewport.x &&
            agent.x <= this.viewport.x + this.viewport.width / this.zoomLevel &&
            agent.y >= this.viewport.y &&
            agent.y <= this.viewport.y + this.viewport.height / this.zoomLevel
        );
    }

    drawRoads() {
        if (!Array.isArray(this.roads)) return;
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        
        this.roads.forEach(road => {
            if (road && road.draw) {
                road.draw(this.ctx);
            } else if (road) {
                // 如果road对象没有draw方法，使用基本绘制
                this.ctx.beginPath();
                this.ctx.moveTo(road.startX, road.startY);
                this.ctx.lineTo(road.endX, road.endY);
                this.ctx.stroke();
            }
        });
    }

    drawDistricts() {
        if (!Array.isArray(this.districts)) return;
        
        this.ctx.globalAlpha = 0.1;
        this.districts.forEach(district => {
            if (!district) return;

            // 获取区域颜色
            const categoryInfo = this.buildingManager.getCategoryInfo(district.type);
            this.ctx.fillStyle = categoryInfo?.color || '#666';
            
            // 绘制区域
            this.ctx.fillRect(
                district.x,
                district.y,
                district.width,
                district.height
            );

            // 如果缩放级别足够大，显示区域名称
            if (this.zoomLevel > 0.5) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    categoryInfo?.name || district.type,
                    district.x + district.width/2,
                    district.y + district.height/2
                );
            }
        });
        this.ctx.globalAlpha = 1;
    }

    drawBuildings() {
        if (!Array.isArray(this.buildings)) return;
        
        this.buildings.forEach(building => {
            if (!building) return;

            // 获取建筑物属性
            const props = this.buildingManager.getBuildingProperties(building.type);
            if (!props) return;

            // 绘制建筑物主体
            this.ctx.fillStyle = props.color;
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            
            this.ctx.fillRect(
                building.x,
                building.y,
                building.width,
                building.height
            );
            this.ctx.strokeRect(
                building.x,
                building.y,
                building.width,
                building.height
            );

            // 如果缩放级别足够大，显示建筑物名称和状态
            if (this.zoomLevel > 0.7) {
                // 绘制建筑物名称
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                
                // 添加半透明背景以提高可读性
                const text = props.name;
                const textWidth = this.ctx.measureText(text).width;
                const textHeight = 12;
                const padding = 4;
                
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(
                    building.x + building.width/2 - textWidth/2 - padding,
                    building.y + building.height/2 - textHeight/2 - padding,
                    textWidth + padding * 2,
                    textHeight + padding * 2
                );
                
                // 绘制文本
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillText(
                    text,
                    building.x + building.width/2,
                    building.y + building.height/2 + 4
                );

                // 显示占用情况
                if (building.currentOccupants) {
                    const occupancyText = `${building.currentOccupants.size}/${building.capacity}`;
                    const occTextWidth = this.ctx.measureText(occupancyText).width;
                    
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.fillRect(
                        building.x + building.width/2 - occTextWidth/2 - padding,
                        building.y + building.height/2 + textHeight - padding,
                        occTextWidth + padding * 2,
                        textHeight + padding * 2
                    );
                    
                    this.ctx.fillStyle = building.currentOccupants.size >= building.capacity ? 
                        '#ff4444' : '#44ff44';
                    this.ctx.fillText(
                        occupancyText,
                        building.x + building.width/2,
                        building.y + building.height/2 + textHeight + 8
                    );
                }
            }
        });
    }

    drawAgents() {
        if (!Array.isArray(this.agents)) return;
        
        this.agents.forEach(agent => {
            if (!agent) return;

            // 保存当前绘图状态
            this.ctx.save();
            
            // 1. 绘制Agent主体
            const agentSize = 6;
            this.ctx.beginPath();
            this.ctx.arc(agent.x, agent.y, agentSize, 0, Math.PI * 2);
            
            // 根据角色设置颜色
            const roleColors = {
                '市民': '#4CAF50',  // 绿色
                '学生': '#2196F3',  // 蓝色
                '工人': '#FF9800',  // 橙色
                '商人': '#9C27B0',  // 紫色
                'AI助手': '#F44336' // 红色
            };
            this.ctx.fillStyle = roleColors[agent.role] || '#FFFFFF';
            this.ctx.fill();
            
            // 2. 绘制方向指示器
            this.ctx.beginPath();
            this.ctx.moveTo(agent.x, agent.y);
            this.ctx.lineTo(
                agent.x + Math.cos(agent.direction) * (agentSize + 4),
                agent.y + Math.sin(agent.direction) * (agentSize + 4)
            );
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // 3. 如果缩放级别足够大，显示Agent信息
            if (this.zoomLevel > 0.7) {
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = '#FFFFFF';
                
                // 添加文本背景
                const text = `${agent.role} (${agent.state})`;
                const textWidth = this.ctx.measureText(text).width;
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(
                    agent.x - textWidth/2 - 4,
                    agent.y + agentSize + 4,
                    textWidth + 8,
                    20
                );
                
                // 绘制文本
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillText(text, agent.x, agent.y + agentSize + 18);
            }

            // 恢复绘图状态
            this.ctx.restore();
        });
    }

    getDistrictAgentRatio(district) {
        // 根据区域类型返回该区域应该容纳的代理比例
        const ratios = {
            '住宅区': 0.8,    // 住宅区容纳80%的代理
            '商业区': 0.1,    // 商业区容纳10%的代理
            '公共区': 0.05,   // 公共区容纳5%的代理
            '工业区': 0.03,   // 工业区容纳3%的代理
            '教育区': 0.01,   // 教育区容纳1%的代理
            '办公区': 0.01,   // 办公区容纳1%的代理
        };

        // 如果找不到对应的比，返回一个默认值
        const ratio = ratios[district.type] || 0.01;

        // 根据区域容量调整比例
        const districtCapacity = this.calculateDistrictCapacity(district);
        const totalCapacity = this.calculateMaxAgentCapacity();
        const capacityRatio = districtCapacity / totalCapacity;

        // 返回调整后的比例（考虑容量因素）
        return Math.min(ratio, capacityRatio);
    }

    getBuildingTypesForDistrict(districtType, requiredBuildings) {
        // 根据区域类型和需求返回应该建造的建筑物类型及数量
        const buildingTypes = new Map();

        switch (districtType) {
            case '住宅区':
                if (requiredBuildings.residential) {
                    Object.entries(requiredBuildings.residential).forEach(([type, count]) => {
                        buildingTypes.set(type, count);
                    });
                }
                break;

            case '医疗区':
                if (requiredBuildings.medical) {
                    Object.entries(requiredBuildings.medical).forEach(([type, count]) => {
                        buildingTypes.set(type, count);
                    });
                }
                break;

            case '教育区':
                if (requiredBuildings.education) {
                    Object.entries(requiredBuildings.education).forEach(([type, count]) => {
                        buildingTypes.set(type, count);
                    });
                }
                break;

            case '商业区':
                // 合并商业和金融建筑
                if (requiredBuildings.commercial) {
                    Object.entries(requiredBuildings.commercial).forEach(([type, count]) => {
                        buildingTypes.set(type, count);
                    });
                }
                if (requiredBuildings.service) {
                    Object.entries(requiredBuildings.service).forEach(([type, count]) => {
                        buildingTypes.set(type, count);
                    });
                }
                break;

            case '科技区':
                if (requiredBuildings.tech) {
                    Object.entries(requiredBuildings.tech).forEach(([type, count]) => {
                        buildingTypes.set(type, count);
                    });
                }
                break;

            case '工业区':
                if (requiredBuildings.industrial) {
                    Object.entries(requiredBuildings.industrial).forEach(([type, count]) => {
                        buildingTypes.set(type, count);
                    });
                }
                break;

            case '文化区':
                if (requiredBuildings.cultural) {
                    Object.entries(requiredBuildings.cultural).forEach(([type, count]) => {
                        buildingTypes.set(type, count);
                    });
                }
                break;

            case '公共区':
                if (requiredBuildings.public) {
                    Object.entries(requiredBuildings.public).forEach(([type, count]) => {
                        buildingTypes.set(type, count);
                    });
                }
                break;

            case '服务区':
                if (requiredBuildings.service) {
                    Object.entries(requiredBuildings.service).forEach(([type, count]) => {
                        buildingTypes.set(type, count);
                    });
                }
                break;
        }

        // 打印调试信息
        console.log(`区域 ${districtType} 的建筑分配:`, Object.fromEntries(buildingTypes));

        return buildingTypes;
    }

    getRandomPosition() {
        try {
            // 获取所有住宅区
            const residentialDistricts = this.districts.filter(d => d.type === '住宅区');
            
            if (residentialDistricts.length === 0) {
                console.warn('没有找到住宅区，使用随机位置');
                return {
                    x: Math.random() * this.width,
                    y: Math.random() * this.height
                };
            }

            // 随机选择一个住宅区
            const district = residentialDistricts[
                Math.floor(Math.random() * residentialDistricts.length)
            ];

            // 在住宅区内生成随机位置
            const margin = 20; // 与边界保持一定距离
            const x = district.x + margin + Math.random() * (district.width - margin * 2);
            const y = district.y + margin + Math.random() * (district.height - margin * 2);

            // 验证位置是否有效
            if (this.isValidAgentPosition(x, y)) {
                return { x, y };
            }

            // 如果位置无效，尝试找到附近的有效位置
            for (let attempts = 0; attempts < 10; attempts++) {
                const newX = x + (Math.random() - 0.5) * 50;
                const newY = y + (Math.random() - 0.5) * 50;
                
                if (this.isValidAgentPosition(newX, newY)) {
                    return { x: newX, y: newY };
                }
            }

            // 如果还是找不到，返回原始位置
            console.warn('无法找到有效的代理生成位置');
            return { x, y };

        } catch (error) {
            console.error('生成随机位置失败:', error);
            // 返回默认位置
            return {
                x: this.width / 2,
                y: this.height / 2
            };
        }
    }

    async generateDistrictBuildings(district, buildingTypes) {
        console.log(`在${district.type}中生成建筑物...`);

        // 遍历需要生成的建筑物类型及其数量
        for (const [buildingType, count] of buildingTypes) {
            for (let i = 0; i < count; i++) {
                // 获取建筑物属性
                const buildingProps = this.buildingManager.getBuildingProperties(buildingType);
                if (!buildingProps) {
                    console.warn(`未找到建筑物类型 ${buildingType} 的属性定义`);
                    continue;
                }

                // 尝试在区域内找到合适的位置
                const position = this.findBuildingPosition(
                    district,
                    buildingProps.size.width,
                    buildingProps.size.height
                );

                if (!position) {
                    console.warn(`在${district.type}中无法为${buildingType}找到合适的位置`);
                    continue;
                }

                // 创建建筑物
                const building = {
                    x: position.x,
                    y: position.y,
                    width: buildingProps.size.width,
                    height: buildingProps.size.height,
                    type: buildingType,
                    capacity: buildingProps.capacity,
                    openTime: buildingProps.openTime,
                    closeTime: buildingProps.closeTime,
                    currentOccupants: new Set(),
                    details: {
                        name: buildingProps.name,
                        category: buildingProps.category,
                        workplaces: buildingProps.workplaces,
                        status: '正常'
                    }
                };

                this.buildings.push(building);
                console.log(`生成建筑物: ${buildingType} at (${position.x}, ${position.y})`);
            }
        }
    }

    findBuildingPosition(district, width, height) {
        const margin = 20; // 建筑物间的最小间距
        const maxAttempts = 50; // 最大尝试次数

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // 在区域内随机选择一个位置
            const x = district.x + margin + 
                     Math.random() * (district.width - width - margin * 2);
            const y = district.y + margin + 
                     Math.random() * (district.height - height - margin * 2);

            // 检查位置是否合适
            if (this.isValidBuildingPosition(x, y, width, height)) {
                return { x, y };
            }
        }

        // 如果找不到合适的位置，返回null
        return null;
    }

    chooseBestBuilding(buildings, agent) {
        if (!buildings || buildings.length === 0) {
            return null;
        }

        // 计算每个建筑物的得分
        const buildingScores = buildings.map(building => {
            let score = 0;

            // 距离评分（越近分数越高）
            const distance = Math.hypot(
                building.x + building.width/2 - agent.x,
                building.y + building.height/2 - agent.y
            );
            score -= distance / 100;

            // 容量评分（剩余容量越多分数越高）
            if (building.capacity) {
                const occupancyRate = building.currentOccupants.size / building.capacity;
                score += (1 - occupancyRate) * 10;
            }

            // 工作场所匹配度（如果是工作场所）
            if (building.details?.workplaces?.includes(agent.role)) {
                score += 20;
            }

            // 建筑物状态评分
            if (building.details?.status === '正常') {
                score += 5;
            }

            return { building, score };
        });

        // 返回得分最高的建筑物
        buildingScores.sort((a, b) => b.score - a.score);
        return buildingScores[0].building;
    }
} 