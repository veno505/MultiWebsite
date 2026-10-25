class GameTimeManager {
    constructor() {
        this.day = 1;
        this.daysOfWeek = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"];
        this.currentDayIndex = 0;
        this.hours = 6;
        this.minutes = 30;
        this.timeScale = 30; // 1 real second = 30 in-game seconds (2 real mins = 1 in-game hour)
        this.accumulator = 0;
        this.isPaused = false;
    }
    
    update(delta) {
        if (this.isPaused) return;
        this.accumulator += delta * this.timeScale;
        
        if (this.accumulator >= 60) {
            let minsToAdd = Math.floor(this.accumulator / 60);
            this.minutes += minsToAdd;
            this.accumulator -= minsToAdd * 60;
            
            if (this.minutes >= 60) {
                this.hours += Math.floor(this.minutes / 60);
                this.minutes = this.minutes % 60;
                
                if (this.hours >= 24) {
                    this.hours = this.hours % 24;
                    this.nextDay();
                }
            }
            this.updateUI();
            
            // Dispatch time event for schedule checks
            window.dispatchEvent(new CustomEvent('GameTimeTick', { detail: { h: this.hours, m: this.minutes } }));
        }
    }
    
    nextDay() {
        this.day++;
        this.currentDayIndex = (this.currentDayIndex + 1) % 7;
        window.dispatchEvent(new CustomEvent('GameNewDay', { detail: { day: this.day } }));
    }
    
    sleep() {
        this.hours = 6;
        this.minutes = 0;
        this.nextDay();
        this.updateUI();
    }
    
    updateUI() {
        const timeStr = `${this.hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}`;
        const dayStr = this.daysOfWeek[this.currentDayIndex];
        const elem = document.getElementById('val-time');
        if(elem) elem.innerText = `${dayStr} | ${timeStr}`;
    }
}
window.GameTimeManager = GameTimeManager;