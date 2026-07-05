// ==================== VARIABLES GLOBALES ====================
let currentEngine = 'athletic';
let selectedZone = 'top';
let chartData = [61, 66, 71, 74, 78];
let shootingData = JSON.parse(localStorage.getItem('pgSniperShootingData')) || {
    top: {made: 0, att: 0}, lw: {made: 0, att: 0}, rw: {made: 0, att: 0},
    lc: {made: 0, att: 0}, rc: {made: 0, att: 0}, mid: {made: 0, att: 0}
};

// ==================== MENU NAVIGATION ====================
function switchEngine(engineMode) {
    currentEngine = engineMode;
    document.querySelectorAll('.engine-btn').forEach(b => b.classList.remove('active'));
    if(engineMode === 'athletic') {
        document.getElementById('btnAthleticEngine').classList.add('active');
        document.getElementById('navAthletic').style.display = 'flex';
        document.getElementById('navTactical').style.display = 'none';
        document.querySelector('#navAthletic .nav-tab').click();
    } else {
        document.getElementById('btnTacticalEngine').classList.add('active');
        document.getElementById('navAthletic').style.display = 'none';
        document.getElementById('navTactical').style.display = 'flex';
        document.querySelector('#navTactical .nav-tab').click();
    }
}

function showSection(event, sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    event.target.parentNode.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
}

// ==================== ATHLETIC ENGINE ====================
function updateProfile() {
    const h = parseFloat(document.getElementById('profileHeight').value) || 178;
    const w = parseFloat(document.getElementById('profileWeight').value) || 77;
    const r = parseFloat(document.getElementById('profileReach').value) || 229;
    
    let currentVertValue = 71;
    const vertEl = document.getElementById('videoVertValue');
    if(vertEl) { currentVertValue = parseFloat(vertEl.textContent) || 71; }

    document.getElementById('pillHeight').textContent = `${h} cm`;
    document.getElementById('pillWeight').textContent = `${w.toFixed(1)} kg`;
    document.getElementById('currentVert').textContent = `${currentVertValue.toFixed(0)} cm`;
    
    const currentApex = r + currentVertValue;
    const targetRim = 320; 
    const deficit = targetRim - currentApex;

    const progressText = document.getElementById('dunkProgressText');
    const progressFill = document.getElementById('dunkProgress');

    if(deficit > 0) {
        progressText.textContent = `Manque ${deficit.toFixed(0)} cm pour le Target Apex`;
        progressText.style.color = "var(--warning)";
        progressFill.style.width = Math.max(10, Math.min(100, (currentApex / targetRim) * 100)) + '%';
    } else {
        progressText.textContent = `DUNK READY ! Surplus: +${Math.abs(deficit).toFixed(0)} cm`;
        progressText.style.color = "var(--accent)";
        progressFill.style.width = "100%";
    }
}

function calculateVideoJump() {
    const takeoff = parseFloat(document.getElementById('frameTakeoff').value) || 0;
    const landing = parseFloat(document.getElementById('frameLanding').value) || 0;
    if(landing <= takeoff) return;

    const totalFrames = landing - takeoff;
    const flightTime = totalFrames / 240; 
    const heightCm = 0.125 * 9.81 * Math.pow(flightTime, 2) * 100;

    document.getElementById('videoVertValue').textContent = heightCm.toFixed(1) + ' cm';
    document.getElementById('videoOutputs').innerHTML = `
        <div><strong>Airtime :</strong> ${flightTime.toFixed(3)} s</div>
        <div><strong>Frames de vol :</strong> ${totalFrames} frames</div>
    `;
    document.getElementById('currentVert').textContent = heightCm.toFixed(0) + ' cm';
    document.getElementById('vertProgress').style.width = Math.min(100, (heightCm / 100) * 100) + '%';
    updateProfile();
}

function calculateRSI() {
    const jump = parseFloat(document.getElementById('rsiJump').value) || 35;
    const time = parseFloat(document.getElementById('rsiTime').value) || 0.25;
    const rsi = (jump / 100) / time;

    document.getElementById('rsiValue').textContent = rsi.toFixed(2);
    document.getElementById('quickRSI').textContent = rsi.toFixed(2);

    const rating = document.getElementById('rsiRating');
    if(rsi < 1.5) { rating.textContent = "🚨 Amortisseur (Ressort Mou) : Travaille la rigidité réflexe."; rating.style.color = "var(--danger)"; }
    else if(rsi < 2.5) { rating.textContent = "⚡ Zone Adaptive Fonctionnelle."; rating.style.color = "var(--warning)"; }
    else { rating.textContent = "🚀 Rigidité Élite (Ressort d'Acier)."; rating.style.color = "var(--accent)"; }
}

