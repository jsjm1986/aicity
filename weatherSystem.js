class WeatherSystem {
    constructor() {
        // 天气类型及其属性
        this.weatherTypes = {
            '晴天': {
                temperature: { min: 20, max: 30 },
                humidity: { min: 30, max: 50 },
                windSpeed: { min: 0, max: 15 },
                precipitation: 0,
                cloudCover: 0,
                effects: {
                    mood: 1.2,
                    energy: 1.1,
                    speedMultiplier: 1.0,
                    socialMultiplier: 1.2
                }
            },
            '多云': {
                temperature: { min: 18, max: 25 },
                humidity: { min: 40, max: 60 },
                windSpeed: { min: 5, max: 20 },
                precipitation: 0,
                cloudCover: 0.5,
                effects: {
                    mood: 1.0,
                    energy: 1.0,
                    speedMultiplier: 1.0,
                    socialMultiplier: 1.0
                }
            },
            '雨天': {
                temperature: { min: 15, max: 20 },
                humidity: { min: 70, max: 90 },
                windSpeed: { min: 10, max: 30 },
                precipitation: 0.5,
                cloudCover: 0.8,
                effects: {
                    mood: 0.8,
                    energy: 0.9,
                    speedMultiplier: 0.8,
                    socialMultiplier: 0.7
                }
            },
            '雷暴': {
                temperature: { min: 12, max: 18 },
                humidity: { min: 80, max: 100 },
                windSpeed: { min: 25, max: 50 },
                precipitation: 0.9,
                cloudCover: 1.0,
                effects: {
                    mood: 0.6,
                    energy: 0.7,
                    speedMultiplier: 0.6,
                    socialMultiplier: 0.5
                }
            },
            '雾天': {
                temperature: { min: 10, max: 15 },
                humidity: { min: 85, max: 100 },
                windSpeed: { min: 0, max: 10 },
                precipitation: 0.1,
                cloudCover: 0.7,
                effects: {
                    mood: 0.9,
                    energy: 0.9,
                    speedMultiplier: 0.7,
                    socialMultiplier: 0.8
                }
            }
        };

        // 当前天气状态
        this.currentWeather = '晴天';
        this.currentTemperature = 25;
        this.currentHumidity = 40;
        this.currentWindSpeed = 10;
        this.lastUpdate = Date.now();
        this.weatherDuration = 1000 * 60 * 30; // 30分钟更换一次天气
    }

    initialize() {
        console.log('初始化天气系统...');
        this.updateWeather();
        console.log('天气系统初始化完成');
    }

    update(deltaTime) {
        const now = Date.now();
        if (now - this.lastUpdate > this.weatherDuration) {
            this.updateWeather();
            this.lastUpdate = now;
        }
    }

    updateWeather() {
        // 随机选择新天气
        const weatherTypes = Object.keys(this.weatherTypes);
        const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        
        // 如果天气改变，更新所有相关参数
        if (newWeather !== this.currentWeather) {
            this.currentWeather = newWeather;
            const weatherData = this.weatherTypes[newWeather];
            
            // 在范围内随机生成具体数值
            this.currentTemperature = this.randomInRange(
                weatherData.temperature.min,
                weatherData.temperature.max
            );
            
            this.currentHumidity = this.randomInRange(
                weatherData.humidity.min,
                weatherData.humidity.max
            );
            
            this.currentWindSpeed = this.randomInRange(
                weatherData.windSpeed.min,
                weatherData.windSpeed.max
            );

            console.log('天气更新:', {
                type: this.currentWeather,
                temperature: this.currentTemperature,
                humidity: this.currentHumidity,
                windSpeed: this.currentWindSpeed
            });
        }
    }

    getCurrentWeather() {
        return {
            type: this.currentWeather,
            temperature: Math.round(this.currentTemperature),
            humidity: Math.round(this.currentHumidity),
            windSpeed: Math.round(this.currentWindSpeed),
            effects: this.weatherTypes[this.currentWeather].effects
        };
    }

    getWeatherEffect() {
        return this.weatherTypes[this.currentWeather].effects;
    }

    randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    // 获取天气描述
    getWeatherDescription() {
        const weather = this.getCurrentWeather();
        return `${weather.type}, ${weather.temperature}°C, 湿度${weather.humidity}%, 风速${weather.windSpeed}km/h`;
    }

    // 获取天气对心情的影响
    getMoodEffect() {
        return this.weatherTypes[this.currentWeather].effects.mood;
    }

    // 获取天气对能量的影响
    getEnergyEffect() {
        return this.weatherTypes[this.currentWeather].effects.energy;
    }

    // 获取天气对移动速度的影响
    getSpeedMultiplier() {
        return this.weatherTypes[this.currentWeather].effects.speedMultiplier;
    }

    // 获取天气对社交的影响
    getSocialMultiplier() {
        return this.weatherTypes[this.currentWeather].effects.socialMultiplier;
    }

    // 判断当前是否适合室外活动
    isOutdoorActivitySuitable() {
        return this.currentWeather === '晴天' || this.currentWeather === '多云';
    }

    // 获取天气预警级别
    getWeatherAlertLevel() {
        switch (this.currentWeather) {
            case '雷暴':
                return 'high';
            case '雨天':
                return 'medium';
            case '雾天':
                return 'low';
            default:
                return 'none';
        }
    }
} 