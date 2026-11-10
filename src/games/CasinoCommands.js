// Each seated view follows one authoritative table until the player leaves or changes rooms.
let blackjackSession = null;
let blackjackGuestToken = null;
try { blackjackGuestToken = sessionStorage.getItem(STORAGE_KEYS.BLACKJACK_GUEST); } catch (e) {}
const blackjackIdentity = () => accountIdentity() || 'guest';
const blackjackRoom = () => mpState.roomCode && !mpState.roomCode.startsWith('PUB_') ? mpState.roomCode : 'PUB_CASINO';

function clearTableMeshes(meshes) {
    for (const mesh of meshes) {
        mesh.parent?.remove(mesh);
        disposeObject3D(mesh);
    }
    meshes.length = 0;
}

function renderTableSnapshot(session, data) {
    const previous = session.snapshot;
    const mine = data.seats.findIndex(p => p?.mine);
    let local = bjTableState.localSeat;
    if (mine >= 0) local = mine;
    else if (data.seats[local]) {
        const free = data.seats.indexOf(null);
        if (free >= 0) local = free;
    }
    if (bjTableState.localSeat !== local) {
        bjTableState.localSeat = local;
        playerState.pos.copy(bjTableState.seats[local].pos);
    }
    bjTableState.phase = data.phase;
    bjTableState.currentSeatTurn = data.turn;
    data.seats.forEach((p, i) => {
        const seat = bjTableState.seats[i], old = previous?.seats[i];
        seat.occupied = !!p || i === local;
        seat.username = p?.name || (i === local ? authState.user?.username || data.guestName || getGuestNickname() : '');
        seat.confirmedBet = !!p;
        const bet = p ? p.hands.reduce((sum,h) => sum + h.bet,0) :
            i === local && !old && previous?.round === data.round ? session.draft : 0;
        if (seat.bet !== bet || !previous) {
            seat.bet = bet;
            clearTableMeshes(seat.chipMeshes);
            updateSeat3DChipStack(seat);
        }
        if (previous && JSON.stringify(old) === JSON.stringify(p)) return;
        clearTableMeshes(seat.cardMeshes);
        if (seat.scoreSprite) { clearTableMeshes([seat.scoreSprite]); seat.scoreSprite = null; }
        seat.hands = p?.hands || [];
        const active = seat.hands.findIndex(h => !h.done && calculateHandScore(h.cards).total < 21);
        seat.activeHandIdx = active >= 0 ? active : Math.max(0,seat.hands.length-1);
        seat.hands.forEach((h,j) => h.cards.forEach((card,k) => {
            const mesh = create3DCardMesh(card,false);
            mesh.position.set(seat.cardPos.x + k*0.32,2.41 + k*0.005,seat.cardPos.z + j*0.75);
            mesh.rotation.y = seat.rotY; scene.add(mesh); seat.cardMeshes.push(mesh);
        }));
        const hand = seat.hands[seat.activeHandIdx];
        if (hand?.cards.length) updateSeatScoreBadge(seat,calculateHandScore(hand.cards));
    });
    const hidden = data.dealer.includes(null);
    if (!previous || JSON.stringify(previous.dealer) !== JSON.stringify(data.dealer)) {
        clearTableMeshes(bjTableState.dealerCardMeshes);
        if (bjTableState.dealerScoreSprite) {
            clearTableMeshes([bjTableState.dealerScoreSprite]); bjTableState.dealerScoreSprite = null;
        }
        bjTableState.dealerHand = data.dealer.map(card => card || {val:'?',suit:'',color:'black'});
        bjTableState.dealerHand.forEach((card,i) => {
            const mesh = create3DCardMesh(card,hidden && !i);
            mesh.position.set(-18 + i*0.45 - 0.22,2.41,-7);
            scene.add(mesh); bjTableState.dealerCardMeshes.push(mesh);
        });
        if (data.dealer.length) updateDealerScoreBadge(calculateHandScore(bjTableState.dealerHand,hidden),hidden);
    }
    const seat = bjTableState.seats[local];
    document.getElementById('bj-seated-seat-num').textContent = seat.label;
    document.getElementById('bj-inworld-current-bet').textContent = seat.bet + ' B$';
    document.getElementById('bj-inworld-player-badge').classList.toggle('hidden',mine < 0 || !seat.hands[0]?.cards.length);
    document.getElementById('bj-inworld-dealer-badge').classList.toggle('hidden',!data.dealer.length);
    if (mine >= 0 && data.phase === 'cooldown' && previous?.phase !== 'cooldown')
        showGtaNotification('Výsledek', 'Výplata: ' + data.seats[mine].payout + ' B$.','🃏');
    session.snapshot = data;
    session.deadline = Date.now() + Math.max(0,data.deadline - data.now);
    updateSharedTableHUD(session);
}

