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
                const response = await fetch('images/' + base + '.jpeg', { method: 'HEAD' });
                if (response.ok) {
                    return 'images/' + base + '.jpeg';
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

        function cloneCard(card) {
            return { ...card, image: card.image, maxHp: card.maxHp ?? card.hp };
        }

        function resolveEffectValue(value, card, context = {}) {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
                try {
                    return new Function('card', 'context', 'Math', `return ${value}`)(card, context, Math);
                } catch (e) {
                    console.warn('Ability value parse failed:', value, e);
                }
            }
            return 0;
        }

        function findBoardForContext(context = {}) {
            if (context.board) return context.board;
            if (context.side === 'enemy') return state.eBoard;
            if (context.side === 'player') return state.pBoard;
            return null;
        }

        function getOpposingBoard(context = {}) {
            if (context.opponentBoard) return context.opponentBoard;
            if (context.side === 'player') return state.eBoard;
            if (context.side === 'enemy') return state.pBoard;
            return state.eBoard;
        }

        function isCardOnBoard(board, cardName) {
            return board.some(slot => slot && slot.card && slot.card.name === cardName);
        }

        function evaluateScenario(scenario, unit, context = {}) {
                    // If no scenario exists, return 1 (true) so default cards still trigger
                    if (!scenario) return 1;

                    // 1. Determine which board to check
                    // If side is specified in scenario, use that. 
                    // If not specified, default to the acting unit's board (the board passed in context)
                    const side = scenario.side || context.side || 'player';
                    const board = (side === 'player') ? state.pBoard : state.eBoard;
                    
                    // --- Handle "unitCount" logic (e.g., "less than 2 units on the board") ---
                    if (scenario.type === 'unitCount') {
                        // Count how many non-empty slots exist on that board
                        const currentCount = board.filter(slot => slot !== null).length;
                        const threshold = scenario.threshold || 0;
                        let success = false;

                        if (scenario.operator === 'less') success = currentCount < threshold;
                        else if (scenario.operator === 'greater') success = currentCount > threshold;
                        else if (scenario.operator === 'equal') success = currentCount === threshold;

                        return success ? (scenario.positive ?? 1) : (scenario.negative ?? 0);
                    }
                    // -------------------------------------------------------------------

                    // 2. Get the list of names
                    const names = scenario.cards || scenario.cardNames || [];
                    if (!Array.isArray(names)) return 0;

                    // 3. Count exactly how many of each target card are on the board
                    const counts = names.map(name => {
                        return board.filter(slot => slot && slot.card && slot.card.name === name).length;
                    });

                    // 4. Handle "Each" logic
                    if (scenario.type === 'each') {
                        // Sum the total occurrences across all target names
                        const totalMatches = counts.reduce((sum, count) => sum + count, 0);
                        const multiplier = resolveEffectValue(scenario.value || 1, unit.card, context);
                        return totalMatches * multiplier;
                    }

                    // 5. Handle "And/Or" logic (success if count is greater than 0)
                    const success = (scenario.type === 'and' || scenario.type === 'all') 
                        ? counts.every(count => count > 0) 
                        : counts.some(count => count > 0);

                    return success ? (scenario.positive ?? 1) : (scenario.negative ?? 0);
                }

        function applyCardEffect(effect, unit, context = {}) {
                // STOP effect here if the scenario didn't succeed (equals 0)
                if (context.scenario === 0) return;

                const card = unit.card;
                const amount = resolveEffectValue(effect.value ?? effect.amount ?? effect.damage ?? 0, card, context);

            switch (effect.type) {
                case 'healNexus':
                    state.pHp = Math.min(30, state.pHp + amount);
                    log(`${card.name.toUpperCase()} HEALS YOUR NEXUS FOR ${amount}.`);
                    animateCard(document.getElementById('player-hp'), 'animate-heal');
                    break;
                case 'berserkOverflow':
                    const overflow = Math.max(0, amount);
                    if (overflow > 0) {
                        state.eHp -= overflow;
                        log(`BERSERK OVERFLOW: ${overflow} DMG TO ENEMY NEXUS`);
                        animateCard(document.getElementById('enemy-hp'), 'animate-ability');
                    }
                    break;
                case 'splashAdjacent':
                    [context.targetIdx - 1, context.targetIdx + 1].forEach(adj => {
                        if (context.board && context.board[adj]) {
                            context.board[adj].card.hp -= amount;
                            if (context.board[adj].card.hp <= 0) {
                                log(`${context.board[adj].card.name} TAKES SPLASH AND DIES`);
                                context.board[adj] = null;
                            } else {
                                log(`${context.board[adj].card.name} TAKES SPLASH`);
                            }
                        }
                    });
                    animateCard(document.getElementById('enemy-hp'), 'animate-ability');
                    break;
                case 'silenceTarget':
                    if (context.target) {
                        context.target.status.silenced = true;
                        log(`${context.target.card.name.toUpperCase()} IS SILENCED.`);
                        if (context.targetIdx !== undefined) animateCard(getSlotCard('enemy', context.targetIdx), 'animate-ability');
                    }
                    break;
                case 'disableTarget':
                    if (context.target) {
                        context.target.status.exhausted = true;
                        log(`${context.target.card.name.toUpperCase()} IS DISABLED.`);
                        if (context.targetIdx !== undefined) animateCard(getSlotCard('enemy', context.targetIdx), 'animate-ability');
                    }
                    break;
                case 'drawCard':
                    for (let i = 0; i < Math.max(1, amount); i++) draw();
                    log(`${card.name.toUpperCase()} DRAWS ${Math.max(1, amount)} CARD(S).`);
                    break;
                case 'healSelf':
                    const healed = Math.min(unit.card.maxHp, unit.card.hp + amount) - unit.card.hp;
                    if (healed > 0) {
                        unit.card.hp += healed;
                        log(`${card.name.toUpperCase()} HEALS THEMSELF FOR ${healed}.`);
                        if (context.side !== undefined && context.slot !== undefined) {
                            animateCard(getSlotCard(context.side, context.slot), 'animate-heal');
                        }
                    }
                    break;
                case 'attackUpSelf':
                    unit.card.atk += amount;
                    log(`${card.name.toUpperCase()} ATTACK INCREASED BY ${amount}.`);
                    if (context.side !== undefined && context.slot !== undefined) {
                        animateCard(getSlotCard(context.side, context.slot), 'animate-ability');
                    }
                    break;
                    
                case 'snipeDamage':
                    if (context.target && context.target.card) {
                        context.target.card.hp -= amount;
                        log(`${card.name.toUpperCase()} SNIPES ${context.target.card.name.toUpperCase()} FOR ${amount} DAMAGE.`);
                    }
                    break;
                case 'healAllies':
                    for (let i = 0; i < context.board.length; i++) {
                        if (context.board[i] && context.board[i].card) {
                            context.board[i].card.hp += amount;
                            log(`${context.board[i].card.name.toUpperCase()} HEALS FOR ${amount}.`);
                        }
                    }
                    break;
                case 'dealDamageAllEnemies':
                    const enemyBoard = getOpposingBoard(context) || [];
                    console.log(`Joseph dealing ${amount} damage to all enemies. Enemy board has ${enemyBoard.filter(u => u).length} units.`);
                    for (let i = 0; i < enemyBoard.length; i++) {
                        const target = enemyBoard[i];
                        if (target && target.card) {
                            target.card.hp -= amount;
                            if (target.card.hp <= 0) {
                                log(`${target.card.name.toUpperCase()} TAKES ${amount} DAMAGE AND DIES.`);
                                enemyBoard[i] = null;
                            } else {
                                log(`${target.card.name.toUpperCase()} TAKES ${amount} DAMAGE.`);
                            }
                        }
                    }
                    break;
                case 'hpUpSelf':
                    unit.card.maxHp += amount; // Raise the ceiling
                    unit.card.hp += amount;    // Add the health
                    log(`${card.name.toUpperCase()} GAINS +${amount} MAX HP.`);
                    if (context.side !== undefined && context.slot !== undefined) {
                        animateCard(getSlotCard(context.side, context.slot), 'animate-heal');
                    }
                    break;
                
                case 'discountHandBySeries':
                    let discountedCount = 0;
                    
                    // Loop through every card currently in the player's hand
                    state.hand.forEach(handCard => {
                        // Check if the card matches the target series
                        if (handCard.series === effect.series) {
                            // Reduce the cost, but use Math.max to ensure it never drops below 0
                            handCard.cost = Math.max(0, handCard.cost - amount);
                            discountedCount++;
                        }
                    });
                    
                    
                    if (discountedCount > 0) {
                        log(`${card.name.toUpperCase()} REDUCED THE COST OF ${discountedCount} ${effect.series.toUpperCase()} CARD(S).`);
                        // REMOVED: updateBattleUI(); - dropOnSlot already handles this!
                    }
                    break;
                    
                case 'valuePerSeriesInEnemyBoard':
                    let seriesTotal = 0;
                    
                    // 1. Check the opposing board based on who is acting
                    const targetBoard = getOpposingBoard(context); // This makes it work for both Player and AI
                    
                    // 2. Loop through the units
                    targetBoard.forEach(unit => {
                        // 3. Drill down into unit.card.series
                        if (unit && unit.card && unit.card.series === effect.series) {
                            seriesTotal += amount;
                        }
                    });

                    // 4. Store it in context so the NEXT effect in the array can use it
                    context.scenario = seriesTotal; 
                    log(`SCALING: Found ${seriesTotal / amount} units from ${effect.series}. Value is ${seriesTotal}.`);
                    break;
            }
        }

        function triggerCardEvent(eventName, unit, context = {}) {
            const effects = unit?.card?.abilities?.[eventName];
            if (!effects || !Array.isArray(effects)) return;
            const scenarioValue = evaluateScenario(unit?.card?.abilities?.scenario, unit, context);
            console.log(`Triggering ${eventName} for ${unit.card.name}, scenario: ${scenarioValue}`);
            const triggerContext = { ...context, scenario: scenarioValue };
            for (const effect of effects) {
                applyCardEffect(effect, unit, triggerContext);
            }
        }

        async function loadCards() {
            try {
                const response = await fetch('cards.json');
                if (!response.ok) throw new Error('cards.json not found');
                const data = await response.json();
                ALL_CHARS = data.map(card => ({
                    ...card,
                    abilities: card.abilities || {},
                    image: async () => await getCardImage(card.name)
                }));
                log(`Loaded cards.json (${data.length} cards)`);
            } catch (error) {
                console.warn('cards.json could not be loaded, using built-in card list.', error);
                log('cards.json failed to load; using fallback card data.');
            }
        }

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

        function formatDescription(text) {
            if (!text) return 'No special abilities.';
            
            // 1. Lore/Italic text: £{Text}£
            text = text.replace(/£\{(.+?)\}£/g, '<span class="italic text-white/70" style="font-size: 11px;">$1</span>');

            // 2. Bold text with glow: **Text** (Cleaned up the color-dropping edge case)
            text = text.replace(/\*\*([^\*]+)\*\*/g, '<span class="font-black text-white" style="text-shadow: rgba(255, 255, 255, 0.6) 0px 0px 10px;">$1</span>');

            // 3. Dynamic Font Size: _16px_Text_
            text = text.replace(/_(\d+px)_([^_]+)_/g, '<span style="font-size: $1; font-weight: bold;">$2</span>');

            // 4. Color tags: /color/text/
            text = text.replace(/\/([a-zA-Z]+)\/([^\/]+)\//g, '<span style="color: $1;">$2</span>');

            // 5. Horizontal line: --- or /n---/n
            text = text.replace(/(\/n)?---(\/n)?/g, '<div class="w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent my-1"></div>');

            // 6. Rainbow Text: [rainbow]Text[/rainbow]
            text = text.replace(/\[rainbow\](.*?)\[\/rainbow\]/g, '<span class="font-black animate-pulse" style="background: linear-gradient(to right, rgb(239, 68, 68), rgb(234, 179, 8), rgb(34, 197, 94), rgb(59, 130, 246), rgb(168, 85, 247)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">$1</span>');

            // 7. Shaking/Bouncing Text: {shake}Text{/shake}
            text = text.replace(/\{shake\}(.*?)\{\/shake\}/g, '<span class="font-bold inline-block animate-bounce text-red-400">$1</span>');

            // 8. Stat Icons: #atk#, #hp#, #cost#
            text = text.replace(/#atk#/g, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-red-500 inline-block align-middle mx-0.5"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" x2="19" y1="19" y2="13"></line><line x1="16" x2="20" y1="16" y2="20"></line><line x1="19" x2="21" y1="21" y2="19"></line><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline><line x1="5" x2="9" y1="14" y2="18"></line><line x1="7" x2="4" y1="17" y2="20"></line><line x1="3" x2="5" y1="19" y2="21"></line></svg>`);
            
            text = text.replace(/#hp#/g, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-green-500 inline-block align-middle mx-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`);
            
            text = text.replace(/#cost#/g, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-indigo-400 inline-block align-middle mx-0.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`);

            // 9. Replace newlines with <br>
            text = text.replace(/\/n/g, '<br>');

            return text;
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
                <div class="description-box">${formatDescription(card.description)}</div>
                <div class="stat-badge atk-badge">${card.atk}</div>
                <div class="stat-badge hp-badge">${card.hp}</div>
            `;

            // ... (Keep your existing drag events) ...
                    if(type !== 'preview') {
                        div.ondragstart = (e) => { 
                            state.dragging = { type, index }; 
                            e.dataTransfer.setData('text/plain', '');
                            e.currentTarget.style.opacity = '0.5';
                            // Hide preview while dragging
                            document.getElementById('card-preview-panel').classList.remove('active');
                        };
                        div.ondragend = (e) => {
                            e.currentTarget.style.opacity = '1';
                        }
                    }

                    // NEW: Hover mechanics for the Preview Panel
                    div.addEventListener('mouseenter', () => {
                        const previewPanel = document.getElementById('card-preview-panel');
                        if (previewPanel && !state.dragging) {
                            previewPanel.innerHTML = ''; // Clear old card
                            const clone = div.cloneNode(true); // Copy the exact card HTML
                            
                            // Remove drag events and animations from the clone
                            clone.ondragstart = null;
                            clone.style.animation = 'none'; 
                            
                            previewPanel.appendChild(clone);
                            previewPanel.classList.add('active');
                        }
                    });

                    div.addEventListener('mouseleave', () => {
                        const previewPanel = document.getElementById('card-preview-panel');
                        if (previewPanel) {
                            previewPanel.classList.remove('active');
                        }
                    });

                    return div;
                }
        ;

        function startBattleInternal() {

            state.pHp = 30; state.eHp = 30; state.mana = 1; state.maxMana = 1;

            state.hand = []; state.pBoard = [null, null, null, null]; state.eBoard = [null, null, null, null];

            // --- FORCED MULTIPLE CARDS ---
                // Add as many names as you want (up to 4)
                const startingNames = ["Asuka"];
                
                startingNames.forEach(name => {
                    const found = ALL_CHARS.find(c => c.name === name);
                    if (found && state.hand.length < 4) {
                        state.hand.push({ ...found });
                    }
                });

                // Fill any remaining empty slots (up to 4) with random cards
                while (state.hand.length < 4) {
                    draw();
                }
                // ----------------------------

            updateBattleUI();

            log("Battle Interface Online. Ready.");
        }

        function startBattle() {
            showScreen('arena');
            startBattleInternal();
        }

        function draw() {
            if (state.hand.length < 4) {
                // Correctly picks a random card from the array using a numeric index
                const randomCard = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
                if (randomCard) {
                    state.hand.push({ ...randomCard });
                }
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
                    const cardUnit = {
                        card: cloneCard(c),
                        status: {
                            exhausted: !(c.ability === 'haste' || c.ability === 'haste2'),
                            justPlayed: true,
                            silenced: false
                        }
                    };
                    state.pBoard[idx] = cardUnit;
                    state.hand.splice(state.dragging.index, 1);
                    log(`${c.name.toUpperCase()} DEPLOYED.`);
                    triggerCardEvent('onPlay', cardUnit, { slot: idx, side: 'player', board: state.pBoard });
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

            const guard = state.eBoard.some(u => u && u.card.ability === 'guard');
            if(guard && def.card.ability !== 'guard' && atk.card.ability !== 'snipe') {
                log("GUARD ACTIVE: TARGET BLOCKED.");
                return;
            }

            if(atk.status.silenced) {
                log(`${atk.card.name} is silenced and cannot attack this round.`);
                return;
            }

            const atkEl = getSlotCard('player', pIdx);
            const defEl = getSlotCard('enemy', eIdx);
            const attackerRect = atkEl?.getBoundingClientRect();
            const defenderRect = defEl?.getBoundingClientRect();
            const attackerX = attackerRect?.x ?? 0;
            const attackerY = attackerRect?.y ?? 0;
            const defenderX = defenderRect?.x ?? 0;
            const defenderY = defenderRect?.y ?? 0;
            const slamTargetX = defenderX - attackerX;
            const slamTargetY = defenderY - attackerY;

            atkEl?.style.setProperty('--attacker-x', `${attackerX}px`);
            atkEl?.style.setProperty('--attacker-y', `${attackerY}px`);
            atkEl?.style.setProperty('--defender-x', `${defenderX}px`);
            atkEl?.style.setProperty('--defender-y', `${defenderY}px`);
            atkEl?.style.setProperty('--slam-target-x', `${slamTargetX}px`);
            atkEl?.style.setProperty('--slam-target-y', `${slamTargetY}px`);

            // Physical Slam
            animateCard(atkEl, 'animate-slam-up');
            
            // Impact Flicker (starts 200ms into the slam)
            setTimeout(() => {
                animateCard(atkEl, 'animate-hit-flicker');
                animateCard(defEl, 'animate-hit-flicker');
            }, 200);

            // Update HP and UI after the visual hit
            setTimeout(() => {
                if(atk.card.ability === 'heal') {
                    animateCard(document.getElementById('player-hp'), 'animate-heal');
                }

                const isHaste2 = atk.card.ability === 'haste2';
                const preHp = def.card.hp;
                const attackContext = { target: def, targetIdx: eIdx, defenderHp: preHp, board: state.eBoard };

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

                triggerCardEvent('onAttack', atk, attackContext);

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
            }, 400);
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
                triggerCardEvent('onAttack', atk, { target: 'enemyNexus' });

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
            [
                { side: 'player', board: state.pBoard },
                { side: 'enemy', board: state.eBoard }
            ].forEach(group => {
                group.board.forEach((unit, idx) => {
                    if (unit) {
                        triggerCardEvent('onTurnEnd', unit, { side: group.side, slot: idx, board: group.board });
                    }
                });
            });
            updateBattleUI();
            log("ENEMY CYCLE STARTING...");
            setTimeout(() => {
                const slot = state.eBoard.findIndex(s => s === null);
                if(slot !== -1) {
                    const c = ALL_CHARS[Math.floor(Math.random()*ALL_CHARS.length)];
                    const enemyUnit = { card: cloneCard(c), status: { exhausted: true, justPlayed: true } };
                    state.eBoard[slot] = enemyUnit;
                    triggerCardEvent('onPlay', enemyUnit, { slot, side: 'enemy', board: state.eBoard });
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

        window.onload = async () => {
            await loadCards();
            showScreen('vault');
        };
