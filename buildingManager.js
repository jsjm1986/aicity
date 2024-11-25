class BuildingManager {
    constructor() {
        // 建筑物生成比例配置
        this.buildingDistribution = {
            // 住宅区 (30%)
            'residential': {
                '住宅': 0.15,
                '公寓': 0.10,
                '学生宿舍': 0.03,
                '员工宿舍': 0.02
            },

            // 医疗卫生区 (12%)
            'medical': {
                '综合医院': 0.04,
                '专科医院': 0.03,
                '社区诊所': 0.03,
                '医疗中心': 0.02
            },

            // 教育区 (10%)
            'education': {
                '大学': 0.02,
                '中学': 0.02,
                '小学': 0.02,
                '职业学校': 0.02,
                '培训中心': 0.02
            },

            // IT/互联网区 (10%)
            'tech': {
                '科技园': 0.03,
                '研发中心': 0.03,
                '数据中心': 0.02,
                'IT企业园': 0.02
            },

            // 金融区 (8%)
            'financial': {
                '银行': 0.02,
                '证券公司': 0.02,
                '保险公司': 0.02,
                '金融中心': 0.02
            },

            // 创意文化区 (8%)
            'cultural': {
                '文创园': 0.02,
                '艺术中心': 0.015,
                '设计工作室': 0.015,
                '媒体中心': 0.015,
                '演艺中心': 0.015
            },

            // 服务业区 (15%)
            'service': {
                '商场': 0.03,
                '超市': 0.02,
                '餐厅': 0.02,
                '酒店': 0.02,
                '便利店': 0.02,
                '美容院': 0.02,
                '咖啡厅': 0.02
            },

            // 制造业区 (12%)
            'industrial': {
                '工厂': 0.04,
                '生产车间': 0.03,
                '仓库': 0.03,
                '物流中心': 0.02
            },

            // 公共服务区 (10%)
            'public': {
                '政府机构': 0.02,
                '警察局': 0.02,
                '消防局': 0.02,
                '公共服务中心': 0.02,
                '交通枢纽': 0.02
            }
        };

        // 建筑物容量配置
        this.buildingCapacity = {
            // 住宅类
            '住宅': 4,
            '公寓': 20,
            '学生宿舍': 50,
            '员工宿舍': 30,

            // 商业类
            '商场': 200,
            '超市': 100,
            '便利店': 20,
            '餐厅': 50,
            '咖啡厅': 30,
            '银行': 40,
            '写字楼': 200,

            // 工业类
            '工厂': 150,
            '仓库': 50,
            '物流中心': 100,
            '研发中心': 100,

            // 公共服务类
            '医院': 200,
            '诊所': 30,
            '学校': 500,
            '图书馆': 100,
            '警察局': 50,
            '消防局': 30,
            '政府机构': 100,
            '邮局': 20,
            '公交站': 30,

            // 文化娱乐类
            '公园': 300,
            '体育馆': 200,
            '电影院': 150,
            '剧院': 100,
            '博物馆': 100,
            '艺术馆': 80,
            '健身中心': 50,

            // 特殊功能类
            '科技园': 300,
            '会展中心': 500,
            '创业园': 200,
            '培训中心': 100,
            '数据中心': 50
        };

        // 建筑物工作岗位配置
        this.buildingJobs = {
            // 医疗卫生类
            '综合医院': ['医生', '护士', '药剂师', '医技人员'],
            '专科医院': ['医生', '护士', '药剂师'],
            '社区诊所': ['医生', '护士', '药剂师'],
            '医疗中心': ['医生', '护士', '医技人员'],

            // 教育类
            '大学': ['教授', '讲师', '行政人员'],
            '中学': ['中学教师', '行政人员'],
            '小学': ['小学教师', '行政人员'],
            '职业学校': ['职业培训师', '教师'],
            '培训中心': ['职业培训师', '讲师'],

            // IT/互联网类
            '科技园': ['软件工程师', '数据科学家', '网络工程师'],
            '研发中心': ['人工智能工程师', '研发工程师'],
            '数据中心': ['网络工程师', '系统工程师'],
            'IT企业园': ['前端工程师', '后端工程师'],

            // 金融类
            '银行': ['银行职员', '理财顾问'],
            '证券公司': ['投资分析师', '金融顾问'],
            '保险公司': ['保险顾问', '理赔专员'],
            '金融中心': ['基金经理', '金融分析师'],

            // 创意文化类
            '文创园': ['设计师', '创意总监'],
            '艺术中心': ['艺术家', '策展人'],
            '设计工作室': ['设计师', '动画师'],
            '媒体中心': ['记者', '编辑'],
            '演艺中心': ['演员', '导演'],

            // 服务业
            '商场': ['店员', '销售', '收银员'],
            '超市': ['店员', '收银员', '理货员'],
            '餐厅': ['厨师', '服务员'],
            '酒店': ['酒店经理', '服务员'],
            '便利店': ['店员', '收银员'],
            '美容院': ['美容师', '美发师'],
            '咖啡厅': ['咖啡师', '服务员'],

            // 制造业
            '工厂': ['工厂工人', '技术工人', '工程师'],
            '生产车间': ['技术工人', '生产主管'],
            '仓库': ['仓库管理员', '物流人员'],
            '物流中心': ['物流主管', '配送员'],

            // 公共服务
            '政府机构': ['公务员', '行政人员'],
            '警察局': ['警察', '行政人员'],
            '消防局': ['消防员', '急救人员'],
            '公共服务中心': ['公务员', '服务人员'],
            '交通枢纽': ['公交车司机', '站务员']
        };

        // 定义所有建筑物类型及其属性
        this.buildingTypes = {
            // 住宅类建筑
            '住宅': {
                name: '居民住宅',
                size: { width: 40, height: 40 },
                capacity: 4,
                category: 'residential',
                color: '#A5D6A7',
                openTime: '00:00',
                closeTime: '24:00',
                workplaces: ['家政服务员', '保姆'],
                description: '普通的居民住宅，提供基本的居住功能'
            },
            '公寓': {
                name: '高层公寓',
                size: { width: 50, height: 50 },
                capacity: 20,
                category: 'residential',
                color: '#81C784',
                openTime: '00:00',
                closeTime: '24:00',
                workplaces: ['物业管理员', '保安', '清洁工'],
                description: '现代化的高层公寓，可容纳多个家庭'
            },

            // 医疗卫生类建筑
            '综合医院': {
                name: '综合医院',
                size: { width: 120, height: 100 },
                capacity: 200,
                category: 'medical',
                color: '#FF7043',
                openTime: '00:00',
                closeTime: '24:00',
                workplaces: ['医生', '护士', '药剂师', '医技人员', '行政人员'],
                description: '提供全面医疗服务的综合性医院'
            },
            '专科医院': {
                name: '专科医院',
                size: { width: 100, height: 80 },
                capacity: 150,
                category: 'medical',
                color: '#FF8A65',
                openTime: '08:00',
                closeTime: '18:00',
                workplaces: ['专科医生', '护士', '医技人员'],
                description: '专门提供特定领域医疗服务的医院'
            },
            '社区诊所': {
                name: '社区诊所',
                size: { width: 40, height: 30 },
                capacity: 30,
                category: 'medical',
                color: '#FFAB91',
                openTime: '08:00',
                closeTime: '20:00',
                workplaces: ['全科医生', '护士', '药剂师'],
                description: '提供基础医疗服务的社区诊所'
            },

            // 教育类建筑
            '大学': {
                name: '综合大学',
                size: { width: 200, height: 150 },
                capacity: 1000,
                category: 'education',
                color: '#FFB74D',
                openTime: '07:00',
                closeTime: '22:00',
                workplaces: ['教授', '讲师', '研究员', '行政人员', '图书管理员'],
                description: '高等教育机构'
            },
            '中学': {
                name: '中学',
                size: { width: 150, height: 100 },
                capacity: 500,
                category: 'education',
                color: '#FFB74D',
                openTime: '07:00',
                closeTime: '18:00',
                workplaces: ['中学教师', '行政人员'],
                description: '中等教育机构'
            },
            '小学': {
                name: '小学',
                size: { width: 120, height: 80 },
                capacity: 300,
                category: 'education',
                color: '#FFB74D',
                openTime: '07:00',
                closeTime: '17:00',
                workplaces: ['小学教师', '行政人员'],
                description: '基础教育机构'
            },
            '职业学校': {
                name: '职业学校',
                size: { width: 100, height: 80 },
                capacity: 200,
                category: 'education',
                color: '#FFB74D',
                openTime: '08:00',
                closeTime: '18:00',
                workplaces: ['职业培训师', '教师'],
                description: '职业技能培训机构'
            },

            // 商业类建筑
            '购物中心': {
                name: '大型购物中心',
                size: { width: 150, height: 120 },
                capacity: 500,
                category: 'commercial',
                color: '#64B5F6',
                openTime: '09:00',
                closeTime: '22:00',
                workplaces: ['店员', '收银员', '保安', '清洁工', '商场经理'],
                description: '综合性购物中心'
            },
            '写字楼': {
                name: '商务写字楼',
                size: { width: 80, height: 150 },
                capacity: 400,
                category: 'commercial',
                color: '#42A5F5',
                openTime: '07:00',
                closeTime: '22:00',
                workplaces: ['白领', '程序员', '设计师', '会计', '人力资源'],
                description: '现代化办公楼'
            },
            '银行': {
                name: '商业银行',
                size: { width: 60, height: 40 },
                capacity: 100,
                category: 'commercial',
                color: '#2196F3',
                openTime: '09:00',
                closeTime: '17:00',
                workplaces: ['银行职员', '理财顾问', '保安'],
                description: '金融服务机构'
            },

            // 文化娱乐类建筑
            '图书馆': {
                name: '公共图书馆',
                size: { width: 100, height: 80 },
                capacity: 300,
                category: 'cultural',
                color: '#9575CD',
                openTime: '09:00',
                closeTime: '21:00',
                workplaces: ['图书管理员', '档案管理员', '清洁工'],
                description: '公共图书馆'
            },
            '电影院': {
                name: '电影院',
                size: { width: 100, height: 80 },
                capacity: 200,
                category: 'entertainment',
                color: '#9575CD',
                openTime: '10:00',
                closeTime: '23:00',
                workplaces: ['服务员', '放映员'],
                description: '电影放映场所'
            },
            '体育馆': {
                name: '体育馆',
                size: { width: 150, height: 100 },
                capacity: 300,
                category: 'entertainment',
                color: '#9575CD',
                openTime: '08:00',
                closeTime: '22:00',
                workplaces: ['教练', '服务人员'],
                description: '体育运动场所'
            },

            // 专业服务类建筑
            '律师事务所': {
                name: '律师事务所',
                size: { width: 50, height: 40 },
                capacity: 50,
                category: 'professional',
                color: '#4DB6AC',
                openTime: '09:00',
                closeTime: '18:00',
                workplaces: ['律师', '法务助理', '行政人员'],
                description: '法律服务机构'
            },
            '会计师事务所': {
                name: '会计师事务所',
                size: { width: 50, height: 40 },
                capacity: 50,
                category: 'professional',
                color: '#26A69A',
                openTime: '09:00',
                closeTime: '18:00',
                workplaces: ['会计师', '审计师', '财务顾问'],
                description: '财务审计服务机构'
            },

            // 工业类建筑
            '工厂': {
                name: '制造工厂',
                size: { width: 200, height: 150 },
                capacity: 300,
                category: 'industrial',
                color: '#90A4AE',
                openTime: '08:00',
                closeTime: '20:00',
                workplaces: ['工人', '技术员', '工程师', '质检员', '仓库管理员'],
                description: '工业制造中心'
            },
            '研发中心': {
                name: '技术研发中心',
                size: { width: 100, height: 80 },
                capacity: 200,
                category: 'industrial',
                color: '#78909C',
                openTime: '09:00',
                closeTime: '21:00',
                workplaces: ['研发工程师', '科研人员', '实验员'],
                description: '技术研发基地'
            },

            // 餐饮服务类建筑
            '餐厅': {
                name: '餐厅',
                size: { width: 50, height: 40 },
                capacity: 100,
                category: 'service',
                color: '#FF8A65',
                openTime: '10:00',
                closeTime: '22:00',
                workplaces: ['厨师', '服务员', '收银员'],
                description: '餐饮服务场所'
            },
            '咖啡厅': {
                name: '咖啡厅',
                size: { width: 40, height: 30 },
                capacity: 50,
                category: 'service',
                color: '#A1887F',
                openTime: '08:00',
                closeTime: '22:00',
                workplaces: ['咖啡师', '服务员', '收银员'],
                description: '咖啡休闲场所'
            },

            // 商业服务类建筑
            '商场': {
                name: '大型商场',
                size: { width: 150, height: 100 },
                capacity: 300,
                category: 'commercial',
                color: '#64B5F6',
                openTime: '09:00',
                closeTime: '22:00',
                workplaces: ['店员', '收银员', '保安', '清洁工', '销售'],
                description: '大型综合购物中心'
            },
            '超市': {
                name: '连锁超市',
                size: { width: 80, height: 60 },
                capacity: 150,
                category: 'commercial',
                color: '#90CAF9',
                openTime: '07:00',
                closeTime: '23:00',
                workplaces: ['店员', '收银员', '理货员', '保安'],
                description: '提供日常生活用品的大型超市'
            },
            '便利店': {
                name: '24小时便利店',
                size: { width: 30, height: 20 },
                capacity: 30,
                category: 'commercial',
                color: '#BBDEFB',
                openTime: '00:00',
                closeTime: '24:00',
                workplaces: ['店员', '收银员'],
                description: '24小时营业的小型便利店'
            },

            // 生活服务类建筑
            '美容院': {
                name: '美容美发沙龙',
                size: { width: 40, height: 30 },
                capacity: 20,
                category: 'service',
                color: '#F48FB1',
                openTime: '09:00',
                closeTime: '21:00',
                workplaces: ['美容师', '美发师', '前台'],
                description: '提供美容美发服务的专业场所'
            },
            '健身房': {
                name: '综合健身中心',
                size: { width: 60, height: 40 },
                capacity: 100,
                category: 'service',
                color: '#CE93D8',
                openTime: '06:00',
                closeTime: '23:00',
                workplaces: ['健身教练', '前台', '保洁'],
                description: '提供健身和运动设施的场所'
            },
            '邮局': {
                name: '邮政服务中心',
                size: { width: 50, height: 40 },
                capacity: 50,
                category: 'public',
                color: '#9FA8DA',
                openTime: '08:00',
                closeTime: '18:00',
                workplaces: ['邮政工作人员', '快递员', '柜台人员'],
                description: '提供邮政和快递服务的场所'
            },

            // 餐饮类建筑
            '餐厅': {
                name: '综合餐厅',
                size: { width: 50, height: 40 },
                capacity: 80,
                category: 'service',
                color: '#FFB74D',
                openTime: '10:00',
                closeTime: '22:00',
                workplaces: ['厨师', '服务员', '收银员', '保洁'],
                description: '提供各类餐饮服务的餐厅'
            },
            '咖啡厅': {
                name: '特色咖啡馆',
                size: { width: 40, height: 30 },
                capacity: 40,
                category: 'service',
                color: '#A1887F',
                openTime: '08:00',
                closeTime: '23:00',
                workplaces: ['咖啡师', '服务员', '收银员'],
                description: '提供咖啡和轻食的休闲场所'
            },

            // 公共服务类建筑
            '政府机构': {
                name: '政府机构',
                size: { width: 100, height: 80 },
                capacity: 100,
                category: 'public',
                color: '#9FA8DA',
                openTime: '09:00',
                closeTime: '17:00',
                workplaces: ['公务员', '行政人员'],
                description: '政府行政机构'
            },
            '公共服务中心': {
                name: '公共服务中心',
                size: { width: 80, height: 60 },
                capacity: 50,
                category: 'public',
                color: '#9FA8DA',
                openTime: '09:00',
                closeTime: '17:00',
                workplaces: ['公务员', '服务人员'],
                description: '提供公共服务的场所'
            },
            '交通枢纽': {
                name: '交通枢纽',
                size: { width: 150, height: 100 },
                capacity: 200,
                category: 'public',
                color: '#9FA8DA',
                openTime: '06:00',
                closeTime: '22:00',
                workplaces: ['公交车司机', '站务员'],
                description: '公共交通枢纽'
            },

            // 文化娱乐类建筑
            '公园': {
                name: '公园',
                size: { width: 200, height: 150 },
                capacity: 500,
                category: 'entertainment',
                color: '#81C784',
                openTime: '06:00',
                closeTime: '22:00',
                workplaces: ['园丁', '保安'],
                description: '公共休闲场所'
            },
            '游戏厅': {
                name: '游戏厅',
                size: { width: 80, height: 60 },
                capacity: 100,
                category: 'entertainment',
                color: '#9575CD',
                openTime: '10:00',
                closeTime: '22:00',
                workplaces: ['服务员', '维修工'],
                description: '娱乐游戏场所'
            },

            // 特殊功能类建筑
            '科技园': {
                name: '科技园',
                size: { width: 300, height: 200 },
                capacity: 300,
                category: 'special',
                color: '#90A4AE',
                openTime: '08:00',
                closeTime: '20:00',
                workplaces: ['工程师', '科研人员', '实验员'],
                description: '科技研发基地'
            },
            '会展中心': {
                name: '会展中心',
                size: { width: 500, height: 300 },
                capacity: 500,
                category: 'special',
                color: '#90A4AE',
                openTime: '08:00',
                closeTime: '20:00',
                workplaces: ['工作人员', '安保人员'],
                description: '大型会展中心'
            },
            '创业园': {
                name: '创业园',
                size: { width: 200, height: 150 },
                capacity: 200,
                category: 'special',
                color: '#90A4AE',
                openTime: '08:00',
                closeTime: '20:00',
                workplaces: ['创业者', '创业导师'],
                description: '创业孵化基地'
            },
            '培训中心': {
                name: '培训中心',
                size: { width: 100, height: 80 },
                capacity: 100,
                category: 'special',
                color: '#90A4AE',
                openTime: '08:00',
                closeTime: '20:00',
                workplaces: ['培训师', '行政人员'],
                description: '职业技能培训基地'
            },
            '数据中心': {
                name: '数据中心',
                size: { width: 50, height: 40 },
                capacity: 50,
                category: 'special',
                color: '#90A4AE',
                openTime: '08:00',
                closeTime: '20:00',
                workplaces: ['数据工程师', '系统工程师'],
                description: '数据存储和处理中心'
            }
        };

        // 建筑物类别信息
        this.categoryInfo = {
            'residential': {
                name: '住宅区',
                color: '#81C784',
                description: '居民生活区域'
            },
            'medical': {
                name: '医疗区',
                color: '#FF7043',
                description: '医疗服务区域'
            },
            'education': {
                name: '教育区',
                color: '#FFB74D',
                description: '教育机构集中区'
            },
            'commercial': {
                name: '商业区',
                color: '#64B5F6',
                description: '商业活动区域'
            },
            'cultural': {
                name: '文化区',
                color: '#9575CD',
                description: '文化娱乐区域'
            },
            'professional': {
                name: '专业服务区',
                color: '#4DB6AC',
                description: '专业服务机构区域'
            },
            'industrial': {
                name: '工业区',
                color: '#90A4AE',
                description: '工业生产区域'
            },
            'service': {
                name: '服务区',
                color: '#FF8A65',
                description: '生活服务区域'
            }
        };
    }

    getBuildingProperties(type) {
        return this.buildingTypes[type];
    }

    getCategoryInfo(category) {
        return this.categoryInfo[category];
    }

    getBuildingDisplayInfo(building) {
        const props = this.buildingTypes[building.type];
        const categoryInfo = this.categoryInfo[building.category];
        
        return {
            name: props.name,
            category: categoryInfo.name,
            status: building.details?.status || '正常',
            occupancy: building.currentOccupants ? 
                `${building.currentOccupants.size}/${building.capacity}` : '0/0',
            openTime: `${props.openTime}-${props.closeTime}`,
            description: props.description,
            color: props.color
        };
    }
} 