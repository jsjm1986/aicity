class Road {
    constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.width = 10;
        this.type = this.determineRoadType();
    }

    determineRoadType() {
        const length = Math.hypot(this.endX - this.startX, this.endY - this.startY);
        if (length > 500) return 'main';     // 主干道
        if (length > 200) return 'secondary'; // 次干道
        return 'local';                       // 支路
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.getRoadColor();
        ctx.lineWidth = this.getRoadWidth();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();
    }

    getRoadColor() {
        switch(this.type) {
            case 'main': return '#444';      // 主干道颜色
            case 'secondary': return '#333';  // 次干道颜色
            default: return '#222';           // 支路颜色
        }
    }

    getRoadWidth() {
        switch(this.type) {
            case 'main': return this.width * 1.5;      // 主干道宽度
            case 'secondary': return this.width * 1.2;  // 次干道宽度
            default: return this.width;                 // 支路宽度
        }
    }
} 