// ==================== WORKOUTS & PLANNER ====================
const workouts = {
    monday: {
        title: 'Monday: Max Force & Slow SSC (Engine Construction)',
        list: [
            {n: 'Deficit DB Suitcase Deadlift', d: '4 x 6 reps. Monte sur un petit support/bloc pour augmenter l\'amplitude de tirage excentrique. Rest 2m30s.'},
            {n: 'DB Goblet 1.5-Rep Squats', d: '4 x 6-8 reps. Descends au max, remonte à moitié, redescends au fond, et explose vers le haut. Rest 2m.'}
        ]
    },
    wednesday: {
        title: 'Wednesday: Tendon Stiffness & Fast SSC (Reflex Springs)',
        list: [
            {n: 'Vertical Elastic Ankle Pogos', d: '3 x 20 reps. Genoux presque verrouillés. Rebondis comme un ressort en métal. Temps de contact cible < 200ms.'},
            {n: 'Stair Depth Jumps', d: '4 x 3 reps. Laisse-toi tomber d\'une marche d\'escalier (30cm), percute le sol pieds raides, rebondis instantanément au maximum.'}
        ]
    },
    sniper: {
        title: '🎯 The Sniper Protocol (1-Motion Fluidity)',
        list: [
            {n: '1. Form Shooting avec Sway', d: '3 x 10 tirs près du cercle. Focus absolu : épaules en arrière, pieds en avant.'},
            {n: '2. Catch & Dip Timing', d: '3 x 10 tirs (Mi-distance). Hanches ET balle descendent ensemble. Tire sans pause en haut.'},
            {n: '3. Deep Range Effortless', d: 'Commence à 3 points. Si ça rentre (Swish), recule d\'un mètre.'},
            {n: '4. One-Dribble Pull-Up', d: '10 tirs à gauche, 10 tirs à droite. Dribble très fort au sol pour armer.'}
        ]
    },
    pace: {
        title: '🛑 Pace & Space (Shifty Handling)',
        list: [
            {n: '1. The Punch Drag', d: '4 x 5 reps/côté. Sprinte à 100%. Frappe la balle au sol (Punch) en t\'arrêtant net.'},
            {n: '2. Under Drag Speed Stop', d: '4 x 5 reps/côté. Accélère, passe la balle sous ta jambe avant en reculant.'},
            {n: '3. Hostage Dribble', d: '3 x 8 reps. Passe une chaise, ralentis drastiquement, mets-la dans ton dos.'},
            {n: '4. Veer Step Finishes', d: '3 x 6 reps. Saute de côté *vers* le défenseur pour initier le contact en l\'air.'}
        ]
    }
};

function loadWorkout(day) {
    const w = workouts[day];
    if (!w) { document.getElementById('workoutDisplay').innerHTML = ''; return; }
    let html = '<ul class="exercise-list">';
    w.list.forEach(e => {
        html += `<li class="exercise-item"><div><strong>${e.n}</strong><div class="detail-text">${e.d}</div></div><button class="check-btn" onclick="this.classList.toggle('completed')"></button></li>`;
    });
    html += '</ul>';
    document.getElementById('workoutDisplay').innerHTML = `<h4>${w.title}</h4>${html}`;
}

const defaultSchedule = {
    lundi: ['Mobilité Matin & Abdos', 'Workout Solo (Pace & Space)', 'Lifting Soir & Étirements'],
    mardi: ['Mobilité Matin & Abdos', 'Dunk Workout (AM)', 'Lifting Soir & Étirements'],
    mercredi: ['Mobilité Matin & Abdos', 'Team Practice (AM)', 'Lifting Soir & Étirements'],
    jeudi: ['Mobilité Matin & Abdos', 'Récupération Active', 'Lifting Soir & Étirements'],
    vendredi: ['Mobilité Matin & Abdos', 'Shooting Léger', 'Lifting Soir & Étirements'],
    samedi: ['Game Day Focus', 'MATCH !'],
    dimanche: ['Workout Solo (Finition Trafic)', 'Étirements Profonds']
};

let mySchedule = JSON.parse(localStorage.getItem('pgFlightSchedule')) || defaultSchedule;

function renderSchedule() {
    const container = document.getElementById('weeklyScheduleContainer');
    if(!container) return;
    container.innerHTML = '';

    Object.keys(mySchedule).forEach(day => {
        let tasksHtml = '';
        mySchedule[day].forEach((task, index) => {
            tasksHtml += `
                <div class="task-item">
                    <span class="task-text">${task}</span>
                    <button class="btn-delete-task" onclick="removeTask('${day}', ${index})">×</button>
                </div>
            `;
        });

        const dayCard = `
            <div class="day-card">
                <div class="day-header">
                    <span class="day-title">${day}</span>
                </div>
                <div class="task-list" id="list-${day}">
                    ${tasksHtml}
                    <button class="btn-add-task" onclick="addTask('${day}')">+ Ajouter une session</button>
                </div>
            </div>
        `;
        container.innerHTML += dayCard;
    });
}

