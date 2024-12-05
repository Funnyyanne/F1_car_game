module f1_car_game::f1_car_game {
    use std::string::{Self, String};
    use sui::coin::{Coin, into_balance, from_balance};
        use sui::coin;
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext,sender};
    use sui::transfer::{share_object, transfer, public_transfer};

    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::random;

    const BASE_RETURN_RATE: u64 = 20; // 基础返还率 20%
    const TOP_RETURN_RATE: u64 = 50;  // 顶配返还率 50%
    
    // error code
    const E_INSUFFICIENT_FUNDS: u64 = 1;
    const E_NO_GUESSES_LEFT: u64 = 3;
    const E_INVALID_VALUE_RANGE: u64 = 4;
    // 赛车和配件性能等级
    const PREMIUM: u8 = 2;
    const ULTIMATE: u8 = 3;

    // 游戏状态对象（庄家）
   public struct GameState has key {
        id: UID,
        treasury: Balance<SUI>,
        total_pool: u64,
        maintenance_fund: u64
    }
    // 赛车结构
    public struct Car has key, store {
        id: UID,
        engine_level: u8,
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
    // public  struct Player has key {
    //     id: UID,
    //     guesses_remaining: u8,
    //     owned_driver: Option<Driver>,
    //     owned_car: Option<Car>,
    //     total_investment: u64
    // }

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
        transfer(adminCap,sender(ctx));   

        let pool = GamePool {
            id: object::new(ctx),
            balance: balance::zero(),
            total_pool: 0,
            maintenance_fund: 0
        };
       transfer(pool, ctx.sender());

       let car_library = CarLibrary { 
        id: object::new(ctx),
        available_cars: vector::empty() // 初始化为空
        };
        share_object(car_library);

    let driver_library = DriverLibrary {
        id: object::new(ctx),
        available_drivers: vector::empty()
    };
        share_object(driver_library);

        let game_state = GameState {
            id: object::new(ctx),
            treasury: balance::zero(),
            total_pool: 0,
            maintenance_fund: 0
        };
        share_object(game_state);

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
        game_state.total_pool = amount;
        
        let payment_balance = coin::split(payment, amount, ctx);
        
        balance::join(&mut game_state.treasury, coin::into_balance(payment_balance));
    }

    // 庄家获取余额
    public fun get_treasury_balance(_adminCap: &F1CarGameAdminCap, game_state: &mut GameState, amount: u64, ctx: &mut TxContext): u64 {
        let out_balance = balance::split(&mut game_state.treasury, 1);
        let out_coin = coin::from_balance(out_balance, ctx);
        transfer::public_transfer(out_coin, tx_context::sender(ctx));
    }


    // 猜测车手价格 front 实现
    public entry fun guess_driver_price(
        driver: &Driver,
        guessed_price: u64,
        ctx: &mut TxContext
    ) {
        // assert!(player.guesses_remaining > 0, E_NO_GUESSES_LEFT);
        
        // let price_diff = if (guessed_price > driver.price) {
        //     guessed_price - driver.price
            
        // } else {
        //     driver.price - guessed_price
        // };

        // if (guessed_price == driver.price) {
        //     // 完全猜中价格
        //     player.guesses_remaining = 0;
        // } else if (price_diff <= 100) { // 允许100以内的误差
        //     // 接近正确价格
        //     player.guesses_remaining = 0;
        // } else {
        //     player.guesses_remaining = player.guesses_remaining - 1;
        // };
    } 
    // 计算比赛结果和奖励
   public   fun calculate_race_result(
        car: &Car,
        driver: &Driver,
        game_state: &mut GameState,
        ctx: &mut TxContext
    ): u8 {
        let total_value = (car.engine_level) as u64 
            + (driver.skill_level as u64);
            let position = if (total_value == 10) { 
            let out_balance = balance::split(&mut game_state.treasury,game_state.total_pool );
            let out_coin = from_balance(out_balance,ctx);
            public_transfer(out_coin, sender(ctx));
             0
                 }
        else if (total_value >= 8) { 
              let out_balance = balance::split(&mut game_state.treasury,game_state.total_pool * 50 / 100 );
            let out_coin = from_balance(out_balance,ctx);
            public_transfer(out_coin, sender(ctx));
            1
             }
        else { 
            2
        };
        
         position
        

    }

   

    // // 发放奖励
    // public entry fun distribute_reward(
    //     game_state: &mut GameState,
    //     player_addr: address,
    //     reward_amount: u64,
    //     ctx: &mut TxContext
    // ) {
    //     let reward_coin = coin::from_balance(
    //         balance::split(&mut game_state.treasury, reward_amount),
    //         ctx
    //     );
    //     transfer::public_transfer(reward_coin, player_addr);
        
    //     event::emit(RaceResult {
    //         player: player_addr,
    //         position: 1,
    //         reward: reward_amount
    //     });
    // }

    public entry fun create_new_car(
    car_library: &mut CarLibrary,
    engine: u8,
    price: u64,
    url: String,
    ctx: &mut TxContext
) {    
        assert!(engine >= 1 && engine <= 5, E_INVALID_VALUE_RANGE);

    let new_car = Car {
        id: object::new(ctx),
        engine_level: engine,
        price,
        url
    };
    
    vector::push_back(&mut car_library.available_cars, new_car);
}

// 添加获取可用赛车的函数
public fun get_available_cars(car_library: &CarLibrary): &vector<Car> {
    &car_library.available_cars; // 返回可用赛车的引用
    // 随机获取里面的赛车
    let random_index = random::rand_u64() % vector::length(&car_library.available_cars);
    vector::borrow(&car_library.available_cars, random_index)
}

//  
 public entry fun update_car(car:&mut Car, url:String) {
        car.url = url;
    }
 public entry fun update_driver(driver:&mut Driver, url:String) {
        driver.url = url;
    }

// get driver
public fun read_driver_name(driver:&Driver):String {
    driver.name
}

public fun read_driver_price(driver:&Driver):u64 {
    driver.price
}

public fun read_driver_skill(driver:&Driver):u8 {
    driver.skill_level
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

public fun read_car_level(car:&Car):u8 {
    car.engine_level
}

}