let secureBlackjackPending = false;
async function secureBlackjackAction(action) {
    if (secureBlackjackPending) return;
    const seatIndex = bjTableState.localSeat;
    const seat = seatIndex >= 0 ? bjTableState.seats[seatIndex] : null;
    const world = typeof gameSpecificData !== 'undefined' ? gameSpecificData : null;
    secureBlackjackPending = true;
    try {
        const data = await accountCommand('blackjack', { action, bet: seat ? seat.bet : bjState.bet });
        if (world && (gameSpecificData !== world || activeGameMode !== 'casino')) return;
        if (data.phase === 'betting') return;
        const hidden = data.phase === 'playing';
        const dealer = data.dealer.map((card) => card || { val: '?', suit: '', color: 'black' });
        bjState.playerHand = data.hand;
        bjState.dealerHand = dealer;
        bjState.bet = data.bet;
        bjState.phase = data.phase;
        renderHandCards('bj-player-cards', data.hand);
        renderHandCards('bj-dealer-cards', dealer, hidden);
        const score = calculateHandScore(data.hand);
        const dealerScore = calculateHandScore(dealer, hidden);
        const playerLabel = document.getElementById('bj-player-score');
        const dealerLabel = document.getElementById('bj-dealer-score');
        if (playerLabel) playerLabel.textContent = `Součet: ${score.total}`;
        if (dealerLabel) dealerLabel.textContent = `Součet: ${dealerScore.total}`;
        if (seat && bjTableState.localSeat === seatIndex && activeGameMode === 'casino') {
            const remove = (mesh) => {
                if (mesh.parent) mesh.parent.remove(mesh);
                disposeObject3D(mesh);
            };
            seat.cardMeshes.forEach(remove);
            bjTableState.dealerCardMeshes.forEach(remove);
            seat.cardMeshes = [];
            bjTableState.dealerCardMeshes = [];
            seat.hands = (data.hands || [{ cards: data.hand, bet: data.bet }]).map((hand) => ({
                ...hand,
                score: calculateHandScore(hand.cards).total
            }));
            seat.activeHandIdx = data.activeHand || 0;
            seat.confirmedBet = hidden;
            bjTableState.phase = hidden ? 'players' : 'betting';
            bjTableState.phaseTimer = 10;
            bjTableState.turnTimer = 0; // Server hands survive reconnect; no local timeout settlement.
            bjTableState.currentSeatTurn = seatIndex;
            bjTableState.dealerHand = dealer;
            seat.hands.forEach((hand, handIndex) =>
                hand.cards.forEach((card, i) => {
                    const mesh = create3DCardMesh(card, false);
                    mesh.position.set(
                        seat.cardPos.x + i * 0.32,
                        2.41 + i * 0.005,
                        seat.cardPos.z + handIndex * 0.75
                    );
                    mesh.rotation.y = seat.rotY;
                    scene.add(mesh);
                    seat.cardMeshes.push(mesh);
                })
            );
            dealer.forEach((card, i) => {
                const mesh = create3DCardMesh(card, hidden && i === 0);
                mesh.position.set(-18 + i * 0.45 - 0.22, 2.41, -7);
                scene.add(mesh);
                bjTableState.dealerCardMeshes.push(mesh);
            });
            updateSeatScoreBadge(seat, score);
            updateDealerScoreBadge(dealerScore, hidden);
            updateInWorldBjUI();
        }
        if (!hidden) showGtaNotification('Výsledek', `Výplata: ${data.payout} B$.`, '🃏');
        updateCasinoBobuxDisplay();
    } catch (error) {
        reportAccountError(error);
    } finally {
        secureBlackjackPending = false;
    }
}
