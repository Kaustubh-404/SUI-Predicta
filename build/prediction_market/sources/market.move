// sources/prediction_market.move
module prediction_market::market {
    use sui::object::{UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::string::{Self, String};

    // Error codes
    const EMarketNotActive: u64 = 1;
    const EMarketAlreadyResolved: u64 = 2;
    const EInvalidOutcome: u64 = 3;
    const EMarketNotExpired: u64 = 4;
    const EMarketNotResolved: u64 = 5;
    const EInsufficientFunds: u64 = 6;
    const ENotAuthorized: u64 = 7;
    const EAlreadyClaimed: u64 = 8;

    // Market outcomes
    const OUTCOME_A: u8 = 0;
    const OUTCOME_B: u8 = 1;
    const UNRESOLVED: u8 = 2;

    // Market status
    const ACTIVE: u8 = 0;
    const RESOLVED: u8 = 1;

    // Structs
    public struct MarketCap has key {
        id: UID,
        admin: address,
    }

    public struct Market has key, store {
        id: UID,
        creator: address,
        question: String,
        option_a: String,
        option_b: String,
        expires_at: u64,
        status: u8,
        outcome: u8,
        total_pool: u64,
        option_a_pool: u64,
        option_b_pool: u64,
        balance: Balance<SUI>,
        bets: Table<address, Bet>,
    }

    public struct Bet has store {
        amount: u64,
        option: u8,
        claimed: bool,
    }

    // Events
    public struct MarketCreated has copy, drop {
        market_id: ID,
        creator: address,
        question: String,
        expires_at: u64,
    }

    public struct BetPlaced has copy, drop {
        market_id: ID,
        bettor: address,
        amount: u64,
        option: u8,
    }

    public struct MarketResolved has copy, drop {
        market_id: ID,
        outcome: u8,
        total_pool: u64,
    }

    public struct WinningsClaimed has copy, drop {
        market_id: ID,
        winner: address,
        amount: u64,
    }

    // Initialize the module
    fun init(ctx: &mut TxContext) {
        let cap = MarketCap {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
        };
        transfer::share_object(cap);
    }

    // Create a new prediction market
    public entry fun create_market(
        _cap: &MarketCap,
        question: vector<u8>,
        option_a: vector<u8>,
        option_b: vector<u8>,
        duration_ms: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        let expires_at = current_time + duration_ms;
        
        let market = Market {
            id: object::new(ctx),
            creator: tx_context::sender(ctx),
            question: string::utf8(question),
            option_a: string::utf8(option_a),
            option_b: string::utf8(option_b),
            expires_at,
            status: ACTIVE,
            outcome: UNRESOLVED,
            total_pool: 0,
            option_a_pool: 0,
            option_b_pool: 0,
            balance: balance::zero(),
            bets: table::new(ctx),
        };

        let market_id = object::id(&market);
        
        event::emit(MarketCreated {
            market_id,
            creator: tx_context::sender(ctx),
            question: market.question,
            expires_at,
        });

        transfer::share_object(market);
    }

    // Place a bet on a market
    public entry fun place_bet(
        market: &mut Market,
        option: u8,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate market is active
        assert!(market.status == ACTIVE, EMarketNotActive);
        assert!(clock::timestamp_ms(clock) < market.expires_at, EMarketNotActive);
        assert!(option == OUTCOME_A || option == OUTCOME_B, EInvalidOutcome);

        let amount = coin::value(&payment);
        assert!(amount > 0, EInsufficientFunds);

        let bettor = tx_context::sender(ctx);
        let bet_balance = coin::into_balance(payment);
        
        // Update market pools
        market.total_pool = market.total_pool + amount;
        if (option == OUTCOME_A) {
            market.option_a_pool = market.option_a_pool + amount;
        } else {
            market.option_b_pool = market.option_b_pool + amount;
        };

        // Add to market balance
        balance::join(&mut market.balance, bet_balance);

        // Record the bet
        if (table::contains(&market.bets, bettor)) {
            let existing_bet = table::borrow_mut(&mut market.bets, bettor);
            existing_bet.amount = existing_bet.amount + amount;
        } else {
            let bet = Bet {
                amount,
                option,
                claimed: false,
            };
            table::add(&mut market.bets, bettor, bet);
        };

        event::emit(BetPlaced {
            market_id: object::id(market),
            bettor,
            amount,
            option,
        });
    }

    // Resolve a market (admin only for now)
    public entry fun resolve_market(
        cap: &MarketCap,
        market: &mut Market,
        winning_option: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == cap.admin, ENotAuthorized);
        assert!(market.status == ACTIVE, EMarketAlreadyResolved);
        assert!(clock::timestamp_ms(clock) >= market.expires_at, EMarketNotExpired);
        assert!(winning_option == OUTCOME_A || winning_option == OUTCOME_B, EInvalidOutcome);

        market.status = RESOLVED;
        market.outcome = winning_option;

        event::emit(MarketResolved {
            market_id: object::id(market),
            outcome: winning_option,
            total_pool: market.total_pool,
        });
    }

    // Claim winnings from a resolved market
    public entry fun claim_winnings(
        market: &mut Market,
        ctx: &mut TxContext
    ) {
        assert!(market.status == RESOLVED, EMarketNotResolved);
        
        let claimer = tx_context::sender(ctx);
        assert!(table::contains(&market.bets, claimer), EInsufficientFunds);

        let bet = table::borrow_mut(&mut market.bets, claimer);
        assert!(!bet.claimed, EAlreadyClaimed);
        assert!(bet.option == market.outcome, EInsufficientFunds);

        // Calculate winnings: proportional share of the losing pool + original bet
        let winning_pool = if (market.outcome == OUTCOME_A) {
            market.option_a_pool
        } else {
            market.option_b_pool
        };
        
        let losing_pool = market.total_pool - winning_pool;
        let share_of_winnings = (bet.amount * losing_pool) / winning_pool;
        let total_payout = bet.amount + share_of_winnings;

        // Mark as claimed
        bet.claimed = true;

        // Transfer winnings
        let payout_balance = balance::split(&mut market.balance, total_payout);
        let payout_coin = coin::from_balance(payout_balance, ctx);
        transfer::public_transfer(payout_coin, claimer);

        event::emit(WinningsClaimed {
            market_id: object::id(market),
            winner: claimer,
            amount: total_payout,
        });
    }

    // View functions
    public fun get_market_info(market: &Market): (String, String, String, u64, u8, u8, u64, u64, u64) {
        (
            market.question,
            market.option_a,
            market.option_b,
            market.expires_at,
            market.status,
            market.outcome,
            market.total_pool,
            market.option_a_pool,
            market.option_b_pool
        )
    }

    public fun get_user_bet(market: &Market, user: address): (u64, u8, bool) {
        if (table::contains(&market.bets, user)) {
            let bet = table::borrow(&market.bets, user);
            (bet.amount, bet.option, bet.claimed)
        } else {
            (0, UNRESOLVED, false)
        }
    }

    // Get market odds (percentage for option A)
    public fun get_market_odds(market: &Market): u64 {
        if (market.total_pool == 0) {
            50 // 50/50 if no bets
        } else {
            (market.option_a_pool * 100) / market.total_pool
        }
    }
}