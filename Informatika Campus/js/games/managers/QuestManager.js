class QuestManager {
    constructor() {
        this.currentObjective = "";
        this.questState = "WAKE_UP"; 
        /* 
        States: WAKE_UP, GO_TO_CAMPUS, ATTEND_CLASS, GO_TO_ORGANIZATION, COMBAT_TRAINING, GO_HOME, SLEEP
        */
    }
    
    init() {
        this.setObjective("Bersiap dan pergi ke kampus.");
    }
    
    setObjective(text) {
        this.currentObjective = text;
        const elem = document.getElementById('val-objective');
        if(elem) elem.innerText = text;
        GameState.notify("📝 Objective Updated: " + text);
    }
    
    advanceQuest(trigger) {
        switch(this.questState) {
            case "WAKE_UP":
                if (trigger === "ARRIVED_CAMPUS") {
                    this.questState = "ATTEND_CLASS";
                    this.setObjective("Bicara dengan teman & masuk Kelas Algoritma (08:00)");
                }
                break;
            case "ATTEND_CLASS":
                if (trigger === "CLASS_FINISHED") {
                    this.questState = "GO_TO_ORGANIZATION";
                    this.setObjective("Kuliah selesai. Pergi ke Markas Organisasi Unit Taktis (17:00)");
                }
                break;
            case "GO_TO_ORGANIZATION":
                if (trigger === "ARRIVED_ORGANIZATION") {
                    this.questState = "COMBAT_TRAINING";
                    this.setObjective("Latihan Menembak: Kalahkan 3 Bug Zombie!");
                }
                break;
            case "COMBAT_TRAINING":
                if (trigger === "TRAINING_FINISHED") {
                    this.questState = "GO_HOME";
                    this.setObjective("Latihan selesai. Pulang ke kos.");
                }
                break;
            case "GO_HOME":
                if (trigger === "ARRIVED_KOS") {
                    this.questState = "SLEEP";
                    this.setObjective("Tidur di kasur untuk mengakhiri hari.");
                }
                break;
            case "SLEEP":
                if (trigger === "SLEPT") {
                    this.questState = "WAKE_UP";
                    this.setObjective("Bersiap dan pergi ke kampus.");
                }
                break;
        }
    }
}
window.QuestManager = QuestManager;