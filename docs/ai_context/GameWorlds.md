# Game worlds and server economy (v9.4)

GameWorlds.js owns world construction and guest/local simulation for the twelve modes. Persistent account data belongs to PortalStore and the backend. CasinoCommands.js is the authenticated blackjack controller; server/Blackjack.js and Supabase account_command decide actual cards and payouts.

## Authenticated operations
- buyShopItem uses purchase(itemId); client price/ownership is never authoritative.
- spinSlots obtains server reels/payout before animating; spinDailyWheel obtains server prize/free-spin state; startDerbyRace obtains the server winner before visual racing. Visual random effects cannot credit money. The server locks the wallet and records command receipts and ledger entries.
- Blackjack deal/hit/stand/double/split/resume are server commands. Hidden dealer cards and deck remain private until settlement. Split hands are rendered separately; no local payout callback may grant an authenticated balance.
- completeAdoptMeNeed and hatchAdoptMeEgg use bounded server actions. Trees/trade have server cooldowns, eggs have server costs, weighted pools and collection limits. Client saves are cache only.
- Other game rewards use a capped participation model: 20 B$ at least 30 seconds apart, max 600 per session, excluding casino. Client victories cannot prove honest physics; do not claim full competitive anti-cheat.

## Lifecycle and seams
Main seams: setupGameX/updateGameX, spinSlots, spinDailyWheel, startDerbyRace, secureBlackjackAction, completeAdoptMeNeed, hatchAdoptMeEgg. Cleanup disables autospin and releases scene assets via Engine. Async blackjack rendering checks that the same world/seat still exists after the response.
Keep all API requests behind apiRequest/accountCommand. Never save authenticated coins, VIP, pets, progress or owned items via generic sync. Existing guest gameplay tests remain; server rules and persistence are covered by account command integration tests and supabase-account-security.sql.

Game timers are registered through Lifetime.js and cancelled on world cleanup. Slot bets and derby settlements are captured for the round; later control changes cannot alter displayed payouts.

## Shared blackjack and radio (v9.9)
All players, including guests, use the shared room controller in CasinoCommands.js. Server snapshots drive all seats, deal order and timers. Never gate blackjack dispatch or frame updates on isServerAccount. Guest capabilities are issued by the backend and stored through STORAGE_KEYS.BLACKJACK_GUEST. Signed-in wallet refreshes use /api/auth/me; guest snapshots supply their own persistent casino balance.