function addTask(day) {
    const task = prompt(`Quelle session veux-tu ajouter à ${day} ?`);
    if(task && task.trim() !== '') {
        mySchedule[day].push(task);
        localStorage.setItem('pgFlightSchedule', JSON.stringify(mySchedule));
        renderSchedule();
    }
}

function removeTask(day, index) {
    if(confirm('Supprimer cette session ?')) {
        mySchedule[day].splice(index, 1);
        localStorage.setItem('pgFlightSchedule', JSON.stringify(mySchedule));
        renderSchedule();
    }
}

// ==================== TACTICAL NEURAL ====================
const tacticsDB = {
    // ATTAQUE
    drop: { type: 'offense', title: "Under Drag Speed Stop", detail: "<strong>Read :</strong> Le pivot recule, la mi-distance est ouverte.<br><br><strong>Play :</strong> Dribble agressif, passe la balle sous la jambe pour figer tes appuis. Pull-up immédiat." },
    blitz: { type: 'offense', title: "Retreat & Pocket Pass", detail: "<strong>Read :</strong> Prise à deux agressive.<br><br><strong>Play :</strong> 2 pas chassés arrière pour étirer la défense. Passe laser au sol (Pocket) ou par-dessus l'épaule vers ton pivot." },
    under: { type: 'offense', title: "Behind The Screen Snap", detail: "<strong>Read :</strong> Défenseur passe sous l'écran.<br><br><strong>Play :</strong> Arrêt net derrière l'écran, Drop Stance bas, et tir en 1-Motion. Punis-le." },
    switch_big_off: { type: 'offense', title: "Drag Out & Isolate", detail: "<strong>Read :</strong> Le pivot adverse est sur toi.<br><br><strong>Play :</strong> Recule pour le sortir de la raquette. Utilise un In-and-Out Hesi pour figer ses pieds lourds, puis explose." },
    hedge: { type: 'offense', title: "Split The Double / Snake", detail: "<strong>Read :</strong> Le grand sort fort puis tente de reculer.<br><br><strong>Play :</strong> Divise la prise à 2 (Split) ou croise agressivement (Snake) pour lui couper la route de retour." },
    ice: { type: 'offense', title: "Reject & Attack Top Foot", detail: "<strong>Read :</strong> Le défenseur te bloque l'accès à l'écran.<br><br><strong>Play :</strong> Attaque son pied le plus haut, refuse l'écran, et drive agressivement la ligne de fond." },
    handcheck: { type: 'offense', title: "Bump & Punch Drag", detail: "<strong>Read :</strong> Il utilise ses mains et son poids vers l'avant.<br><br><strong>Play :</strong> Initie le contact épaule-torse, plante un appui sec (Punch) et recule. Tire dans l'espace." },
    overplay: { type: 'offense', title: "Drop Stance & Inside-Hand", detail: "<strong>Read :</strong> Il coupe ta main forte.<br><br><strong>Play :</strong> Attaque agressivement son pied avant (Splitting). Finis main opposée (Inside hand)." },
    cushion: { type: 'offense', title: "Float Dribble to Deep 3", detail: "<strong>Read :</strong> Il te laisse 2 mètres.<br><br><strong>Play :</strong> Endors-le avec un dribble flottant (Pace). Dès qu'il fige ses appuis, dégaine ton tir profond." },
    long_defender: { type: 'offense', title: "Veer Step & Body Initiation", detail: "<strong>Read :</strong> Défenseur avec de longs bras.<br><br><strong>Play :</strong> Saute dans son corps (Veer Step) pour désactiver sa détente en l'air." },
    quick_pest: { type: 'offense', title: "Pound Dribble & Hostage", detail: "<strong>Read :</strong> Petit défenseur nerveux.<br><br><strong>Play :</strong> Baisse ton dribble très fort (Pound). Fais un pas pour le passer, mets-le dans ton dos (Jail)." },
    face_guard: { type: 'offense', title: "V-Cut & Backdoor Door", detail: "<strong>Read :</strong> Il te tourne le dos au panier pour te refuser la balle.<br><br><strong>Play :</strong> Emmène-le loin de la balle, plante ton appui et sprinte vers le cercle (Backdoor)." },
    ball_watch: { type: 'offense', title: "45-Degree Flare Cut", detail: "<strong>Read :</strong> Il regarde le ballon.<br><br><strong>Play :</strong> Disparais de son champ de vision. Fais un Flare Cut pour te retrouver ouvert." },
    closeout_wild: { type: 'offense', title: "One-Dribble Side-Step", detail: "<strong>Read :</strong> Il sprinte hors de contrôle.<br><br><strong>Play :</strong> Pump fake, dribble latéral (Side-step) et tire." },
    zone23: { type: 'offense', title: "Gap Penetration & Kick", detail: "<strong>Read :</strong> Zone 2-3 fermée.<br><br><strong>Play :</strong> Attaque l'espace entre deux joueurs (Gap), attire l'aide et fais la passe au shooteur." },
    zone32: { type: 'offense', title: "High-Post Flash", detail: "<strong>Read :</strong> Zone 3-2.<br><br><strong>Play :</strong> Le pivot sprinte au poste franc. La zone implose. Coupe vers le cercle." },
    fastbreak_2v1: { type: 'offense', title: "Look-Off Manipulation", detail: "<strong>Read :</strong> 2 contre 1.<br><br><strong>Play :</strong> Regarde le panier intensément (Look-off). S'il monte sur toi, passe. S'il recule, lay-up." },
    press_full: { type: 'offense', title: "Middle Lane & Advance Pass", detail: "<strong>Read :</strong> Pression tout terrain.<br><br><strong>Play :</strong> Ne garde pas la balle. Fais la passe vers l'avant puis sprinte dans le couloir central." },

    // DEFENSE
    shifty: { type: 'defense', title: "Angle Cut-off & Chest Alignment", detail: "<strong>Read :</strong> Meneur ultra-rapide.<br><br><strong>Play :</strong> Regarde son nombril. Fais un pas de glissement pour couper l'angle de son épaule." },
    heavy: { type: 'defense', title: "Low Leverage & Legal Bump", detail: "<strong>Read :</strong> Arrière lourd.<br><br><strong>Play :</strong> Frappe le premier avec ton avant-bras sur sa hanche avant qu'il ne s'organise." },
    shooter: { type: 'defense', title: "Top-Lock & Trail Pursuit", detail: "<strong>Read :</strong> Shooteur d'élite.<br><br><strong>Play :</strong> Refuse-lui l'accès à la balle (Top-Lock). S'il prend un écran, poursuis-le collé dans son dos (Trail)." },
    slasher: { type: 'defense', title: "Sag Off & Play Angles", detail: "<strong>Read :</strong> Ne sait pas shooter.<br><br><strong>Play :</strong> Laisse-lui 1m50. Protège l'accès à la raquette." },
    chasing_screens: { type: 'defense', title: "Lock & Trail", detail: "<strong>Read :</strong> Poursuite sur écrans.<br><br><strong>Play :</strong> Ne passe jamais sous l'écran. Colle ton épaule à sa hanche et suis-le." },
    low_man: { type: 'defense', title: "Early Tag & Recover", detail: "<strong>Read :</strong> Le pivot adverse roule vers le cercle.<br><br><strong>Play :</strong> Viens cogner (Tag) le pivot pour ruiner sa course, puis sprinte pour récupérer ton joueur." },
    nail_help: { type: 'defense', title: "Dig & Recover", detail: "<strong>Read :</strong> Aide à The Nail.<br><br><strong>Play :</strong> Fais une fausse attaque sur le ballon (Stunt/Dig) pour le faire paniquer." },
    tall_post: { type: 'defense', title: "Post Fronting & Pull The Chair", detail: "<strong>Read :</strong> Un grand te poste.<br><br><strong>Play :</strong> Passe devant lui pour empêcher la passe. S'il te pousse, esquive l'impact (Pull the chair)." },
    wing_post: { type: 'defense', title: "Arm-Bar & Leverage", detail: "<strong>Read :</strong> Ailier te poste.<br><br><strong>Play :</strong> Avant-bras dans le creux de son dos. Garde un centre de gravité bas." },
    switch_big_def: { type: 'defense', title: "Speed Harassment & Stunt", detail: "<strong>Read :</strong> Isolé sur un Pivot au large.<br><br><strong>Play :</strong> Harcèle son dribble, force-le à paniquer." }
};

