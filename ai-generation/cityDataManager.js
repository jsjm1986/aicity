class CityDataManager {
    constructor() {
        this.cityData = null;
        this.dataVersion = 0;
    }

    async loadCityData(generator, cityType, population) {
        try {
            this.cityData = await generator.generateCity(cityType, population);
            this.dataVersion++;
            this.saveCityData();
            return this.cityData;
        } catch (error) {
            console.error('加载城市数据失败:', error);
            throw error;
        }
    }

    saveCityData() {
        try {
            localStorage.setItem('cityData', JSON.stringify({
                data: this.cityData,
                version: this.dataVersion,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('保存城市数据失败:', error);
        }
    }

    loadSavedCityData() {
        try {
            const saved = JSON.parse(localStorage.getItem('cityData'));
            if (saved && saved.data) {
                this.cityData = saved.data;
                this.dataVersion = saved.version;
                return true;
            }
            return false;
        } catch (error) {
            console.error('读取保存的城市数据失败:', error);
            return false;
        }
    }

    getCityData() {
        return this.cityData;
    }

    getProfessionDistribution() {
        return this.cityData?.professions || [];
    }

    getBuildingDistribution() {
        return this.cityData?.buildings || [];
    }

    getCityProfile() {
        return this.cityData?.cityProfile || null;
    }
} 