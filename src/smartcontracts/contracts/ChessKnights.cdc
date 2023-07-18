import ChessOracleElo from 0xed4dad55d4060467

access(all) contract ChessKnights {

  pub resource interface UserProfilePublicInterface {
    pub var name: String
    pub var ongoinggameuuid: UInt64
  }
  pub resource ChessGame {
    pub var player1: Address
    pub var player2: Address
    pub var elo: @ChessOracleElo.EloVault


    pub fun withDrawEloForCancelGame():@ChessOracleElo.EloVault{
      let elo <- ChessOracleElo.createEloVault()
      elo.deposit(amount:self.elo.amount)
      self.elo.withdraw(amount:elo.amount)
      return <- elo
    }

    pub fun joinGame(address: Address,elo: @ChessOracleElo.EloVault){
      self.player2 = address
      self.elo.deposit(amount: elo.amount)
      destroy elo
    }

    pub fun claimWin(winner: Address):@ChessOracleElo.EloVault{
      //distribute elo to the winner
      let elo <- ChessOracleElo.createEloVault()
      elo.deposit(amount:self.elo.amount)
      self.elo.withdraw(amount:elo.amount)
      return <- elo

    }

    pub fun claimTie(){
      //distribute elo to the both players
      let addr = getAccount(self.player1)
      let ref = addr.getCapability<&AnyResource{ChessOracleElo.ProfilePublicInterface}>(ChessOracleElo.profilePublicPath).borrow() ?? panic("no user profile")
      //distribute elo to the both players
      let addr2 = getAccount(self.player2)
      let ref2 = addr.getCapability<&AnyResource{ChessOracleElo.ProfilePublicInterface}>(ChessOracleElo.profilePublicPath).borrow() ?? panic("no user profile")
      let elo <- ChessOracleElo.createEloVault()
      elo.deposit(amount:self.elo.amount/2)
      ref.depositElo(receivingElo: <-elo)
      let elo2 <- ChessOracleElo.createEloVault()
      elo2.deposit(amount:self.elo.amount/2)
      ref2.depositElo(receivingElo: <-elo2)
    }

    init(player1: Address, elo: @ChessOracleElo.EloVault){
      self.player1 = player1
      self.player2 = 0x09
      self.elo <- elo
    } 

    destroy(){
      destroy self.elo
    }
  }


  pub resource UserProfile: UserProfilePublicInterface {
    pub var name: String
    pub var ongoinggameuuid: UInt64
    
    pub fun updateOnGoingGameUuid(uuid: UInt64){
      self.ongoinggameuuid = uuid
    }
    init(name: String){
      self.name = name
      self.ongoinggameuuid = 0
    }
  }

  pub fun createProfile(name: String):@UserProfile{
    return <- create UserProfile(name: name)
  }

  pub fun cleanMatchMaking(){
    var oldmatchmaking: @{UInt64:ChessGame} <- {}
    oldmatchmaking <-> self.matchMaking
    destroy oldmatchmaking
  }

  pub fun enterMatchMaking(player1: Address, elo: @ChessOracleElo.EloVault):UInt64{
    var uuid: UInt64 = 0
    //if there is an open game, enter it, else wait in the queue matchmaking
    if(self.matchMaking.length>0){
      //get matchmaking keys
      let keys = self.matchMaking.keys
      //get game resource
      let game <-! self.matchMaking.remove(key:keys[0])!
      //join user to the game
      game.joinGame(address: player1, elo: <-elo)
      //return the uuid of the game
      uuid = game.uuid
      //store game to ongoinggame
      self.ongoingGames[game.uuid] <-! game
    }else{
      //create new game
      let newGame <- create ChessGame(player1:player1,elo : <-elo)
      //return the uuid of the game
      uuid = newGame.uuid
      //enter the game to the matchmaking
      self.matchMaking[uuid]<-!newGame
    }
    return uuid
  }

    pub fun cancelWaitingMatchMaking(gameuuid: UInt64):@ChessOracleElo.EloVault{
      //get game resource
      let game <-! self.matchMaking.remove(key:gameuuid)!
      //withdraw the elo resource
      let eloResource <- game.withDrawEloForCancelGame()
      //destroy the game
      destroy game
      //return the elo resource
      return <- eloResource
  }

  pub fun claimWin(winner: Address,gameuuid:UInt64):@ChessOracleElo.EloVault{
    let game <- self.ongoingGames.remove(key:gameuuid) ?? panic("there is no game with this uuid")
    let elo <- game.claimWin(winner:winner)
    //destroy after the game is claimed
    destroy game
    return <- elo
  }

  pub fun claimTie(gameuuid:UInt64){
    let game <- self.ongoingGames.remove(key:gameuuid) ?? panic("there is no game with this uuid")
    game.claimTie()
    //destroy game after tie is called
    destroy game
  }

  access(contract) var matchMaking: @{UInt64:ChessGame}
  access(contract) var ongoingGames :@{UInt64:ChessGame}
  pub let userProfilePublicPath: PublicPath
  pub let userProfileStoragePath: StoragePath

  init(){
    self.matchMaking <- {}
    self.ongoingGames <- {}
    self.userProfilePublicPath = /public/chessKnightsProfile
    self.userProfileStoragePath = /storage/chessKnightsProfile
  }
  
}