function triggerRead(mode, val) {
    const out = document.getElementById('universalReadOutput');
    const badge = document.getElementById('readBadge');
    const title = document.getElementById('readMoveTitle');
    const details = document.getElementById('readMoveDetail');

    document.querySelectorAll('#live-reads select').forEach(s => { if (s.value !== val) s.value = ""; });

    if (!val) { out.classList.remove('show'); return; }

    const data = tacticsDB[val];
    if (!data) return;

    out.classList.add('show');
    title.textContent = data.title;
    details.innerHTML = data.detail;

    if (data.type === 'offense') {
        badge.textContent = "OFFENSIVE READ";
        badge.style.background = "var(--primary)";
        out.style.borderColor = "var(--primary)";
    } else {
        badge.textContent = "DEFENSIVE READ";
        badge.style.background = "var(--accent)";
        out.style.borderColor = "var(--accent)";
    }
}

// ==================== SNIPER HEATMAP ====================
function selectZone(zoneKey) {
    selectedZone = zoneKey;
    document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`zone-${zoneKey}`).classList.add('active');
}

function addShot(isHit) {
    shootingData[selectedZone].att++;
    if(isHit) shootingData[selectedZone].made++;
    localStorage.setItem('pgSniperShootingData', JSON.stringify(shootingData));
    updateCourtDisplay();
}

