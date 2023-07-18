access(all) contract ChessOracleElo {
    //leaderBoard profile struct is used for store the data of top leaderboard users
    pub struct UserData {
        pub let userAddress: Address
        pub let elo: UInt64
        pub var wins: UInt64
        pub var loses: UInt64
        pub var tie: UInt64

        init(userAddress: Address, elo: UInt64,wins: UInt64,loses:UInt64,tie:UInt64){
            self.userAddress = userAddress
            self.elo = elo
            self.wins = wins
            self.loses = loses
            self.tie = tie
        }
    }

    pub resource EloVault {
        pub var amount: UInt64

        pub fun deposit(amount: UInt64){
            self.amount = self.amount + amount
        }

        pub fun withdraw(amount: UInt64){
            self.amount = self.amount - amount
        }

        init(amount: UInt64){
            self.amount = amount
        }
    }

    pub fun createEloVault():@EloVault{
        return <- create EloVault(amount:0)
    }

    pub resource interface ProfilePublicInterface {
        pub var profileAddress: Address
        pub fun depositElo(receivingElo:@EloVault)
        pub fun getEloAmount(): UInt64
        pub fun getProfileData(): UserData
    }

    pub resource Profile: ProfilePublicInterface {
        // trakcs the user Elo
        access(self) var elo: UInt64
        // every operation with elo takes elo from the profile, 
        // so for have a track of the user elo while some elo its outside this profile resource 
        // we implemented this var that tracks it, so we can still know the elo of each user while some elo is outside
        access(self) var withDrawedElo: UInt64
        //address of the owner of this resource
        pub var profileAddress: Address
        //stadistics
        pub var wins: UInt64
        pub var loses: UInt64
        pub var tie: UInt64

        
        pub fun depositElo(receivingElo:@EloVault){
            // add the elo
            self.elo = self.elo + receivingElo.amount

            
            self.withDrawedElo = self.withDrawedElo - 100

            destroy receivingElo
        }

        // withdrawEloForaMatch
        // this function is used for withdrawElo of the profile for a match, 
        // here gets withdrawed 100 elo for a game, after the match an algorithm will calculate
        // how much elo you lose, and the restant get returned through the depositElo function
        pub fun withdrawEloForaMatch():@EloVault{
            // track the elo that is outside the contract
            self.withDrawedElo = self.withDrawedElo + 100

            //create the sending elo resource
            let sendingElo <- create EloVault(amount: 100)

            //update the elo in the profile
            self.elo = self.elo - 100


            return <- sendingElo
        }

        pub fun getEloAmount(): UInt64{
            return self.elo + self.withDrawedElo
        }

        pub fun getProfileData(): UserData{
            return UserData(userAddress: self.profileAddress, elo: self.elo + self.withDrawedElo,wins: self.wins,loses:self.loses,tie:self.tie)
        }

        // at chess, the elo new players starts with 1200
        init(address: Address){
            self.elo = 1200
            self.withDrawedElo = 0
            self.profileAddress = address
            self.wins = 0
            self.loses = 0
            self.tie = 0
        }

    }

    pub fun getLeaderBoard():[UserData]{
        return self.leaderBoard
    }

    pub fun updateLeaderBoard(address: Address){
        //get capability of for the user profile
        let addr = getAccount(address)
        let ref = addr.getCapability<&AnyResource{ChessOracleElo.ProfilePublicInterface}>(self.profilePublicPath).borrow() ?? panic("no user profile")
        //get profile data
        let userData = ref.getProfileData()
        //get the elo of the account
        let elo = userData.elo
        //update leaderboard
        var newLeaderBoard:[UserData] = []
        var appended:Bool = false
        for index,element in self.leaderBoard {
            //dont append if is the same address
            if(element.userAddress == address || index == 10){
                //Dont append it
            }else{
                //stop appending when there are 10 users at leaderboard
                if(index<10){
                    //if element elo is higher than the elo trying to add to leaderboard append, else append the new elo and the current element
                    if(element.elo > elo){
                        newLeaderBoard.append(element)
                    }else{
                        if(appended==false){
                            newLeaderBoard.append(UserData(userAddress:address,elo:elo,wins:userData.wins,loses:userData.loses,tie:userData.tie))
                            appended = true
                        }
                        newLeaderBoard.append(element)
                    }
                }
            }
        }
        //update the leaderboard
        self.leaderBoard = newLeaderBoard
        
    }

    pub fun createNewProfile(userAddress:Address):@Profile{
        return <- create Profile(address:userAddress)
    }

    pub let profilePublicPath: PublicPath
    pub let profileStoragePath: StoragePath
    //leader board of the top 10 players
    pub var leaderBoard: [UserData]
    init(){
        self.profilePublicPath = /public/chessElo
        self.profileStoragePath = /storage/chessElo
        self.leaderBoard = []
    }
}