function updateSharedTableHUD(session) {
    const d = session?.snapshot, mine = d?.seats.find(p => p?.mine);
    const seconds = Math.max(0,Math.ceil(((session?.deadline || 0)-Date.now())/1000));
    const myTurn = d?.phase === 'players' && d.seats[d.turn]?.mine;
    const betting = d?.phase === 'betting' && !mine && d.seats.includes(null);
    const key = [d?.round,d?.phase,d?.turn,mine?.sequence,d?.balance,betting,myTurn,seconds,session?.failure].join('|');
    if (session && key === session.hudKey) return;
    if (session) session.hudKey = key;
    document.getElementById('bj-betting-controls').classList.toggle('hidden',!betting);
    document.getElementById('bj-action-controls').classList.toggle('hidden',!myTurn);
    const title = !d ? 'Připojování ke stolu…' : ({
        betting: mine ? 'Sázka přijata' : 'Příjem sázek', dealing:'Krupiér rozdává',
        players: myTurn ? 'Tvůj tah' : 'Na tahu: '+d.seats[d.turn]?.name,
        dealer:'Tah krupiéra', cooldown:'Výsledky kola'
    })[d.phase];
    document.getElementById('bj-table-phase-title').textContent = title;
    document.getElementById('bj-table-phase-timer').textContent = session?.failure || (d?.deadline ? seconds+' s' : 'První sázka spustí odpočet');
    if (myTurn) {
        const hand = mine.hands[bjTableState.seats[bjTableState.localSeat].activeHandIdx];
        const canDouble = hand.cards.length === 2 && d.balance >= hand.bet;
        document.getElementById('bj-action-double').disabled = !canDouble;
        document.getElementById('bj-action-split').disabled = !canDouble || mine.hands.length >= 4 || hand.cards[0].val !== hand.cards[1]?.val;
    }
}

async function requestTable(session, input) {
    session.busy = true;
    try {
        const guest = !isServerAccount();
        const response = await apiRequest('/api/blackjack/table',{method:'POST',body:{...input,room:session.room,
            ...(guest ? {guest:true,guestToken:blackjackGuestToken,guestName:getGuestNickname()} : {})}});
        if (blackjackSession !== session || session.world !== gameSpecificData || session.identity !== blackjackIdentity() || bjTableState.localSeat < 0 || session.room !== blackjackRoom()) return;
        if (!response.ok) throw Error(response.data?.error || 'Spojení se stolem přerušeno.');
        const data = response.data;
        if (guest && data.guestToken) {
            blackjackGuestToken = data.guestToken;
            try { sessionStorage.setItem(STORAGE_KEYS.BLACKJACK_GUEST,blackjackGuestToken); } catch (e) {}
        }
        session.failure = '';
        session.draft = bjTableState.seats[bjTableState.localSeat].bet || 0;
        renderTableSnapshot(session,data);
        if (data.error) reportAccountError(Error(data.error));
        if (guest) {
            bobuxBalance = data.balance;
            try { localStorage.setItem(STORAGE_KEYS.BOBUX,String(bobuxBalance)); } catch (e) {}
            updateCasinoBobuxDisplay();
        } else if (data.balance !== bobuxBalance) {
            const me = await apiRequest('/api/auth/me');
            if (me.ok && session.identity === blackjackIdentity()) {
                applyAuthenticatedUser(me.data.user);
                updateCasinoBobuxDisplay();
            }
        }
    } catch (e) {
        session.failure = 'Obnovuji spojení se stolem…';
        if (input.action !== 'sync') reportAccountError(e);
    } finally {
        session.busy = false;
        session.next = Date.now() + (session.failure ? 3000 : session.snapshot?.phase === 'dealing' ? 350 : 1000);
        if (session.queued && session === blackjackSession && session.world === gameSpecificData && bjTableState.localSeat >= 0 && session.identity === blackjackIdentity() && session.room === blackjackRoom()) {
            const queued = session.queued; session.queued = null;
            requestTable(session,queued);
        }
    }
}

function updateSharedBlackjack() {
    if (bjTableState.localSeat < 0 || activeGameMode !== 'casino') return;
    const identity = blackjackIdentity(), room = blackjackRoom();
    if (!blackjackSession || blackjackSession.world !== gameSpecificData || blackjackSession.identity !== identity || blackjackSession.room !== room)
        blackjackSession = {world:gameSpecificData, identity, room, next:0};
    const session = blackjackSession;
    if (!session.busy && Date.now() >= session.next) requestTable(session,{action:'sync'});
    updateSharedTableHUD(session);
}

function secureBlackjackAction(action) {
    if (action === 'resume') { blackjackSession = null; return updateSharedBlackjack(); }
    const session = blackjackSession, d = session?.snapshot;
    if (!d || activeGameMode !== 'casino' || bjTableState.localSeat < 0) return;
    const seat = bjTableState.localSeat;
    const input = {action, round:d.round, seat, bet:bjTableState.seats[seat].bet, sequence:d.seats.find(p => p?.mine)?.sequence};
    if (session.busy) { session.queued ||= input; return; }
    return requestTable(session,input);
}