function resetZoneStats() {
    if(confirm("Réinitialiser les données de cette zone ?")) {
        shootingData[selectedZone] = {made: 0, att: 0};
        localStorage.setItem('pgSniperShootingData', JSON.stringify(shootingData));
        updateCourtDisplay();
    }
}

function updateCourtDisplay() {
    Object.keys(shootingData).forEach(key => {
        const z = shootingData[key];
        const pct = z.att > 0 ? Math.round((z.made / z.att) * 100) : 0;
        const element = document.getElementById(`stat-${key}`);
        const btn = document.getElementById(`zone-${key}`);
        
        element.innerHTML = `${z.made}/${z.att} <span style="font-size:0.75rem; display:block; color:rgba(255,255,255,0.8);">${pct}%</span>`;
        
        if (z.att >= 5) {
            if (pct >= 45) {
                btn.style.background = 'rgba(220, 38, 38, 0.4)'; 
                btn.style.borderColor = 'rgba(220, 38, 38, 0.8)';
            } else if (pct >= 33) {
                btn.style.background = 'rgba(245, 158, 11, 0.4)'; 
                btn.style.borderColor = 'rgba(245, 158, 11, 0.8)';
            } else {
                btn.style.background = 'rgba(37, 99, 235, 0.4)'; 
                btn.style.borderColor = 'rgba(37, 99, 235, 0.8)';
            }
        } else {
            btn.style.background = 'rgba(0,0,0,0.4)';
            btn.style.borderColor = 'var(--card-border)';
        }
    });
}

// ==================== COACHBOARD ENGINE ====================
let currentPlayId = "";
let animationInterval;
let currentFrame = 0;

