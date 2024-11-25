class MiniMapSystem {
    constructor(city) {
        this.city = city;
        this.canvas = null;
        this.ctx = null;
        this.scale = 0.1; // 缩放比例
        this.width = 200;  // 小地图宽度
        this.height = 150; // 小地图高度
        this.margin = 10;  // 边距
        this.isVisible = true;
        this.isDragging = false;
        this.lastUpdate = 0;
        this.updateInterval = 500; // 更新间隔（毫秒）
    }

    initialize() {
        try {
            console.log('初始化小地图系统...');
            
            // 创建小地图画布
            this.createMiniMapCanvas();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 初始化缓存
            this.initializeCache();
            
            // 执行首次渲染
            this.render();
            
            console.log('小地图系统初始化完成');
            return true;
        } catch (error) {
            console.error('小地图系统初始化失败:', error);
            throw error;
        }
    }

    createMiniMapCanvas() {
        // 创建小地图容器
        const container = document.createElement('div');
        container.id = 'miniMapContainer';
        container.style.cssText = `
            position: fixed;
            bottom: ${this.margin}px;
            left: ${this.margin}px;
            width: ${this.width}px;
            height: ${this.height}px;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid #333;
            border-radius: 5px;
            z-index: 1000;
        `;

        // 创建小地图画布
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
        `;

        // 获取绘图上下文
        this.ctx = this.canvas.getContext('2d');

        // 添加到容器
        container.appendChild(this.canvas);
        document.body.appendChild(container);
    }

    setupEventListeners() {
        // 添加拖动功能
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // 添加缩放功能
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        
        // 添加显示/隐藏功能
        document.addEventListener('keydown', (e) => {
            if (e.key === 'm') {
                this.toggleVisibility();
            }
        });
    }

    initializeCache() {
        // 初始化建筑物缓存
        this.buildingCache = new Map();
        
        // 初始化区域缓存
        this.districtCache = new Map();
        
        // 初始化道路缓存
        this.roadCache = new Map();
    }

    onMouseDown(e) {
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.scale;
        const y = (e.clientY - rect.top) / this.scale;
        
        // 更新主视图位置
        this.city.viewport.x = x * (this.city.width / this.width);
        this.city.viewport.y = y * (this.city.height / this.height);
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.scale;
        const y = (e.clientY - rect.top) / this.scale;
        
        // 更新主视图位置
        this.city.viewport.x = x * (this.city.width / this.width);
        this.city.viewport.y = y * (this.city.height / this.height);
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale = Math.max(0.05, Math.min(0.5, this.scale * delta));
        this.render();
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        const container = document.getElementById('miniMapContainer');
        if (container) {
            container.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    update() {
        const now = Date.now();
        if (now - this.lastUpdate > this.updateInterval) {
            this.render();
            this.lastUpdate = now;
        }
    }

    render() {
        if (!this.ctx || !this.isVisible) return;

        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 绘制背景
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 计算缩放比例
        const scaleX = this.width / this.city.width;
        const scaleY = this.height / this.city.height;

        // 绘制道路
        this.renderRoads(scaleX, scaleY);

        // 绘制建筑物
        this.renderBuildings(scaleX, scaleY);

        // 绘制代理
        this.renderAgents(scaleX, scaleY);

        // 绘制视口框
        this.renderViewport(scaleX, scaleY);
    }

    renderRoads(scaleX, scaleY) {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        this.city.roads.forEach(road => {
            this.ctx.beginPath();
            this.ctx.moveTo(road.startX * scaleX, road.startY * scaleY);
            this.ctx.lineTo(road.endX * scaleX, road.endY * scaleY);
            this.ctx.stroke();
        });
    }

    renderBuildings(scaleX, scaleY) {
        this.city.buildings.forEach(building => {
            this.ctx.fillStyle = building.color || '#666';
            this.ctx.fillRect(
                building.x * scaleX,
                building.y * scaleY,
                building.width * scaleX,
                building.height * scaleY
            );
        });
    }

    renderAgents(scaleX, scaleY) {
        this.ctx.fillStyle = '#fff';
        const agentSize = 2;
        
        this.city.agents.forEach(agent => {
            this.ctx.beginPath();
            this.ctx.arc(
                agent.x * scaleX,
                agent.y * scaleY,
                agentSize,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }

    renderViewport(scaleX, scaleY) {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            this.city.viewport.x * scaleX,
            this.city.viewport.y * scaleY,
            this.city.viewport.width * scaleX,
            this.city.viewport.height * scaleY
        );
    }
} 