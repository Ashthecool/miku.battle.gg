        lucide.createIcons();

        async function getCardImage(name) {
            const base = name.toLowerCase().replace(/ /g, '-');
            try {
                const response = await fetch('images/' + base + '.jpg', { method: 'HEAD' });
                if (response.ok) {
                    return 'images/' + base + '.jpg';
                }
            } catch (e) {}
            try {
                const response = await fetch('images/' + base + '.png', { method: 'HEAD' });
                if (response.ok) {
                    return 'images/' + base + '.png';
                }
            } catch (e) {}
            return null; // No image found
        }

        const ALL_CHARS = [
            { name: "Diana Bullen", atk: 1, hp: 4, cost: 1, rarity: 'LEGENDARY', ability: 'guard', series: 'New Haven', image: async () => await getCardImage("Diana Bullen") },
            { name: "Natalie Bergeron", atk: 2, hp: 2, cost: 1, rarity: 'EPIC', ability: 'haste', series: 'New Haven', image: async () => await getCardImage("Natalie Bergeron") },
            { name: "Juliana Roberts", atk: 1, hp: 3, cost: 1, rarity: 'RARE', ability: 'heal', series: 'New Haven', image: async () => await getCardImage("Juliana Roberts") },
            { name: "Joseph", atk: 1, hp: 2, cost: 1, rarity: 'RARE', ability: 'berserk', series: 'New Haven', image: async () => await getCardImage("Joseph") },
            { name: "Jane", atk: 3, hp: 3, cost: 3, rarity: 'EPIC', ability: 'snipe', series: 'New Haven', image: async () => await getCardImage("Jane") },
            { name: "Marija", atk: 5, hp: 7, cost: 6, rarity: 'LEGENDARY', ability: 'heal', series: 'New Haven', image: async () => await getCardImage("Marija") },
            { name: "Quinta Valentine", atk: 4, hp: 2, cost: 3, rarity: 'RARE', ability: 'snipe', series: 'New Haven', image: async () => await getCardImage("Quinta Valentine") },
            { name: "Clara Garcia", atk: 2, hp: 6, cost: 4, rarity: 'UNCOMMON', ability: 'guard', series: 'New Haven', image: async () => await getCardImage("Clara Garcia") },
            { name: "Asuka", atk: 3, hp: 4, cost: 4, rarity: 'UNCOMMON', ability: 'echo', series: 'New Haven', image: async () => await getCardImage("Asuka") },
            { name: "Cheetor", atk: 3, hp: 4, cost: 4, rarity: 'RARE', ability: 'echo', series: 'New Haven', image: async () => await getCardImage("Cheetor") },
            { name: "Kijo", atk: 4, hp: 5, cost: 5, rarity: 'RARE', ability: 'splash', series: 'Detention', image: async () => await getCardImage("Kijo") },
            { name: "Yume", atk: 3, hp: 1, cost: 2, rarity: 'RARE', ability: 'haste2', series: 'Detention', image: async () => await getCardImage("Yume") },
            { name: "Mio", atk: 2, hp: 3, cost: 2, rarity: 'UNCOMMON', ability: 'echo', series: 'Detention', image: async () => await getCardImage("Mio") },
            { name: "Jillian Peters", atk: 1, hp: 5, cost: 2, rarity: 'EPIC', ability: 'guard', series: 'WTF Stepbro', image: async () => await getCardImage("Jillian Peters") },
            { name: "Melony", atk: 3, hp: 2, cost: 3, rarity: 'RARE', ability: 'haste', series: 'WTF Stepbro', image: async () => await getCardImage("Melony") },
            { name: "Kayla", atk: 2, hp: 4, cost: 3, rarity: 'UNCOMMON', ability: 'none', series: 'WTF Stepbro', image: async () => await getCardImage("Kayla") },
            { name: "Ashton", atk: 2, hp: 5, cost: 4, rarity: 'UNCOMMON', ability: 'guard', series: 'WTF Stepbro', image: async () => await getCardImage("Ashton") },
            { name: "Maria Hunley", atk: 4, hp: 6, cost: 5, rarity: 'LEGENDARY', ability: 'guard', series: 'Adoptive Life', image: async () => await getCardImage("Maria Hunley") },
            { name: "Hayley", atk: 2, hp: 2, cost: 2, rarity: 'LEGENDARY', ability: 'heal', series: 'Adoptive Life', image: async () => await getCardImage("Hayley") },
            { name: "James Lone", atk: 2, hp: 1, cost: 1, rarity: 'EPIC', ability: 'snipe', series: 'Adoptive Life', image: async () => await getCardImage("James Lone") },
            { name: "Maiko", atk: 1, hp: 5, cost: 2, rarity: 'EPIC', ability: 'splash', series: 'Adoptive Life', image: async () => await getCardImage("Maiko") },
            { name: "Luther Jones", atk: 3, hp: 4, cost: 3, rarity: 'RARE', ability: 'haste', series: 'Adoptive Life', image: async () => await getCardImage("Luther Jones") },
            { name: "Aunt Julie", atk: 2, hp: 2, cost: 2, rarity: 'RARE', ability: 'heal', series: 'Adoptive Life', image: async () => await getCardImage("Aunt Julie") },
            { name: "Aunt Isabella", atk: 2, hp: 2, cost: 2, rarity: 'RARE', ability: 'echo', series: 'Adoptive Life', image: async () => await getCardImage("Aunt Isabella") },
            { name: "Kayla Kate", atk: 2, hp: 2, cost: 2, rarity: 'RARE', ability: 'silence', series: 'Adoptive Life', image: async () => await getCardImage("Kayla Kate") },
            { name: "Wert Lone", atk: 5, hp: 3, cost: 5, rarity: 'RARE', ability: 'guard', series: 'Adoptive Life', image: async () => await getCardImage("Wert Lone") },
            { name: "Catherine Jones", atk: 5, hp: 3, cost: 5, rarity: 'RARE', ability: 'disable', series: 'Adoptive Life', image: async () => await getCardImage("Catherine Jones") },
            { name: "Misaki", atk: 3, hp: 3, cost: 3, rarity: 'RARE', ability: 'none', series: 'Atarashī gakkō; Secret Garden!', image: async () => await getCardImage("Misaki") },
            { name: "Eri", atk: 6, hp: 2, cost: 4, rarity: 'LEGENDARY', ability: 'haste', series: 'Atarashī gakkō; Secret Garden!', image: async () => await getCardImage("Eri") },
            { name: "Yumi", atk: 1, hp: 2, cost: 1, rarity: 'RARE', ability: 'echo', series: 'Atarashī gakkō; Secret Garden!', image: async () => await getCardImage("Yumi") },
            { name: "Arisa", atk: 4, hp: 1, cost: 2, rarity: 'RARE', ability: 'haste', series: 'Atarashī gakkō; Secret Garden!', image: async () => await getCardImage("Arisa") },
            { name: "Helga", atk: 5, hp: 2, cost: 4, rarity: 'RARE', ability: 'haste', series: 'Atarashī gakkō; Secret Garden!', image: async () => await getCardImage("Helga") },
            // { name: "Anon", atk: 1, hp: 1, cost: 1, rarity: 'COMMON', ability: 'none', series: 'Original', image: 'images/anon-1.png' },
            // { name: "Anon", atk: 2, hp: 3, cost: 2, rarity: 'COMMON', ability: 'none', series: 'Original', image: 'images/anon-2.png' },
            { name: "Hina", atk: 3, hp: 2, cost: 3, rarity: 'LEGENDARY', ability: 'haste', series: 'Original', image: async () => await getCardImage("Hina") },
            { name: "Saya", atk: 2, hp: 2, cost: 2, rarity: 'LEGENDARY', ability: 'silence', series: 'Original', image: async () => await getCardImage("Saya") },
            { name: "Miracle", atk: 1, hp: 4, cost: 2, rarity: 'EPIC', ability: 'guard', series: 'Legend Of You', image: async () => await getCardImage("Miracle") },
            { name: "Faneel", atk: 4, hp: 5, cost: 5, rarity: 'EPIC', ability: 'snipe', series: 'Legend Of You', image: async () => await getCardImage("Faneel") },
            { name: "Ophelia", atk: 2, hp: 3, cost: 3, rarity: 'RARE', ability: 'heal', series: 'Legend Of You', image: async () => await getCardImage("Ophelia") },
            { name: "Daphne", atk: 3, hp: 3, cost: 4, rarity: 'RARE', ability: 'snipe', series: 'Legend Of You', image: async () => await getCardImage("Daphne") },
            { name: "Shirayukihime", atk: 2, hp: 4, cost: 3, rarity: 'UNCOMMON', ability: 'guard', series: 'Legend Of You', image: async () => await getCardImage("Shirayukihime") },
            { name: "Rimu Hiraga", atk: 3, hp: 2, cost: 3, rarity: 'UNCOMMON', ability: 'echo', series: 'Bloodlines', image: async () => await getCardImage("Rimu Hiraga") },
            { name: "Sakura Tooyama", atk: 4, hp: 1, cost: 2, rarity: 'UNCOMMON', ability: 'haste', series: 'Bloodlines', image: async () => await getCardImage("Sakura Tooyama") },
            { name: "Aoi Kananori", atk: 5, hp: 4, cost: 5, rarity: 'RARE', ability: 'snipe', series: 'Bloodlines', image: async () => await getCardImage("Aoi Kananori") },
            { name: "Ayaka Yamanami", atk: 3, hp: 5, cost: 4, rarity: 'RARE', ability: 'splash', series: 'Bloodlines', image: async () => await getCardImage("Ayaka Yamanami") },
            { name: "Saito Iroha", atk: 2, hp: 6, cost: 4, rarity: 'RARE', ability: 'guard', series: 'Bloodlines', image: async () => await getCardImage("Saito Iroha") },
            { name: "Mai Yamanobe", atk: 4, hp: 4, cost: 4, rarity: 'RARE', ability: 'disable', series: 'Bloodlines', image: async () => await getCardImage("Mai Yamanobe") },
            { name: "Haruka Hijikata", atk: 3, hp: 3, cost: 3, rarity: 'RARE', ability: 'none', series: 'Bloodlines', image: async () => await getCardImage("Haruka Hijikata") },
            { name: "Shogun Kagetora", atk: 0, hp: 0, cost: 0, rarity: 'EPIC', ability: 'none', series: 'Bloodlines', image: async () => await getCardImage("Shogun Kagetora") },
            { name: "Mr.Bandit", atk: 0, hp: 0, cost: 0, rarity: 'COMMON', ability: 'none', series: 'Bloodlines', image: async () => await getCardImage("Mr.Bandit") },
            { name: "", atk: 0, hp: 0, cost: 0, rarity: 'COMMON', ability: 'none', series: 'Original', image: async () => await getCardImage("") },
            { name: "", atk: 0, hp: 0, cost: 0, rarity: 'COMMON', ability: 'none', series: 'Original', image: async () => await getCardImage("") },
        ];

        // Abilities:
        // guard: enemy must target this unit if able
        // echo: can be played on same turn as drawn
        // haste: can attack the turn it's played, but not if it has echo
        // haste2: can attack twice the turn it's played, but not if it has echo
        // berserk: excess damage dealt to a unit that kills it is dealt to the enemy nexus
        // heal: heals your nexus for half the attack (rounded up) when it strikes
        // silence: silences the target unit when it strikes, preventing it from attacking next turn or using haste/echo
        // snipe: can strike enemy units and nexus without being blocked by guards, but cannot strike if any guards are present on enemy board
        // splash: when this unit strikes, it also deals 1 damage to adjacent units on enemy board
        // disable: can target an enemy unit to exhaust it and prevent it from readying next turn

        let state = {
            pHp: 30, eHp: 30,
            mana: 1, maxMana: 1,
            hand: [],
            pBoard: [null, null, null, null],
            eBoard: [null, null, null, null],
            dragging: null,
            activeScreen: 'lobby'
        };

        function animateCard(el, className) {
            if(!el) return;
            el.classList.add(className);
            setTimeout(() => el.classList.remove(className), 600);
        }

        function getSlotCard(side, idx) {
            return document.querySelector(`#${side}-slot-${idx} .card-nexus`);
        }

        function getPlayerHandCard(index) {
            return document.querySelector(`#player-hand .card-nexus:nth-child(${index + 1})`);
        }

        function showScreen(id) {
            state.activeScreen = id;
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden-screen'));
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(`screen-${id}`).classList.remove('hidden-screen');
            const btn = document.getElementById(`btn-${id}`);
            if(btn) btn.classList.add('active');
            document.getElementById('screen-title').innerText = id.toUpperCase();
            
            if(id === 'vault') renderVault();
            if(id === 'arena' && state.hand.length === 0) startBattleInternal();
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const main = document.getElementById('main-content');
            const toggleIcon = document.querySelector('#sidebar-toggle i');
            const mobileToggleIcon = document.querySelector('#mobile-sidebar-toggle i');

            sidebar.classList.toggle('collapsed');
            main.classList.toggle('sidebar-collapsed');

            const isCollapsed = sidebar.classList.contains('collapsed');

            if (toggleIcon) {
                toggleIcon.dataset.lucide = isCollapsed ? 'chevrons-right' : 'chevrons-left';
            }

            if (mobileToggleIcon) {
                mobileToggleIcon.dataset.lucide = isCollapsed ? 'menu' : 'x';
            }

            lucide.createIcons();

            document.querySelectorAll('.nav-text, .sidebar-title, .sidebar-user-text, .sidebar-quickstart-text').forEach(el => {
                if (window.innerWidth > 768) {
                    if (isCollapsed) el.classList.add('hidden'); else el.classList.remove('hidden');
                } else {
                    if (isCollapsed) el.classList.add('hidden'); else el.classList.remove('hidden');
                }
            });
        }

        function handleResponsiveSidebar() {
            const sidebar = document.getElementById('sidebar');
            const main = document.getElementById('main-content');

            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
                main.classList.add('sidebar-collapsed');
                const mobileToggleIcon = document.querySelector('#mobile-sidebar-toggle i');
                if (mobileToggleIcon) mobileToggleIcon.dataset.lucide = 'menu';
            } else {
                sidebar.classList.remove('collapsed');
                main.classList.remove('sidebar-collapsed');
                const mobileToggleIcon = document.querySelector('#mobile-sidebar-toggle i');
                if (mobileToggleIcon) mobileToggleIcon.dataset.lucide = 'menu';
            }
            lucide.createIcons();
        }

        window.addEventListener('resize', handleResponsiveSidebar);
        window.addEventListener('DOMContentLoaded', handleResponsiveSidebar);

        async function renderVault() {
            const grid = document.getElementById('vault-grid');
            grid.innerHTML = '';

            // Update character count
            document.getElementById('vault-count').textContent = `${ALL_CHARS.length} Units Synchronized`;

            // Group characters by series
            const seriesGroups = {};
            ALL_CHARS.forEach(c => {
                if (!seriesGroups[c.series]) {
                    seriesGroups[c.series] = [];
                }
                seriesGroups[c.series].push(c);
            });

            // Sort series alphabetically
            const sortedSeries = Object.keys(seriesGroups).sort();

            // Create sections for each series
            for (const series of sortedSeries) {
                // Create series header
                const headerDiv = document.createElement('div');
                headerDiv.className = 'series-header';
                headerDiv.innerHTML = `
                    <h3 class="text-xl font-bold text-indigo-400 mb-4 mt-8 first:mt-0">${series}</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-16 mb-8"></div>
                `;
                grid.appendChild(headerDiv);

                // Add characters to this series
                const seriesGrid = headerDiv.querySelector('.grid');
                for (const c of seriesGroups[series]) {
                    const cardDiv = await createCardUI(c, 0, 'preview');
                    seriesGrid.appendChild(cardDiv);
                }
            }
        }

        async function createCardUI(card, index, type, status = {}) {
            const imageSrc = await card.image();
            const div = document.createElement('div');
            div.className = `card-nexus rarity-${card.rarity.toLowerCase()} ${status.exhausted ? 'is-exhausted' : ''} ${card.ability === 'guard' ? 'is-guard' : ''} ${type === 'preview' ? 'card-vault' : ''}`;
            
            // Only apply entry animation once
            const anims = { 'COMMON': 'anim-common', 'UNCOMMON': 'anim-uncommon', 'RARE': 'anim-rare', 'EPIC': 'anim-epic', 'LEGENDARY': 'anim-legendary' };
            if(status.justPlayed) {
                div.classList.add(anims[card.rarity]);
            }

            if(type !== 'preview') div.draggable = true;

            div.innerHTML = `
                ${type !== 'board' ? `<div class="cost-badge">${card.cost}</div>` : ''}
                <div class="rarity-badge">${card.rarity}</div>
                <div class="flex-1 flex flex-col items-center justify-center pointer-events-none">
                    <img src="${imageSrc}" class="w-8 h-8 mb-1 object-contain" alt="${card.name}">
                    <div class="text-[9px] font-black text-center leading-tight uppercase px-1">${card.name}</div>
                </div>
                <div class="text-[6px] text-indigo-400 font-bold text-center mt-1 uppercase pointer-events-none">${card.ability !== 'none' ? card.ability : ''}</div>
                <div class="stat-badge atk-badge">${card.atk}</div>
                <div class="stat-badge hp-badge">${card.hp}</div>
            `;

            if(type !== 'preview') {
                div.ondragstart = (e) => { 
                    state.dragging = { type, index }; 
                    e.dataTransfer.setData('text/plain', '');
                    e.currentTarget.style.opacity = '0.5';
                };
                div.ondragend = (e) => {
                    e.currentTarget.style.opacity = '1';
                }
            }
            return div;
        }

        function startBattleInternal() {
            state.pHp = 30; state.eHp = 30; state.mana = 1; state.maxMana = 1;
            state.hand = []; state.pBoard = [null, null, null, null]; state.eBoard = [null, null, null, null];
            for(let i=0; i<4; i++) draw();
            updateBattleUI();
            log("Battle Interface Online. Ready.");
        }

        function startBattle() {
            showScreen('arena');
            startBattleInternal();
        }

        function draw() {
            if(state.hand.length < 8) {
                const c = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
                state.hand.push({...c});
            }
        }

        async function updateBattleUI() {
            if(state.activeScreen !== 'arena') return;
            document.getElementById('player-hp').innerText = state.pHp;
            document.getElementById('enemy-hp').innerText = state.eHp;
            document.getElementById('mana-text').innerText = `${state.mana} / ${state.maxMana}`;
            
            const handEl = document.getElementById('player-hand');
            handEl.innerHTML = '';
            for (const [i, c] of state.hand.entries()) {
                const cardDiv = await createCardUI(c, i, 'hand');
                handEl.appendChild(cardDiv);
            }

            for(let i=0; i<4; i++) {
                await renderBattleSlot('player', i);
                await renderBattleSlot('enemy', i);
            }
        }

        async function renderBattleSlot(side, idx) {
            const slot = document.getElementById(`${side}-slot-${idx}`);
            slot.innerHTML = '';
            const unit = side === 'player' ? state.pBoard[idx] : state.eBoard[idx];
            if(unit) {
                const cardDiv = await createCardUI(unit.card, idx, 'board', unit.status);
                slot.appendChild(cardDiv);
                if (unit.status.justPlayed) {
                    setTimeout(() => { unit.status.justPlayed = false; }, 1000);
                }
            }
        }

        function allowDrop(e) { 
            e.preventDefault(); 
            e.currentTarget.classList.add('drag-over');
        }

        document.querySelectorAll('.slot').forEach(s => {
            s.ondragleave = (e) => e.currentTarget.classList.remove('drag-over');
        });

        function dropOnSlot(e) {
            e.preventDefault();
            const side = e.currentTarget.dataset.side;
            const idx = parseInt(e.currentTarget.dataset.idx);
            e.currentTarget.classList.remove('drag-over');

            if(!state.dragging) return;

            if(state.dragging.type === 'hand' && side === 'player') {
                const c = state.hand[state.dragging.index];
                if(state.mana >= c.cost && !state.pBoard[idx]) {
                    state.mana -= c.cost;
                    state.pBoard[idx] = { 
                        card: JSON.parse(JSON.stringify(c)), 
                        status: { 
                            exhausted: !(c.ability === 'haste' || c.ability === 'haste2'), 
                            justPlayed: true,
                            silenced: false
                        } 
                    };
                    state.hand.splice(state.dragging.index, 1);
                    log(`${c.name.toUpperCase()} DEPLOYED.`);
                    updateBattleUI();
                }
            } else if(state.dragging.type === 'board' && side === 'enemy') {
                handleStrike(state.dragging.index, idx);
            }
            state.dragging = null;
        }

        function handleStrike(pIdx, eIdx) {
            const atk = state.pBoard[pIdx];
            const def = state.eBoard[eIdx];
            if(!atk || !def || atk.status.exhausted) return;

            const atkEl = getSlotCard('player', pIdx);
            const defEl = getSlotCard('enemy', eIdx);
            animateCard(atkEl, 'animate-attack');
            animateCard(defEl, 'animate-ability');

            const guard = state.eBoard.some(u => u && u.card.ability === 'guard');
            if(guard && def.card.ability !== 'guard') {
                log("GUARD ACTIVE: TARGET BLOCKED.");
                return;
            }

            if(atk.status.silenced) {
                log(`${atk.card.name} is silenced and cannot attack this round.`);
                return;
            }

            if(atk.card.ability === 'heal') {
                animateCard(document.getElementById('player-hp'), 'animate-heal');
            }

            const isHaste2 = atk.card.ability === 'haste2';
            const preHp = def.card.hp;

            def.card.hp -= atk.card.atk;
            atk.card.hp -= def.card.atk;

            if(atk.card.ability === 'silence') {
                def.status.silenced = true;
                log(`${def.card.name} is SILENCED.`);
                animateCard(defEl, 'animate-ability');
            }

            if(atk.card.ability === 'berserk' && def.card.hp <= 0) {
                const overflow = Math.max(0, atk.card.atk - preHp);
                if(overflow > 0) {
                    state.eHp -= overflow;
                    log(`BERSERK OVERFLOW: ${overflow} DMG TO ENEMY NEXUS`);
                    animateCard(document.getElementById('enemy-hp'), 'animate-ability');
                }
            }

            if(atk.card.ability === 'heal') {
                const healAmount = Math.min(5, Math.ceil(atk.card.atk / 2));
                state.pHp += healAmount;
                log(`HEAL: ${healAmount} TO YOUR NEXUS`);
            }

            if(atk.card.ability === 'splash') {
                [eIdx - 1, eIdx + 1].forEach(adj => {
                    if(state.eBoard[adj]) {
                        state.eBoard[adj].card.hp -= 1;
                        if(state.eBoard[adj].card.hp <= 0) {
                            log(`${state.eBoard[adj].card.name} TAKES SPLASH AND DIES`);
                            state.eBoard[adj] = null;
                        } else {
                            log(`${state.eBoard[adj].card.name} TAKES SPLASH`);
                        }
                    }
                });
                animateCard(defEl, 'animate-ability');
            }

            if(def.card.hp <= 0) state.eBoard[eIdx] = null;
            if(atk.card.hp <= 0) state.pBoard[pIdx] = null;

            if(!isHaste2) {
                atk.status.exhausted = true;
            }

            if(isHaste2 && atk.card.hp > 0 && def && def.card.hp > 0) {
                def.card.hp -= atk.card.atk;
                atk.card.hp -= def.card.atk;
                log(`${atk.card.name} (HASTE2) strikes again!`);
                animateCard(atkEl, 'animate-attack');
                if(def.card.hp <= 0) state.eBoard[eIdx] = null;
                if(atk.card.hp <= 0) state.pBoard[pIdx] = null;
                atk.status.exhausted = true;
            }

            updateBattleUI();
            checkVictory();
        }

        function dropOnNexus(side) {
            if(!state.dragging) return;
            if(state.dragging.type === 'board' && side === 'enemy') {
                const atk = state.pBoard[state.dragging.index];
                const atkEl = getSlotCard('player', state.dragging.index);
                if(!atk || atk.status.exhausted || atk.status.silenced) {
                    if(atk && atk.status.silenced) log(`${atk.card.name} is silenced and cannot strike nexus.`);
                    return;
                }
                if(state.eBoard.some(u => u && u.card.ability === 'guard')) return log("CORE GUARDED.");

                animateCard(atkEl, 'animate-attack');
                state.eHp -= atk.card.atk;
                animateCard(document.getElementById('enemy-hp'), 'animate-ability');

                if(atk.card.ability === 'heal') {
                    const healAmount = Math.max(1, Math.floor(atk.card.atk / 2));
                    state.pHp = Math.min(30, state.pHp + healAmount);
                    log(`HEAL: +${healAmount} to your nexus.`);
                    animateCard(document.getElementById('player-hp'), 'animate-heal');
                }

                if(atk.card.ability === 'berserk') {
                    // No additional overflow needed, direct strike already does max damage.
                }

                if(atk.card.ability === 'haste2') {
                    state.eHp -= atk.card.atk;
                    log(`HASTE2 BONUS: additional ${atk.card.atk} DMG to nexus.`);
                    animateCard(document.getElementById('enemy-hp'), 'animate-ability');
                }

                atk.status.exhausted = true;
                log(`DIRECT STRIKE: ${atk.card.atk} DMG.`);
                updateBattleUI();
                checkVictory();
            }
            state.dragging = null;
        }

        function endTurn() {
            log("ENEMY CYCLE STARTING...");
            setTimeout(() => {
                const slot = state.eBoard.findIndex(s => s === null);
                if(slot !== -1) {
                    const c = ALL_CHARS[Math.floor(Math.random()*ALL_CHARS.length)];
                    state.eBoard[slot] = { card: JSON.parse(JSON.stringify(c)), status: { exhausted: true, justPlayed: true } };
                }
                state.eBoard.forEach(u => {
                    if(u && !u.status.exhausted && !u.status.silenced) {
                        const guardIndex = state.pBoard.findIndex(v => v && v.card.ability === 'guard');
                        if(guardIndex !== -1) {
                            const guardTarget = state.pBoard[guardIndex];
                            guardTarget.card.hp -= u.card.atk;
                            log(`GUARD BLOCK: ${u.card.name} hits ${guardTarget.card.name} for ${u.card.atk}.`);
                            if(guardTarget.card.hp <= 0) {
                                log(`${guardTarget.card.name} is destroyed.`);
                                state.pBoard[guardIndex] = null;
                                if(u.card.ability === 'berserk') {
                                    state.pHp -= u.card.atk;
                                    log(`BERSERK OVERFLOW: ${u.card.atk} damage to nexus.`);
                                }
                            }
                        } else {
                            state.pHp -= u.card.atk;
                            log(`${u.card.name} hits your nexus for ${u.card.atk}.`);
                        }

                        if(u.card.ability === 'haste2' && !u.status.exhausted) {
                            if(guardIndex !== -1 && state.pBoard[guardIndex]) {
                                state.pBoard[guardIndex].card.hp -= u.card.atk;
                                log(`HASTE2 BONUS: ${u.card.name} hits guard again for ${u.card.atk}.`);
                                if(state.pBoard[guardIndex].card.hp <= 0) {
                                    log(`${state.pBoard[guardIndex].card.name} is destroyed.`);
                                    state.pBoard[guardIndex] = null;
                                }
                            } else {
                                state.pHp -= u.card.atk;
                                log(`HASTE2 BONUS: ${u.card.name} hits nexus for ${u.card.atk}.`);
                            }
                        }
                    }
                    if(u) {
                        u.status.exhausted = false;
                        u.status.silenced = false;
                        u.status.justPlayed = false;
                    }
                });
                
                if(state.maxMana < 10) state.maxMana++;
                state.mana = state.maxMana;
                state.pBoard.forEach(u => { 
                    if(u) { 
                        u.status.exhausted = false; 
                        u.status.justPlayed = false; 
                        u.status.silenced = false;
                    } 
                });
                
                draw();
                updateBattleUI();
                log("YOUR CYCLE.");
                checkVictory();
            }, 600);
        }

        function log(m) {
            const t = document.getElementById('ticker');
            t.innerText = `${m} • ${t.innerText}`.substring(0, 300);
        }

        function checkVictory() {
            if(state.eHp <= 0) { 
                alert("VICTORY - ENEMY NEXUS DESTROYED"); 
                showScreen('lobby'); 
            }
            else if(state.pHp <= 0) { 
                alert("DEFEAT - YOUR NEXUS HAS FALLEN"); 
                showScreen('lobby'); 
            }
        }

        window.onload = () => {
            showScreen('lobby');
        };