const coachboardDB = {
    spacing_5out: {
        description: "<strong>Le 5-Out (Pass & Cut) :</strong> Le placement roi du basket moderne. Personne dans la raquette.<br><br>💡 <em>Tip Coach pour l'équipe :</em> Restez sur la ligne des 3 points. Si le meneur (1) drive, on ne le regarde pas bêtement. Si on fait une passe, on coupe AU SPRINT vers le panier puis on ressort.",
        frames: [
            { o1:[50,20], o2:[15,45], o3:[85,45], o4:[10,85], o5:[90,85], ball:[50,20] }, 
            { o1:[30,30], o2:[15,45], o3:[85,45], o4:[10,85], o5:[90,85], ball:[30,30] }, 
            { o1:[50,85], o2:[15,45], o3:[85,45], o4:[10,85], o5:[90,85], ball:[15,45] }, 
            { o1:[90,85], o2:[15,45], o3:[85,45], o4:[10,85], o5:[50,20], ball:[15,45] }  
        ]
    },
    spacing_4out: {
        description: "<strong>4-Out 1-In (Le Dunker Spot) :</strong> 4 joueurs au large, 1 pivot (5) caché sur la ligne de fond derrière l'arceau.<br><br>💡 <em>Tip pour le Pivot :</em> Ne reste JAMAIS au poste bas à réclamer la balle si ton meneur drive. Cache-toi dans le 'Dunker Spot'. Si le contreur monte sur le meneur, tu seras seul pour la passe lobée.",
        frames: [
            { o1:[50,20], o2:[15,45], o3:[85,45], o4:[15,85], o5:[35,90], d1:[50,30], d5:[50,80], ball:[50,20] }, 
            { o1:[35,60], o2:[15,45], o3:[85,45], o4:[15,85], o5:[35,90], d1:[40,50], d5:[50,80], ball:[35,60] }, 
            { o1:[40,75], o2:[15,45], o3:[85,45], o4:[15,85], o5:[35,90], d1:[45,60], d5:[45,75], ball:[40,75] }, 
            { o1:[40,80], o2:[15,45], o3:[85,45], o4:[15,85], o5:[50,85], d1:[45,60], d5:[45,75], ball:[50,85] }  
        ]
    },
    spacing_pnr_rules: {
        description: "<strong>Les Règles du P&R (Lift & Drift) :</strong> Comment les shooteurs doivent bouger pendant un écran.<br><br>💡 <em>Tip pour l'équipe :</em> Si le meneur vient VERS vous = 'Drift' (Glissez dans le corner). S'il s'éloigne de vous = 'Lift' (Montez à 45°). Toujours être dans son champ de vision !",
        frames: [
            { o1:[30,30], o2:[10,85], o3:[90,85], o4:[85,45], o5:[35,35], ball:[30,30] }, 
            { o1:[50,40], o2:[15,45], o3:[90,85], o4:[85,45], o5:[40,50], ball:[50,40] }, 
            { o1:[70,55], o2:[20,40], o3:[90,85], o4:[90,85], o5:[50,75], ball:[70,55] }, 
            { o1:[70,55], o2:[20,40], o3:[90,85], o4:[90,85], o5:[50,75], ball:[90,85] }  
        ]
    },
    spain_pnr: {
        description: "<strong>Spain Pick & Roll :</strong> L'arme absolue en EuroLeague.<br><br>💡 <em>Le Play :</em> O1 prend l'écran de O5. O5 roule. O2 vient poser un écran aveugle sur le défenseur de O5. La défense implose.",
        frames: [
            { o1:[50,15], o2:[50,45], o3:[15,85], o4:[85,85], o5:[40,25], d1:[50,22], d2:[50,52], d3:[20,80], d4:[80,80], d5:[40,32], ball:[50,15] },
            { o1:[30,35], o2:[50,45], o3:[15,85], o4:[85,85], o5:[45,22], d1:[40,25], d2:[50,52], d3:[20,80], d4:[80,80], d5:[40,32], ball:[30,35] },
            { o1:[25,60], o2:[45,35], o3:[15,85], o4:[85,85], o5:[50,50], d1:[35,45], d2:[55,45], d3:[20,80], d4:[80,80], d5:[45,40], ball:[25,60] },
            { o1:[20,70], o2:[50,20], o3:[15,85], o4:[85,85], o5:[50,85], d1:[30,60], d2:[50,30], d3:[25,75], d4:[80,80], d5:[45,55], ball:[50,85] }
        ]
    },
    horns_flare: {
        description: "<strong>Horns Flare :</strong> Formation 'Cornes' (O4 et O5 aux coudes).<br><br>💡 <em>Le Play :</em> O1 utilise l'écran de O4. O5 va poser un écran 'Flare' (dans le dos) pour libérer O4 à 3 points.",
        frames: [
            { o1:[50,20], o2:[10,85], o3:[90,85], o4:[35,50], o5:[65,50], ball:[50,20] },
            { o1:[25,40], o2:[10,85], o3:[90,85], o4:[45,45], o5:[65,50], ball:[25,40] },
            { o1:[20,50], o2:[10,85], o3:[90,85], o4:[60,35], o5:[45,45], ball:[20,50] }, 
            { o1:[20,50], o2:[10,85], o3:[90,85], o4:[75,30], o5:[50,55], ball:[75,30] }  
        ]
    },
    pistol_action: {
        description: "<strong>Pistol (21 Action) :</strong> Transition rapide sur le côté.<br><br>💡 <em>Le Play :</em> O1 passe à O2 sur l'aile et sprinte derrière lui. O5 arrive lancé pour un écran sur O2.",
        frames: [
            { o1:[25,25], o2:[15,50], o3:[90,85], o4:[85,45], o5:[50,30], ball:[25,25] },
            { o1:[15,40], o2:[15,50], o3:[90,85], o4:[85,45], o5:[50,40], ball:[15,50] }, 
            { o1:[10,60], o2:[25,50], o3:[90,85], o4:[85,45], o5:[30,55], ball:[25,50] }, 
            { o1:[15,80], o2:[45,65], o3:[90,85], o4:[85,45], o5:[30,75], ball:[45,65] }  
        ]
    },
    zone23_overload: {
        description: "<strong>Surcharge (Overload) vs Zone 2-3 :</strong> L'art de briser la défense de zone.<br><br>💡 <em>Le Play :</em> Forcer l'arrière et l'ailier de la zone à se resserrer sur un seul joueur, puis inonder leur côté avec 3 attaquants.",
        frames: [
            { o1:[50,15], o2:[15,35], o3:[85,35], o4:[15,85], o5:[85,85], d1:[35,35], d2:[65,35], d3:[20,75], d4:[80,75], d5:[50,80], ball:[50,15] },
            { o1:[70,40], o2:[15,50], o3:[85,35], o4:[15,85], o5:[70,70], d1:[50,45], d2:[75,45], d3:[20,75], d4:[80,70], d5:[50,80], ball:[70,40] },
            { o1:[65,50], o2:[15,50], o3:[90,40], o4:[85,90], o5:[60,75], d1:[55,50], d2:[85,45], d3:[30,65], d4:[85,65], d5:[60,85], ball:[90,40] },
            { o1:[65,50], o2:[15,50], o3:[85,35], o4:[90,90], o5:[50,80], d1:[60,40], d2:[80,35], d3:[40,65], d4:[90,75], d5:[70,85], ball:[90,90] }
        ]
    },
    zone23_highpost: {
        description: "<strong>Flash Poste Franc vs Zone 2-3 :</strong> Le point faible fatal de la 2-3 est au milieu.<br><br>💡 <em>Tip Coach :</em> Le pivot (O5) doit sprinter au milieu de la raquette. Dès qu'il a la balle, la zone entière se replie sur lui.",
        frames: [
            { o1:[50,20], o2:[15,45], o3:[85,45], o4:[15,85], o5:[85,85], d1:[35,35], d2:[65,35], d3:[20,75], d4:[80,75], d5:[50,80], ball:[50,20] },
            { o1:[30,30], o2:[15,45], o3:[85,45], o4:[15,85], o5:[50,55], d1:[30,40], d2:[60,40], d3:[20,75], d4:[80,75], d5:[50,75], ball:[30,30] }, 
            { o1:[30,30], o2:[15,45], o3:[85,45], o4:[15,85], o5:[50,55], d1:[35,45], d2:[60,45], d3:[35,65], d4:[65,65], d5:[50,70], ball:[50,55] }, 
            { o1:[30,30], o2:[15,45], o3:[50,85], o4:[15,85], o5:[50,55], d1:[35,45], d2:[60,45], d3:[35,65], d4:[65,65], d5:[50,70], ball:[50,85] }  
        ]
    },
    zone32_baseline: {
        description: "<strong>Baseline Runner vs Zone 3-2 :</strong> La 3-2 bloque la ligne à 3 pts mais le fond du terrain est vulnérable.<br><br>💡 <em>Le Play :</em> Un joueur (O4) sprinte sur toute la ligne de fond de gauche à droite.",
        frames: [
            { o1:[50,20], o2:[20,40], o3:[80,40], o4:[15,85], o5:[50,60], d1:[50,35], d2:[25,45], d3:[75,45], d4:[35,75], d5:[65,75], ball:[50,20] },
            { o1:[30,25], o2:[20,40], o3:[80,40], o4:[50,90], o5:[50,60], d1:[40,35], d2:[25,45], d3:[75,45], d4:[45,75], d5:[65,75], ball:[30,25] }, 
            { o1:[30,25], o2:[20,40], o3:[80,40], o4:[85,85], o5:[50,60], d1:[40,35], d2:[25,45], d3:[75,45], d4:[45,75], d5:[75,70], ball:[85,85] }, 
            { o1:[30,25], o2:[20,40], o3:[70,50], o4:[85,85], o5:[50,60], d1:[40,35], d2:[25,45], d3:[75,45], d4:[45,75], d5:[75,70], ball:[85,85] }  
        ]
    },
    press_14_flat: {
        description: "<strong>1-4 Flat Press Break :</strong> Contre une défense tout-terrain ou une zone press.<br><br>💡 <em>Tip Coach :</em> Les 4 joueurs s'alignent à hauteur des lancers francs. Coupes croisées explosives.",
        frames: [
            { o1:[50,95], o2:[20,70], o3:[40,70], o4:[60,70], o5:[80,70], d1:[50,85], d2:[25,65], d3:[45,65], d4:[65,65], d5:[85,65], ball:[50,95] }, 
            { o1:[50,95], o2:[40,85], o3:[20,50], o4:[80,50], o5:[60,85], d1:[50,85], d2:[40,80], d3:[25,55], d4:[80,55], d5:[60,80], ball:[50,95] }, 
            { o1:[50,95], o2:[40,85], o3:[20,50], o4:[80,50], o5:[60,85], d1:[50,85], d2:[40,80], d3:[25,55], d4:[80,55], d5:[60,80], ball:[40,85] }, 
            { o1:[20,80], o2:[40,70], o3:[20,50], o4:[80,50], o5:[60,85], d1:[30,75], d2:[40,65], d3:[25,55], d4:[80,55], d5:[60,80], ball:[40,70] }  
        ]
    }
};

