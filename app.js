
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
        function triggerPnrRead(val) {
            const out = document.getElementById('pnrReadOutput');
            const title = document.getElementById('pnrMoveTitle');
            const details = document.getElementById('pnrMoveDetail');
            
            if(val) document.getElementById('isoSituation').value = ""; 
            
            if(!val) { out.classList.remove('show'); return; }
            out.classList.add('show');
            document.getElementById('pnrBadge').textContent = "P&R Read Loaded";
            document.getElementById('pnrBadge').style.background = "var(--secondary)";

            if(val === 'drop') {
                title.textContent = "The Under Drag Speed Stop (Kyrie Kill)";
                details.innerHTML = `
                    <div><strong>Le Concept Tactique :</strong> Le pivot adverse recule pour protéger l'arceau. Tu as de l'espace libre à mi-distance.</div>
                    <div style="color:var(--warning); margin-top:0.4rem;"><strong>L'Action :</strong> Enchaîne un dribble violent vers l'avant puis bloque tes appuis en glissant la balle sous les jambes pour un pull-up immédiat. Séquençage fluide et nonchalant exigé.</div>
                `;
            } else if(val === 'blitz') {
                title.textContent = "The Retreat Dribble & Pocket Laser Pass";
                details.innerHTML = `
                    <div><strong>Le Concept Tactique :</strong> On te prend à deux de manière agressive pour t'asphyxier et bloquer ta vision périphérique.</div>
                    <div style="color:var(--warning); margin-top:0.4rem;"><strong>L'Action :</strong> Fais deux grands pas chassés vers l'arrière pour étirer la prise à deux. Dès que l'espace s'ouvre, lâche une Pocket Pass au sol ultra-rapide ou une passe laser vers le Short-Roll de ton pivot.</div>
                `;
            } else {
                title.textContent = "Behind The Screen Shot Snapping";
                details.innerHTML = `
                    <div><strong>Le Concept Tactique :</strong> Le défenseur passe en dessous de l'écran (Under). Il t'abandonne l'espace à 3 points.</div>
                    <div style="color:var(--warning); margin-top:0.4rem;"><strong>L'Action :</strong> Sanction immédiate. Arrêt net derrière l'écran, ancrage bas des hanches (Drop Stance) et tir fluide à 9m sans follow-through exagéré.</div>
                `;
            }
        }
        
        // Algorithme de lecture d'Isolation 1v1 (Spécial Impact & Hand-checking)
        function triggerIsoRead(val) {
            const out = document.getElementById('pnrReadOutput');
            const title = document.getElementById('pnrMoveTitle');
            const details = document.getElementById('pnrMoveDetail');
            
            if(val) document.getElementById('pnrSituation').value = ""; 
            else { if(!document.getElementById('pnrSituation').value) out.classList.remove('show'); return; }
            
            out.classList.add('show');
            document.getElementById('pnrBadge').textContent = "ISO Read Loaded";
            document.getElementById('pnrBadge').style.background = "var(--danger)";

            if(val === 'handcheck') {
                title.textContent = "The Physical Bump & Punch Drag Stop";
                details.innerHTML = `
                    <div><strong>La Lecture (Read) :</strong> Le défenseur joue physique avec ses mains sur tes hanches. S'il te hand-check, il met du poids vers l'avant et commet un déni d'espace.</div>
                    <div style="color:var(--warning); margin-top:0.4rem;"><strong>L'Action (Play) :</strong> Initie volontairement un contact épaule contre torse en plein dribble pour le forcer à pousser encore plus fort en opposition. Au moment de l'impact, plante ton appui opposé pour un <em>Punch Drag Stop</em> brutal. Son propre poids va l'emporter vers l'avant. Tu crées 2 mètres de séparation nette pour ton step-back à gauche.</div>
                `;
            } else if(val === 'overplay') {
                title.textContent = "Drop Stance Counter & Inside-Hand Attack";
                details.innerHTML = `
                    <div><strong>La Lecture (Read) :</strong> Le défenseur sur-oriente ses appuis de biais pour interdire ton côté préférentiel et te forcer à aller sur ton angle mort.</div>
                    <div style="color:var(--warning); margin-top:0.4rem;"><strong>L'Action (Play) :</strong> Passe immédiatement en <em>Drop Stance</em> large et bas. Attaque d'un pas de cross agressif son pied avant pour le forcer à pivoter à 180°, puis explose en ligne droite à l'opposé. Utilise ta puissance pour garder l'avantage sur l'épaule et finis en <em>Inside-Hand Layup</em> (main gauche ou droite inversée) pour empêcher son contre en filature.</div>
                `;
            } else if(val === 'cushion') {
                title.textContent = "The Float Dribble & Sniper 9m Trigger";
                details.innerHTML = `
                    <div><strong>La Lecture (Read) :</strong> Le défenseur a peur de ton premier pas et de ton cross. Il te laisse un "coussin" d'1m50 d'espace pour anticiper ton drive.</div>
                    <div style="color:var(--warning); margin-top:0.4rem;"><strong>L'Action (Play) :</strong> Avance lentement avec un <em>Float Dribble</em> nonchalant pour endormir ses appuis (Pace control). Dès qu'il fige son centre de gravité en attendant ton attaque, déclenche instantanément ton tir à longue distance en 1-Motion. Profite du relâchement du haut de ton corps (Sway) : pas de follow-through rigide, juste de la fluidité pure.</div>
                `;
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
    
