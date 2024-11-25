class PathSystem {
    constructor(city) {
        this.city = city;
        this.pathCache = new Map();
        this.gridSize = 40;
        this.grid = null;
        this.lastGridUpdate = 0;
        this.gridUpdateInterval = 5000;
        
        // 分层网格系统
        this.highLevelGrid = null;
        this.highLevelGridSize = 80;
        
        // 路径请求队列
        this.pathRequests = [];
        this.maxPathsPerFrame = 5;
        this.processingInterval = 50;
        
        // 分区缓存
        this.zoneCache = new Map();
        this.zoneSize = 200;
    }

    initialize() {
        try {
            console.log('初始化寻路系统...');

            // 初始化网格
            this.initializeGrids();
            
            // 初始化分区
            this.initializeZones();
            
            // 初始化路径缓存
            this.pathCache.clear();
            
            // 清空路径请求队列
            this.pathRequests = [];
            
            // 设置更新定时器
            this.setupUpdateInterval();

            console.log('寻路系统初始化完成:', {
                gridSize: this.gridSize,
                zoneSize: this.zoneSize,
                gridDimensions: this.grid ? 
                    `${this.grid.length}x${this.grid[0].length}` : 'not initialized'
            });

            return true;
        } catch (error) {
            console.error('寻路系统初始化失败:', error);
            throw error;
        }
    }

    setupUpdateInterval() {
        // 清除可能存在的旧定时器
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // 设置新的更新定时器
        this.updateTimer = setInterval(() => {
            this.update();
        }, this.processingInterval);

        console.log('寻路系统更新定时器已设置:', {
            interval: this.processingInterval,
            maxPathsPerFrame: this.maxPathsPerFrame
        });
    }

    update() {
        const now = Date.now();
        
        // 更新网格
        if (now - this.lastGridUpdate > this.gridUpdateInterval) {
            this.updateGrids();
            this.lastGridUpdate = now;
        }

        // 处理路径请求
        this.processPathRequests();

        // 清理过期的缓存
        this.cleanupCache();
    }

    updateGrids() {
        try {
            // 更新基础网格
            this.updateBaseGrid();
            // 更新高层网格
            this.updateHighLevelGrid();
            // 更新区域缓存
            this.updateZoneCache();
        } catch (error) {
            console.error('更新网格时出错:', error);
        }
    }

    updateBaseGrid() {
        // 确保city和buildings数组存在
        if (!this.city || !Array.isArray(this.city.buildings)) {
            console.warn('updateBaseGrid: city或buildings数组未就绪');
            return;
        }

        // 重置网格
        const rows = Math.ceil(this.city.height / this.gridSize);
        const cols = Math.ceil(this.city.width / this.gridSize);
        this.grid = Array(rows).fill().map(() => Array(cols).fill(0));

        // 标记建筑物占据的格子
        this.city.buildings.forEach(building => {
            if (!building) return;

            const startRow = Math.floor(building.y / this.gridSize);
            const endRow = Math.ceil((building.y + building.height) / this.gridSize);
            const startCol = Math.floor(building.x / this.gridSize);
            const endCol = Math.ceil((building.x + building.width) / this.gridSize);

            for (let row = startRow; row < endRow && row < rows; row++) {
                for (let col = startCol; col < endCol && col < cols; col++) {
                    if (row >= 0 && col >= 0) {
                        this.grid[row][col] = 1;
                    }
                }
            }
        });

        // 标记道路
        this.city.roads.forEach(road => {
            if (!road) return;

            // 对于垂直道路
            if (road.startX === road.endX) {
                const col = Math.floor(road.startX / this.gridSize);
                const startRow = Math.floor(Math.min(road.startY, road.endY) / this.gridSize);
                const endRow = Math.ceil(Math.max(road.startY, road.endY) / this.gridSize);

                for (let row = startRow; row < endRow && row < rows; row++) {
                    if (row >= 0 && col >= 0 && col < cols) {
                        this.grid[row][col] = 2; // 2表示道路
                    }
                }
            }
            // 对于水平道路
            else if (road.startY === road.endY) {
                const row = Math.floor(road.startY / this.gridSize);
                const startCol = Math.floor(Math.min(road.startX, road.endX) / this.gridSize);
                const endCol = Math.ceil(Math.max(road.startX, road.endX) / this.gridSize);

                for (let col = startCol; col < endCol && col < cols; col++) {
                    if (row >= 0 && col >= 0 && row < rows) {
                        this.grid[row][col] = 2; // 2表示道路
                    }
                }
            }
        });

        console.log('基础网格更新完成:', {
            dimensions: `${rows}x${cols}`,
            gridSize: this.gridSize
        });
    }

    updateHighLevelGrid() {
        if (!this.grid) {
            console.warn('updateHighLevelGrid: 基础网格未初始化');
            return;
        }

        const rows = Math.ceil(this.grid.length / 2);
        const cols = Math.ceil(this.grid[0].length / 2);
        this.highLevelGrid = Array(rows).fill().map(() => Array(cols).fill(0));

        // 根据基础网格更新高层网格
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const baseRow = row * 2;
                const baseCol = col * 2;
                let blockedCount = 0;

                // 检查2x2的基础网格区域
                for (let r = 0; r < 2; r++) {
                    for (let c = 0; c < 2; c++) {
                        if (this.grid[baseRow + r]?.[baseCol + c] === 1) {
                            blockedCount++;
                        }
                    }
                }

                // 如果超过一半的格子被阻塞，则标记为阻塞
                this.highLevelGrid[row][col] = blockedCount >= 2 ? 1 : 0;
            }
        }

        console.log('高层网格更新完成:', {
            dimensions: `${rows}x${cols}`,
            gridSize: this.highLevelGridSize
        });
    }

    updateZoneCache() {
        if (!this.grid) {
            console.warn('updateZoneCache: 网格未初始化');
            return;
        }

        // 更新每个区域的可通行性和路点
        for (const [key, zone] of this.zoneCache.entries()) {
            const [row, col] = key.split(',').map(Number);
            zone.walkable = this.isZoneWalkable(row, col);
            zone.waypoints = this.calculateZoneWaypoints(row, col);
        }

        console.log('区域缓存更新完成:', {
            zoneCount: this.zoneCache.size,
            zoneSize: this.zoneSize
        });
    }

    isZoneWalkable(zoneRow, zoneCol) {
        const startRow = zoneRow * (this.zoneSize / this.gridSize);
        const startCol = zoneCol * (this.zoneSize / this.gridSize);
        const size = this.zoneSize / this.gridSize;
        let blockedCount = 0;

        for (let r = startRow; r < startRow + size; r++) {
            for (let c = startCol; c < startCol + size; c++) {
                if (this.grid[r]?.[c] === 1) {
                    blockedCount++;
                }
            }
        }

        // 如果超过30%的格子被阻塞，则认为该区域不可通行
        return blockedCount / (size * size) < 0.3;
    }

    calculateZoneWaypoints(zoneRow, zoneCol) {
        const waypoints = [];
        const zoneX = zoneCol * this.zoneSize;
        const zoneY = zoneRow * this.zoneSize;

        // 在区域边界上添加路点
        for (let offset = this.gridSize; offset < this.zoneSize; offset += this.gridSize * 2) {
            // 上边界
            if (this.isPointWalkable(zoneX + offset, zoneY)) {
                waypoints.push({x: zoneX + offset, y: zoneY});
            }
            // 下边界
            if (this.isPointWalkable(zoneX + offset, zoneY + this.zoneSize)) {
                waypoints.push({x: zoneX + offset, y: zoneY + this.zoneSize});
            }
            // 左边界
            if (this.isPointWalkable(zoneX, zoneY + offset)) {
                waypoints.push({x: zoneX, y: zoneY + offset});
            }
            // 右边界
            if (this.isPointWalkable(zoneX + this.zoneSize, zoneY + offset)) {
                waypoints.push({x: zoneX + this.zoneSize, y: zoneY + offset});
            }
        }

        return waypoints;
    }

    cleanupCache() {
        const now = Date.now();
        // 清理超过30秒的缓存路径
        for (const [key, value] of this.pathCache.entries()) {
            if (now - value.timestamp > 30000) {
                this.pathCache.delete(key);
            }
        }
    }

    initializeGrids() {
        try {
            // 使用city的宽度和高度，而不是canvas的
            const cityWidth = this.city.width || 3200;  // 默认值
            const cityHeight = this.city.height || 2400; // 默认值

            // 初始化基础网格
            const cols = Math.ceil(cityWidth / this.gridSize);
            const rows = Math.ceil(cityHeight / this.gridSize);
            
            if (!Number.isFinite(cols) || !Number.isFinite(rows) || 
                cols <= 0 || rows <= 0) {
                throw new Error('网格尺寸计算错误');
            }

            this.grid = Array(rows).fill().map(() => Array(cols).fill(0));
            
            // 初始化高层网格
            const highCols = Math.ceil(cols / 2);
            const highRows = Math.ceil(rows / 2);
            
            if (!Number.isFinite(highCols) || !Number.isFinite(highRows) || 
                highCols <= 0 || highRows <= 0) {
                throw new Error('高层网格尺寸计算错误');
            }

            this.highLevelGrid = Array(highRows).fill().map(() => Array(highCols).fill(0));

            console.log('网格初始化成功:', {
                baseGrid: `${rows}x${cols}`,
                highLevelGrid: `${highRows}x${highCols}`,
                citySize: `${cityWidth}x${cityHeight}`
            });
        } catch (error) {
            console.error('网格初始化失败:', error);
            // 设置默认网格
            this.grid = Array(30).fill().map(() => Array(40).fill(0));
            this.highLevelGrid = Array(15).fill().map(() => Array(20).fill(0));
        }
    }

    initializeZones() {
        try {
            const cityWidth = this.city.width || 3200;
            const cityHeight = this.city.height || 2400;
            
            const zones = new Map();
            const zoneRows = Math.ceil(cityHeight / this.zoneSize);
            const zoneCols = Math.ceil(cityWidth / this.zoneSize);
            
            if (!Number.isFinite(zoneRows) || !Number.isFinite(zoneCols) || 
                zoneRows <= 0 || zoneCols <= 0) {
                throw new Error('分区尺寸计算错误');
            }

            for (let row = 0; row < zoneRows; row++) {
                for (let col = 0; col < zoneCols; col++) {
                    const zoneKey = `${row},${col}`;
                    zones.set(zoneKey, {
                        walkable: true,
                        buildings: new Set(),
                        waypoints: [],
                        bounds: {
                            x: col * this.zoneSize,
                            y: row * this.zoneSize,
                            width: this.zoneSize,
                            height: this.zoneSize
                        }
                    });
                }
            }
            
            this.zoneCache = zones;
            console.log('分区初始化成功:', {
                zones: `${zoneRows}x${zoneCols}`,
                zoneSize: this.zoneSize
            });
        } catch (error) {
            console.error('分区初始化失败:', error);
            // 设置默认分区
            this.zoneCache = new Map();
        }
    }

    findPath(start, end) {
        // 1. 检查缓存
        const cacheKey = this.getCacheKey(start, end);
        const cachedPath = this.pathCache.get(cacheKey);
        if (cachedPath && Date.now() - cachedPath.timestamp < 30000) { // 30秒缓存
            return Promise.resolve(cachedPath.path);
        }

        // 2. 检查是否是短距离路径
        const distance = Math.hypot(end.x - start.x, end.y - start.y);
        if (distance < 200) { // 短距离直接使用简单寻路
            return Promise.resolve(this.findDirectPath(start, end));
        }

        // 3. 添加到请求队列
        return new Promise((resolve) => {
            this.pathRequests.push({
                start,
                end,
                cacheKey,
                resolve,
                priority: this.calculatePathPriority(start, end)
            });
        });
    }

    findDirectPath(start, end) {
        // 简单的直线路径，带有基本的障碍物避让
        const path = [start];
        let current = {...start};
        const stepSize = 40;
        
        while (Math.hypot(end.x - current.x, end.y - current.y) > stepSize) {
            const angle = Math.atan2(end.y - current.y, end.x - current.x);
            const nextX = current.x + Math.cos(angle) * stepSize;
            const nextY = current.y + Math.sin(angle) * stepSize;
            
            if (this.isPointWalkable(nextX, nextY)) {
                current = {x: nextX, y: nextY};
                path.push(current);
            } else {
                // 简单的障碍物避让
                const alternativePoint = this.findAlternativePoint(current, end);
                if (alternativePoint) {
                    current = alternativePoint;
                    path.push(current);
                } else {
                    break;
                }
            }
        }
        
        path.push(end);
        return path;
    }

    findAlternativePoint(current, target) {
        // 在周围8个方向寻找可行点
        const angles = [
            Math.PI/4, -Math.PI/4, Math.PI/2, -Math.PI/2,
            3*Math.PI/4, -3*Math.PI/4, Math.PI, 0
        ];
        const stepSize = this.gridSize;
        
        for (const angle of angles) {
            const x = current.x + Math.cos(angle) * stepSize;
            const y = current.y + Math.sin(angle) * stepSize;
            if (this.isPointWalkable(x, y)) {
                return {x, y};
            }
        }
        return null;
    }

    processPathRequests() {
        // 按优先级排序请求
        this.pathRequests.sort((a, b) => b.priority - a.priority);
        
        // 每帧只处理限定数量的请求
        const batch = this.pathRequests.splice(0, this.maxPathsPerFrame);
        
        batch.forEach(request => {
            const path = this.calculateHierarchicalPath(request.start, request.end);
            this.cacheResult(request.cacheKey, path);
            request.resolve(path);
        });
    }

    calculateHierarchicalPath(start, end) {
        // 1. 获取起点和终点所在的区域
        const startZone = this.getZone(start);
        const endZone = this.getZone(end);
        
        // 2. 如果在同一区域，使用详细寻路
        if (startZone === endZone) {
            return this.findDetailedPath(start, end);
        }
        
        // 3. 否则使用分层寻路
        const zonePath = this.findZonePath(startZone, endZone);
        return this.refinePath(zonePath, start, end);
    }

    findZonePath(startZone, endZone) {
        // 使用A*在区域级别寻找路径
        // 这里使用简化版的A*，因为区域数量远少于网格数量
        // ...实现区域级别的A*算法
        return [];
    }

    refinePath(zonePath, start, end) {
        // 将粗略的���域路径细化���实际路径点
        const detailedPath = [start];
        
        for (let i = 0; i < zonePath.length - 1; i++) {
            const zoneWaypoints = this.getZoneWaypoints(zonePath[i], zonePath[i + 1]);
            detailedPath.push(...zoneWaypoints);
        }
        
        detailedPath.push(end);
        return this.smoothPath(detailedPath);
    }

    smoothPath(path) {
        if (path.length < 3) return path;
        
        const smoothed = [path[0]];
        let current = 0;
        
        while (current < path.length - 1) {
            let furthest = current + 1;
            
            // 寻找可以直接到达的最远点
            for (let i = current + 2; i < path.length; i++) {
                if (this.canMoveDirect(path[current], path[i])) {
                    furthest = i;
                }
            }
            
            smoothed.push(path[furthest]);
            current = furthest;
        }
        
        return smoothed;
    }

    canMoveDirect(start, end) {
        // 使用射线检测检查两点间是否可以直接移动
        const steps = Math.ceil(Math.hypot(end.x - start.x, end.y - start.y) / 40);
        for (let i = 1; i < steps; i++) {
            const x = start.x + (end.x - start.x) * (i / steps);
            const y = start.y + (end.y - start.y) * (i / steps);
            if (!this.isPointWalkable(x, y)) {
                return false;
            }
        }
        return true;
    }

    isPointWalkable(x, y) {
        // 获取网格坐标
        const row = Math.floor(y / this.gridSize);
        const col = Math.floor(x / this.gridSize);
        
        // 检查是否在网格范围内
        if (row < 0 || row >= this.grid.length || 
            col < 0 || col >= this.grid[0].length) {
            return false;
        }

        // 0表示可通行，1表示建筑物，2表示道路
        return this.grid[row][col] !== 1;
    }

    calculatePathPriority(start, end) {
        // 计算路径请求的优先级
        const distance = Math.hypot(end.x - start.x, end.y - start.y);
        return 1000 / distance; // 短距离路径优先级更高
    }

    getZone(point) {
        // 计算点所在的区域坐标
        const zoneRow = Math.floor(point.y / this.zoneSize);
        const zoneCol = Math.floor(point.x / this.zoneSize);
        return `${zoneRow},${zoneCol}`;
    }

    getCacheKey(start, end) {
        // 创建一个唯一的缓存键，包含起点和终点的坐标
        // 为了避免浮点数精度问题，将坐标四舍五入到整数
        const startX = Math.round(start.x);
        const startY = Math.round(start.y);
        const endX = Math.round(end.x);
        const endY = Math.round(end.y);
        return `${startX},${startY}-${endX},${endY}`;
    }

    cacheResult(key, path) {
        // 缓存路径结果
        this.pathCache.set(key, {
            path: path,
            timestamp: Date.now()
        });
    }

    findDetailedPath(start, end) {
        // 使用A*算法在网格级别寻找路径
        const openSet = new Set([this.gridToKey(this.pointToGrid(start))]);
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const startGrid = this.pointToGrid(start);
        const endGrid = this.pointToGrid(end);
        const startKey = this.gridToKey(startGrid);
        
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startGrid, endGrid));

        while (openSet.size > 0) {
            // 找到f值最小的节点
            let currentKey = this.getLowestFScore(openSet, fScore);
            let current = this.keyToGrid(currentKey);

            // 如果到达目标
            if (this.isAtGoal(current, endGrid)) {
                return this.reconstructPath(cameFrom, current, start, end);
            }

            openSet.delete(currentKey);

            // 检查相邻节点
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborKey = this.gridToKey(neighbor);
                const tentativeGScore = gScore.get(currentKey) + 
                    this.getDistance(current, neighbor);

                if (!gScore.has(neighborKey) || 
                    tentativeGScore < gScore.get(neighborKey)) {
                    
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(neighborKey, tentativeGScore + 
                        this.heuristic(neighbor, endGrid));

                    openSet.add(neighborKey);
                }
            }
        }

        // 如果找不到路径，返回直线路径
        return [start, end];
    }

    pointToGrid(point) {
        return {
            x: Math.floor(point.x / this.gridSize),
            y: Math.floor(point.y / this.gridSize)
        };
    }

    gridToKey(grid) {
        return `${grid.x},${grid.y}`;
    }

    keyToGrid(key) {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
    }

    getLowestFScore(openSet, fScore) {
        return Array.from(openSet)
            .reduce((lowest, key) => 
                !lowest || fScore.get(key) < fScore.get(lowest) ? key : lowest
            );
    }

    isAtGoal(current, goal) {
        return current.x === goal.x && current.y === goal.y;
    }

    getNeighbors(grid) {
        const neighbors = [];
        const directions = [
            {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1},
            {x: -1, y: -1}, {x: -1, y: 1}, {x: 1, y: -1}, {x: 1, y: 1}
        ];

        for (const dir of directions) {
            const neighbor = {
                x: grid.x + dir.x,
                y: grid.y + dir.y
            };

            // 检查是否在地图范围内
            if (this.isValidGrid(neighbor)) {
                // 检查是否可通行
                if (this.grid[neighbor.y]?.[neighbor.x] === 0) {
                    // 如果是对角线移动，检查两个相邻格子是否都可通行
                    if (dir.x !== 0 && dir.y !== 0) {
                        if (this.grid[grid.y][neighbor.x] === 0 && 
                            this.grid[neighbor.y][grid.x] === 0) {
                            neighbors.push(neighbor);
                        }
                    } else {
                        neighbors.push(neighbor);
                    }
                }
            }
        }

        return neighbors;
    }

    isValidGrid(grid) {
        return grid.x >= 0 && grid.x < this.grid[0].length &&
               grid.y >= 0 && grid.y < this.grid.length;
    }

    getDistance(a, b) {
        // 使用欧几里得距离
        return Math.hypot(b.x - a.x, b.y - a.y);
    }

    heuristic(a, b) {
        // 使用欧几里得距离作为启发式函数
        return Math.hypot(b.x - a.x, b.y - a.y);
    }

    reconstructPath(cameFrom, current, start, end) {
        const path = [end];
        let currentKey = this.gridToKey(current);
        
        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            currentKey = this.gridToKey(current);
            path.unshift({
                x: (current.x + 0.5) * this.gridSize,
                y: (current.y + 0.5) * this.gridSize
            });
        }
        
        path.unshift(start);
        return this.smoothPath(path);
    }
} 