function renderFrame(frame) {
    const keys = ['o1','o2','o3','o4','o5','d1','d2','d3','d4','d5','ball'];
    keys.forEach(key => {
        const node = document.getElementById(key === 'ball' ? 'ballNode' : key);
        if(frame[key] && node) {
            node.style.opacity = 1; 
            node.style.left = `${frame[key][0]}%`;
            node.style.top = `${frame[key][1]}%`;
        }
    });
}

function loadPlay(playId) {
    clearInterval(animationInterval);
    currentPlayId = playId;
    currentFrame = 0;
    
    if(!playId) {
        document.getElementById('playDescription').textContent = "Sélectionne un système pour voir la description et lancer l'animation tactique.";
        document.querySelectorAll('.player-node, .ball-node').forEach(n => n.style.opacity = 0);
        return;
    }

    const playData = coachboardDB[playId];
    document.getElementById('playDescription').innerHTML = playData.description;
    
    document.querySelectorAll('.player-node').forEach(n => n.style.transition = 'none');
    document.getElementById('ballNode').style.transition = 'none';
    
    renderFrame(playData.frames[0]);
    
    setTimeout(() => {
        document.querySelectorAll('.player-node').forEach(n => n.style.transition = 'top 1s cubic-bezier(0.4, 0, 0.2, 1), left 1s cubic-bezier(0.4, 0, 0.2, 1)');
        document.getElementById('ballNode').style.transition = 'top 0.6s linear, left 0.6s linear';
    }, 50);
}

