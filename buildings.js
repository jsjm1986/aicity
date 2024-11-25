class Building {
    constructor(x, y, width, height, type, details = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;

        // 使用BuildingManager获取建筑物属性
        const buildingManager = new BuildingManager();
        const properties = buildingManager.getBuildingProperties(type);
        
        this.details = {
            name: details.name || this.generateName(type),
            capacity: details.capacity || properties?.capacity || 50,
            level: details.level || 1,
            openTime: details.openTime || properties?.openTime || '08:00',
            closeTime: details.closeTime || properties?.closeTime || '22:00',
            category: properties?.category || 'other',
            satisfies: properties?.satisfies || [],
            ...details
        };

        // 根据建筑类型设置门的位置
        this.setupDoors();

        // 建筑物的碰撞区域
        this.bounds = {
            left: this.x,
            right: this.x + width,
            top: this.y,
            bottom: this.y + height
        };

        // 当前建筑物内的agents
        this.currentOccupants = new Set();
    }

    setupDoors() {
        // 根据建筑类型设置不同的门位置
        switch(this.type) {
            case '商店':
            case '医院':
                // 前门和后门
                this.doors = [
                    {
                        x: this.x + this.width / 2,
                        y: this.y + this.height,
                        width: 15,
                        height: 5,
                        type: '主门'
                    },
                    {
                        x: this.x + this.width / 2,
                        y: this.y,
                        width: 10,
                        height: 5,
                        type: '后门'
                    }
                ];
                break;
            case '学校':
                // 多个入口
                this.doors = [
                    {
                        x: this.x + this.width / 3,
                        y: this.y + this.height,
                        width: 15,
                        height: 5,
                        type: '学生入口'
                    },
                    {
                        x: this.x + (2 * this.width) / 3,
                        y: this.y + this.height,
                        width: 15,
                        height: 5,
                        type: '教师入口'
                    }
                ];
                break;
            case '公园':
                // 四个方向都有入口
                this.doors = [
                    { x: this.x + this.width/2, y: this.y, width: 20, height: 5, type: '北门' },
                    { x: this.x + this.width/2, y: this.y + this.height, width: 20, height: 5, type: '南门' },
                    { x: this.x, y: this.y + this.height/2, width: 5, height: 20, type: '西门' },
                    { x: this.x + this.width, y: this.y + this.height/2, width: 5, height: 20, type: '东门' }
                ];
                break;
            default:
                // 默认一个门
                this.doors = [{
                    x: this.x + this.width / 2,
                    y: this.y + this.height,
                    width: 10,
                    height: 5,
                    type: '主门'
                }];
        }
    }

    generateName(type) {
        const prefixes = {
            // 商业建筑
            '购物中心': ['万达', '银泰', '龙湖', '印象城', '大悦城'],
            '超市': ['沃尔玛', '家乐福', '大润发', '永辉', '盒马'],
            '便利店': ['全家', '7-11', '罗森', '快客', '喜士多'],
            '餐厅': ['外婆家', '海底捞', '真功夫', '必胜客', '肯德基'],
            '咖啡厅': ['星巴克', '瑞幸', '太平洋', 'Costa', '连咖啡'],
            
            // 医疗建筑
            '综合医院': ['仁和', '同济', '协和', '民', '中心'],
            '诊所': ['康复', '仁爱', '和平', '健康', '阳光'],
            '药店': ['国大', '海王', '大参林', '益丰', '老百姓'],
            
            // 教育建筑
            '大学': ['复旦', '交大', '浙大', '南大', '清华'],
            '中学': ['实验', '第一', '育才', '新华', '光明'],
            '小学': ['实验', '育才', '启明', '阳光', '希望'],
            '幼儿园': ['红黄蓝', '金色摇篮', '博苑', '天才', '快乐'],
            '图书馆': ['市立', '区立', '少年', '科技', '文化'],
            
            // 娱乐设施
            '电影院': ['万达', 'CGV', '博纳', '金逸', '横店'],
            '健身房': ['威尔士', '中航', '���沙', '乐刻', '超级猩猩'],
            '游泳馆': ['奥体', '市民', '康体', '体育', '水立方'],
            '公园': ['人民', '中央', '文化', '和平', '友谊'],
            '体育场': ['奥体', '市民', '体育', '运动', '全民'],
            
            // 住宅建筑
            '高层住宅': ['康城', '绿洲', '阳光', '和谐', '幸福'],
            '别墅区': ['翡翠', '玫瑰', '香榭', '碧桂园', '绿城'],
            '公寓': ['世贸', '星城', '时代', '未来', '国际'],
            
            // 政府机构
            '警察局': ['城东', '城西', '城南', '城北', '中心'],
            '消防局': ['特勤', '城区', '开发区', '新区', '高新'],
            '市政厅': ['市政', '行政', '市民', '政务', '服务'],
            
            // 金融机构
            '银行': ['工商', '建设', '农业', '中国', '交通'],
            '证券所': ['国泰', '华泰', '中信', '广发', '招商'],
            
            // 交通设施
            '地铁站': ['中心', '市民', '文化', '体育', '大学'],
            '公交站': ['中心', '医院', '学校', '商圈', '居民'],
            '停车场': ['市政', '商业', '公共', '地下', '立体']
        };

        const prefix = prefixes[type] ? 
            prefixes[type][Math.floor(Math.random() * prefixes[type].length)] : 
            '';
        
        return `${prefix}${type}`;
    }

    getDefaultCapacity(type) {
        const capacities = {
            // 商业建筑
            '购物中心': 1000,
            '超市': 300,
            '便利店': 30,
            '餐厅': 100,
            '咖啡厅': 50,
            
            // 医疗建筑
            '综合医院': 500,
            '诊所': 50,
            '药店': 30,
            
            // 教育建筑
            '大学': 5000,
            '中学': 2000,
            '小学': 1000,
            '幼儿园': 200,
            '图书馆': 300,
            
            // 娱乐设施
            '电影院': 300,
            '健身房': 100,
            '游泳馆': 150,
            '公园': 1000,
            '体育场': 5000,
            
            // 住宅建筑
            '高层住宅': 500,
            '别墅区': 100,
            '公寓': 200,
            
            // 政府机构
            '警察局': 100,
            '消防局': 50,
            '市政厅': 200,
            
            // 金融机构
            '银行': 100,
            '证券所': 50,
            
            // 交通设施
            '地铁站': 1000,
            '公���站': 50,
            '停车场': 200
        };
        return capacities[type] || 50;
    }

    draw(ctx) {
        // 绘制建筑物主体
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.fillStyle = this.getColorByType();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
        ctx.stroke();

        // 绘制建筑物特征
        this.drawBuildingFeatures(ctx);

        // 绘制门
        this.drawDoors(ctx);

        // 绘制建筑标签
        this.drawLabels(ctx);
    }

    drawBuildingFeatures(ctx) {
        switch(this.type) {
            case '高层住宅':
            case '公寓':
                this.drawHighRise(ctx);
                break;
            case '别墅':
                this.drawVilla(ctx);
                break;
            case '商店':
            case '便利店':
                this.drawShop(ctx);
                break;
            case '购物中心':
                this.drawMall(ctx);
                break;
            case '医院':
            case '诊所':
                this.drawHospital(ctx);
                break;
            case '学校':
            case '大学':
                this.drawSchool(ctx);
                break;
            case '公园':
                this.drawPark(ctx);
                break;
            case '餐厅':
                this.drawRestaurant(ctx);
                break;
            case '银行':
                this.drawBank(ctx);
                break;
            case '警察局':
                this.drawPoliceStation(ctx);
                break;
            // 新增建筑类型
            case '地铁站':
                this.drawSubwayStation(ctx);
                break;
            case '写字楼':
                this.drawOfficeBuilding(ctx);
                break;
            case '工厂':
                this.drawFactory(ctx);
                break;
            case '博物馆':
                this.drawMuseum(ctx);
                break;
            case '体育场':
                this.drawStadium(ctx);
                break;
            case '图书馆':
                this.drawLibrary(ctx);
                break;
            case '酒店':
                this.drawHotel(ctx);
                break;
            case '消防局':
                this.drawFireStation(ctx);
                break;
            case '市政厅':
                this.drawCityHall(ctx);
                break;
            // 添加新的建筑类型
            case '会展中心':
                this.drawExhibitionCenter(ctx);
                break;
            case '科技园':
                this.drawTechPark(ctx);
                break;
            case '物流中心':
                this.drawLogisticsCenter(ctx);
                break;
            case '研发中心':
                this.drawResearchCenter(ctx);
                break;
            case '展览馆':
                this.drawExhibitionHall(ctx);
                break;
            case '保险公司':
                this.drawInsuranceCompany(ctx);
                break;
            case '投资公司':
                this.drawInvestmentCompany(ctx);
                break;
            case '税务局':
                this.drawTaxOffice(ctx);
                break;
            case '法院':
                this.drawCourt(ctx);
                break;
            case '专科医院':
                this.drawSpecialtyHospital(ctx);
                break;
            case '康复中心':
                this.drawRehabCenter(ctx);
                break;
            case '急救中心':
                this.drawEmergencyCenter(ctx);
                break;
            case '培训中心':
                this.drawTrainingCenter(ctx);
                break;
            case '游戏厅':
                this.drawArcade(ctx);
                break;
            case '夜总会':
                this.drawNightclub(ctx);
                break;
            case '中层住宅':
                this.drawMidRiseBuilding(ctx);
                break;
            case '学生宿舍':
                this.drawDormitory(ctx);
                break;
            case '老年公寓':
                this.drawSeniorApartment(ctx);
                break;
        }
    }

    drawHighRise(ctx) {
        // 绘制窗户
        const windowSize = 10;
        const windowSpacing = 20;
        for (let x = this.x + 20; x < this.x + this.width - 10; x += windowSpacing) {
            for (let y = this.y + 20; y < this.y + this.height - 10; y += windowSpacing) {
                ctx.fillStyle = Math.random() > 0.3 ? '#FFEB3B' : '#333';
                ctx.fillRect(x, y, windowSize, windowSize);
            }
        }

        // 绘制屋顶
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width/2, this.y - 20);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.fillStyle = '#8D6E63';
        ctx.fill();
    }

    drawVilla(ctx) {
        // 绘制屋顶
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width/2, this.y - 30);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.fillStyle = '#8D6E63';
        ctx.fill();

        // 绘制窗户
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 20, this.y + 30, 30, 30);
        ctx.fillRect(this.x + this.width - 50, this.y + 30, 30, 30);

        // 绘制花园
        this.drawGarden(ctx);
    }

    drawGarden(ctx) {
        // 绘制草地
        ctx.fillStyle = '#81C784';
        ctx.fillRect(this.x, this.y + this.height, this.width, 20);

        // 绘制花朵
        const flowerColors = ['#FF69B4', '#FFB6C1', '#FFA07A'];
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            ctx.arc(this.x + 10 + i * 20, this.y + this.height + 10, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawShop(ctx) {
        // 绘制招牌
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x - 5, this.y - 10, this.width + 10, 15);
        
        // 绘制橱窗
        ctx.fillStyle = '#B3E5FC';
        ctx.fillRect(this.x + 10, this.y + 20, this.width - 20, this.height/2);
        
        // 绘制商品展示
        this.drawProducts(ctx);
    }

    drawProducts(ctx) {
        const products = ['📱', '👕', '👟', '🎮', '📚'];
        ctx.font = '12px Arial';
        products.forEach((product, i) => {
            ctx.fillText(product, this.x + 15 + i * 20, this.y + 40);
        });
    }

    drawMall(ctx) {
        // 绘制主体建筑
        ctx.fillStyle = '#B3E5FC';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制玻璃幕墙效果
        for (let y = this.y + 20; y < this.y + this.height; y += 30) {
            ctx.beginPath();
            ctx.strokeStyle = '#81D4FA';
            ctx.moveTo(this.x, y);
            ctx.lineTo(this.x + this.width, y);
            ctx.stroke();
        }

        // 绘制logo
        ctx.font = '20px Arial';
        ctx.fillStyle = '#1976D2';
        ctx.fillText('MALL', this.x + this.width/2 - 25, this.y + 30);
    }

    drawHospital(ctx) {
        // 绘制医院标志
        ctx.fillStyle = '#FF5252';
        ctx.fillRect(this.x + this.width/2 - 15, this.y - 20, 30, 30);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + this.width/2 - 10, this.y - 15, 20, 20);
        
        // 绘制十字
        ctx.fillStyle = '#FF5252';
        ctx.fillRect(this.x + this.width/2 - 2, this.y - 12, 4, 14);
        ctx.fillRect(this.x + this.width/2 - 7, this.y - 7, 14, 4);

        // 绘制窗户
        this.drawWindows(ctx);
    }

    drawSchool(ctx) {
        // 绘制主楼
        ctx.fillStyle = '#FFB74D';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制钟楼
        ctx.fillStyle = '#F57C00';
        ctx.fillRect(this.x + this.width/2 - 15, this.y - 30, 30, 40);

        // 绘制时钟
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y - 10, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }

    drawPark(ctx) {
        // 绘制草地
        ctx.fillStyle = '#81C784';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制树木
        const treePositions = [
            {x: this.x + 30, y: this.y + 30},
            {x: this.x + this.width - 30, y: this.y + 30},
            {x: this.x + 30, y: this.y + this.height - 30},
            {x: this.x + this.width - 30, y: this.y + this.height - 30},
            {x: this.x + this.width/2, y: this.y + this.height/2}
        ];

        treePositions.forEach(pos => {
            this.drawTree(ctx, pos.x, pos.y);
        });

        // 绘制小路
        ctx.beginPath();
        ctx.strokeStyle = '#795548';
        ctx.lineWidth = 3;
        ctx.moveTo(this.x + 20, this.y + 20);
        ctx.quadraticCurveTo(
            this.x + this.width/2, 
            this.y + this.height/2,
            this.x + this.width - 20, 
            this.y + this.height - 20
        );
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    drawTree(ctx, x, y) {
        // 树干
        ctx.fillStyle = '#795548';
        ctx.fillRect(x - 3, y - 15, 6, 15);
        
        // 树冠
        ctx.beginPath();
        ctx.fillStyle = '#2E7D32';
        ctx.arc(x, y - 25, 12, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRestaurant(ctx) {
        // 绘制招牌
        ctx.fillStyle = '#FF5722';
        ctx.fillRect(this.x - 5, this.y - 15, this.width + 10, 20);
        
        // 绘制餐具图标
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('🍽️', this.x + 5, this.y);
        
        // 绘制窗户
        this.drawWindows(ctx);
    }

    drawBank(ctx) {
        // 绘制希腊柱式风格
        const columnWidth = 10;
        const columnSpacing = 20;
        
        for (let x = this.x + 10; x < this.x + this.width - 10; x += columnSpacing) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, this.y + 20, columnWidth, this.height - 30);
        }

        // 绘制屋顶三角形
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width/2, this.y - 20);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.fillStyle = '#B0BEC5';
        ctx.fill();
    }

    drawPoliceStation(ctx) {
        // 绘制主体
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制警徽
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 30, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#1565C0';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // 绘制警灯
        this.drawPoliceLights(ctx);
    }

    drawPoliceLights(ctx) {
        const time = Date.now();
        const isRedLight = Math.floor(time / 500) % 2 === 0;
        
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y - 10, 5, 0, Math.PI * 2);
        ctx.fillStyle = isRedLight ? '#FF0000' : '#333333';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x + this.width - 20, this.y - 10, 5, 0, Math.PI * 2);
        ctx.fillStyle = isRedLight ? '#333333' : '#0000FF';
        ctx.fill();
    }

    drawWindows(ctx) {
        const windowSize = 15;
        const windowSpacing = 25;
        ctx.fillStyle = '#B3E5FC';
        
        for (let x = this.x + 20; x < this.x + this.width - 20; x += windowSpacing) {
            for (let y = this.y + 30; y < this.y + this.height - 20; y += windowSpacing) {
                ctx.fillRect(x, y, windowSize, windowSize);
                ctx.strokeRect(x, y, windowSize, windowSize);
            }
        }
    }

    drawLabels(ctx) {
        // 绘制建筑名称
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(this.details.name, this.x + 5, this.y + 15);

        // 绘制容量信息
        ctx.font = '10px Arial';
        ctx.fillText(
            `${this.currentOccupants.size}/${this.details.capacity}`,
            this.x + 5, this.y + 30
        );

        // 绘制营业状态
        const currentTime = this.city?.timeSystem?.getTimeString();
        if (currentTime) {
            const isOpen = this.isOpen(currentTime);
            ctx.fillStyle = isOpen ? '#4CAF50' : '#f44336';
            ctx.fillText(
                isOpen ? '营业中' : '已关闭',
                this.x + 5, this.y + 45
            );
        }
    }

    isOpen(currentTime) {
        if (this.type === '公园' || this.type === '住宅区') return true;
        return currentTime >= this.details.openTime && 
               currentTime <= this.details.closeTime;
    }

    getColorByType() {
        const colors = {
            // 商业建筑
            '购物中心': '#FF9999',
            '超市': '#FFB366',
            '便利店': '#FFE5CC',
            '餐厅': '#FF99CC',
            '咖啡厅': '#CC9966',
            '商店': '#FFB6C1',
            '写字楼': '#87CEEB',
            '商业广场': '#DDA0DD',
            '小吃街': '#FF7F50',    // 新增：珊瑚色
            '服装店': '#FFB6C1',    // 新增：浅粉色
            '电器店': '#B0C4DE',    // 新增：浅钢蓝色
            
            // 医疗建筑
            '综合医院': '#FF6666',
            '专科院': '#FF7777',
            '诊所': '#FF9999',
            '药店': '#FFCCCC',
            '康复中心': '#FFB6B6',
            '急救中心': '#FF8080',
            '医院': '#FF4444',
            
            // 教育建筑
            '大学': '#99FF99',
            '中学': '#CCFFCC',
            '小学': '#E5FFE5',
            '幼儿园': '#FFFF99',
            '图书馆': '#FFE5CC',
            '培训中心': '#98FB98',
            '学校': '#90EE90',
            
            // 娱乐设施
            '电影院': '#9999FF',
            '游戏厅': '#A0A0FF',
            '健身房': '#99FFFF',
            '游泳馆': '#66B2FF',
            '公园': '#90EE90',
            '体育场': '#98FB98',
            '夜总会': '#DDA0DD',
            '音乐厅': '#B0C4DE',
            '剧院': '#9370DB',
            
            // 住宅建筑
            '高层住宅': '#FFE4B5',
            '中层住宅': '#F5DEB3',
            '别墅': '#DEB887',
            '公寓': '#F5DEB3',
            '学生宿舍': '#FFDAB9',
            '老年公寓': '#FFE4C4',
            '住宅区': '#FFE4B5',
            
            // 政府机构
            '警察局': '#CCCCCC',
            '消防局': '#FF6347',
            '市政厅': '#B8860B',
            '法院': '#DAA520',
            '税务局': '#BDB76B',
            
            // 金融机构
            '银行': '#FFD700',
            '证券交易所': '#F0E68C',
            '证券所': '#DAA520',
            '保险公司': '#F0E68C',
            '投资公司': '#EEE8AA',
            
            // 交通设施
            '地铁站': '#A9A9A9',
            '公交站': '#D3D3D3',
            '停车场': '#696969',
            '出租车站': '#808080',
            
            // 文化设施
            '博物馆': '#DEB887',
            '艺术馆': '#D2B48C',
            '展览馆': '#BC8F8F',
            '展览心': '#BC8F8F',
            
            // 工业建筑
            '工厂': '#778899',
            '仓库': '#708090',
            '物流中心': '#6A5ACD',
            '研发中心': '#483D8B',
            
            // 特殊建筑
            '酒店': '#B8860B',
            '会展中心': '#9932CC',
            '科技园': '#6A5ACD',
            
            // 新增建筑
            '创业园': '#9ACD32',
            '文创园': '#BA55D3',
            '体育中心': '#3CB371',
            '养老院': '#DEB887',
            '美术馆': '#CD853F',
            '电视台': '#4169E1',
            '广播站': '#20B2AA',
            '邮局': '#CD853F',
            '垃圾处理站': '#696969',
            '变电站': '#708090',
            '水�������': '#4682B4',
            '加油站': '#CD5C5C',
            '充电站': '#32CD32',
            
            // 新增商业建筑
            '百货商场': '#FF69B4',   // 热粉色
            '专卖店': '#FFB6C1',    // 浅粉红
            '商业街': '#FF8C69',    // 鲑鱼色
            
            // 新增服务设施
            '美容院': '#FFB5C5',    // 浅粉色
            '理发店': '#FFA07A',    // 浅鲑鱼色
            '洗衣店': '#87CEFA',    // 浅天蓝色
            '维修店': '#A0522D',    // 赭色
            '快递中心': '#CD853F',  // 秘鲁色
            
            // 新增文化娱乐
            '网吧': '#4682B4',      // 钢蓝色
            'KTV': '#9932CC',       // ��兰花色
            '保龄球馆': '#8B4513',  // 马鞍棕色
            
            // 新增教育设施
            '职业学校': '#98FB98',  // 浅绿色
            '艺术学校': '#DDA0DD',  // 梅红色
            '技术学院': '#87CEEB',   // 天蓝色
            
            // 新增运动设施
            '健身中心': '#32CD32',    // 浅绿色
            '训练中心': '#3CB371',    // 中绿色
            '体育馆': '#228B22',      // 深绿色
            '运动场': '#98FB98',      // 淡绿色
            
            // 新增办公设施
            '设计工作室': '#9370DB',  // 中紫色
            '创意园': '#BA55D3',      // 深紫色
            '办公室': '#DDA0DD',      // 浅紫色
            '工作室': '#D8BFD8',      // 淡紫色
            
            // 新增商业设施
            '商务中心': '#4682B4',    // 钢蓝色
            '创业空间': '#5F9EA0',    // 军蓝色
            '孵化器': '#6495ED',      // 矢车菊蓝
            
            // 新增文化设施
            '创意空间': '#FF69B4',    // 热粉色
            '文创园区': '#FF1493',    // 深粉色
            '艺术中心': '#DB7093',    // 古老玫瑰色
            
            // 新增教育设施
            '培训室': '#98FB98',      // 浅绿色
            '教育中心': '#90EE90',    // 淡绿色
            '学习中心': '#3CB371',    // 中绿色
            
            // 新增医疗设施
            '康复中心': '#FF8C69',    // 深鲑鱼色
            '保健站': '#FFA07A',      // 浅鲑鱼���
            '医疗中心': '#FA8072',    // 鲑鱼色
            
            // 新增生活服务
            '生活馆': '#DEB887',      // 实木色
            '服务中心': '#D2B48C',    // 茶色
            '便民站': '#BC8F8F',      // 玫瑰褐色
            
            // 新增休闲设施
            '休闲中心': '#87CEEB',    // 天蓝色
            '娱乐中心': '#87CEFA',    // 浅天蓝色
            '活动中心': '#00BFFF',     // 深天蓝色
            
            // 媒体建筑
            '电视台': '#4169E1',     // 深蓝色
            '广播站': '#20B2AA',     // 浅绿蓝色
            '报社': '#4682B4',       // 钢蓝色
            '出版社': '#5F9EA0',     // 军蓝色
            '新闻中心': '#1E90FF',   // 道奇蓝
            '媒体中心': '#4682B4',   // 钢蓝色
            '传媒大厦': '#4169E1',   // 皇家蓝
            
            // 新增其他相关建筑
            '演播室': '#00CED1',     // 深青色
            '摄影棚': '#48D1CC',     // 中绿宝石色
            '录音室': '#40E0D0',     // 绿宝石色
            '编辑部': '#00BFFF',     // 深天蓝色
            '记者站': '#87CEEB',     // 天蓝色
            '通讯社': '#87CEFA',     // 浅天蓝色
            '数字媒体中心': '#00B2EE', // 深天蓝色
            
            // 新增其他相关设施
            '休闲吧': '#87CEEB',      // 天蓝色
            '休闲中心': '#4682B4',    // 钢蓝色
            '休息区': '#B0E0E6',      // 粉蓝色
            '员工休息室': '#ADD8E6',  // 浅蓝色
            '休闲区': '#87CEFA',      // 浅天蓝色
            '员工餐厅': '#B0C4DE',    // 浅钢蓝色
            '员工活动室': '#778899',  // 浅灰蓝色
            
            // 新增其他相关建筑
            '社区活动室': '#6495ED',  // 矢车菊蓝
            '职工之家': '#4169E1',    // 皇家蓝
            '员工俱乐部': '#1E90FF',  // 道奇蓝
            '休息站': '#00BFFF',      // 深天蓝色
            '小憩亭': '#87CEFA',      // 浅天蓝色
            '员工健身房': '#48D1CC',  // 中绿宝石色
            '员工阅览室': '#40E0D0',   // 绿宝石色
            
            // 餐饮类建筑
            '餐厅': '#FF9999',         // 粉红色
            '快餐店': '#FFB366',       // 橙色
            '食堂': '#FFE5CC',         // 浅橙色
            '咖啡厅': '#FF99CC',       // 粉色
            '小吃店': '#FF7043',       // 橙红色
            '小吃街': '#FF5722',       // 深橙色
            '美食广场': '#FF6B6B',     // 鲜红色
            '茶馆': '#795548',         // 棕色
            '美食城': '#FF6E40',       // 鲜橙色
            '饭店': '#FF8A65',         // 浅橙色
            '自助餐厅': '#FF7F50',     // 珊瑚色
            '特色餐厅': '#FF6347',     // 番茄色
            '美食中心': '#FF4500',     // 橙红色
            '食品街': '#FF8C00',       // 深橙色
            
            // 新增其他相关设施
            '休闲吧': '#87CEEB',      // 天蓝色
            '休闲中心': '#4682B4',    // 钢蓝色
            '休息区': '#B0E0E6',      // 粉蓝色
            '员工休息室': '#ADD8E6',  // 浅蓝色
            '休闲区': '#87CEFA',      // 浅天蓝色
            '员工餐厅': '#B0C4DE',    // 浅钢蓝色
            '员工活动室': '#778899',  // 浅灰蓝色
            
            // 社交场所
            '社交广场': '#7B68EE',     // 中暗蓝色
            '交友中心': '#6A5ACD',     // 石板蓝
            '活动中心': '#483D8B',     // 暗蓝色
            '聚会场所': '#9370DB',     // 中紫色
            '社区活动室': '#8A2BE2',   // 紫罗兰色
            '文化活动室': '#9400D3',   // 暗紫色
            '青年活动中心': '#8B008B', // 暗洋红色
            '社交俱乐部': '#800080',   // 紫色
            
            // 休闲娱乐场所
            '休闲吧': '#87CEEB',      // 天蓝色
            '休闲中心': '#4682B4',    // 钢蓝色
            '休息区': '#B0E0E6',      // 粉蓝色
            '员工休��室': '#ADD8E6',  // 浅蓝色
            '休闲区': '#87CEFA',      // 浅天蓝色
            '员工餐厅': '#B0C4DE',    // 浅钢蓝色
            '员工活动室': '#778899',  // 浅灰蓝色
            
            // 餐饮场所
            '餐厅': '#FF9999',         // 粉红色
            '快餐店': '#FFB366',       // 橙色
            '食堂': '#FFE5CC',         // 浅橙色
            '咖啡厅': '#FF99CC',       // 粉色
            '小吃店': '#FF7043',       // 橙红色
            '小吃街': '#FF5722',       // 深橙色
            '美食广场': '#FF6B6B',     // 鲜红色
            '茶馆': '#795548',         // 棕色
            '美食城': '#FF6E40',       // 鲜橙色
            '饭店': '#FF8A65',         // 浅橙色
            '自助餐厅': '#FF7F50',     // 珊瑚色
            '特色餐厅': '#FF6347',     // 番茄色
            '美食中心': '#FF4500',     // 橙红色
            '食品街': '#FF8C00',       // 深橙色
            
            // 文化设施
            '文化中心': '#9575CD',     // 深紫色
            '社区中心': '#7E57C2',     // 中紫色
            '活动中心': '#673AB7',     // 浅紫色
            '交友中心': '#5E35B1',     // 靛紫色
            '聚会场所': '#512DA8',     // 深靛紫色
            '社区活动室': '#4527A0',   // 深紫罗兰色
            '文化活动室': '#B39DDB',   // 淡紫色
            '青年活动中心': '#9FA8DA', // 淡蓝紫色
            '社交俱乐部': '#7986CB',   // 蓝紫色
            '社交广场': '#5C6BC0',     // 深蓝紫色
            
            // 休闲设施
            '休闲中心': '#4FC3F7',    // 浅蓝色
            '休息区': '#29B6F6',      // 天蓝色
            '员工休息室': '#03A9F4',  // 蓝色
            '休闲吧': '#039BE5',      // 深蓝色
            '员工活动室': '#0288D1',  // 更深蓝色
            '休闲区': '#0277BD',      // 深海蓝
            '员工餐厅': '#01579B',    // 深邃蓝
            
            // 教育设施
            '培训中心': '#FFB74D',    // 橙色
            '教育中心': '#FFA726',    // 深橙色
            '学习中心': '#FF9800',    // 更深橙色
            '研究中心': '#FB8C00',    // 暗橙色
            '科技园': '#F57C00',      // 深暗橙色
            '创新中心': '#EF6C00',    // 赤橙色
            '实验室': '#E65100',      // 深赤橙色
            
            // 医疗设施
            '康复中心': '#81C784',    // 浅绿色
            '保健中心': '#66BB6A',    // 绿色
            '医疗中心': '#4CAF50',    // 深绿色
            '急救中心': '#43A047',    // 更深绿色
            '诊疗中心': '#388E3C',    // 森林绿
            '健康中心': '#2E7D32',    // 深森林绿
            '医护站': '#1B5E20',    // 深绿色
            
            // 学校相关建筑
            '学宿舍': '#9575CD',     // 紫色
            '学生宿舍': '#7E57C2',   // 深紫色
            '宿舍楼': '#673AB7',     // 更深紫色
            '教师宿舍': '#5E35B1',   // 靛紫色
            '研究生宿舍': '#512DA8', // 深靛紫色
            '留学生宿舍': '#4527A0', // 深紫罗兰色
            '博士生宿舍': '#311B92', // 深蓝紫色
            '职工宿舍': '#B39DDB',   // 淡紫色
            '专家公寓': '#9FA8DA',   // 淡蓝紫色
            '访问学者公寓': '#7986CB', // 蓝紫色
            
            // 其他宿舍类型
            '员工宿舍': '#5C6BC0',   // 深蓝紫色
            '单身公寓': '#3949AB',   // 深蓝色
            '集体宿舍': '#303F9F',   // 更深蓝色
            '临时宿舍': '#283593',   // 深邃蓝色
            '实习生宿舍': '#1A237E'  // 深蓝色
        };
        
        // 如果没有找到对应的颜色，返回一个默认颜色，并输出警告
        const color = colors[this.type];
        if (!color) {
            console.warn(`Building type "${this.type}" has no defined color, using default. Please add color for this type.`);
            return '#CCCCCC';  // 默认使用灰色
        }
        
        return color;
    }

    // 检查点是否在建筑物内
    containsPoint(x, y) {
        return x >= this.bounds.left && 
               x <= this.bounds.right && 
               y >= this.bounds.top && 
               y <= this.bounds.bottom;
    }

    // 检查是否在任意门口
    isAtDoor(x, y) {
        return this.doors.some(door => {
            const doorRange = Math.max(door.width, door.height) / 2;
            return Math.abs(x - door.x) < doorRange && 
                   Math.abs(y - door.y) < doorRange;
        });
    }

    // 获取最近的门
    getNearestDoor(x, y) {
        return this.doors.reduce((nearest, door) => {
            const distance = Math.hypot(x - door.x, y - door.y);
            if (!nearest || distance < nearest.distance) {
                return { door, distance };
            }
            return nearest;
        }, null).door;
    }

    // 添加访客
    addOccupant(agent) {
        if (this.currentOccupants.size < this.details.capacity) {
            this.currentOccupants.add(agent.id);
            return true;
        }
        return false;
    }

    // 移除访客
    removeOccupant(agent) {
        return this.currentOccupants.delete(agent.id);
    }

    drawMedicalSymbol(ctx) {
        ctx.fillStyle = '#ff0000';
        const crossSize = 20;
        const centerX = this.x + this.width/2;
        const centerY = this.y + 40;
        ctx.fillRect(centerX - crossSize/6, centerY - crossSize/2, crossSize/3, crossSize);
        ctx.fillRect(centerX - crossSize/2, centerY - crossSize/6, crossSize, crossSize/3);
    }

    drawEducationSymbol(ctx) {
        ctx.beginPath();
        ctx.fillStyle = '#FFD700';
        ctx.arc(this.x + 30, this.y + 40, 15, 0, Math.PI * 2);
        ctx.fill();
        // 添加书本图案
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 20, this.y + 35, 20, 3);
    }

    drawShoppingSymbol(ctx) {
        // 绘制购物袋图案
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.rect(this.x + 20, this.y + 30, 20, 25);
        ctx.moveTo(this.x + 25, this.y + 30);
        ctx.quadraticCurveTo(this.x + 30, this.y + 20, this.x + 35, this.y + 30);
        ctx.stroke();
    }

    drawCinemaSymbol(ctx) {
        // 绘制电影胶片图案
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.rect(this.x + 20, this.y + 30, 20, 15);
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 22, this.y + 32, 4, 4);
        ctx.fillRect(this.x + 34, this.y + 32, 4, 4);
    }

    drawTransportSymbol(ctx) {
        // 绘制交通标志
        ctx.beginPath();
        ctx.fillStyle = this.type === '地铁站' ? '#0000FF' : '#008000';
        ctx.font = '16px Arial';
        ctx.fillText(this.type === '地铁站' ? 'M' : 'B', this.x + 25, this.y + 40);
    }

    drawSubwayStation(ctx) {
        // 绘制地铁站标志
        ctx.fillStyle = '#1A237E';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制M标志
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('M', this.x + this.width/2 - 15, this.y + this.height/2 + 10);
        
        // 绘制入口箭头
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + this.height - 10);
        ctx.lineTo(this.x + 30, this.y + this.height - 30);
        ctx.lineTo(this.x + 50, this.y + this.height - 10);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawOfficeBuilding(ctx) {
        // 绘制主体
        ctx.fillStyle = '#90CAF9';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制玻璃窗
        const windowSize = 15;
        const gap = 5;
        for (let x = this.x + 10; x < this.x + this.width - 10; x += windowSize + gap) {
            for (let y = this.y + 10; y < this.y + this.height - 10; y += windowSize + gap) {
                ctx.fillStyle = '#E3F2FD';
                ctx.fillRect(x, y, windowSize, windowSize);
            }
        }
        
        // 绘制顶部
        ctx.fillStyle = '#1976D2';
        ctx.fillRect(this.x - 5, this.y, this.width + 10, 10);
    }

    drawFactory(ctx) {
        // 主体建筑
        ctx.fillStyle = '#78909C';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 烟囱
        ctx.fillStyle = '#455A64';
        ctx.fillRect(this.x + this.width - 30, this.y - 40, 20, 50);
        
        // 烟雾
        this.drawSmoke(ctx, this.x + this.width - 20, this.y - 40);
        
        // 工业门
        ctx.fillStyle = '#546E7A';
        ctx.fillRect(this.x + 20, this.y + this.height - 40, 60, 40);
    }

    drawSmoke(ctx, x, y) {
        const time = Date.now() / 1000;
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        for (let i = 0; i < 3; i++) {
            const offset = Math.sin(time + i) * 5;
            ctx.beginPath();
            ctx.arc(x + offset, y - i * 15, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawMuseum(ctx) {
        // 绘制希腊式建筑
        ctx.fillStyle = '#F5F5F5';
        
        // 主体
        ctx.fillRect(this.x, this.y + 20, this.width, this.height - 20);
        
        // 屋顶三角形
        ctx.beginPath();
        ctx.moveTo(this.x - 10, this.y + 20);
        ctx.lineTo(this.x + this.width/2, this.y - 20);
        ctx.lineTo(this.x + this.width + 10, this.y + 20);
        ctx.fill();
        
        // 柱子
        const columnWidth = 15;
        const columnGap = 30;
        ctx.fillStyle = '#E0E0E0';
        for (let x = this.x + 10; x < this.x + this.width - 10; x += columnGap) {
            ctx.fillRect(x, this.y + 30, columnWidth, this.height - 30);
        }
    }

    drawStadium(ctx) {
        // 主体椭圆
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width/2,
            this.y + this.height/2,
            this.width/2,
            this.height/2,
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = '#81C784';
        ctx.fill();
        ctx.strokeStyle = '#388E3C';
        ctx.stroke();
        
        // 跑道
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width/2,
            this.y + this.height/2,
            this.width/2 - 10,
            this.height/2 - 10,
            0, 0, Math.PI * 2
        );
        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    drawLibrary(ctx) {
        // 主建筑
        ctx.fillStyle = '#A1887F';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 书架效果
        const shelfHeight = 15;
        ctx.fillStyle = '#8D6E63';
        for (let y = this.y + 30; y < this.y + this.height - 20; y += shelfHeight + 5) {
            ctx.fillRect(this.x + 20, y, this.width - 40, shelfHeight);
        }
        
        // 入口
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(this.x + this.width/2 - 20, this.y + this.height - 40, 40, 40);
    }

    drawHotel(ctx) {
        // 主楼
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 窗户
        const windowSize = 20;
        for (let x = this.x + 15; x < this.x + this.width - 15; x += windowSize + 10) {
            for (let y = this.y + 15; y < this.y + this.height - 15; y += windowSize + 10) {
                ctx.fillStyle = Math.random() > 0.3 ? '#FFEB3B' : '#333333';
                ctx.fillRect(x, y, windowSize, windowSize);
            }
        }
        
        // 顶部装饰
        ctx.fillStyle = '#607D8B';
        ctx.fillRect(this.x - 10, this.y, this.width + 20, 10);
    }

    drawFireStation(ctx) {
        // 主建筑
        ctx.fillStyle = '#EF5350';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 车库门
        ctx.fillStyle = '#B71C1C';
        ctx.fillRect(this.x + 10, this.y + this.height - 50, 80, 50);
        
        // 瞭望塔
        ctx.fillStyle = '#D32F2F';
        ctx.fillRect(this.x + this.width - 40, this.y - 30, 30, 40);
        
        // ��防标志
        this.drawFireSymbol(ctx);
    }

    drawFireSymbol(ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y + 30);
        ctx.quadraticCurveTo(
            this.x + 30, this.y + 10,
            this.x + 40, this.y + 30
        );
        ctx.quadraticCurveTo(
            this.x + 30, this.y + 50,
            this.x + 20, this.y + 30
        );
        ctx.fill();
    }

    drawCityHall(ctx) {
        // 主建筑
        ctx.fillStyle = '#FFB74D';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 圆顶
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y, 40, 0, Math.PI, true);
        ctx.fillStyle = '#FFA726';
        ctx.fill();
        
        // 柱子
        const columnWidth = 15;
        const columnGap = 40;
        ctx.fillStyle = '#FFF3E0';
        for (let x = this.x + 20; x < this.x + this.width - 20; x += columnGap) {
            ctx.fillRect(x, this.y + 20, columnWidth, this.height - 20);
        }
        
        // 台阶
        ctx.fillStyle = '#FFE0B2';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(
                this.x, 
                this.y + this.height - 10 - i * 5,
                this.width,
                5
            );
        }
    }

    drawDoors(ctx) {
        // 绘制所有门
        this.doors.forEach(door => {
            ctx.fillStyle = '#4A4A4A';
            
            // 根据门的方向绘制
            if (door.width > door.height) {
                // 水平门（南北门）
                ctx.fillRect(
                    door.x - door.width/2,
                    door.y - door.height,
                    door.width,
                    door.height
                );
                
                // 添加门框效果
                ctx.strokeStyle = '#2A2A2A';
                ctx.strokeRect(
                    door.x - door.width/2,
                    door.y - door.height,
                    door.width,
                    door.height
                );
                
                // 添加门把手
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.arc(
                    door.x + door.width/4,
                    door.y - door.height/2,
                    2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            } else {
                // 垂直门（东西门）
                ctx.fillRect(
                    door.x - door.width,
                    door.y - door.height/2,
                    door.width,
                    door.height
                );
                
                // 添加门框效果
                ctx.strokeStyle = '#2A2A2A';
                ctx.strokeRect(
                    door.x - door.width,
                    door.y - door.height/2,
                    door.width,
                    door.height
                );
                
                // 添加门把手
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.arc(
                    door.x - door.width/2,
                    door.y,
                    2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            // 如果是主要入口，添加标���
            if (door.type.includes('主')) {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(
                    door.x,
                    door.y - (door.width > door.height ? door.height/2 : 0),
                    3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });

        // 在调试模式下显示门的范围
        if (this.city?.debugMode) {
            this.doors.forEach(door => {
                const doorRange = Math.max(door.width, door.height) / 2;
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(door.x, door.y, doorRange, 0, Math.PI * 2);
                ctx.stroke();
            });
        }
    }

    drawExhibitionCenter(ctx) {
        // 绘制玻璃幕墙效果
        ctx.fillStyle = '#E3F2FD';
        for (let y = this.y + 10; y < this.y + this.height - 10; y += 20) {
            ctx.fillRect(this.x + 10, y, this.width - 20, 15);
        }
        
        // 绘制标志
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#1976D2';
        ctx.fillText('EXPO', this.x + this.width/2 - 25, this.y + 30);
    }

    drawTechPark(ctx) {
        // 绘制现代建筑群效果
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `rgba(100, 181, 246, ${0.6 + i * 0.2})`;
            ctx.fillRect(
                this.x + 10 + i * 20,
                this.y + 10,
                this.width/3 - 10,
                this.height - 20
            );
        }
    }

    drawLogisticsCenter(ctx) {
        // 绘制物流中心效果
        ctx.fillStyle = '#778899';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制仓库
        ctx.fillStyle = '#708090';
        ctx.fillRect(this.x + this.width/2 - 20, this.y + 20, 40, this.height - 40);
    }

    drawResearchCenter(ctx) {
        // 绘制研发中心效果
        ctx.fillStyle = '#483D8B';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制实验室
        ctx.fillStyle = '#778899';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawExhibitionHall(ctx) {
        // 绘制展览馆效果
        ctx.fillStyle = '#BC8F8F';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制展品
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawInsuranceCompany(ctx) {
        // 绘制保险公司效果
        ctx.fillStyle = '#F0E68C';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制保险箱
        ctx.fillStyle = '#708090';
        ctx.fillRect(this.x + this.width/2 - 20, this.y + 20, 40, this.height - 40);
    }

    drawInvestmentCompany(ctx) {
        // 绘制投资公司效果
        ctx.fillStyle = '#EEE8AA';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制投资项目
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawTaxOffice(ctx) {
        // 绘制税务局效果
        ctx.fillStyle = '#BDB76B';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制税款
        ctx.fillStyle = '#708090';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawCourt(ctx) {
        // 绘制法院效果
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制法徽
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 30, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#1565C0';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
    }

    drawSpecialtyHospital(ctx) {
        // 绘制专科医院效果
        ctx.fillStyle = '#FF7777';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制医疗设备
        ctx.fillStyle = '#FFCCCC';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawRehabCenter(ctx) {
        // 绘制康复中心效果
        ctx.fillStyle = '#FFB6B6';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制康复设��
        ctx.fillStyle = '#FF8080';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawEmergencyCenter(ctx) {
        // 绘制急救中心效果
        ctx.fillStyle = '#FF8080';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制急救设备
        ctx.fillStyle = '#FFCCCC';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawTrainingCenter(ctx) {
        // 绘制培训中心效果
        ctx.fillStyle = '#98FB98';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制培训设备
        ctx.fillStyle = '#E5FFE5';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawArcade(ctx) {
        // 绘制游戏厅效果
        ctx.fillStyle = '#A0A0FF';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制游戏机
        ctx.fillStyle = '#9999FF';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawNightclub(ctx) {
        // 绘制夜总会效果
        ctx.fillStyle = '#DDA0DD';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制舞台
        ctx.fillStyle = '#B0C4DE';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawMidRiseBuilding(ctx) {
        // 绘制中层住宅效果
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制窗户
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawDormitory(ctx) {
        // 绘制生宿舍效果
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制床铺
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    drawSeniorApartment(ctx) {
        // 绘制老年公寓效果
        ctx.fillStyle = '#FFE4C4';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制家具
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
    }

    // 添加空间分区
    static createSpatialIndex(buildings) {
        const grid = new Map();
        const cellSize = 200; // 网格大小

        buildings.forEach(building => {
            const cellX = Math.floor(building.x / cellSize);
            const cellY = Math.floor(building.y / cellSize);
            const key = `${cellX},${cellY}`;

            if (!grid.has(key)) {
                grid.set(key, []);
            }
            grid.get(key).push(building);
        });

        return grid;
    }

    // 优化碰撞检测
    static getNearbyBuildings(x, y, radius, spatialIndex) {
        const cellSize = 200;
        const centerCellX = Math.floor(x / cellSize);
        const centerCellY = Math.floor(y / cellSize);
        const searchRadius = Math.ceil(radius / cellSize);

        const nearbyBuildings = [];
        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
            for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                const key = `${centerCellX + dx},${centerCellY + dy}`;
                const cellBuildings = spatialIndex.get(key);
                if (cellBuildings) {
                    nearbyBuildings.push(...cellBuildings);
                }
            }
        }

        return nearbyBuildings;
    }

    isAvailable(agent, timeSystem) {
        // 1. 检查营业时间
        if (!timeSystem) {
            return {
                available: false,
                reason: '无法获取时间系统'
            };
        }

        const timeCheck = this.checkTimeAvailability(timeSystem);
        if (!timeCheck.available) {
            return timeCheck;
        }

        // 2. 检查容量
        if (this.currentOccupants.size >= this.details.capacity) {
            return {
                available: false,
                reason: '建筑物已达到最大容量'
            };
        }

        // 3. 检查访问权限
        if (!this.checkAccessPermission(agent)) {
            return {
                available: false,
                reason: '无访问权限'
            };
        }

        // 4. 检查经济条件（如果需要）
        if (!this.checkEconomicRequirement(agent)) {
            return {
                available: false,
                reason: '经济条件不满足'
            };
        }

        // 5. 检查特殊时间段限制
        const timeRestriction = this.checkTimeRestrictions(timeSystem, agent);
        if (!timeRestriction.available) {
            return timeRestriction;
        }

        return {
            available: true,
            reason: '建筑物可用'
        };
    }

    checkTimeAvailability(timeSystem) {
        // 某些建筑物24小时开放
        if (this.is24HourBuilding()) {
            return { available: true, reason: '24小时开放' };
        }

        if (!timeSystem || !timeSystem.getTimeString) {
            return {
                available: false,
                reason: '无法获取当前时间'
            };
        }

        const currentTime = timeSystem.getTimeString();
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);
        const [openHour, openMinute] = this.details.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = this.details.closeTime.split(':').map(Number);

        // 转换为分钟进行比较
        const current = currentHour * 60 + currentMinute;
        const open = openHour * 60 + openMinute;
        const close = closeHour * 60 + closeMinute;

        // 处理跨夜的情况
        if (close < open) {
            if (current >= open || current <= close) {
                return { available: true, reason: '营业时间内' };
            }
        } else if (current >= open && current <= close) {
            return { available: true, reason: '营业时间内' };
        }

        return {
            available: false,
            reason: `营业时间为 ${this.details.openTime} - ${this.details.closeTime}`
        };
    }

    checkTimeRestrictions(timeSystem, agent) {
        const hour = timeSystem.hour;
        const timePeriod = timeSystem.getTimePeriod();

        // 建筑物类型特定的时间限制
        const restrictions = {
            '餐厅': {
                periods: {
                    '早餐': { start: 7, end: 10 },
                    '午餐': { start: 11, end: 14 },
                    '晚餐': { start: 17, end: 21 }
                },
                check: (h) => {
                    return (h >= 7 && h <= 10) || // 早餐
                           (h >= 11 && h <= 14) || // 午餐
                           (h >= 17 && h <= 21);   // 晚餐
                },
                message: '不在用餐时间'
            },
            '图书馆': {
                periods: {
                    '学习时间': { start: 8, end: 22 }
                },
                check: (h) => h >= 8 && h <= 22,
                message: '图书馆休息时间'
            },
            '学校': {
                periods: {
                    '上课时间': { start: 8, end: 17 }
                },
                check: (h) => h >= 8 && h <= 17,
                message: '不在上课时间'
            },
            '银行': {
                periods: {
                    '营业时间': { start: 9, end: 17 }
                },
                check: (h) => h >= 9 && h <= 17,
                message: '银行下班时间'
            },
            '健身房': {
                periods: {
                    '营业时间': { start: 6, end: 22 }
                },
                check: (h) => h >= 6 && h <= 22,
                message: '健身房休息时间'
            },
            '商场': {
                periods: {
                    '营业时间': { start: 10, end: 22 }
                },
                check: (h) => h >= 10 && h <= 22,
                message: '商场休息时间'
            },
            '医院': {
                periods: {
                    '门诊时间': { start: 8, end: 17 }
                },
                check: (h) => h >= 8 && h <= 17 || agent.needs.health < 30,
                message: '不在门诊时间（急诊24小时开放）'
            },
            '咖啡厅': {
                periods: {
                    '营业时间': { start: 7, end: 23 }
                },
                check: (h) => h >= 7 && h <= 23,
                message: '咖啡厅休息时间'
            },
            '夜总会': {
                periods: {
                    '营业时间': { start: 20, end: 5 }
                },
                check: (h) => h >= 20 || h <= 5,
                message: '夜总会尚未营业'
            }
        };

        const restriction = restrictions[this.type];
        if (!restriction) {
            return { available: true, reason: '无时间限制' };
        }

        if (!restriction.check(hour)) {
            return {
                available: false,
                reason: restriction.message,
                nextAvailablePeriod: this.getNextAvailablePeriod(restriction.periods, hour)
            };
        }

        return { available: true, reason: '在允许的时间段内' };
    }

    getNextAvailablePeriod(periods, currentHour) {
        let nextPeriod = null;
        let shortestWait = 24;

        Object.entries(periods).forEach(([name, period]) => {
            let wait;
            if (currentHour < period.start) {
                wait = period.start - currentHour;
            } else {
                wait = (24 - currentHour) + period.start;
            }

            if (wait < shortestWait) {
                shortestWait = wait;
                nextPeriod = {
                    name: name,
                    time: `${period.start}:00`,
                    waitHours: wait
                };
            }
        });

        return nextPeriod;
    }

    is24HourBuilding() {
        return [
            '住宅区', '公寓', '宿舍',
            '地铁站', '公交站', '警察局',
            '消防局', '急救中心'
        ].includes(this.type);
    }

    checkAccessPermission(agent) {
        // 根据建筑类型和agent角色检查访问权限
        const accessRules = {
            '学校': ['学生', '教师', '职工'],
            '医院': ['医生', '护士', '病人'],
            '警察局': ['警察', '职工'],
            '消防局': ['消防员', '职工'],
            '员工休息室': ['职工', '员工'],
            '教师办公室': ['教师', '职工']
        };

        // 如果建筑物有特定的访问规则
        if (accessRules[this.type]) {
            return accessRules[this.type].includes(agent.role);
        }

        // 默认允许访问
        return true;
    }

    checkEconomicRequirement(agent) {
        // 检查是否需要支付费用
        const costRules = {
            '电影院': 50,
            '游戏厅': 30,
            '健身房': 40,
            '游泳馆': 35,
            '餐厅': 60,
            '咖啡厅': 25,
            '商店': 0,  // 商店不需要入场费
            '超市': 0
        };

        const cost = costRules[this.type] || 0;
        return cost === 0 || agent.money >= cost;
    }

    checkSpecialConditions(agent) {
        switch(this.type) {
            case '医院':
                // 检查是否真的需要就医
                if (agent.needs.health > 70) {
                    return {
                        available: false,
                        reason: '健康状况良好，无需就医'
                    };
                }
                break;

            case '图书馆':
                // 检查是否在学习时间
                if (agent.city.timeSystem.hour >= 22 || agent.city.timeSystem.hour < 8) {
                    return {
                        available: false,
                        reason: '图书馆休息时间'
                    };
                }
                break;

            case '餐厅':
                // 检查是否在用餐时间
                const hour = agent.city.timeSystem.hour;
                if (!(
                    (hour >= 7 && hour <= 9) ||   // 早餐时间
                    (hour >= 11 && hour <= 14) || // 午餐时间
                    (hour >= 17 && hour <= 21)    // 晚餐时间
                )) {
                    return {
                        available: false,
                        reason: '不在用餐时间'
                    };
                }
                break;

            case '健身房':
                // 检查体力是否足够
                if (agent.needs.energy < 30) {
                    return {
                        available: false,
                        reason: '体力不足，不适合运动'
                    };
                }
                break;
        }

        return {
            available: true,
            reason: '满足特殊条件'
        };
    }
} 