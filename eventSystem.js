class EventSystem {
    constructor() {
        // 事件队列
        this.eventQueue = [];
        
        // 事件订阅者
        this.subscribers = new Map();
        
        // 事件类型定义
        this.eventTypes = {
            AGENT_MOVED: 'agentMoved',
            AGENT_INTERACTED: 'agentInteracted',
            BUILDING_ENTERED: 'buildingEntered',
            BUILDING_EXITED: 'buildingExited',
            WEATHER_CHANGED: 'weatherChanged',
            TIME_CHANGED: 'timeChanged',
            RESOURCE_DEPLETED: 'resourceDepleted',
            EMERGENCY_OCCURRED: 'emergencyOccurred',
            GOAL_ACHIEVED: 'goalAchieved',
            SYSTEM_ERROR: 'systemError'
        };
        
        // 事件优先级
        this.priorities = {
            HIGH: 0,
            MEDIUM: 1,
            LOW: 2
        };
        
        // 事件处理间隔
        this.processInterval = 100; // 毫秒
        
        // 最近处理的事件历史
        this.eventHistory = [];
        this.maxHistoryLength = 100;
    }

    initialize() {
        try {
            console.log('初始化事件系统...');
            
            // 清空事件队列和历史
            this.eventQueue = [];
            this.eventHistory = [];
            
            // 重置订阅者
            this.subscribers.clear();
            
            // 初始化基础事件监听器
            this.initializeBaseListeners();
            
            // 启动事件处理循环
            this.startEventLoop();
            
            console.log('事件系统初始化完成');
            return true;
        } catch (error) {
            console.error('事件系统初始化失败:', error);
            throw error;
        }
    }

    initializeBaseListeners() {
        // 添加基础事件监听器
        this.subscribe(this.eventTypes.SYSTEM_ERROR, this.handleSystemError.bind(this));
        this.subscribe(this.eventTypes.EMERGENCY_OCCURRED, this.handleEmergency.bind(this));
        
        // 添加调试监听器
        const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';
        if (isDevelopment) {
            this.subscribe('*', this.logEvent.bind(this));
        }
    }

    startEventLoop() {
        // 清除可能存在的旧定时器
        if (this.eventLoopInterval) {
            clearInterval(this.eventLoopInterval);
        }

        // 启动新的事件处理循环
        this.eventLoopInterval = setInterval(() => {
            this.processEventQueue();
        }, this.processInterval);
    }

    subscribe(eventType, callback, priority = this.priorities.MEDIUM) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        
        this.subscribers.get(eventType).push({
            callback,
            priority
        });
        
        // 按优先级排序
        this.subscribers.get(eventType).sort((a, b) => a.priority - b.priority);
    }

    unsubscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) return;
        
        const subscribers = this.subscribers.get(eventType);
        const index = subscribers.findIndex(sub => sub.callback === callback);
        
        if (index !== -1) {
            subscribers.splice(index, 1);
        }
    }

    emit(eventType, data, priority = this.priorities.MEDIUM) {
        const event = {
            type: eventType,
            data,
            priority,
            timestamp: Date.now()
        };
        
        this.eventQueue.push(event);
        
        // 对于高优先级事件，立即处理
        if (priority === this.priorities.HIGH) {
            this.processEventQueue();
        }
    }

    processEventQueue() {
        // 按优先级排序事件队列
        this.eventQueue.sort((a, b) => a.priority - b.priority);
        
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            this.processEvent(event);
        }
    }

    processEvent(event) {
        try {
            // 处理通配符订阅者
            if (this.subscribers.has('*')) {
                this.subscribers.get('*').forEach(sub => {
                    try {
                        sub.callback(event);
                    } catch (error) {
                        console.error('通配符事件处理错误:', error);
                    }
                });
            }
            
            // 处理特定事件订阅者
            if (this.subscribers.has(event.type)) {
                this.subscribers.get(event.type).forEach(sub => {
                    try {
                        sub.callback(event.data);
                    } catch (error) {
                        console.error(`事件 ${event.type} 处理错误:`, error);
                    }
                });
            }
            
            // 添加到事件历史
            this.addToHistory(event);
        } catch (error) {
            console.error('事件处理失败:', error);
            this.handleSystemError(error);
        }
    }

    addToHistory(event) {
        this.eventHistory.unshift(event);
        
        // 限制历史记录长度
        if (this.eventHistory.length > this.maxHistoryLength) {
            this.eventHistory.pop();
        }
    }

    handleSystemError(error) {
        console.error('系统错误:', error);
        // 这里可以添加错误报告逻辑
    }

    handleEmergency(emergency) {
        console.warn('紧急情况:', emergency);
        // 这里可以添加紧急情况处理逻辑
    }

    logEvent(event) {
        console.log('事件触发:', {
            type: event.type,
            data: event.data,
            timestamp: new Date(event.timestamp).toISOString()
        });
    }

    getEventHistory() {
        return this.eventHistory;
    }

    clearEventHistory() {
        this.eventHistory = [];
    }

    update(deltaTime) {
        try {
            // 确保deltaTime有效
            if (!deltaTime || deltaTime < 0) {
                deltaTime = 16; // 约60fps
            }

            // 处理事件队列
            this.processEventQueue();

            // 清理过期的事件历史
            this.cleanupEventHistory();

            // 检查系统状态
            this.checkSystemStatus();

        } catch (error) {
            console.error('事件系统更新失败:', error);
        }
    }

    cleanupEventHistory() {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5分钟

        // 清理过期的事件历史
        this.eventHistory = this.eventHistory.filter(event => 
            now - event.timestamp < maxAge
        );
    }

    checkSystemStatus() {
        // 检查事件队列大小
        if (this.eventQueue.length > 100) {
            console.warn('事件队列积压:', this.eventQueue.length);
        }

        // 检查事件处理延迟
        const oldestEvent = this.eventQueue[0];
        if (oldestEvent) {
            const delay = Date.now() - oldestEvent.timestamp;
            if (delay > 1000) { // 1秒以上的延迟
                console.warn('事件处理延迟:', delay + 'ms');
            }
        }

        // 检查订阅者数量
        let totalSubscribers = 0;
        this.subscribers.forEach(subs => totalSubscribers += subs.length);
        if (totalSubscribers > 1000) {
            console.warn('订阅者数量过多:', totalSubscribers);
        }
    }
} 