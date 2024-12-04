module f1_car_game::f1_car_game {
    use std::string::{Self, String};
    use sui::coin::{Self, Coin};
    use sui::object::{Self, UID};
    use sui::sui::SUI;
    use sui::transfer::{transfer};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::event;

    const BASE_RETURN_RATE: u64 = 20; // 基础返还率 20%
    const TOP_RETURN_RATE: u64 = 50;  // 顶配返还率 50%
    
    // error code
    const E_INSUFFICIENT_FUNDS: u64 = 1;
    const E_INVALID_GUESS: u64 = 2;
    const E_NO_GUESSES_LEFT: u64 = 3;

    // 赛车和配件性能等级
    const NORMAL: u8 = 1;
    const PREMIUM: u8 = 2;
    const ULTIMATE: u8 = 3;

    // 游戏状态对象
   public struct GameState has key {
        id: UID,
        treasury: Balance<SUI>,
       
    }
    // 赛车结构
    public struct Car has key, store {
        id: UID,
        engine_level: u8,
        body_level: u8,
        aero_level: u8,
        price: u64,
        url:String
    }

    // 车手结构
   public struct Driver has key, store {
        id: UID,
        name: String,
        team: String,
        skill_level: u8,
        price: u64,
        available: bool,
        url:String
    }


       public  struct GamePool has key, store {
        id: UID,
        balance: Balance<SUI>,
        total_pool: u64,
        maintenance_fund: u64,
    }

    // 玩家状态
    public  struct Player has key {
        id: UID,
        guesses_remaining: u8,
        owned_driver: Option<Driver>,
        owned_car: Option<Car>,
        total_investment: u64
    }

    // 比赛结果事件
  public  struct RaceResult has copy, drop {
        player: address,
        position: u8,
        reward: u64
    }

  public struct CarLibrary has key, store {
        id: UID,
        available_cars: vector<Car>
    }

    //admin
    public struct F1CarGameAdminCap has key {
        id: UID
    }

      
    // 初始化函数
     fun init(ctx: &mut TxContext) {   

        let adminCap = F1CarGameAdminCap{id:object::new(ctx)};
        transfer(adminCap,ctx.sender());   

        let pool = GamePool {
            id: object::new(ctx),
            balance: balance::zero(),
            total_pool: 0,
            maintenance_fund: 0
        };
        transfer::transfer(pool, ctx.sender());

       let car_library = CarLibrary { 
        id: object::new(ctx),
        available_cars: vector::empty() // 初始化为空
    };
    transfer::share_object(car_library);

    let driver_library = DriverLibrary {
        id: object::new(ctx),
        available_drivers: vector::empty()
    };
    transfer::share_object(driver_library);

        let game_state = GameState {
            id: object::new(ctx),
            treasury: balance::zero(),
            admin: tx_context::sender(ctx)
        };
        transfer::share_object(game_state);



    }

    // 添加新的公共函数用于创建车手
  public entry fun create_new_driver(
    driver_library: &mut DriverLibrary,
    game_state: &GameState,
    name: String,
    team: String,
    skill: u8,
    price: u64,
    url: String,
    ctx: &mut TxContext
) {
    
    let new_driver = Driver {
        id: object::new(ctx),
        name,
        team,
        skill_level: skill,
        price,
        available: true,
        url
    };
    
    vector::push_back(&mut driver_library.available_drivers, new_driver);
}

// 添加获取可用车手的函数
public fun get_available_drivers(driver_library: &DriverLibrary): &vector<Driver> {
    &driver_library.available_drivers
}

public struct DriverLibrary has key, store {
    id: UID,
    available_drivers: vector<Driver>
}

    // 购买游戏币
    public entry fun buy_game_tokens(
        game_state: &mut GameState,
        payment: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Check that payment has sufficient balance
        assert!(coin::value(payment) >= amount, E_INSUFFICIENT_FUNDS); // Error if insufficient funds
        
        let payment_balance = coin::split(payment, amount, ctx);
        balance::join(&mut game_state.treasury, coin::into_balance(payment_balance));
    }

    // 获取庄家余额
    public fun get_treasury_balance(_adminCap:&F1CarGameAdminCap,game_state:&GameState,amount:u64,_:&mut TxContext):u64 {
        balance::value(&game_state.treasury)

    }

    // 猜测车手价格
    public entry fun guess_driver_price(
        player: &mut Player,
        driver: &Driver,
        guessed_price: u64,
        ctx: &mut TxContext
    ) {
        assert!(player.guesses_remaining > 0, E_NO_GUESSES_LEFT);
        
        let price_diff = if (guessed_price > driver.price) {
            guessed_price - driver.price
        } else {
            driver.price - guessed_price
        };

        if (guessed_price == driver.price) {
            // 完全猜中价格
            player.guesses_remaining = 0;
        } else if (price_diff <= 100) { // 允许100以内的误差
            // 接近正确价格
            player.guesses_remaining = 0;
        } else {
            player.guesses_remaining = player.guesses_remaining - 1;
        };
    }

    // 计算比赛结果和奖励
   public entry  fun calculate_race_result(
        player: &Player,
        car: &Car,
        driver: &Driver
    ): (u8, u64) {
        let total_performance = (car.engine_level + car.body_level + car.aero_level) as u64 
            + (driver.skill_level as u64);
            
        let position = if (is_ultimate_setup(car)) { 1 }
            else if (is_premium_setup(car)) { 2 }
            else { 3 };
            
        let reward = calculate_reward(player.total_investment, position);
        (position, reward)
    }

    // 计算奖励金额
    fun calculate_reward(investment: u64, position: u8): u64 {
        if (position <= 2) {
            (investment * TOP_RETURN_RATE) / 100
        } else if (position <= 3) {
            (investment * BASE_RETURN_RATE) / 100
        } else {
            0
        }
    }

    // 判断是否是顶配设置
    fun is_ultimate_setup(car: &Car): bool {
        car.engine_level == ULTIMATE && 
        car.body_level == ULTIMATE && 
        car.aero_level == ULTIMATE
    }

    // 判断是否是高级设置
    fun is_premium_setup(car: &Car): bool {
        car.engine_level >= PREMIUM && 
        car.body_level >= PREMIUM && 
        car.aero_level >= PREMIUM
    }

    // 发放奖励
    public entry fun distribute_reward(
        game_state: &mut GameState,
        player_addr: address,
        reward_amount: u64,
        ctx: &mut TxContext
    ) {
        let reward_coin = coin::from_balance(
            balance::split(&mut game_state.treasury, reward_amount),
            ctx
        );
        transfer::public_transfer(reward_coin, player_addr);
        
        event::emit(RaceResult {
            player: player_addr,
            position: 1,
            reward: reward_amount
        });
    }

    public entry fun create_new_car(
    car_library: &mut CarLibrary,
    engine: u8,
    body: u8,
    aero: u8,
    price: u64,
    url: String,
    ctx: &mut TxContext
) {    
    let new_car = Car {
        id: object::new(ctx),
        engine_level: engine,
        body_level: body,
        aero_level: aero,
        price,
        url
    };
    
    vector::push_back(&mut car_library.available_cars, new_car);
}

// 添加获取可用赛车的函数
public fun get_available_cars(car_library: &CarLibrary): &vector<Car> {
    &car_library.available_cars
}

//  
 public entry fun update_car(car:&mut Car, url:String ctx:&mut TxContext) {
        car.url = url;
    }
 public entry fun update_driver(driver:&mut Driver, url:String, ctx:&mut TxContext) {
        driver.url = url;
    }

// get driver
public fun read_driver_name(driver:&Driver):String {
    driver.name
}

   public fun read_driver_team(driver:&Driver):String {
    driver.team
}

 public fun read_driver_url(driver:&Driver):String {
    driver.url
}

// get car
public fun read_car_url(car:&Car):String {
    car.url
}

public fun read_car_price(car:&Car):u64 {
    car.price
}


}