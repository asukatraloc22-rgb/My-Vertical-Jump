
        // Global System Variables
        let currentEngine = 'athletic';
        let selectedZone = 'top';
        let chartData = [61, 66, 71, 74, 78];
        let shootingData = JSON.parse(localStorage.getItem('pgSniperShootingData')) || {
            top: {made: 0, att: 0}, lw: {made: 0, att: 0}, rw: {made: 0, att: 0},
            lc: {made: 0, att: 0}, rc: {made: 0, att: 0}, mid: {made: 0, att: 0}
        };

        // Service Worker Safe Connection Protocol
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Error: ', err));
            });
        }

        // Engine Routing System
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

        // Athletic Calculations & Physical Profiles
        function updateProfile() {
            const h = parseFloat(document.getElementById('profileHeight').value) || 178;
            const w = parseFloat(document.getElementById('profileWeight').value) || 77;
            const r = parseFloat(document.getElementById('profileReach').value) || 229;
            
            // Fix: Récupération sécurisée pour éviter l'erreur
            let currentVertValue = 71;
            const vertEl = document.getElementById('videoVertValue');
            if(vertEl) {
                currentVertValue = parseFloat(vertEl.textContent) || 71;
            }

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
            
            // Fix: Récupération sécurisée du squat pour éviter l'erreur
            const squatEl = document.getElementById('currentSquat');
            const currentSquatLoad = squatEl ? (parseFloat(squatEl.value) || 90) : 90;
            document.getElementById('quickSquat').textContent = `${(currentSquatLoad / w).toFixed(2)}x`;
        }

        function calculateVideoJump() {
            const takeoff = parseFloat(document.getElementById('frameTakeoff').value) || 0;
            const landing = parseFloat(document.getElementById('frameLanding').value) || 0;
            if(landing <= takeoff) return;

            const totalFrames = landing - takeoff;
            const flightTime = totalFrames / 240; // Pixel 7 Pro ultra slow-mo standard
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

        // Tactical Autonomous Sniper Tracker Map Engine
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
                
                // Mise à jour du texte
                element.innerHTML = `${z.made}/${z.att} <span style="font-size:0.75rem; display:block; color:rgba(255,255,255,0.8);">${pct}%</span>`;
                
                // Moteur Heatmap (Actif après 5 tirs minimum par zone)
                if (z.att >= 5) {
                    if (pct >= 45) {
                        btn.style.background = 'rgba(220, 38, 38, 0.4)'; // Hot (Rouge)
                        btn.style.borderColor = 'rgba(220, 38, 38, 0.8)';
                    } else if (pct >= 33) {
                        btn.style.background = 'rgba(245, 158, 11, 0.4)'; // Warm (Orange)
                        btn.style.borderColor = 'rgba(245, 158, 11, 0.8)';
                    } else {
                        btn.style.background = 'rgba(37, 99, 235, 0.4)'; // Cold (Bleu)
                        btn.style.borderColor = 'rgba(37, 99, 235, 0.8)';
                    }
                } else {
                    btn.style.background = 'rgba(0,0,0,0.4)'; // Neutre
                    btn.style.borderColor = 'var(--card-border)';
                }
            });
        }

        // Live Algorithmic Decisions Trees
        // ---------------------------------------------------------
        // THE ULTIMATE IQ SIMULATOR (Offense & Defense)
        // ---------------------------------------------------------
        const tacticsDB = {
            // --- OFFENSE ---
            drop: { type: 'offense', title: "The Under Drag Speed Stop (Kyrie Kill)", detail: "<strong>Read :</strong> Le pivot recule, la mi-distance est ouverte.<br><br><strong>Play :</strong> Dribble agressif vers l'avant, bloque tes appuis en passant la balle sous la jambe. Pull-up immédiat. Séquençage fluide." },
            blitz: { type: 'offense', title: "Retreat Dribble & Pocket Pass", detail: "<strong>Read :</strong> Prise à deux agressive pour t'asphyxier.<br><br><strong>Play :</strong> Ne panique pas. Fais 2 pas chassés arrière (Retreat) pour étirer leur défense. Dès que l'angle s'ouvre, lâche une passe laser au sol (Pocket Pass) vers ton pivot qui roule." },
            under: { type: 'offense', title: "Behind The Screen Snap", detail: "<strong>Read :</strong> Le défenseur passe sous l'écran, reniant ton tir.<br><br><strong>Play :</strong> Sanction immédiate. Arrêt net derrière l'écran, Drop Stance bas, et tir en 1-Motion. Tu dois les punir pour ce manque de respect." },
            handcheck: { type: 'offense', title: "Physical Bump & Punch Drag", detail: "<strong>Read :</strong> Défenseur collé qui utilise ses mains et son poids vers l'avant.<br><br><strong>Play :</strong> Initie un contact épaule-torse pour le forcer à résister. Plante un appui sec (Punch) et recule. Son poids va l'entraîner vers l'avant. Tire dans l'espace créé." },
            overplay: { type: 'offense', title: "Drop Stance & Inside-Hand Layup", detail: "<strong>Read :</strong> Il oriente son corps pour te couper ta main forte.<br><br><strong>Play :</strong> Drop stance immédiat. Attaque agressivement son pied avant (Splitting the feet). Passe l'épaule et finis main opposée (Inside hand) pour le garder dans ton dos." },
            cushion: { type: 'offense', title: "Float Dribble to Deep 3", detail: "<strong>Read :</strong> Il recule par peur de ta vitesse (Coussin d'espace).<br><br><strong>Play :</strong> Endors-le avec un dribble flottant (Pace). Dès qu'il fige ses appuis, dégaine un tir profond sans follow-through rigide." },
            zone23: { type: 'offense', title: "Gap Penetration & Kick", detail: "<strong>Read :</strong> Zone 2-3. La raquette est bouchée, les extérieurs attendent sur les lignes de passe.<br><br><strong>Play :</strong> N'attaque pas un joueur, attaque l'espace ENTRE deux joueurs (le Gap). Force deux défenseurs à se resserrer sur toi, puis sors la balle sur le shooteur ouvert." },
            transition: { type: 'offense', title: "Middle Lane Lock & Pitch Ahead", detail: "<strong>Read :</strong> Surnombre en contre-attaque.<br><br><strong>Play :</strong> Dribble plein axe (Middle Lane) à pleine vitesse. Fixe le dernier défenseur avec tes yeux (Look-off). S'il monte sur toi, passe au shooteur. S'il recule, Pull-up 3." },

            // --- DEFENSE ---
            shifty: { type: 'defense', title: "Angle Cut-off & Chest Alignment", detail: "<strong>Read :</strong> Le meneur adverse est ultra-rapide et shifty.<br><br><strong>Play :</strong> Ne regarde JAMAIS la balle, regarde son nombril. Garde un centre de gravité plus bas que lui. S'il cross, ne croise pas tes pieds : fais un grand pas de glissement (Slide) pour couper l'angle de son épaule, pas le ballon." },
            heavy: { type: 'defense', title: "Low Leverage & Pre-emptive Bump", detail: "<strong>Read :</strong> Un arrière lourd (Bumper) veut t'enfoncer sur le drive.<br><br><strong>Play :</strong> À 1m78, si tu le laisses prendre de la vitesse, tu es mort. Frappe le premier avec ton avant-bras sur sa hanche <em>avant</em> qu'il ne s'organise (Legal bump). Baisse ton centre de gravité pour devenir un mur de briques intassable." },
            shooter: { type: 'defense', title: "Top-Lock & Trail Pursuit", detail: "<strong>Read :</strong> Un shooteur d'élite qui court à travers les écrans.<br><br><strong>Play :</strong> Refuse-lui l'accès à la balle (Top-Lock). Oblige-le à couper vers le panier (Backdoor). S'il prend un écran, poursuis-le collé dans son dos (Trail) pour contester par-dessus, jamais en passant sous l'écran." },
            tall_post: { type: 'defense', title: "Post Fronting & Pull The Chair", detail: "<strong>Read :</strong> Un grand/lourd te prend au poste bas. Tu ne peux pas contester son tir.<br><br><strong>Play :</strong> Gagne avant la passe ! Passe devant lui (Front the post) pour empêcher la passe lobée. S'il reçoit la balle et commence à reculer lourdement sur toi, esquive l'impact au dernier moment (Pull the chair) : il va perdre l'équilibre et marcher." },
            switch_big: { type: 'defense', title: "Stunt & Recover / Speed Harassment", detail: "<strong>Read :</strong> Tu es resté bloqué sur le Pivot adverse au large après un écran.<br><br><strong>Play :</strong> Harcèle son dribble ! Un grand déteste dribbler face à un petit rapide. Mets une pression folle sur le ballon pour le faire paniquer avant qu'il ne s'approche de la raquette. Demande un <em>Stunt</em> (aide éclair) d'un coéquipier." }
        };

        function triggerRead(mode, val) {
            const out = document.getElementById('universalReadOutput');
            const badge = document.getElementById('readBadge');
            const title = document.getElementById('readMoveTitle');
            const details = document.getElementById('readMoveDetail');

            // Réinitialiser les autres menus pour garder l'UI propre
            document.querySelectorAll('#live-reads select').forEach(s => {
                if (s.value !== val) s.value = "";
            });

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

        // Workouts
        const workouts = {
            monday: {
                title: 'Monday: Max Force & Slow SSC (Engine Construction)',
                meta: 'Target: Mechanical Force Capacity using Dumbbells and Mechanical Disadvantage',
                list: [
                    {n: 'Deficit DB Suitcase Deadlift', d: '4 x 6 reps. Monte sur un petit support/bloc pour augmenter l\'amplitude de tirage excentrique. Rest 2m30s.'},
                    {n: 'DB Goblet 1.5-Rep Squats', d: '4 x 6-8 reps. Descends au max, remonte à moitié, redescends au fond, et explose vers le haut. Rest 2m.'}
                ]
            },
            wednesday: {
                title: 'Wednesday: Tendon Stiffness & Fast SSC (Reflex Springs)',
                meta: 'Target: Neurological Stiffness & Ankle Tendon Elastic Pool Activation',
                list: [
                    {n: 'Vertical Elastic Ankle Pogos', d: '3 x 20 reps. Genoux presque verrouillés. Rebondis comme un ressort en métal. Temps de contact cible < 200ms.'},
                    {n: 'Stair Depth Jumps', d: '4 x 3 reps. Laisse-toi tomber d\'une marche d\'escalier (30cm), percute le sol pieds raides, rebondis instantanément au maximum.'}
                ]
            },
            sniper: {
                title: '🎯 The Sniper Protocol (1-Motion Fluidity)',
                meta: 'Objectif : Éliminer la raideur du haut du corps, ancrer le "Sway" et le "Dip".',
                list: [
                    {n: '1. Form Shooting avec Sway (1 Main)', d: '3 x 10 tirs près du cercle. Focus absolu : tes épaules partent en arrière, tes pieds atterrissent en avant. Zéro tension dans la nuque.'},
                    {n: '2. Catch & Dip Timing', d: '3 x 10 tirs (Mi-distance). Fais rebondir la balle vers toi. Au moment où tu l\'attrapes, tes hanches ET la balle descendent ensemble. Tire sans pause en haut.'},
                    {n: '3. Deep Range Effortless (Recul progressif)', d: 'Commence à 3 points. Si ça rentre (Swish), recule d\'un mètre. Ne change JAMAIS la force de tes bras, pousse juste plus fort sur tes jambes.'},
                    {n: '4. One-Dribble Pull-Up (Fluidité)', d: '10 tirs à gauche, 10 tirs à droite. Dribble très fort au sol pour que la balle remonte toute seule dans ta poche de tir. Ne casse pas ton poignet à l\'avance.'}
                ]
            },
            pace: {
                title: '🛑 Pace & Space (Shifty Handling)',
                meta: 'Objectif : Freins d\'urgence, changement de rythme et isolation face au hand-checking.',
                list: [
                    {n: '1. The Punch Drag (Freinage d\'Urgence)', d: '4 x 5 reps/côté. Sprinte à 100% sur 3 mètres. Frappe la balle au sol (Punch) en t\'arrêtant sur un appui, recule instantanément (Drag). Le défenseur va glisser.'},
                    {n: '2. Under Drag Speed Stop', d: '4 x 5 reps/côté. Accélère, et au lieu de t\'arrêter normalement, passe la balle sous ta jambe avant en reculant. Enchaîne direct avec un tir (Sniper mode).'},
                    {n: '3. Hostage Dribble (Simulation P&R)', d: '3 x 8 reps. Passe une chaise (écran), ralentis drastiquement, mets la chaise dans ton dos. Garde le dribble vivant pendant 2 secondes, puis explose vers le cercle.'},
                    {n: '4. Veer Step Finishes (Contact)', d: '3 x 6 reps. Drive fort, et au moment du lay-up, saute de côté *vers* un obstacle (sac de frappe ou ami avec pad). Encaisse le choc en l\'air et finis main opposée.'}
                ]
            }
        };

        function loadWorkout(day) {
            const w = workouts[day];
            if (!w) {
                document.getElementById('workoutDisplay').innerHTML = '';
                return;
            }
            let html = '<ul class="exercise-list">';
            w.list.forEach(e => {
                html += `<li class="exercise-item"><div><strong>${e.n}</strong><div class="detail-text">${e.d}</div></div><button class="check-btn" onclick="this.classList.toggle('completed')"></button></li>`;
            });
            html += '</ul>';
            document.getElementById('workoutDisplay').innerHTML = `<h4>${w.title}</h4><p style="color:var(--warning); margin-bottom:1rem; font-size:0.85rem;">${w.meta}</p>${html}`;
        }

        // Rest Timers
        let timerSeconds = 120, timerInterval, timerRunning = false;
        function updateTimerDisplay() {
            document.getElementById('mainTimer').textContent = `${Math.floor(timerSeconds/60).toString().padStart(2,'0')}:${(timerSeconds%60).toString().padStart(2,'0')}`;
        }
        function startTimer() { if (!timerRunning) { timerRunning = true; timerInterval = setInterval(() => { if(timerSeconds > 0) { timerSeconds--; updateTimerDisplay(); } else { pauseTimer(); alert("Fin de récup ! Au combat."); } }, 1000); } }
        function pauseTimer() { timerRunning = false; clearInterval(timerInterval); }
        function resetTimer() { pauseTimer(); timerSeconds = 120; updateTimerDisplay(); }
        function setTimer(s) { resetTimer(); timerSeconds = s; updateTimerDisplay(); startTimer(); }

        // Analytics
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

        // Générateur de Super Prompt pour Gemini IA (Avec Synchro Data)
        function generateAIPrompt() {
            const energy = document.getElementById('logEnergy').value;
            const focus = document.getElementById('logFocus').value;
            const tactics = document.getElementById('logTactics').value;
            
            if(!tactics.trim()) {
                alert("Erreur Système : Remplis l'Analyse Clinique pour nourrir l'IA.");
                return;
            }

            // Calcul Data Sniper Global
            let totalMade = 0, totalAtt = 0;
            Object.values(shootingData).forEach(z => { totalMade += z.made; totalAtt += z.att; });
            const totalPct = totalAtt > 0 ? Math.round((totalMade/totalAtt)*100) : 0;

            const prompt = `Salut Gemini. Agis comme le meilleur préparateur physique et coach individuel NBA. Je suis un meneur de jeu de 1m78 à Madagascar (jeu très physique, hand-checking agressif). Mon but est d'avoir l'arsenal d'isolation de SGA/Kyrie, la fluidité de tir de Curry et l'explosivité d'Edwards.

Voici la télémétrie de ma session du jour :
- Énergie actuelle : ${energy}/10.
- Focus du jour : ${focus}.
- Bilan Clinique : "${tactics}".
- Stats de Tir du jour (Heatmap) : ${totalMade}/${totalAtt} (${totalPct}% global).

Instructions pour toi :
1. Analyse ma session en fonction de ma morphologie (1m78) et de mes stats de tir.
2. Génère ma prochaine routine sur-mesure (échauffement, exercices, séries/réps).
3. Adapte l'effort à ma récupération (${energy}/10).`;

            document.getElementById('generatedPromptText').textContent = prompt;
            document.getElementById('aiPromptOutput').classList.add('show');
            document.getElementById('logTactics').value = '';
        }
        // Init Lifecycle
        document.addEventListener('DOMContentLoaded', () => {
            updateProfile();
            calculateVideoJump();
            calculateRSI();
            updateCourtDisplay();
            selectZone('top');
            loadWorkout('');
            updateChart();
        });
    

// ==================== ANIMATED COACHBOARD ENGINE ====================
let currentPlayId = "";
let animationInterval;
let currentFrame = 0;

const coachboardDB = {
    // ==================== 📍 MODULE SPACING & PLACEMENTS ====================
    spacing_5out: {
        description: "<strong>Le 5-Out (Pass & Cut) :</strong> Le placement roi du basket moderne. Personne dans la raquette.<br><br>💡 <em>Tip Coach pour l'équipe :</em> Restez sur la ligne des 3 points. Si le meneur (1) drive, on ne le regarde pas bêtement. Si on fait une passe, on coupe AU SPRINT vers le panier puis on ressort.",
        frames: [
            { o1:[50,20], o2:[15,45], o3:[85,45], o4:[10,85], o5:[90,85], ball:[50,20] }, // Setup parfait
            { o1:[30,30], o2:[15,45], o3:[85,45], o4:[10,85], o5:[90,85], ball:[30,30] }, // O1 passe à O2
            { o1:[50,85], o2:[15,45], o3:[85,45], o4:[10,85], o5:[90,85], ball:[15,45] }, // O1 COUPE FORT (Cut) au panier
            { o1:[90,85], o2:[15,45], o3:[85,45], o4:[10,85], o5:[50,20], ball:[15,45] }  // Rotation : O5 monte remplacer O1, O1 prend le corner
        ]
    },
    spacing_4out: {
        description: "<strong>4-Out 1-In (Le Dunker Spot) :</strong> 4 joueurs au large, 1 pivot (5) caché sur la ligne de fond derrière l'arceau.<br><br>💡 <em>Tip pour le Pivot :</em> Ne reste JAMAIS au poste bas à réclamer la balle si ton meneur drive. Cache-toi dans le 'Dunker Spot'. Si le contreur monte sur le meneur, tu seras seul pour la passe lobée.",
        frames: [
            { o1:[50,20], o2:[15,45], o3:[85,45], o4:[15,85], o5:[35,90], d1:[50,30], d5:[50,80], ball:[50,20] }, // O5 est au dunker spot gauche
            { o1:[35,60], o2:[15,45], o3:[85,45], o4:[15,85], o5:[35,90], d1:[40,50], d5:[50,80], ball:[35,60] }, // O1 drive
            { o1:[40,75], o2:[15,45], o3:[85,45], o4:[15,85], o5:[35,90], d1:[45,60], d5:[45,75], ball:[40,75] }, // Le pivot défenseur (D5) monte aider
            { o1:[40,80], o2:[15,45], o3:[85,45], o4:[15,85], o5:[50,85], d1:[45,60], d5:[45,75], ball:[50,85] }  // Passe facile à O5 au cercle
        ]
    },
    spacing_pnr_rules: {
        description: "<strong>Les Règles du P&R (Lift & Drift) :</strong> Comment les shooteurs doivent bouger pendant un écran.<br><br>💡 <em>Tip pour l'équipe :</em> Si le meneur vient VERS vous = 'Drift' (Glissez dans le corner). S'il s'éloigne de vous = 'Lift' (Montez à 45°). Toujours être dans son champ de vision !",
        frames: [
            { o1:[30,30], o2:[10,85], o3:[90,85], o4:[85,45], o5:[35,35], ball:[30,30] }, // O5 pose écran pour O1
            { o1:[50,40], o2:[15,45], o3:[90,85], o4:[85,45], o5:[40,50], ball:[50,40] }, // O1 drive au milieu. O2 DOIT LIFT (monter)
            { o1:[70,55], o2:[20,40], o3:[90,85], o4:[90,85], o5:[50,75], ball:[70,55] }, // O1 drive à droite. O4 DOIT DRIFT (descendre au corner)
            { o1:[70,55], o2:[20,40], o3:[90,85], o4:[90,85], o5:[50,75], ball:[90,85] }  // Passe à O4 (Drift)
        ]
    },

    // ==================== ⚔️ ATTAQUE VS INDIVIDUELLE (MAN-TO-MAN) ====================
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
        description: "<strong>Horns Flare :</strong> Formation 'Cornes' (O4 et O5 aux coudes).<br><br>💡 <em>Le Play :</em> O1 utilise l'écran de O4. O5 va poser un écran 'Flare' (dans le dos) pour libérer O4 à 3 points. Très dur à défendre.",
        frames: [
            { o1:[50,20], o2:[10,85], o3:[90,85], o4:[35,50], o5:[65,50], ball:[50,20] },
            { o1:[25,40], o2:[10,85], o3:[90,85], o4:[45,45], o5:[65,50], ball:[25,40] },
            { o1:[20,50], o2:[10,85], o3:[90,85], o4:[60,35], o5:[45,45], ball:[20,50] }, // O5 pose l'écran Flare pour O4
            { o1:[20,50], o2:[10,85], o3:[90,85], o4:[75,30], o5:[50,55], ball:[75,30] }  // O4 est ouvert pour le tir
        ]
    },
    pistol_action: {
        description: "<strong>Pistol (21 Action) :</strong> Transition rapide sur le côté.<br><br>💡 <em>Le Play :</em> O1 passe à O2 sur l'aile et sprinte derrière lui. O5 arrive lancé pour un écran sur O2. Crée un surnombre express sur l'aile.",
        frames: [
            { o1:[25,25], o2:[15,50], o3:[90,85], o4:[85,45], o5:[50,30], ball:[25,25] },
            { o1:[15,40], o2:[15,50], o3:[90,85], o4:[85,45], o5:[50,40], ball:[15,50] }, // Passe à O2
            { o1:[10,60], o2:[25,50], o3:[90,85], o4:[85,45], o5:[30,55], ball:[25,50] }, // O1 sprinte extérieur, O5 pose écran
            { o1:[15,80], o2:[45,65], o3:[90,85], o4:[85,45], o5:[30,75], ball:[45,65] }  // O2 attaque le milieu, O5 roll
        ]
    },

    // ==================== 🛡️ ATTAQUE VS ZONE ====================
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
        description: "<strong>Flash Poste Franc vs Zone 2-3 :</strong> Le point faible fatal de la 2-3 est au milieu.<br><br>💡 <em>Tip Coach :</em> Le pivot (O5) doit sprinter au milieu de la raquette. Dès qu'il a la balle, la zone entière se replie sur lui. Les extérieurs DOIVENT couper vers le cercle à ce moment-là.",
        frames: [
            { o1:[50,20], o2:[15,45], o3:[85,45], o4:[15,85], o5:[85,85], d1:[35,35], d2:[65,35], d3:[20,75], d4:[80,75], d5:[50,80], ball:[50,20] },
            { o1:[30,30], o2:[15,45], o3:[85,45], o4:[15,85], o5:[50,55], d1:[30,40], d2:[60,40], d3:[20,75], d4:[80,75], d5:[50,75], ball:[30,30] }, // O5 flash au milieu
            { o1:[30,30], o2:[15,45], o3:[85,45], o4:[15,85], o5:[50,55], d1:[35,45], d2:[60,45], d3:[35,65], d4:[65,65], d5:[50,70], ball:[50,55] }, // Passe à O5. La zone collaps!
            { o1:[30,30], o2:[15,45], o3:[50,85], o4:[15,85], o5:[50,55], d1:[35,45], d2:[60,45], d3:[35,65], d4:[65,65], d5:[50,70], ball:[50,85] }  // O3 coupe backdoor, Lay-up !
        ]
    },
    zone32_baseline: {
        description: "<strong>Baseline Runner vs Zone 3-2 :</strong> La 3-2 bloque la ligne à 3 pts mais le fond du terrain est vulnérable.<br><br>💡 <em>Le Play :</em> Un joueur (O4) sprinte sur toute la ligne de fond de gauche à droite. La défense ne saura pas qui doit le prendre.",
        frames: [
            { o1:[50,20], o2:[20,40], o3:[80,40], o4:[15,85], o5:[50,60], d1:[50,35], d2:[25,45], d3:[75,45], d4:[35,75], d5:[65,75], ball:[50,20] },
            { o1:[30,25], o2:[20,40], o3:[80,40], o4:[50,90], o5:[50,60], d1:[40,35], d2:[25,45], d3:[75,45], d4:[45,75], d5:[65,75], ball:[30,25] }, // O4 court sous le cercle
            { o1:[30,25], o2:[20,40], o3:[80,40], o4:[85,85], o5:[50,60], d1:[40,35], d2:[25,45], d3:[75,45], d4:[45,75], d5:[75,70], ball:[85,85] }, // O4 sort corner opposé
            { o1:[30,25], o2:[20,40], o3:[70,50], o4:[85,85], o5:[50,60], d1:[40,35], d2:[25,45], d3:[75,45], d4:[45,75], d5:[75,70], ball:[85,85] }  // Extra pass possible
        ]
    },

    // ==================== 🚀 SORTIE DE PRESSE ====================
    press_14_flat: {
        description: "<strong>1-4 Flat Press Break :</strong> Contre une défense tout-terrain ou une zone press.<br><br>💡 <em>Tip Coach :</em> Les 4 joueurs s'alignent à hauteur des lancers francs. Personne ne reste collé à la remise en jeu. Coupes croisées explosives. Le meneur attrape la balle lancé.",
        frames: [
            { o1:[50,95], o2:[20,70], o3:[40,70], o4:[60,70], o5:[80,70], d1:[50,85], d2:[25,65], d3:[45,65], d4:[65,65], d5:[85,65], ball:[50,95] }, // Alignement 1-4
            { o1:[50,95], o2:[40,85], o3:[20,50], o4:[80,50], o5:[60,85], d1:[50,85], d2:[40,80], d3:[25,55], d4:[80,55], d5:[60,80], ball:[50,95] }, // O2 et O5 coupent fort vers la balle
            { o1:[50,95], o2:[40,85], o3:[20,50], o4:[80,50], o5:[60,85], d1:[50,85], d2:[40,80], d3:[25,55], d4:[80,55], d5:[60,80], ball:[40,85] }, // Passe à O2
            { o1:[20,80], o2:[40,70], o3:[20,50], o4:[80,50], o5:[60,85], d1:[30,75], d2:[40,65], d3:[25,55], d4:[80,55], d5:[60,80], ball:[40,70] }  // O2 se retourne direct et drive l'axe
        ]
    }
};
function renderFrame(frame) {
    const keys = ['o1','o2','o3','o4','o5','d1','d2','d3','d4','d5','ball'];
    keys.forEach(key => {
        const node = document.getElementById(key === 'ball' ? 'ballNode' : key);
        if(frame[key] && node) {
            node.style.opacity = 1; // Rendre visible
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
    
    // Afficher la position de départ instantanément (Frame 0 sans transition)
    document.querySelectorAll('.player-node').forEach(n => n.style.transition = 'none');
    document.getElementById('ballNode').style.transition = 'none';
    
    renderFrame(playData.frames[0]);
    
    // Remettre les transitions fluides après un petit délai
    setTimeout(() => {
        document.querySelectorAll('.player-node').forEach(n => n.style.transition = 'top 1s cubic-bezier(0.4, 0, 0.2, 1), left 1s cubic-bezier(0.4, 0, 0.2, 1)');
        document.getElementById('ballNode').style.transition = 'top 0.6s linear, left 0.6s linear';
    }, 50);
}

function playAnimation() {
    if(!currentPlayId) return;
    clearInterval(animationInterval);
    currentFrame = 1; // Commence à la deuxième image
    const frames = coachboardDB[currentPlayId].frames;
    
    renderFrame(frames[currentFrame]); // Jouer la première action tout de suite
    
    animationInterval = setInterval(() => {
        currentFrame++;
        if(currentFrame >= frames.length) {
            clearInterval(animationInterval);
            return;
        }
        renderFrame(frames[currentFrame]);
    }, 1500); // 1.5 secondes entre chaque étape
}

function resetAnimation() {
    if(!currentPlayId) return;
    clearInterval(animationInterval);
    loadPlay(currentPlayId); // Recharge la Frame 0
}