function playAnimation() {
    if(!currentPlayId) return;
    clearInterval(animationInterval);
    currentFrame = 1; 
    const frames = coachboardDB[currentPlayId].frames;
    
    renderFrame(frames[currentFrame]); 
    
    animationInterval = setInterval(() => {
        currentFrame++;
        if(currentFrame >= frames.length) {
            clearInterval(animationInterval);
            return;
        }
        renderFrame(frames[currentFrame]);
    }, 1500); 
}

function resetAnimation() {
    if(!currentPlayId) return;
    clearInterval(animationInterval);
    loadPlay(currentPlayId); 
}


// ==================== LIVE GEMINI API ENGINE ====================
async function askGemini() {
    const apiKey = document.getElementById('geminiApiKey').value;
    const energy = document.getElementById('liveEnergy').value;
    const time = document.getElementById('liveTime').value;
    const needs = document.getElementById('liveNeeds').value;

    if (!apiKey) { alert("⚠️ Tu dois entrer ta clé API Gemini !"); return; }
    if (!needs) { alert("⚠️ Décris tes besoins ou blocages du jour."); return; }

    const btn = document.getElementById('btnGemini');
    const loading = document.getElementById('aiLoading');
    const responseBox = document.getElementById('aiLiveResponseBox');
    const responseText = document.getElementById('aiLiveResponseText');

    btn.disabled = true;
    loading.style.display = 'block';
    responseBox.classList.remove('show');

    const promptData = `Tu es un coach NBA d'élite. Je suis un meneur de 1m78 évoluant à Madagascar. 
    - Énergie : ${energy}/10
    - Temps dispo : ${time} minutes
    - Mes besoins/focus : "${needs}"
    Conçois ma séance sur-mesure (Échauffement, Exercices précis, Fin). Utilise du vocabulaire basket. Format concis et lisible.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptData }] }] })
        });

        const data = await response.json();
        
        if (data.error) {
            responseText.innerHTML = `<span style="color:var(--danger)">Erreur API : ${data.error.message}</span>`;
        } else {
            let aiText = data.candidates[0].content.parts[0].text;
            aiText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--primary);">$1</strong>');
            aiText = aiText.replace(/\*(.*?)/g, '<br>• $1'); 
            responseText.innerHTML = aiText;
        }
    } catch (error) {
        responseText.innerHTML = `<span style="color:var(--danger)">Erreur de connexion internet.</span>`;
    } finally {
        btn.disabled = false;
        loading.style.display = 'none';
        responseBox.classList.add('show');
    }
}

function saveApiKey() {
    const key = document.getElementById('geminiApiKey').value;
    localStorage.setItem('geminiApiKeyLocal', key);
}

let timerSeconds = 120, timerInterval, timerRunning = false;
function updateTimerDisplay() {
    document.getElementById('mainTimer').textContent = `${Math.floor(timerSeconds/60).toString().padStart(2,'0')}:${(timerSeconds%60).toString().padStart(2,'0')}`;
}
function startTimer() { if (!timerRunning) { timerRunning = true; timerInterval = setInterval(() => { if(timerSeconds > 0) { timerSeconds--; updateTimerDisplay(); } else { pauseTimer(); alert("Fin de récup ! Au combat."); } }, 1000); } }
function pauseTimer() { timerRunning = false; clearInterval(timerInterval); }
function resetTimer() { pauseTimer(); timerSeconds = 120; updateTimerDisplay(); }
function setTimer(s) { resetTimer(); timerSeconds = s; updateTimerDisplay(); startTimer(); }

function updateChart() {
    const area = document.getElementById('progressChart'); area.innerHTML = '';
    if (chartData.length === 0) return;
    const max = Math.max(...chartData);
    chartData.forEach((v, i) => {
        const col = document.createElement('div'); col.className = 'chart-column'; col.style.height = `${(v/max)*90}%`;
        col.innerHTML = `<span class="chart-value">${v}cm</span><span class="chart-label">P-${i+1}</span>`;
        area.appendChild(col);
    });
}
function addDataPoint() { const v = prompt("Rentre ta détente calculée (cm) :"); if(v && !isNaN(v)) { chartData.push(parseInt(v)); updateChart(); } }
function clearChart() { chartData = []; updateChart(); }

// INIT
document.addEventListener('DOMContentLoaded', () => {
    updateProfile();
    calculateVideoJump();
    calculateRSI();
    updateCourtDisplay();
    selectZone('top');
    loadWorkout('');
    updateChart();
    renderSchedule();
    
    const savedKey = localStorage.getItem('geminiApiKeyLocal');
    if(savedKey && document.getElementById('geminiApiKey')) {
        document.getElementById('geminiApiKey').value = savedKey;
    }
});
