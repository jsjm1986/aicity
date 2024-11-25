class TimeSystem {
    constructor() {
        // 初始化时间
        this.currentTime = {
            hour: 5,    // 从早上5:50开始
            minute: 50,
            day: 1,
            month: 1,
            year: 2024
        };

        // 时间流速（1表示现实1秒=游戏1分钟）
        // 4小时 = 24小时游戏时间
        // 4 * 60 * 60 = 14400秒现实时间对应24 * 60 = 1440分钟游戏时间
        // 所以1秒现实时间应该对应 1440/14400 = 0.1 分钟游戏时间
        this.baseTimeScale = 0.1;  // 基础时间流速
        this.timeScale = this.baseTimeScale; // 当前时间流速（可以通过UI调整）

        // 上次更新时间
        this.lastUpdate = Date.now();

        // 事件回调
        this.timeCallbacks = {
            hourly: [],
            daily: [],
            monthly: [],
            yearly: []
        };

        // 时间段定义
        this.timePeriods = {
            EARLY_MORNING: { start: 5, end: 8 },
            MORNING: { start: 8, end: 11 },
            NOON: { start: 11, end: 14 },
            AFTERNOON: { start: 14, end: 17 },
            EVENING: { start: 17, end: 20 },
            NIGHT: { start: 20, end: 23 },
            LATE_NIGHT: { start: 23, end: 5 }
        };
    }

    initialize() {
        console.log('初始化时间系统...');
        this.lastUpdate = Date.now();
        console.log(`初始时间设置为: ${this.getTimeString()}`);
    }

    update(deltaTime) {
        // 计算时间增量（毫秒转换为游戏内分钟）
        const gameMinutes = (deltaTime / 1000) * this.timeScale;
        
        // 更新时间
        this.advanceTime(gameMinutes);
    }

    advanceTime(minutes) {
        const oldHour = this.currentTime.hour;
        const oldDay = this.currentTime.day;
        const oldMonth = this.currentTime.month;
        const oldYear = this.currentTime.year;

        // 更新分钟
        this.currentTime.minute += minutes;

        // 处理进位
        while (this.currentTime.minute >= 60) {
            this.currentTime.minute -= 60;
            this.currentTime.hour++;

            if (this.currentTime.hour >= 24) {
                this.currentTime.hour = 0;
                this.currentTime.day++;

                // 检查月份变化
                const daysInMonth = this.getDaysInMonth(this.currentTime.month, this.currentTime.year);
                if (this.currentTime.day > daysInMonth) {
                    this.currentTime.day = 1;
                    this.currentTime.month++;

                    if (this.currentTime.month > 12) {
                        this.currentTime.month = 1;
                        this.currentTime.year++;
                    }
                }
            }
        }

        // 触发时间事件
        if (this.currentTime.hour !== oldHour) {
            this.triggerCallbacks('hourly', this.currentTime);
        }
        if (this.currentTime.day !== oldDay) {
            this.triggerCallbacks('daily', this.currentTime);
        }
        if (this.currentTime.month !== oldMonth) {
            this.triggerCallbacks('monthly', this.currentTime);
        }
        if (this.currentTime.year !== oldYear) {
            this.triggerCallbacks('yearly', this.currentTime);
        }
    }

    getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    getTimeString() {
        const hour = this.currentTime.hour.toString().padStart(2, '0');
        const minute = Math.floor(this.currentTime.minute).toString().padStart(2, '0');
        return `${hour}:${minute}`;
    }

    getDateString() {
        return `${this.currentTime.year}年${this.currentTime.month}月${this.currentTime.day}日`;
    }

    getFullTimeString() {
        return `${this.getDateString()} ${this.getTimeString()}`;
    }

    getCurrentPeriod() {
        const hour = this.currentTime.hour;
        for (const [period, time] of Object.entries(this.timePeriods)) {
            if (time.start <= hour && hour < time.end) {
                return period;
            }
            // 处理跨午夜的时间段
            if (time.start > time.end && (hour >= time.start || hour < time.end)) {
                return period;
            }
        }
        return 'NIGHT'; // 默认返回夜晚
    }

    isBusinessHour() {
        const hour = this.currentTime.hour;
        return hour >= 9 && hour < 18;
    }

    isWorkingHour() {
        const hour = this.currentTime.hour;
        return hour >= 8 && hour < 17;
    }

    isSchoolHour() {
        const hour = this.currentTime.hour;
        return hour >= 8 && hour < 16;
    }

    isNightTime() {
        const hour = this.currentTime.hour;
        return hour >= 22 || hour < 6;
    }

    setTimeScale(scale) {
        // scale是UI中设置的倍速（1x, 2x等）
        this.timeScale = this.baseTimeScale * scale;
        console.log(`时间流速设置为: ${scale}x (实际比率: ${this.timeScale})`);
    }

    onHourChange(callback) {
        this.timeCallbacks.hourly.push(callback);
    }

    onDayChange(callback) {
        this.timeCallbacks.daily.push(callback);
    }

    onMonthChange(callback) {
        this.timeCallbacks.monthly.push(callback);
    }

    onYearChange(callback) {
        this.timeCallbacks.yearly.push(callback);
    }

    triggerCallbacks(type, timeData) {
        this.timeCallbacks[type].forEach(callback => {
            try {
                callback(timeData);
            } catch (error) {
                console.error(`时间${type}回调执行错误:`, error);
            }
        });
    }

    // 获取两个时间点之间的分钟差
    getMinutesBetween(time1, time2) {
        const minutes1 = time1.hour * 60 + time1.minute;
        const minutes2 = time2.hour * 60 + time2.minute;
        return Math.abs(minutes2 - minutes1);
    }

    // 检查当前时间是否在指定时间范围内
    isTimeInRange(startTime, endTime) {
        const current = this.currentTime.hour * 60 + this.currentTime.minute;
        const start = startTime.hour * 60 + startTime.minute;
        const end = endTime.hour * 60 + endTime.minute;

        if (start <= end) {
            return current >= start && current <= end;
        } else {
            // 处理跨午夜的情况
            return current >= start || current <= end;
        }
    }

    // 获取下一个特定时间点
    getNextTimePoint(hour, minute) {
        const targetMinutes = hour * 60 + minute;
        const currentMinutes = this.currentTime.hour * 60 + this.currentTime.minute;
        
        let minutesUntilTarget;
        if (targetMinutes <= currentMinutes) {
            // 如果目标时间已过，计算到明天该时间点的分钟数
            minutesUntilTarget = (24 * 60) - currentMinutes + targetMinutes;
        } else {
            minutesUntilTarget = targetMinutes - currentMinutes;
        }

        return minutesUntilTarget;
    }
} 